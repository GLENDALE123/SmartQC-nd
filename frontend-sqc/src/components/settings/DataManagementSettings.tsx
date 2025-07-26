import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Upload, Database, AlertTriangle } from "lucide-react";

export default function DataManagementSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="w-5 h-5" />
          데이터 관리
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground">
          데이터를 내보내거나 가져올 수 있습니다.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
            <Download className="w-6 h-6" />
            <span className="text-sm font-medium">데이터 내보내기</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
            <Upload className="w-6 h-6" />
            <span className="text-sm font-medium">데이터 가져오기</span>
          </Button>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h4 className="font-medium text-destructive text-sm">위험 구역</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            아래 작업들은 되돌릴 수 없습니다. 신중하게 진행하세요.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
              계정 비활성화
            </Button>
            <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
              모든 데이터 삭제
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 