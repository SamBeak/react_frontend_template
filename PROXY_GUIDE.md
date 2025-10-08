# 프록시 설정 가이드

## 프록시 동작 원리

### 개발 환경 (npm start)

프록시가 `/api` 접두사를 제거하고 백엔드로 전달합니다.

```
프론트엔드 요청: /api/users
        ↓
setupProxy.js (pathRewrite: { '^/api': '' })
        ↓
백엔드 서버: http://localhost:5000/users
```

### 프로덕션 환경 (빌드 후)

프록시 없이 직접 API 서버로 요청합니다.

```
프론트엔드 요청: /api/users
        ↓
API 서버: https://api.example.com/api/users
```

## 환경별 설정

### .env.development (로컬 개발)

```env
# 백엔드 서버 주소만 설정 (프록시가 /api를 제거함)
REACT_APP_API_BASE_URL=http://localhost:5000
```

**백엔드 라우팅 예시:**
```javascript
// Express 백엔드
app.get('/users', (req, res) => { ... })        // ✅ 올바름
app.get('/api/users', (req, res) => { ... })    // ❌ 틀림 (/api 중복)
```

### .env.staging / .env.production

```env
# /api 경로 포함한 전체 URL 설정 (프록시 없음)
REACT_APP_API_BASE_URL=https://api.example.com/api
```

**백엔드 라우팅 예시:**
```javascript
// Express 백엔드
app.get('/api/users', (req, res) => { ... })    // ✅ 올바름
app.get('/users', (req, res) => { ... })        // ❌ 틀림
```

## API 클라이언트 사용법

### 기본 사용

```tsx
import { api } from '@/lib/api';

// 모든 환경에서 동일한 코드
const users = await api.get<User[]>('/api/users');
```

### 환경별 실제 요청 URL

| 환경 | 코드 | 실제 요청 URL |
|------|------|---------------|
| 개발 | `/api/users` | `http://localhost:5000/users` |
| 스테이징 | `/api/users` | `https://staging-api.example.com/api/users` |
| 프로덕션 | `/api/users` | `https://api.example.com/api/users` |

## 백엔드 서버 설정 예시

### 개발 환경용 Express 서버

```javascript
const express = require('express');
const app = express();

// ⚠️ 중요: /api 접두사 없이 라우트 정의
app.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'John' }]);
});

app.post('/users', (req, res) => {
  res.json({ id: 2, name: 'Jane' });
});

app.listen(5000, () => {
  console.log('Backend server running on http://localhost:5000');
});
```

### 프로덕션 환경용 Express 서버

```javascript
const express = require('express');
const app = express();

// ✅ /api 접두사 포함하여 라우트 정의
app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'John' }]);
});

app.post('/api/users', (req, res) => {
  res.json({ id: 2, name: 'Jane' });
});

app.listen(3000, () => {
  console.log('Production API server running');
});
```

## 프록시 설정 커스터마이징

### pathRewrite 변경

`src/setupProxy.js`에서 경로 변환 규칙을 변경할 수 있습니다.

```javascript
// 예시 1: /api 제거 (현재 설정)
pathRewrite: { '^/api': '' }
// /api/users → /users

// 예시 2: /api를 /v1로 변경
pathRewrite: { '^/api': '/v1' }
// /api/users → /v1/users

// 예시 3: 변경 없음
pathRewrite: {}
// /api/users → /api/users
```

### 여러 백엔드 서버 프록시

```javascript
module.exports = function(app) {
  // API 서버
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:5000',
    pathRewrite: { '^/api': '' },
    changeOrigin: true,
  }));

  // 인증 서버
  app.use('/auth', createProxyMiddleware({
    target: 'http://localhost:3001',
    pathRewrite: { '^/auth': '' },
    changeOrigin: true,
  }));

  // WebSocket 서버
  app.use('/socket.io', createProxyMiddleware({
    target: 'http://localhost:4000',
    ws: true,
    changeOrigin: true,
  }));
};
```

## 문제 해결

### Q: 404 에러가 발생합니다

**원인:** 백엔드 라우트 경로와 프록시 설정이 맞지 않습니다.

**해결:**
1. 개발 환경: 백엔드에서 `/api` 접두사 없이 라우트 정의
2. 프로덕션: 백엔드에서 `/api` 접두사 포함하여 라우트 정의

### Q: CORS 에러가 발생합니다

**원인:** 프록시 설정이 제대로 작동하지 않습니다.

**해결:**
```javascript
// setupProxy.js 확인
changeOrigin: true,  // ✅ 반드시 true로 설정
```

### Q: 개발 서버 재시작 후에도 프록시가 작동하지 않습니다

**해결:**
1. `.env.development` 파일 확인
2. `setupProxy.js` 파일이 `src/` 폴더에 있는지 확인
3. `http-proxy-middleware` 패키지 설치 확인: `npm install http-proxy-middleware`

### Q: 프로덕션 빌드 후 API 호출이 실패합니다

**원인:** `.env.production` 설정이 잘못되었습니다.

**해결:**
```env
# ❌ 틀림
REACT_APP_API_BASE_URL=http://localhost:5000

# ✅ 올바름
REACT_APP_API_BASE_URL=https://api.example.com/api
```

## 로깅 및 디버깅

### 프록시 로그 확인

개발 서버 실행 시 콘솔에서 프록시 로그를 확인할 수 있습니다:

```
[Proxy] 프록시 설정 완료: /api → http://localhost:5000
[Proxy] GET /api/users → http://localhost:5000/users
[Proxy] GET /api/users ← 200
```

### API 클라이언트 로깅

`src/lib/api.ts`에 로깅을 추가할 수 있습니다:

```typescript
private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${this.config.baseURL}${endpoint}`;

  console.log(`[API] ${options.method || 'GET'} ${url}`); // 로깅 추가

  // ... 나머지 코드
}
```
