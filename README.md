# 图片处理工具

一个简单的基于Web的图片处理工具，可以调整图片尺寸（像素）和文件大小。

## 功能特点

- 调整图片分辨率（像素尺寸）
- 控制输出图片文件大小
- 支持JPEG、PNG和WebP格式
- 保持宽高比例选项
- 实时预览
- 无需后端服务，纯前端实现

## 本地使用

1. 克隆或下载此仓库
2. 安装依赖：`npm install`
3. 编译TypeScript：`npm run build`
4. 在浏览器中打开`index.html`文件

## 使用流程

1. 点击上传区域选择要处理的图片
2. 调整所需的宽度、高度和质量参数
3. 如果需要特定的文件大小，可以在"目标文件大小"输入框中指定（单位：MB）
4. 点击"处理图片"按钮
5. 处理完成后，可以点击"下载图片"保存结果

## 部署到Cloudflare Pages

### 自动部署

1. 在GitHub上创建仓库并上传代码
2. 登录Cloudflare Dashboard
3. 进入Pages选项，点击"创建应用程序"
4. 连接GitHub仓库
5. 配置构建设置：
   - 构建命令：`npm run deploy`
   - 输出目录：`dist`
6. 点击部署即可

### 手动部署

1. 在本地运行：`npm run deploy`
2. 安装Wrangler CLI：`npm install -g wrangler`
3. 登录Cloudflare：`wrangler login`
4. 部署到Pages：`wrangler pages deploy dist`

## 技术实现

- 使用HTML5 Canvas进行图片处理
- TypeScript确保类型安全
- 纯前端实现，不依赖服务器

## 浏览器兼容性

支持所有现代浏览器（Chrome、Firefox、Safari、Edge）的最新版本。 