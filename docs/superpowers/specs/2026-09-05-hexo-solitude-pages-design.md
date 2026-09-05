# Hexo → Solitude 4 页面兼容迁移设计

## 目标

在不破坏现有文章链接的前提下，完成博客从 Matery/旧 Hexo 页面结构到 Solitude 4 的页面与导航收口。

现有文章 permalink 继续由根配置 `_config.yml` 统一生成，保持：

```yaml
permalink: posts/:abbrlink/
```

文章 URL 不因主题切换发生变化。

---

## 范围

* 保留现有文章 URL。
* 保留归档、分类、标签、友链、关于和 404 页面。
* 统一 Solitude 导航菜单，使菜单目标与实际生成 URL 一致。
* 检查现有页面 front-matter 是否符合 Solitude 4 页面类型及数据结构：

  * `about`
  * `links`
  * `categories`
  * `tags`
  * `404`
* 保留现有文章、附件和主题资源，不主动删除 Matery 遗留资源。
* 对旧主题遗留页面入口进行兼容检查，仅在目标页面实际缺失时增加最小兼容入口。
* 构建后验证页面生成结果及站内关键链接。

---

## 设计原则

### 1. 文章 permalink 保持唯一且不随主题变化

文章 URL 唯一由根配置 `_config.yml` 中的 `permalink` 决定。

禁止：

* 在 Solitude 配置中新增文章路径规则。
* 修改现有 `abbrlink`。
* 为兼容主题重新定义文章 permalink。
* 因页面迁移批量修改历史文章 URL。

目标：

```text
/posts/<abbrlink>/
```

继续作为全部历史文章的稳定 URL。

---

### 2. 导航菜单以 Solitude 配置为唯一来源

导航菜单统一由 `_config.solitude.yml` 中的：

```yaml
nav:
  menu:
```

维护。

所有导航目标使用统一的带尾斜杠路径，例如：

```text
/archives/
/categories/
/tags/
/friends/
/about/
```

禁止同时在旧主题配置、页面模板或其他自定义配置中维护第二套导航路径。

---

### 3. 页面由 source 页面文件负责生成，Solitude 负责渲染

页面继续放在：

```text
source/
```

目录中，由 front-matter 指定页面类型。

例如：

```yaml
---
title: 关于
type: about
---
```

或 Solitude 所要求的对应页面结构。

页面的职责是提供内容和页面类型；主题模板负责最终 HTML 渲染。

---

### 4. 页面 URL 与导航目标必须显式对应

不能仅以“存在 `source/about/index.md`”判断页面一定可访问。

迁移时同时确认：

```text
source/about/index.md
        ↓
Hexo permalink / page path
        ↓
public/about/index.html
        ↓
导航 /about/
```

最终必须形成闭环：

```text
导航 URL
   ↓
实际生成 URL
   ↓
public/ 对应 HTML
```

---

## 页面兼容矩阵

迁移前后逐项确认：

| 页面  | source 入口            | Solitude 类型 | 目标 URL         | 必须生成                           |
| --- | -------------------- | ----------- | -------------- | ------------------------------ |
| 首页  | `source/index.*`     | index       | `/`            | `public/index.html`            |
| 归档  | `source/archives/`   | archives    | `/archives/`   | `public/archives/index.html`   |
| 分类  | `source/categories/` | categories  | `/categories/` | `public/categories/index.html` |
| 标签  | `source/tags/`       | tags        | `/tags/`       | `public/tags/index.html`       |
| 友链  | `source/friends/`    | links       | `/friends/`    | `public/friends/index.html`    |
| 关于  | `source/about/`      | about       | `/about/`      | `public/about/index.html`      |
| 404 | 主题/页面入口              | 404         | `/404.html`    | `public/404.html`              |

实际目录和文件名以当前项目为准；如果 Solitude 对某个页面使用不同的 `type` 或数据结构，应以 Solitude 4 当前实现为准，而不是机械沿用 Matery 的 front-matter。

---

