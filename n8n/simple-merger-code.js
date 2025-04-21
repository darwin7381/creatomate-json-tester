// 簡易元素合併節點
// 目的：合併字幕處理結果與用戶自定義元素

// 獲取字幕處理節點的輸出
const baseRequest = items[0].json.creatomateRequest;
const baseSource = baseRequest.source;

// 獲取用戶提供的自定義元素（如果有）
const customElements = items[0].json.elements || [];

// 合併所有元素
const allElements = [
  ...baseSource.elements,  // 保留原有元素（包括背景視頻和字幕）
  ...customElements        // 添加用戶自定義的元素
];

// 創建合併後的請求
const mergedRequest = {
  ...baseRequest,
  source: {
    ...baseSource,
    elements: allElements
  }
};

// 返回合併結果
return [{
  json: {
    creatomateRequest: mergedRequest
  }
}]; 