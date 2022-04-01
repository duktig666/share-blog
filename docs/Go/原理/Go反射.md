---
title: Go反射
date: 2022-04-01
publish: false
---

## 反射基础

[`reflect`](https://golang.org/pkg/reflect/) 实现了运行时的反射能力，能够让程序操作不同类型的对象。反射包中有两对非常重要的函数和类型，两个函数分别是：

- `reflect.TypeOf`能获取类型信息；
- `reflect.ValueOf`能获取数据的运行时表示；

两个类型是 `reflect.Type` 和 `reflect.Value`，它们与函数是一一对应的关系：

![golang-reflection](https://img.draveness.me/golang-reflection.png)

类型 [`reflect.Type`](https://draveness.me/golang/tree/reflect.Type) 是反射包定义的一个接口，我们可以使用 [`reflect.TypeOf`](https://draveness.me/golang/tree/reflect.TypeOf) 函数获取任意变量的类型，[`reflect.Type`](https://draveness.me/golang/tree/reflect.Type) 接口中定义了一些有趣的方法，`MethodByName` 可以获取当前类型对应方法的引用、`Implements` 可以判断当前类型是否实现了某个接口：

```go
type Type interface {
        Align() int
        FieldAlign() int
        Method(int) Method
        MethodByName(string) (Method, bool)
        NumMethod() int
        ...
        Implements(u Type) bool
        ...
}
```

反射包中 [`reflect.Value`](https://draveness.me/golang/tree/reflect.Value) 的类型与 [`reflect.Type`](https://draveness.me/golang/tree/reflect.Type) 不同，它被声明成了结构体。这个结构体没有对外暴露的字段，但是提供了获取或者写入数据的方法：

```go
type Value struct {
        // 包含过滤的或者未导出的字段
}

func (v Value) Addr() Value
func (v Value) Bool() bool
func (v Value) Bytes() []byte
...
```

反射包中的所有方法基本都是围绕着 [`reflect.Type`](https://draveness.me/golang/tree/reflect.Type) 和 [`reflect.Value`](https://draveness.me/golang/tree/reflect.Value) 两个类型设计的。我们通过 [`reflect.TypeOf`](https://draveness.me/golang/tree/reflect.TypeOf)、[`reflect.ValueOf`](https://draveness.me/golang/tree/reflect.ValueOf) 可以将一个普通的变量转换成反射包中提供的 [`reflect.Type`](https://draveness.me/golang/tree/reflect.Type) 和 [`reflect.Value`](https://draveness.me/golang/tree/reflect.Value)，随后就可以使用反射包中的方法对它们进行复杂的操作。

## Go反射的三大原则

运行时反射是程序在运行期间检查其自身结构的一种方式。反射带来的灵活性是一把双刃剑，反射作为一种元编程方式可以减少重复代码[2](https://draveness.me/golang/docs/part2-foundation/ch04-basic/golang-reflect/#fn:2)，但是过量的使用反射会使我们的程序逻辑变得难以理解并且运行缓慢。我们在这一节中会介绍 Go 语言反射的三大法则，其中包括：

1. 从 `interface{}` 变量可以反射出反射对象；
2. 从反射对象可以获取 `interface{}` 变量；
3. 要修改反射对象，其值必须可设置；

### 第一法则

反射的第一法则是我们能将 Go 语言的 `interface{}` 变量转换成反射对象。很多读者可能会对这以法则产生困惑 — 为什么是从 `interface{}` 变量到反射对象？当我们执行 `reflect.ValueOf(1)` 时，虽然看起来是获取了基本类型 `int` 对应的反射类型，但是由于 [`reflect.TypeOf`](https://draveness.me/golang/tree/reflect.TypeOf)、[`reflect.ValueOf`](https://draveness.me/golang/tree/reflect.ValueOf) 两个方法的入参都是 `interface{}` 类型，所以在方法执行的过程中发生了类型转换。

因为Go 语言的函数调用都是值传递的，所以变量会在函数调用时进行类型转换。基本类型 `int` 会转换成 `interface{}` 类型，这也就是为什么第一条法则是从接口到反射对象。

面提到的 [`reflect.TypeOf`](https://draveness.me/golang/tree/reflect.TypeOf) 和 [`reflect.ValueOf`](https://draveness.me/golang/tree/reflect.ValueOf) 函数就能完成这里的转换，如果我们认为 Go 语言的类型和反射类型处于两个不同的世界，那么这两个函数就是连接这两个世界的桥梁。

![golang-interface-to-reflection](https://img.draveness.me/golang-interface-to-reflection.png)

我们可以通过以下例子简单介绍它们的作用，[`reflect.TypeOf`](https://draveness.me/golang/tree/reflect.TypeOf) 获取了变量 `author` 的类型，[`reflect.ValueOf`](https://draveness.me/golang/tree/reflect.ValueOf) 获取了变量的值 `draven`。如果我们知道了一个变量的类型和值，那么就意味着我们知道了这个变量的全部信息。

```go
package main

import (
	"fmt"
	"reflect"
)

func main() {
	author := "draven"
	fmt.Println("TypeOf author:", reflect.TypeOf(author))
	fmt.Println("ValueOf author:", reflect.ValueOf(author))
}

$ go run main.go
TypeOf author: string
ValueOf author: draven
```

Go

有了变量的类型之后，我们可以通过 `Method` 方法获得类型实现的方法，通过 `Field` 获取类型包含的全部字段。对于不同的类型，我们也可以调用不同的方法获取相关信息：

- 结构体：获取字段的数量并通过下标和字段名获取字段 `StructField`；
- 哈希表：获取哈希表的 `Key` 类型；
- 函数或方法：获取入参和返回值的类型；
- …

### 第二法则

反射的第二法则是我们可以从反射对象可以获取 `interface{}` 变量。既然能够将接口类型的变量转换成反射对象，那么一定需要其他方法将反射对象还原成接口类型的变量，[`reflect`](https://golang.org/pkg/reflect/) 中的 [`reflect.Value.Interface`](https://draveness.me/golang/tree/reflect.Value.Interface) 就能完成这项工作：

不过调用 [`reflect.Value.Interface`](https://draveness.me/golang/tree/reflect.Value.Interface) 方法只能获得 `interface{}` 类型的变量，如果想要将其还原成最原始的状态还需要经过如下所示的显式类型转换：

```go
v := reflect.ValueOf(1)
v.Interface().(int)
```

Go

从反射对象到接口值的过程是从接口值到反射对象的镜面过程，两个过程都需要经历两次转换：

- 从接口值到反射对象：
  - 从基本类型到接口类型的类型转换；
  - 从接口类型到反射对象的转换；
- 从反射对象到接口值：
  - 反射对象转换成接口类型；
  - 通过显式类型转换变成原始类型；

![golang-bidirectional-reflection](https://img.draveness.me/golang-bidirectional-reflection.png)

当然不是所有的变量都需要类型转换这一过程。如果变量本身就是 `interface{}` 类型的，那么它不需要类型转换，因为类型转换这一过程一般都是隐式的，所以我不太需要关心它，只有在我们需要将反射对象转换回基本类型时才需要显式的转换操作。

### 第三法则 

，假设我们有以下代码：

```go
func main() {
	i := 1
	v := reflect.ValueOf(i)
	v.SetInt(10)
	fmt.Println(i)
}

$ go run reflect.go
panic: reflect: reflect.flag.mustBeAssignable using unaddressable value

goroutine 1 [running]:
reflect.flag.mustBeAssignableSlow(0x82, 0x1014c0)
	/usr/local/go/src/reflect/value.go:247 +0x180
reflect.flag.mustBeAssignable(...)
	/usr/local/go/src/reflect/value.go:234
reflect.Value.SetInt(0x100dc0, 0x414020, 0x82, 0x1840, 0xa, 0x0)
	/usr/local/go/src/reflect/value.go:1606 +0x40
main.main()
	/tmp/sandbox590309925/prog.go:11 +0xe0
```

Go

运行上述代码会导致程序崩溃并报出 “reflect: reflect.flag.mustBeAssignable using unaddressable value” 错误，仔细思考一下就能够发现出错的原因：由于 Go 语言的函数调用都是传值的，所以我们得到的反射对象跟最开始的变量没有任何关系，那么直接修改反射对象无法改变原始变量，程序为了防止错误就会崩溃。

想要修改原变量只能使用如下的方法：

```go
func main() {
	i := 1
	v := reflect.ValueOf(&i)
	v.Elem().SetInt(10)
	fmt.Println(i)
}

$ go run reflect.go
10
```

Go

1. 调用 [`reflect.ValueOf`](https://draveness.me/golang/tree/reflect.ValueOf) 获取变量指针；
2. 调用 [`reflect.Value.Elem`](https://draveness.me/golang/tree/reflect.Value.Elem) 获取指针指向的变量；
3. 调用 [`reflect.Value.SetInt`](https://draveness.me/golang/tree/reflect.Value.SetInt) 更新变量的值：

由于 Go 语言的函数调用都是值传递的，所以我们只能只能用迂回的方式改变原变量：先获取指针对应的 [`reflect.Value`](https://draveness.me/golang/tree/reflect.Value)，再通过 [`reflect.Value.Elem`](https://draveness.me/golang/tree/reflect.Value.Elem) 方法得到可以被设置的变量，我们可以通过下面的代码理解这个过程：

```go
func main() {
	i := 1
	v := &i
	*v = 10
}
```

如果不能直接操作 `i` 变量修改其持有的值，我们就只能获取 `i` 变量所在地址并使用 `*v` 修改所在地址中存储的整数。







