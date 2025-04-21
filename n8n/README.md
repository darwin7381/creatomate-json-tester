# n8n字幕处理工作流

本目录包含将字幕处理集成到n8n的必要文件。

## 文件说明

1. `subtitle-processor-code.js` - 用于n8n的Code节点，处理字幕文件
2. `subtitle-http-request.sh` - 用于n8n的HTTP Request节点，发送请求到Creatomate API

## 工作流设置步骤

### 1. 创建字幕处理Code节点

1. 在n8n工作流中添加一个**Code**节点
2. 将`subtitle-processor-code.js`的内容复制到代码编辑区
3. 连接适当的输入节点，确保提供了字幕内容(`items[0].json.subtitleContent`)

### 2. 创建Creatomate API HTTP请求节点

1. 在Code节点之后添加一个**HTTP Request**节点
2. 配置如下:
   - 方法: `POST`
   - URL: `https://api.creatomate.com/v1/renders`
   - 身份验证: 选择 `Bearer Token` 并输入你的Creatomate API密钥
   - 请求体: 选择 `Expression`，输入 `{{$json.creatomateRequest}}`
   - 内容类型: `application/json`
   - 返回所有响应: 勾选为`true`

## 工作流示例

```
[字幕输入节点] → [Code节点] → [HTTP Request节点] → [处理结果节点]
```

### 输入节点选项

1. **HTTP节点**: 接收上传的SRT文件
2. **读取本地文件**: 读取本地SRT文件
3. **手动输入**: 使用n8n界面手动输入字幕内容

## 注意事项

1. 确保在HTTP请求节点中使用了正确的API密钥
2. 字幕内容必须是有效的SRT格式，或者支持的JSON格式
3. 生成的视频URL将在HTTP请求节点的输出中(`items[0].json.url`) 