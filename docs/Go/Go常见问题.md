---
title: Go常见问题
date: 2022-03-23
publish: false
---



## Go依赖下载不下来

```sh
go env -w GOSUMDB=off
 
# 更换代理，无需翻墙。
go env -w GOPROXY=https://goproxy.cn,direct
```



### 遍历的指针问题 

第二个例子是使用 Go 语言经常会犯的错误[1](https://draveness.me/golang/docs/part2-foundation/ch05-keyword/golang-for-range/#fn:1)。当我们在遍历一个数组时，如果获取 `range` 返回变量的地址并保存到另一个数组或者哈希时，会遇到令人困惑的现象，下面的代码会输出 “3 3 3”：

```go
func main() {
	arr := []int{1, 2, 3}
	newArr := []*int{}
	for _, v := range arr {
		newArr = append(newArr, &v)
	}
	for _, v := range newArr {
		fmt.Println(*v)
	}
}

$ go run main.go
3 3 3
```

一些有经验的开发者不经意也会犯这种错误，正确的做法应该是使用 `&arr[i]` 替代 `&v`。

