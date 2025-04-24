import React, { useEffect, useRef, useState } from 'react';
import { Preview } from '@creatomate/preview';

export default function PreviewComponent({ jsonInput, filePath, onError, onLoadingChange }) {
  const containerRef = useRef(null);
  const previewRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const debounceTimeoutRef = useRef(null);
  const previousJsonInputRef = useRef('');
  const processingRef = useRef(false);
  const pendingUpdateRef = useRef(null);
  
  // 分離更新到獨立時間片段，避免阻塞主線程
  const scheduleUpdate = (callback) => {
    return new Promise(resolve => {
      if (typeof window !== 'undefined') {
        // 使用 setTimeout 嵌套在 requestAnimationFrame 中，進一步減少對主線程的佔用
        window.requestAnimationFrame(() => {
          // 用 0ms 延遲來釋放主線程，允許輸入處理
          setTimeout(() => {
            try {
              const result = callback();
              resolve(result);
            } catch (err) {
              console.error('執行更新時出錯:', err);
              resolve(null);
            }
          }, 0);
        });
      } else {
        try {
          const result = callback();
          resolve(result);
        } catch (err) {
          console.error('執行更新時出錯:', err);
          resolve(null);
        }
      }
    });
  };

  // 初始化預覽SDK
  useEffect(() => {
    if (!containerRef.current) return;

    const setupPreview = async () => {
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
          processingRef.current = false;
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
          processingRef.current = true;
          if (onLoadingChange) onLoadingChange(true);
        };

        preview.onLoadComplete = () => {
          // 延遲標記處理完成，確保UI更新後再處理新的輸入
          setTimeout(() => {
            processingRef.current = false;
            if (onLoadingChange) onLoadingChange(false);
          }, 50);
        };

        previewRef.current = preview;
      } catch (err) {
        console.error('設置預覽時出錯:', err);
        if (onError) onError(`設置預覽時出錯: ${err.message}`);
        processingRef.current = false;
        if (onLoadingChange) onLoadingChange(false);
      }
    };

    setupPreview();

    // 清理函數
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (pendingUpdateRef.current) {
        clearTimeout(pendingUpdateRef.current);
      }
      if (previewRef.current) {
        previewRef.current.dispose();
        previewRef.current = null;
      }
    };
  }, []);

  // 處理從文件加載的JSON
  useEffect(() => {
    const loadJsonFile = async () => {
      if (!previewRef.current || !isInitialized || !filePath || processingRef.current) return;

      processingRef.current = true;
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
            
            // 使用非阻塞方式應用JSON
            await scheduleUpdate(() => {
              if (!previewRef.current) return null;
              return previewRef.current.setSource(jsonSource).catch(err => {
                console.error('應用JSON時出錯:', err);
                if (onError) onError(`無法應用JSON: ${err.message}`);
              });
            });
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
        // 延遲重置處理標誌，讓UI有時間響應
        setTimeout(() => {
          processingRef.current = false;
          if (onLoadingChange) onLoadingChange(false);
        }, 50);
      }
    };

    loadJsonFile();
  }, [filePath, isInitialized]);

  // 使用防抖處理JSON輸入更新
  useEffect(() => {
    // 清除現有的更新計劃
    if (pendingUpdateRef.current) {
      clearTimeout(pendingUpdateRef.current);
      pendingUpdateRef.current = null;
    }
    
    if (!isInitialized || !jsonInput) return;
    
    // 避免處理相同的輸入
    if (jsonInput === previousJsonInputRef.current) return;
    previousJsonInputRef.current = jsonInput;
    
    // 避免在處理中重複觸發更新
    if (processingRef.current) {
      // 如果正在處理，計劃稍後再嘗試
      pendingUpdateRef.current = setTimeout(() => {
        // 重新觸發效果而不更新依賴項
        const currentInput = jsonInput;
        setImmediate(() => {
          if (currentInput === jsonInput) {
            previousJsonInputRef.current = '';
          }
        });
      }, 1000);
      return;
    }
    
    // 清除現有的超時
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // 使用更長的防抖延遲，確保用戶完成輸入
    debounceTimeoutRef.current = setTimeout(() => {
      try {
        let jsonSource;
        
        try {
          // 驗證JSON格式，但不應用
          jsonSource = JSON.parse(jsonInput);
          
          // 簡單檢查是否為有效物件
          if (!jsonSource || typeof jsonSource !== 'object') {
            if (onError) onError('JSON格式不正確，請確保提供有效的對象');
            return;
          }
        } catch (parseError) {
          console.error('JSON解析錯誤:', parseError);
          if (onError) onError(`JSON格式錯誤: ${parseError.message}`);
          return;
        }
        
        if (!previewRef.current) return;
        
        // 標記正在處理
        processingRef.current = true;
        if (onLoadingChange) onLoadingChange(true);
        if (onError) onError(''); // 清除錯誤
        
        // 使用非阻塞方式設置源
        scheduleUpdate(async () => {
          if (!previewRef.current) return;
          
          try {
            await previewRef.current.setSource(jsonSource);
          } catch (err) {
            console.error('應用JSON時出錯:', err);
            if (onError) onError(`應用JSON時出錯: ${err.message}`);
          } finally {
            // 延遲重置處理標誌，讓UI有時間響應
            setTimeout(() => {
              processingRef.current = false;
              if (onLoadingChange) onLoadingChange(false);
            }, 50);
          }
        });
      } catch (err) {
        console.error('處理JSON輸入時出錯:', err);
        if (onError) onError(`處理JSON時出錯: ${err.message}`);
        processingRef.current = false;
        if (onLoadingChange) onLoadingChange(false);
      }
    }, 1000); // 使用更長的防抖時間，確保用戶完成輸入
    
  }, [jsonInput, isInitialized]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }}></div>;
} 