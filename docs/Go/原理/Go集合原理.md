---
title: Go集合原理
date: 2022-03-28
publish: false
---

## 数组

**Go 语言数组在初始化之后大小就无法改变，存储元素类型相同、但是大小不同的数组类型在 Go 语言看来也是完全不同的，只有两个条件都相同才是同一类型**。

### 初始化

数组的初始化，一种是显式的指定数组大小，另一种是使用 `[...]T` 声明数组，Go 语言会在编译期间通过源代码推导数组的大小：

```go
arr1 := [3]int{1, 2, 3}
arr2 := [...]int{1, 2, 3}
```

*上述两种声明方式在运行期间得到的结果是完全相同的，后一种声明方式在编译期间就会被转换成前一种。*

对于一个由字面量组成的数组，根据数组元素数量的不同，编译器会在负责初始化字面量的函数中做两种不同的优化：

1. 当元素数量小于或者等于 4 个时，会直接将数组中的元素放置在栈上；
2. 当元素数量大于 4 个时，会将数组中的元素放置到静态区并在运行时取出；

> 小于等于4时，会将原有的初始化语句 `[3]int{1, 2, 3}` 拆分成一个声明变量的表达式和几个赋值表达式，这些表达式会完成对数组的初始化：
>
> ```go
> var arr [3]int
> arr[0] = 1
> arr[1] = 2
> arr[2] = 3
> ```
>
> 当前数组的元素大于四个，函数在静态存储区初始化数组中的元素并将临时变量赋值给数组。假设代码需要初始化 `[5]int{1, 2, 3, 4, 5}`，那么我们可以将处理过程理解成以下的伪代码：
>
> ```go
> var arr [5]int
> statictmp_0[0] = 1
> statictmp_0[1] = 2
> statictmp_0[2] = 3
> statictmp_0[3] = 4
> statictmp_0[4] = 5
> arr = statictmp_0
> ```

总结：**在不考虑逃逸分析的情况下，如果数组中元素的个数小于或者等于 4 个，那么所有的变量会直接在栈上初始化，如果数组元素大于 4 个，变量就会在静态存储区初始化然后拷贝到栈上，这些转换后的代码才会继续进入 中间代码生成 和 机器码生成 两个阶段，最后生成可以执行的二进制文件**。

### 访问和赋值

数组访问越界是非常严重的错误，**Go 语言中可以在编译期间的静态类型检查判断数组越界**。

> 1. 访问数组的索引是非整数时，报错 “non-integer array index %v”；
> 2. 访问数组的索引是负数时，报错 “invalid array index %v (index must be non-negative)"；
> 3. 访问数组的索引越界时，报错 “invalid array index %v (out of bounds for %d-element array)"；

