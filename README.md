# Mini Notes App


一个基于 Anna 平台的笔记应用，支持创建、查看、删除笔记，并通过本地 Executa 工具对笔记进行规则驱动的总结。


## 如何安装依赖


1. **安装 Node.js**（v18 或更高）  
   下载地址：`https://nodejs.org/`（建议 LTS 版本）


2. **安装 Anna CLI**  
   打开终端（命令行），执行：

   ```bash
   npm install -g @anna-ai/cli
   ```

3. **验证安装**：

   ```bash
   anna-app --version
   ```

## 如何手动测试 Executa JSON-RPC

进入工具目录：

```bash
cd executas/summarize
```

测试 describe 方法：

```bash
node -e "console.log(JSON.stringify({jsonrpc:'2.0',method:'describe',id:1}))" | node tool.js
```

预期输出：

```json
{"jsonrpc":"2.0","result":{"description":"Summarize notes using simple rules"},"id":1}
```

测试 invoke 方法：

```bash
node -e "console.log(JSON.stringify({jsonrpc:'2.0',method:'invoke',params:{notes:[{content:'修复登录bug'},{content:'跟设计沟通需求'}]},id:2}))" | node tool.js
```

预期输出：

```json
{"jsonrpc":"2.0","result":{"summary":"共有 2 条笔记。"},"id":2}
```

## bundle / manifest / executas 的关系

| 组件 | 说明 |
|------|------|
| `bundle/` | 前端 UI 文件夹（index.html、app.js）。用户交互界面，通过 `AnnaAppRuntime.connect()` 获取 API，使用 `anna.tools.invoke` 调用本地工具。 |
| `manifest.json` | App 的描述文件。声明应用的名称、版本以及依赖的 Executa 工具（本例中为 tool-summarize-notes）。 |
| `executas/` | 本地工具目录。summarize/tool.js 实现 JSON-RPC over stdio 协议，提供 describe 和 invoke 方法；executa.json 指定启动命令。 |

**协作流程**：用户点击 Summarize → 前端调用 `anna.tools.invoke` → Anna 运行时根据 `manifest.json` 找到工具 → 启动 `tool.js` 通过 stdin 发送 JSON-RPC 请求 → 工具处理后通过 stdout 返回结果 → 前端显示总结。


## 运行完整应用

在项目根目录执行：

```bash
anna-app dev
```

然后访问 http://localhost:5180