## 迁移步骤

### Phase 1：盘点现有页面

检查：

```text
source/
_config.yml
_config.solitude.yml
themes/
```

确认：

* 当前文章 permalink。
* 当前 `abbrlink` 生成方式。
* 现有页面文件。
* Matery 遗留页面。
* Solitude 页面模板要求。
* 当前导航配置。

不得在此阶段修改文章 URL。

---

### Phase 2：收口页面结构

按照 Solitude 4 要求检查并修正：

```text
source/about/
source/friends/
source/categories/
source/tags/
source/archives/
```

只修正：

* front-matter
* `type`
* `data`
* 页面入口
* 页面路径

不修改文章内容及文章 permalink。

---

### Phase 3：收口导航

仅修改 `_config.solitude.yml` 的 `nav.menu`。

确保导航目标统一为：

```text
/
/archives/
/categories/
/tags/
/friends/
/about/
```

每一个导航 URL 都必须能在构建后的 `public/` 中找到对应页面。

---

### Phase 4：兼容旧入口

检查 Matery/旧主题是否存在历史入口，例如：

```text
/friendslink/
/friend/
/link/
/about/index.html
```

以及其他旧页面路径。

处理原则：

1. 已存在且仍可用：保留。
2. 已不使用：不主动迁移。
3. 新导航不再指向旧入口。
4. 因 Solitude 页面缺失导致功能不可用：增加最小兼容入口。
5. 不为“整洁”目的删除 Matery 资源。

---

## 验证

### 1. 构建验证

运行：

```bash
npm run build
```

要求：

* Hexo 构建成功。
* 无阻断性错误。
* Solitude 页面模板正常渲染。

---

### 2. 页面生成验证

确认以下文件实际存在：

```text
public/index.html
public/archives/index.html
public/categories/index.html
public/tags/index.html
public/friends/index.html
public/about/index.html
public/404.html
```

不要只检查目录存在。

---

### 3. 导航闭环验证

从 `_config.solitude.yml` 中提取全部导航 URL，逐项检查其对应生成结果。

例如：

```text
/archives/
    → public/archives/index.html

/categories/
    → public/categories/index.html

/tags/
    → public/tags/index.html

/friends/
    → public/friends/index.html

/about/
    → public/about/index.html
```

要求导航配置中不存在构建后无法访问的目标路径。

---

### 4. 文章 URL 验证

随机抽取若干现有文章，确认：

```text
source/post
    ↓
public/posts/<abbrlink>/index.html
```

并检查最终页面链接仍为：

```text
/posts/<abbrlink>/
```

迁移前后至少抽取：

* 一篇旧文章
* 一篇近期文章
* 一篇带图片/附件文章
* 一篇带分类和标签文章

确认 URL 与内容均正常。

---

### 5. 站内链接验证

检查：

* 首页 → 文章
* 首页 → 归档
* 首页 → 分类
* 首页 → 标签
* 首页 → 友链
* 首页 → 关于
* 文章 → 分类
* 文章 → 标签
* 文章 → 上一篇/下一篇
* 文章 → 返回归档/首页

避免出现主题切换导致的内部链接失效。

---

## 非目标

本次迁移不处理：

* 主题视觉重新设计。
* 文章内容重写。
* 文章 permalink 改造。
* `abbrlink` 重生成。
* 评论系统迁移。
* 部署仓库迁移。
* DNS/CDN 调整。
* 外部服务迁移。
* Matery 资源清理。

Matery 遗留资源仅在后续确认无依赖后单独清理。

---

## 完成标准

满足以下条件才视为迁移完成：

1. `npm run build` 成功。
2. 首页、归档、分类、标签、友链、关于、404 均实际生成。
3. Solitude 导航全部指向有效页面。
4. 历史文章 URL 仍保持 `/posts/<abbrlink>/`。
5. 随机抽查文章不存在 URL 漂移。
6. 关键站内链接不存在明显断链。
7. 未发生未经确认的文章内容、资源和外部服务迁移。
