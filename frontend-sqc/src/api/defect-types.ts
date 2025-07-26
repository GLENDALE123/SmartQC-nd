export interface DefectType {
  id: number;
  name: string;
  color?: string;
}

// 임시 데이터 (실제로는 API 호출)
const mockDefectTypes: DefectType[] = [
  { id: 1, name: '색상 불량', color: '#ef4444' },
  { id: 2, name: '표면 불량', color: '#f97316' },
  { id: 3, name: '크기 불량', color: '#eab308' },
  { id: 4, name: '박리 불량', color: '#a855f7' },
];

// API 함수들
export const defectTypesApi = {
  // 전체 목록 조회
  getAll: async (): Promise<DefectType[]> => {
    // 실제로는 API 호출
    await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션
    return [...mockDefectTypes];
  },

  // 새 불량 유형 생성
  create: async (data: { name: string; color?: string }): Promise<DefectType> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newType: DefectType = {
      id: Date.now(),
      name: data.name,
      color: data.color,
    };
    mockDefectTypes.push(newType);
    return newType;
  },

  // 불량 유형 수정
  update: async (id: number, data: { name: string; color?: string }): Promise<DefectType> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockDefectTypes.findIndex(type => type.id === id);
    if (index === -1) {
      throw new Error('불량 유형을 찾을 수 없습니다.');
    }
    
    mockDefectTypes[index] = {
      ...mockDefectTypes[index],
      name: data.name,
      color: data.color,
    };
    
    return mockDefectTypes[index];
  },

  // 불량 유형 삭제
  delete: async (id: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockDefectTypes.findIndex(type => type.id === id);
    if (index === -1) {
      throw new Error('불량 유형을 찾을 수 없습니다.');
    }
    mockDefectTypes.splice(index, 1);
  },
}; 