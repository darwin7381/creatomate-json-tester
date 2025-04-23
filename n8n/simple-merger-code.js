// 簡易元素合併節點
// 目的：合併字幕處理結果與用戶自定義元素
// 
// 【注意】此節點需要連接兩個輸入:
// - 輸入0: 來自字幕處理節點的輸出
// - 輸入1: 自定義元素(可以是單個元素對象、元素數組或包含elements屬性的對象)

// 【第一部分】獲取字幕處理結果
// 注意：代碼會從輸入0獲取字幕處理結果
const subtitleRequest = items[0].json.creatomateRequest;
const subtitleSource = subtitleRequest.source;

// 【第二部分：輸入點】在此添加自定義元素
// 在下面的數組中添加你想要的元素
const userCustomElements = [
  // 在這裡填入你的自定義元素，例如:
  // {
  //   "type": "audio",
  //   "source": "354b0f97-79b5-4440-8d53-8753af7ded0f",
  //   "time": 1.773,
  //   "track": 8
  // }
];

// 【第三部分】處理自定義元素格式
// 這部分代碼會處理userCustomElements的不同格式
let processedElements = [];

// 檢查自定義元素的格式並相應處理
if (userCustomElements && userCustomElements.length > 0) {
  // 1. 如果只有一個元素對象，且它有type屬性
  if (userCustomElements.length === 1 && userCustomElements[0].type) {
    processedElements = [userCustomElements[0]];
  }
  // 2. 如果只有一個元素，且它包含elements數組
  else if (userCustomElements.length === 1 && userCustomElements[0].elements && Array.isArray(userCustomElements[0].elements)) {
    processedElements = userCustomElements[0].elements;
  }
  // 3. 如果是元素數組
  else {
    processedElements = userCustomElements;
  }
}

// 【第四部分】合併元素
const allElements = [
  ...subtitleSource.elements,  // 字幕處理產生的元素
  ...processedElements         // 處理後的自定義元素
];

// 【第五部分】創建最終請求
const mergedRequest = {
  ...subtitleRequest,
  source: {
    ...subtitleSource,
    elements: allElements
  }
};

// 【第六部分】返回結果
return [{
  json: {
    creatomateRequest: mergedRequest,
    debug: {
      totalElements: allElements.length,
      subtitleElements: subtitleSource.elements.length,
      customElements: processedElements.length
    }
  }
}]; 