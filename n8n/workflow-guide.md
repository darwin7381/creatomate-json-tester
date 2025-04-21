# n8n 字幕視頻生成工作流指南

## 完整工作流程

本指南詳細說明如何在n8n中設置字幕視頻自動生成工作流。

### 工作流概述

1. **輸入節點** - 讀取字幕文件（SRT格式）
2. **Code節點** - 處理字幕並生成Creatomate請求數據
3. **HTTP Request節點** - 將請求發送到Creatomate API
4. **（可選）後處理節點** - 處理API響應，保存視頻URL等

### 詳細設置步驟

#### 1. 輸入節點設置

可以使用以下任一方式作為輸入：

**方法A: 讀取本地文件**
- 使用 **Read Binary File** 節點
- 設置文件路徑指向SRT文件
- 確保輸出字段名稱為 `subtitle_srt`

**方法B: HTTP請求接收上傳文件**
- 使用 **HTTP Request** 節點作為觸發器
- 配置為接收文件上傳
- 確保字幕內容被保存為 `subtitle_srt` 字段

**方法C: 手動輸入**
- 使用 **Set** 節點手動設置字幕內容
- 創建名為 `subtitle_srt` 的字段並設置其值為字幕內容

#### 2. Code節點設置

- 添加 **Code** 節點
- 使用 `subtitle-processor-code.js` 的內容
- 確認已修改代碼從 `items[0].json.subtitle_srt` 獲取輸入

#### 3. HTTP Request節點設置

- 添加 **HTTP Request** 節點
- 配置以下設置：
  - **方法**: POST
  - **URL**: `https://api.creatomate.com/v1/renders`
  - **認證**: Bearer Token（使用您的Creatomate API金鑰）
  - **請求體**:
    - 啟用發送請求體選項
    - 選擇JSON格式
    - Body: `{{$json.creatomateRequest}}`
  - **頭信息**:
    - Content-Type: application/json
  - **選項**:
    - 返回完整響應: 是
    - 響應格式: JSON

#### 4. 後處理（可選）

- 添加 **Set** 節點提取視頻URL
- 表達式: `{{$json.body[0].url}}`
- 使用 **Send Email** 節點發送視頻URL
- 或使用 **HTTP Request** 節點將URL發送到其他系統

### 故障排除

如果遇到問題：

1. **字幕解析錯誤** - 確認SRT格式正確，文件編碼為UTF-8
2. **API錯誤** - 檢查API金鑰是否正確，請求格式是否符合要求
3. **輸出問題** - 使用 **Debug** 節點檢查每個階段的數據結構

### 實用技巧

- 使用n8n的憑證系統安全存儲API金鑰
- 設置工作流錯誤處理，發送通知郵件
- 考慮添加重試機制處理暫時性API故障
- 對於大量處理，可以添加隊列節點控制併發請求

### 完整工作流JSON

您可以直接導入 `subtitle-workflow.json` 文件來獲取預先配置好的工作流。只需要：
1. 修改輸入節點指向您的字幕文件
2. 設置您的Creatomate API金鑰
3. 添加您需要的後處理節點 