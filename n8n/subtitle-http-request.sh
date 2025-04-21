#!/bin/bash
# n8n - Creatomate API HTTP請求節點配置
# 該文件提供n8n中HTTP Request節點的配置說明

# ====== n8n HTTP Request節點配置 ======

# 1. 方法設置
# 將Method下拉選單設置為: POST

# 2. URL設置
# URL: https://api.creatomate.com/v1/renders

# 3. 身份驗證設置
# Authentication: Bearer Token
# Token: YOUR_CREATOMATE_API_KEY (替換為您的API密鑰)

# 4. 發送請求體設置
# 啟用Send Body選項
# 選擇JSON格式
# Body內容: {{$json.creatomateRequest}}

# 5. 頭信息設置
# 添加頭信息: Content-Type = application/json

# 6. 選項設置
# 選擇返回所有響應，格式為JSON

# ====== 對應的CURL命令 ======
# 該命令僅供參考，實際使用n8n界面配置

curl --request POST \
  --url 'https://api.creatomate.com/v1/renders' \
  --header 'Authorization: Bearer YOUR_CREATOMATE_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{{$json.creatomateRequest}}'

# ====== 注意事項 ======
# 1. 確保已創建Creatomate API的憑證
# 2. 在n8n的憑證管理中添加您的API密鑰
# 3. HTTP節點應該連接在Code節點之後，以獲取處理好的字幕請求數據
# 4. 返回的數據將包含視頻URL，可在後續節點中使用 