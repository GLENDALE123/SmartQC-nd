import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { defectTypesApi, DefectType } from '@/api/defect-types';
import { ColorPicker } from '@/components/ui/color-picker';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bug } from 'lucide-react';

export default function DefectTypesSettings() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDefectTypeName, setNewDefectTypeName] = useState('');
  const [newDefectTypeColor, setNewDefectTypeColor] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  // 목록 조회 (타입 명시)
  const { data: defectTypes = [], isLoading, isError, error } = useQuery<DefectType[]>({
    queryKey: ['defectTypes'],
    queryFn: defectTypesApi.getAll,
  });

  // 추가
  const createMutation = useMutation({
    mutationFn: (data: { name: string; color?: string }) => defectTypesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defectTypes'] });
      setIsCreateDialogOpen(false);
      setNewDefectTypeName('');
      setNewDefectTypeColor('');
    },
  });

  // 삭제
  const deleteMutation = useMutation({
    mutationFn: defectTypesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['defectTypes'] }),
  });

  // 수정
  const updateMutation = useMutation({
    mutationFn: ({ id, name, color }: { id: number; name: string; color?: string }) => 
      defectTypesApi.update(id, { name, color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defectTypes'] });
      setEditId(null);
      setEditName('');
      setEditColor('');
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bug className="w-5 h-5" />
            표준 불량 유형 관리
          </CardTitle>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            size="sm"
          >
            새 불량 유형 추가
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground">
          AI 분석에 사용될 표준 불량 유형을 관리합니다. ({defectTypes?.length ?? 0}개 등록됨)
          <br />
          <span className="text-xs">
            💡 색상을 선택하면 불량 유형을 시각적으로 구분할 수 있습니다. 사용자 정의 색상도 저장됩니다.
          </span>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">불량 유형 불러오는 중...</p>
        ) : isError ? (
          <p className="text-destructive">불량 유형 목록을 불러오지 못했습니다: {String(error)}</p>
        ) : defectTypes && defectTypes.length > 0 ? (
          <div className="space-y-2">
            {defectTypes.map((type: DefectType) => (
              <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg">
                {editId === type.id ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Input
                        className="w-48"
                        style={editColor ? { 
                          backgroundColor: editColor + '20',
                          borderColor: editColor 
                        } : {}}
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="불량유형 이름"
                      />
                      <ColorPicker
                        value={editColor}
                        onChange={setEditColor}
                        showCustomPicker={true}
                        size="sm"
                        variant="outline"
                      />
                      {editColor && (
                        <Badge
                          style={{ backgroundColor: editColor }}
                          className="text-white border border-border"
                        >
                          {editName || '미리보기'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateMutation.mutate({ id: type.id, name: editName, color: editColor })}
                      >
                        저장
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setEditId(null); setEditName(''); setEditColor(''); }}
                      >
                        취소
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Badge
                        style={type.color ? { backgroundColor: type.color } : {}}
                        className="text-white"
                      >
                        {type.name}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { 
                          setEditId(type.id); 
                          setEditName(type.name); 
                          setEditColor(type.color || ''); 
                        }}
                      >
                        수정
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(type.id)}
                        disabled={deleteMutation.isPending}
                      >
                        삭제
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">등록된 불량 유형이 없습니다.</p>
        )}
      </CardContent>

      {/* Create Dialog */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">새 불량 유형 추가</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-defect-type" className="text-sm font-medium">불량 유형 이름</Label>
                <Input
                  id="new-defect-type"
                  type="text"
                  value={newDefectTypeName}
                  onChange={(e) => setNewDefectTypeName(e.target.value)}
                  placeholder="예: 새로운불량유형"
                  style={newDefectTypeColor ? { 
                    backgroundColor: newDefectTypeColor + '20',
                    borderColor: newDefectTypeColor 
                  } : {}}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">색상 (선택사항)</Label>
                <div className="flex items-center gap-2">
                  <ColorPicker
                    value={newDefectTypeColor}
                    onChange={setNewDefectTypeColor}
                    showCustomPicker={true}
                    size="sm"
                    variant="outline"
                  />
                  {newDefectTypeColor && (
                    <Badge
                      style={{ backgroundColor: newDefectTypeColor }}
                      className="text-white border border-border shadow-sm"
                    >
                      {newDefectTypeName || '미리보기'}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  취소
                </Button>
                <Button
                  onClick={() => createMutation.mutate({ 
                    name: newDefectTypeName, 
                    color: newDefectTypeColor || undefined 
                  })}
                  disabled={createMutation.isPending || !newDefectTypeName.trim()}
                >
                  추가
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}