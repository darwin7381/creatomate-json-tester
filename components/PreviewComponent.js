import React, { useEffect, useRef, useState } from 'react';
import { Preview } from '@creatomate/preview';

export default function PreviewComponent({ jsonInput, filePath, onError, onLoadingChange }) {
  const containerRef = useRef(null);
  const previewRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const debounceTimeoutRef = useRef(null);
  const previousJsonInputRef = useRef('');

  // 初始化預覽SDK
  useEffect(() => {
    if (!containerRef.current) return;

    const setupPreview = () => {
      try {
        // 清理先前的實例
        if (previewRef.current) {
          previewRef.current.dispose();
          previewRef.current = null;
        }

        if (onLoadingChange) onLoadingChange(true);

        // 初始化預覽器
        const preview = new Preview(
          containerRef.current,
          'player',
          process.env.NEXT_PUBLIC_CREATOMATE_PUBLIC_TOKEN
        );

        preview.onReady = async () => {
          try {
            setIsInitialized(true);

            // 嘗試加載模板（如果配置了）
            if (process.env.NEXT_PUBLIC_TEMPLATE_ID) {
              await preview.loadTemplate(process.env.NEXT_PUBLIC_TEMPLATE_ID);
            }

            if (onLoadingChange) onLoadingChange(false);
          } catch (err) {
            console.error('初始化預覽時出錯:', err);
            if (onError) onError(`初始化預覽時出錯: ${err.message}`);
            if (onLoadingChange) onLoadingChange(false);
          }
        };

        preview.onError = (err) => {
          console.error('預覽SDK錯誤:', err);
          if (onError) {
            // 如果是CORS錯誤或視頻載入錯誤，提供更友好的錯誤信息
            if (err.includes('CORS') || err.includes('video') || err.includes('load')) {
              onError('視頻資源載入錯誤: 請確保視頻URL正確且允許跨域訪問');
            } else {
              onError(`預覽SDK錯誤: ${err}`);
            }
          }
          if (onLoadingChange) onLoadingChange(false);
        };

        preview.onLoad = () => {
          if (onLoadingChange) onLoadingChange(true);
        };

        preview.onLoadComplete = () => {
          if (onLoadingChange) onLoadingChange(false);
        };

        previewRef.current = preview;
      } catch (err) {
        console.error('設置預覽時出錯:', err);
        if (onError) onError(`設置預覽時出錯: ${err.message}`);
        if (onLoadingChange) onLoadingChange(false);
      }
    };

    setupPreview();

    // 清理函數
    return () => {
      if (previewRef.current) {
        previewRef.current.dispose();
        previewRef.current = null;
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // 處理從文件加載的JSON
  useEffect(() => {
    const loadJsonFile = async () => {
      if (!previewRef.current || !isInitialized || !filePath) return;

      try {
        if (onLoadingChange) onLoadingChange(true);
        
        const response = await fetch(`/api/load-json-file?filePath=${encodeURIComponent(filePath)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP錯誤 ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.content && previewRef.current) {
          try {
            const jsonSource = JSON.parse(data.content);
            await previewRef.current.setSource(jsonSource);
          } catch (err) {
            if (onError) onError(`無法應用JSON: ${err.message}`);
          }
        } else if (data.error) {
          if (onError) onError(`載入JSON錯誤: ${data.error}`);
        }
      } catch (err) {
        console.error('載入JSON文件失敗:', err);
        if (onError) onError(`載入JSON文件失敗: ${err.message}`);
      } finally {
        if (onLoadingChange) onLoadingChange(false);
      }
    };

    loadJsonFile();
  }, [filePath, isInitialized]);

  // 使用防抖處理JSON輸入更新
  useEffect(() => {
    if (!isInitialized || !jsonInput) return;
    
    // 避免處理相同的輸入
    if (jsonInput === previousJsonInputRef.current) return;
    previousJsonInputRef.current = jsonInput;
    
    // 清除現有的超時
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // 使用防抖處理更新，等待用戶停止輸入500毫秒後再處理
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        if (onLoadingChange) onLoadingChange(true);
        if (onError) onError(''); // 清除先前的錯誤
        
        try {
          // 檢查是否為有效的JSON
          const jsonSource = JSON.parse(jsonInput);
          
          // 確保JSON包含必要的元素
          if (!jsonSource.elements || !Array.isArray(jsonSource.elements)) {
            if (onError) onError('JSON缺少elements數組或格式不正確');
            return;
          }
          
          await previewRef.current.setSource(jsonSource);
        } catch (parseError) {
          // 如果是JSON解析錯誤，提供友好的錯誤訊息但不阻止其他操作
          console.error('JSON解析錯誤:', parseError);
          if (onError) onError(`JSON格式錯誤: ${parseError.message}`);
          // 不要在這裡返回，讓用戶繼續編輯
        }
      } catch (err) {
        console.error('應用JSON時出錯:', err);
        if (onError) onError(`應用JSON時出錯: ${err.message}`);
      } finally {
        if (onLoadingChange) onLoadingChange(false);
      }
    }, 500);
    
  }, [jsonInput, isInitialized]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }}></div>;
} 