# Hexo → Solitude 4 页面兼容迁移设计

## 目标

在不破坏现有文章链接的前提下，完成博客从 Matery/旧 Hexo 页面结构到 Solitude 4 的页面与导航收口。现有文章 permalink 继续由 `_config.yml` 中的 `posts/:abbrlink/` 统一生成。

## 范围

- 保留现有文章 URL、归档、分类、标签、友链、关于和 404 页面。
- 统一 Solitude 导航菜单，使菜单指向实际生成的页面路径。
- 检查页面 front-matter 与 Solitude 页面类型（`about`、`links`、`categories`、`tags`、`404`）。
- 保留现有内容和资源；只补充缺失的兼容入口或配置，不重排文章路径。
- 构建后验证关键页面和站内链接均已生成。

## 方案

1. 以根配置中的 permalink 作为文章 URL 唯一来源，不引入新的路径规则。
2. 以 `_config.solitude.yml` 中的 `nav.menu` 作为导航唯一来源，统一使用带尾斜杠的页面路径。
3. 页面文件继续放在 `source/` 对应目录，通过 Solitude 的 `type` 和 `data` 字段驱动渲染。
4. 对旧主题遗留的页面入口做兼容检查；只有在生成结果缺失时才添加最小补丁。

## 验证

- 运行 `npm run build`，确认 Hexo/Solitude 构建无错误。
- 检查 `public/` 下存在 `index.html`、`archives/`、`categories/`、`tags/`、`friends/`、`about/` 和 `404.html`。
- 检查导航配置中的每个目标路径都对应生成文件。
- 检查现有文章链接仍以 `/posts/<abbrlink>/` 形式生成。

## 非目标

- 不更换主题视觉风格。
- 不迁移评论系统、部署仓库或外部服务。
- 不删除 Matery 资源，除非后续单独确认清理。
