// 导航栏配置
const nav = require('./nav');
// 侧边栏配置
const sidebar = require('./sidebar');

module.exports = {
    "title": "Duktig",
    "description": "优秀还努力。愿你付出甘之如饴，所得归于欢喜。",
    // 默认语言
    locales: {
        '/': {
            lang: 'zh-CN',
            title: "个人博客",
        }
    },
    // build 问题：https://blog.csdn.net/weixin_57677300/article/details/128017651
    base: './',
    // 永久链接格式 （1.6.10 配置这个 导致插件vuepress-plugin-permalink-pinyin 中文路由转拼音失效）
    permalink: "/:year/:month/:day/:slug",
    // 静态资源路径
    "dest": "docs/.vuepress/dist",
    "head": [
        ["link", {"rel": "icon", "href": "/favicon.ico"}],
        ["meta", {"name": "viewport", "content": "width=device-width,initial-scale=1,user-scalable=no"}],
        ["meta", {name: "robots", content: "all"}],
        ["meta", {name: "author", content: "RenShiWei"}],
        ["meta", {name: "apple-mobile-web-app-capable", content: "yes"}],
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
        ],
        ["script", {src: "https://hm.baidu.com/hm.js?xxxxxxxxxxx"}]
    ],
    "theme": "reco",
    "themeConfig": {
        repo: 'duktig666/share-blog',
        // 假如文档不是放在仓库的根目录下
        docsDir: 'docs',
        // 假如文档放在一个特定的分支下：
        docsBranch: 'main',
        // 默认是 false, 设置为 true 来启用
        editLinks: true,
        // 评论系统配置
        // vssueConfig: {
        //     platform: 'github',
        //     owner: 'duktig666',
        //     repo: 'vssues',
        //     clientId: 'fbab7b9d7d2529d6207c',
        //     clientSecret: 'a89a0cf8535c57aba36d5d5eb04fde91d8a2ecfc',
        //     // 自动创建issues
        //     autoCreateIssue: true,
        // },
        valineConfig: {
            appId: 'cJXCRUAuFj0nwNYBdSPM0mke-gzGzoHsz',
            appKey: 'uQ4GOlSaJobJdYp04idd3bjo',
            // 默认头像模式
            avatar: 'monsterid',
            pageSize: 20,
            // 文章访问量统计
            visitor: false,
            // 是否启用昵称框自动获取QQ昵称和QQ头像, 默认关闭，需博/网站主主动启用
            enableQQ: true,

        },
        // 在所有页面中启用自动生成子侧边栏，原 sidebar 仍然兼容
        subSidebar: 'auto',
        // 代码块样式（默认——tomorrow）
        codeTheme: 'solarizedlight',
        // 当用户通过滚动查看页面的不同部分时，嵌套的标题链接和 URL 中的 Hash 值会实时更新（默认值：true）（性能优化）
        activeHeaderLinks: false,
        // 导航栏配置
        "nav": nav.getNav(),
        // 侧边栏配置
        "sidebar": {
            '/sql/': sidebar.getSqlRoute(),
            '/java/': sidebar.getJavaRoute(),
            '/java相关框架/': sidebar.getJavaFrameRoute(),
            '/大数据/': sidebar.getBigDataRoute(),
            '/算法与数据结构/': sidebar.getAlgorithmRoute(),
            '/架构/': sidebar.getArchitectureRoute(),
            // '/tool/': sidebar.getToolRoute(),
        },
        "type": "blog",
        "blogConfig": {
            // "category": {
            //     "location": 2,
            //     "text": "分类"
            // },
            // "tag": {
            //     "location": 3,
            //     "text": "标签"
            // },
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
        "authorAvatar": "/avatar.jpeg",
        "record": "豫ICP备2021014891号-1",
        "startYear": "2018"
    },
    "markdown": {
        // 代码块设置行号
        "lineNumbers": true,
        externalLinks: {
            target: '_blank', rel: 'noopener noreferrer'
        }
    },
    // 配置插件
    plugins: [
        // pwa 刷新插件
        ['@vuepress/pwa', {
            serviceWorker: true,
            updatePopup: {
                message: "站点有新的内容更新，点击按钮加载最新的内容",
                buttonText: "刷新"
            }
        }],
        // 音乐插件
        // ['meting', {
        //     //metingApi: "https://meting.sigure.xyz/api/music",
        //     meting: {
        //         // 网易
        //         server: "netease",
        //         // 读取歌单
        //         type: "playlist",
        //         // 歌单id（只用修改这个）
        //         mid: "7256568321",
        //     },
        //     // 不配置该项的话不会出现全局播放器
        //     aplayer: {
        //         // 吸底模式
        //         fixed: true,
        //         mini: true,
        //         // 自动播放
        //         autoplay: false,
        //         // 歌曲栏折叠
        //         listFolded: true,
        //         // 颜色
        //         theme: '#f9bcdd',
        //         // 播放顺序为随机
        //         order: 'random',
        //         // 初始音量
        //         volume: 0.1,
        //         // 关闭歌词显示
        //         lrcType: 0
        //     },
        //     mobile: {
        //         // 手机端去掉cover图
        //         cover: false,
        //     }
        // }],
        // 添加Copy自动加版权信息
        ['copyright', {
            noCopy: false, // 选中的文字将无法被复制
            minLength: 100, // 如果长度超过 100 个字符
            authorName: "https://www.duktig.cn",
        },
        ],
        // 在代码区，添加一个拷贝按钮，用来拷贝代码
        ['vuepress-plugin-code-copy', true],
        // 添加Sitemap信息
        ['sitemap', {
            hostname: 'https://www.duktig.cn/'
        }],

    ]
}
