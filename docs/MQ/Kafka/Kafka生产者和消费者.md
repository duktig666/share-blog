---
title: Kafka基础
date: 2022-03-07 
publish: false
---

## Kafka生产者

一个应用程序在很多情况下需要往 Kafka 写入消息 ： 记录用户的活动（用于审计和分析）、记录度量指标、保存日志消息、记录智能家电的信息、与其他应用程序进行异步通信、 缓冲即将写入到数据库的数据，等等。

多样的使用场景意味着多样的需求：**是否每个消息都很重要？是否允许丢失一小部分消息？偶尔出现重复消息是否可以接受？是否有严格的延迟和吞吐量要求？**

不同的使用场景对生产者 API 的使用和配置会有直接的影响。

### 向Kafka发送消息的步骤

![image-20220310153515464](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202203101535042.png)

从创建一个 **ProducerRecord** 对象开始， ProducerRecord 对象需要包含 **目标主题** 和 **要发送的内容**。我们还可以 **指定键或分区**。在发送 ProducerRecord 对象时，生产者要先把键和值对象 **序列化成字节数组**，这样它们才能够在网络上传输。

接下来，数据被传给分区器。如果之前在 ProducerRecord  对象里指定了分区，那么分区器就不会再做任何事情，直接把指定的分区返回。如果没有指定分区 ，那么分区器会根据ProducerRecord  对象的键来选择一个分区 。选好分区以后 ，生产者就知道该往哪个主题和分区发送这条记录了。

**这条记录被添加到一个记录批次里，这个批次里的所有消息会被发送到相同的主题和分区上**。有一个独立的线程负责把这些记录批次发送到相应的 broker 上。

服务器在收到这些消息时会返回一个响应。如果消息成 功写入 Kafka ，就返回 一 个**RecordMetaData** 对象，**它包含了主题和分区信息，以及记录在分区里的偏移量**。如果写入失败， 则会返回 一个错误。**生产者在收到错误之后会尝试重新发送消息，几次之后如果还是失败， 就返回错误信息**。

创建生产者：

```java
private Prpperties kafkaProps = new Properties();
kafkaProps.put( "bootstrap.servers"，"broker1:9092,broker2:9092");
kafkaProps.put( "key.serializer","org.apache.kafka.connon.serialization.StringSerializer");
kafkaProps.put( "value.serializer","org.apache.kafka.common.serialization.StringSerializer");
producer = new KafkaProducer<String,String>(kafkaProps);
```



### 生产者发送消息

生产者发送消息主要有以下 3 种方式：

**1、发送并忘记**

把消息发送给服务器，但井不关心它是否正常到达。大多数情况下，消息会正常到达，因为 Kafka 是高可用的，而且生产者会自动尝试重发。不过，使用这种方式有时候也会丢失一些消息。

```java
ProducerRecord<String,String; record =
    new ProducerRecord<>( "CustonerCountry" , "Precision Products","France");

try {
    producer.send(record); 
}catch (Exception e) {
    e.printStackTrace(); 
}
```

我们使用生产者的send()方法发送ProducerRecord对象。

从生产者的架构图里可以看到，**消息先是被放进缓冲区，然后使用单独的线程发送到服务器端**。

send()方法会返回一个包含`RecordMetadata`的 `Future`对象，**不过因为我们会忽略返回值，所以无法知道消息是否发送成功**。

**如果不关心发送结果，那么可以使用这种发送方式**。比如，记录Twitter消息日志，或记录不太重要的应用程序日志。

在发送消息之前，生产者还是有可能发生其他的异常。这些异常有可能是 SerializationException（说明序列化消息失败）、 BufferExhaustedException 或 TimeoutException （说明缓冲区已满），又或者是 InterruptException （说明发送线程被中断）。

**2、同步发送**

使用 `send()` 方怯发送消息 ， 它会返回一个 `Future对象`，调用 `get()` 方法进行等待 ，就可以知道悄息是否发送成功。

```java
producer.send(record).get();
```

在这里，producer.send()方法先返回一个Future对象，然后调用Future对象的get()方法等待Kafka响应。如果服务器返回错误，get()方法会抛出异常。如果没有发生错误，我们会得到一个 RecordMetadata对象，可以用它获取消息的偏移量。

KafkaProducer一般会发生两类错误：

- 其中一类是**可重试错误**，这类错误可以通过重发消息来解决。
  - 比如对于连接错误，可以通过再次建立连接来解决，
  - “无主(no leader)”错误则可以通过重新为分区选举首领来解决。
  - KafkaProducer可以被配置成自动重试，如果在多次重试后仍无法解决问题，应用程序会收到一个重试异常。

