module.exports = {
    "title": "Duktig",
    "description": "优秀还努力。愿你付出甘之如饴，所得归于欢喜。",
    // 默认语言
    locales: {
        '/': {
            lang: 'zh-CN'
        }
    },
    // 永久链接格式 （1.6.10 配置这个 导致插件vuepress-plugin-permalink-pinyin 中文路由转拼音失效）
    permalink: "/:year/:month/:day/:slug",
    // 静态资源路径
    "dest": "docs/.vuepress/dist",
    "head": [
        [
            "link",
            {
                "rel": "icon",
                "href": "/favicon.ico"
            }
        ],
        [
            "meta",
            {
                "name": "viewport",
                "content": "width=device-width,initial-scale=1,user-scalable=no"
            }
        ],
        // 添加百度统计代码 （也可使用插件：vuepress-plugin-baidu-autopush）
        ['script', {},
            `
            var _hmt = _hmt || [];
            (function() {
              var hm = document.createElement("script");
              hm.src = "https://hm.baidu.com/hm.js?55943ae09e5901d7a9f5705133737eec";
              var s = document.getElementsByTagName("script")[0];
              s.parentNode.insertBefore(hm, s);
            })();
           `
        ]
    ],
    // base: "/",
    "theme": "reco",
    "themeConfig": {
        // 评论系统配置
        vssueConfig: {
            platform: 'github',
            owner: 'duktig666',
            repo: 'vssues',
            clientId: 'fbab7b9d7d2529d6207c',
            clientSecret: 'a89a0cf8535c57aba36d5d5eb04fde91d8a2ecfc',
            // 自动创建issues
            autoCreateIssue: true,
        },
        // 在所有页面中启用自动生成子侧边栏，原 sidebar 仍然兼容
        subSidebar: 'auto',
        // 代码块样式（默认——tomorrow）
        codeTheme: 'solarizedlight',
        // 当用户通过滚动查看页面的不同部分时，嵌套的标题链接和 URL 中的 Hash 值会实时更新（默认值：true）（性能优化）
        activeHeaderLinks: false,
        "nav": getNav(),
        "sidebar": {
            '/sql/': getSqlRoute(),
            '/java/': getJavaRoute(),
            '/大数据/': getBigDtaRoute(),
        },
        "type": "blog",
        "blogConfig": {
            "category": {
                "location": 2,
                "text": "分类"
            },
            "tag": {
                "location": 3,
                "text": "标签"
            },
            // 信息栏展示社交信息
            socialLinks: [
                { icon: 'reco-github', link: 'https://github.com/duktig666' },
                { icon: 'reco-mayun', link: 'https://gitee.com/duktig666' },
                { icon: 'reco-csdn', link: 'https://blog.csdn.net/qq_42937522?spm=1000.2115.3001.5343' },
                { icon: 'reco-jianshu', link: 'https://www.jianshu.com/u/421632ec0dc8' },
            ]
        },
        "friendLink": [
            {
                "title": "皆非的万事屋",
                "desc": "Youth is not a period of time, it is a state of mind.",
                "logo": "https://file.makeyourchoice.cn/img/typecho/avatar.png",
                "link": "https://www.makeyourchoice.cn/"
            },
            {
                "title": "Advance",
                "desc": "须知少时凌云志，曾许人间第一流。",
                "logo": "https://gitee.com/jiao_qianjin/zhishiku/raw/master/img/20210524175332.jpg",
                "link": "https://jiaoqianjin.cn/"
            },
            {
                "title": "Elltor",
                "desc": "戒骄戒躁，看清目标；持之以恒，厚积薄发。",
                "logo": "https://oss.elltor.com/uploads/2020/user_photo_1602810656543.jpg",
                "link": "https://elltor.com/"
            },
            {
                "title": "午后南杂",
                "desc": "Enjoy when you can, and endure when you must.",
                "email": "1156743527@qq.com",
                "link": "https://www.recoluan.com"
            },
            {
                "title": "vuepress-theme-reco",
                "desc": "A simple and beautiful vuepress Blog & Doc theme.",
                "logo": "https://vuepress-theme-reco.recoluan.com/icon_vuepress_reco.png",
                "link": "https://vuepress-theme-reco.recoluan.com"
            },
        ],
        "logo": "/logo.png",
        "search": true,
        "searchMaxSuggestions": 10,
        "lastUpdated": "Last Updated",
        "author": "RenShiWei",
        "authorAvatar": "/avatar.jpg",
        "record": "豫ICP备2021014891号-1",
        "startYear": "2018"
    },
    "markdown": {
        // 代码块设置行号
        "lineNumbers": true
    },
    // 配置插件
    plugins: [
        // pwa 刷新插件
        ['pwa', {
            serviceWorker: true,
            updatePopup: {
                message: "发现新内容可用",
                buttonText: "刷新"
            }
        }],
        // 音乐插件
        ['meting', {
            //metingApi: "https://meting.sigure.xyz/api/music",
            meting: {
                // 网易
                server: "netease",
                // 读取歌单
                type: "playlist",
                // 歌单id（只用修改这个）
                mid: "7256568321",
            },
            // 不配置该项的话不会出现全局播放器
            aplayer: {
                // 吸底模式
                fixed: true,
                mini: true,
                // 自动播放
                autoplay: false,
                // 歌曲栏折叠
                listFolded: true,
                // 颜色
                theme: '#f9bcdd',
                // 播放顺序为随机
                order: 'random',
                // 初始音量
                volume: 0.1,
                // 关闭歌词显示
                lrcType: 0
            },
            mobile: {
                // 手机端去掉cover图
                cover: false,
            }
        }],
    ]
}

/* 导航栏配置 */
function getNav() {
    return [
        {
            "text": "博客",
            "link": "/",
            "icon": "reco-home"
        },
        {
            "text": "时间轴",
            "link": "/timeline/",
            "icon": "reco-date"
        },
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
                }
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
            "link": "/docs/aboutme",
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

// 大数据侧边栏
function getBigDtaRoute() {
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
