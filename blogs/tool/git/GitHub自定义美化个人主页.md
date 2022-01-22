---
title: GitHub自定义美化个人主页.
date: 2021-05-06
categories:
 - tool
tags:
 - git
---

## 背景

偶然间在浏览谷歌浏览器的插件CSDN，里边有个网站商城，其中有个网站叫做[leetcode题解](https://leetcode-solution-leetcode-pp.gitbook.io/leetcode-solution/)，这个一个[大佬](https://github.com/azl397985856)写的非常不错的算法学习的网站，有兴趣可以看看。最近刚好在研究算法，被大佬写的学习方法和题解深深折服，在进入大佬的GitHub主页的时候，发现他的GitHub主页是自定义的，和默认的不一样。于是对此就充满了好奇。

初步看，实现这样的功能，好像是有一个和用户名一样的仓库，里边有一个README.md文件来实现的。于是乎就进行了一番搜索，最终实现了自己的GitHub自定义主页。

![谷歌浏览器擦汗CSDN](https://img-blog.csdnimg.cn/20210505200653606.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyOTM3NTIy,size_16,color_FFFFFF,t_70#pic_center)
<center><b><font size ='3'>谷歌浏览器CSDN插件-网站商城</font></b></center></font>

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210505202007406.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyOTM3NTIy,size_16,color_FFFFFF,t_70#pic_center)

<center><b><font size ='3'>大佬的GitHub主页</font></b></center></font>

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210506142627685.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyOTM3NTIy,size_16,color_FFFFFF,t_70#pic_center)

<center><b><font size ='3'>我的自定义GitHub主页</font></b></center></font>

<br>

## 如何实现GitHub自定义主页

其实相当简单，只需要创建一个**同名仓库**。在仓库下的`README.md`文件中进行自定义内容。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210505203615177.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyOTM3NTIy,size_16,color_FFFFFF,t_70#pic_center)
我这里已经创建了同名的仓库所以上面会出现警告，记得下面红框的要勾选，初始化一个README文件，这个文件就可以自定义主页。

## 自定义模板

内容方面，GitHub 给出了默认的欢迎内容，同时提供了一些建议和提示，这一部分默认被注释掉了。

```java
<!--
**shiwei-Ren/shiwei-Ren** is a ✨ _special_ ✨ repository because its `README.md` (this file) appears on your GitHub profile.

Here are some ideas to get you started:

- 🔭 I’m currently working on ...
- 🌱 I’m currently learning ...
- 👯 I’m looking to collaborate on ...
- 🤔 I’m looking for help with ...
- 💬 Ask me about ...
- 📫 How to reach me: ...
- 😄 Pronouns: ...
- ⚡ Fun fact: ...
-->
```

### 我的模板

[https://github.com/duktig666/duktig666](https://github.com/duktig666/duktig666)

### 推荐模板仓库
- [https://github.com/kautukkundan/Awesome-Profile-README-templates](https://github.com/kautukkundan/Awesome-Profile-README-templates)
- [https://github.com/rahuldkjain/github-profile-readme-generator](https://github.com/rahuldkjain/github-profile-readme-generator)

<br>

### 如何自定义模板
#### 自定义图标
经常在浏览GitHub时，发现别人项目中的`README.md`文件总能显示一些特殊的图标和统计数据，这些在自定义主页时也可以使用。

`README.md`中特殊图标的使用，来源于[**Simple Icons**](https://simpleicons.org/)，使用的是 [**Shields IO**](https://shields.io/) 语法。可以看到有很多的用法，具体如下：

- [Build](https://shields.io/category/build): 可视化自定义样式

- [Code Coverage](https://shields.io/category/coverage): 代码覆盖率样式

- [Analysis](https://shields.io/category/analysis): 数据解析样式

- [Chat](https://shields.io/category/chat): 状态展示样式

- [Dependencies](https://shields.io/category/dependencies): 依赖关系样式

- [Size](https://shields.io/category/size): 数值大小样式

- [Downloads](https://shields.io/category/downloads): 下载按钮样式

- [Funding](https://shields.io/category/funding): 项目金额来源样式

- [Issue Tracking](https://shields.io/category/issue-tracking): 问题状态和追踪样式

- [License](https://shields.io/category/license): 许可证样式

- [Rating](https://shields.io/category/rating): 标星样式

- [Social](https://shields.io/category/social): 社区信息样式

- [Version](https://shields.io/category/version): 版本号信息样式

- [Platform & Version Support](https://shields.io/category/platform-support): 平台支持和版本支持样式

- [Monitoring](https://shields.io/category/monitoring): 监控状态和方式样式

- [Activity](https://shields.io/category/activity): 项目活动样式

- [Other](https://shields.io/category/other): 其他自定义样式

<br>

#### 统计工具
关于GitHub相关数据统计显示可以参考这篇文章[**GitHub Readme Stats**](https://github.com/anuraghazra/github-readme-stats/blob/master/docs/readme_cn.md)（写的很详细）。

根据这篇文章可以实现如下图类似的特效：
![在这里插入图片描述](https://img-blog.csdnimg.cn/2021050520562344.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyOTM3NTIy,size_16,color_FFFFFF,t_70#pic_center)

<center><b><font size ='3'>个人GitHub统计卡片</font></b></center></font>

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210505210705273.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyOTM3NTIy,size_16,color_FFFFFF,t_70#pic_center)

<center><b><font size ='3'>个人GitHub使用热门语言</font></b></center></font>

#### 代码统计
代码统计需要运行 GitHub Action，GitHub 的相关教程可以先参考阮一峰老师的 [**GitHub Actions 入门教程**](http://www.ruanyifeng.com/blog/2019/09/getting-started-with-github-actions.html)。

后续更新........



<br>

#### 统计访问个人主页数量

```java
![描述](https://komarev.com/ghpvc/?username=your-github-username&color=green)
```
<br>

#### 自定义表情
可参考：[Github表情语法专栏](https://juejin.cn/post/6844904035103801352)

<br>

#### 扩展用法
参考：[https://github.com/abhisheknaiidu/awesome-github-profile-readme](https://github.com/abhisheknaiidu/awesome-github-profile-readme)

<br>

## 参考

- [GitHub主页美化](https://zj-git-guide.readthedocs.io/zh_CN/latest/platform/%5BGithub%5D%E4%B8%BB%E9%A1%B5%E7%BE%8E%E5%8C%96/)
- [https://sanii.cn/article/302](https://sanii.cn/article/302)
- [https://ld246.com/article/1602996971277](https://ld246.com/article/1602996971277)
- [GitHub 自定义首页，结合 GitHub Action 更香](https://zhuanlan.zhihu.com/p/180550738)
- [https://juejin.cn/post/6844904035103801352](https://juejin.cn/post/6844904035103801352)
- [https://juejin.cn/post/6844904114711691272](https://juejin.cn/post/6844904114711691272)