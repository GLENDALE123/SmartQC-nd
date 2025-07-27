import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadExcel } from "@/api/excel-upload";

export default function ExcelImportDesktop() {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 형식 검증
      if (!file.name.match(/\.(xlsx|xls)$/)) {
        setImportMessage("엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.");
        setMessageType("error");
        return;
      }
      
      // 파일 크기 검증 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setImportMessage("파일 크기는 10MB 이하여야 합니다.");
        setMessageType("error");
        return;
      }

      setImportFile(file);
      setImportMessage("");
      setMessageType("info");
    }
  };

  const handleExcelImport = async () => {
    if (!importFile) {
      setImportMessage("파일을 선택해주세요.");
      setMessageType("error");
      return;
    }

    setIsImporting(true);
    setUploadProgress(0);
    setImportMessage("파일 업로드 중...");
    setMessageType("info");

    // 진행바 애니메이션
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const response = await uploadExcel(importFile);
      
      // 업로드 완료 시 진행바를 100%로 설정
      setUploadProgress(100);
      clearInterval(progressInterval);
      
      setTimeout(() => {
        setIsImporting(false);
        setUploadProgress(0);
        
        // 백엔드 응답 구조에 맞게 수정: response.data에 직접 결과가 있음
        const responseData = (response as any).data?.data || (response as any).data;
        
        if (responseData && responseData.results) {
          const { results } = responseData;
          const { success = 0, fail = 0, details = {} } = results;
          const { created = 0, updated = 0, skipped = 0 } = details;
          
          // 백엔드 로그와 동일한 형식으로 메시지 생성
          const detailMessage = `성공 ${success}건 (생성: ${created}, 업데이트: ${updated}, 스킵: ${skipped}), 실패: ${fail}건`;
          
          // 메시지 타입 결정
           if (fail === 0) {
             setMessageType("success");
           } else if (success > 0) {
             setMessageType("info"); // 부분 성공
           } else {
             setMessageType("error"); // 전체 실패
           }
          
          setImportMessage(detailMessage);
        } else {
          // message가 있는 경우 해당 메시지 표시
          const message = (response as any).data?.message || '파일 업로드가 완료되었습니다.';
          setImportMessage(`✅ ${message}`);
          setMessageType("success");
        }
        
        setImportFile(null);
        
        // 파일 입력 초기화
        const fileInput = document.getElementById('excel-file') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      }, 500); // 0.5초 후에 완료 메시지 표시
      
    } catch (error: any) {
      clearInterval(progressInterval);
      setIsImporting(false);
      setUploadProgress(0);
      
      // 에러 메시지 처리
      let errorMessage = "❌ 파일 업로드에 실패했습니다.";
      
      if (error.response?.data?.message) {
        errorMessage += `\n\n상세: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage += `\n\n상세: ${error.message}`;
      } else {
        errorMessage += " 응답 데이터가 없습니다.";
      }
      
      setImportMessage(errorMessage);
      setMessageType("error");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileSpreadsheet className="w-5 h-5" />
          엑셀 가져오기
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground">
          엑셀 파일을 업로드하여 데이터를 가져올 수 있습니다.
        </div>

        {/* 파일 형식 안내 */}
        <div className="p-4 bg-muted/50 rounded-lg border">
          <p className="text-sm font-medium mb-2">파일 형식 요구사항:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• 엑셀 파일(.xlsx, .xls)만 업로드 가능</li>
            <li>• 2번째 시트의 데이터를 읽어옵니다</li>
            <li>• 5번째 행부터 데이터가 시작되어야 합니다</li>
          </ul>
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-1">헤더 순서:</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              col0, 년, 월, 일, 분류, 발주번호, 열1, 코드, 등록번호, 열2, 발주처, 제품명, 부속명, 발주수량, 사양, 후공정, 생산, 잔여, 진행, 견본, 출하일, D-DAY, 담당, 출하, 지그, 등록, 구분, 단가, 발주금액, 기타, 구분2, 매출담당
            </p>
            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-700 font-medium">매핑 정보:</p>
              <p className="text-xs text-blue-600 leading-relaxed">
                • 년월일 → 합쳐서 날짜로 표시<br/>
                • 분류 → category<br/>
                • 발주번호 → finalorderNumber<br/>
                • 열1 → orderNumber
              </p>
            </div>
          </div>
        </div>

        {/* 파일 업로드 */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="excel-file">엑셀 파일 선택</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isImporting}
              className="mt-1"
            />
          </div>

          {/* 선택된 파일 표시 */}
          {importFile && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  선택된 파일: {importFile.name}
                </span>
              </div>
            </div>
          )}

          {/* 업로드 버튼 */}
          <div className="flex justify-end">
            <Button 
              onClick={handleExcelImport} 
              disabled={!importFile || isImporting}
              className="flex items-center gap-2"
              size="sm"
            >
              <Upload className="w-4 h-4" />
              {isImporting ? "업로드 중..." : "파일 업로드"}
            </Button>
          </div>

          {/* 진행바 */}
          {isImporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">업로드 진행률</span>
                <span className="text-muted-foreground">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* 메시지 표시 */}
          {importMessage && (
            <Alert className={
              messageType === "success" ? "border-green-200 bg-green-50" :
              messageType === "error" ? "border-red-200 bg-red-50" :
              "border-blue-200 bg-blue-50"
            }>
              <AlertDescription className={
                messageType === "success" ? "text-green-800" :
                messageType === "error" ? "text-red-800" :
                "text-blue-800"
              }>
                {importMessage}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}