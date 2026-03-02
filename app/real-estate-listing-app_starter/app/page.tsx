'use client';

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

const DEAL_TYPES = ["매매", "전세", "월세"];
const PROPERTY_TYPES = ["상가","사무실","원룸","투룸","쓰리룸","아파트","빌라","단독","건물","토지"];
const GRADES = ["A","B","C"];

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
    else alert(json.error);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

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
    if (!res.ok) return alert(json.error);

    setOpen(false);
    setEditing(null);
    await load();
  };

  const remove = async (r: Row) => {
    if (!confirm("삭제할까?")) return;

    const res = await fetch(`/api/customer-requests?id=${r.id}`, {
      method: "DELETE",
    });

    const json = await res.json();
    if (!res.ok) return alert(json.error);

    await load();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-4">

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">손님 관리</h1>
          <div className="flex gap-2">
            <button onClick={signOut} className="border px-3 py-2 rounded">로그아웃</button>
            <button onClick={() => setOpen(true)} className="bg-black text-white px-3 py-2 rounded">
              + 손님 추가
            </button>
          </div>
        </div>

        <div className="overflow-auto border rounded">
          <table className="min-w-[1200px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["번호","매물종류","구분","지역","예산","입주","옵션","연락처","다음연락","등급","비고","작업"]
                  .map(h => <th key={h} className="p-2 text-left">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={12} className="p-4">불러오는중...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={12} className="p-4">데이터 없음</td></tr>
              ) : (
                rows.map((r,i)=>(
                  <tr key={r.id} className="border-t">
                    <td className="p-2">{i+1}</td>
                    <td className="p-2">{r.property_type}</td>
                    <td className="p-2">{r.deal_type}</td>
                    <td className="p-2">{r.preferred_area}</td>
                    <td className="p-2">{r.budget}</td>
                    <td className="p-2">{r.move_in_time}</td>
                    <td className="p-2">{r.wanted_options}</td>
                    <td className="p-2 font-medium">{r.phone}</td>
                    <td className="p-2">{r.next_contact_date}</td>
                    <td className="p-2">{r.grade}</td>
                    <td className="p-2">{r.note}</td>
                    <td className="p-2">
                      <button onClick={()=>{setEditing(r);setForm(r);setOpen(true);}} className="text-blue-600 mr-2">수정</button>
                      <button onClick={()=>remove(r)} className="text-red-600">삭제</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-2xl space-y-3">
            <h2 className="font-bold">{editing ? "수정" : "추가"}</h2>

            <input placeholder="연락처" className="border p-2 w-full"
              value={form.phone}
              onChange={e=>setForm({...form,phone:e.target.value})} />

            <select className="border p-2 w-full"
              value={form.property_type}
              onChange={e=>setForm({...form,property_type:e.target.value})}>
              {PROPERTY_TYPES.map(p=><option key={p}>{p}</option>)}
            </select>

            <select className="border p-2 w-full"
              value={form.deal_type}
              onChange={e=>setForm({...form,deal_type:e.target.value})}>
              {DEAL_TYPES.map(d=><option key={d}>{d}</option>)}
            </select>

            <input placeholder="희망지역" className="border p-2 w-full"
              value={form.preferred_area}
              onChange={e=>setForm({...form,preferred_area:e.target.value})} />

            <input placeholder="예산" className="border p-2 w-full"
              value={form.budget}
              onChange={e=>setForm({...form,budget:e.target.value})} />

            <input placeholder="입주희망시기" className="border p-2 w-full"
              value={form.move_in_time}
              onChange={e=>setForm({...form,move_in_time:e.target.value})} />

            <input placeholder="원하는옵션" className="border p-2 w-full"
              value={form.wanted_options}
              onChange={e=>setForm({...form,wanted_options:e.target.value})} />

            <input type="date" className="border p-2 w-full"
              value={form.next_contact_date}
              onChange={e=>setForm({...form,next_contact_date:e.target.value})} />

            <textarea placeholder="비고" className="border p-2 w-full"
              value={form.note}
              onChange={e=>setForm({...form,note:e.target.value})} />

            <div className="flex justify-end gap-2">
              <button onClick={()=>{setOpen(false);setEditing(null);}} className="border px-3 py-2 rounded">취소</button>
              <button onClick={save} className="bg-black text-white px-3 py-2 rounded">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
