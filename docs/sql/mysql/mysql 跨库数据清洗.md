---
title: Redis的发布订阅模式
date: 2021-12-14
categories:
 - 数据库
tags:
 - mysql
---

::: tip

跨库数据清洗不能直接执行sql，手动拼接sql在数据量大的情况下不显示。
考虑使用 mysql concat()函数 解决问题

:::

<!-- more -->

# 需求

database1.order         关键字段：user_id,network,p,product_id

database2.xxx_info   关键字段：owner_id,network,p

bug：表 database2.`product_info` 维护的userId出现问题，导致查询用户的信息不正确。

解决：数据清洗。 将 database1.`product` 的 userId 与 database2.`product_info` 的 userId进行清洗。

大致执行的sql语句如下：

```sql
use database1;

SELECT user_id,network,p FROM order WHERE product_id = 1 AND product_type = 1 AND ctime > "2022-09-15 14:05:51";
```

*加上 `ctime` 的时间范围减少数据条数。*

结果：
> user_id 1
> network r
> p 0xaf

```sql
use database2;

UPDATE `xxx_info` SET `owner_id` = 1 WHERE `network` = 'r' AND p = '0xaf';
```

因为进行了跨库操作，无法直接执行一条sql进行数据的清洗。

# 思考

如果按照上述的方式实现，在少量的数据情况下，可以进行手动构造。但是数据量大的情况下就不适用了。

比较可行的两种的方式是：

1. 通过excel的单元格，进行sql的拼接组合（可搜索得到具体做法，重点说方案2）
2. mysql concat() 函数

# mysql concat() 函数

mysql concat() 函数用于将多个字符串连接成一个字符串。

mysql CONCAT(str1,str2,…)

示例：查询时要在一个字段中 stu_id、stu_name，中间用 '# ' 连接，mysql 语句：

SELECT CONCAT(stu_id, '# ', stu_name) FROM student;

![x.jpeg](https://cos.duktig.cn/typora/x.jpeg)

# 最终实现

```sql
SELECT CONCAT('UPDATE database2.xxx_info SET `owner_id` = ',user_id, ' WHERE `network` = \'' ,network ,'\' AND `p` =\'',p ,'\';') FROM database1.order WHERE  product_id = 1 ;
```

执行上述语句会直接拼接出如下语句，直接执行即可，避免手动构造

```sql
UPDATE `xxx_info` SET `owner_id` = 1 WHERE `network` = 'r' AND p = '0xaf';
```
