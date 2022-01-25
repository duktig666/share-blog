module.exports = {
    "title": "Duktig",
    "description": "个人博客",
    // 默认语言
    locales: {
        '/': {
            lang: 'zh-CN'
        }
    },
    // 永久链接格式 （1.6.10 配置这个 导致插件vuepress-plugin-permalink-pinyin 中文路由转拼音失效）
    // permalink: "/:year/:month/:day/:slug",
    // 静态资源路径
    "dest": ".vuepress/dist",
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
        ]
    ],
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
        "nav": [
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
                "text": "文档",
                "icon": "reco-message",
                "items": [
                    {
                        "text": "vuepress-reco",
                        "link": "/docs/theme-reco/"
                    }
                ]
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
        ],
        "sidebar": {
            // "/docs/theme-reco/": [
            //     "",
            //     "theme",
            //     "plugin",
            //     "api"
            // ]
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
            }
        },
        "friendLink": [
            {
                "title": "皆非的万事屋",
                "desc": "Youth is not a period of time, it is a state of mind.",
                "avatar": "https://file.makeyourchoice.cn/img/typecho/avatar.png",
                "link": "https://www.makeyourchoice.cn/"
            },
            {
                "title": "Advance",
                "desc": "须知少时凌云志，曾许人间第一流。",
                "avatar": "https://gitee.com/jiao_qianjin/zhishiku/raw/master/img/20210524175332.jpg",
                "link": "https://jiaoqianjin.cn/"
            },
            {
                "title": "Elltor",
                "desc": "戒骄戒躁，看清目标；持之以恒，厚积薄发。",
                "avatar": "https://oss.elltor.com/uploads/2020/user_photo_1602810656543.jpg",
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
                "avatar": "https://vuepress-theme-reco.recoluan.com/icon_vuepress_reco.png",
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
        // 支持中文文件名
        // [
        //     "permalink-pinyin",
        //     {
        //         lowercase: true, // Converted into lowercase, default: true
        //         separator: "-", // Separator of the slug, default: '-'
        //     },
        // ],
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
                mid: "7045548095",
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
