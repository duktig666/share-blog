---
title: 利用MarkDown收集常用的Emoji
date: 2022-03-12
categories:
 - tool
tags:
 - markdown
subSidebar: false
---

::: tip

1. 总结常用的emoji
2. 讲述如何利用 markdown 收集常用的Emoji，并形成网格布局

:::

<!-- more -->



## 背景

> Emoji是一种文本类型的象形符号， 它和图片、表情包不同，它能够在任何文本输入的地方使用，因为它本身就是一种文字 ；最新的emoji 13.0版本包含1814个独立的表情符号（该统计不包含由多符号组成和其他肤色的表情符号），emoji能够在各个不同的操作平台上显示，但显示效果会有一些不同。

看到过许多的 MarkDown 文件里都引用格式各样的emoji，也看到过许多的github网站的仓库简介也都使用emoji，如下：

![image-20220312102910928](https://cos.duktig.cn/typora/202203121029687.png)

这样的emoji，要么是 `Unicode` 格式，要么需要直接复制粘贴去使用。

对于我来说，更多使用的场景是用来 书写MarkDown。

所以我就在思考：**怎么使用 MarkDown 来收集常用的 emoji，并且按照 类似于表格那样排列，然后便于复制粘贴使用？**

需求：

- 使用 MarkDown 收集常用的 emoji

- 收集的 emoji 采用表格/网格布局

  - 想要的格式类似于 [Emoji中文网](https://www.emojiall.com/zh-hans) 的排列（**上边一行emoji，下边一行描述**），如下：

    ![image-20220312104240290](https://cos.duktig.cn/typora/202203121042663.png)

- 在 MarkDown 文件中，可以随意使用复制的 emoji



## emoji合集

- [Emoji中文网](https://www.emojiall.com/zh-hans)
- [https://gist.github.com/rxaviers/7360908](https://gist.github.com/rxaviers/7360908)

## 我常用emoji

[我的常用Emoji](https://www.duktig.cn/2022/03/09/%E6%88%91%E7%9A%84%E5%B8%B8%E7%94%A8emoji/)

## 如何收集常用的emoji？

在 [Emoji中文网](https://www.emojiall.com/zh-hans) 中可以找到各个类型的emoji，重点在于展示的方式。

### 方式一：使用表格（不推荐）

使用表格的话，我们可以直接使用 MarkDown 的语法来做：

```markdown
|      |      |      |
| ---- | ---- | ---- |
|      |      |      |
|      |      |      |
|      |      |      |
```

但是这样的语法，**不能修改 表格内容 在网页中的样式**，即默认的图标太小，观感体验很不友好。

当然也可以使用 HTML 方式写表格的语法，这样就可以修改表格内容的样式， MarkDown 也天然支持这样的渲染方式。

```html
<table border="1px" align="center" bordercolor="black" width="80%" height="100px">
    <tr align="center">
        <td>🤪</td>
        <td>😀</td>
        <td>😂</td>
    </tr>
    <tr align="center">
        <td>😳</td>
        <td>😠<br></td>
        <td>😱</td>
    </tr>
</table>
```

这样的方式虽然可以实现上班的需求，再配合CSS修改样式。

但是最大的缺点就是，每次不仅要复制 `<td>😱</td>` 还是要复制`<tr></tr>`，**这样的代码会把行和列定死，需要再次想修改行列数时，非常麻烦**。

### 方式二：使用表格布局（推荐）

话不多说，先亮代码：

```html
<div style="display:grid;grid-template-columns: repeat(auto-fill, 10%);font-size:30px;justify-items:center;align-items:center;line-height:normal;text-align:center">
    <span>🤪<br>滑稽</span>
    <span>😀<br>微笑</span>
    <span>😂<br>笑哭</span>
    <span>😳<br>脸红</span>
    <span>😵‍💫<br>晕</span>
    <span>😎<br>墨镜</span>
    <span>😲<br>震惊</span>
    <span>🙄<br>翻白眼</span>
    <span>😏<br>得意</span>
    <span>😱<br>吓死了</span>
    <span>😠<br>生气</span>
</div>
```

HTML内部代码自动适应行列，关键代码：

```css
grid-template-columns: repeat(auto-fill, 10%);
```

`10%` 即将内容分为10列。

如果想要5列，那么修改成`20%`即可。

效果图：

![image-20220312110005626](https://cos.duktig.cn/typora/202203121112859.png)



## 参看：

- [推荐!!! Markdown图标索引网站](https://segmentfault.com/a/1190000039380025)
