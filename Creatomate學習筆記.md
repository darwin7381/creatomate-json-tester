# Creatomate 學習筆記

## 1. 什麼是 Creatomate？

Creatomate 是一個基於雲的自動化視頻和圖像生成服務。它提供了完整的工具集，讓技術和非技術人員都能夠大規模生成媒體內容。

主要功能包括：

- **批量生成** - 通過電子表格或 CSV 快速創建多個視頻和圖像
- **模板編輯器** - 使用模板編輯器創建自動化和可重用的設計
- **無代碼集成** - 支持超過 5000+ 應用的無代碼自動化工作流程
- **API** - 通過 API 編程方式生成視頻和圖像
- **JSON 轉視頻與圖像** - 從純文本腳本創建視頻和圖像
- **可共享表單** - 通過可與任何人共享的表單生成視頻和圖像
- **電子郵件個性化** - 為每個訂閱者自動生成個性化視頻

## 2. API 使用方法

Creatomate 提供了兩種 API：

### 2.1 REST API

RESTful API 是異步的，最適合用於軟件應用程序和 Creatomate 之間的通信。通過 POST 或 GET 請求創建和檢查渲染狀態，或使用 webhooks 等待渲染完成。使用 API 密鑰進行身份驗證。

### 2.2 Direct API

Direct API 是同步的，最適合用於客戶端瀏覽器和 Creatomate 之間的通信。可以在 URL 查詢參數中放置所有渲染圖像或視頻所需的信息。可以通過添加加密簽名來保護請求，渲染過程限制在 100 秒內。

### 2.3 官方庫

Creatomate 為 Node.js 和 PHP 提供了官方庫：

- **Node.js**: NPM 上的官方 Creatomate Node.js 庫
- **PHP**: Packagist 上的官方 Creatomate PHP 庫

## 3. 使用 Node.js 調用 API 示例

```javascript
const Creatomate = require('creatomate');

// 使用 API 密鑰初始化客戶端
const client = new Creatomate.Client('YOUR_API_KEY');

// 使用模板渲染視頻
const options = {
  // 模板 ID（在模板編輯器中創建）
  templateId: 'YOUR_TEMPLATE_ID',
  
  // 應用於模板的修改
  modifications: {
    'Title': '在此插入你的新聞標題或公告',
    'Text 1': '在此添加文章片段。這只是一個示例文本，展示如何使用此模板。',
    'Text 2': '故事的延續。你可以在這裡輸入行動呼籲，例如。',
  },
};

// 開始渲染
client.render(options)
  .then((renders) => {
    console.log('完成:', renders);
  })
  .catch((error) => console.error(error));
```

## 4. 從頭開始創建視頻

除了使用模板外，還可以從頭開始通過 JSON 格式或 API 創建視頻：

```javascript
const Creatomate = require('creatomate');
const client = new Creatomate.Client('YOUR_API_KEY');

const source = new Creatomate.Source({
  outputFormat: 'mp4',
  width: 1280,
  height: 720,
  
  elements: [
    // 視頻 1
    new Creatomate.Video({
      track: 1,
      source: 'https://example.com/video1.mp4',
    }),
    
    // 視頻 2，由於在同一軌道上，所以在視頻 1 之後播放
    new Creatomate.Video({
      track: 1,
      source: 'https://example.com/video2.mp4',
      transition: new Creatomate.Fade({ duration: 1 }),
    }),
    
    // 文本疊加層
    new Creatomate.Text({
      text: '你的文本覆蓋在這裡',
      
      // 使容器與屏幕一樣大，並添加一些間距
      width: '100%',
      height: '100%',
      xPadding: '3 vmin',
      yPadding: '8 vmin',
      
      // 將文本對齊到底部中心
      xAlignment: '50%',
      yAlignment: '100%',
      
      // 文本樣式
      font: new Creatomate.Font('Aileron', 800, 'normal', '8.48 vh'),
      shadow: new Creatomate.Shadow('rgba(0,0,0,0.65)', '1.6 vmin'),
      fillColor: '#ffffff',
    }),
  ],
});

client.render({ source })
  .then((renders) => console.log('你的視頻已準備好:', renders));
```

## 5. JSON 格式

Creatomate 使用 JSON 格式來描述如何渲染輸出文件（mp4、gif 或 jpg）。基本結構如下：

```json
{
  "output_format": "mp4",
  "width": 1920,
  "height": 1080,
  "elements": [
    {
      "type": "text",
      "text": "我的文本",
      "fill_color": "#ffffff",
      "font_family": "Open Sans"
    }
  ]
}
```

