---
title: git 常用操作
date: 2022-05-01 
categories:
 - tool
tags:
 - git
---

## git修改远程仓库地址

`git remote -v`     查看关联远程仓库地址

`git remote set-url origin 新的地址`      修改远程仓库地址

`git remote -v`     查看是否修改成功



## git clone 远程仓库的某个分支/tag

`git clone -b 分支名/tag xxx.git`



## git tag

```sh
# 创建tag
git tag <tag_name> 
git tag -a <tag_name> -m "message"
# 为特定的commit创建tag
git tag <tag_name> <commit_sha>
# tag 推送指定版本到远程版本库
git push origin <tag_name>
# tag 推送到远程版本库
git push --tags
git push origin <branch> --tags
# 查看tag
git tag
git tag -l "1.0*"
# 获取标签的详细信息
git show <tag_name>
# 删除tag
git tag -d <tag_name>
# 删除远程仓库的tag
git push origin :refs/tags/<tag_name>
# 将远程仓库的标签拉取（同步）到当前分支
git fetch --tags
# 切换tag
git checkout <tag_name>
```





## 远程分支改变，如何同步本地？

```shell
git branch -m master main
git fetch origin
git branch -u origin/main main
git remote set-head origin -a
```



## git强制提交本地代码到远程

```shell
git init
git remote add origin 远程仓库地址
git add . 
git commit -m “添加注释信息"
#强制提交
git push -u origin master -f 
```



## 版本回退

```shell
#查看历史提交日志
git log  
git log --pretty=oneline
#查看历史命令
git reflog
#回退指定版本
git reset --hard commit_id
##HEAD代表当前版本，一个^代表向上回退一个版本
git reset --hard HEAD^
```



## 中文乱码问题

```shell
# git status 乱码
git config --global core.quotepath false

#git commit 乱码
git config --global i18n.commitencoding utf-8

#git status 乱码
git config --global i18n.logoutputencoding utf-8
```

注意：如果是Linux系统，需要设置环境变量 `export LESSCHARSET=utf-8`

[Git for windows 中文乱码解决方案](https://www.cnblogs.com/ayseeing/p/4203679.html)



## git在.gitignore添加忽略文件不起作用

```shell
git rm -r --cached .
```

重新`add`和`commit`即可解决



## 多分支合并代码

对于多分支的代码库，将代码从一个分支转移到另一个分支是常见需求。

这时分两种情况。一种情况是，你需要另一个分支的所有代码变动，那么就采用合并（`git merge`）。另一种情况是，你只需要部分代码变动（某几个提交），这时可以采用 Cherry pick。

```sh
## 得到最新一次提交的commitHash（类似5b6612d84a7f401f4519b73f38348bc094ba5501）
git log -n1 --format=format:"%H"
## 可以查看所有的提交信息
git log
## Cherry pick 支持一次转移多个提交
git cherry-pick <HashA> <HashB>
```

参看：[git cherry-pick 教程（阮一峰的网络日志）](http://www.ruanyifeng.com/blog/2020/04/git-cherry-pick.html)



## merge 和 rebase

比如`git pull`这个命令，我们经常会用，它默认是使用`merge`方式将远端别人的修改拉到本地；如果带上上参数`git pull -r`，就会使用`rebase`的方式将远端修改拉到本地。

这二者最直观的区别就是：`merge`方式合并的分支会有很多「分叉」，而`rebase`方式合并的分支就是一条直线。

**对于多人协作，`merge`方式并不好**。

那么问题来了，`rebase`是如何将两条不同的分支合并到同一条分支的呢：

![image-20211220094646114](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202112200947816.png)

**首先，找到这两条分支的最近公共祖先`LCA`，然后从`master`节点开始，重演`LCA`到`dev`几个`commit`的修改**，如果这些修改和`LCA`到`master`的`commit`有冲突，就会提示你手动解决冲突，最后的结果就是把`dev`的分支完全接到`master`上面。

假设你现在基于远程分支"origin"，创建一个叫"mywork"的分支。

但是与此同时，有些人也在"origin"分支上做了一些修改并且做了提交了. 这就意味着"origin"和"mywork"这两个分支各自"前进"了，它们之间"分叉"了。

![image-20211220110915080](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202112201109279.png)

在这里，你可以用"pull"命令把"origin"分支上的修改拉下来并且和你的修改合并； 结果看起来就像一个新的"合并的提交"(merge commit)：

![image-20211220111009074](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202112201110093.png)

但是，如果你想让"mywork"分支历史看起来像没有经过任何合并一样，你也许可以用 git rebase:

![image-20211220111043121](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202112201110178.png)

解决冲突：

- `git rebase  --continue`：这样git会继续应用(apply)余下的补丁。
- `git rebase  --abort`：在任何时候，你可以用--abort参数来终止rebase的行动，并且"mywork" 分支会回到rebase开始前的状态。

对于使用 git merge 来合并所看到的commit的顺序（从新到旧）是： C7 , C6 , C4, C5 , C3 ,C2,C1
对于使用 git rebase 来合并所看到的commit的顺序（从新到旧）是： C7 , C6‘,C5' ,C4,C3, C2,C1



## git merge技巧

### 合并单个commit

首先，我们需要把A分支上提交的部分代码，放在B分支上

```shell
git checkout B  // 切换到B分支
git cherry-pick 43aea9af  // 把某一次的commit合并到B分支，其中’43aea9af‘是某次commit提交记录的ID
git push origin B  // 把分支B推送到远程仓库
```

### 合并连续的多个commit

果我们想要合并多个连续的commit，用上面的第一种方法，显然效率不高，可以使用一下方法：
比如我们再A分支上有43aea9af到70dfeec2a的连续的10个commit要合并到B分支上

首先基于A分支创建一个临时分支temp，并指明新分支的最后一个commit

```shell
git checkout -b temp 70dfeec2a
```

将temp分支上的从43aea9af到最后一个commit，也就是70dfeec2a的commit合并到B分支上

```shell
git rebase --into B 43aea9af^
```

### 多个commit合成一个

参看： [如何将git的多个commit合成一个了?](https://zhuanlan.zhihu.com/p/507794054)

```shell
# 修改 commit -m 的备注信息
# 这时候就会弹出一个操作框需要会点基本的vim操作
git commit --amend

# 后续commit提交前操作
# --no-edit就是表示我们不修改了还是和前面那个提交同一个提交
git commit --amend --no-edit

# 后续commit已提交操作
git rebase -i HEAD~2
git rebase -i <版本号>
```





