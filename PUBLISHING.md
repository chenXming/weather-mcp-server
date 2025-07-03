# 📦 NPM 发布指南

## 🚀 快速发布步骤

### 1. 准备工作

#### 更新配置信息
在发布前，请修改以下文件中的占位符：

**package.json**
```json
{
  "name": "@your-username/mcp-weather-server",  // 改为你的用户名
  "author": "Your Name <your.email@example.com>",  // 改为你的信息
  "repository": {
    "url": "https://github.com/your-username/mcp-weather-server.git"  // 改为你的仓库
  },
  "homepage": "https://github.com/your-username/mcp-weather-server#readme"  // 改为你的仓库
}
```

**README.md**
- 搜索并替换所有 `@your-username/mcp-weather-server` 为你的包名
- 搜索并替换所有 `your-username` 为你的 GitHub 用户名
- 更新联系邮箱等信息

**LICENSE**
- 更新 `Your Name` 为你的真实姓名

### 2. 发布前检查

运行准备脚本检查一切是否就绪：
```bash
./prepare-publish.sh
```

### 3. npm 登录

如果还没有 npm 账户，先注册：
```bash
npm adduser
```

如果已有账户，登录：
```bash
npm login
```

### 4. 发布包

对于 scoped package（推荐）：
```bash
npm publish --access public
```

对于普通包名：
```bash
npm publish
```

## 🔄 版本管理

### 更新版本
```bash
# 补丁版本 (1.0.0 -> 1.0.1)
npm version patch

# 次要版本 (1.0.0 -> 1.1.0)  
npm version minor

# 主要版本 (1.0.0 -> 2.0.0)
npm version major
```

### 重新发布
```bash
npm version patch
npm publish
```

## 📋 发布清单

- [ ] 更新 package.json 中的个人信息
- [ ] 更新 README.md 中的用户名和链接
- [ ] 更新 LICENSE 文件中的姓名
- [ ] 测试构建: `npm run build`
- [ ] 测试包功能
- [ ] 检查 API 密钥有效性
- [ ] 运行 `./prepare-publish.sh` 检查
- [ ] npm 登录
- [ ] 发布包
- [ ] 验证发布成功: `npm view @your-username/mcp-weather-server`

## 🎯 发布后

### 验证安装
```bash
# 全局安装测试
npm install -g @your-username/mcp-weather-server

# 测试命令
mcp-weather

# 或使用 npx
npx @your-username/mcp-weather-server
```

### 推广包
1. 在 GitHub 仓库添加 tags 和 releases
2. 更新 README badges
3. 在相关社区分享
4. 写博客文章介绍功能

## ⚠️ 注意事项

1. **API 密钥安全**: 确保示例中不包含真实的 API 密钥
2. **版本语义化**: 遵循 [语义化版本](https://semver.org/lang/zh-CN/)
3. **依赖安全**: 定期更新依赖包
4. **文档维护**: 保持 README 和示例的准确性

## 🔧 常见问题

### 问题：包名已被占用
**解决**：使用 scoped package name: `@your-username/mcp-weather-server`

### 问题：发布权限错误
**解决**：确保已登录且有发布权限：`npm whoami`

### 问题：构建文件权限问题
**解决**：确保 build/index.js 有执行权限：`chmod +x build/index.js`

## 📞 支持

如果遇到发布问题，可以：
1. 检查 npm 官方文档
2. 在项目 issues 中提问
3. 联系维护者
