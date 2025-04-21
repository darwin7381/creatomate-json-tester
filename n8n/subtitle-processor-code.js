// n8n - 字幕处理Code节点
// 输入: 
// - 字幕内容 (items[0].json.subtitle_srt)

// 解析字幕文件
function parseSubtitles(content) {
  // 前处理：处理各种可能的格式问题
  
  // 1. 检查是否是只有一行但包含\n字符的情况
  if (!content.includes('\n') && content.includes('\\n')) {
    // 将\n字符序列替换为实际的换行符
    content = content.replace(/\\n/g, '\n');
  }
  
  // 2. 检查是否是JSON格式的字幕
  try {
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      const jsonData = JSON.parse(content);
      
      // 简单处理一下常见的字幕JSON格式
      if (Array.isArray(jsonData)) {
        // 可能是数组格式的字幕
        const converted = jsonData.map((item, index) => {
          const startTime = item.startTime || item.start || 0;
          const endTime = item.endTime || item.end || 0;
          const text = item.text || item.content || '';
          
          return `${index + 1}\n00:00:${formatTime(startTime)} --> 00:00:${formatTime(endTime)}\n${text}\n`;
        }).join('\n');
        
        content = converted;
      }
    }
  } catch (e) {
    // 不是有效的JSON，继续使用原始内容
  }
  
  // 3. 处理可能的字幕时间戳格式问题
  
  const lines = content.split('\n');
  const subtitles = [];
  let i = 0;

  // 跳过BOM和文件头部信息
  while (i < lines.length && !lines[i].match(/^\d+$/)) {
    i++;
  }

  while (i < lines.length) {
    // 字幕序号
    const index = parseInt(lines[i], 10);
    if (isNaN(index)) {
      i++;
      continue;
    }
    i++;

    // 时间戳行
    if (i >= lines.length) break;
    const timeLine = lines[i];
    i++;

    // 解析时间范围 - 支持多种格式
    // 标准SRT: 00:00:00,000 --> 00:00:00,000
    // 简化格式: 0:00 --> 0:00
    let timeMatch = timeLine.match(/(\d+:\d+:\d+,\d+)\s*-->\s*(\d+:\d+:\d+,\d+)/) || 
                   timeLine.match(/(\d+:\d+:\d+\.\d+)\s*-->\s*(\d+:\d+:\d+\.\d+)/) ||
                   timeLine.match(/(\d+:\d+)\s*-->\s*(\d+:\d+)/);
    
    if (!timeMatch) continue;

    let startTime = timeMatch[1];
    let endTime = timeMatch[2];
    
    // 统一格式
    startTime = startTime.replace(',', '.');
    endTime = endTime.replace(',', '.');
    
    // 补充完整时间格式
    if (!startTime.includes(':')) {
      startTime = `00:00:${startTime}`;
    } else if (startTime.split(':').length === 2) {
      startTime = `00:${startTime}`;
    }
    
    if (!endTime.includes(':')) {
      endTime = `00:00:${endTime}`;
    } else if (endTime.split(':').length === 2) {
      endTime = `00:${endTime}`;
    }

    // 字幕文本 (可能有多行)
    let text = '';
    while (i < lines.length && lines[i].trim() !== '') {
      text += (text ? '\n' : '') + lines[i];
      i++;
    }

    // 计算时间（秒）
    const startSeconds = parseTimeToSeconds(startTime);
    const endSeconds = parseTimeToSeconds(endTime);
    const duration = endSeconds - startSeconds;

    subtitles.push({
      index,
      start: startSeconds,
      end: endSeconds,
      duration,
      text: text.trim()
    });

    // 跳过空行
    i++;
  }

  return subtitles;
}

/**
 * 格式化时间为 00.000 格式
 * @param {number} seconds 
 * @returns {string}
 */
function formatTime(seconds) {
  const wholeSec = Math.floor(seconds);
  const ms = Math.floor((seconds - wholeSec) * 1000);
  return `${wholeSec.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

/**
 * 将时间字符串转换为秒数
 * @param {string} timeStr 时间字符串 (格式: HH:MM:SS.mmm)
 * @returns {number} 秒数
 */
function parseTimeToSeconds(timeStr) {
  const parts = timeStr.split(':');
  const seconds = parseFloat(parts[2]);
  const minutes = parseInt(parts[1], 10);
  const hours = parseInt(parts[0], 10);
  
  return hours * 3600 + minutes * 60 + seconds;
}

// 主处理流程
try {
  // 获取输入的字幕内容
  const subtitleContent = items[0].json.subtitle_srt;
  
  if (!subtitleContent) {
    throw new Error('未提供字幕内容');
  }
  
  // 解析字幕
  const subtitles = parseSubtitles(subtitleContent);
  
  if (subtitles.length === 0) {
    throw new Error('未找到有效字幕');
  }
  
  // 计算视频总时长 (最后一个字幕的结束时间)
  const totalDuration = Math.ceil(subtitles[subtitles.length - 1].end);
  
  // 构建渲染源定义
  const source = {
    outputFormat: 'mp4',
    width: 1920,
    height: 1080,
    fillColor: '#262626',
    elements: [
      // 背景视频
      {
        type: 'video',
        source: 'https://creatomate.com/files/assets/c16f42db-7b5b-4ab7-9625-bc869fae623d.mp4',
        fit: 'cover'
      }
    ]
  };
  
  // 添加字幕元素
  subtitles.forEach((subtitle) => {
    source.elements.push({
      type: 'text',
      name: 'subtitle',
      text: subtitle.text,
      font_family: 'Noto Sans TC',
      font_size: '5.5 vmin',
      font_size_minimum: '5 vmin',
      line_height: '126%',
      font_weight: '700',
      fill_color: '#FFFFFF',
      x_alignment: '50%',
      y: '70.3388%',
      width: '83.1194%',
      background_color: 'rgba(19,19,19,0.7)',
      time: `${subtitle.start} s`,
      duration: `${subtitle.duration} s`
    });
  });
  
  // 准备输出数据
  const outputData = {
    source: source,
    output_format: 'mp4'
  };
  
  // 返回处理结果
  return [{
    json: {
      creatomateRequest: outputData,
      subtitlesCount: subtitles.length,
      videoDuration: totalDuration,
    }
  }];
  
} catch (error) {
  // 处理错误
  return [{
    json: {
      error: true,
      message: `处理字幕时出错: ${error.message}`,
      stack: error.stack
    }
  }];
} 