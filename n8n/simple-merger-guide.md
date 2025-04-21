# 簡易元素合併節點使用指南

這個簡易版本的合併節點讓您可以直接添加任何自定義元素到字幕視頻中。

## 基本用法

1. **設置輸入**：
   - 第一個輸入必須來自字幕處理節點 (提供基本的`creatomateRequest`)
   - 第二個輸入應提供包含`elements`數組的JSON

2. **格式**：
   ```json
   {
     "elements": [
       {
         "type": "audio",
         "name": "Background Music",
         "source": "354b0f97-79b5-4440-8d53-8753af7ded0f",
         "time": "0 s",
         "volume": "50%"
       },
       {
         "type": "text",
         "text": "標題文字",
         "font_family": "Noto Sans TC",
         "y": "20%",
         "time": "0 s",
         "duration": "5 s"
       }
     ]
   }
   ```

## 音軌元素示例

完整的音軌元素示例：

```json
{
  "elements": [
    {
      "type": "audio",
      "name": "Background Music",
      "source": "354b0f97-79b5-4440-8d53-8753af7ded0f",
      "time": "0 s",
      "volume": "50%",
      "track": 1
    },
    {
      "type": "audio", 
      "name": "Sound Effect",
      "source": "ad85b81f-f92d-496b-8a16-689e1dabbd3c",
      "time": "5 s",
      "volume": "80%"
    }
  ]
}
```

## 工作流設置

1. **在n8n中創建一個Set節點**：
   - 添加名為`elements`的數組字段
   - 直接將您的元素JSON貼入

2. **連接節點**：
   - 字幕處理節點 → 合併節點（輸入0）
   - Set節點 → 合併節點（輸入1）

3. **合併節點的輸出** 將包含完整的請求對象，可以直接發送到Creatomate API

## 自定義元素

您可以添加Creatomate支持的任何元素類型，包括但不限於：

- **audio** - 音軌
- **image** - 圖像
- **text** - 文本
- **shape** - 圖形
- **video** - 視頻片段
- **composition** - 組合元素

## 重要提示

- **時間格式**：時間值必須包含單位，例如 `"5 s"`
- **ID格式**：確保使用正確的Creatomate媒體資源ID
- **屬性名稱**：Creatomate使用下劃線命名法，例如 `font_family` 而不是 `fontFamily`

## 完整工作流示例

簡易合併節點可以幫助您快速添加自定義元素，無需複雜的邏輯處理。您只需準備好想要的元素JSON，然後合併節點會將它們添加到字幕視頻中。 