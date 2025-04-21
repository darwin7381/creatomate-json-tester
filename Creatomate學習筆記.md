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

### 4.1 使用 Node.js API - 重要屬性命名規範

**重要提示**：Creatomate API 在 JSON 中使用**下劃線命名法(snake_case)**，而不是駝峰式命名法(camelCase)！這是一個經常被忽視的重要細節。

例如，正確的屬性名稱是：
- `font_family` (而不是 fontFamily)
- `font_size` (而不是 fontSize)
- `line_height` (而不是 lineHeight)
- `background_color` (而不是 backgroundColor)
- `x_alignment` (而不是 xAlignment)

忽略這個命名規範會導致屬性無法被識別，從而導致渲染效果錯誤或字幕不顯示。

```javascript
const Creatomate = require('creatomate');
const client = new Creatomate.Client('YOUR_API_KEY');

// 方法一：使用 JSON 對象直接定義源
const source = {
  outputFormat: 'mp4',
  width: 1920,
  height: 1080,
  elements: [
    {
      type: 'text',
      name: 'subtitle',  // 給元素命名是個好習慣
      text: '你的字幕文本',
      font_family: 'Noto Sans TC',
      font_size: '5.5 vmin',
      font_size_minimum: '5 vmin',
      line_height: '126%',
      font_weight: '700',
      fill_color: '#FFFFFF',
      x_alignment: '50%',
      y: '70.3388%',
      width: '83.1194%',
      background_color: 'rgba(19,19,19,0.7)',
      time: '0 s',
      duration: '5 s'
    }
  ]
};

// 方法二：使用 Creatomate.Source 創建對象 (確保使用正確的下劃線命名法)
const sourceWithAPI = new Creatomate.Source({
  outputFormat: 'mp4',
  width: 1280,
  height: 720,
  
  elements: [
    // 視頻元素
    new Creatomate.Video({
      source: 'https://example.com/video.mp4',
    }),
    
    // 字幕元素 - 注意這裡也需要使用下劃線命名法
    new Creatomate.Text({
      text: '你的字幕文本',
      name: 'subtitle',
      font_family: 'Noto Sans TC',
      font_size: '5.5 vmin',
      font_size_minimum: '5 vmin',
      line_height: '126%',
      font_weight: '700',
      fill_color: '#FFFFFF',
      x_alignment: '50%',
      y: '70.3388%',
      width: '83.1194%',
      background_color: 'rgba(19,19,19,0.7)',
      time: '0 s',
      duration: '5 s'
    }),
  ],
});

// 渲染視頻
client.render({ source })
  .then((renders) => console.log('字幕視頻已準備好:', renders))
  .catch((error) => console.error(error));
```

### 4.2 字幕視頻示例

```javascript
const Creatomate = require('creatomate');
const client = new Creatomate.Client('YOUR_API_KEY');

// 字幕數據（通常從SRT或其他來源解析）
const subtitles = [
  { text: "第一行字幕", startTime: 0, endTime: 3 },
  { text: "第二行字幕", startTime: 3, endTime: 6 },
  // ...更多字幕
];

// 創建視頻源
const source = {
  outputFormat: 'mp4',
  elements: [
    // 背景視頻
    {
      type: 'video',
      source: 'https://example.com/background-video.mp4',
    }
  ]
};

// 添加字幕元素
subtitles.forEach((subtitle, index) => {
  source.elements.push({
    type: 'text',
    name: 'subtitle',
    text: subtitle.text,
    font_family: 'Noto Sans TC',
    font_size: '5.5 vmin',
    font_size_minimum: '5 vmin',
    line_height: '126%',
    font_weight: '700',
    fill_color: '#FFFFFF',
    x_alignment: '50%',
    y: '70.3388%',
    width: '83.1194%',
    background_color: 'rgba(19,19,19,0.7)',
    time: `${subtitle.startTime} s`,
    duration: `${subtitle.endTime - subtitle.startTime} s`
  });
});

// 渲染視頻
client.render({ source, output_format: 'mp4' })
  .then((renders) => console.log('字幕視頻已準備好:', renders))
  .catch((error) => console.error(error));
```

## 5. 值得注意的單位和格式

Creatomate 使用特殊的單位格式來確保跨不同分辨率的響應式設計：

- **相對尺寸**：`'100%'`, `'50%'` 等
- **視口單位**：
  - `vw` - 視口寬度的百分比
  - `vh` - 視口高度的百分比
  - `vmin` - 視口寬度或高度中較小者的百分比
  - `vmax` - 視口寬度或高度中較大者的百分比
- **絕對單位**：`'px'` 像素
- **時間單位**：`'2 s'` 表示2秒

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
- **使用 AWS Polly, Transcribe 生成字幕**
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

## 7. 重要元素類型及其關鍵屬性

### 7.1 視頻元素 (type: 'video')