- 另一类错误无法通过重试解决，比如“消息大大”异常。对干这类错误，KafkaProducer不会进行任何重试，直接抛出异常。

**3、异步发送**

调用 `send()` 方怯，并指定一个回调函数， 服务器在返回响应时调用该函数。

为了在异步发送消息的同时能够对异常情况进行处理，生产者提供了 **回调** 支持。

```java
private class DemoProducerCallback implenents Callback {
    @0verride
    public void onCompletion(RecordMetadata recordMetadata，Exception e) {
        if (e != null) {
            e.printStackTrace();
        }
    } 
}
ProducerRecord<String,String> record =
    new ProducerRecord<>("CustonerCountry","Bionedical Materials","USA");
producer.send(record，new DemoProducerCallback());
```



### 生产者配置

生产者还有很多可配置 的 参数，在 Kafka 文档里都有说明，它们大部分都有合理的默认值 ， 所以没有必要去修改它们 。不过有几个参数在内存使用、性能和可靠性方面对生产者影响比较大。

####  acks

acks 参数指定了 **必须要有多少个分区副本收到消息，生产者才会认为消息写入是成功的** 。这个参数对消息丢失的可能性有重要影响。主参数有如下选项：

- 如果 `acks=0` ， **生产者在成功写入悄息之前不会等待任何来自服务器的响应**。也就是说，如果当中出现了问题 ， 导致服务器没有收到消息，那么生产者就无从得知，消息也就丢失了。不过，因为生产者不需要等待服务器的响应，所以它可以以网络能够支持的最大速度发送消息，从而达到很高的吞吐量。
- 如果 `acks=1` ，**只要集群的首领节点收到消息，生产者就会收到一个来自服务器的成功响应**。如果一个没有收到消息的节点成为新首领，消息还是会丢失。
- 如果 `acks=all `，只有当所有参与复制的节点全部收到消息时，生产者才会收到一个来自服务器的成功响应。这种模式是最安全的，它可以保证不止一个服务器收到消息，就算有服务器发生崩溃，整个集群仍然可以运行

#### buffer.memory

该参数用来 **设置生产者内存缓冲区的大小**，**生产者用它缓冲要发送到服务器的消息**。

如果应用程序发送消息的速度超过发送到服务器的速度，会导致生产者空间不足。这个时候，`send()` 方法调用要么被阻塞，要么抛出异常， `max.block.ms`，表示在抛出异常之前可以阻塞一段时间。

####  compression.type

默认情况下，消息发送时不会被压缩。该参数可以设置为 snappy 、 gzip 或 lz4 ，它指定了 **消息被发送给 broker 之前使用哪一种压缩算也进行压缩**。 

snappy 压缩算法田 Google发明，它占用较少的CPU，却能提供较好的性能和相当可观的压缩比，如果比较关注性能和网络带宽，可以使用这种算法。

gzip压缩算法一般会占用较多的CPU，但会提供更高的压缩比，所以如果网络带宽比较有限，可以使用这种算法。使用压缩可以降低网络传输开销和存储开销，而这往往是向Kafka发送消息的瓶颈所在。

#### retries

生产者从服务器收到的错误有可能是临时性的错误（比如分区找不到首领）。在这种情况下， **retries 参数的值决定了生产者可以重发消息的次数，如果达到这个次数，生产者会放弃重试并返回错误**。

默认情况下，生产者会在每次重试之间等待 100ms ，不过可以通过`retry.backoff.ms` 参数来改变这个时间间隔。

建议在设置重试次数和重试时间间隔之前，先测试一下恢复一个崩愤节点需要多少时间（比如所有分区选举出首领需要多长时间），让总的重试时间比 Kafka 集群从崩愤中恢复的时间长，否则生产者会过早地放弃重试。

#### batch.size

当有多个消息需要被发送到同一个分区时，生产者会把它们放在同一个批次里。**该参数指定了一个批次可以使用的内存大小，按照字节数计算（而不是消息个数）**。

当批次被填满，批次里的所有消息会被发送出去。**不过生产者井不一定都会等到批次被填满才发送，半满的批次，甚至只包含一个消息的批次也有可能被发送。所以就算把批次大小设置得很大，也不会造成延迟，只是会占用更多的内存而已**。

**但如果设置得太小，因为生产者需要更频繁地发送消息，会增加一些额外的开销**。

#### linger.ms

该参数指定了 **生产者在发送批次之前等待更多消息加入批次的时间** 。 

 KafkaProducer 会在批次填满 或 linger.ms 达到上限时把批次发送出去。默认情况下，只要有可用的线程， 生产者就会把消息发送出去，就算批次里只有一个消息。

