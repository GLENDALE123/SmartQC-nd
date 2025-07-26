import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ExcelImportSettings() {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportMessage("");
    }
  };

  const handleExcelImport = async () => {
    if (!importFile) {
      setImportMessage("파일을 선택해주세요.");
      return;
    }

    setIsImporting(true);
    setImportMessage("파일 업로드 중...");

    // 시뮬레이션된 업로드
    setTimeout(() => {
      setIsImporting(false);
      setImportMessage("파일 업로드가 완료되었습니다! (시뮬레이션)");
      setImportFile(null);
    }, 2000);
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
            <li>• 5번째 열(E열)부터 헤더가 시작되어야 합니다</li>
            <li>• 헤더 순서: 0,년,월,일,분류,열1,발주번호,코드,등록번호,열2,발주처,제품명,부속명...</li>
          </ul>
        </div>

        {/* 파일 업로드 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="excel-file" className="text-sm font-medium">엑셀 파일 선택</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isImporting}
            />
          </div>

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

          {importMessage && (
            <Alert>
              <AlertDescription>{importMessage}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
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
        </div>
      </CardContent>
    </Card>
  );
}