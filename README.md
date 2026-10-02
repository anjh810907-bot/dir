# 🌿 따뜻한 하루 일기 & AI 응원 (Warm Daily Diary & AI Cheering)

오늘 하루 있었던 일과 감정(기쁨, 지침, 설렘, 불안)을 기록하면 **Google Gemini AI**가 마음을 보듬는 다정한 위로 편지와 내일을 위한 작은 행동 1가지를 답장해 주는 힐링 다이어리 웹앱입니다.

---

## 🚀 GitHub 푸시 & Vercel 배포 가이드

이 프로젝트는 **Vercel 원클릭 배포에 최적화**되어 있습니다. 아래 4단계를 따라 하시면 3분 만에 무료로 배포할 수 있습니다!

### Step 1. 깃허브(GitHub)에 코드 올리기

1. GitHub에서 새로운 저장소(New Repository)를 생성합니다.
2. 로컬 터미널에서 다음 명령어를 실행하여 코드를 올립니다:

```bash
git init
git add .
git commit -m "feat: 따뜻한 하루 일기 웹앱 첫 커밋"
git branch -M main
git remote add origin https://github.com/사용자아이디/레포지토리이름.git
git push -u origin main
```

*(주의: `.gitignore` 파일에 `.env`가 등록되어 있으므로 개인 API 키는 GitHub에 유출되지 않고 안전하게 보호됩니다.)*

---

### Step 2. 버셀(Vercel)에서 프로젝트 불러오기

1. [Vercel](https://vercel.com)에 로그인합니다.
2. 대시보드 우측 상단의 **[Add New...]** > **[Project]** 버튼을 클릭합니다.
3. 방금 푸시한 GitHub 저장소를 찾아 **[Import]**를 클릭합니다.

---

### Step 3. ⭐️ 가장 중요한 환경 변수(Environment Variables) 설정

Vercel 배포 설정 화면의 **[Environment Variables]** 항목을 펼친 후 다음 값을 추가합니다:

| NAME | VALUE | 설명 |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `AIzaSy...` (내 Gemini API 키) | Google AI Studio에서 발급받은 API 키 |

> **💡 참고:**
> Vercel에서는 서버리스 함수(`/api/cheer.ts`)가 이 환경 변수를 안전하게 읽어 처리하므로, 웹 브라우저나 외부 방문자에게 API 키가 절대로 노출되지 않습니다.

---

### Step 4. 배포 완료!

- **[Deploy]** 버튼을 누르면 약 1분 후 나만의 웹사이트 주소(예: `https://your-diary-app.vercel.app`)가 생성됩니다.

---

## 🗄️ Firebase Firestore 데이터베이스 안내

웹앱에는 작성한 일기가 안전하게 저장되도록 **Firebase Firestore**가 연동되어 있습니다.

- **연동 프로젝트:** `visit-f9c27`
- **컬렉션 명:** `warm_diaries`
- **오프라인 / 로컬 백업:** 네트워크 연결이나 Firebase 상태와 관계없이 브라우저 LocalStorage에 항상 2중으로 자동 백업되므로 소중한 일기가 사라지지 않습니다.

> 만약 Firebase 콘솔에서 Firestore 보안 규칙을 변경하고자 하신다면, 테스트 기간 동안 아래와 같이 읽기/쓰기를 허용할 수 있습니다:
> ```javascript
> rules_version = '2';
> service cloud.firestore {
>   match /databases/{database}/documents {
>     match /warm_diaries/{document=**} {
>       allow read, write: if true;
>     }
>   }
> }
> ```

---

## 💻 로컬(내 컴퓨터)에서 테스트 실행하기

1. **패키지 설치:**
   ```bash
   npm install
   ```

2. **환경 변수 파일 생성:**
   `.env.example` 파일을 복사하여 `.env` 파일을 만들고 키를 입력합니다:
   ```bash
   cp .env.example .env
   ```
   `.env` 내용:
   ```env
   GEMINI_API_KEY="내_구글_제미나이_API키"
   ```

3. **개발 서버 실행:**
   ```bash
   npm run dev
   ```
   브라우저에서 `http://localhost:3000` 접속

---

## 🛠️ 주요 기술 스택
- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend (Serverless):** Vercel Serverless Functions (`/api/cheer.ts`), Express (Local Fullstack)
- **AI Model:** Google Gemini API (`@google/genai`, 다중 폴백 지원: `gemini-2.5-flash`, `gemini-flash-latest`, `gemini-3.1-flash-lite`, `gemini-3.8-flash`)
- **Database:** Firebase Firestore (`visit-f9c27`) + LocalStorage Fallback Cache
