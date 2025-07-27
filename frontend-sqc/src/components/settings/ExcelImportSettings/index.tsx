import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Zap, FileSpreadsheet, Upload, ChevronDown } from "lucide-react";
import ExcelImportDesktop from "./ExcelImportDesktop";
import OptimizedExcelImport from "./OptimizedExcelImport";

export default function ExcelImportSettings() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("optimized");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 파일 선택 핸들러
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* 모바일에서는 최적화 버전만 제공 */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">최적화된 엑셀 업로드</h3>
              <p className="text-sm text-blue-700">빠르고 안정적인 대용량 파일 처리</p>
            </div>
          </div>
        </div>
        <OptimizedExcelImport />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 아코디언으로 감싸진 엑셀 가져오기 */}
      <Accordion type="single" collapsible className="w-full" defaultValue="">
        <AccordionItem value="excel-import" className="border rounded-lg">
          <Card className="border-0">
            <AccordionTrigger className="hover:no-underline p-0">
              <CardHeader className="flex-row items-center justify-between w-full p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-xl font-bold text-gray-900">엑셀 데이터 가져오기</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">주문 데이터를 엑셀 파일로 일괄 업로드하세요</p>
                  </div>
                </div>
                
                {/* 파일 업로드 버튼 (항상 표시) */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Input
                      id="quick-file-upload"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="outline" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {selectedFile ? selectedFile.name.slice(0, 20) + (selectedFile.name.length > 20 ? '...' : '') : '파일 선택'}
                    </Button>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-200" />
                </div>
              </CardHeader>
            </AccordionTrigger>
            
            <AccordionContent>
              <CardContent className="pt-0">
                {/* 탭 인터페이스 */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="optimized" className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      최적화 업로드
                      <Badge variant="secondary" className="ml-1">추천</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="standard" className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      표준 업로드
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="optimized" className="mt-6">
                    <OptimizedExcelImport />
                  </TabsContent>

                  <TabsContent value="standard" className="mt-6">
                    <ExcelImportDesktop />
                  </TabsContent>
                </Tabs>

                {/* 비교 정보 */}
                <Card className="bg-muted/30 mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">업로드 방식 비교</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-900">최적화 업로드</span>
                          <Badge variant="secondary">추천</Badge>
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1 ml-6">
                          <li>• 클라이언트 사전 처리로 50% 빠른 업로드</li>
                          <li>• 실시간 진행률 및 상세 상태 표시</li>
                          <li>• 배치 처리로 안정적인 대용량 파일 지원</li>
                          <li>• 업로드 중 취소 기능</li>
                          <li>• 스마트 중복 검사 및 업데이트</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-900">표준 업로드</span>
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1 ml-6">
                          <li>• 기본적인 엑셀 파일 업로드</li>
                          <li>• 서버에서 모든 처리 수행</li>
                          <li>• 소규모 파일에 적합</li>
                          <li>• 단순한 인터페이스</li>
                          <li>• 기존 방식과 동일한 결과</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
}