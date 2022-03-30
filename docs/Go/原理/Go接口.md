---
title: Go接口原理
date: 2022-03-30
publish: false
---

## Go接口概述

### 接口作用

**依赖解耦**

接口的本质是引入一个新的中间层，调用方可以通过接口与具体实现分离，解除上下游的耦合，上层的模块不再需要依赖下层的具体模块，只需要依赖一个约定好的接口。

![golang-interface](https://img.draveness.me/golang-interface.png)

**隐藏底层实现**

除了解耦有依赖关系的上下游，接口还能够帮助我们隐藏底层实现，减少关注点。《计算机程序的构造和解释》中有这么一句话：

> 代码必须能够被人阅读，只是机器恰好可以执行[3](https://draveness.me/golang/docs/part2-foundation/ch04-basic/golang-interface/#fn:3)

人能够同时处理的信息非常有限，定义良好的接口能够隔离底层的实现，让我们将重点放在当前的代码片段中。

例子：SQL 就是接口的一个例子，当我们使用 SQL 语句查询数据时，其实不需要关心底层数据库的具体实现，我们只在乎 SQL 返回的结果是否符合预期。

![sql-and-databases](https://img.draveness.me/2020-01-12-15787970694046-sql-and-databases.png)

### 接口定义

定义接口需要使用 `interface` 关键字，在接口中我们只能定义方法签名，不能包含成员变量，一个常见的 Go 语言接口是这样的：

```go
type error interface {
	Error() string
}
```

如果一个类型需要实现 `error` 接口，那么它只需要实现 `Error() string` 方法，下面的 `RPCError` 结构体就是 `error` 接口的一个实现：

```go
type RPCError struct {
	Code    int64
	Message string
}

func (e *RPCError) Error() string {
	return fmt.Sprintf("%s, code=%d", e.Message, e.Code)
}
```

细心的读者可能会发现上述代码根本就没有 `error` 接口的影子，这是为什么呢？

Go 语言中**接口的实现都是隐式的**，我们只需要实现 `Error() string` 方法就实现了 `error` 接口。Go 语言实现接口的方式与 Java 完全不同：

- 在 Java 中：实现接口需要显式地声明接口并实现所有方法；
- 在 Go 中：实现接口的所有方法就隐式地实现了接口；

举几个例子来演示发生接口类型检查的时机：

```go
func main() {
	var rpcErr error = NewRPCError(400, "unknown err") // typecheck1
	err := AsErr(rpcErr) // typecheck2
	println(err)
}

func NewRPCError(code int64, msg string) error {
	return &RPCError{ // typecheck3
		Code:    code,
		Message: msg,
	}
}

func AsErr(err error) error {
	return err
}
```

Go 语言在[编译期间](https://draveness.me/golang/docs/part1-prerequisite/ch02-compile/golang-compile-intro/)对代码进行类型检查，上述代码总共触发了三次类型检查：

1. 将 `*RPCError` 类型的变量赋值给 `error` 类型的变量 `rpcErr`；
2. 将 `*RPCError` 类型的变量 `rpcErr` 传递给签名中参数类型为 `error` 的 `AsErr` 函数；
3. 将 `*RPCError` 类型的变量从函数签名的返回值类型为 `error` 的 `NewRPCError` 函数中返回；

从类型检查的过程来看，编译器仅在需要时才检查类型，类型实现接口时只需要实现接口中的全部方法，不需要像 Java 等编程语言中一样显式声明。

### 类型

接口也是 Go 语言中的一种类型，它能够出现在变量的定义、函数的入参和返回值中并对它们进行约束，不过 Go 语言中有两种略微不同的接口，一种是带有一组方法的接口，另一种是不带任何方法的 `interface{}`：

![Go 语言中的两种接口](https://img.draveness.me/golang-different-interface.png)

Go 语言使用 `runtime.iface` 表示第一种接口，使用 `runtime.eface` 表示第二种不包含任何方法的接口 `interface{}`，两种接口虽然都使用 `interface` 声明，但是由于后者在 Go 语言中很常见，所以在实现时使用了特殊的类型。

*`interface{}` 类型**不是任意类型**。如果我们将类型转换成了 `interface{}` 类型，变量在运行期间的类型也会发生变化，获取变量类型时会得到 `interface{}`。*

### 指针和接口

在 Go 语言中同时使用指针和接口时会发生一些让人困惑的问题，接口在定义一组方法时没有对实现的接收者做限制，所以我们会看到某个类型实现接口的两种方式：

![结构体和指针实现接口](https://img.draveness.me/golang-interface-and-pointer.png)

这是因为结构体类型和指针类型是不同的，就像我们不能向一个接受指针的函数传递结构体一样，在实现接口时这两种类型也不能划等号。虽然两种类型不同，但是上图中的两种实现不可以同时存在，Go 语言的编译器会在结构体类型和指针类型都实现一个方法时报错` "method redeclared"`。

对 `Cat` 结构体来说，它在实现接口时可以选择接受者的类型，即结构体或者结构体指针，在初始化时也可以初始化成结构体或者指针。下面的代码总结了如何使用结构体、结构体指针实现接口，以及如何使用结构体、结构体指针初始化变量。

```go
type Cat struct {}
type Duck interface { ... }

func (c  Cat) Quack {}  // 使用结构体实现接口
func (c *Cat) Quack {}  // 使用结构体指针实现接口

var d Duck = Cat{}      // 使用结构体初始化变量
var d Duck = &Cat{}     // 使用结构体指针初始化变量
```

实现接口的类型和初始化返回的类型两个维度共组成了四种情况，然而这四种情况不是都能通过编译器的检查：

|                      | 结构体实现接口 | 结构体指针实现接口 |
| :------------------: | :------------: | :----------------: |
|   结构体初始化变量   |      通过      |       不通过       |
| 结构体指针初始化变量 |      通过      |        通过        |

四种中只有使用指针实现接口，使用结构体初始化变量无法通过编译，其他的三种情况都可以正常执行。当实现接口的类型和初始化变量时返回的类型时相同时，代码通过编译是理所应当的：

- 方法接受者和初始化类型都是结构体；
- 方法接受者和初始化类型都是结构体指针；

而剩下的两种方式为什么一种能够通过编译，另一种无法通过编译呢？我们先来看一下能够通过编译的情况，即方法的接受者是结构体，而初始化的变量是结构体指针：

```go
type Cat struct{}

func (c Cat) Quack() {
	fmt.Println("meow")
}

func main() {
	var c Duck = &Cat{}
	c.Quack()
}
```

作为指针的 `&Cat{}` 变量能够**隐式地获取**到指向的结构体，所以能在结构体上调用 `Walk` 和 `Quack` 方法。我们可以将这里的调用理解成 C 语言中的 `d->Walk()` 和 `d->Speak()`，它们都会先获取指向的结构体再执行对应的方法。



但是如果我们将上述代码中方法的接受者和初始化的类型进行交换，代码就无法通过编译了：

```go
type Duck interface {
	Quack()
}

type Cat struct{}

func (c *Cat) Quack() {
	fmt.Println("meow")
}

func main() {
	var c Duck = Cat{}
	c.Quack()
}
```

报错：

```go
$ go build interface.go
./interface.go:20:6: cannot use Cat literal (type Cat) as type Duck in assignment:
	Cat does not implement Duck (Quack method has pointer receiver)
```

编译器会提醒我们：`Cat` 类型没有实现 `Duck` 接口，`Quack` 方法的接受者是指针。这两个报错对于刚刚接触 Go 语言的开发者比较难以理解，如果我们想要搞清楚这个问题，首先要知道 **Go 语言在 传递参数 时都是传值的**。

![实现接口的接受者类型](https://img.draveness.me/golang-interface-method-receiver.png)

如上图所示，无论上述代码中初始化的变量 `c` 是 `Cat{}` 还是 `&Cat{}`，使用 `c.Quack()` 调用方法时都会发生值拷贝：

- 如上图左侧，对于 `&Cat{}` 来说，这意味着拷贝一个新的 `&Cat{}` 指针，这个指针与原来的指针指向一个相同并且唯一的结构体，所以编译器可以隐式的对变量解引用（dereference）获取指针指向的结构体；
- 如上图右侧，对于 `Cat{}` 来说，这意味着 `Quack` 方法会接受一个全新的 `Cat{}`，因为方法的参数是 `*Cat`，编译器不会无中生有创建一个新的指针；即使编译器可以创建新指针，这个指针指向的也不是最初调用该方法的结构体；

上面的分析解释了指针类型的现象，**当我们使用指针实现接口时，只有指针类型的变量才会实现该接口**；**当我们使用结构体实现接口时，指针类型和结构体类型都会实现该接口**。当然这并不意味着我们应该一律使用结构体实现接口，这个问题在实际工程中也没那么重要，在这里我们只想解释现象背后的原因。

### nil 和 non-nil

我们可以通过一个例子理解**Go 语言的接口类型不是任意类型**这一句话，下面的代码在 `main` 函数中初始化了一个 `*TestStruct` 类型的变量，由于指针的零值是 `nil`，所以变量 `s` 在初始化之后也是 `nil`：

```go
package main

type TestStruct struct{}

func NilOrNot(v interface{}) bool {
	return v == nil
}

func main() {
	var s *TestStruct
	fmt.Println(s == nil)      // #=> true
	fmt.Println(NilOrNot(s))   // #=> false
}
```

结果：

```go
$ go run main.go
true
false
```

我们简单总结一下上述代码执行的结果：

- 将上述变量与 `nil` 比较会返回 `true`；
- 将上述变量传入 `NilOrNot` 方法并与 `nil` 比较会返回 `false`；

出现上述现象的原因是 —— 调用 `NilOrNot` 函数时发生了**隐式的类型转换**，除了向方法传入参数之外，变量的赋值也会触发隐式类型转换。在类型转换时，`*TestStruct` 类型会转换成 `interface{}` 类型，转换后的变量不仅包含转换前的变量，还包含变量的类型信息 `TestStruct`，所以转换后的变量与 `nil` 不相等。

## 数据结构

Go 语言根据接口类型是否包含一组方法将接口类型分成了两类：

- 使用 [`runtime.iface`](https://draveness.me/golang/tree/runtime.iface) 结构体表示包含方法的接口
- 使用 [`runtime.eface`](https://draveness.me/golang/tree/runtime.eface) 结构体表示不包含任何方法的 `interface{}` 类型；

[`runtime.eface`](https://draveness.me/golang/tree/runtime.eface) 结构体在 Go 语言中的定义是这样的：

```go
type eface struct { // 16 字节
	_type *_type
	data  unsafe.Pointer
}
```

由于 `interface{}` 类型不包含任何方法，所以它的结构也相对来说比较简单，只包含指向底层数据和类型的两个指针。从上述结构我们也能推断出 — Go 语言的任意类型都可以转换成 `interface{}`。

另一个用于表示接口的结构体是 [`runtime.iface`](https://draveness.me/golang/tree/runtime.iface)，这个结构体中有指向原始数据的指针 `data`，不过更重要的是 [`runtime.itab`](https://draveness.me/golang/tree/runtime.itab) 类型的 `tab` 字段。

```go
type iface struct { // 16 字节
	tab  *itab
	data unsafe.Pointer
}
```

### 类型结构体

[`runtime._type`](https://draveness.me/golang/tree/runtime._type) 是 Go 语言类型的运行时表示。下面是运行时包中的结构体，其中包含了很多类型的元信息，例如：类型的大小、哈希、对齐以及种类等。

```go
type _type struct {
	size       uintptr
	ptrdata    uintptr
	hash       uint32
	tflag      tflag
	align      uint8
	fieldAlign uint8
	kind       uint8
	equal      func(unsafe.Pointer, unsafe.Pointer) bool
	gcdata     *byte
	str        nameOff
	ptrToThis  typeOff
}
```

- `size` 字段存储了类型占用的内存空间，为内存空间的分配提供信息；
- `hash` 字段能够帮助我们快速确定类型是否相等；
- `equal` 字段用于判断当前类型的多个对象是否相等，该字段是为了减少 Go 语言二进制包大小从 `typeAlg` 结构体中迁移过来的[4](https://draveness.me/golang/docs/part2-foundation/ch04-basic/golang-interface/#fn:4)；

我们只需要对 [`runtime._type`](https://draveness.me/golang/tree/runtime._type) 结构体中的字段有一个大体的概念，不需要详细理解所有字段的作用和意义。

### itab 结构体

[`runtime.itab`](https://draveness.me/golang/tree/runtime.itab) 结构体是接口类型的核心组成部分，每一个 [`runtime.itab`](https://draveness.me/golang/tree/runtime.itab) 都占 32 字节，我们可以将其看成接口类型和具体类型的组合，它们分别用 `inter` 和 `_type` 两个字段表示：

```go
type itab struct { // 32 字节
	inter *interfacetype
	_type *_type
	hash  uint32
	_     [4]byte
	fun   [1]uintptr
}
```

除了 `inter` 和 `_type` 两个用于表示类型的字段之外，上述结构体中的另外两个字段也有自己的作用：

- `hash` 是对 `_type.hash` 的拷贝，当我们想将 `interface` 类型转换成具体类型时，可以使用该字段快速判断目标类型和具体类型 [`runtime._type`](https://draveness.me/golang/tree/runtime._type) 是否一致；
- `fun` 是一个动态大小的数组，它是一个用于动态派发的虚函数表，存储了一组函数指针。虽然该变量被声明成大小固定的数组，但是在使用时会通过原始指针获取其中的数据，所以 `fun` 数组中保存的元素数量是不确定的；

## 动态派发

动态派发（Dynamic dispatch）是在运行期间选择具体多态操作（方法或者函数）执行的过程，它是面向对象语言中的常见特性。Go 语言虽然不是严格意义上的面向对象语言，但是接口的引入为它带来了动态派发这一特性，调用接口类型的方法时，如果编译期间不能确认接口的类型，Go 语言会在运行期间决定具体调用该方法的哪个实现。

在如下所示的代码中，`main` 函数调用了两次 `Quack` 方法：

1. 第一次以 `Duck` 接口类型的身份调用，调用时需要经过运行时的动态派发；
2. 第二次以 `*Cat` 具体类型的身份调用，编译期就会确定调用的函数：

```go
func main() {
	var c Duck = &Cat{Name: "draven"}
	c.Quack()
	c.(*Cat).Quack()
}
```

直接调用方法需要消耗时间的平均值和使用指针实现接口时差不多，约为 ~3.09ns，而使用动态派发调用方法却需要 ~6.98ns 相比直接调用额外消耗了 ~125% 的时间，从生成的汇编指令我们也能看出后者的额外开销会高很多。

直接调用和动态派发的性能对比：

|        | 直接调用 | 动态派发 |
| :----: | :------: | :------: |
|  指针  | ~3.03ns  | ~3.58ns  |
| 结构体 | ~3.09ns  | ~6.98ns  |



从上述表格我们可以看到使用结构体实现接口带来的开销会大于使用指针实现，而动态派发在结构体上的表现非常差，这也提醒我们应当 **尽量避免使用结构体类型实现接口**。

**使用结构体带来的巨大性能差异不只是接口带来的问题，带来性能问题主要因为 Go 语言在函数调用时是传值的，动态派发的过程只是放大了参数拷贝带来的影响**。

