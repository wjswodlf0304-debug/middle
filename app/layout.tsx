import "./globals.css";
import React from "react";

export const metadata = {
  title: "매물 관리",
  description: "Vercel + Supabase 관리자 페이지",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
