import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Clock, X, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useExcelProcessor } from "@/hooks/useExcelProcessor";
import { useWebWorkerExcel } from "@/hooks/useWebWorkerExcel";
import { formatFileSize, estimateProcessingTime } from "@/utils/excel-validator";
import { ChunkUploader, ChunkUploadProgress } from "@/utils/chunk-uploader";

interface UploadProgress {
  uploadId: string;
  stage: 'parsing' | 'validating' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  processedRows?: number;
  totalRows?: number;
  currentBatch?: number;
  totalBatches?: number;
  processedChunks?: number;
  totalChunks?: number;
  details?: {
    created: number;
    updated: number;
    skipped: number;
    failed: number;
  };
}

export default function OptimizedExcelImport() {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [importMessage, setImportMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [useClientProcessing, setUseClientProcessing] = useState(true);
  const [useWebWorker, setUseWebWorker] = useState(true);
  const [useChunkUpload, setUseChunkUpload] = useState(true);
  
  // 청크 업로드 상태
  const [chunkProgress, setChunkProgress] = useState<ChunkUploadProgress | null>(null);
  const [chunkUploader, setChunkUploader] = useState<ChunkUploader | null>(null);

  const {
    isValidating,
    isProcessing,
    validationResult,
    processResult,
    error: processingError,
    validateFile,
    processFile,
    reset
  } = useExcelProcessor();

  const {
    state: workerState,
    validateFile: workerValidateFile,
    parseFile: workerParseFile,
    chunkData: workerChunkData,
    reset: workerReset
  } = useWebWorkerExcel();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 기본 검증
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setImportMessage("엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.");
      setMessageType("error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImportMessage("파일 크기는 10MB 이하여야 합니다.");
      setMessageType("error");
      return;
    }

    setImportFile(file);
    reset();
    workerReset();
    setImportMessage("");

    // 클라이언트 측 사전 검증 활성화 시
    if (useClientProcessing) {
      try {
        let validation;
        
        // 웹 워커 사용 여부에 따른 분기 처리
        if (useWebWorker && workerState.isReady) {
          setImportMessage("웹 워커로 파일 검증 중...");
          validation = await workerValidateFile(file);
        } else {
          setImportMessage("메인 스레드에서 파일 검증 중...");
          validation = await validateFile(file);
        }
        
        if (!validation.isValid) {
          setImportMessage(`파일 검증 실패:\n${validation.errors.join('\n')}`);
          setMessageType("error");
          return;
        }

        if (validation.warnings.length > 0) {
          setImportMessage(`경고사항:\n${validation.warnings.join('\n')}`);
          setMessageType("info");
        } else {
          setImportMessage("파일 검증 완료 ✓");
          setMessageType("success");
        }

      } catch (error: any) {
        setImportMessage(`파일 검증 중 오류: ${error?.message || '알 수 없는 오류'}`);
        setMessageType("error");
      }
    }
  };

  const handleOptimizedUpload = useCallback(async () => {
    if (!importFile) {
      setImportMessage("파일을 선택해주세요.");
      setMessageType("error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(null);
    setChunkProgress(null);
    setImportMessage("업로드 준비 중...");
    setMessageType("info");

    try {
      let preProcessedData = null;
      let validationSummary = null;

      // 클라이언트 측 사전 처리
      if (useClientProcessing && (validationResult?.isValid || workerState.result?.isValid)) {
        
        // 웹 워커 사용 여부에 따른 분기 처리
        if (useWebWorker && workerState.isReady) {
          setImportMessage("웹 워커로 데이터 사전 처리 중...");
          
          // 웹 워커로 파일 파싱
          const parseResult = await workerParseFile(importFile);
          
          if (parseResult.data && parseResult.data.length > 0) {
            // 데이터 청크 분할 (1000건씩)
            const chunkResult = await workerChunkData(parseResult.data, 1000);
            
            preProcessedData = parseResult.data;
            validationSummary = {
              total: parseResult.data.length,
              valid: parseResult.validCount || parseResult.data.length,
              invalid: parseResult.invalidCount || 0,
              chunks: chunkResult.chunks || []
            };
            
            setImportMessage(`웹 워커 사전 처리 완료: 유효 ${validationSummary.valid}건, 무효 ${validationSummary.invalid}건`);
          }
          
        } else {
          setImportMessage("메인 스레드에서 데이터 사전 처리 중...");
          
          const processedResult = await processFile(importFile);
          preProcessedData = processedResult.validData;
          validationSummary = processedResult.summary;

          setImportMessage(`사전 처리 완료: 유효 ${processedResult.summary.valid}건, 무효 ${processedResult.summary.invalid}건`);
        }
      }

      // 청크 업로드 사용 여부에 따른 분기
      if (useChunkUpload && preProcessedData && preProcessedData.length > 1000) {
        // 청크 업로드 실행
        const optimalChunkSize = ChunkUploader.calculateOptimalChunkSize(
          preProcessedData.length
        );
        const optimalConcurrency = ChunkUploader.calculateOptimalConcurrency(
          Math.ceil(preProcessedData.length / optimalChunkSize)
        );

        const uploader = new ChunkUploader({
          chunkSize: optimalChunkSize,
          maxConcurrentUploads: optimalConcurrency,
          retryAttempts: 3,
          retryDelay: 1000
        });

        setChunkUploader(uploader);

        setImportMessage("청크 업로드 시작...");

        const chunkResult = await uploader.uploadChunks(
          preProcessedData,
          importFile.name,
          importFile.size,
          (progress: ChunkUploadProgress) => {
            setChunkProgress(progress);
            setImportMessage(progress.message);
          }
        );

        if (chunkResult.success) {
          // 상세한 성공 메시지 포맷팅
          const { results } = chunkResult;
          if (results) {
            const successMessage = `✅ 청크 업로드 완료!\n\n` +
              `📊 처리 결과:\n` +
              `• 생성: ${results.created}건\n` +
              `• 업데이트: ${results.updated}건\n` +
              `• 중복 스킵: ${results.skipped}건\n` +
              `• 실패: ${results.fail}건\n\n` +
              `총 성공: ${results.created + results.updated + results.skipped}건\n` +
              `처리된 청크: ${chunkResult.totalChunks}개`;
            
            setImportMessage(successMessage);
          } else {
            setImportMessage(`✅ 청크 업로드 완료! 총 ${chunkResult.totalChunks}개 청크 처리`);
          }
          setMessageType("success");
          
          // 파일 입력 초기화
          setImportFile(null);
          reset();
          workerReset();
          const fileInput = document.getElementById('optimized-excel-file') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        } else {
          throw new Error(chunkResult.error || "청크 업로드 실패");
        }
      } else {
        // 기존 일괄 업로드
        const formData = new FormData();
        formData.append('file', importFile);
        
        if (preProcessedData) {
          formData.append('preProcessedData', JSON.stringify(preProcessedData));
          formData.append('validationSummary', JSON.stringify(validationSummary));
        }

        // 업로드 시작
        const uploadResponse = await fetch('/api/upload/optimized/excel-orders', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`업로드 실패: ${uploadResponse.statusText}`);
        }

        const uploadResult = await uploadResponse.json();
        const uploadId = uploadResult.data.uploadId;

        // SSE로 실시간 진행률 수신
        const eventSource = new EventSource(`/api/upload/optimized/progress/${uploadId}`);
        
        eventSource.onmessage = (event) => {
          try {
            const progress: UploadProgress = JSON.parse(event.data);
            setUploadProgress(progress);
            setImportMessage(progress.message);

            if (progress.stage === 'completed') {
              setMessageType("success");
              setIsUploading(false);
              eventSource.close();
              
              // 성공 메시지 포맷팅
              const { details } = progress;
              if (details) {
                const successMessage = `✅ 업로드 완료!\n\n` +
                  `📊 처리 결과:\n` +
                  `• 생성: ${details.created}건\n` +
                  `• 업데이트: ${details.updated}건\n` +
                  `• 중복 스킵: ${details.skipped}건\n` +
                  `• 실패: ${details.failed}건\n\n` +
                  `총 성공: ${details.created + details.updated + details.skipped}건`;
                
                setImportMessage(successMessage);
              }

              // 파일 입력 초기화
              setImportFile(null);
              reset();
              workerReset();
              const fileInput = document.getElementById('optimized-excel-file') as HTMLInputElement;
              if (fileInput) fileInput.value = '';

            } else if (progress.stage === 'error') {
              setMessageType("error");
              setIsUploading(false);
              eventSource.close();
            }

          } catch (error) {
            console.error('진행률 파싱 오류:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE 연결 오류:', error);
          setImportMessage("진행률 수신 중 오류가 발생했습니다.");
          setMessageType("error");
          setIsUploading(false);
          eventSource.close();
        };
      }

    } catch (error: any) {
      setIsUploading(false);
      setUploadProgress(null);
      setChunkProgress(null);
      
      let errorMessage = "❌ 업로드에 실패했습니다.";
      if (error.message) {
        errorMessage += `\n\n상세: ${error.message}`;
      }
      
      setImportMessage(errorMessage);
      setMessageType("error");
    } finally {
      setChunkUploader(null);
    }
  }, [importFile, useClientProcessing, useWebWorker, useChunkUpload, validationResult, workerState, workerParseFile, workerChunkData, processFile, reset, workerReset]);

  const cancelUpload = async () => {
    if (uploadProgress?.uploadId) {
      try {
        await fetch(`/api/upload/optimized/${uploadProgress.uploadId}`, {
          method: 'DELETE'
        });
        
        setIsUploading(false);
        setUploadProgress(null);
        setImportMessage("업로드가 취소되었습니다.");
        setMessageType("info");
      } catch (error) {
        console.error('업로드 취소 실패:', error);
      }
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'processing': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStageText = (stage: string) => {
    switch (stage) {
      case 'parsing': return '파일 파싱';
      case 'validating': return '데이터 검증';
      case 'processing': return '데이터 처리';
      case 'completed': return '완료';
      case 'error': return '오류';
      default: return '대기';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileSpreadsheet className="w-5 h-5" />
          최적화된 엑셀 가져오기
          <Badge variant="secondary" className="ml-2">
            {useClientProcessing ? 
              (useWebWorker ? "웹 워커 모드" : "고속 모드") : 
              "표준 모드"
            }
          </Badge>
          {useWebWorker && (
            <Badge variant={workerState.isReady ? "default" : "destructive"} className="ml-1">
              <Zap className="w-3 h-3 mr-1" />
              {workerState.isReady ? "워커 준비" : "워커 로딩"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* 처리 모드 선택 */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Label className="text-sm font-medium">처리 모드:</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="client-processing"
                checked={useClientProcessing}
                onChange={(e) => setUseClientProcessing(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="client-processing" className="text-sm">
                클라이언트 사전 처리 (빠른 업로드)
              </Label>
            </div>
          </div>

          {/* 웹 워커 옵션 */}
          {useClientProcessing && (
            <div className="ml-4 space-y-3 border-l-2 border-blue-200 pl-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="web-worker"
                  checked={useWebWorker}
                  onChange={(e) => setUseWebWorker(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="web-worker" className="text-sm">
                  웹 워커 사용 (메인 스레드 차단 방지)
                </Label>
                <Zap className="h-4 w-4 text-yellow-500" />
                {useWebWorker && (
                  <Badge 
                    variant={workerState.isReady ? "default" : "secondary"} 
                    className="text-xs"
                  >
                    {workerState.isReady ? "준비됨" : "로딩 중..."}
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="chunk-upload"
                  checked={useChunkUpload}
                  onChange={(e) => setUseChunkUpload(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="chunk-upload" className="text-sm">
                  청크 업로드 (대용량 파일 최적화)
                </Label>
                <Badge variant="outline" className="text-xs">
                  1000행 이상
                </Badge>
              </div>
            </div>
          )}

          {/* 웹 워커 진행률 표시 */}
          {useWebWorker && workerState.isProcessing && (
            <div className="ml-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">웹 워커 처리 중</span>
              </div>
              <Progress value={workerState.progress} className="mb-1" />
              <p className="text-xs text-blue-600">{workerState.message}</p>
            </div>
          )}
        </div>

        {/* 파일 선택 */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="optimized-excel-file">엑셀 파일 선택</Label>
            <Input
              id="optimized-excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isUploading || isValidating}
              className="mt-1"
            />
          </div>

          {/* 파일 정보 표시 */}
          {importFile && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      {importFile.name}
                    </p>
                    <p className="text-xs text-blue-600">
                      크기: {formatFileSize(importFile.size)}
                    </p>
                    {validationResult && (
                      <p className="text-xs text-blue-600">
                        예상 처리 시간: {estimateProcessingTime(validationResult.rowCount)}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* 검증 상태 */}
                {isValidating && (
                  <Badge variant="outline" className="text-blue-600">
                    검증 중...
                  </Badge>
                )}
                {validationResult?.isValid && (
                  <Badge variant="outline" className="text-green-600">
                    ✓ 검증 완료
                  </Badge>
                )}
              </div>

              {/* 검증 결과 상세 */}
              {validationResult && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-700">
                    총 {validationResult.rowCount}행 데이터
                  </p>
                  {processResult && (
                    <div className="mt-1 text-xs text-blue-700">
                      유효: {processResult.summary.valid}건, 
                      무효: {processResult.summary.invalid}건
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 업로드 진행률 */}
          {uploadProgress && (
            <div className="p-4 bg-gray-50 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStageIcon(uploadProgress.stage)}
                  <span className="text-sm font-medium">
                    {getStageText(uploadProgress.stage)}
                  </span>
                </div>
                
                {isUploading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelUpload}
                    className="h-6 px-2"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>

              <Progress value={uploadProgress.progress} className="mb-2" />
              
              <div className="text-xs text-gray-600">
                {uploadProgress.processedRows && uploadProgress.totalRows && (
                  <div>
                    진행률: {uploadProgress.processedRows}/{uploadProgress.totalRows} 
                    ({Math.round((uploadProgress.processedRows / uploadProgress.totalRows) * 100)}%)
                  </div>
                )}
                {uploadProgress.currentBatch && uploadProgress.totalBatches && (
                  <div>
                    배치: {uploadProgress.currentBatch}/{uploadProgress.totalBatches}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 청크 업로드 진행률 */}
          {chunkProgress && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    청크 업로드 진행
                  </span>
                </div>
                
                {chunkUploader && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => chunkUploader.abort()}
                    className="h-6 px-2"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>

              <Progress value={chunkProgress.progress} className="mb-2" />
              
              <div className="text-xs text-green-700">
                <div className="flex justify-between">
                  <span>{chunkProgress.message}</span>
                  <span>{chunkProgress.progress}%</span>
                </div>
                <div className="flex space-x-4 mt-1">
                  <span>완료: {chunkProgress.completedChunks}</span>
                  <span>전체: {chunkProgress.totalChunks}</span>
                  <span>현재: {chunkProgress.currentChunk}</span>
                </div>
              </div>
            </div>
          )}

          {/* 업로드 버튼 */}
          <div className="flex justify-end">
            <Button 
              onClick={handleOptimizedUpload} 
              disabled={
                !importFile || 
                isUploading || 
                isValidating || 
                isProcessing ||
                (useWebWorker && !workerState.isReady) ||
                workerState.isProcessing ||
                !!chunkProgress
              }
              className="flex items-center gap-2"
              size="sm"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? (chunkProgress ? "청크 업로드 중..." : "업로드 중...") : 
               isValidating ? "검증 중..." :
               isProcessing ? "처리 중..." :
               workerState.isProcessing ? "웹 워커 처리 중..." :
               (useWebWorker && !workerState.isReady) ? "웹 워커 준비 중..." :
               "최적화 업로드"}
            </Button>
          </div>

          {/* 메시지 표시 */}
          {importMessage && (
            <Alert className={
              messageType === "success" ? "border-green-200 bg-green-50" :
              messageType === "error" ? "border-red-200 bg-red-50" :
              "border-blue-200 bg-blue-50"
            }>
              <AlertDescription className="whitespace-pre-line text-sm">
                {importMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* 처리 에러 표시 */}
          {processingError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                {processingError}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* 성능 비교 정보 */}
        <div className="p-4 bg-muted/50 rounded-lg border">
          <p className="text-sm font-medium mb-2">💡 성능 최적화 정보:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <strong>웹 워커 모드:</strong> 메인 스레드 차단 없이 백그라운드에서 파일 처리</li>
            <li>• <strong>고속 모드:</strong> 클라이언트에서 사전 처리하여 업로드 시간 50% 단축</li>
            <li>• <strong>청크 업로드:</strong> 대용량 파일을 작은 단위로 분할하여 안정적 업로드</li>
            <li>• <strong>병렬 처리:</strong> 여러 청크를 동시에 업로드하여 속도 향상</li>
            <li>• <strong>재시도 메커니즘:</strong> 실패한 청크 자동 재시도로 안정성 보장</li>
            <li>• <strong>실시간 진행률:</strong> 각 단계별 상세한 진행 상황 표시</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}