把 linger.ms 设置成比 0 大的数，让生产者在发送批次之前等待一会儿，使更多的消息加入到这个批次。虽然这样会增加延迟，但也会提升吞吐量（因为一次性发送更多的消息，每个消息的开销就变小了） 。

#### client.id 

该参数可以是任意的字符串，服务器会用它来识别消息的来橱，还可以用在日志和配额指标里。

#### max.in.flight.requests.per.connection

该参数指定了 **生产者在收到服务器晌应之前可以发送多少个消息**。

它的值越高，就会占用越多的内存，不过也会提升吞吐量。 **把它设为 1 可以保证消息是按照发送的顺序写入服务器的，即使发生了重试**。

#### timeout.ms 、 request.timeout.ms 和 metadata. fetch. timeout. ms

request.timeout.ms 指定了生产者在发送数据时等待服务器返回响应的时间

metadata. fetch. timeout. ms 指定了生产者在获取元数据（比如目标分区的首领是谁）时等待服务器返回响应的时间。如果等待响应超时，那么生产者要么重试发送数据，要么返回一个错误（抛出异常或执行回调）。

timeout.ms  指定了 bro ker 等待同步副本返回消息确认的时间，与 asks 的配置相匹配一一如果在指定时间内没有收到同步副本的确认，那么 broker 就会返回一个错误。

#### max.block.ms 

该参数指定了在调用 `send()`方法或使用 `partitionsFor() `方法能获取元数据时生产者的阻塞时间。

当生产者的发送缓冲区已满，或者没有可用的元数据时，这些方屈就会阻塞。在阻塞时间达到 max.block.ms 时，生产者会抛出超时异常。

#### max.request.size 

**该参数用于控制生产者发送的请求大小**。它可以指能发送的单个消息的最大值，也可以指单个请求里所有消息总的大小。

例如，假设这个值为 1MB ，那么可以发送的单个最大消息为 1MB ，或者生产者可以在单个请求里发送一个批次，该批次包含了 1000 个消息，每个消息大小为 1 阻。另外， broker 对可接收的消息最大值也有自己的限制（message. max. bytes），所以两边的配置最好可以匹配，避免生产者发送的消息被 broker 拒绝。

#### receive.buffer.bytes 和 send.buffer.bytes

这两个参数分别指定了 TCP socket 接收和发送数据包的缓冲区大小。 如果它们被设为 -1 ,就使用操作系统的默认值。

如果生产者或消费者与 broker 处于不同的数据中心，那么可以适当增大这些值，因为跨数据中心的网络一般都有比较高的延迟和比较低的带宽。

### 顺序保证

**Kafka 可以保证同一个分区里的消息是有序的**。

也就是说，如果生产者按照一定的顺序发送消息， broker 就会按照这个顺序把它们写入分区，消费者也会按照同样的顺序去读取它们。

在某些情况下 ， 顺序是非常重要的。例如，往一个账户存入 100 元再取出来，这个与先取钱再存钱是截然不同的！不过，有些场景对顺序不是很敏感。

**如果把 retries 设为非零整数，同时把 max.in.flight.requests.per.connection 设为比 1 大的数，那么，如果第一个批次消息写入失败，而第二个批次写入成功， broker 会重试写入第一个批次。如果此时第一个批次也写入成功，那么两个批次的顺序就反过来了。**

一般来说，如果某些场景要求消息是有序的，那么消息是否写入成功也是很关键的，所以不建议把 retries 设为 0 。可以把 max.in.flight.requests.per.connection 设为 1 ，这样在生产者尝试发送第一批悄息时，就不会有其他的消息发送给 broker 。不过这样会严重影响生产者的吞吐量 ，所以 只有在对消息的顺序有严格要求的情况下才能这么做。

### 分区

Kafka 的消息是一个个键值对，ProducerRecord 对象可以只包含目标主题和值，键可以设置为默认的 null ，不过大多数应用程序会用到键。

**键有两个用途 ：可以作为消息的附加信息，也可以用来决定消息该被写到主题的哪个分区。拥有相同键的悄息将被写到同 一个分区。** 

如果键值为 null ， 井且使用了默认的分区器，那么记录将被随机地发送到主题内各个可用的分区上。分区器使用轮询（Round Robin）算陆将消息均衡地分布到各个分区上。

如果键不为空，并且使用了默认的分区器，那么 Kafka 会对键进行散列（使用 Kafka 自己的散列算法，即使升级 Java 版本，散列值也不会发生变化），然后根据散列值把消息映射到特定的分区上。

**只有在不改变主题分区数量的情况下，键与分区之间的映射才能保持不变。一旦主题增加了新的分区，这些就无陆保证了。**

**如果要使用键来映射分区，那么最好在创建主题的时候就把分区规划好，而且永远不要增加新分区。**

## Kafka消费者