*Go 语言运行时在发现数组、切片和字符串的越界操作会由运行时的 [`runtime.panicIndex`](https://draveness.me/golang/tree/runtime.panicIndex) 和 [`runtime.goPanicIndex`](https://draveness.me/golang/tree/runtime.goPanicIndex) 触发程序的运行时错误并导致崩溃退出*。

## 切片

在 Go 语言中，切片类型的声明方式与数组有一些相似，不过由于 **切片的长度是动态的**，所以声明时只需要指定切片中的元素类型：

```go
[]int
[]interface{}
```

### 数据结构

编译期间的切片是 [`cmd/compile/internal/types.Slice`](https://draveness.me/golang/tree/cmd/compile/internal/types.Slice) 类型的，但是在运行时切片可以由如下的 [`reflect.SliceHeader`](https://draveness.me/golang/tree/reflect.SliceHeader) 结构体表示，其中:

- `Data` 是指向数组的指针;
- `Len` 是当前切片的长度；
- `Cap` 是当前切片的容量，即 `Data` 数组的大小：

```go
type SliceHeader struct {
	Data uintptr
	Len  int
	Cap  int
}
```

`Data` 是一片连续的内存空间，这片内存空间可以用于存储切片中的全部元素，数组中的元素只是逻辑上的概念，底层存储其实都是连续的，所以我们可以将切片理解成一片连续的内存空间加上长度与容量的标识。

![Go 语言切片结构体](https://img.draveness.me/2019-02-20-golang-slice-struct.png)

### 初始化

Go 语言中包含三种初始化切片的方式：

1. 通过下标的方式获得数组或者切片的一部分；
2. 使用字面量初始化新的切片；
3. 使用关键字 `make` 创建切片：

```go
arr[0:3]
slice[0:3]
slice := []int{1, 2, 3}
slice := make([]int, 10)
```

虽然编译期间可以检查出很多错误，但是在创建切片的过程中如果发生了以下错误会直接触发运行时错误并崩溃：

1. 内存空间的大小发生了溢出；
2. 申请的内存大于最大可分配的内存；
3. 传入的长度小于 0 或者长度大于容量；

### 追加和扩容

在分配内存空间之前需要先确定新的切片容量，运行时根据切片的当前容量选择不同的策略进行扩容：

1. 如果期望容量大于当前容量的两倍就会使用期望容量；
2. 如果当前切片的长度小于 1024 就会将容量翻倍；
3. 如果当前切片的长度大于 1024 就会每次增加 25% 的容量，直到新容量大于期望容量；

## 哈希表

### 数据结构

Go 语言运行时同时使用了多个数据结构组合表示哈希表，其中 [`runtime.hmap`](https://draveness.me/golang/tree/runtime.hmap) 是最核心的结构体，我们先来了解一下该结构体的内部字段：

```go
type hmap struct {
	count     int
	flags     uint8
	B         uint8
	noverflow uint16
	hash0     uint32

	buckets    unsafe.Pointer
	oldbuckets unsafe.Pointer
	nevacuate  uintptr

	extra *mapextra
}

type mapextra struct {
	overflow    *[]*bmap
	oldoverflow *[]*bmap
	nextOverflow *bmap
}
```

1. `count` 表示当前哈希表中的元素数量；
2. `B` 表示当前哈希表持有的 `buckets` 数量，但是因为哈希表中桶的数量都 2 的倍数，所以该字段会存储对数，也就是 `len(buckets) == 2^B`；
3. `hash0` 是哈希的种子，它能为哈希函数的结果引入随机性，这个值在创建哈希表时确定，并在调用哈希函数时作为参数传入；
4. `oldbuckets` 是哈希在扩容时用于保存之前 `buckets` 的字段，它的大小是当前 `buckets` 的一半；

![哈希表的数据结构](https://img.draveness.me/2020-10-18-16030322432679/hmap-and-buckets.png)

如上图所示哈希表 `runtime.hmap` 的桶是 `runtime.bmap` 。每一个 `runtime.bmap`  都能存储 8 个键值对，当哈希表中存储的数据过多，单个桶已经装满时就会使用 `extra.nextOverflow` 中桶存储溢出的数据。

上述两种不同的桶在内存中是连续存储的，我们在这里将它们分别称为正常桶和溢出桶，上图中黄色的 `runtime.bmap`  就是正常桶，绿色的  `runtime.bmap` 是溢出桶，溢出桶是在 Go 语言还使用 C 语言实现时使用的设计[3](https://draveness.me/golang/docs/part2-foundation/ch03-datastructure/golang-hashmap/#fn:3，由于它能够减少扩容的频率所以一直使用至今。

桶的结构体 [`runtime.bmap`](https://draveness.me/golang/tree/runtime.bmap) 在 Go 语言源代码中的定义只包含一个简单的 `tophash` 字段，`tophash` 存储了键的哈希的高 8 位，通过比较不同键的哈希的高 8 位可以减少访问键值对次数以提高性能：

```go
type bmap struct {
	tophash [bucketCnt]uint8
}
```

在运行期间，[`runtime.bmap`](https://draveness.me/golang/tree/runtime.bmap) 结构体其实不止包含 `tophash` 字段，因为哈希表中可能存储不同类型的键值对，而且 Go 语言也不支持泛型，所以键值对占据的内存空间大小只能在编译时进行推导。

[`runtime.bmap`](https://draveness.me/golang/tree/runtime.bmap) 中的其他字段在运行时也都是通过计算内存地址的方式访问的，所以它的定义中就不包含这些字段，不过我们能根据编译期间的 [`cmd/compile/internal/gc.bmap`](https://draveness.me/golang/tree/cmd/compile/internal/gc.bmap) 函数重建它的结构：

```go
type bmap struct {
    topbits  [8]uint8
    keys     [8]keytype
    values   [8]valuetype
    pad      uintptr
    overflow uinptr
}
```

随着哈希表存储的数据逐渐增多，我们会扩容哈希表或者使用额外的桶存储溢出的数据，不会让单个桶中的数据超过 8 个，不过溢出桶只是临时的解决方案，创建过多的溢出桶最终也会导致哈希的扩容。

### 初始化

目前的现代编程语言基本都支持使用字面量的方式初始化哈希，一般都会使用 `key: value` 的语法来表示键值对，Go 语言中也不例外：

```go
hash := map[string]int{
	"1": 2,
	"3": 4,
	"5": 6,
}
```

> **当哈希表中的元素数量少于或者等于 25 个时**，编译器会将字面量初始化的结构体转换成以下的代码，将所有的键值对一次加入到哈希表中：
>
> ```go
> hash := make(map[string]int, 3)
> hash["1"] = 2
> hash["3"] = 4
> hash["5"] = 6
> ```
>
> 这种初始化的方式与的[数组](https://draveness.me/golang/docs/part2-foundation/ch03-datastructure/golang-array/)和[切片](https://draveness.me/golang/docs/part2-foundation/ch03-datastructure/golang-array-and-slice/)几乎完全相同，由此看来集合类型的初始化在 Go 语言中有着相同的处理逻辑。
>
> **一旦哈希表中元素的数量超过了 25 个**，**编译器会创建两个数组分别存储键和值**，这些键值对会通过如下所示的 for 循环加入哈希：
>
> ```go
> hash := make(map[string]int, 26)
> vstatk := []string{"1", "2", "3", ... ， "26"}
> vstatv := []int{1, 2, 3, ... , 26}
> for i := 0; i < len(vstak); i++ {
>     hash[vstatk[i]] = vstatv[i]
> }
> ```

### 读写操作

哈希表作为一种数据结构，我们肯定要分析它的常见操作，首先就是读写操作的原理。哈希表的访问一般都是通过下标或者遍历进行的：

```go
_ = hash[key]

for k, v := range hash {
    // k, v
}
```

Go

这两种方式虽然都能读取哈希表的数据，但是使用的函数和底层原理完全不同。前者需要知道哈希的键并且一次只能获取单个键对应的值，而后者可以遍历哈希中的全部键值对，访问数据时也不需要预先知道哈希的键。在这里我们会介绍前一种访问方式，第二种访问方式会在 `range` 一节中详细分析。

数据结构的写一般指的都是增加、删除和修改，增加和修改字段都使用索引和赋值语句，而删除字典中的数据需要使用关键字 `delete`：

```go
hash[key] = value
hash[key] = newValue
delete(hash, key)
```

Go

除了这些操作之外，我们还会分析哈希的扩容过程，这能帮助我们深入理解哈希是如何存储数据的。

### 访问 

在编译的[类型检查](https://draveness.me/golang/docs/part1-prerequisite/ch02-compile/golang-typecheck/)期间，`hash[key]` 以及类似的操作都会被转换成哈希的 `OINDEXMAP` 操作，[中间代码生成](https://draveness.me/golang/docs/part1-prerequisite/ch02-compile/golang-ir-ssa/)阶段会在 [`cmd/compile/internal/gc.walkexpr`](https://draveness.me/golang/tree/cmd/compile/internal/gc.walkexpr) 函数中将这些 `OINDEXMAP` 操作转换成如下的代码：

```go
v     := hash[key] // => v     := *mapaccess1(maptype, hash, &key)
v, ok := hash[key] // => v, ok := mapaccess2(maptype, hash, &key)
```

赋值语句左侧接受参数的个数会决定使用的运行时方法：

- 当接受一个参数时，会使用 [`runtime.mapaccess1`](https://draveness.me/golang/tree/runtime.mapaccess1)，该函数仅会返回一个指向目标值的指针；
- 当接受两个参数时，会使用 [`runtime.mapaccess2`](https://draveness.me/golang/tree/runtime.mapaccess2)，除了返回目标值之外，它还会返回一个用于表示当前键对应的值是否存在的 `bool` 值。

### 扩容

随着哈希表中元素的逐渐增加，哈希的性能会逐渐恶化，所以我们需要更多的桶和更大的内存保证哈希的读写性能。

会在以下两种情况发生时触发哈希的扩容：

1. 装载因子已经超过 6.5；
2. 哈希使用了太多溢出桶；

### 小结

Go 语言使用拉链法来解决哈希碰撞的问题实现了哈希表，它的访问、写入和删除等操作都在编译期间转换成了运行时的函数或者方法。哈希在每一个桶中存储键对应哈希的前 8 位，当对哈希进行操作时，这些 `tophash` 就成为可以帮助哈希快速遍历桶中元素的缓存。

哈希表的每个桶都只能存储 8 个键值对，一旦当前哈希的某个桶超出 8 个，新的键值对就会存储到哈希的溢出桶中。随着键值对数量的增加，溢出桶的数量和哈希的装载因子也会逐渐升高，超过一定范围就会触发扩容，扩容会将桶的数量翻倍，元素再分配的过程也是在调用写操作时增量进行的，不会造成性能的瞬时巨大抖动。

## 字符串

字符串是由字符组成的数组，C 语言中的字符串使用字符数组 `char[]` 表示。数组会占用一片连续的内存空间，而内存空间存储的字节共同组成了字符串，Go 语言中的字符串只是一个只读的字节数组，下图展示了 `"hello"` 字符串在内存中的存储方式：

![内存中的字符串](https://img.draveness.me/2019-12-31-15777265631608-in-memory-string.png)

如果是代码中存在的字符串，编译器会将其标记成只读数据 `SRODATA`，假设我们有以下代码，其中包含了一个字符串，当我们将这段代码编译成汇编语言时，就能够看到 `hello` 字符串有一个 `SRODATA` 的标记。

只读只意味着字符串会分配到只读的内存空间，但是 Go 语言只是不支持直接修改 `string` 类型变量的内存空间，我们仍然可以通过在 `string` 和 `[]byte` 类型之间反复转换实现修改这一目的：

1. 先将这段内存拷贝到堆或者栈上；
2. 将变量的类型转换成 `[]byte` 后并修改字节数据；
3. 将修改后的字节数组转换回 `string`；

> Java、Python 以及很多编程语言的字符串也都是不可变的，这种不可变的特性可以保证我们不会引用到意外发生改变的值，而因为 Go 语言的字符串可以作为哈希的键，所以如果哈希的键是可变的，不仅会增加哈希实现的复杂度，还可能会影响哈希的比较。

### 数据结构

字符串在 Go 语言中的接口其实非常简单，每一个字符串在运行时都会使用如下的 [`reflect.StringHeader`](https://draveness.me/golang/tree/reflect.StringHeader) 表示，其中包含指向字节数组的指针和数组的大小：

```go
type StringHeader struct {
	Data uintptr
	Len  int
}
```

与切片的结构体相比，字符串只少了一个表示容量的 `Cap` 字段，而正是因为切片在 Go 语言的运行时表示与字符串高度相似，所以我们经常会说字符串是一个只读的切片类型。

```go
type SliceHeader struct {
	Data uintptr
	Len  int
	Cap  int
}
```

因为字符串作为只读的类型，我们并不会直接向字符串直接追加元素改变其本身的内存空间，所有在字符串上的写入操作都是通过拷贝实现的。

### 解析过程

解析器会在 **词法分析** 阶段解析字符串，词法分析阶段会对源文件中的字符串进行切片和分组，将原有无意义的字符流转换成 Token 序列。我们可以使用两种字面量方式在 Go 语言中声明字符串，即双引号和反引号:

```go
str1 := "this is a string"
str2 := `this is another
string`
```

使用双引号声明的字符串和其他语言中的字符串没有太多的区别，它只能用于单行字符串的初始化，如果字符串内部出现双引号，需要使用 `\` 符号避免编译器的解析错误，而反引号声明的字符串可以摆脱单行的限制。当使用反引号时，因为双引号不再负责标记字符串的开始和结束，我们可以在字符串内部直接使用 `"`，在遇到需要手写 JSON 或者其他复杂数据格式的场景下非常方便。

```go
json := `{"author": "draven", "tags": ["golang"]}`
```

### 类型转换

当我们使用 Go 语言解析和序列化 JSON 等数据格式时，经常需要将数据在 `string` 和 `[]byte` 之间来回转换，类型转换的开销并没有想象的那么小，我们经常会看到 [`runtime.slicebytetostring`](https://draveness.me/golang/tree/runtime.slicebytetostring) 等函数出现在火焰图[1](https://draveness.me/golang/docs/part2-foundation/ch03-datastructure/golang-string/#fn:1)中，成为程序的性能热点。

字符串和 `[]byte` 中的内容虽然一样，但是字符串的内容是只读的，我们不能通过下标或者其他形式改变其中的数据，而 `[]byte` 中的内容是可以读写的。不过无论从哪种类型转换到另一种都需要拷贝数据，而内存拷贝的性能损耗会随着字符串和 `[]byte` 长度的增长而增长。

> 在做拼接和类型转换等操作时一定要注意性能的损耗，遇到需要极致性能的场景一定要尽量减少类型转换的次数。

