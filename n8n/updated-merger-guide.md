# 簡易元素合併節點詳細使用指南

這個更新的合併節點允許您以多種格式添加元素，使操作更加靈活便捷。

## 工作流設置

### 1. 完整工作流結構

```
[字幕輸入] → [字幕處理節點] → [元素合併節點] → [HTTP Request節點]
                                  ↑
[自定義元素] → [Set節點] ─────────────┘
```

### 2. 節點連接說明

1. **字幕處理節點** 連接到 **元素合併節點** 的 **輸入0**
2. **Set節點** (包含自定義元素) 連接到 **元素合併節點** 的 **輸入1**

## 支持的輸入格式

合併節點現在支持以下幾種輸入格式：

### 方式1：直接輸入單個元素

最簡單直接的方式，在Set節點中直接定義單個元素：

```json
{
  "type": "audio",              // 【替換】元素類型：audio, text, image等
  "name": "Audio-P49",          // 【替換】元素名稱，可自定義
  "source": "354b0f97-79b5-4440-8d53-8753af7ded0f", // 【替換】媒體資源ID
  "time": 1.773,                // 【替換】開始時間（秒）
  "volume": "50%",              // 【替換】音量百分比
  "track": 8                    // 【替換】音軌編號
}
```

### 方式2：輸入元素數組

如果需要一次添加多個元素：

```json
[
  {
    "type": "audio",            // 【替換】第一個元素類型
    "name": "Audio-K6J",        // 【替換】第一個元素名稱
    "source": "ad85b81f-f92d-496b-8a16-689e1dabbd3c", // 【替換】媒體資源ID
    "time": 0,                  // 【替換】開始時間
    "volume": "50%",            // 【替換】音量
    "track": 7                  // 【替換】音軌編號
  },
  {
    "type": "text",             // 【替換】第二個元素類型
    "name": "Text-H3M",         // 【替換】第二個元素名稱
    "text": "川普警告中日",       // 【替換】文本內容
    "font_family": "Noto Sans TC", // 【替換】字體
    // ...其他文本屬性...
  }
]
```

### 方式3：使用elements屬性

與之前版本兼容的格式：

```json
{
  "elements": [
    {
      "type": "audio",          // 【替換】元素類型
      // ...元素屬性...
    },
    // ...更多元素...
  ]
}
```

## 常用元素範例

### 1. 文本元素 (Text)

```json
{
  "type": "text",               // 必須是"text"
  "name": "Text-H3M",           // 【替換】文本元素名稱
  "text": "川普警告中日",         // 【替換】文本內容
  "time": 0,                    // 【替換】出現時間(秒)
  "x": "5.0006%",               // 【替換】水平位置
  "y": "11%",                   // 【替換】垂直位置
  "width": "89.9988%",          // 【替換】寬度
  "x_alignment": "50%",         // 【替換】水平對齊(50%為居中)
  "font_family": "Noto Sans TC", // 【替換】字體
  "font_weight": "900",         // 【替換】字重(400-900)
  "font_size_minimum": "7 vmin", // 【替換】最小字體大小
  "font_size_maximum": "11 vmin", // 【替換】最大字體大小
  "fill_color": "#ffffff"       // 【替換】文字顏色
}
```

### 2. 音頻元素 (Audio)

```json
{
  "type": "audio",              // 必須是"audio"
  "name": "Audio-P49",          // 【替換】音頻元素名稱
  "source": "354b0f97-79b5-4440-8d53-8753af7ded0f", // 【替換】音頻資源ID
  "time": 1.773,                // 【替換】開始時間(秒)
  "volume": "50%",              // 【替換】音量(0%-100%)
  "track": 8                    // 【替換】音軌編號(1-10)
}
```

### 3. 圖像元素 (Image)

```json
{
  "type": "image",              // 必須是"image"
  "name": "Logo",               // 【替換】圖像元素名稱
  "source": "https://example.com/logo.png", // 【替換】圖像URL或資源ID
  "time": 0,                    // 【替換】開始時間(秒)
  "duration": 10,               // 【替換】持續時間(秒)
  "x": "85%",                   // 【替換】水平位置
  "y": "10%",                   // 【替換】垂直位置
  "width": "20%",               // 【替換】寬度
  "height": "auto",             // 【替換】高度(auto為自動)
  "fit": "contain"              // 【替換】適應模式(contain或cover)
}
```

## 實際使用示例

### 示例1：添加單個音軌

在Set節點中輸入：

```json
{
  "type": "audio",
  "name": "Audio-P49",
  "source": "354b0f97-79b5-4440-8d53-8753af7ded0f",
  "time": 1.773,
  "volume": "50%",
  "track": 8
}
```

### 示例2：添加標題文本和音軌

```json
[
  {
    "type": "text",
    "name": "Text-H3M",
    "text": "川普警告中日",
    "time": 0,
    "x": "5.0006%",
    "y": "11%",
    "width": "89.9988%",
    "x_alignment": "50%",
    "font_family": "Noto Sans TC",
    "font_weight": "900",
    "font_size_minimum": "7 vmin",
    "font_size_maximum": "11 vmin",
    "fill_color": "#ffffff"
  },
  {
    "type": "audio",
    "name": "Audio-K6J",
    "type": "audio",
    "track": 7,
    "time": 0,
    "source": "ad85b81f-f92d-496b-8a16-689e1dabbd3c",
    "volume": "50%"
  }
]
```

## 時間格式說明

時間值支持以下格式：
- 數字: `1.773` (單位為秒)
- 字符串帶單位: `"1.773 s"` (推薦格式)

合併節點會自動處理這兩種格式。 