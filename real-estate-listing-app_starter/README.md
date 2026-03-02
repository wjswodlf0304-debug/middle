# Real Estate Listing Admin (Next.js + Supabase + Vercel)

## Supabase 설정
1) Supabase Dashboard → SQL Editor → `supabase_sql/01_listings.sql` 실행  
2) Auth → Users → 관리자 이메일/비번 계정 생성

## 환경변수
Vercel(또는 로컬)에서 아래 2개 설정:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY (또는 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

## 실행
```bash
npm install
npm run dev
```
로그인: `/login`