### 消费者相关的一些概念

#### 多消费者

**生产者往主题写入消息的速度超过了应用程序验证数据的速度，这个时候该怎么办？**

我们可以使用多个消费者从同一个主题读取消息，对消息进行分流。

Kafka 消费者从属于消费者群组。一个群组里的消费者订阅的是同－个主题，每个消费者接收主题一部分分区的消息。

假设主题 T1 有 4 个分区，我们创建了消费者 C1 ，它是群组 G1 里唯一的消费者，我们用它订阅主题 T1 。消费者 C1 将收到主题 T1 全部 4 个分区的消息。如图：

![image-20220312151955074](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202203121519019.png)

如果在群组 Gl 里新增一个消费者 C2 ，那么每个消费者将分别从两个分区接收消息。

![image-20220312152029457](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202203121520857.png)

如果群组 G I 有 4 个消费者，那么每个消费者可以分配到一个分区。

![image-20220312152054560](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202203121520858.png)

如果我们往群组里添加更多的消费者，超过主题的分区数量，那么有一部分消费者就会被闲置，不会接收到任何消息。

![image-20220312152123232](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202203121521798.png)

**不过要注意，不要让消费者的数量超过主题分区的数量，多余的消费者只会被闲置。**

#### 多消费者组

除了通过增加消费者来横向伸缩单个应用程序外，还**经常出现多个应用程序从同一个主题读取数据的情况**。

如果新增一个只包含一个消费者的群组 G2 ，那么这个消费者将从主题T1 上接收所有的消息，与群组 G1 之间互不影响。群组 G2 可以增加更多的消费者，每个消费者可以悄费若干个分区，就像群组 G1 那样。

![image-20220312152408501](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202203121524892.png)

**简而言之，为每一个需要获取一个或多个主题全部消息的应用程序创建一个消费者群组，然后往群组里添加消费者来伸缩读取能力和处理能力，群组里的每个消费者只处理一部分消息。**

#### 分区再均衡

群组里的消费者共同读取主题的分区。一个新的消费者加入群组时，它读取的是原本由其他消费者读取的消息。当一个消费者被关闭或发生崩溃时，它就离开群组，原本由它读取的分区将由群组里的其他消费者来读取。在主题发生变化时 ， 比如管理员添加了新的分区，会发生 **分区重分配**。

**分区的所有权从一个消费者转移到另一个消费者，这样的行为被称为 再均衡**。再均衡非常重要， 它为消费者群组带来了高可用性和伸缩性（我们可以放心地添加或移除梢费者），不过在正常情况下，我们并不希望发生这样的行为：

- 在再均衡期间，消费者无陆读取消息，造成整个群组一小段时间的不可用。
- 当分区被重新分配给另一个消费者时，消费者当前的读取状态会丢失，它有可能还需要去刷新缓存 ，在它重新恢复状态之前会拖慢应用程序。

**如何进行安全的再均衡，以及如何避免不必要的再均衡？**

**消费者通过向被指派为群组协调器的 broker 发送心跳来维持它们和群组的从属关系以及它们对分区的所有权关系**。具体：

- 只要消费者以正常的时间间隔发送心跳，就被认为是活跃的，说明它还在读取分区里的消息。消费者会在轮询消息（为了获取消息）或提交偏移量时发送心跳。
- 如果消费者停止发送心跳的时间足够长，会话就会过期，群组协调器认为它已经死亡，就会触发一次再均衡。
- 如果一个消费者发生崩溃，井停止读取消息，群组协调器会等待几秒钟，确认它死亡了才会触发再均衡。在这几秒钟时间里，死掉的消费者不会读取分区里的消息。在清理消费者时，消费者会通知协调器它将要离开群组，协调器会立即触发一次再均衡，尽量降低处理停顿。

#### 分配分区的过程

1. 当消费者要加入群组时，它会向群组协调器发送一个 Join Group 请求。第一个加入群组的消费者将成为“**群主**”。
2. 群主从协调器那里获得群组的成员列表（列表中包含了所有最近发送过心跳的消费者，它们被认为是活跃的），并负责给每一个悄费者分配分区。它使用一个实现了 `PartitionAssignor`  接口的类来决定哪些分区应该被分配给哪个消费者。
3. 分配完毕之后，群主把分配情况列表发送给群组协调器，协调器再把这些信息发送给所有消费者。
4. 每个消费者只能看到自己的分配信息，只有群主知道群组里所有消费者的分配信息。这个过程会在每次再均衡时重复发生。

### 消费者代码

#### 创建消费者