## 6. 常見視頻處理操作

Creatomate 提供了多種視頻和圖像處理功能：

- **連接多個視頻**
- **裁剪視頻**
- **添加響應式疊加層**
- **添加水印**
- **在視頻上覆蓋文本**
- **將任何視頻轉碼為 MP4 (H.264)**
- **渲染模板**
- **生成 Instagram、YouTube 或 TikTok 的故事視頻**
- **使用 ChatGPT 自動生成視頻**
- **使用 AWS Polly 自動生成文本轉語音視頻**
- **使用 AWS Transcribe 生成字幕**
- **將圖像轉換為視頻幻燈片**
- **模糊視頻背景**
- **添加進度條**
- **添加片頭或片尾**
- **添加音軌**
- **截取視頻截圖或快照**
- **將視頻轉換為 GIF**
- **創建畫中畫效果**
- **創建視頻牆（2x2、3x3 等）**
- **創建分屏視頻**

## 7. 與 n8n 整合

對於與 n8n 的 HTTP 節點集成，可以通過以下方式使用 Creatomate：

1. 在 n8n 中創建 HTTP 請求節點
2. 配置為 POST 請求，指向 `https://api.creatomate.com/v1/renders`
3. 設置標頭：
   - `Authorization: Bearer YOUR_API_KEY`
   - `Content-Type: application/json`
4. 在請求體中提供 JSON 數據（可以是模板 ID 和修改，或完整的視頻源定義）

```json
{
  "template_id": "YOUR_TEMPLATE_ID",
  "modifications": {
    "Title": "動態生成的標題",
    "Text 1": "動態生成的文本內容",
    "Video": "https://example.com/your-dynamic-video.mp4"
  }
}
```

## 8. 常見元素類型及其屬性

### 8.1 視頻元素 (Video)

```javascript
new Creatomate.Video({
  source: "https://example.com/video.mp4",  // 視頻URL
  track: 1,                                 // 軌道號碼
  time: "0s",                               // 開始時間
  duration: "5s",                           // 持續時間
  trimStart: "2s",                          // 從源視頻的開始修剪
  trimEnd: "2s",                            // 從源視頻的結束修剪
  volume: "80%",                            // 音量
  playbackRate: "1.5",                      // 播放速度
  colorOverlay: "rgba(0,0,0,0.4)",          // 顏色疊加層
})
```

### 8.2 文本元素 (Text)

```javascript
new Creatomate.Text({
  text: "Hello World",                      // 文本內容
  fontFamily: "Roboto",                     // 字體
  fontSize: "24px",                         // 字體大小
  fontWeight: "700",                        // 字體粗細
  fillColor: "#ffffff",                     // 填充顏色
  shadowColor: "rgba(0,0,0,0.5)",           // 陰影顏色
  shadowBlur: "5px",                        // 陰影模糊
  xAlignment: "50%",                        // 水平對齊
  yAlignment: "50%",                        // 垂直對齊
  animations: [...]                         // 動畫
})
```

### 8.3 圖像元素 (Image)

```javascript
new Creatomate.Image({
  source: "https://example.com/image.jpg",  // 圖像URL
  width: "50%",                             // 寬度
  height: "50%",                            // 高度
  x: "25%",                                 // X位置
  y: "25%",                                 // Y位置
  mask: {...},                              // 遮罩
})
```

## 9. 動畫和過渡效果

Creatomate 提供多種動畫和過渡效果：

### 9.1 淡入淡出

```javascript
new Creatomate.Fade({
  duration: "1s",
  easing: "cubic-bezier(0.5, 0, 0.5, 1)"
})
```

### 9.2 滑動

```javascript
new Creatomate.Slide({
  duration: "1s",
  direction: "90°" // 從左到右
})
```

### 9.3 關鍵幀動畫

```javascript
{
  x: [
    { time: "0s", value: "0%" },
    { time: "2s", value: "100%" }
  ],
  y: [
    { time: "0s", value: "0%" },
    { time: "2s", value: "100%" }
  ]
}
```

## 10. 後續學習資源

- [官方 API 文檔](https://creatomate.com/docs/api/introduction)
- [Node.js 示例庫](https://github.com/creatomate/node-examples)
- [PHP 示例庫](https://github.com/creatomate/php-examples)
- [JSON 格式文檔](https://creatomate.com/docs/json/introduction)
- [教程與指南](https://creatomate.com/docs/template-editor/getting-started) 