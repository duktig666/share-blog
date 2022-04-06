---
title: Go的Channel
date: 2022-04-06
publish: false
---

## 设计原理

Go 语言中最常见的、也是经常被人提及的设计模式就是：**不要通过共享内存的方式进行通信，而是应该通过通信的方式共享内存。**

在很多主流的编程语言中，多个线程传递数据的方式一般都是共享内存，为了解决线程竞争，我们需要限制同一时间能够读写这些变量的线程数量，然而这与 Go 语言鼓励的设计并不相同。

![shared-memory](https://img.draveness.me/2020-01-28-15802171487042-shared-memory.png)

虽然我们在 Go 语言中也能使用共享内存加互斥锁进行通信，但是 Go 语言提供了一种不同的并发模型，即通信顺序进程（Communicating sequential processes，CSP）[1](https://draveness.me/golang/docs/part3-runtime/ch06-concurrency/golang-channel/#fn:1)。Goroutine 和 Channel 分别对应 CSP 中的实体和传递信息的媒介，Goroutine 之间会通过 Channel 传递数据。

![channel-and-goroutines](https://img.draveness.me/2020-01-28-15802171487080-channel-and-goroutines.png)

上图中的两个 Goroutine，一个会向 Channel 中发送数据，另一个会从 Channel 中接收数据，它们两者能够独立运行并不存在直接关联，但是能通过 Channel 间接完成通信。













