'use client';

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

const PROPERTY_TYPES = ["전체","상가","사무실","원룸","투룸","쓰리룸","아파트","빌라","단독","건물","토지"] as const;
const DEAL_TYPES = ["매매", "전세", "월세"] as const;
const GRADES = ["A","B","C"] as const;

type Row = {
  id: string;
  phone: string;
  grade: string | null;
  deal_type: string | null;
  property_type: string | null;
  preferred_area: string | null;
  budget: string | null;
  move_in_time: string | null;
  wanted_options: string | null;
  next_contact_date: string | null;
  note: string | null;
};

export default function Page() {
  const supabase = createClient();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState<(typeof PROPERTY_TYPES)[number]>("전체");
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  const [form, setForm] = useState<any>({
    phone: "",
    grade: "B",
    deal_type: "전세",
    property_type: "원룸",
    preferred_area: "",
    budget: "",
    move_in_time: "",
    wanted_options: "",
    next_contact_date: "",
    note: "",
  });

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/customer-requests", { cache: "no-store" });
    const json = await res.json();
    if (res.ok) setRows(json.data || []);
    else alert(json.error || "불러오기 실패");
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filteredRows = useMemo(() => {
    const s = q.trim().toLowerCase();

    return rows.filter((r) => {
      // 1) 매물종류 필터
      if (filterType !== "전체" && r.property_type !== filterType) return false;

      // 2) 검색 필터
      if (!s) return true;

      const hay = [
        r.phone,
        r.preferred_area,
        r.budget,
        r.wanted_options,
        r.note,
        r.deal_type,
        r.property_type,
        r.move_in_time,
        r.grade,
        r.next_contact_date,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(s);
    });
  }, [rows, filterType, q]);

  const save = async () => {
    if (!form.phone.trim()) {
      alert("연락처는 필수");
      return;
    }

    const body = editing ? { id: editing.id, ...form } : form;

    const res = await fetch("/api/customer-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok) return alert(json.error || "저장 실패");

    setOpen(false);
    setEditing(null);
    await load();
  };

  const remove = async (r: Row) => {
    if (!confirm(`삭제할까?\n\n연락처: ${r.phone}\n매물종류: ${r.property_type ?? "-"}`)) return;

    const res = await fetch(`/api/customer-requests?id=${encodeURIComponent(r.id)}`, {
      method: "DELETE",
    });

    const json = await res.json();
    if (!res.ok) return alert(json.error || "삭제 실패");

    await load();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      phone: "",
      grade: "B",
      deal_type: "전세",
      property_type: "원룸",
      preferred_area: "",
      budget: "",
      move_in_time: "",
      wanted_options: "",
      next_contact_date: "",
      note: "",
    });
    setOpen(true);
  };

  const openEdit = (r: Row) => {
    setEditing(r);
    setForm({
      phone: r.phone || "",
      grade: r.grade || "B",
      deal_type: r.deal_type || "전세",
      property_type: r.property_type || "원룸",
      preferred_area: r.preferred_area || "",
      budget: r.budget || "",
      move_in_time: r.move_in_time || "",
      wanted_options: r.wanted_options || "",
      next_contact_date: r.next_contact_date || "",
      note: r.note || "",
    });
    setOpen(true);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="w-full max-w-[1600px] mx-auto space-y-4">

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">손님 관리</h1>
          <div className="flex gap-2">
            <button onClick={signOut} className="border px-3 py-1.5 rounded">
              로그아웃
            </button>
            <button onClick={openAdd} className="bg-black text-white px-3 py-1.5 rounded">
              + 손님 추가
            </button>
          </div>
        </div>

        {/* ✅ 필터 + 검색 */}
        <div className="border rounded p-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded text-sm border ${
                  filterType === type ? "bg-black text-white" : "bg-white hover:bg-gray-100"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <input
              className="border rounded px-3 py-2 text-sm w-full"
              placeholder="검색: 연락처/지역/예산/옵션/비고 등"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button
              className="border rounded px-3 py-2 text-sm hover:bg-gray-50"
              onClick={() => setQ("")}
            >
              검색초기화
            </button>
          </div>

          <div className="text-sm text-gray-600">
            표시: <span className="font-semibold text-black">{filteredRows.length}</span>명
          </div>
        </div>

        {/* ✅ 표 */}
        <div className="overflow-auto border rounded">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                {["번호","매물종류","구분","지역","예산","입주","옵션","연락처","다음연락","등급","비고","작업"]
                  .map(h => (
                    <th
                      key={h}
                      className="border border-gray-300 py-2 px-3 text-left font-semibold"
                    >
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className="border border-gray-300 py-3 px-3">
                    불러오는중...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="border border-gray-300 py-3 px-3">
                    데이터 없음
                  </td>
                </tr>
              ) : (
                filteredRows.map((r, i) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 py-2 px-3">{i+1}</td>
                    <td className="border border-gray-300 py-2 px-3">{r.property_type ?? "-"}</td>
                    <td className="border border-gray-300 py-2 px-3">{r.deal_type ?? "-"}</td>
                    <td className="border border-gray-300 py-2 px-3">{r.preferred_area ?? "-"}</td>
                    <td className="border border-gray-300 py-2 px-3">{r.budget ?? "-"}</td>
                    <td className="border border-gray-300 py-2 px-3">{r.move_in_time ?? "-"}</td>
                    <td className="border border-gray-300 py-2 px-3">{r.wanted_options ?? "-"}</td>
                    <td className="border border-gray-300 py-2 px-3 font-medium">{r.phone ?? "-"}</td>
                    <td className="border border-gray-300 py-2 px-3">{r.next_contact_date ?? "-"}</td>
                    <td className="border border-gray-300 py-2 px-3">{r.grade ?? "-"}</td>
                    <td className="border border-gray-300 py-2 px-3">{r.note ?? "-"}</td>
                    <td className="border border-gray-300 py-2 px-3 whitespace-nowrap">
                      <button onClick={() => openEdit(r)} className="text-blue-600 mr-2">
                        수정
                      </button>
                      <button onClick={() => remove(r)} className="text-red-600">
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* 모달 */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded w-full max-w-2xl space-y-3">
            <h2 className="font-bold">{editing ? "손님 수정" : "손님 추가"}</h2>

            <input
              placeholder="연락처"
              className="border p-2 w-full"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <select
              className="border p-2 w-full"
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
            >
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>

            <select
              className="border p-2 w-full"
              value={form.property_type}
              onChange={(e) => setForm({ ...form, property_type: e.target.value })}
            >
              {PROPERTY_TYPES.filter(x => x !== "전체").map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <select
              className="border p-2 w-full"
              value={form.deal_type}
              onChange={(e) => setForm({ ...form, deal_type: e.target.value })}
            >
              {DEAL_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <input
              placeholder="희망지역"
              className="border p-2 w-full"
              value={form.preferred_area}
              onChange={(e) => setForm({ ...form, preferred_area: e.target.value })}
            />

            <input
              placeholder="예산"
              className="border p-2 w-full"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
            />

            <input
              placeholder="입주희망시기"
              className="border p-2 w-full"
              value={form.move_in_time}
              onChange={(e) => setForm({ ...form, move_in_time: e.target.value })}
            />

            <input
              placeholder="원하는옵션"
              className="border p-2 w-full"
              value={form.wanted_options}
              onChange={(e) => setForm({ ...form, wanted_options: e.target.value })}
            />

            <input
              type="date"
              className="border p-2 w-full"
              value={form.next_contact_date}
              onChange={(e) => setForm({ ...form, next_contact_date: e.target.value })}
            />

            <textarea
              placeholder="비고"
              className="border p-2 w-full"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setOpen(false); setEditing(null); }}
                className="border px-3 py-2 rounded"
              >
                취소
              </button>
              <button onClick={save} className="bg-black text-white px-3 py-2 rounded">
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
