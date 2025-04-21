// n8n - 元素合併Code節點
// 目的: 合併字幕、音軌和其他元素到一個完整的Creatomate請求
// 
// 輸入:
// - items[0].json.creatomateRequest - 來自字幕處理節點的基本請求
// - items[0].json.audioElements - (可選) 音軌元素數組
// - items[0].json.imageElements - (可選) 圖像元素數組
// - items[0].json.textElements - (可選) 文本元素數組
// - items[0].json.customElements - (可選) 其他自定義元素數組
//
// 輸出:
// - 合併所有元素的完整Creatomate請求

// 確保輸入有效性
if (!items[0].json.creatomateRequest || !items[0].json.creatomateRequest.source) {
  throw new Error('缺少基本的creatomateRequest。請確保先通過字幕處理節點。');
}

// 獲取基本請求
const baseRequest = items[0].json.creatomateRequest;
const baseSource = baseRequest.source;

// 準備所有元素的數組
let allElements = [...baseSource.elements]; // 起始於基本元素(字幕和背景視頻)

// 添加音軌元素(如果有)
if (items[0].json.audioElements && Array.isArray(items[0].json.audioElements)) {
  console.log(`正在添加 ${items[0].json.audioElements.length} 個音軌元素`);
  
  items[0].json.audioElements.forEach(audioElement => {
    // 確保必要的屬性存在
    if (!audioElement.source) {
      console.log('警告: 跳過缺少source屬性的音軌元素');
      return;
    }
    
    allElements.push({
      type: "audio",
      name: audioElement.name || `Audio-${allElements.length}`,
      source: audioElement.source,
      time: audioElement.time !== undefined ? `${audioElement.time} s` : "0 s",
      volume: audioElement.volume || "100%",
      track: audioElement.track || 1
    });
  });
}

// 添加圖像元素(如果有)
if (items[0].json.imageElements && Array.isArray(items[0].json.imageElements)) {
  console.log(`正在添加 ${items[0].json.imageElements.length} 個圖像元素`);
  
  items[0].json.imageElements.forEach(imageElement => {
    // 確保必要的屬性存在
    if (!imageElement.source) {
      console.log('警告: 跳過缺少source屬性的圖像元素');
      return;
    }
    
    allElements.push({
      type: "image",
      name: imageElement.name || `Image-${allElements.length}`,
      source: imageElement.source,
      time: imageElement.time !== undefined ? `${imageElement.time} s` : "0 s",
      duration: imageElement.duration !== undefined ? `${imageElement.duration} s` : undefined,
      x: imageElement.x || "50%",
      y: imageElement.y || "50%",
      width: imageElement.width || "50%",
      height: imageElement.height || "auto",
      fit: imageElement.fit || "contain",
      ...imageElement.additionalProps // 包含任何其他屬性
    });
  });
}

// 添加額外的文本元素(如果有)
if (items[0].json.textElements && Array.isArray(items[0].json.textElements)) {
  console.log(`正在添加 ${items[0].json.textElements.length} 個文本元素`);
  
  items[0].json.textElements.forEach(textElement => {
    // 確保必要的屬性存在
    if (!textElement.text) {
      console.log('警告: 跳過缺少text屬性的文本元素');
      return;
    }
    
    allElements.push({
      type: "text",
      name: textElement.name || `Text-${allElements.length}`,
      text: textElement.text,
      time: textElement.time !== undefined ? `${textElement.time} s` : "0 s",
      duration: textElement.duration !== undefined ? `${textElement.duration} s` : undefined,
      x: textElement.x || "50%",
      y: textElement.y || "50%",
      width: textElement.width || "80%",
      font_family: textElement.font_family || "Noto Sans TC",
      font_size: textElement.font_size || "5 vmin",
      fill_color: textElement.fill_color || "#FFFFFF",
      ...textElement.additionalProps // 包含任何其他屬性
    });
  });
}

// 添加任何自定義元素(如果有)
if (items[0].json.customElements && Array.isArray(items[0].json.customElements)) {
  console.log(`正在添加 ${items[0].json.customElements.length} 個自定義元素`);
  allElements = allElements.concat(items[0].json.customElements);
}

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
    creatomateRequest: mergedRequest,
    totalElements: allElements.length,
    summary: {
      subtitles: baseSource.elements.length - 1, // 減去背景視頻元素
      audio: items[0].json.audioElements?.length || 0,
      images: items[0].json.imageElements?.length || 0,
      texts: items[0].json.textElements?.length || 0,
      custom: items[0].json.customElements?.length || 0
    }
  }
}]; 