```java
Properties props = new Properties();
props.put( "bootstrap.servers", "broker1:9092,broker2:9092");props.put( "group.id" , "CountryCounter");
props.put( "key.deserializer" ,
"org.apache.kafka . common.serialization.StringDeserializer");props.put( "value.deserializer" ,
"org.apache.kafka.common.serialization.StringDeserializer");
KafkaConsuner<String,string> consuner = new KafkaConsurer<String,string>(props);
```

#### 订阅主题

```java
consumer.subscribe(Collections.singletonList("custonerCountries");
```

`subscribe()` 方法接受一个主题列表作为参数，我们也可以在调用 `subscribe()`  方法时传入一个正则表达式。

#### 轮询

消息轮询是消费者 API 的核心，通过一个简单的轮询向服务器请求数据。一旦消费者订阅了主题 ，轮询就会处理所有的细节，包括群组协调、分区再均衡、发送心跳和获取数据。

```java
try {
    while (true) { 
        ConsumerRecords<String, String> records = consurer.poll(100); 
        for (ConsumerRecord<String,String> record : records) {
            log.debug( "topic = %s，partition = %s，offset = %d ,custoner = %s ,
                      country = %s\n" ,
                      record.topic(),record.partition() , record.offset(),record.key(), record.value());
            int updatedCount = 1;
            if (custCountryMap.countainsValue(record.value())){
                updatedCount = custCountryMap.get(record.value()) + 1;
            }
            custCountryMap.put( record.value()，updatedCount)
                JSONObject json = new JSONObject(custCountryMap);
            Systen.out.println(json.toString(4));
        }
    }
} finally {
    consumer.close();
}
```

传给 `poll()`  方法的参数是一个超时时间，用于控制  `poll()` 方法的阻塞时间。

轮询不只是获取数据那么简单。在第一次调用新消费者的  `poll()` 方挂时，它会负责查找GroupCoordinator ， 然后加入群组，接受分配的分区。 如果发生了再均衡，整个过程也是在轮询期间进行的。当然 ，心跳也是从轮询里发迭出去的。所以，我们要确保在轮询期间所做的任何处理工作都应该尽快完成。

### 消费者配置

#### fetch.min.bytes 

该属性指定了 **消费者 从服务器获取记录的最小字节数**。 

如果小于，它会等到有足够的可用数据时才把它返回给消费者。

这样可以降低消费者和 broker 的工作负载，因为它们在主题不是很活跃的时候（或者一天里的低谷时段）就不需要来来回回地处理消息。

如果没有很多可用数据，但消费者的 CPU 使用率却很高，那么就需要把该属性的值设得比默认值大。如果消费者的数量比较多，把该属性的值设置得大一点可以降低 broker 的工作负载。

#### fetch.max.wait.ms

用于指定 broker 的等待时间，默认是 500ms 。

如果没有足够的数据流入Kafka ，消费者获取最小数据量的要求就得不到满足，最终导致 500ms 的延迟。 

####  max . partition . fetch. bytes 

指定了 **服务器从每个分区里返回给消费者的最大字节数**。它的默认值是 1MB 。

 max . partition . fetch. bytes  的值必须比 broker 能够接收的最大消息的字节数（通过 max.message.size 属性配置 ）大， 否则消费者可能无法读取这些消息，导致消费者一直挂起重试。

另一个需要考虑的因素是消费者处理数据的时间。 消费者需要频繁调用 `poll()` 方陆来避免会话过期和发生分区再均衡，如果单次调用 `poll()` 返回的数据太多，消费者需要更多的时间来处理，可能无怯及时进行下一个轮询来避免会话过期。如果出现这种情况， 可以把  max . partition . fetch. bytes  值改小 ，或者延长会话过期时间。

#### session.timeout.ms 

指定了**消费者在被认为死亡之前可以与服 务器断开连接的时间**，默认是 3s 。

如果消费者没有在 session.timeout.ms  指定的时间内发送心跳给群组协调器，就被认为已经死亡，协调器就会触发再均衡，把它的分区分配给群组里的其他消费者。

该属性与 heartbeat.interval.ms 紧密相关。 heartbeat.interval.ms 指定了 `poll()` 方法向协调 器发送心跳的频率， session.timeout.ms  则指定了消费者可以多久不发送心跳。

所以， 一般需要同时修改这两个属性， heartbeat.interval.ms 必须比 session.timeout.ms  小， 一般是 session.timeout.ms  的 三 分之 一。

把 session.timeout.ms  值设得比默认值小，可以更快地检测和恢复崩溃的节点，不过长时间的轮询或垃圾收集可能导致非预期的再均衡。把该属性的值设置得大一些，可以减少意外的再均衡 ，不过检测节点崩愤－需要更长的时间。

#### auto.offset.reset 

指定了消费者在读取一个没有偏移量的分区或者偏移量无效的情况下（因消费者长时间失效，包含偏移量的记录已经过时井被删除）该作何处理：

