'use client';

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

const CATEGORIES = [
  "원룸","투룸","쓰리룸","아파트","상가","사무실","건물 매매","단독 매매","빌라 매매","토지 매매"
];

type Listing = {
  id: string;
  category: string;
  address: string;
  area_m2: number | null;
  floor: string | null;
  price: string | null;
  fee: string | null;
  options: string | null;
  use_type: string | null;
  phone: string | null;
  note: string | null;
  contract_date: string | null;
  expiry_date: string | null;
  status: string | null;
};

function cls(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}

function Pill({ active, children, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cls(
        "px-3 py-1.5 rounded-xl border text-sm",
        active ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}

function Modal({ open, title, onClose, children }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-2xl bg-white border shadow-lg p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{title}</h2>
          <button className="rounded-xl border px-3 py-1.5 text-sm" onClick={onClose}>닫기</button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-slate-600">{label}</div>
      <input {...props} className={cls("w-full rounded-xl border px-3 py-2 text-sm", props.className)} />
    </div>
  );
}

function Textarea({ label, ...props }: any) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-slate-600">{label}</div>
      <textarea {...props} className={cls("w-full rounded-xl border px-3 py-2 text-sm min-h-[90px]", props.className)} />
    </div>
  );
}

export default function Page() {
  const supabase = createClient();

  const [category, setCategory] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [rows, setRows] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Listing | null>(null);

  const [form, setForm] = useState<any>({
    category: "원룸",
    address: "",
    area_m2: "",
    floor: "",
    price: "",
    fee: "",
    options: "",
    use_type: "",
    phone: "",
    note: "",
    contract_date: "",
    expiry_date: "",
    status: "",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setRows(data as any);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (category && r.category !== category) return false;
      if (!s) return true;
      const hay = [
        r.address, r.note, r.phone, r.options, r.use_type, r.price, r.fee, r.status
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(s);
    });
  }, [rows, q, category]);

  const reset = () => {
    setCategory("");
    setQ("");
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      category: "원룸",
      address: "",
      area_m2: "",
      floor: "",
      price: "",
      fee: "",
      options: "",
      use_type: "",
      phone: "",
      note: "",
      contract_date: "",
      expiry_date: "",
      status: "",
    });
    setOpen(true);
  };

  const openEdit = (r: Listing) => {
    setEditing(r);
    setForm({
      category: r.category || "원룸",
      address: r.address || "",
      area_m2: r.area_m2 ?? "",
      floor: r.floor ?? "",
      price: r.price ?? "",
      fee: r.fee ?? "",
      options: r.options ?? "",
      use_type: r.use_type ?? "",
      phone: r.phone ?? "",
      note: r.note ?? "",
      contract_date: r.contract_date ?? "",
      expiry_date: r.expiry_date ?? "",
      status: r.status ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.address?.trim()) {
      alert("주소는 필수입니다.");
      return;
    }

    const payload: any = {
      category: form.category,
      address: form.address,
      area_m2: form.area_m2 === "" ? null : Number(form.area_m2),
      floor: form.floor || null,
      price: form.price || null,
      fee: form.fee || null,
      options: form.options || null,
      use_type: form.use_type || null,
      phone: form.phone || null,
      note: form.note || null,
      contract_date: form.contract_date || null,
      expiry_date: form.expiry_date || null,
      status: form.status || null,
    };

    const { error } = editing
      ? await supabase.from("listings").update(payload).eq("id", editing.id)
      : await supabase.from("listings").insert(payload);

    if (error) {
      alert(error.message);
      return;
    }
    setOpen(false);
    await load();
  };

  const remove = async (r: Listing) => {
    const ok = confirm(`삭제할까?\n\n${r.address}`);
    if (!ok) return;
    const { error } = await supabase.from("listings").delete().eq("id", r.id);
    if (error) alert(error.message);
    await load();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">매물 관리</h1>
            <p className="text-sm text-slate-500">카테고리/검색으로 빠르게 필터하고 표에서 관리</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50" onClick={signOut}>
              로그아웃
            </button>
            <button className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm" onClick={openAdd}>
              + 매물 추가
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Pill key={c} active={category === c} onClick={() => setCategory(category === c ? "" : c)}>
              {c}
            </Pill>
          ))}
        </div>

        <div className="rounded-2xl border p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="text-sm text-slate-600">
              총 <span className="font-semibold text-slate-900">{filtered.length}</span>건
              {category ? <span className="ml-2 inline-flex rounded-xl border px-2 py-0.5 text-xs">{category}</span> : null}
            </div>
            <div className="flex gap-2 flex-wrap">
              <input
                className="w-full md:w-[520px] rounded-xl border px-3 py-2 text-sm"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="주소 / 비고 / 연락처 검색 (전체에서 검색)"
              />
              <button className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50" onClick={reset}>
                초기화
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-auto rounded-2xl border">
            <table className="min-w-[1400px] w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left">
                  {["번호","주소","전용면적(㎡)","층수","가격(만원)","관리비","옵션","건축물 용도","연락처","비고","계약일","만료일","상태","작업"].map((h)=>(
                    <th key={h} className="p-3 font-semibold text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={14} className="p-6 text-slate-500">불러오는 중...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={14} className="p-6 text-slate-500">데이터가 없습니다.</td></tr>
                ) : (
                  filtered.map((r, idx) => (
                    <tr key={r.id} className="border-t hover:bg-slate-50/50">
                      <td className="p-3 text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-medium">
                        {r.address} <span className="ml-2 inline-flex rounded-xl border px-2 py-0.5 text-xs">{r.category}</span>
                      </td>
                      <td className="p-3">{r.area_m2 ?? "-"}</td>
                      <td className="p-3">{r.floor ?? "-"}</td>
                      <td className="p-3">{r.price ?? "-"}</td>
                      <td className="p-3">{r.fee ?? "-"}</td>
                      <td className="p-3">{r.options ?? "-"}</td>
                      <td className="p-3">{r.use_type ?? "-"}</td>
                      <td className="p-3">{r.phone ?? "-"}</td>
                      <td className="p-3">{r.note ?? "-"}</td>
                      <td className="p-3">{r.contract_date ?? "-"}</td>
                      <td className="p-3">{r.expiry_date ?? "-"}</td>
                      <td className="p-3">{r.status ?? "-"}</td>
                      <td className="p-3 whitespace-nowrap">
                        <button className="rounded-xl border px-2 py-1 text-xs hover:bg-white" onClick={() => openEdit(r)}>수정</button>
                        <button className="ml-2 rounded-xl border px-2 py-1 text-xs hover:bg-white text-red-600" onClick={() => remove(r)}>삭제</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={open} title={editing ? "매물 수정" : "매물 추가"} onClose={() => setOpen(false)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-slate-600">카테고리</div>
            <select
              className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
              value={form.category}
              onChange={(e) => setForm((p:any)=>({ ...p, category: e.target.value }))}
            >
              {CATEGORIES.map((c)=> <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input label="주소 *" value={form.address} onChange={(e:any)=>setForm((p:any)=>({ ...p, address: e.target.value }))} />
          <Input label="전용면적(㎡)" value={form.area_m2} onChange={(e:any)=>setForm((p:any)=>({ ...p, area_m2: e.target.value }))} />
          <Input label="층수" value={form.floor} onChange={(e:any)=>setForm((p:any)=>({ ...p, floor: e.target.value }))} />
          <Input label="가격(만원)" value={form.price} onChange={(e:any)=>setForm((p:any)=>({ ...p, price: e.target.value }))} placeholder="예: 5000/65" />
          <Input label="관리비" value={form.fee} onChange={(e:any)=>setForm((p:any)=>({ ...p, fee: e.target.value }))} />
          <Input label="옵션" value={form.options} onChange={(e:any)=>setForm((p:any)=>({ ...p, options: e.target.value }))} />
          <Input label="건축물 용도" value={form.use_type} onChange={(e:any)=>setForm((p:any)=>({ ...p, use_type: e.target.value }))} />
          <Input label="연락처" value={form.phone} onChange={(e:any)=>setForm((p:any)=>({ ...p, phone: e.target.value }))} />
          <Input label="계약일" type="date" value={form.contract_date} onChange={(e:any)=>setForm((p:any)=>({ ...p, contract_date: e.target.value }))} />
          <Input label="만료일" type="date" value={form.expiry_date} onChange={(e:any)=>setForm((p:any)=>({ ...p, expiry_date: e.target.value }))} />
          <Input label="상태" value={form.status} onChange={(e:any)=>setForm((p:any)=>({ ...p, status: e.target.value }))} placeholder="예: 진행중/완료/보류" />
        </div>
        <div className="mt-4">
          <Textarea label="비고" value={form.note} onChange={(e:any)=>setForm((p:any)=>({ ...p, note: e.target.value }))} />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>취소</button>
          <button className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm" onClick={save}>저장</button>
        </div>
      </Modal>
    </div>
  );
}
