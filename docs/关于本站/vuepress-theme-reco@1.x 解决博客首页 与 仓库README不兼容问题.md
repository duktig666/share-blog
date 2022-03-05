---
title: vuepress-theme-reco@1.x 解决博客首页 与 仓库README不兼容问题
date: 2022-03-05
categories:

 - 关于本站
tags:
 - 个人博客
 - 关于本站
---

::: tip

基于 vuepress-theme-reco 搭建的博客系统，默认以 `READM.md` 文件作为首页，设置后 git仓库的README.md配置会很丑陋，特此解决这个问题。

:::

<!-- more -->

## 问题描述

基于 vuepress-theme-reco 可以搭建简介优雅的博客，利用github pages进行自动化部署，非常方便，而且无需额外成本。示例网站参考：[https://www.duktig.cn/](https://www.duktig.cn/)。

建站仓库：[https://github.com/duktig666/duktig666.github.io](https://github.com/duktig666/duktig666.github.io)

但是存在一个比较大的问题——vuepress-theme-reco 搭建的博客系统，默认以 `READM.md` 文件作为首页，会使github的仓库默认页变得很丑。如下：

![image-20220305204002764](https://cos.duktig.cn/typora/202203052040098.png)

**你能忍受你的github仓库首页长这个样子吗？**

## 分析

### 修改为 博客首页支持的另一种方式——index.md（失败）

但是如果你修改你的README.md，又会使你的博客首页发生变化（不兼容）。而且即使你改为index.md，再新建一个README.md文件，但是博客首页的优先级 README.md > index.md，还是不能解决。

### vuepress的默认根目录

我们通过对比发现，vuepress的默认根目录是`docs`：

<img src="https://cos.duktig.cn/typora/202203052054939.png" alt="image-20220305204953129" style="zoom:67%;" />

所以 `.vuepress目录` 在docs下，所以docs下的README就是默认的首页。

<img src="https://cos.duktig.cn/typora/202203052054841.png" alt="image-20220305205100188" style="zoom:67%;" />

###  vuepress-theme-reco 的默认根目录

分析vuepress-theme-reco的**package.json**文件，发现其默认以当前项目为根目录。

![image-20220305205456729](https://cos.duktig.cn/typora/202203052054518.png)

那么只需要让其 `.vuepress` 文件夹也在docs下，那么docs下的README.md自然就成为了首页；那么项目根目录下的README.md文件就可以作为git仓库的默认首页了。

至此分析完毕，解决参看如下方式。

## 解决

### 1、修改vuepress-theme-reco的**package.json**文件

```json
"scripts": {
    "dev": "vuepress dev docs/. --open --host \"localhost\"",
    "build": "vuepress build docs/."
},
```

### 2、将 .vuepress文件夹 从项目根目录移动到docs文件夹下

<img src="https://cos.duktig.cn/typora/202203052102549.png" alt="image-20220305210244212" style="zoom:67%;" />

### 3、特别注意：博客内的根路径之后 从`/docs` 开始

nav 以及 sidebar中的 `link` 和 `path` 属性从 `/docs` 开始。



至此 **博客首页** 和 **git仓库的默认页** 互不影响。

