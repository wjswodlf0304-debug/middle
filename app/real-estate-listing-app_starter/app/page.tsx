'use client';

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

const DEAL_TYPES = ["매매", "전세", "월세"];
const PROPERTY_TYPES = ["전체","상가","사무실","원룸","투룸","쓰리룸","아파트","빌라","단독","건물","토지"];
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
  const [filterType, setFilterType] = useState("전체");

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

  const filteredRows = useMemo(() => {
    if (filterType === "전체") return rows;
    return rows.filter(r => r.property_type === filterType);
  }, [rows, filterType]);

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

    await fetch(`/api/customer-requests?id=${r.id}`, { method: "DELETE" });
    await load();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
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
            <button onClick={() => { setEditing(null); setOpen(true); }}
              className="bg-black text-white px-3 py-1.5 rounded">
              + 손님 추가
            </button>
          </div>
        </div>

        {/* ✅ 매물 분류 필터 */}
        <div className="flex flex-wrap gap-2 border-b pb-3">
          {PROPERTY_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded text-sm border 
                ${filterType === type 
                  ? "bg-black text-white" 
                  : "bg-white hover:bg-gray-100"}`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* ✅ 표 */}
        <div className="overflow-auto border rounded">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                {["번호","매물종류","구분","지역","예산","입주","옵션","연락처","다음연락","등급","비고","작업"]
                  .map(h => (
                    <th key={h}
                      className="border border-gray-300 py-2 px-3 text-left font-semibold">
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
                    <td className="border border-gray-300 py-2 px-3">{r.property_type}</td>
                    <td className="border border-gray-300 py-2 px-3">{r.deal_type}</td>
                    <td className="border border-gray-300 py-2 px-3">{r.preferred_area}</td>
                    <td className="border border-gray-300 py-2 px-3">{r.budget}</td>
                    <td className="border border-gray-300 py-2 px-3">{r.move_in_time}</td>
                    <td className="border border-gray-300 py-2 px-3">{r.wanted_options}</td>
                    <td className="border border-gray-300 py-2 px-3 font-medium">{r.phone}</td>
                    <td className="border border-gray-300 py-2 px-3">{r.next_contact_date}</td>
                    <td className="border border-gray-300 py-2 px-3">{r.grade}</td>
                    <td className="border border-gray-300 py-2 px-3">{r.note}</td>
                    <td className="border border-gray-300 py-2 px-3 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditing(r);
                          setForm(r);
                          setOpen(true);
                        }}
                        className="text-blue-600 mr-2"
                      >
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
    </div>
  );
}