- 它的默认值是 latest ， 意思是说，在偏移量无效的情况下，消费者将从最新的记录开始读取数据（在消费者启动之后生成的记录）。
- 另一个值是 earliest ，意思是说，在偏移量无效的情况下 ，消费者将从起始位置读取分区的记录。

#### enable.auto.commit 

该属性指定了 **消费者是否自动提交偏移量**，默认值是 true 。

 **为了尽量避免出现重复数据和数据丢失，可以把它设为 false ，由自己控制何时提交偏移量**。

如果把它设为 true ，还可以通过配置 auto.commit.interval.ms 属性来控制提交的频率。

####  partition.assignment.strategy 

**`PartitionAssignor`  根据给定的消费者和主题，决定哪些分区应该被分配给哪个消费者**。 

Kafka 有两个默认的分配策略:

- Range ：该策略会把主题的若干个连续的分区分配给消费者。
- RoundRobin： 该策略把主题的所有分区逐个分配给消费者。

#### client.id

该属性可以是任意字符串 ， broker 用它来标识从客户端发送过来的消息，通常被用在日志、度量指标和配额里。

####  max.poll.records 

该属性用于控制单次调用 `call()` 方法能够返回的记录数量，可以帮你控制在轮询里需要处理的数据量。

#### receive.buffer.butes 和 send.buffer.bytes

socket 在读写数据时用到的 TCP 缓冲区也可以设置大小。如果它们被设为-1 ，就使用操作系统的默认值。如果生产者或消费者与 broker 处于不同的数据中心内，可以适当增大这些值，因为跨数据中心的网络一般都有比较高的延迟和比较低的带宽。



### 提交和偏移量

每次调用 poll() 方法，它总是返回由生产者写入 Kafka 但还没有被消费者读取过的记录 ，我们因此可以追踪到哪些记录是被群组里的哪个消费者读取的。

**Kafka不会像其他 JMS 队列那样需要得到消费者的确认**，这是 Kafka 的一个独特之处。相反，**消费者可以使用 Kafka 来追踪消息在分区里的位置（偏移量）**。

#### 如何提交偏移量？

**更新分区当前位置的操作叫作 提交** 。

**那么消费者是如何提交偏移量的呢？**

消费者往一个叫作 consumer_offset 的特殊主题发送消息，消息里包含每个分区的偏移量。 

如果消费者一直处于运行状态，那么偏移量就没有什么用处。

不过，如果消费者发生崩溃或者有新的消费者加入群组，就会 **触发再均衡**，完成再均衡之后，每个消费者可能分配到新的分区，而不是之前处理的那个。为了能够继续之前的工作，消费者需要读取每个分区最后一次提交的偏移量，然后从偏移量指定的地方继续处理。

**如果提交的偏移量小于客户端处理的最后一个消息的偏移量 ，那么处于两个偏移量之间的消息就会被重复处理**。

![image-20220312162433155](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202203121624841.png)

**如果提交的偏移量大于客户端处理的最后一个消息的偏移量，那么处于两个偏移量之间的消息将会丢失。**

![image-20220312162509281](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202203121625614.png)

所以，处理偏移量的方式对客户端会有很大的影响。

#### 自动提交

最简单的提交方式是让悄费者自动提交偏移量。如果 enable.auto.commit  被设为 true ，那么每5s，消费者会自动把从 poll() 方法接收到的最大偏移量提交上去。提交时间间隔由 auto.comit.interval.ms 控制，默认值是 5s 。

假设我们仍然使用默认的 5s 提交时间间隔，在最近一次提交之后的 3s 发生了再均衡，再均衡之后，消费者从最后一次提交的偏移量位置开始读取消息。这个时候偏移量已经落后了 3s ，所以在这 3s 内到达的消息会被重复处理。

**自动提交虽然方便 ， 不过并没有为开发者留有余地来避免重复处理消息**。

#### 提交当前偏移量

大部分开发者通过控制偏移量提交时间来消除丢失消息的可能性，井在发生再均衡时减少重复消息的数量。

把 auto.offset.reset  设为 false ，让应用程序决定何时提交偏移量。使用 `commitSync()` 提交偏移量最简单也最可靠。这个 A PI 会提交由 poll() 方能返回 的 最新偏移量，提交成功后马上返回，如果提交失败就抛出异常。

要记住，  `commitSync()`  将会提交由 poll() 返回的最新偏移量 ， 所以在处理完所有记录后要确保调用了  `commitSync()` ，否则还是会有丢失消息的风险。如果发生了再均衡，从最近一批消息到发生再均衡之间的所有消息都将被重复处理。

