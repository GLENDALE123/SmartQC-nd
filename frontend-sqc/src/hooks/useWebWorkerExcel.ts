import { useRef, useEffect, useCallback, useState } from 'react';

export interface WebWorkerExcelState {
  isReady: boolean;
  isProcessing: boolean;
  progress: number;
  message: string;
  error: string | null;
  result: any;
}

export interface WebWorkerExcelHook {
  state: WebWorkerExcelState;
  validateFile: (file: File) => Promise<any>;
  parseFile: (file: File) => Promise<any>;
  chunkData: (data: any[], chunkSize?: number) => Promise<any>;
  reset: () => void;
  terminate: () => void;
}

/**
 * 웹 워커를 활용한 엑셀 처리 훅
 */
export const useWebWorkerExcel = (): WebWorkerExcelHook => {
  const workerRef = useRef<Worker | null>(null);
  const resolveRef = useRef<((value: any) => void) | null>(null);
  const rejectRef = useRef<((reason: any) => void) | null>(null);

  const [state, setState] = useState<WebWorkerExcelState>({
    isReady: false,
    isProcessing: false,
    progress: 0,
    message: '',
    error: null,
    result: null
  });

  // 워커 초기화
  useEffect(() => {
    try {
      workerRef.current = new Worker('/excel-worker.js');
      
      workerRef.current.onmessage = (e) => {
        const { type, progress, message, result, error } = e.data;
        
        switch (type) {
          case 'ready':
            setState(prev => ({
              ...prev,
              isReady: true,
              message: message || '워커 준비 완료'
            }));
            break;
            
          case 'progress':
            setState(prev => ({
              ...prev,
              progress: progress || 0,
              message: message || '',
              result: result || prev.result
            }));
            break;
            
          case 'complete':
            setState(prev => ({
              ...prev,
              isProcessing: false,
              progress: 100,
              result,
              error: null
            }));
            
            if (resolveRef.current) {
              resolveRef.current(result);
              resolveRef.current = null;
              rejectRef.current = null;
            }
            break;
            
          case 'error':
            setState(prev => ({
              ...prev,
              isProcessing: false,
              error: error || '알 수 없는 오류가 발생했습니다.',
              progress: 0
            }));
            
            if (rejectRef.current) {
              rejectRef.current(new Error(error || '워커 처리 중 오류 발생'));
              resolveRef.current = null;
              rejectRef.current = null;
            }
            break;
        }
      };
      
      workerRef.current.onerror = (error) => {
        console.error('웹 워커 오류:', error);
        setState(prev => ({
          ...prev,
          isReady: false,
          isProcessing: false,
          error: '웹 워커 초기화 실패'
        }));
      };
      
    } catch (error) {
      console.error('웹 워커 생성 실패:', error);
      setState(prev => ({
        ...prev,
        error: '웹 워커를 지원하지 않는 브라우저입니다.'
      }));
    }
    
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // 워커에 작업 요청
  const sendToWorker = useCallback((action: string, file?: File, data?: any, options?: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('웹 워커가 초기화되지 않았습니다.'));
        return;
      }
      
      if (!state.isReady) {
        reject(new Error('웹 워커가 아직 준비되지 않았습니다.'));
        return;
      }
      
      if (state.isProcessing) {
        reject(new Error('이미 처리 중인 작업이 있습니다.'));
        return;
      }
      
      setState(prev => ({
        ...prev,
        isProcessing: true,
        progress: 0,
        error: null,
        result: null
      }));
      
      resolveRef.current = resolve;
      rejectRef.current = reject;
      
      workerRef.current.postMessage({
        action,
        file,
        data,
        options
      });
    });
  }, [state.isReady, state.isProcessing]);

  // 파일 검증
  const validateFile = useCallback(async (file: File) => {
    return sendToWorker('validate', file);
  }, [sendToWorker]);

  // 파일 파싱
  const parseFile = useCallback(async (file: File) => {
    return sendToWorker('parse', file);
  }, [sendToWorker]);

  // 데이터 청크 분할
  const chunkData = useCallback(async (data: any[], chunkSize = 1000) => {
    return sendToWorker('chunk', undefined, data, { chunkSize });
  }, [sendToWorker]);

  // 상태 초기화
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      isProcessing: false,
      progress: 0,
      message: '',
      error: null,
      result: null
    }));
    
    resolveRef.current = null;
    rejectRef.current = null;
  }, []);

  // 워커 종료
  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    
    setState({
      isReady: false,
      isProcessing: false,
      progress: 0,
      message: '',
      error: null,
      result: null
    });
  }, []);

  return {
    state,
    validateFile,
    parseFile,
    chunkData,
    reset,
    terminate
  };
};