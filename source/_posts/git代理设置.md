---
title: Git 代理故障排查：从连接失败到恢复访问
date: 2022-07-12 08:00:00
tags:
  - Git
  - 代理
  - 网络排错
  - 开发工具
abbrlink: 4031382402
---

执行 `git clone`、`git pull` 或 `git push` 时，如果看到 `Failed to connect to github.com port 443`，通常是当前网络无法直接访问 GitHub，或者 Git 保存了一个已经失效的代理地址。

## 一、先检查现有代理

```bash
git config --global --get http.proxy
git config --global --get https.proxy
```

也可以查看完整配置：

```bash
git config --global --list --show-origin
```

## 二、设置 HTTP/HTTPS 代理

假设本机代理监听地址是 `127.0.0.1:10809`：

```bash
git config --global http.proxy http://127.0.0.1:10809
git config --global https.proxy http://127.0.0.1:10809
```

设置后重新执行：

```bash
git ls-remote https://github.com/zhang-4411/zhang-4411.github.io.git
```

这个命令只读取远端信息，适合用来验证连接是否恢复。

## 三、代理失效时取消设置

如果代理软件已经关闭，旧配置反而会导致所有 Git 请求失败，可以删除代理：

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

## 四、SSH 与 HTTPS 是两条链路

HTTPS 使用 `http.proxy` 和 `https.proxy` 配置；SSH 使用 `~/.ssh/config` 中的 `ProxyCommand` 或代理工具配置。修改 HTTPS 代理不会自动影响 SSH，排查时要先确认远端地址：

```bash
git remote -v
```

## 五、排查顺序建议

1. 确认代理软件正在运行，并核对端口。
2. 检查 Git 是否保存了旧代理。
3. 用 `git ls-remote` 验证，而不是直接反复 push。
4. 确认远端地址是 HTTPS 还是 SSH。

遇到连接问题时，先区分“网络不可达”和“Git 配置错误”，通常比反复修改仓库地址更快找到原因。
