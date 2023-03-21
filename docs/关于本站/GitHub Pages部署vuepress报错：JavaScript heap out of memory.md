---
title: GitHub Pages部署vuepress报错：JavaScript heap out of memory
date: 2022-03-09
categories:
- 关于本站
tags:
- 个人博客
- 关于本站
---

::: tip

GitHub Pages部署vuepress报错：FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory

:::

<!-- more -->



## 问题

GitHub Pages部署Vuepress一直都没有什么问题，具体部署方案参看：[基于VuePress搭建博客系统及优化过程（持续更新...）](https://www.duktig.cn/2022/01/21/%E5%9F%BA%E4%BA%8Evuepress%E6%90%AD%E5%BB%BA%E5%8D%9A%E5%AE%A2%E7%B3%BB%E7%BB%9F%E5%8F%8A%E4%BC%98%E5%8C%96%E8%BF%87%E7%A8%8B-%E6%8C%81%E7%BB%AD%E6%9B%B4%E6%96%B0/#%E9%83%A8%E7%BD%B2%E4%B8%8A%E7%BA%BF)

但是突然有一次部署就出现了如下的报错情况：

![image-20220309180119580](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202203091801511.png)

经过百度，发现原因是node使用的堆内存超出了V8引擎允许的最大值。

## 分析和解决过程

经过搜索常常得出了两种解决方案。

**1、使用 increase-memory-limit 插件**

TypeScript 和 webpack 时的常见问题，项目过大时，使用 increase-memory-limit，增加node服务器内存限制。

安装：

```sh
npm install -g increase-memory-limit
```

进入工程目录执行：

```sh
increase-memory-limit
```

在执行上述操作后，然后执行`npm run build` 后，会报错：

```sh
'"node --max-old-space-size=4096"' 不是内部或外部命令，也不是可运行的程序
```

在高版本中移除了`node`命令，所以也不能解决。



**2、修改cmd文件**

在目录`node_modules/.bin`下打开`ng.cmd`和`ngc.cmd`文件，添加 `--max_old_space_size=4096`

**但是因为最终部署在GitHub Pages，没有办法直接修改 node_modules 的文件，所以这种方法不行。**



## 解决方案

Node.js v8.0 开始，可以使用`NODE_OPTIONS` 环境变量来全局设置 max_old_space_size 来增加内存限制

```
export NODE_OPTIONS=--max_old_space_size=4096
```

**increase-memory-limit** 将附加 `--max-old-space-size=4096` 到文件中的所有 `node` 调用中`node_modules/.bin/*`。

注意：如果在windows系统，可以使用命令：

```
set NODE_OPTIONS=--max_old_space_size=4096
```

因为`export`是linux命令。



## 扩展

修改原来的github部署脚本：

```yaml{23}
name: Deploy GitHub Pages

# 触发条件：在 push 到 master 分支后
on:
  push:
    branches:
      - main

# 任务
jobs:
  build-and-deploy:
    # 服务器环境：最新版 Ubuntu
    runs-on: ubuntu-latest
    steps:
      # 拉取代码
      - name: Checkout
        uses: actions/checkout@v2
        with:
          persist-credentials: false

      # 生成静态文件
      - name: Build
        run: npm install && export NODE_OPTIONS=--max_old_space_size=4096 &&npm run build

      # 部署到 GitHub Pages
      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@releases/v3
        with:
          ACCESS_TOKEN: ${{ secrets.ACCESS_TOKEN }}
          BRANCH: gh-pages
          FOLDER: docs/.vuepress/dist

```



## 参看

- [FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed – JavaScript heap out of memory](http://www.195440.com/3244)
- [How to use the NODE_OPTIONS environment variable to set the max_old_space_size globally in Windows?](https://stackoverflow.com/questions/56742334/how-to-use-the-node-options-environment-variable-to-set-the-max-old-space-size-g)

