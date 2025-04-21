# 元素合併節點使用指南

這個指南說明如何使用元素合併節點來將字幕、音軌和其他元素組合到一個完整的Creatomate請求中。

## 概述

元素合併節點設計為接收多種不同類型的元素，並將它們組合成一個統一的Creatomate請求。這種模塊化方法允許您:

1. 單獨處理字幕（使用現有的字幕處理節點）
2. 直接添加JSON格式的其他元素（音軌、圖像等）
3. 將所有元素合併為一個最終請求

## 工作流設置

### 基本工作流結構

```
[字幕輸入] → [字幕處理節點] → [元素合併節點] → [HTTP Request節點]
                                  ↑
[音軌輸入] → [Set節點] ────────────┘
```

### 步驟說明

1. **字幕處理流程**:
   - 使用前面創建的字幕處理節點處理SRT字幕
   - 輸出包含`creatomateRequest`對象

2. **準備音軌數據**:
   - 使用Set節點創建包含音軌數據的JSON數組
   - 格式化為`audioElements`數組字段

3. **合併元素**:
   - 使用元素合併節點接收所有輸入
   - 輸出合併後的完整請求

4. **發送到API**:
   - 使用HTTP Request節點發送合併請求到Creatomate API

## 如何添加音軌元素

在Set節點中，創建以下JSON結構:

```json
{
  "audioElements": [
    {
      "name": "Background Music",
      "source": "354b0f97-79b5-4440-8d53-8753af7ded0f", // Creatomate媒體庫ID或URL
      "time": 0,             // 開始時間（秒）
      "volume": "50%",       // 音量百分比
      "track": 1             // 音軌編號
    },
    {
      "name": "Sound Effect",
      "source": "ad85b81f-f92d-496b-8a16-689e1dabbd3c",
      "time": 5.5,           // 5.5秒處開始播放
      "volume": "80%"
    }
  ]
}
```

## 如何添加圖像元素

```json
{
  "imageElements": [
    {
      "name": "Logo",
      "source": "https://example.com/logo.png",
      "time": 0,
      "duration": 10,        // 持續10秒
      "x": "85%",            // 右側位置
      "y": "10%",            // 頂部位置
      "width": "20%",        // 寬度為視頻寬度的20%
      "additionalProps": {   // 任何其他Creatomate支持的屬性
        "opacity": "80%"
      }
    }
  ]
}
```

## 如何添加文本元素

```json
{
  "textElements": [
    {
      "name": "Title",
      "text": "我的視頻標題",
      "time": 0,
      "duration": 5,
      "y": "30%",            // 頂部1/3位置
      "font_size": "8 vmin",
      "fill_color": "#FFDD00"
    }
  ]
}
```

## 如何添加完全自定義元素

對於完全自定義的元素，可以使用`customElements`數組:

```json
{
  "customElements": [
    {
      "type": "shape",
      "shape_type": "rectangle",
      "x": "50%",
      "y": "50%",
      "width": "100%",
      "height": "20%",
      "fill_color": "rgba(0,0,0,0.5)",
      "time": 0,
      "duration": "5 s"
    }
  ]
}
```

## 故障排除

如果遇到問題:

1. **確保順序正確** - 字幕處理節點必須在元素合併節點之前執行
2. **檢查JSON格式** - 確保所有添加的元素都有正確的格式和必要屬性
3. **驗證元素ID** - 確保音頻和圖像的source URL或ID是有效的
4. **檢查時間格式** - 數字將自動轉換為"X s"格式，但自定義格式必須按Creatomate規範

## 完整工作流示例

請參考`merger-workflow-example.json`獲取完整的工作流示例，包括字幕處理、音軌添加和HTTP請求。 