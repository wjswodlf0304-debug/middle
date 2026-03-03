'use client';

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const signIn = async () => {
    setLoading(true);
    setMsg("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMsg(error.message);
        return;
      }

      // ✅ 이게 “새로고침 해야 로그인 되는” 문제를 끝내는 핵심
      window.location.assign("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm border rounded-2xl p-5 space-y-3 bg-white">
        <h1 className="text-xl font-bold">로그인</h1>
        <p className="text-sm text-gray-500">이메일/비밀번호로 로그인</p>

        <input
          className="border rounded px-3 py-2 text-sm w-full"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className="border rounded px-3 py-2 text-sm w-full"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
        />

        {msg ? <div className="text-sm text-red-600">{msg}</div> : null}

        <button
          onClick={signIn}
          disabled={loading}
          className="w-full rounded bg-black text-white py-2 text-sm disabled:opacity-60"
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </div>
    </div>
  );
}
