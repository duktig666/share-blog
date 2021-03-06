---
title: MySQL主从复制和分表分库原理 
date: 2022-01-21 
sidebar: auto 
publish: false
---

## 主从复制和读写分离

### 为什么使用主从复制和读写分离？

主从复制、读写分离一般是一起使用的。目的很简单，就是**为了提高数据库的并发性能**。

假设是单机，读写都在一台MySQL上面完成，性能肯定不高。如果有三台MySQL，一台mater只负责写操作，两台salve只负责读操作，性能不就能大大提高了。

随着业务量的扩展、如果是单机部署的MySQL，会导致I/O频率过高。采用**主从复制、读写分离可以提高数据库的可用性**。

### 主从复制的原理

①当Master节点进行`insert`、`update`、`delete`操作时，会按顺序写入到binlog中。

②salve从库连接master主库，Master有多少个slave就会创建多少个binlog dump线程。

③当Mas00

ter节点的binlog发生变化时，binlog dump 线程会通知所有的salve节点，并将相应的binlog内容推送给slave节点。

④I/O线程接收到 binlog 内容后，将内容写入到本地的 relay-log。

⑤SQL线程读取I/O线程写入的relay-log，并且根据 relay-log 的内容对从数据库做对应的操作。

![主从复制流程](https://gitee.com/koala010/typora/raw/master/img/20210702153628.png)

### 如何实现主从复制？

用三台虚拟机(Linux)演示，IP分别是104(Master)，106(Slave)，107(Slave)，预期效果如下图所示

![主从复制效果](https://gitee.com/koala010/typora/raw/master/img/20210702155210.png)

#### Master配置

1、配置用户允许从节点的IP进行访问

```sql
//192.168.0.106是slave从机的IP
GRANT REPLICATION SLAVE ON *.* to 'root'@'192.168.0.106' identified by 'Java@1234';
//192.168.0.107是slave从机的IP
GRANT REPLICATION SLAVE ON *.* to 'root'@'192.168.0.107' identified by 'Java@1234';
//刷新系统权限表的配置
FLUSH PRIVILEGES;
```

2、开启binlog，配置需要同步的数据库（不配置则同步全部数据库）和binlog日志的保留天数（过大可能导致磁盘空间不足）

找到mysql的配置文件`/etc/my.cnf`，增加以下配置：

```sql
#
开启binlog
log-bin=mysql-bin
server-id=104
# 需要同步的数据库
，如果不配置则同步全部数据库
binlog-do-db=test_db
# binlog日志保留的天数
，清除超过10天的日志
# 防止日志文件过大
，导致磁盘空间不足
expire-logs-days=10 
```

配置完成后，重启mysql：

```text
service mysql restart
```

可以通过命令行`show master status\G;`查看当前binlog日志的信息(后面有用)：

![image-20210702155340610](https://gitee.com/koala010/typora/raw/master/img/20210702155340.png)

#### Slave配置

`/etc/my.cnf`配置文件，增加以下配置：

```sql
#
不要和其他mysql服务id重复即可
server-id=106
```

登录后进行相关命令配置：

```sql
CHANGE
MASTER TO 
MASTER_HOST='192.168.0.104',//主机IP
MASTER_USER='root',//之前创建的用户账号
MASTER_PASSWORD='Java@1234',//之前创建的用户密码
MASTER_LOG_FILE='mysql-bin.000001',//master主机的binlog日志名称
MASTER_LOG_POS=862,//binlog日志偏移量
master_port=3306;
//端口
```

设置完之后需要启动：

```sql
#
启动slave服务
start slave;
```

启动完之后怎么校验是否启动成功呢？使用以下命令：

```text
show slave status\G;
```

可以看到如下信息（摘取部分关键信息）：

```sql
*
************************** 1. row ***************************
               Slave_IO_State: Waiting for master to send event
                  Master_Host: 192.168.0.104
                  Master_User: root
                  Master_Port: 3306
                Connect_Retry: 60
              Master_Log_File: mysql-bin.000001
          Read_Master_Log_Pos: 619
               Relay_Log_File: mysqld-relay-bin.000001
                Relay_Log_Pos: 782
        Relay_Master_Log_File: mysql-bin.000001 //binlog日志文件名称
             Slave_IO_Running: Yes //Slave_IO线程
、SQL线程都在运行
            Slave_SQL_Running: Yes
             Master_Server_Id: 104 //master主机的服务id
                  Master_UUID: 0ab6b3a6-e21d-11ea-aaa3-080027f8d623
             Master_Info_File: /var/lib/mysql/master.info
                    SQL_Delay: 0
          SQL_Remaining_Delay: NULL
      Slave_SQL_Running_State: Slave has read all relay log; waiting for
the slave I/O thread to update it
           Master_Retry_Count: 86400
                Auto_Position: 0
```

另一台slave从机配置一样，不再赘述。

#### 测试主从复制

在master主机执行sql：

```sql
CREATE TABLE `tb_commodity_info`
(
    `id`              varchar(32) NOT NULL,
    `commodity_name`  varchar(512)  DEFAULT NULL COMMENT '商品名称',
    `commodity_price` varchar(36)   DEFAULT '0' COMMENT '商品价格',
    `number`          int(10) DEFAULT '0' COMMENT '商品数量',
    `description`     varchar(2048) DEFAULT '' COMMENT '商品描述',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品信息表';
```

接着我们可以看到两台slave从机同步也创建了商品信息表，主从复制就完成了！

### 如何实现读写分离？

主从复制完成后，我们还需要实现读写分离，master负责写入数据，两台slave负责读取数据。

使用ShardingSphere-JDBC

#### 缺点

尽管主从复制、读写分离能很大程度保证MySQL服务的高可用和提高整体性能，但是问题也不少：

- **从机是通过binlog日志从master同步数据的，如果在网络延迟的情况，从机就会出现数据延迟。那么就有可能出现master写入数据后，slave读取数据不一定能马上读出来**。

可能有人会问，有没有事务问题呢？

实际上这个框架已经想到了，我们看回之前的那个截图，有一句话是这样的：

![image-20210702161523262](https://gitee.com/koala010/typora/raw/master/img/20210702161523.png)

参看：[MySQL主从复制读写分离，看这篇就够了！](https://zhuanlan.zhihu.com/p/199217698)

### 如何解决 MySQL 主从同步的延时和数据丢失问题？

**问题1：主从同步延时**

这里有一个非常重要的一点，就是从库同步主库数据的过程是串行化的，也就是说主库上并行的操作，在从库上会串行执行。所以这就是一个非常重要的点了，由于从库从主库拷贝日志以及串行执行 SQL
的特点，在高并发场景下，从库的数据一定会比主库慢一些，是**有延时**的。所以经常出现，刚写入主库的数据可能是读不到的，要过几十毫秒，甚至几百毫秒才能读取到。

解决：**并行复制**

> **并行复制**，指的是从库开启多个线程，并行读取 relay log 中不同库的日志，然后**并行重放不同库的日志**，这是库级别的并行。

**问题2：主库宕机，数据丢失**

如果主库突然宕机，然后恰好数据还没同步到从库，那么有些数据可能在从库上是没有的，有些数据可能就丢失了。

解决：**半同步复制**

> **半同步复制**，也叫`semi-sync`复制，指的就是主库写入 binlog 日志之后，就会将**强制**此时立即将数据同步到从库，从库将日志写入自己本地的 relay log 之后，接着会返回一个 ack 给主库，主库接收到**至少一个从库**的 ack 之后才会认为写操作完成了。

**MySQL 主从同步延时问题（精华）**

以前线上确实处理过因为主从同步延时问题而导致的线上的 bug，属于小型的生产事故。

是这个么场景。有个同学是这样写代码逻辑的。先插入一条数据，再把它查出来，然后更新这条数据。在生产环境高峰期，写并发达到了
2000/s，这个时候，主从复制延时大概是在小几十毫秒。线上会发现，每天总有那么一些数据，我们期望更新一些重要的数据状态，但在高峰期时候却没更新。用户跟客服反馈，而客服就会反馈给我们。

我们通过 MySQL 命令：

```text
show status
```

查看 `Seconds_Behind_Master`，可以看到从库复制主库的数据落后了几 ms。

一般来说，如果主从延迟较为严重，有以下解决方案：

- 分库，将一个主库拆分为多个主库，每个主库的写并发就减少了几倍，此时主从延迟可以忽略不计。
- 打开 MySQL 支持的并行复制，多个库并行复制。如果说某个库的写入并发就是特别高，单库写并发达到了 2000/s，并行复制还是没意义。
- 重写代码，写代码的同学，要慎重，插入数据时立马查询可能查不到。
- 如果确实是存在必须先插入，立马要求就查询到，然后立马就要反过来执行一些操作，对这个查询**设置直连主库**。**不推荐**这种方法，你这么搞导致读写分离的意义就丧失了。

参考：[如何实现 MySQL 的读写分离？如何解决 MySQL 主从同步的延时问题？](https://zhuanlan.zhihu.com/p/60455737)

## 分表分库

### 数据库的瓶颈问题

不管是IO瓶颈，还是CPU瓶颈，最终都会导致数据库的活跃连接数增加，进而逼近甚至达到数据库可承载活跃连接数的阈值。在业务Service来看就是，可用数据库连接少甚至无连接可用。接下来就可以想象了吧（并发量、吞吐量、崩溃）。

#### IO瓶颈

第一种：磁盘读IO瓶颈，热点数据太多，数据库缓存放不下，每次查询时会产生大量的IO，降低查询速度 -> **分库和垂直分表**。

第二种：网络IO瓶颈，请求的数据太多，网络带宽不够 -> **分库**。

#### CPU瓶颈

第一种：SQL问题，如SQL中包含join，group by，order by，非索引字段条件查询等，增加CPU运算的操作 -> SQL优化，建立合适的索引，在业务Service层进行业务计算。

第二种：单表数据量太大，查询时扫描的行太多，SQL效率低，CPU率先出现瓶颈 -> **水平分表**。

### 水平分表原理

以**字段**为依据，按照一定策略（hash、range等），将一个**表**中的数据拆分到多个**表**中。

结果：

- 每个**表**的**结构**都一样；
- 每个**表**的**数据**都不一样，没有交集；
- 所有**表**的**并集**是全量数据；

使用场景：系统绝对并发量并没有上来，只是单表的数据量太多，影响了SQL效率，加重了CPU负担，以至于成为瓶颈。

分析：表的数据量少了，单次SQL执行效率高，自然减轻了CPU的负担。

### 水平分库原理

以**字段**为依据，按照一定策略（hash、range等），将一个**库**中的数据拆分到多个**库**中。

结果：

- 每个**库**的**结构**都一样；
- 每个**库**的**数据**都不一样，没有交集；
- 所有**库**的**并集**是全量数据；

使用场景：系统绝对并发量上来了，分表难以根本上解决问题，并且还没有明显的业务归属来垂直分库。

分析：库多了，io和cpu的压力自然可以成倍缓解。

### 垂直分表原理

以**字段**为依据，按照字段的活跃性，将**表**中字段拆到不同的**表**（主表和扩展表）中。

结果：

- 每个**表**的**结构**都不一样；
- 每个**表**的**数据**也不一样，一般来说，每个表的**字段**至少有一列交集，一般是主键，用于关联数据；
- 所有**表**的**并集**是全量数据；

使用场景：系统绝对并发量并没有上来，表的记录并不多，但是字段多，并且热点数据和非热点数据在一起，单行数据所需的存储空间较大。以至于数据库缓存的数据行减少，查询时会去读磁盘数据产生大量的随机读IO，产生IO瓶颈。

分析：

可以用列表页和详情页来帮助理解。垂直分表的拆分原则是将热点数据（可能会冗余经常一起查询的数据）放在一起作为主表，非热点数据放在一起作为扩展表。这样更多的热点数据就能被缓存下来，进而减少了随机读IO。

但记住，千万别用join，因为join不仅会增加CPU负担并且会讲两个表耦合在一起（必须在一个数据库实例上）。关联数据，应该在业务Service层做文章，分别获取主表和扩展表数据然后用关联字段关联得到全部数据。

### 垂直分库原理

以**表**为依据，按照业务归属不同，将不同的**表**拆分到不同的**库**中。

结果：

- 每个**库**的**结构**都不一样；
- 每个**库**的**数据**也不一样，没有交集；
- 所有**库**的**并集**是全量数据；

使用场景：系统绝对并发量上来了，并且可以抽象出单独的业务模块。

分析：到这一步，基本上就可以服务化了。例如，随着业务的发展一些公用的配置表、字典表等越来越多，这时可以将这些表拆到单独的库中，甚至可以服务化。再有，随着业务的发展孵化出了一套业务模式，这时可以将相关的表拆到单独的库中，甚至可以服务化。

### 分表分库的步骤

根据容量（当前容量和增长量）评估分库或分表个数 -> 选key（均匀）-> 分表规则（hash或range等）-> 执行（一般双写）-> 扩容问题（尽量减少数据的移动）。

### 水平分库/分表方法

#### 按时间分表

这种分表方式有一定的局限性，当数据有较强的实效性，如微博发送记录、微信消息记录等，这种数据很少有用户会查询几个月前的数据，如就可以按月分表。

#### RANGE（按区间分表）

指定一个数据范围来进行分表，例如从1~1000000，1000001-2000000，使用一百万一张表的方式，如下图所示：

![水平分表分库-Range法](https://gitee.com/koala010/typora/raw/master/img/20210702171732.png)

这种方法需要维护表的ID，特别是分布式环境下，这种分布式ID,在不使用第三方分表工具的情况下，建议使用Redis，Redis的`incr`操作可以轻松的维护分布式的表ID。

> Redis Incr 命令将 key 中储存的数字值增一。
>
> 如果 key 不存在，那么 key 的值会先被初始化为 0 ，然后再执行 INCR 操作。

**优点**： 扩容简单，提前建好库、表就好

**缺点**：**大部分读和写都访会问新的数据，有IO瓶颈，这样子造成新库压力过大，不建议采用**。

#### Hash取模

针对RANGE方式分表有IO瓶颈的问题，可以采用**根据用户ID HASG取模**的方式进行分库分表，如图所示：

<img src="https://gitee.com/koala010/typora/raw/master/img/20210702172048.png" alt="水平分表分库-Hash取模" style="zoom: 67%;" />

这样就可以将数据分散在不同的库、表中，避免了IO瓶颈的问题。

**优点：** 能保证数据较均匀的分散落在不同的库、表中，减轻了数据库压力。

**缺点：** **扩容麻烦、迁移数据时每次都需要重新计算hash值分配到不同的库和表**。

#### 一致性Hash

**普通HASH算法：**

普通哈希算法将任意长度的二进制值映射为较短的固定长度的二进制值，这个小的二进制值称为哈希值。哈希值是一段数据唯一且极其紧凑的数值表示形式。

普通的hash算法在分布式应用中的不足：在分布式的存储系统中，要将数据存储到具体的节点上，如果我们采用普通的hash算法进行路由，将数据映射到具体的节点上，如key%n，key是数据的key，n是机器节点数，如果有一个机器加入或退出集群，则所有的数据映射都无效了，如果是持久化存储则要做数据迁移，如果是分布式缓存，则其他缓存就失效了。

**一致性HASH算法：**

按照常用的hash算法来将对应的key哈希到一个具有2^32次方个节点的空间中，即0~ (2^32)-1的数字空间中。现在我们可以将这些数字头尾相连，想象成一个闭合的环形。

**原理参看HaashMap的一致性哈希**。

优点：通过虚拟节点方式能保证数据较均匀的分散落在不同的库、表中，并且新增、删除节点不影响其他节点的数据，高可用、容灾性强。

参考：

- [MySQL分库分表 看完吊打面试官](https://zhuanlan.zhihu.com/p/348659067)
- [MySQL：互联网公司常用分库分表方案汇总！](https://zhuanlan.zhihu.com/p/137368446)
- [大众点评订单系统分库分表实践](https://tech.meituan.com/2016/11/18/dianping-order-db-sharding.html)
