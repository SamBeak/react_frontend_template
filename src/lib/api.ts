/**
 * API 클라이언트 설정
 *
 * 프록시를 통한 API 호출 예시:
 * - 개발 환경: /api/users → http://localhost:5000/users (프록시에서 /api 제거)
 * - 프로덕션: /api/users → https://api.production.com/api/users (직접 호출)
 */

interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

// 환경별 API 설정
const getApiConfig = (): ApiConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    // 개발 환경: 상대 경로 사용 (프록시가 처리)
    // 프로덕션: 전체 URL 사용
    baseURL: isDevelopment ? '' : process.env.REACT_APP_API_BASE_URL || '',
    timeout: Number(process.env.REACT_APP_API_TIMEOUT) || 10000,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Version': process.env.REACT_APP_API_VERSION || 'v1',
    },
  };
};

// Fetch API wrapper
class ApiClient {
  private config: ApiConfig;

  constructor() {
    this.config = getApiConfig();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.config.headers,
        ...options.headers,
      },
    };

    // 인증 토큰 추가
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          response.status,
          response.statusText,
          await response.json().catch(() => null)
        );
      }

      // 204 No Content 처리
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError(408, 'Request Timeout', null);
        }
        throw new ApiError(0, error.message, null);
      }

      throw new ApiError(0, 'Unknown Error', null);
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// API 에러 클래스
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: any
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

// API 클라이언트 싱글톤
export const api = new ApiClient();

// 사용 예시:
// const users = await api.get<User[]>('/api/users');
// const user = await api.post<User>('/api/users', { name: 'John' });
