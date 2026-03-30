# Personal Blog

这是一个基于 `Hexo + hexo-theme-amazing` 的个人博客工程，已经按“操作系统 / 内核 / 系统性能分析”方向做了首轮初始化。

博客源码在 `blog/` 目录下。

## 本地开发

先安装依赖：

```bash
cd blog
pnpm install
cd themes/amazing
npm install
cd ../..
```

本地启动：

```bash
cd blog
pnpm run server
```

默认访问 `http://localhost:4000`。

## GitHub Pages 发布

仓库根目录已经包含 GitHub Actions 工作流，会自动构建 `blog/public` 并发布到 GitHub Pages。

建议直接把 GitHub 仓库命名成 `<your-github-username>.github.io`，这样站点根路径就是 `/`，不需要再处理二级路径。

发布前至少改这几处：

1. `blog/_config.yml`
   把 `url` 改成你自己的 GitHub Pages 域名。
2. `blog/_config.amazing.yml`
   把作者信息、侧边栏文案、站点说明改成你自己的内容。
3. `blog/source/about/index.md`
   改成你的个人介绍。

推送步骤：

```bash
git init -b main
git add .
git commit -m "Initialize Hexo blog"
git remote add origin <your-repo-url>
git push -u origin main
```

然后到 GitHub 仓库的 `Settings > Pages` 中把 Source 设为 `GitHub Actions`。

## 目录说明

- `blog/_config.yml`：Hexo 站点配置
- `blog/_config.amazing.yml`：主题覆盖配置
- `blog/source/_posts/`：文章
- `blog/source/images/`：站点图形资源
- `blog/themes/amazing/`：主题源码
