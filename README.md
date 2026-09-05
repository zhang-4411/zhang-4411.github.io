# 小帅的博客（zhang-4411.github.io）

基于 [Hexo](https://hexo.io/) 7 + [Matery](https://github.com/blinkfox/hexo-theme-matery) 主题的个人博客，部署在 GitHub Pages：

> <https://zhang-4411.github.io>

## 分支说明

| 分支 | 用途 |
| --- | --- |
| `release` | 当前发布分支（源码以此为准） |
| `codex/matery-refresh` | Matery 主题刷新的开发分支 |
| `backup` | 仓库默认分支，早期源码历史 |
| `main` | **仅存放生成的静态页面**（hexo deploy 自动推送），不要手动修改 |

## 环境准备

- Node.js（建议 16+）与 Git
- GitHub SSH key 已配置（`ssh -T git@github.com` 能通过认证）

```bash
git clone git@github.com:zhang-4411/zhang-4411.github.io.git
cd zhang-4411.github.io
git checkout release
npm install
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npx hexo server` | 本地预览，<http://localhost:4000> |
| `npx hexo clean` | 清除缓存（`db.json`）与 `public/` |
| `npx hexo generate` | 生成静态页面到 `public/` |
| `npx hexo deploy` | 部署：把 `public/` 推送到 `main` 分支 |

发布完整流程：

```bash
npx hexo clean && npx hexo generate && npx hexo deploy
```

`node_modules/`、`public/`、`db.json` 均已加入 `.gitignore`，不会提交。

## 写文章

文章放在 `source/_posts/`，新建时可基于 `scaffolds/post.md` 模板：

```markdown
---
title: 文章标题
date: 2026-09-05 08:00:00
tags:
  - 标签
categories:
  - 分类
abbrlink: 1234567890   # 可省略
---
```

- 站点使用 `permalink: posts/:abbrlink/`，文章链接由 [hexo-abbrlink](https://github.com/rozbo/hexo-abbrlink) 生成（crc32 / dec）。
- 旧文章的 `abbrlink` 已固化在 front matter 中，**不要改动**，否则链接会变。
- 新文章首次构建会自动生成 `abbrlink`，建议把它写回 front matter 并提交，保证 URL 稳定。

## 代码块样式与复制（重要约定）

Hexo 默认启用了 **prismjs**（`highlight.enable: false`），高亮代码的 DOM 结构是
`figure.highlight > table > td.gutter + td.code`，且代码在 `pre > span.line` 中、**没有 `code` 包裹**。这带来两个容易踩的坑，改动前请先了解：

1. `matery.css` 中正文表格的通用样式（`#articleContent table` 的 `display: block`、`td` 的 `min-width` / 边框）会连带命中代码块的 `<table>`，破坏其两列布局。因此 `figure.highlight` 区块里专门放了 `#articleContent figure.highlight` 的高优先级例外规则——**删除会导致代码块右侧出现断裂的深色空块**。
2. `themes/hexo-theme-matery/source/libs/codeBlock/` 下的复制脚本已兼容 `pre > span.line` 与 `pre > code` 两种结构；给代码块套 `.code-area` 的逻辑见同目录 `codeBlockFuction.js`。

## 部署说明

- 部署由 [hexo-deployer-git](https://github.com/hexojs/hexo-deployer-git) 完成：`hexo deploy` 会**强制推送**生成结果到 `main` 分支（提交信息形如 `Site updated: ...`），GitHub Pages 随后自动构建发布。
- `_config.yml` 的 `deploy.repo` 使用 SSH 地址，避免推送时卡在凭据交互。
- `main` 分支上的所有内容都是生成产物，手动改动会被下一次部署覆盖。

## 目录结构

```
├── _config.yml              # Hexo 站点配置（含 deploy 目标）
├── source/
│   ├── _posts/              # 文章
│   ├── about/ tags/ ...     # 独立页面
│   └── medias/              # 图片等静态资源
├── themes/hexo-theme-matery/
│   ├── _config.yml          # 主题配置
│   ├── layout/              # 模板
│   └── source/              # 主题样式与脚本（代码块相关在 libs/codeBlock/）
└── scaffolds/               # 新建文章模板
```
