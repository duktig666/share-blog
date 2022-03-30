/* 侧边栏配置 */
// 数据库侧边栏
function getSqlRoute() {
    return [
        {
            title: 'Mysql',
            collapsable: false,
            sidebarDepth: 2,    // 可选的, 默认值是 1
            children: [
                "mysql/MySQL的存储引擎有哪些？以及它们的对比和使用场景",
                "mysql/MySQL索引",
                "mysql/MySQL 数据库要用B+树存储索引？",
                "mysql/MySQL的事务、隔离级别和MVCC原理",
                "mysql/MySQL的锁机制",
                "mysql/MySQL主从复制和分表分库原理",
                "mysql/MySQL的慢查询和数据库优化",
                "mysql/sql编程题",
                "mysql/开窗函数",
            ]
        },
        {
            title: 'Redis',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "redis/Redis底层数据结构",
                "redis/Redis的发布订阅模式",
                "redis/Redis面试题",
            ]
        },
        {
            title: 'ElasticSearch',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "es/ElasticSearch技术方案——使用场景",
                "es/ElasticSearch实现站内搜索",
                "es/ES重点",
            ]
        }
    ]
}

// Java 侧边栏
function getJavaRoute(){
    return [
        {
            title: 'Java 基础',
            collapsable: false,
            sidebarDepth: 2,    // 可选的, 默认值是 1
            children: [
                "basics/面向对象",
                "basics/枚举",
                "basics/常用类",
                "basics/异常处理",
                "basics/网络编程",
                "basics/Java8新特性",
                "basics/Java基础常见面试题",
            ]
        },
        {
            title: 'Java 集合',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "collection/HashMap底层原理分析",
                "collection/ConcurrentHashMap底层原理分析",
                "collection/HashSet",
                "collection/集合常见面试题",
            ]
        },
        {
            title: 'Java IO',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "io/IO基础.md",
            ]
        },
        {
            title: 'Java 反射',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "reflect/反射基础",
                "reflect/反射总结",
                "reflect/反射常见面试题",
                "reflect/详解动态代理",
            ]
        },
        {
            title: 'Java 并发编程',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "thread/多线程基础笔记",
                "thread/多线程基础常见问题",
                "thread/Java解决线程安全问题",
                "thread/synchronized 总结",
                "thread/volatile总结",
                "thread/AQS原理和LOCK锁原理分析",
                "thread/原子操作 与 Atomic原子类总结",
                "thread/深入解析ThreadLocal",
                "thread/死锁总结",
                "thread/线程池总结",
            ]
        },
        {
            title: 'JVM',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "jvm/JVM总结",
                "jvm/JVM调试排错",
            ]
        },
    ]
}

// Java相关框架 侧边栏
function getJavaFrameRoute() {
    return [
        {
            title: 'Spring',
            collapsable: false,
            sidebarDepth: 2,    // 可选的, 默认值是 1
            children: [
                "spring family/Spring/Spring总结.md",
                "spring family/Spring/Spring常见面试题.md",
            ]
        },
        {
            title: 'SpringMVC',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "spring family/SpringMVC/SpringMVC.md",
            ]
        },
        {
            title: 'SpringBoot',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "spring family/SpringBoot/SpringBoot自动装配和Starter原理.md",
                "spring family/SpringBoot/SpringBoot常见面试题.md",
                "spring family/SpringBoot/SpringBoot 配置获取request中body的json格式参数.md",
                "spring family/SpringBoot/修改SpringBoot默认的启动图案.md",
                "spring family/SpringBoot/SpringBoot 配置获取request中body的json格式参数.md",
                "spring family/SpringBoot/SpringBoot 配置返回前端时间戳和接收时间戳自动转为LocalDateTime（前后端统一使用时间戳交互）.md",
            ]
        },
        {
            title: 'JWT',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "JWT相关.md",
            ]
        },
        {
            title: 'Netty',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "Netty/Netty总结.md",
                "Netty/《Netty权威指南2》笔记.md",
                "Netty/Netty面试题.md",
                "Netty/WebSocket协议.md",
            ]
        },
    ]
}

// 大数据侧边栏
function getBigDataRoute() {
    return [
        {
            title: 'Hadoop',
            collapsable: false,
            sidebarDepth: 2,    // 可选的, 默认值是 1
            children: [
                "Hadoop/Hadoop概述",
                "Hadoop/HDFS总结",
                "Hadoop/MapReduce总结",
                "Hadoop/Yarn总结",
            ]
        },
        {
            title: 'Hive',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "Hive/Hive概述",
                "Hive/Hive的DDL和DML语句",
                "Hive/Hive的分区表和分桶表",
                "Hive/Hive的常用函数和压缩存储",
                "Hive/Hive实战",
            ]
        },
        {
            title: 'HBase',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "HBase/HBase",
            ]
        },
        {
            title: 'Flink',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "Flink/flink",
            ]
        }
    ]
}

// 算法侧边栏
function getAlgorithmRoute() {
    return [
        {
            title: '数据结构',
            collapsable: false,
            sidebarDepth: 2,    // 可选的, 默认值是 1
            children: [
                "数据结构/线性表",
                "数据结构/二分查找法",
                "数据结构/稀疏数组",
                "数据结构/位运算总结",
                "数据结构/栈和队列",
                "数据结构/两个栈实现队列和两个队列实现栈",
                "数据结构/树",
            ]
        },
        {
            title: '算法技巧',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "算法技巧/01数组",
                "算法技巧/02链表",
                "算法技巧/03队列和栈",
                "算法技巧/04字符串",
                "算法技巧/05二叉树",
                "算法技巧/06DFS",
                "算法技巧/07回溯",
                "算法技巧/08贪心",
                "算法技巧/09动态规划",
                "算法技巧/10数据结构设计",
                "算法技巧/11BFS",
                "算法技巧/12其他",
            ]
        },
        {
            title: 'codetop',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "codetop/codetop(21-40)",
            ]
        },
        {
            title: '《剑指offer》',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "《剑指offer》总结",
            ]
        }
    ]
}

// 架构侧边栏
function getArchitectureRoute() {
    return [
        {
            title: '微服务',
            collapsable: false,
            sidebarDepth: 2,    // 可选的, 默认值是 1
            children: [
                "微服务/微服务架构 总览",
            ]
        },
        {
            title: '分布式ID',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "分布式ID/分布式ID方案",
                "分布式ID/Redis实现分布式ID",
                "分布式ID/ZooKeeper实现分布式ID",
            ]
        },
        {
            title: '分布式锁',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "分布式锁/分布式锁",
            ]
        },
        {
            title: '分布式事务',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "分布式事务/分布式事务方案",
            ]
        },
        {
            title: 'OAuth2.0',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "OAuth2.0/理解OAuth2.0",
            ]
        },
        {
            title: '云原生',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "云原生/云原生架构和K8S",
            ]
        },
        {
            title: '其他',
            collapsable: false,
            sidebarDepth: 2,
            children: [
                "高可用方案",
                "Gateway实现动态路由和灰度发布",
            ]
        },
    ]
}

// function getToolRoute() {
//     return [
//         {
//             title: '其他',
//             collapsable: false,
//             sidebarDepth: 2,
//             children: [
//                 "emoji/我的常用emoji",
//             ]
//         },
//     ]
// }

module.exports = {
    getSqlRoute,
    getJavaRoute,
    getJavaFrameRoute,
    getBigDataRoute,
    getAlgorithmRoute,
    getArchitectureRoute,
    // getToolRoute
}
