(window.webpackJsonp=window.webpackJsonp||[]).push([[47],{477:function(r,v,_){"use strict";_.r(v);var a=_(3),o=Object(a.a)({},(function(){var r=this,v=r._self._c;return v("ContentSlotsDistributor",{attrs:{"slot-key":r.$parent.slotKey}},[v("div",{staticClass:"custom-block tip"},[v("p",{staticClass:"title"}),v("p",[r._v("重点了解：")]),r._v(" "),v("ol",[v("li",[r._v("Kafka 如何进行复制")]),r._v(" "),v("li",[r._v("Kafka 如何处理来自生产者和消费者的请求")]),r._v(" "),v("li",[r._v("Kafka 的存储细节，比如文件格式和索引")])])]),r._v(" "),v("h2",{attrs:{id:"集群成员关系"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#集群成员关系"}},[r._v("#")]),r._v(" 集群成员关系")]),r._v(" "),v("p",[r._v("Kafka 使用 Zookeeper 来维护集群成员的信息。每个 broker 都有一个唯一标识符，这个标识符可以在配置文件里指定 ，也可以自动生成。")]),r._v(" "),v("p",[r._v("在 broker 启动的时候，它通过创建 "),v("strong",[r._v("临时节点")]),r._v(" 把自己的 ID 注册到 Zookeeper 。 Kafka 组件订阅 Zookeeper 的 "),v("strong",[r._v("/brokers/ids")]),r._v(" 路径\n(broker 在 Zoo keeper 上的注册路径），当有 broker 加入集群或退出集群时，这些组件就可以获得通知。")]),r._v(" "),v("p",[r._v("在 broker 停机、出现网络分区或长时间垃圾回收停顿时， broker 会从 Zookeeper 上断开连接，此时 broker 在启动时创建的临时节点会自动从 Zookeeper 上移除。监听 broker 列表的Kafka 组件会被告知该 broker 已移除。")]),r._v(" "),v("p",[r._v("在关闭 broker 时，它对应的节点也会消失，不过它的 ID 会继续存在于其他数据结构中 。例如，主题的副本列表（下面会介绍）里就可能包含这些白。在完全关闭一个 broker 之后，如果使用相同的 m 启动另一个全新的 broker ，它会立即加入集群，井拥有与旧 broker相同的分区和主题。")]),r._v(" "),v("h2",{attrs:{id:"控制器"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#控制器"}},[r._v("#")]),r._v(" 控制器")]),r._v(" "),v("p",[r._v("控制器其实就是一个 broker ，只不过它除了具有一般 broker 的功能之外，"),v("strong",[r._v("还负责分区首领的选举")]),r._v("。")]),r._v(" "),v("p",[r._v("集群里第一个启动的 broker 通过在Zookeeper 里创建一个临时节点 "),v("strong",[r._v("/controller")]),r._v(" 让自己成为控制器 。其他 broker 在启动时也会尝试创建这个节点，不过它们会收到一个“节点已存在”的异常，然后“意识”到控制器节点已存在，也就是说集群里已经有一个控制器了。其他 broker 在控制器节点上创建 "),v("strong",[r._v("Zookeeper watch")]),r._v(" 对象，这样它们就可以收到这个节点的变更通知。这种方式 "),v("strong",[r._v("可以确保集群里一次只有一个控制器存在")]),r._v("。")]),r._v(" "),v("p",[v("strong",[r._v("如果控制器被关闭或者与 Zookeeper 断开连接， Zookeeper 上的临时节点就会消失。集群里的其他 broker 通过 watch 对象得到控制器节点消失的通知，它们会尝试让自己成为新的控制器")]),r._v("。第一个在 Zookeeper 里成功创建控制器节点的 broker 就会成为新的控制器，其他节点会收到“节点已存在”的异常，然后在新的控制器节点上再次创建 watch 对象。每个新选出的控制器通过 Zookeeper 的条件递增操作获得一个全新的、数值更大的 controller epoch 。")]),r._v(" "),v("p",[r._v("当控制器发现一个 broker 已经离开集群（通过观察相关的 Zookeeper 路径），它就知道，那些失去首领的分区需要一个新首领（这些分区的首领刚好是在这个 broker 上）。控制器遍历这些分区，并确定谁应该成为新首领（简单来说就是分区副本列表里的下一个副本），然后向所有包含新首领或现有跟随者的 broker 发送请求。"),v("strong",[r._v("该请求消息包含了谁是新首领以及谁是分区跟随者的信息")]),r._v("。随后，新首领开始处理来自生产者和消费者的请求，而跟随者开始从新首领那里复制消息。")]),r._v(" "),v("p",[r._v("当控制器发现一个 broker 加入集群时，它会使用 broker B 来检查新加入的 broker 是否包含现有分区的副本。如果有，控制器就把变更通知发送给新加入的 broker 和其他 broker,新 broker 上的副本开始从首领那里复制消息。")]),r._v(" "),v("p",[r._v("简而言之， "),v("strong",[r._v("Kafka 使用 Zookeeper 的临时节点来选举控制器， 并在节点加入集群或退出集群时通知控制器。控制器负责在节点加入或离开集群时进行分区首领选举。控制器使用epoch 来避免“脑裂” 。“脑裂”是指两个节点同时认为自己是当前的控制器。")])]),r._v(" "),v("h2",{attrs:{id:"复制"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#复制"}},[r._v("#")]),r._v(" 复制")]),r._v(" "),v("p",[r._v("复制功能是 Kafka 架构的核心。在 Kafka 的文档里， Kafka 把自己描述成“一个分布式的、可分区的、可复制的提交日志服务”。"),v("strong",[r._v("复制之所以这么关键，是因为它可以在个别节点失效时仍能保证 Kafka 的可用性和持久性")]),r._v("。")]),r._v(" "),v("p",[v("strong",[r._v("Kafka 使用 主题来组织数据，每个主题被分为若干个分区，每个分区有多个副本。那些副本被保存在 broker 上，每个 broker 可以保存成百上千个属于不同主题和分区的副本。")])]),r._v(" "),v("p",[r._v("副本有以下两种类型 ：")]),r._v(" "),v("ul",[v("li",[r._v("首领副本：每个分区都有一个首领副本。 "),v("strong",[r._v("为了保证一致性，所有生产者请求和消费者请求都会经过这个副本")]),r._v("。")]),r._v(" "),v("li",[r._v("跟随者副本：首领以外的副本都是跟随者副本。"),v("strong",[r._v("跟随者副本不处理来自客户端的请求，它们唯一的任务就是从首领那里复制消息，保持与首领一致的状态")]),r._v("。"),v("strong",[r._v("如果首领发生崩渍，其中的一个跟随者会被提升为新首领")]),r._v("。")])]),r._v(" "),v("p",[v("strong",[r._v("首领的另一个任务是搞清楚哪个跟随者的状态与自己是一致的")]),r._v("。")]),r._v(" "),v("p",[r._v("跟随者为了保持与首领的状态一致、在有新消息到达时尝试从首领那里复制消息，不过有各种原因会导致同步失败。 例如，网络拥塞导致复制变慢， broker 发生崩横导致复制滞后，直到重启 broker 后复制才会继续。")]),r._v(" "),v("p",[v("strong",[r._v("为了与首领保持同步 ，跟随者向首领发送获取数据的请求，这种请求与悄费者为了读取悄息而发送的请求是一样的")]),r._v("。首领将响应消息发给跟随者。"),v("strong",[r._v("请求消息里包含了跟随者想要获取消息的偏移量，而且这些偏移量总是有序的")]),r._v("。")]),r._v(" "),v("p",[r._v("一个跟随者副本先请求淌息 1 ，接着请求消息 2 ，然后请求消息 3 ，在收到这 3 个请求的响应之前，它是不会发送第 4 个请求消息的。如果跟随者发送了请求消息 4 ，那么首领就知道它已经收到了前面 3 个请求的响应。 通过查看每个跟随者请求的最新偏移量 ，首领就会知道每个跟随者复制的进度。"),v("strong",[r._v("如果跟随者在 10 s 内没有请求任何消息，或者虽然在请求消息，但在 10s 内没有请求最新的数据，那么它就会被认为是不同步的")]),r._v("。如果一个副本无陆与首领保持一致，在首领发生失效时，它就不可能成为新首领一一毕竟它没有包含全部的消息。")]),r._v(" "),v("p",[r._v("相反，持续请求得到的最新悄息副本被称为 同步的副本。在首领发生失效时，只有同步副本才有可能被选为新首领。")]),r._v(" "),v("p",[r._v("除了当前首领之外，每个分区都有一个首选首领 创建主题时选定的首领就是分区的首选首领。之所以把它叫作首选首领，是因为在创建分区时，需要在 broker 之间均衡首领。从分区的副本清单里可以很容易找到首选首领，清单里的第一个副本一般就是首选首领。")]),r._v(" "),v("h2",{attrs:{id:"处理请求"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#处理请求"}},[r._v("#")]),r._v(" 处理请求")]),r._v(" "),v("p",[v("strong",[r._v("broker 的大部分工作是处理客户端、分区副本和控制器发送给分区首领的请求")]),r._v("。")]),r._v(" "),v("p",[r._v("Kafka 提供了一个二进制协议（基于 TCP ），指定了请求消息的格式以及 broker 如何对请求作出响应一一包括成功处理请求或在处理请求过程中遇到错误。客户端发起连接并发送请求，broker 处理请求井作出响应。")]),r._v(" "),v("p",[v("strong",[r._v("broker 按照请求到达的顺序来处理它们一一这种顺序保证让Kafka 具有了消息队列的特性，同时保证保存的消息也是有序的")]),r._v("。")]),r._v(" "),v("p",[r._v("所有的请求消息都包含一个标准消息头：")]),r._v(" "),v("ul",[v("li",[r._v("Request type （也就是 API key)")]),r._v(" "),v("li",[r._v("Request version (broker 可以处理不同版本的客户端请求，井根据客户端版本作出 不同的响应）")]),r._v(" "),v("li",[r._v("Correlation ID：一个具有唯一性的数字， 用于标识请求消息，同时也会出现在响应消息和错误日志里（用于诊断问题）")]),r._v(" "),v("li",[r._v("Client ID：用于标识发送请求的客户端")])]),r._v(" "),v("p",[v("strong",[r._v("broker 会在它所监听的每一个端口上运行一个 Acceptor 线程，这个钱程会创建一个连接，并把它交给 Processor  线程去处理。Processor   线程（也被叫作“网络线程”）的数量是可配置 的。网络线程负责从客户端获取请求悄息，把它们放进请求队列，然后从晌应队列获取响应消息，把它们发送给客户端")]),r._v("。")]),r._v(" "),v("p",[r._v("请求消息被放到请求队列后， IO 线程会负责处理它们。")]),r._v(" "),v("p",[v("img",{attrs:{src:"https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202203142109344.png",alt:"Kafka 处理请求的内部流程"}})]),r._v(" "),v("p",[r._v("几种最常见的请求类型:")]),r._v(" "),v("ul",[v("li",[r._v("生产请求：生产者发送的请求，它包含客户端要写入 broker 的消息。")]),r._v(" "),v("li",[r._v("获取请求：在消费者和跟随者副本需要从 b roker 读取消息时发送的请求。")])]),r._v(" "),v("h3",{attrs:{id:"元数据请求"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#元数据请求"}},[r._v("#")]),r._v(" 元数据请求")]),r._v(" "),v("p",[v("strong",[r._v("生产请求和获取请求都必须发送给分区的首领副本")]),r._v("。如果 broker 收到一个针对特定分区的请求，而该分区 的首领在另 一个 broker 上，那么发送请求的客户端会收到一个“非分区首领”的错误响应。当针对特定分区的获取请求被发送到一个不含有该分区首领的 broker上，也会出现同样的错误。 "),v("strong",[r._v("Kafka 客户端要自己负责把生产请求和获取请求发送到正确的broker 上")]),r._v("。")]),r._v(" "),v("p",[v("strong",[r._v("那么客户端怎么知道该往哪里发送请求呢？")])]),r._v(" "),v("p",[r._v("客户端使用了另一种请求类型，也就是 "),v("strong",[r._v("元数据请求")]),r._v("。这种请求包含了客户端感兴趣的主题列表。服务器端的响应消息里指明了这些主题所包含的分区、每个分区都有哪些副本， 以及哪个副本是首领。元数据请求可以发送给任意一个 broker ，因为所有 broker 都缓存了这些信息。")]),r._v(" "),v("p",[r._v("一般情况下，客户端会把这些信息缓存起来，并直接往目标 broker 上发送生产请求和获取请求。它们需要时不时地通过发送元数据请求来刷新这些信息（刷新的时间间隔通过 metadata.max.age.ms 参数来配置），从而知道元数据是否发生了变更。")]),r._v(" "),v("h3",{attrs:{id:"生产请求"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#生产请求"}},[r._v("#")]),r._v(" 生产请求")]),r._v(" "),v("p",[r._v("acks 这个配置参数——该参数指定了需要多少个 broker 确认才可以认为一个消息写入是成功的。不同的配置对“写入成功”的界定是不一样的，如果 acks=1 ，那么只要首领收到消息就认为写入成功；如果 acks=all ，那么需要所有同步副本收到消息才算写入成功；如果 acks=0 ，那么生产者在把消息发出去之后，完全不需要等待 broker 的响应。")]),r._v(" "),v("p",[r._v("包含首领副本的 broker 在收到生产请求时，会对请求做一些验证：")]),r._v(" "),v("ul",[v("li",[r._v("发送数据的用户是否有主题写入权限？")]),r._v(" "),v("li",[r._v("请求里包含的 acks 值是否有效（只允许出现0、 1 或 all) ?")]),r._v(" "),v("li",[r._v("如果 acks=all ， 是否有足够多的同步副本保证消息已经被安全写入？")])]),r._v(" "),v("p",[r._v("之后，消息被写入本地磁盘。在 Linux 系统上，消息会被写到文件系统缓存里，并不保证它们何时会被刷新到磁盘上。 "),v("strong",[r._v("Kafka 不会一直等待数据被写到磁盘上——它依赖复制功能来保证消息的持久性")]),r._v("。")]),r._v(" "),v("p",[r._v("在消息被写入分区的首领之后， broker 开始检查 acks 配置参数——如果 acks 被设为 0 或 1,那么 broker 立即返回响应；如果 ack s 被设为 all ，那么请求会被保存在一个叫作 "),v("strong",[r._v("炼狱")]),r._v(" 的缓冲区里，直到首领发现所有跟随者副本都复制了消息，响应才会被返回给客户端。")]),r._v(" "),v("h3",{attrs:{id:"获取请求"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#获取请求"}},[r._v("#")]),r._v(" 获取请求")]),r._v(" "),v("p",[r._v("客户端发送请求，向 broker 请求主题分区里具有特定偏移量的消息。")]),r._v(" "),v("p",[v("strong",[r._v("可以指定 broker 最多可以从一个分区里返回多少数据")]),r._v("。这个限制是非常重要的，因为客户端需要为 broker 返回的数据分配足够的内存。如果没有这个限制， broker 返回的大量数据有可能艳尽客户端的内存。")]),r._v(" "),v("p",[r._v("请求需要先到达指定的分区首领上，然后客户端通过查询元数据来确保请求的路由是正确的。首领在收到请求时，它会先检查请求是否有效——比如，指定的偏移量在分区上是否存在？如果客户端请求的是已经被删除的数据，或者请求的偏移量不存在，那么 broker 将返回一个错误。")]),r._v(" "),v("p",[r._v("如果请求的偏移量存在， broker 将按照客户端指定的数量上限从分区里读取消息，再把消息返回给客户端。 Kafka 使用 "),v("strong",[r._v("零复制技术")]),r._v(" 向客户端发送消息一一也就是说， "),v("strong",[r._v("Kafka 直接把消息从文件（或者更确切地说是 Linux 文件系统缓存）里发送到网络通道，而不需要经过任何中间缓冲区")]),r._v("。这是 Kafka 与其他大部分数据库系统不一样的地方，其他数据库在将数据发送给客户端之前会先把它们保存在本地缓存里。"),v("strong",[r._v("这项技术避免了字节复制，也不需要管理内存缓冲区，从而获得更好的性能")]),r._v("。")]),r._v(" "),v("p",[r._v("客户端也可以设置下限。例如，如果把下限设置为10KB，就好像是在告诉 broker ：“等到有 10KB 数据的时候再把它们发送给我。”在主题消息流量不是很大的情况下，这样可以减少 CPU 和网络开销。")]),r._v(" "),v("p",[r._v("我们不会让客户端一直等待 broker 累积数据。在等待了一段时间之后，就可以把可用的数据拿回处理，而不是一直等待下去。所以，"),v("strong",[r._v("客户端可以定义一个超时时间")]),r._v("，告诉 broker ：“如果你无告在 X 毫秒内累积满足要求的数据量，那么就把当前这些数据返回给我。")]),r._v(" "),v("p",[v("strong",[r._v("并不是所有保存在分区首领上的数据都可以被客户端读取")]),r._v("。大部分客户端只能读取 已经被写入所有同步副本的悄息（跟随者副本也不行，尽管它们也是消费者 否则复制功能就无陆工作）。分区首领知道每个消息会被复制到哪个副本上，在消息还没有被写入所有同步副本之前，是不会发送给消费者的——尝试获取这些消息的请求会得到空的响应而不是错误。")]),r._v(" "),v("p",[v("strong",[r._v("因为还没有被足够多副本复制的消息被认为是“不安全”的一一如果首领发生崩溃，另一个副本成为新首领 ，那么这些消息就丢失了。如果我们允许消费者读取这些消息，可能就会破坏一致性")]),r._v("。")]),r._v(" "),v("p",[r._v("我们会等到所有同步副本复制了这些消息，才允许消费者读取它们  。 这也意味着，如果 broker 间的消息复制因为某些原因变慢，那么消息到达消费者的时间也会随之变长（因为我们会先等待消息复制完毕）。"),v("strong",[r._v("延迟时间可以通过参数 replica.lag.time.ms 来配置，它指定了副本在复制消息时可被允许的最大延迟时间")]),r._v("。")]),r._v(" "),v("h2",{attrs:{id:"物理存储"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#物理存储"}},[r._v("#")]),r._v(" 物理存储")]),r._v(" "),v("p",[r._v("Kafka 的基本存储单元是分区。")]),r._v(" "),v("p",[r._v("关注的问题：")]),r._v(" "),v("ul",[v("li",[r._v("Kafka 是如何使用这些目录来存储数据的")]),r._v(" "),v("li",[r._v("我们要知道数据是如何被分配到集群的 broker 上以及 broker 的目录里的")]),r._v(" "),v("li",[r._v("我们还要知道 broker 是如何管理这些文件的，特别是如何进行数据保留的")]),r._v(" "),v("li",[r._v("深入探讨文件和索引格式")]),r._v(" "),v("li",[r._v("讨论日志压缩及其工作原理。日志压缩是 K挝ka 的一个高级特性，因为有了这个特性， Kafka 可以用来长时间地保存数据。")])]),r._v(" "),v("h3",{attrs:{id:"分区分配"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#分区分配"}},[r._v("#")]),r._v(" 分区分配")]),r._v(" "),v("p",[v("strong",[r._v("在创建主题时， Kafka 首先会决定如何在 broker 间分配分区")]),r._v("。")]),r._v(" "),v("p",[r._v("假设你有 6 个 broker ，打算创建一个包含 10 个分区的主题，并且复制系数为 3 。那么 Kafka 就会有 30 个分区副本，它们可以被分配给 6 个 broker 。在进行分区分配时，我们要达到如下的目标：")]),r._v(" "),v("ul",[v("li",[r._v("在 broker 间 平均地分布分区副本。")]),r._v(" "),v("li",[r._v("确保每个分区的每个副本分布在不同的 broker 上。")]),r._v(" "),v("li",[r._v("如果为 broker 指定了机架信息，那么尽可能把每个分区的副本分配到不同机架的 broker 上。")])]),r._v(" "),v("p",[r._v("如何实现？")]),r._v(" "),v("p",[r._v("我们先随机选择一个 broker （假设是 4 ），然后使用轮询的方式给每个 broker 分配分区来确定首领分区的位置。于是，首领分区 0会在 broker 4 上，首领分区l 会在 broker 5 上，首领分区 2 会在 broker O 上（只有 6 个 broker ），并以此类推。")]),r._v(" "),v("p",[r._v("我们从分区首领开始，依次分配跟随者副本。如果分区 0 的首领在 broker 4 上，那么它的第一个跟随者副本会在 broker 5 上，第二个跟随者副本会在 broker O 上。分区 1 的首领在broker 5 上，那么它的第一个跟随者副本在 broker 0 上，第二个跟随者副本在 broker 1 上。")]),r._v(" "),v("p",[r._v("如果配置了机架信息，那么就不是按照数字顺序来选择 broker 了，而是按照交替机架的方式来选择 broker 。")]),r._v(" "),v("p",[v("strong",[r._v("为分区和1 副本选好合适的 broker 之后，接下来要决定这些分区应该使用哪个目录")]),r._v("。我们单独为每个分区分配目录，"),v("strong",[r._v("规则很简单 ： 计算每个目录里的分区数量，新的分区总是被添加到数量最小的那个目录里")]),r._v("。")]),r._v(" "),v("p",[r._v("也就是说，如果添加了一个新磁盘，所有新的分区都会被创建到这个磁盘上。因为在完成分配工作之前，新磁盘的分区数量总是最少的。")]),r._v(" "),v("h3",{attrs:{id:"文件管理"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#文件管理"}},[r._v("#")]),r._v(" 文件管理")]),r._v(" "),v("p",[r._v("保留数据是 Kafka 的一个基本特性， Kafka 不会一直保留数据，也不会等到所有消费者都读取了消息之后才删除消息。相反， Kafka 管理员为每个主题配置了数据保留期限，规定数据被删除之前可以保留多长时间，或者清理数据之前可以保留的数据量大小。")]),r._v(" "),v("p",[v("strong",[r._v("因为在一个大文件里查找和删除消息是很费时的，也很容易出错，所以我们把分区分成若干个片段")]),r._v("。 默认情况下，每个片段包含 1GB或一周的数据，以较小的那个为准。在 broker往分区写入数据时，如果达到片段上限，就关闭当前文件，井打开一个新文件。")]),r._v(" "),v("p",[r._v("当前正在写入数据的片段叫作 "),v("strong",[r._v("活跃片段")]),r._v("。")]),r._v(" "),v("p",[r._v("broker 会为分区里的每个片段打开一个文件句柄，哪怕片段是不活跃的 。 这样会导致打开过多的文件句柄，所以操作系统必须根据实际情况做一些调优。")]),r._v(" "),v("h3",{attrs:{id:"文件格式"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#文件格式"}},[r._v("#")]),r._v(" 文件格式")]),r._v(" "),v("p",[r._v("Kafka 的消息和偏移量保存在文件里。保存在磁盘上的数据格式与从生产者发送过来或者发送给消费者的悄息格式是一样的。因为使用了相同的消息格式进行磁盘存储和网络传输 ， Kafka 可以使用零复制技术给消费者发送消息，同时避免了对生产者已经压缩过的消息进行解压和再压缩。")]),r._v(" "),v("p",[r._v("除了键、值和偏移量外， 1肖息里还包含了消息大小、校验和、消息格式版本号、压缩算能(Snappy 、 GZip 或 LZ4 ）和时间戳（在 0.10.0 版本里引入的）。时间戳可以是生产者发送消息的时间，也可以是消息到达 broker 的时间，这个是可配置的。")]),r._v(" "),v("p",[r._v("如果生产者发送的是压缩过的消息，那么同一个批次的消息会被压缩在一起，被当作“"),v("strong",[r._v("包装消息")]),r._v("”进行发送。于是 ， broker 就会收到一个这样的消息，然后再把它发应给消费者。消费者在解压这个消息之后，会看到整个批次的消息，它们都有自己的时间戳和偏移量。")]),r._v(" "),v("p",[v("img",{attrs:{src:"https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202203151358903.png",alt:"image-20220315135812711"}})]),r._v(" "),v("p",[r._v("也就是说，"),v("strong",[r._v("如果在生产者端使用了压缩功能（极力推荐），那么发送的批次越大，就意味着在网络传输和磁盘存储方面会获得越好的压缩性能，同时意味着如果修改了消费者使用的消息格式")]),r._v("。")]),r._v(" "),v("h3",{attrs:{id:"索引"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#索引"}},[r._v("#")]),r._v(" 索引")]),r._v(" "),v("p",[r._v("消费者可以从 Kafka 的任意可用偏移量位置开始读取消息。")]),r._v(" "),v("p",[r._v("为了帮助 broker 更快地定位到指定的偏移量， "),v("strong",[r._v("Kafka为每个分区维护了一个索引。索引把偏移量映射到片段文件和偏移量在文件里的位置")]),r._v("。")]),r._v(" "),v("p",[r._v("索引也被分成片段，所以在删除消息时，也可以删除相应的索引 。 Kafka 不维护索引的校验和。"),v("strong",[r._v("如果索引出现损坏， Kafka 会通过重新读取消息并录制偏移量和位置来重新生成索引")]),r._v("。")]),r._v(" "),v("h3",{attrs:{id:"清理"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#清理"}},[r._v("#")]),r._v(" 清理")]),r._v(" "),v("p",[r._v("一般情况下， Kafka 会根据设置的时间保留数据，把超过时效的旧数据删除掉。")]),r._v(" "),v("p",[r._v("每个日志片段可以分为以下两个部分：")]),r._v(" "),v("ul",[v("li",[v("p",[r._v("干净的部分：这些消息之前被清理过，每个键只有一个对应的值，这个值是上一次清理时保留下来的。")])]),r._v(" "),v("li",[v("p",[r._v("污浊的部分：这些消息是在上一次清理之后写入的。")])])]),r._v(" "),v("p",[v("img",{attrs:{src:"https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202203151402806.png",alt:"包主干净和活浊两个部分的分区"}})]),r._v(" "),v("p",[r._v("如果在 Kafka 启动时启用了清理功能（通过配置 log.cleaner.enabled 参数），每个 broker会启动一个"),v("strong",[r._v("清理管理器线程")]),r._v("和多个"),v("strong",[r._v("清理线程")]),r._v("，它们负责执行清理任务。这些线程会选择污浊率（污浊消息占分区总大小的比例）较高的分区进行清理。")]),r._v(" "),v("p",[r._v("为了清理分区 ，情理线程会读取分区的污浊部分，井在内存里创建一个 map 。 map 里的每个元素包含了消息键的散列值和消息的偏移量，键的散列值是 16B ，加上偏移量总共是24B 。")]),r._v(" "),v("p",[r._v("如果要清理一个 lGB 的日志片段，并假设每个消息大小为 1 KB，那么这个片段就包含一百万个悄息，而我们只需要用 24MB 的 map 就可以清理这个片段。（如果有重复的键，可以重用散列项，从而使用更少的内存。）这是非常高效的！")]),r._v(" "),v("p",[r._v("管理员在配置 Kafka 时可以对 map 使用的内存大小进行配置。每个线程都有自己的 map,而这个参数指的是所有线程可使用的内存总大小。如果你为 map 分配了 1GB 内存，并使用了 5 个清理线程，那么每个钱程可以使用 200MB 内存来创建自己的 map 。")]),r._v(" "),v("p",[r._v("清理过程：")]),r._v(" "),v("ul",[v("li",[v("p",[r._v("清理线程在创建好偏移盐 map 后，开始从干净的片段处读取消息，从最旧的消息开始，把它们的内容与 map 里的内容进行比对。")])]),r._v(" "),v("li",[v("p",[r._v("它会检查消息的键是否存在于 map 中，如果不存在，那么说明消息的值是最新的，就把消息复制到替换片段上。 如果键已存在，消息会被忽略，因为在分区的后部已经有一个具有相同键的消息存在。")])]),r._v(" "),v("li",[v("p",[r._v("在复制完所有的消息之后，我们就将替换片段与原始片段进行交换，然后开始清理下一个片段。")])]),r._v(" "),v("li",[v("p",[r._v("完成整个清理过程之后，每个键对应一个不同的消息一寸主些消息的值都是最新的。")])])]),r._v(" "),v("p",[v("img",{attrs:{src:"https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202203151408901.png",alt:"image-20220315140846442"}})]),r._v(" "),v("h3",{attrs:{id:"被删除事件"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#被删除事件"}},[r._v("#")]),r._v(" 被删除事件")]),r._v(" "),v("p",[v("strong",[r._v("如果只为每个键保留最近的一个消息，那么当需要删除某个特定键所对应的所有消息时 ，我们该怎么办？")])]),r._v(" "),v("p",[r._v("这种情况是有可能发生的，比如一个用户不再使用我们的服务，那么完全可以把与这个用户相关的所有信息从系统中删除。")]),r._v(" "),v("p",[v("strong",[r._v("为了彻底把一个键从系统里删除，应用程序必须发送一个包含该键且值为 null 的消息")]),r._v("。清理线程发现该消息时，会先进行常规的清理，只保留值为 null 的消息。该**消息（被称为墓碑消息）**会被保留一段时间，时间长短是可配置的。在这期间，消费者可以看到这个基碑消息，井且发现它的值已经被删除。")]),r._v(" "),v("p",[r._v("于是，如果消费者往数据库里复制 Kafka 的数据， 当它看到这个墓碑消息时，就知道应该要把相关的用户信息从数据库里删除。在这个时间 段过后，清理线程会移除这个墓碑消息，这个键也将从 Kafka 分区里消失。重要的是，要留给消费者足够多的时间，让他看到墓碑消息，因为如果消费者离线几个小时并错过了墓碑消息，就看不到这个键，也就不知道它已经从 Kafka 里删除，从而也就不会去删除数据库里的相关数据了。")])])}),[],!1,null,null,null);v.default=o.exports}}]);