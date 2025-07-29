import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  timeout: 60000, // 60초 타임아웃 설정 (엑셀 업로드 등 시간이 오래 걸리는 작업 고려)
});

// 토큰 가져오기 함수 (localStorage -> sessionStorage 순서로 시도)
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  } catch (error) {
    console.warn('토큰 조회 실패:', error);
    return null;
  }
};

// 요청 인터셉터: 모든 요청에 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 에러 처리 및 로깅
apiClient.interceptors.response.use(
  (response) => {
    // 개발 환경에서만 상세 로깅
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    // 네트워크 연결 오류 처리
    if (error.code === 'ECONNREFUSED' || 
        error.code === 'ENOTFOUND' || 
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('Network Error') ||
        !error.response) {
      
      console.warn('🔌 네트워크 연결 오류 - 서버가 응답하지 않습니다:', {
        url: error.config?.url,
        method: error.config?.method,
        message: error.message
      });
      
      // 네트워크 오류에 대한 사용자 친화적 에러 메시지
      const networkError = new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      networkError.name = 'NetworkError';
      (networkError as any).code = 'NETWORK_ERROR';
      (networkError as any).originalError = error;
      
      return Promise.reject(networkError);
    }

    // 개발 환경에서만 상세 로깅
    if (import.meta.env.DEV) {
      console.log(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
    }

    // 401 Unauthorized 처리
    if (error.response?.status === 401) {
      console.log('🔒 401 Unauthorized - 토큰 만료 또는 유효하지 않음');
      
      // 무한 리다이렉트 방지
      if ((window as any).isRedirecting) {
        console.log('⚠️ 이미 리다이렉트 중이므로 중복 처리 방지');
        return Promise.reject(error);
      }
      
      (window as any).isRedirecting = true;
      
      // 토큰 및 사용자 정보 제거
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
        console.log('🧹 토큰 및 사용자 정보 제거 완료');
      } catch (cleanupError) {
        console.warn('토큰 정리 중 오류:', cleanupError);
      }
      
      // 로그인 페이지로 리다이렉트 (지연을 통한 안정성 확보)
      setTimeout(() => {
        (window as any).isRedirecting = false;
        window.location.href = '/login';
      }, 100);
    }
    
    return Promise.reject(error);
  }
);