```java{9}
while (true) {
    ConsunerRecords<String，String> records = consuner.poll(100);
    for (ConsumerRecord<String,String> record : records){
        Systen.out.printf( "topic = %s ， partition = %s ,offset =%d , customer = %s, country = %s\n" ,
                          record.topic(), record.partition(),
                          record.offset(),record.key(), record.value());
    }
    try {
        consumer.commitSync(O); 
    }catch (CommitFailedException e) {
        log.error( "commit failed" , e);
    }
}
```

**只要没有发生不可恢复的错误，  `commitSync()` 方法会一直尝试直至提交成功。如果提交失败 ， 我们也只能把异常记录到错误日志里**。

#### 异步提交

手动提交有一个不足之处，在 bro ker 对提交请求作出回应之前，应用程序会一直阻塞，这样会限制应用程序的吞吐量。

这个时候可以使用 **异步提交 API** 。我们只管发送提交请求，无需等待 broker 的响应。

```java{10}
while (true) {
    ConsumerRecords<String, String> records = consumer . poll(100);
    for (ConsumerRecord<String, String> record : records){
        System. out . printf("topic = %s, partition = %s,
                             offset = %d, customer = %s，country = %s\n" ，
                             record. topic()，record. partition(), record.offset(), 
                             record.key(), record.value());
    }
    consumer.commitAsync( );
}
```

在成功提交或碰到无怯恢复的错误之前，  `commitSync()` 会一直重试，但是   `commitAsync()` 不会，这也是   `commitAsync()`  不好的一个地方。

它之所以不进行重试，是因为在它收到服务器 响应的时候，**可能有一个更大的偏移量 已经提交成功**。

假设我们发出 一个请求用于提交偏移量 2000 ，这个时候发生了短暂的通信问题 ，服务器收不到请求，自然也不会作出任何响应。与此同时，我们处理了另外一批消息，并成功提交了偏移量 3000 。如果 `commitAsync()`  重新尝试提交偏移量 2000 ，它有可能在偏移量 3000 之后提交成功。**这个时候如果发生再均衡，就会出现重复消息**。

**之所以提到这个问题的复杂性和提交顺序的重要性，是因为 commitAsync()也支持因调，在 broker 作出响应时会执行回调。回调经常被用于记录提交错误或生成度量指标， 不过如果你要用它来进行重试， 一定要注意提交的顺序。**

```java{9~15}
while (true) {
    ConsumerRecords<String, String> records = consumer . poll(100);
    for (ConsumerRecord<String, String> record : records) {
        System. out. printf("topic = %s, partition = %s,
                            offset = %d，customer = %s，country = %s\n",
                            record. topic()，record. partition(), record. offset(),
                            record.key(), record. value());
    }
    consumer。commi tAsync( new offsetCommitCallback() {
        public void onComplete(Map<TopicPartition,
                               0ffse tAndMetadata> offsets， Exception e) {
            if (e ! null)
                log. error("Commit failed for offsets {]}", offsets, e);
        }
    });
}
```

#### 重试异步提交

我们可以 **使用一个单调递增的序列号来维护异步提交的顺序**。

**在每次提交偏移量之后或在回调里提交偏移量时递增序列号**。

在进行重试前，先检查回调的序列号和即将提交的偏移量是否相等，如果相等，说明没有新的提交，那么可以安全地进行重试。**如果序列号比较大，说明有一个新的提交已经发送出去了，应该停止重试**。

#### 同步和异步组合提交

→般情况下，针对偶尔出现的提交失败，不进行重试不会有太大问题，因为如果提交失败是因为 **临时问题** 导致的，那么后续的提交总会有成功的。**但如果这是发生在关闭消费者或再均衡前的最后一次提交，就要确保能够提交成功**。

因 此，在消费者关闭前一般会组合使用 `commitAsync()` 和  `commitSync()` 。

```java
try {
    while (true) {
        ConsumerRecords<String，String> records = consumer . poll(100); 
        for (ConsumerRecord<String, String> record : records) {
            System. out . println("topic = %s, partition = %s，offset = %d,
                                  customer = %s, country = %s\n",
                                  record. topic(), record. partition(),
                                  record.offset()，record.key(), record. value());
        }
        consumer . commitAsync();
    }
} catch (Exception e) {
    log . error("Unexpected error", e);
} finally {
    try {
        consumer .commitSync();
    } finally {
        consumer .close();
    }
}
```

如果一切正常，我们使用 `commitAsync()` 方陆来提交。这样速度更快，而且即使这次提交失败，下一次提交很可能会成功。

如果直接关闭消费者，就没有所谓的“下一次提交”了。使用  `commitSync()`方也会一直重i式，直到提交成功或发生无陆恢复的错误。

