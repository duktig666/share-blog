---
title: 前端请求如何向后端传递List类型的数据
date: 2020-05-19
author: RenShiWei
categories:
 - java
tags:
 - java
---

## 前端请求如何向后端传递List类型的数据

### 问题描述

在最近的项目开发中，遇到了一个前端向后端发送List类型数据的请求，各种尝试结果总是失败，特此总结下来。

### 后端接口

根据博客类型id集合删除博客集合
```java
@DeleteMapping("/ids")
public ResponseEntity<Void> deleteBlogTypes (@RequestBody List<Long> blogTypeIds ){
    blogTypeService.deleteBlogTypes(blogTypeIds);
    return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
}
```

因为js并没有List数据类型，所以怎样发送请求是一个很头疼的问题

### 解法1（验证成功，推荐）

1. 思路一当然是采用json将参数序列化，然后进行携带请求参数，一位get请求和delete请求的参数信息并不是放在请求体中，而是放在地址栏中拼接参数，所以这里采用post的请求比较好（地址栏的url有限制，不可过长，批量删除所需要拼接的id集合可能很多）
```javascript
//声明空的数组
let blogTypeIds = [];
//在数组添加数据，省略......
//发送post请求
$.ajax({
    method:"post",
    url:"/blog-type/ids",
    dataType: "json",
    data: JSON.stringify(blogTypeIds),  //这里需要将参数，序列化成为json数据
    headers:{
        'Content-Type':'application/json;charset=UTF-8',
    },
    success: function (data, status, xhr) {
        //请求成功执行操作
    },
    error: function (error) {
        //请求失败后的回调方法
        console.log(error)
    }
});

```
ps：data中的数据，必须使用`data: JSON.stringify(blogTypeIds)`;如果使用
`data: { blogTypeIds : JSON.stringify(blogTypeIds) }`这样的格式则不能成功。

2. 修改后台接口为post请求
```java
@PostMapping("/ids")
public ResponseEntity<Void> deleteBlogTypes (@RequestBody List<Long> blogTypeIds ){
    blogTypeService.deleteBlogTypes(blogTypeIds);
    return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
}
```

感觉delete请求也是可以实现的，只是还没有找到好的方法，之后遇到，在进行更新。

注意事项

1. 首先ajax要为post请求（post和delete请求的向后台传参方式不同）
2. 参数只能是json,并且形式只能是`data:JSON.stringify(list)`，而不能是`data: { list: JSON.stringify(list) }`。
3. 需要设置`contentType : 'application/json'`,不然会报错`Resolved [org.springframework.web.HttpMediaTypeNotSupportedException: Content type 'application/x-www-form-urlencoded;charset=UTF-8' not supported] `,因为默认这种类型不能被解析
4. 数组要使用JSON.stringify(list)，解析成为一个合法的json字符串（可以在请求外解析，也可以在请求内的data中直接解析）
5. controller 加上@RequestBody。

### 解法2

在网上还找到了很多别的解决方式，**但是很可惜我好像并没有成功**，但可能也可以成功。之后有机会再进行测试

**1.前台传递数组类型的参数，不需要直接解析成json字符串**

```javascript
let data=[];
//在数组添加数据，省略......
$.ajax({
    method:"post",
    url:"/blog-type/ids",
    data: {
        blogTypeIds:data
    },
    dataType: "json",
    success: function (data) {
    }
});
```

 **2.后台使用@RequestParam(required = false, value = "list[]")**

```java
@PostMapping("/ids")
public ResponseEntity<Void> deleteBlogTypes (@RequestParam(value = "blogTypeIds[]") List<Long> blogTypeIds ){
    blogTypeService.deleteBlogTypes(blogTypeIds);
    return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
}
```
**注意事项**

1. value = "blogTypeIds[]，这个不能省，否则不能成功。
2. `@RequestParam(value = "blogTypeIds[]") List<Long> blogTypeIds`换成`@RequestParam(value = "blogTypeIds[]") Long[] blogTypeIds`也是可以成功的。说明后台的List数据和数组数据都可以使用这样的方式来来实现

ps：解法二有待考证(我并没有成功)，参考博客：[https://blog.csdn.net/qq_27093465/article/details/52094112](https://blog.csdn.net/qq_27093465/article/details/52094112)
解法1经过测试已经成功。
