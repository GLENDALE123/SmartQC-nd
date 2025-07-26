import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff } from "lucide-react";
import type { User } from '@/types/auth';

interface SecuritySettingsProps {
  user?: User | null;
}

export default function SecuritySettings({ user }: SecuritySettingsProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5" />
          보안 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground">
          계정 보안을 관리하고 설정할 수 있습니다.
        </div>

        {user && (
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">비밀번호 변경</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="새 비밀번호를 입력하세요"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="font-medium text-sm">두 단계 인증</div>
              <div className="text-sm text-muted-foreground">계정 보안을 강화합니다</div>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="font-medium text-sm">로그인 알림</div>
              <div className="text-sm text-muted-foreground">새로운 기기에서 로그인 시 알림</div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 