import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    quality: true,
    reports: true,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="w-5 h-5" />
          알림 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground">
          다양한 알림 설정을 관리할 수 있습니다.
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="font-medium text-sm">이메일 알림</div>
              <div className="text-sm text-muted-foreground">중요한 업데이트를 이메일로 받기</div>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked: boolean) =>
                setNotifications({ ...notifications, email: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="font-medium text-sm">푸시 알림</div>
              <div className="text-sm text-muted-foreground">브라우저 푸시 알림</div>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(checked: boolean) =>
                setNotifications({ ...notifications, push: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="font-medium text-sm">품질 이슈 알림</div>
              <div className="text-sm text-muted-foreground">품질 문제 발생 시 즉시 알림</div>
            </div>
            <Switch
              checked={notifications.quality}
              onCheckedChange={(checked: boolean) =>
                setNotifications({ ...notifications, quality: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="font-medium text-sm">보고서 알림</div>
              <div className="text-sm text-muted-foreground">보고서 생성 완료 시 알림</div>
            </div>
            <Switch
              checked={notifications.reports}
              onCheckedChange={(checked: boolean) =>
                setNotifications({ ...notifications, reports: checked })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}