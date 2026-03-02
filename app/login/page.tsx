'use client';

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

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

  // ✅ 세션이 실제로 잡혔는지 한번 확인(안정화)
  await supabase.auth.getSession();

  setLoading(false);

  // ✅ 여기: SPA 이동 말고 "강제 이동(새로고침)"으로 미들웨어 확실히 타게 함
  const next = new URLSearchParams(window.location.search).get("next") || "/";
  window.location.assign(next);
};

  // ... 나머지는 그대로
}
