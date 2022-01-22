module.exports = {
    "title": "Duktig",
    "description": "个人博客",
    // 默认语言
    locales: {
        '/': {
            lang: 'zh-CN'
        }
    },
    // 永久链接格式
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
        //在所有页面中启用自动生成子侧边栏，原 sidebar 仍然兼容
        subSidebar: 'auto',
        "nav": [
            {
                "text": "首页",
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
                "text": "链接",
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
            "/docs/theme-reco/": [
                "",
                "theme",
                "plugin",
                "api"
            ]
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
        "lineNumbers": true
    }
}
