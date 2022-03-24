---
title: Go散记
date: 2022-03-23
publish: false
---

## sync.Once

在编程的很多场景下我们需要确保某些操作在高并发的场景下只执行一次，例如只加载一次配置文件、只关闭一次通道等。

Go语言中的`sync`包中提供了一个针对只执行一次场景的解决方案–`sync.Once`。

sync.Once只有一个Do方法，其签名如下：

```go
func (o *Once) Do(f func()) {}
```

注意：如果要执行的函数f需要传递参数就需要搭配闭包来使用。

## 结构体与JSON序列化

```go
//Class 班级
type Class struct {
    Title    string
    Students []*Student
}

c := &Class{
    Title:    "101",
    Students: make([]*Student, 0, 200),
}

//JSON序列化：结构体-->JSON格式的字符串
data, err := json.Marshal(c)

//JSON反序列化：JSON格式的字符串-->结构体
str := `{"Title":"101","Students":[{"ID":0,"Gender":"男","Name":"stu00"},{"ID":1,"Gender":"男","Name":"stu01"},{"ID":2,"Gender":"男","Name":"stu02"},{"ID":3,"Gender":"男","Name":"stu03"},{"ID":4,"Gender":"男","Name":"stu04"},{"ID":5,"Gender":"男","Name":"stu05"},{"ID":6,"Gender":"男","Name":"stu06"},{"ID":7,"Gender":"男","Name":"stu07"},{"ID":8,"Gender":"男","Name":"stu08"},{"ID":9,"Gender":"男","Name":"stu09"}]}`
c1 := &Class{}
err = json.Unmarshal([]byte(str), c1)
```

结构体标签

```go
//Student 学生
type Student struct {
    ID     int    `json:"id"` //通过指定tag实现json序列化该字段时的key
    Gender string //json序列化是默认使用字段名作为key
    name   string //私有不能被json包访问
}
```

## go安装依赖包（go get, go module）

[go安装依赖包（go get, go module）](https://blog.csdn.net/weixin_41519463/article/details/103501485)



## panic



## go中*和&区别



