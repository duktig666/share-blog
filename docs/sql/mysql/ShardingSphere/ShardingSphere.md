---
title:  ShardingSphere
date: 2021-12-15 
publish: false
---

# ShardingSphere

## 什么是 ShardingSphere？

> 官网：[https://shardingsphere.apache.org/index_zh.html](https://shardingsphere.apache.org/index_zh.html)

1、一套开源的分布式数据库中间件解决方案 

2、有三个产品：Sharding-JDBC 和 Sharding-Proxy 

3、定位为**关系型数据库中间件**，合理在分布式环境下使用关系型数据库操作

## 什么是分库分表 ？

1、数据库数据量不可控的，随着时间和业务发展，造成表里面数据越来越多，如果再去对数据库表 curd 操作时候，造成性能问题。 

2、方案 1：从硬件上 

3、方案 2：分库分表 

为了解决由于数据量过大而造成数据库性能降低问题。

## 分库分表的方式

分表分库方式：

- 分库分表有两种方式：垂直切分和水平切分 

- 垂直切分：垂直分表和垂直分库 
- 水平切分：水平分表和水平分库 

### 垂直分表

操作数据库中某张表，把这张表中一部分字段数据存到一张新表里面，再把这张表另一部分字段数据存到另外一张表里面 。

![image-20211209161632645](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202112091616452.png)

### 垂直分库

把单一数据库按照业务进行划分，专库专表 。

![image-20211209161812792](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202112091618567.png)

### 水平分库 

![image-20211209161836489](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202112091618511.png)

### 水平分表

![image-20211209161909428](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202112091619321.png)

## 分库分表应用和问题

1、应用 

（1）在数据库设计时候考虑垂直分库和垂直分表 

（2）随着数据库数据量增加，不要马上考虑做水平切分，首先考虑缓存处理，读写分离，使用索引等等方式，如果这些方式不能根本解决问题了，再考虑做水平分库和水平分表 

2、分库分表问题 

（1）跨节点连接查询问题（分页、排序） 

（2）多数据源管理问题 

# Sharding-JDBC

## 什么是Sharding-JDBC？

Sharding-JDBC 是轻量级的 java 框架，是增强版的 JDBC 驱动 。

Sharding-JDBC 不是做分表分库，而是 **简化对分库分表之后数据相关操作**。

主要两个功能：

1. 数据分片
2. 读写分离

![image-20211209162405938](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202112091624356.png)

## Sharding-JDBC 实现水平分表

按照水平分表的方式，创建数据库和数据库表 

1. 创建数据库 course_db 
2. 在数据库创建两张表 course_1 和 course_2 
3. 约定规则：如果添加课程 id 是偶数把数据添加 course_1，如果奇数添加到 course_2 



## Sharding-JDBC 操作公共表 

1、公共表 

（1）存储固定数据的表，表数据很少发生变化，查询时候经常进行关联 
（2）在每个数据库中创建出相同结构公共表 

2、在多个数据库都创建相同结构公共表 



## Sharding-JDBC 实现读写分离 

### 读写分离简介

为了确保数据库产品的稳定性，很多数据库拥有双机热备功能。也就是，第一台数据库服务器，是对外提供增删改业务的生产服务器;第二台数据库服务器，主要进行读的操作。原理∶**让主数据库( master )处理事务性增、改、删操作，而从数据库( slave )处理SELECT查询操作**。

### 读写分离原理

![image-20211209180204882](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202112091802113.png)

**Sharding-JDBC 通过 sql 语句语义分析，实现读写分离过程，不会做数据同步**。



# Sharding-Proxy

定位为透明的数据库代理端

![image-20211209181213379](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202112091812688.png)

Sharding-Proxy 独立应用，需要安装服务，进行分库分表或者读写分离配置，启动使用。 



















