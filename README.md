# 퀴즈 답변 D-ID Knowledge 업데이트 시스템

## 📁 파일 구성

1. **index.html** - 노인 운동 프로그램 프레젠테이션 + 퀴즈
2. **netlify/functions/update-knowledge.js** - 서버리스 함수 (API 키 안전 관리)
3. **netlify.toml** - Netlify 설정 파일
4. **package.json** - 의존성 관리
5. **update_quiz_answer.py** - Python 수동 업데이트 스크립트

---

## 🚀 배포 방법 (Netlify 추천)

### ✅ 왜 Netlify인가?
- **무료** 호스팅
- **환경변수** 안전 관리 (API 키 노출 없음)
- **서버리스 함수** 지원
- GitHub 연동으로 자동 배포

---

## 📦 Netlify 배포 단계별 가이드

### 1단계: GitHub 저장소 생성 및 파일 업로드

```bash
# 저장소 생성 (GitHub 웹에서)
1. github.com 접속 → New repository
2. 이름: elderly-exercise-quiz
3. Public 선택
4. Create repository

# 파일 업로드
- index.html
- netlify.toml
- package.json
- netlify/functions/update-knowledge.js
```

### 2단계: Netlify 연결

```
1. netlify.com 접속
2. 'Add new site' → 'Import an existing project'
3. GitHub 연결 및 저장소 선택
4. Deploy settings:
   - Build command: (비워두기)
   - Publish directory: .
5. 'Deploy site' 클릭
```

### 3단계: 환경변수 설정 (중요!)

```
1. Netlify 사이트 대시보드
2. Site settings → Environment variables
3. 'Add a variable' 클릭

변수 1:
- Key: DID_API_KEY
- Value: (실제 D-ID API 키 입력)

변수 2:
- Key: AGENT_ID  
- Value: v2_agt_UcvqQ_-y

4. 'Save' 클릭
5. 'Trigger deploy' → 'Deploy site' (재배포)
```

### 4단계: 테스트

```
1. Netlify가 제공하는 URL 접속
   예: https://your-site-name.netlify.app
   
2. "이해 문제" 탭으로 이동
3. 이름 입력 후 퀴즈 풀기
4. 답변이 자동으로 D-ID에 저장됨!
```

---

## 🔧 로컬 테스트 (선택사항)

### Netlify CLI 설치 및 실행

```bash
# 1. Node.js 설치 확인
node --version

# 2. Netlify CLI 설치
npm install -g netlify-cli

# 3. 의존성 설치
npm install

# 4. 환경변수 설정 (.env 파일 생성)
echo "DID_API_KEY=your_api_key_here" > .env
echo "AGENT_ID=v2_agt_UcvqQ_-y" >> .env

# 5. 로컬 서버 실행
netlify dev

# 6. 브라우저에서 localhost:8888 접속
```

---

## 📊 저장되는 정보

```
지식제목: 퀴즈 답변 기록 - [이름]
답변일시: 2025-01-15 14:30:00

답변자 정보:
- 이름: 홍길동

퀴즈 정보:
- 문제: 스텝레더 운동에 이중과제를 적용하는 주된 이유는?
- 선택한 답: 3번 - 일상생활에서 여러 과제를 동시에...
- 정답 여부: 정답 ✓
```

---

## 🔐 보안 장점

### ✅ Netlify Functions 사용 시:
- API 키가 서버에서만 실행 (브라우저 노출 없음)
- GitHub에도 API 키 업로드 불필요
- 환경변수로 안전하게 관리
- HTTPS 자동 적용

### ❌ 일반 GitHub Pages:
- API 키가 JavaScript에 노출됨
- 누구나 개발자 도구에서 볼 수 있음
- 악용 위험

---

## 🎯 작동 원리

```
브라우저 (index.html)
    ↓ POST 요청
Netlify Functions (서버리스)
    ↓ 환경변수에서 API 키 가져옴
D-ID API
    ↓ Knowledge 생성 및 Agent 연결
    ✅ 완료!
```

---

## 🔑 D-ID API 키 받는 방법

1. https://studio.d-id.com 접속
2. 로그인/회원가입
3. Settings → API Keys
4. "Create API Key" 클릭
5. 생성된 키를 Netlify 환경변수에 입력

---

## 🤖 AI Agent 테스트

Knowledge 업데이트 후 AI Agent에게 질문:
- "최근에 누가 퀴즈를 풀었나요?"
- "[이름] 학생의 답변이 정답이었나요?"
- "퀴즈 답변 기록을 보여주세요"

---

## 💡 추가 옵션

### GitHub Pages만 사용하고 싶다면?
→ `update_quiz_answer.py` 스크립트를 로컬에서 수동 실행

### Vercel을 사용하고 싶다면?
→ Netlify와 거의 동일한 방식으로 배포 가능

### 백엔드 서버를 직접 만들고 싶다면?
→ Flask/FastAPI로 간단한 API 서버 구축

---

## 📞 문의

- D-ID 문서: https://docs.d-id.com
- Netlify 문서: https://docs.netlify.com
- Agent ID: v2_agt_UcvqQ_-y

