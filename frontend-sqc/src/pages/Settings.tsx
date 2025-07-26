import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Download, User, Shield, Bell, Database, Bug, Upload } from "lucide-react";
import { useUser } from "@/hooks/useAuth";

// Import modular settings components
import ProfileSettings from "@/components/settings/ProfileSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import DataManagementSettings from "@/components/settings/DataManagementSettings";
import DefectTypesSettings from "@/components/settings/DefectTypesSettings";
import ExcelImportSettings from "@/components/settings/ExcelImportSettings";

type SettingsTab = 'profile' | 'security' | 'notifications' | 'data' | 'defect-types' | 'excel-import';

export default function Settings() {
  const user = useUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  const settingsTabs = [
    { id: 'profile' as SettingsTab, label: "프로필", icon: User },
    { id: 'security' as SettingsTab, label: "보안", icon: Shield },
    { id: 'notifications' as SettingsTab, label: "알림 설정", icon: Bell },
    { id: 'data' as SettingsTab, label: "데이터 관리", icon: Database },
    ...(isAdmin ? [{ id: 'defect-types' as SettingsTab, label: "불량 유형 관리", icon: Bug }] : []),
    ...(isAdmin ? [{ id: 'excel-import' as SettingsTab, label: "엑셀 가져오기", icon: Upload }] : []),
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings user={user} />;
      case 'security':
        return <SecuritySettings user={user} />;
      case 'notifications':
        return <NotificationSettings />;
      case 'data':
        return <DataManagementSettings />;
      case 'defect-types':
        return isAdmin ? <DefectTypesSettings /> : null;
      case 'excel-import':
        return isAdmin ? <ExcelImportSettings /> : null;
      default:
        return <ProfileSettings user={user} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">설정</h1>
          <p className="text-muted-foreground">시스템 설정을 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            설정 내보내기
          </Button>
          <Button size="sm">
            <Save className="w-4 h-4 mr-2" />
            변경사항 저장
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">설정 메뉴</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {settingsTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors rounded-md ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
} 