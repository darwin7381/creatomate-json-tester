
# Creatomate JSON 測試工具

這個工具用於測試 Creatomate JSON 文件，確保它們可以正確渲染視頻或圖像。

### 設置

1. 克隆或下載此項目
2. 安裝依賴項：
   ```
   npm install
   ```
3. 複製或編輯 `.env.local` 文件，並填入您的 Creatomate API 密鑰：
   ```
   CREATOMATE_API_KEY=your_api_key_here
   ```

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

