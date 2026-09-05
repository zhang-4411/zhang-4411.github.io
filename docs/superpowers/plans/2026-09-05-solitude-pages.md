# Solitude 4 页面兼容迁移 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 按更新后的迁移设计完成 Solitude 4 页面、导航与旧链接兼容检查，同时保持文章 permalink 不变。

**Architecture:** 根 `_config.yml` 继续负责文章 permalink；`_config.solitude.yml` 负责唯一导航；`source/` 页面 front-matter 负责页面类型；构建产物 `public/` 作为最终验证依据。只做页面与配置的最小修正，不改文章 URL、内容或外部服务。

**Tech Stack:** Hexo 7.3、hexo-theme-solitude 4.0、YAML/Markdown、PowerShell、npm build。

---

### Task 1: Verify page inputs and permalink invariants

**Files:**
- Read: `_config.yml`, `_config.solitude.yml`, `source/about/index.md`, `source/friends/index.md`, `source/categories/index.md`, `source/tags/index.md`, `source/404/index.md`

- [ ] **Step 1: Confirm invariant values**

Run:

```powershell
Select-String -Path _config.yml -Pattern '^permalink:|^theme:'
```

Expected: `permalink: posts/:abbrlink/` and `theme: solitude`.

- [ ] **Step 2: Confirm page types**

Run:

```powershell
rg -n "^(title|type|layout|data):" source/about source/friends source/categories source/tags source/404
```

Expected: `about`, `links` with `data: links`, `categories`, `tags`, and 404 layout are present.

### Task 2: Normalize Solitude navigation and page paths

**Files:**
- Modify: `_config.solitude.yml:17-26`

- [ ] **Step 1: Keep one navigation source**

Ensure `nav.menu` contains these exact targets and no stale page targets:

```yaml
nav:
  menu:
    首页: /
    文章:
      归档: /archives/ || fas fa-folder-closed
      分类: /categories/ || fas fa-clone
      标签: /tags/ || fas fa-tags
    友链:
      友情链接: /friends/ || fas fa-user-group
    我的:
      关于: /about/ || fas fa-user
```

- [ ] **Step 2: Check old entry references**

Run:

```powershell
rg -n "friendslink|/friend/|/link/|layout: (friends|categories|tags|about)" _config.yml _config.solitude.yml source themes
```

Expected: no active Solitude navigation points to old entry names; legacy resources remain untouched.

### Task 3: Build and validate generated pages

**Files:**
- Generate: `public/` (Hexo build output; do not hand-edit)

- [ ] **Step 1: Build**

Run:

```powershell
npm run build
```

Expected: exit code 0 and Solitude 4 reports successful generation.

- [ ] **Step 2: Verify required files**

Run:

```powershell
$required = 'public/index.html','public/archives/index.html','public/categories/index.html','public/tags/index.html','public/friends/index.html','public/about/index.html','public/404.html'
$required | ForEach-Object { if (-not (Test-Path $_)) { throw "Missing $_" } }
```

Expected: command completes without throwing.

- [ ] **Step 3: Verify article URLs**

Run:

```powershell
$expected = 'public/posts/507015846/index.html','public/posts/2286445522/index.html','public/posts/4031382402/index.html','public/posts/1243066710/index.html'
$expected | ForEach-Object { if (-not (Test-Path $_)) { throw "Missing $_" } }
```

Expected: all four existing article outputs are present.

### Task 4: Check navigation-to-output closure and internal links

**Files:**
- Read: `public/index.html`, `public/archives/index.html`, `public/categories/index.html`, `public/tags/index.html`, `public/friends/index.html`, `public/about/index.html`

- [ ] **Step 1: Check configured targets**

Run:

```powershell
$targets = '/','/archives/','/categories/','/tags/','/friends/','/about/'
$map = @{ '/']='public/index.html'; '/archives/'='public/archives/index.html'; '/categories/'='public/categories/index.html'; '/tags/'='public/tags/index.html'; '/friends/'='public/friends/index.html'; '/about/'='public/about/index.html' }
$targets | ForEach-Object { if (-not (Test-Path $map[$_])) { throw "Missing output for $_" } }
```

Expected: all targets map to generated HTML.

- [ ] **Step 2: Check representative cross-links**

Run:

```powershell
rg -n "(/archives/|/categories/|/tags/|/friends/|/about/|/posts/507015846/|/posts/2286445522/)" public/index.html public/about/index.html public/posts/507015846/index.html
```

Expected: representative homepage, about, and article links resolve to the stable paths above.

### Task 5: Final verification and status report

- [ ] **Step 1: Re-run build after any minimal fixes**
- [ ] **Step 2: Capture `git diff --check` output**
- [ ] **Step 3: Report changed source/config files and validation results; leave Matery assets and external services unchanged.**
