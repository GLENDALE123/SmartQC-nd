import { useState, useCallback } from 'react';
import { validateExcelFile, preProcessExcelData, ExcelValidationResult, ExcelPreProcessResult } from '@/utils/excel-validator';

export interface UseExcelProcessorState {
  isValidating: boolean;
  isProcessing: boolean;
  validationResult: ExcelValidationResult | null;
  processResult: ExcelPreProcessResult | null;
  error: string | null;
}

export const useExcelProcessor = () => {
  const [state, setState] = useState<UseExcelProcessorState>({
    isValidating: false,
    isProcessing: false,
    validationResult: null,
    processResult: null,
    error: null
  });

  const validateFile = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, isValidating: true, error: null }));
    
    try {
      const result = await validateExcelFile(file);
      setState(prev => ({ 
        ...prev, 
        isValidating: false, 
        validationResult: result 
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '파일 검증 중 오류가 발생했습니다.';
      setState(prev => ({ 
        ...prev, 
        isValidating: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, []);

  const processFile = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    
    try {
      const result = await preProcessExcelData(file);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        processResult: result 
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '파일 처리 중 오류가 발생했습니다.';
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isValidating: false,
      isProcessing: false,
      validationResult: null,
      processResult: null,
      error: null
    });
  }, []);

  return {
    ...state,
    validateFile,
    processFile,
    reset
  };
};