#### 提交特定的偏移量

**提交偏移量的频率与处理消息批次的频率是一样的。但如果想要更频繁地提交出怎么办？**

如果 `poll()`  方告返回一大批数据，为了避免因再均衡引起的重复处理整批消息，想要在批次中间提交偏移韭该怎么办？这种情况无法通过调用  `commitAsync()` 和  `commitSync()` 来实现，因为它们只会提交最后一个偏移量，而此时该批次里的消息还没有处理完。

消费者 API 允许在调用 `commitAsync()` 和  `commitSync()` 时传进去希望提交的分区和偏移量的 map 。假设你处理了半个批次的消息 ， 最后一个来自主题“customers ”分区 3 的消息的偏移量是 5000 ， 你可以调用   `commitSync()`  方法来提交它。不过，因为消
费者可能不只读取一个分区， 你需要跟踪所有分区的偏移量，所以在这个层面上控制偏移量的提交会让代码变复杂。

我们决定每处理 1000 条记录就提交一次偏移量：

```java
private Map<TopicPartition, OffsetAndMetadata> currentoffsets =
    new HashMap<>(); 
int count = 0;

while (true) {
    ConsumerRecords<String, String> records = consumer . poll(100);
    for (ConsunerRecord<String, String> record : records)
    {
        Systen. out.printf("topic = %s，partition = %s，offset = %d,
                           customer = %S，country = %s\n",
                           record. topic(), record. partition()，record. offset(),
                           record. key()，record.value()); 
        currentOffsets. put(new TopicPartition(record. topic(),
                                               record. partition()), new
                            OffsetAndMetadata(record. offset()+1, "no metadata")); 
        if(count%1000=0)
            consumer . commi tAsync(current0ffsets ,null);
        count++;
    }
}
```



### 再均衡监昕器

消费者在退出和进行分区再均衡之前，会做一些清理工作。

**你会在消费者失去对一个分区的所有权之前提交最后一个已处理记录的偏移量。如果消费者准备了一个缓冲区用于处理偶发的事件，那么在失去分区所有权之前， 需要处理在缓冲区累积下来的记录。你可能还需要关闭文件句柄、数据库连接等。**

在为消 费者分配新分区或移除旧分区 时，可以通过消 费者 API 执行 一 些应用程序代码，在调用 `subscribe()` 方法时传进去 一 个 ConsumerRebalanceListener 实例就可以了，ConsumerRebalanceListener 有两个需要实现的方法：

- `onPartitionsRevoked`：**会在再均衡开始之前和消费者停止读取消息之后被调用**。如果在这里提交偏移量，下一个接管分区的消费者就知道该从哪里开始读取了。
- `onPartitionsAssigned`：**会在重新分配分区之后和消费者开始读取消息之前被调用**。

### 从特定偏移量处开始处理记录

如果你想从分区的起始位置开始读取消息，或者直接跳到分区的末尾开始读取消息， 可以使用  `seekToBeginning` 和 `seekToEnd` 
这两个方法。

Kafka 也为我们提供了用于查找特定偏移量的 API 。 它有很多用途，比如向后回退几个消息或者向前跳过几个消息（对时间比较敏感的应用程序在处理滞后的情况下希望能够向前跳过若干个消息）。

### 如何退出

如果确定要退出循环，需要通过另 一个线程调用 `consulmer.wakeup()` 方法。如果循环运行在主线程里，可以在 `ShutdownHook` 里调用该方法。

记住，  `consulmer.wakeup()` 方法是消费者唯一一个可以从其他线程里安全调用 的方法。

调用 `consulmer.wakeup()` 方法 可以退出 `poll()` ,并抛出 `WakeupException` 异常，或者如果调用`consulmer.wakeup()`  时线程没有等待轮询， 那么异常将在下一轮调用  `poll()` 时抛出。我们不需要处理  `WakeupException`  ，因为它只是用于跳出循环的一种方式。

不过 ， 在退出线程之前调用`consulmer.close()` 是很有必要的， 它会提交任何还没有提交的东西 ， 并向群组协调器发送消息，告知自己要离开群组，接下来就会触发再均衡 ，而不需要等待会话超时。

#### 独立消费者——为什么以及怎样使用没有群组的消费者

有时候你需要一些更简单的东西。 比如 ，你可能只需要一个消费者从一个主题的所有分区或者某个特定的分区读取数据。这个时候就不需要消费者群组和再均衡了， 只需要把主题或者分区分配给消费者，然后开始读取消息井提交偏移量。

如果是这样的话，就不需要订阅主题， 取而代之的是为自己分配分区。 **一个消费者可以订阅主题（井加入消费者群组），或者为自己分配分区 ， 但不能同时做这两件事情**。

















