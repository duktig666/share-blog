// 解决中文路由问题 详情参看：https://github.com/vuepress-reco/vuepress-theme-reco/issues/395
export default (ctx) => {
    const routes = ctx.router.getRoutes()

    ctx.router.beforeEach((to, from, next) => {
        // 解决decode后反复重定向的问题
        const route = routes.find((v) => v.regex.test(to.path))

        // .html有重定向路由，无需特殊处理
        if (/\.html$/.test(to.path)) {
            return next()
        }

        // 不特殊处理 非通配符的 没有重定向的路由
        if (route && route.path !== '*' && !route.redirect) {
            return next()
        }

        // 解决中文标签/分类路由无法被正确加载的问题
        if (decodeURIComponent(to.path) !== to.path) {
            return next(
                Object.assign({}, to, {
                    path: decodeURIComponent(to.path),
                    fullPath: decodeURIComponent(to.fullPath)
                })
            )
        }

        //触发百度的pv统计
        // if (typeof _hmt != "undefined") {
        //     if (to.path) {
        //         _hmt.push(["_trackPageview", to.fullPath]);
        //     }
        // }

        next()
    })

    // 临时解决，防止内部调用钩子再处理
    ctx.router.beforeEach = () => {
        return
    }
}