```javascript
{
  type: 'video',
  source: "https://example.com/video.mp4",  // 視頻URL
  
  // 如果不指定，視頻會使用其原有長度
  // 不需要顯式設置時長
  
  volume: "80%",                           // 音量
  fit: "cover",                            // 適應方式：cover填滿，contain包含
  color_overlay: "rgba(0,0,0,0.4)",        // 顏色覆蓋層，注意使用下劃線！
}
```

### 7.2 文本元素 (type: 'text')

```javascript
{
  type: 'text',
  name: 'subtitle',                       // 命名元素
  
  // 容器屬性
  width: "83.1194%",                      // 寬度
  y: "70.3388%",                          // Y位置
  
  // 對齊
  x_alignment: "50%",                     // 水平對齊
  
  // 文本內容
  text: "Hello World",                    // 文本內容
  
  // 字體設置
  font_family: "Noto Sans TC",            // 字體名稱
  font_size: "5.5 vmin",                  // 字體大小
  font_size_minimum: "5 vmin",            // 最小字體大小
  line_height: "126%",                    // 行高
  font_weight: "700",                     // 字體粗細
  
  // 顏色和效果
  fill_color: "#FFFFFF",                  // 填充顏色
  background_color: "rgba(19,19,19,0.7)", // 背景色
  
  // 時間設置
  time: "0 s",                            // 開始時間
  duration: "5 s"                         // 持續時間
}
```

### 7.3 圖像元素 (type: 'image')

```javascript
{
  type: 'image',
  source: "https://example.com/image.jpg",  // 圖像URL
  width: "50%",                             // 寬度
  height: "50%",                            // 高度
  x: "25%",                                 // X位置
  y: "25%"                                  // Y位置
}
```

## 8. 動畫和過渡效果

Creatomate 提供多種動畫和過渡效果。使用這些效果時，同樣需要遵循下劃線命名規範：

### 8.1 淡入淡出

```javascript
// 作為元素屬性
{
  transition: {
    type: 'fade',
    duration: 1,
    easing: "cubic-bezier(0.5, 0, 0.5, 1)"
  }
}

// 在animations數組中
{
  animations: [
    {
      type: 'fade',
      time: 'start',
      duration: 1,
      direction: 'in'
    }
  ]
}
```

### 8.2 滑動

```javascript
{
  animations: [
    {
      type: 'slide',
      time: 'start',
      duration: 1,
      direction: 90  // 角度：0上，90右，180下，270左
    }
  ]
}
```

### 8.3 使用關鍵幀動畫

```javascript
// 使用關鍵幀設置文本
text: [
  { time: "0 s", value: "第一行文本" },
  { time: "3 s", value: "第二行文本" },
  { time: "6 s", value: "第三行文本" }
],

// 使用關鍵幀設置位置
x: [
  { time: "0 s", value: "0%" },
  { time: "2 s", value: "100%" }
]
```

## 9. 字幕視頻製作最佳實踐

1. **使用合適的文本容器**：
   ```javascript
   {
     type: 'text',
     name: 'subtitle',
     width: "83.1194%",
     y: "70.3388%",
     x_alignment: "50%"
   }
   ```

2. **設置醒目的字體樣式**：
   ```javascript
   {
     font_family: "Noto Sans TC", // 注意：中文字幕需要使用支持中文的字體
     font_size: "5.5 vmin",
     font_size_minimum: "5 vmin",
     font_weight: "700",
     fill_color: "#FFFFFF"
   }
   ```

3. **使用文本背景增強可讀性**：
   ```javascript
   {
     background_color: "rgba(19,19,19,0.7)"
   }
   ```

4. **正確設置時間點**：
   ```javascript
   {
     time: "0 s",       // 注意空格和單位s
     duration: "5 s"    // 注意空格和單位s
   }
   ```

## 10. 常見錯誤和注意事項

1. **命名規範錯誤**：使用駝峰式命名法(camelCase)而不是下劃線命名法(snake_case)將導致屬性無法被識別。
   - 錯誤: `fontFamily`, `fontSize`, `backgroundColor`
   - 正確: `font_family`, `font_size`, `background_color`

2. **單位格式錯誤**：時間單位需要包含空格和s
   - 錯誤: `"5s"`, `5`
   - 正確: `"5 s"`

3. **漏掉必要的屬性**：某些元素需要必要的屬性才能正常顯示
   - 字幕元素通常需要: `type`, `text`, `font_family`, `fill_color`, `time`, `duration`

4. **字體選擇不當**：確保為多語言內容選擇合適的字體
   - 中文字幕應使用: `"Noto Sans TC"`, `"Noto Sans SC"` 等支持中文的字體

## 11. 後續學習資源

- [官方 API 文檔](https://creatomate.com/docs/api/introduction)
- [Node.js 示例庫](https://github.com/creatomate/node-examples)
- [PHP 示例庫](https://github.com/creatomate/php-examples)
- [JSON 格式文檔](https://creatomate.com/docs/json/introduction)
- [教程與指南](https://creatomate.com/docs/template-editor/getting-started) 