# Creatomate視頻工具集

這個項目提供了一系列工具和腳本，用於使用Creatomate API生成和處理視頻，特別是添加字幕到視頻中。

## 目錄結構

- `scripts/`: 包含所有執行腳本
  - `create-subtitled-video.js`: 主要字幕視頻生成腳本
  - `generate-video.js`: 基本視頻生成腳本

- `inputs/`: 存放輸入文件，如字幕文件(.srt)

- `json/`: **重要！** 存放腳本生成的JSON結果文件，這些文件將被發送到Creatomate進行渲染
  - 不要在此目錄中手動添加模板文件

- `sample-json/`: 存放各種JSON模板文件
  - `subtitles/`: 字幕視頻相關的模板
    - `subtitle-template.json`: 字幕視頻的基本模板
    - `video-template.json`: 視頻的基本模板

- `n8n/`: 存放n8n工作流程相關文件

## 使用方法

### 生成帶字幕的視頻

使用以下命令從字幕文件生成視頻：

```bash
npm run subtitle <字幕文件路徑>
```

例如：

```bash
npm run subtitle inputs/news-subtitles.srt
```

如果不指定字幕文件路徑，腳本將嘗試使用`inputs`目錄中的第一個`.srt`文件。

### 生成基本視頻

使用以下命令生成基本視頻：

```bash
npm run generate
```

## 注意事項

1. 確保已設置Creatomate API密鑰。將`.env.example`文件複製為`.env.local`並填入您的API密鑰。

2. **目錄用途說明**：
   - `json/`目錄用於存放腳本生成的JSON結果文件，這些文件將發送到Creatomate進行渲染
   - `sample-json/`目錄用於存放各種模板文件
   - 請勿將模板文件放在`json/`目錄中，這會導致混淆

3. 所有字幕文件應當放在`inputs/`目錄中，推薦使用`.srt`格式。

4. 生成的視頻URL將在腳本執行完成後顯示在控制台中。

## 依賴

- Node.js v14+
- Creatomate API
- dotenv
- parse-srt

# Creatomate JSON 測試工具與視頻自動化工具集

這個工具集用於測試 Creatomate JSON 文件並自動生成帶有字幕的視頻。

## 目錄結構

```
/
├── scripts/           # 各種視頻處理腳本
├── inputs/            # 存放 SRT 字幕文件
├── json/              # 存放模板和輸出的 JSON 文件
├── n8n/               # 與 n8n 整合相關的文件
├── sample-json/       # 範例 JSON 文件
├── test-json.js       # 測試 JSON 文件的腳本
├── README.md          # 說明文檔
└── .env.local         # 環境變數文件
```

## 字幕視頻自動生成工具

這個工具使用 Creatomate API 來自動生成帶有字幕的視頻。只需提供一個 SRT 格式的字幕文件，工具將自動生成一個包含字幕的視頻。

### 使用方法

#### 1. 安裝依賴

首先，安裝必要的依賴：

```bash
npm install
```

#### 2. 設置 API 金鑰

在使用前，請先設置您的 Creatomate API 金鑰：

```bash
export CREATOMATE_API_KEY=your_api_key_here
```

或者在 `.env.local` 文件中設置您的 API 金鑰：

```
CREATOMATE_API_KEY=your_api_key_here
```

#### 3. 準備字幕文件

將您的 SRT 格式字幕文件放入 `inputs/` 目錄中。

#### 4. 運行腳本

運行腳本來生成視頻：

```bash
node scripts/create-subtitled-video.js [字幕文件路徑]
```

如果不指定字幕文件路徑，腳本將嘗試使用 `inputs/` 目錄中的第一個 `.srt` 文件。

#### 5. 獲取視頻

腳本運行完成後，將輸出視頻的 URL。同時，生成的 JSON 配置將保存在 `json/output-video.json` 文件中，以供參考或進一步定制。

### 自定義模板

您可以通過修改 `json/subtitle-template.json` 文件來自定義視頻的外觀和行為。可以調整的參數包括：

- 視頻背景
- 字幕字體、大小和顏色
- 字幕位置
- 視頻分辨率和持續時間
- 其他視覺效果

