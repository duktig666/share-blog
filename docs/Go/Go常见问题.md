---
title: Go常见问题
date: 2022-03-23
publish: false
---



## Go依赖下载不下来

```sh
go env -w GOSUMDB=off
 
# 更换代理，无需翻墙。
go env -w GOPROXY=https://goproxy.cn,direct
```

