---
title: Git报错
tag: git
abbrlink: 1
---
### 解决Failed to connect to github.com port 443:Connection refused



解决方案如下：

本地有连接vpn，通过在终端输入以下命令解决：



说明：7890为本地混合配置的端口号

``` bash
git config --global http.proxy http://127.0.0.1:10809
```