### 故障排除

如果遇到問題，請檢查：

1. API 金鑰是否正確設置
2. 字幕文件格式是否正確（必須是標準 SRT 格式）
3. 網絡連接是否穩定
4. Node.js 版本是否為 v12 或更高版本

### 注意事項

- 生成的視頻將托管在 Creatomate 的服務器上
- 視頻生成時間取決於視頻長度和復雜性
- 請遵守 Creatomate 的使用條款和 API 使用限制

## JSON 測試工具

測試 Creatomate JSON 文件，確保它們可以正確渲染視頻或圖像。

### 使用方法

#### 測試 JSON 文件

使用以下命令測試 JSON 文件：

```
node test-json.js path/to/your/json-file.json
```

或使用 npm 腳本：

```
npm test path/to/your/json-file.json
```

#### 示例

```
node test-json.js sample-json/text-overlay.json
```

### 示例 JSON 文件

在 `sample-json` 目錄中包含一些示例文件：

- `text-overlay.json` - 帶有文本覆蓋的視頻
- `template-example.json` - 使用模板 ID 的示例
- `video-concat.json` - 連接多個視頻的示例

### 與 n8n 整合

若要與 n8n 整合，請在 HTTP 請求節點中使用以下設置：

1. 請求方法：POST
2. URL：`https://api.creatomate.com/v1/renders`
3. 標頭：
   - `Authorization: Bearer YOUR_API_KEY`
   - `Content-Type: application/json`
4. 請求體：根據需要提供 JSON 數據

### JSON 格式參考

請參考 [Creatomate學習筆記.md](./Creatomate學習筆記.md) 獲取更多關於 Creatomate JSON 格式的信息。

---

# Creatomate Node.js Examples

