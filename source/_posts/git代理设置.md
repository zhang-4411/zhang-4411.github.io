---
title: Git报错
tag: git
abbrlink: 4031382402
---
### 解决Failed to connect to github.com port 443:Connection refused



解决方案如下：

本地有连接vpn，通过在终端输入以下命令设置git代理地址解决：



说明：10809为本地代理的端口号，打开电脑设置->网络和Internet->代理->手动设置代理查看代理端口号

``` bash
git config --global http.proxy http://127.0.0.1:10809
```

