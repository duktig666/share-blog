
/* 导航栏配置 */
function getNav() {
    return [
        {
            "text": "博客",
            "link": "/",
            "icon": "reco-home"
        },
        // {
        //     "text": "时间轴",
        //     "link": "/timeline/",
        //     "icon": "reco-date"
        // },
        {
            text: 'Java',
            items: [
                {
                    text: 'Java 基础', items: [
                        {text: 'Java 基础', link: '/java/basics/面向对象'},
                        {text: 'Java 集合', link: '/java/collection/HashMap底层原理分析'},
                        {text: 'Java IO', link: '/java/io/IO基础'},
                        {text: 'Java 反射', link: '/java/reflect/反射总结'},
                        {text: 'Java 并发编程', link: '/java/thread/多线程基础笔记'},
                    ]
                },
                {
                    text: 'JVM', items: [
                        {text: 'JVM总结', link: '/java/jvm/JVM总结'},
                    ]
                },
                {
                    text: 'Spring', items: [
                        {text: 'Spring总结', link: '/java相关框架/spring family/Spring/Spring总结'},
                        {text: 'Spring常见面试题', link: '/java相关框架/spring family/Spring/Spring常见面试题'},
                        {text: 'SpringMVC', link: '/java相关框架/spring family/SpringMVC/SpringMVC'},
                        {text: 'SpringBoot自动装配和Starter原理', link: '/java相关框架/spring family/SpringBoot/SpringBoot自动装配和Starter原理'},
                        {text: 'SpringBoot常见面试题', link: '/java相关框架/spring family/SpringBoot/SpringBoot常见面试题'},
                    ]
                },
                {
                    text: 'JWT', items: [
                        {text: 'JWT总结', link: '/java相关框架/JWT相关'},
                    ]
                },
                {
                    text: 'Netty', items: [
                        {text: 'Netty总结', link: '/java相关框架/Netty/Netty总结'},
                    ]
                },
            ]
        },
        {
            text: '算法',
            items: [
                {text: '数据结构', link: '/算法与数据结构/数据结构/线性表'},
                {text: '算法技巧', link: '/算法与数据结构/算法技巧/01数组'},
                {text: 'CodeTop', link: '/算法与数据结构/codetop/codetop(21-40).md'},
                {text: '剑指offer', link: '/算法与数据结构/《剑指offer》总结'},
                {text: '真实面试算法题', link: '/算法与数据结构/真实面试算法题/好朋友的笔试题——1000个1-100随机数尽可能均匀分配区间的问题'},
            ]
        },
        {
            text: '数据库',
            items: [
                {
                    text: 'SQL 数据库', items: [
                        {text: 'MySQL 详解', link: '/sql/mysql/MySQL索引'}
                    ]
                },
                {
                    text: 'NoSQL 数据库', items: [
                        {text: 'Redis 详解', link: '/sql/redis/Redis底层数据结构'},
                        {text: 'ElasticSearch 详解', link: '/doc/sql/es/ElasticSearch技术方案——使用场景'},
                    ]
                }
            ]
        },
        {
            text: '架构',
            items: [
                {text: '微服务', link: '/架构/微服务/微服务架构 总览'},
                {text: '分布式ID', link: '/架构/分布式ID/分布式ID方案'},
                {text: '分布式锁', link: '/架构/分布式锁/分布式锁'},
                {text: '分布式事务', link: '/架构/分布式事务/分布式事务方案'},
                {text: 'OAuth2.0', link: '/架构/OAuth2.0/理解OAuth2.0'},
                {text: '云原生', link: '/架构/云原生/云原生架构和K8S'},
            ]
        },
        {
            text: '大数据',
            items: [
                {text: 'Hadoop', link: '/大数据/Hadoop/Hadoop概述'},
                {text: 'Hive', link: '/大数据/Hive/Hive概述'},
                {text: 'HBase', link: '/大数据/HBase/HBase'},
                {text: 'Flink', link: '/大数据/Flink/flink'},
            ]
        },
        {
            "text": "关于我",
            "link": "/aboutme",
            "icon": "reco-account",
        },
        {
            "text": "关注我",
            "icon": "reco-message",
            "items": [
                {
                    "text": "GitHub",
                    "link": "https://github.com/duktig666",
                    "icon": "reco-github"
                },
                {
                    "text": "Gitee",
                    "link": "https://gitee.com/duktig666",
                    "icon": "reco-mayun"
                },
                {
                    "text": "CSDN",
                    "link": "https://blog.csdn.net/qq_42937522?spm=1000.2115.3001.5343",
                    "icon": "reco-csdn"
                },
                {
                    "text": "简书",
                    "link": "https://www.jianshu.com/u/421632ec0dc8",
                    "icon": "reco-jianshu"
                },
            ]
        }
    ];
}

module.exports = {
    getNav
}
