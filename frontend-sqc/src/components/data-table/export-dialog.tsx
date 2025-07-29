import { useState, useMemo } from 'react';
import { Order } from '@/types/models';
import { 
  exportService, 
  ExportFormat, 
  ORDER_EXPORT_FIELDS,
  CsvExportOptions,
  JsonExportOptions 
} from '@/services/export-service';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  DownloadIcon, 
  EyeOpenIcon, 
  ReloadIcon,
  FileTextIcon,
  TableIcon,
  CodeIcon 
} from '@radix-ui/react-icons';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Order[];
  selectedRows?: Order[];
  filters?: Record<string, unknown>;
  onExport?: () => void;
}

export function ExportDialog({
  open,
  onOpenChange,
  data,
  selectedRows = [],
  onExport,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [filename, setFilename] = useState('');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [exportScope, setExportScope] = useState<'all' | 'filtered' | 'selected'>('all');
  const [csvDelimiter, setCsvDelimiter] = useState<',' | ';' | '\t'>(',');
  const [dateFormat, setDateFormat] = useState<'local' | 'iso' | 'short'>('local');
  const [preview, setPreview] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 내보낼 데이터 결정
  const exportData = useMemo(() => {
    switch (exportScope) {
      case 'selected':
        return selectedRows;
      case 'filtered':
        // 필터가 적용된 데이터 (실제로는 부모 컴포넌트에서 전달받아야 함)
        return data;
      case 'all':
      default:
        return data;
    }
  }, [exportScope, data, selectedRows]);

  // 선택된 필드가 없으면 모든 필드 선택
  const fieldsToExport = selectedFields.length > 0 ? selectedFields : ORDER_EXPORT_FIELDS.map(f => f.key as string);

  // 파일명 자동 생성
  const generateFilename = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const scope = exportScope === 'selected' ? 'selected' : exportScope === 'filtered' ? 'filtered' : 'all';
    return `orders_${scope}_${timestamp}.${format}`;
  };

  // 미리보기 생성
  const handlePreview = async () => {
    if (exportData.length === 0) {
      setPreview('내보낼 데이터가 없습니다.');
      return;
    }

    setIsGeneratingPreview(true);
    try {
      const options = {
        format,
        selectedFields: fieldsToExport,
        includeHeaders,
        dateFormat,
        ...(format === 'csv' && { delimiter: csvDelimiter }),
      };

      const previewText = await exportService.previewExport(exportData, options, 5);
      setPreview(previewText);
    } catch (error) {
      setPreview(`미리보기 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // 내보내기 실행
  const handleExport = async () => {
    if (exportData.length === 0) {
      alert('내보낼 데이터가 없습니다.');
      return;
    }

    setIsExporting(true);
    try {
      const finalFilename = filename || generateFilename();
      
      const baseOptions = {
        filename: finalFilename,
        selectedFields: fieldsToExport,
        includeHeaders,
        dateFormat,
      };

      if (format === 'csv') {
        const csvOptions: CsvExportOptions = {
          ...baseOptions,
          format: 'csv',
          delimiter: csvDelimiter,
          encoding: 'utf-8-bom',
        };
        await exportService.exportOrders(exportData, csvOptions);
      } else if (format === 'json') {
        const jsonOptions: JsonExportOptions = {
          ...baseOptions,
          format: 'json',
          pretty: true,
          indent: 2,
        };
        await exportService.exportOrders(exportData, jsonOptions);
      } else if (format === 'excel') {
        // Excel은 CSV로 대체
        const excelOptions: CsvExportOptions = {
          ...baseOptions,
          format: 'csv',
          filename: finalFilename.replace('.xlsx', '.csv'),
          delimiter: ',',
          encoding: 'utf-8-bom',
        };
        await exportService.exportOrders(exportData, excelOptions);
      }

      onExport?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`내보내기 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // 필드 선택 토글
  const toggleField = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey)
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  // 모든 필드 선택/해제
  const toggleAllFields = () => {
    if (selectedFields.length === ORDER_EXPORT_FIELDS.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields(ORDER_EXPORT_FIELDS.map(f => f.key as string));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DownloadIcon className="h-5 w-5" />
            주문 데이터 내보내기
          </DialogTitle>
          <DialogDescription>
            주문 데이터를 다양한 형식으로 내보낼 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="options" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="options">내보내기 옵션</TabsTrigger>
            <TabsTrigger value="fields">필드 선택</TabsTrigger>
            <TabsTrigger value="preview">미리보기</TabsTrigger>
          </TabsList>

          <TabsContent value="options" className="space-y-4 overflow-y-auto max-h-[60vh]">
            {/* 내보내기 범위 */}
            <div className="space-y-2">
              <Label>내보내기 범위</Label>
              <RadioGroup value={exportScope} onValueChange={(value: 'all' | 'filtered' | 'selected') => setExportScope(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="scope-all" />
                  <Label htmlFor="scope-all">
                    전체 데이터 ({data.length}개)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="selected" id="scope-selected" />
                  <Label htmlFor="scope-selected">
                    선택된 행 ({selectedRows.length}개)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="filtered" id="scope-filtered" />
                  <Label htmlFor="scope-filtered">
                    필터링된 데이터 ({data.length}개)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* 파일 형식 */}
            <div className="space-y-2">
              <Label>파일 형식</Label>
              <RadioGroup value={format} onValueChange={(value: ExportFormat) => setFormat(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="format-csv" />
                  <Label htmlFor="format-csv" className="flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4" />
                    CSV (쉼표로 구분된 값)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="format-excel" />
                  <Label htmlFor="format-excel" className="flex items-center gap-2">
                    <TableIcon className="h-4 w-4" />
                    Excel (CSV 형식으로 내보내기)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="json" id="format-json" />
                  <Label htmlFor="format-json" className="flex items-center gap-2">
                    <CodeIcon className="h-4 w-4" />
                    JSON (JavaScript Object Notation)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* 파일명 */}
            <div className="space-y-2">
              <Label htmlFor="filename">파일명</Label>
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder={generateFilename()}
              />
            </div>

            {/* CSV 옵션 */}
            {format === 'csv' && (
              <>
                <Separator />
                <div className="space-y-4">
                  <Label>CSV 옵션</Label>
                  
                  <div className="space-y-2">
                    <Label>구분자</Label>
                    <RadioGroup value={csvDelimiter} onValueChange={(value: ',' | ';' | '\t') => setCsvDelimiter(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="," id="delimiter-comma" />
                        <Label htmlFor="delimiter-comma">쉼표 (,)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value=";" id="delimiter-semicolon" />
                        <Label htmlFor="delimiter-semicolon">세미콜론 (;)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="\t" id="delimiter-tab" />
                        <Label htmlFor="delimiter-tab">탭 (\t)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </>
            )}

            {/* 공통 옵션 */}
            <Separator />
            <div className="space-y-4">
              <Label>공통 옵션</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-headers"
                  checked={includeHeaders}
                  onCheckedChange={(checked) => setIncludeHeaders(checked as boolean)}
                />
                <Label htmlFor="include-headers">헤더 포함</Label>
              </div>

              <div className="space-y-2">
                <Label>날짜 형식</Label>
                <RadioGroup value={dateFormat} onValueChange={(value: 'local' | 'iso' | 'short') => setDateFormat(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="local" id="date-local" />
                    <Label htmlFor="date-local">로컬 형식 (2024-01-01 09:00:00)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="short" id="date-short" />
                    <Label htmlFor="date-short">짧은 형식 (2024-01-01)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="iso" id="date-iso" />
                    <Label htmlFor="date-iso">ISO 형식 (2024-01-01T09:00:00.000Z)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fields" className="space-y-4 overflow-y-auto max-h-[60vh]">
            <div className="flex items-center justify-between">
              <Label>내보낼 필드 선택</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedFields.length || ORDER_EXPORT_FIELDS.length} / {ORDER_EXPORT_FIELDS.length} 선택됨
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAllFields}
                >
                  {selectedFields.length === ORDER_EXPORT_FIELDS.length ? '모두 해제' : '모두 선택'}
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[400px] border rounded-md p-4">
              <div className="space-y-2">
                {ORDER_EXPORT_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`field-${field.key}`}
                      checked={selectedFields.length === 0 || selectedFields.includes(field.key as string)}
                      onCheckedChange={() => toggleField(field.key as string)}
                    />
                    <Label htmlFor={`field-${field.key}`} className="flex-1">
                      {field.label}
                    </Label>
                    <Badge variant="outline" className="text-xs">
                      {field.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 overflow-y-auto max-h-[60vh]">
            <div className="flex items-center justify-between">
              <Label>미리보기 (처음 5행)</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                disabled={isGeneratingPreview}
              >
                {isGeneratingPreview ? (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <EyeOpenIcon className="mr-2 h-4 w-4" />
                )}
                미리보기 생성
              </Button>
            </div>

            <Textarea
              value={preview}
              readOnly
              placeholder="미리보기를 생성하려면 '미리보기 생성' 버튼을 클릭하세요."
              className="min-h-[300px] font-mono text-sm"
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleExport} disabled={isExporting || exportData.length === 0}>
            {isExporting ? (
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <DownloadIcon className="mr-2 h-4 w-4" />
            )}
            내보내기 ({exportData.length}개)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}