This is an ever-growing collection of examples using the [Node.js library](https://github.com/creatomate/creatomate-node) for Creatomate, the cloud API for generating and editing video and images.

Get your free API key at [Creatomate.com](https://creatomate.com) and start creating video-powered applications right away.

## Video examples

- **[Concatenate multiple videos](https://github.com/creatomate/node-examples/tree/main/concatenate)**

- **[Trim a video](https://github.com/creatomate/node-examples/tree/main/trim)**

- **[Add a responsive overlay to a video](https://github.com/creatomate/node-examples/tree/main/responsive-overlay)**

- **[Add a responsive watermark to a video](https://github.com/creatomate/node-examples/tree/main/watermark)**

- **[Overlay a text on top of a video](https://github.com/creatomate/node-examples/tree/main/text-overlay)**

- **[Transcode any video to MP4 (H.264)](https://github.com/creatomate/node-examples/tree/main/transcode)**

- **[Render a template](https://github.com/creatomate/node-examples/tree/main/template)**

- **[Generate story videos for Instagram, YouTube, or TikTok](https://github.com/creatomate/node-examples/tree/main/story-video)**

- **[Auto-generate videos using ChatGPT](https://github.com/creatomate/node-examples/tree/main/chatgpt)**

- **[Auto-generate a text-to-speech video with AWS Polly](https://github.com/creatomate/node-examples/tree/main/aws-polly)**

- **[Auto-generate an explainer video with AWS Polly](https://github.com/creatomate/node-examples/tree/main/text-to-speech)**

- **[Generate subtitles with AWS Transcribe](https://github.com/creatomate/node-examples/tree/main/aws-transcribe)**

- **[Generate animated captions with AWS Transcribe](https://github.com/creatomate/node-examples/tree/main/captions)**

- **[Turn images into a video slideshow](https://github.com/creatomate/node-examples/tree/main/slideshow)**

- **[Blur the background of a video](https://github.com/creatomate/node-examples/tree/main/blur-background)**

- **[Add a progress bar to a video](https://github.com/creatomate/node-examples/tree/main/progress-bar)**

- **[Add an intro scene to a video](https://github.com/creatomate/node-examples/tree/main/intro)**

- **[Add an outro scene to a video](https://github.com/creatomate/node-examples/tree/main/outro)**

- **[Add an audio track to a video](https://github.com/creatomate/node-examples/tree/main/audio)**

- **[Take a screenshot of a video](https://github.com/creatomate/node-examples/tree/main/video-screenshot)**

- **[Take a snapshot of a video](https://github.com/creatomate/node-examples/tree/main/video-snapshot)**

- **[Convert a video to GIF](https://github.com/creatomate/node-examples/tree/main/video-to-gif)**

- **[Create a picture-in-picture video](https://github.com/creatomate/node-examples/tree/main/picture-in-picture)**

- **[Create a 2 by 2 video wall](https://github.com/creatomate/node-examples/tree/main/two-by-two)**

- **[Create a 3 by 3 video wall](https://github.com/creatomate/node-examples/tree/main/three-by-three)**

- **[Create a split screen video](https://github.com/creatomate/node-examples/tree/main/splitscreen)**

- **[Generate video mockups](https://github.com/creatomate/node-examples/tree/main/warp-video)**

## GIF examples

- **[Create a GIF slideshow](https://github.com/creatomate/node-examples/tree/main/gif-slideshow)**

- **[Convert a video to GIF](https://github.com/creatomate/node-examples/tree/main/video-to-gif)**

## Text examples

- **[Scale text to fit available space](https://github.com/creatomate/node-examples/tree/main/text-sizing)**

- **[Text animations](https://github.com/creatomate/node-examples/tree/main/text-animations)**

- **[Overlay a text on top of a video](https://github.com/creatomate/node-examples/tree/main/text-overlay)**

- **[Set the font style](https://github.com/creatomate/node-examples/tree/main/text-styles)**

- **[Use Facebook, Twitter, Google and Apple emojis](https://github.com/creatomate/node-examples/tree/main/text-emoji)**

- **[Use Arabic script](https://github.com/creatomate/node-examples/tree/main/text-arabic)**

- **[Use Chinese script](https://github.com/creatomate/node-examples/tree/main/text-chinese)**

- **[Use Japanese script](https://github.com/creatomate/node-examples/tree/main/text-japanese)**

- **[Use Thai script](https://github.com/creatomate/node-examples/tree/main/text-thai)**

## Effects examples

- **[Make an element partially transparent](https://github.com/creatomate/node-examples/tree/main/opacity)**

- **[Rotate an element](https://github.com/creatomate/node-examples/tree/main/rotate)**

- **[Add a shadow to an element](https://github.com/creatomate/node-examples/tree/main/shadow)**

- **[Set the font style](https://github.com/creatomate/node-examples/tree/main/text-styles)**

- **[Apply a color overlay to any element](https://github.com/creatomate/node-examples/tree/main/color-overlay)**

- **[Apply color filters to any element](https://github.com/creatomate/node-examples/tree/main/filters)**

- **[Blend elements](https://github.com/creatomate/node-examples/tree/main/blend)**

- **[Apply a mask to an element](https://github.com/creatomate/node-examples/tree/main/mask)**

- **[Using an element as fill pattern](https://github.com/creatomate/node-examples/tree/main/repeat)**

- **[Generate dynamic mockups](https://github.com/creatomate/node-examples/tree/main/warp-image)**

## Animation examples

- **[Using keyframes](https://github.com/creatomate/node-examples/tree/main/keyframes)**

- **[Text animations](https://github.com/creatomate/node-examples/tree/main/text-animations)**

- **[Animating the lines of a shape element](https://github.com/creatomate/node-examples/tree/main/stroke-animation)**

- **[Add a progress bar to a video](https://github.com/creatomate/node-examples/tree/main/progress-bar)**

- **[Turn images into a video slideshow](https://github.com/creatomate/node-examples/tree/main/slideshow)**

## Composition examples

- **[Grouping elements together](https://github.com/creatomate/node-examples/tree/main/compositions)**

- **[Loop a composition](https://github.com/creatomate/node-examples/tree/main/loop)**

## Usage examples

- **[Create multiple renders by tag](https://github.com/creatomate/node-examples/tree/main/tags)**

- **[Render a template](https://github.com/creatomate/node-examples/tree/main/template)**

