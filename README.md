# 个人状态记录器

一个面向个人使用的轻量状态记录工具，支持：

- 每日记录 6 个核心状态指标
- 状态面板与状态规则判定
- 历史记录查看、编辑、删除
- 最近 7 天 / 30 天趋势图
- JSON 导出 / 导入
- PWA 安装到手机主屏幕
- LocalStorage 本地存储

## 技术栈

- React
- Vite
- TypeScript
- Tailwind CSS
- Chart.js
- vite-plugin-pwa

## 本地开发

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

## 本地构建

```bash
npm run build
```

构建产物位于：

```text
dist/
```

## 本地预览

```bash
npm run preview
```

## 数据存储说明

应用数据保存在当前设备浏览器的 LocalStorage 中，key 为：

```text
personal_state_records
```

说明：

- 不会上传到服务器
- 不会自动同步到其他设备
- 清理浏览器缓存后数据可能丢失
- 建议定期导出 JSON 备份

## 数据迁移

如果你想把电脑上的数据迁移到手机：

1. 在电脑端打开应用；
2. 进入设置页，点击“导出 JSON”；
3. 将导出的 JSON 文件发送到手机；
4. 在手机端打开部署后的应用；
5. 进入设置页，点击“导入 JSON”；
6. 选择文件完成导入。

导入规则：

- 顶层必须是 `StateRecord[]`
- 以 `date` 作为唯一标识
- 同日期记录会覆盖本地记录
- 新日期记录会新增
- 非法 JSON 不会覆盖现有本地数据

## PWA 说明

项目已接入 PWA 配置，支持添加到手机主屏幕。

Manifest 关键配置：

- name: `个人状态记录器`
- short_name: `状态记录`
- display: `standalone`
- start_url: `/`

图标路径：

```text
public/icons/icon-192.png
public/icons/icon-512.png
```

### iPhone 安装方式

1. 使用 Safari 打开应用；
2. 点击“分享”；
3. 选择“添加到主屏幕”。

### Android 安装方式

1. 使用 Chrome 打开应用；
2. 点击浏览器菜单；
3. 选择“添加到主屏幕”或“安装应用”。

## 部署到 Vercel

推荐使用 Vercel 部署。

步骤：

1. 将项目推送到 GitHub；
2. 登录 Vercel；
3. 选择 **Import Project**；
4. 选择仓库；
5. Framework Preset 选择：

```text
Vite
```

6. Build Command：

```bash
npm run build
```

7. Output Directory：

```text
dist
```

8. Install Command：

```bash
npm install
```

9. 点击 Deploy；
10. 用手机访问部署后的 URL；
11. 添加到主屏幕。

## 路由说明

当前项目未使用 React Router，而是采用内部 Tab 状态切换，因此部署到 Vercel 时通常不需要额外 rewrite 配置。

## 当前版本

当前已实现 v0.1 / v0.1.1 主要能力：

- v0.1：记录、面板、历史、趋势、设置、导出
- v0.1.1：PWA、手机主屏幕支持、JSON 导入、迁移说明、手机端适配基础优化