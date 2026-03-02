'use client';

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      setErr(error.message);
      return;
    }

    // 세션 반영 안정화
    await supabase.auth.getSession();

    setLoading(false);

    // ✅ useSearchParams 안 쓰고 window에서 쿼리 읽기(빌드 안전)
    const next = new URLSearchParams(window.location.search).get("next") || "/";
    // ✅ 강제 이동(새로고침) -> 미들웨어 확실히 타서 바로 들어감
    window.location.assign(next);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">관리자 로그인</h1>
        <p className="text-slate-500 mt-1 text-sm">Supabase 계정으로 로그인합니다.</p>

        <form onSubmit={signIn} className="mt-6 space-y-3">
          <div className="space-y-1">
            <label className="text-sm text-slate-600">이메일</label>
            <input
              className="w-full rounded-xl border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-600">비밀번호</label>
            <input
              type="password"
              className="w-full rounded-xl border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {err && <div className="text-sm text-red-600">{err}</div>}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 text-white py-2 font-semibold disabled:opacity-60"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-4 text-xs text-slate-500">
          * 관리자 계정은 Supabase Dashboard → Auth → Users에서 만들어두면 됩니다.
        </div>
      </div>
    </div>
  );
}
