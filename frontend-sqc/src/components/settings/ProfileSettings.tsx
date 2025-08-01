import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Edit2 } from "lucide-react";
import type { User } from '@/types/auth';
import { useAuth } from "@/hooks/useAuth";

interface ProfileSettingsProps {
  user?: User | null;
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
  const [editMode, setEditMode] = useState(false);
  const { user: currentUser, updateUser, isLoading } = useAuth();
  
  // currentUser를 우선적으로 사용하고, 없으면 prop으로 받은 user 사용
  const activeUser = currentUser || user;
  
  const [form, setForm] = useState({
    name: activeUser?.name || '',
    rank: activeUser?.rank || '',
    position: activeUser?.position || '',
    inspectionType: activeUser?.inspectionType || 'all',
    processLine: activeUser?.processLine || '',
  });

  // 디버깅을 위한 로그
  console.log('ProfileSettings - currentUser:', currentUser);
  console.log('ProfileSettings - prop user:', user);
  console.log('ProfileSettings - activeUser:', activeUser);
  console.log('ProfileSettings - form:', form);
  console.log('ProfileSettings - isLoading:', isLoading);

  // activeUser가 변경될 때마다 폼 업데이트
  useEffect(() => {
    if (activeUser) {
      setForm({
        name: activeUser.name || '',
        rank: activeUser.rank || '',
        position: activeUser.position || '',
        inspectionType: activeUser.inspectionType || 'all',
        processLine: activeUser.processLine || '',
      });
    }
  }, [activeUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };



  const handleSave = async () => {
    try {
      // 실제 사용자 정보 업데이트
      if (currentUser) {
        await updateUser({
          name: form.name,
          rank: form.rank === 'select' ? undefined : form.rank,
          position: form.position === 'select' ? undefined : form.position,
          inspectionType: form.inspectionType,
          processLine: form.processLine === 'select' ? undefined : form.processLine,
        });
      }
      
      setEditMode(false);
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      // 에러 처리 (필요시 토스트 메시지 등 추가)
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserIcon className="w-5 h-5" />
            프로필 정보
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setEditMode((v) => !v)} disabled={isLoading || !activeUser}>
            <Edit2 className="w-4 h-4 mr-2" />
            {editMode ? '취소' : '수정'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground">
          기본 사용자 정보를 확인하고 수정할 수 있습니다.
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">사용자 정보를 불러오는 중...</div>
          </div>
        ) : !activeUser ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.</div>
          </div>
        ) : (
          <form className="space-y-6">
            {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">기본 정보</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">이름</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={!editMode}
                  placeholder="사용자 이름을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rank" className="text-sm font-medium">직급</Label>
                <Select
                  value={form.rank}
                  onValueChange={(value) => handleSelectChange('rank', value)}
                  disabled={!editMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="직급을 선택하세요" />
                  </SelectTrigger>
                                      <SelectContent>
                      <SelectItem value="select">선택</SelectItem>
                      <SelectItem value="employee">사원</SelectItem>
                    <SelectItem value="team_leader">조장</SelectItem>
                    <SelectItem value="chief">주임</SelectItem>
                    <SelectItem value="assistant_manager">대리</SelectItem>
                    <SelectItem value="deputy_manager">부직장</SelectItem>
                    <SelectItem value="manager">과장</SelectItem>
                    <SelectItem value="director">직장</SelectItem>
                    <SelectItem value="head_of_division">본부장</SelectItem>
                    <SelectItem value="executive">상무</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium">직책</Label>
                <Select
                  value={form.position}
                  onValueChange={(value) => handleSelectChange('position', value)}
                  disabled={!editMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="직책을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">선택</SelectItem>
                    <SelectItem value="team_leader">분임조</SelectItem>
                    <SelectItem value="line_manager">라인관리자</SelectItem>
                    <SelectItem value="head_of_division">본부장</SelectItem>
                    <SelectItem value="factory_manager">공장장</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 검사 타입 설정 - 분임조일 때만 표시 */}
          {form.position === 'team_leader' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">검사 타입 설정</h3>
              <div className="space-y-2">
                <Label htmlFor="inspectionType" className="text-sm font-medium">담당 검사 타입</Label>
                <Select
                  value={form.inspectionType}
                  onValueChange={(value) => handleSelectChange('inspectionType', value)}
                  disabled={!editMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="검사 타입을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select">선택</SelectItem>
                    <SelectItem value="incoming">수입검사</SelectItem>
                    <SelectItem value="process">공정검사</SelectItem>
                    <SelectItem value="shipment">출하검사</SelectItem>
                    <SelectItem value="all">전체</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 공정검사일 때만 주 공정라인 표시 */}
              {form.inspectionType === 'process' && (
                <div className="space-y-2">
                  <Label htmlFor="processLine" className="text-sm font-medium">주 공정라인</Label>
                  <Select
                    value={form.processLine}
                    onValueChange={(value) => handleSelectChange('processLine', value)}
                    disabled={!editMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="주 공정라인을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="select">선택</SelectItem>
                      <SelectItem value="deposition1">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className="bg-red-100 text-red-800 hover:bg-red-200"
                          >
                            증착1
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="deposition2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className="bg-orange-100 text-orange-800 hover:bg-orange-200"
                          >
                            증착2
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="coating1">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className="bg-green-100 text-green-800 hover:bg-green-200"
                          >
                            1코팅
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="coating2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                          >
                            2코팅
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="internal_coating">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                          >
                            내부코팅
                          </Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          {editMode && (
            <div className="flex justify-end">
              <Button type="button" onClick={handleSave} size="sm">
                저장
              </Button>
            </div>
          )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}