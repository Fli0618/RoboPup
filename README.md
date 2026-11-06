# RoboPup · PA35 四足设计评审

当前设计主线：**D1_MAIN_DIRECT_GRIPS_004**。

网站入口：**https://Fli0618.github.io/RoboPup/**（须先启用本仓库 GitHub Pages）。

网站按四个入口整理：

- **当前方案**：完整四足、D1杯式连接、M1/M3直接适配与原上销固定。
- **部件对比**：原CAD与当前MAIN的实际前后图、部位定位和连接关系。
- **仿真进展**：Isaac Lab实际站立与微步记录、视频和测试边界。
- **历史记录**：R2、R4和未采用的C1候选，保留来源与模型计数口径。

## 当前状态

机械模型为356个建模项、344个命名实例、12台实际PA35。原CAD219项与当前356项之间的模型差额，不等于实物采购BOM净增137件；原CAD没有画齐部分紧固件。

在探索参数下，Isaac Lab完成10秒自由站立与14.2秒四足微步。质量、惯量、电机能力等尚未按实物校准；连续行走和小跑未验证。机械制造尚未放行，夹紧、螺钉座面、销接合、完整运动干涉及承载仍需继续核对。

## 目录

```text
docs/                       GitHub Pages静态网站
  index.html                同一页面，四个内容入口
  resources/                实际引用的跨目录图片、数据与局部设计文件
  publication-manifest.json 原始文件与发布副本的哈希及发布范围
scripts/build_from_workspace.py 从完整本地评审工作目录重建发布副本
scripts/check_site.py       本地/CI静态资源和脚本检查
.github/workflows/check.yml 推送后的静态检查
```

整机STEP与完整仿真ZIP较大，放在[版本化Release](https://github.com/Fli0618/RoboPup/releases/tag/design-main-2026-11-06)中。历史大型CAD和独立旧评审页没有全部发布；相关入口会明确说明，历史前后图和主要台账保留。

## 启用 GitHub Pages

仓库管理员在 **Settings → Pages → Build and deployment** 中选择：

1. Source：**Deploy from a branch**
2. Branch：**main**
3. Folder：**/docs**
4. Save

之后更新`main`分支的`docs/`即可自动发布。无需Node构建或数据库，也不要将整个本地CAD工作目录上传。

## 本地查看与检查

```bash
python scripts/check_site.py
python -m http.server 8000
```

浏览器打开`http://127.0.0.1:8000/docs/`。直接打开HTML也可查看多数内容；HTTP预览更接近实际部署环境。

URL兼容原有`region`、`leggroup`、`view`及D1连接图锚点；新增`section=main/parts/sim/history`导航。

发布副本去除了本机Windows路径并改写资源链接。证据文档中的原始SHA用于追溯本地原始资料，发布副本SHA另见`publication-manifest.json`，二者不应混用。

## 从本地设计工作目录更新

本仓库保留适合浏览和分发的文件，不是整个CAD工作目录备份。需要更新时，将环境变量`ROBOPUP_SOURCE_OUTPUT`设为完整工作目录的`output`文件夹，然后运行：

```bash
python scripts/build_from_workspace.py
python scripts/check_site.py
```

检查前后图、当前计数和仿真边界后，提交`docs/`的变化。需要更新大型整机或仿真包时，应另发新的Release并更新链接，避免覆盖既有版本化资产。
