'use client';

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

const GRADES = ["A", "B", "C"] as const;
const DEAL_TYPES = ["매매", "전세", "월세"] as const;
const PROPERTY_TYPES = [
  "상가",
  "사무실",
  "원룸",
  "투룸",
  "쓰리룸",
  "아파트",
  "빌라",
  "단독",
  "건물",
  "토지",
] as const;

type Row = {
  id: string;
  phone: string;
  first_inquiry_date: string | null;
  grade: string | null;
  next_contact_date: string | null;
  deal_type: string | null;
  preferred_area: string | null;
  budget: string | null;
  property_type: string | null;
  move_in_time: string | null;
  wanted_options: string | null;
  note: string | null;
};

function cls(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
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

function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-2xl bg-white border shadow-lg p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{title}</h2>
          <button className="rounded-xl border px-3 py-1.5 text-sm" onClick={onClose}>
            닫기
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function Input({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-slate-600">{label}</div>
      <input {...props} className={cls("w-full rounded-xl border px-3 py-2 text-sm", className)} />
    </div>
  );
}

function Textarea({
  label,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-slate-600">{label}</div>
      <textarea {...props} className={cls("w-full rounded-xl border px-3 py-2 text-sm min-h-[90px]", className)} />
    </div>
  );
}

// ---- API helpers ----
async function apiGet(): Promise<Row[]> {
  const res = await fetch("/api/customer-requests", { cache: "no-store" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || "불러오기 실패");
  return (json.data || []) as Row[];
}

async function apiUpsert(body: any) {
  const res = await fetch("/api/customer-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || "저장 실패");
}

async function apiDelete(id: string) {
  const res = await fetch(`/api/customer-requests?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || "삭제 실패");
}

export default function Page() {
  const supabase = createClient();

  // filters
  const [grade, setGrade] = useState<string>("");
  const [dealType, setDealType] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [q, setQ] = useState<string>("");

  // data
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // modal/form
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  const [form, setForm] = useState({
    phone: "",
    first_inquiry_date: "",
    grade: "B",
    next_contact_date: "",
    deal_type: "전세",
    preferred_area: "",
    budget: "",
    property_type: "원룸",
    move_in_time: "",
    wanted_options: "",
    note: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet();
      setRows(data);
    } catch (e: any) {
      alert(e?.message || "불러오기 실패");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    return rows.filter((r) => {
      if (grade && (r.grade || "") !== grade) return false;
      if (dealType && (r.deal_type || "") !== dealType) return false;
      if (propertyType && (r.property_type || "") !== propertyType) return false;

      if (!s) return true;

      const hay = [
        r.phone,
        r.preferred_area,
        r.budget,
        r.property_type,
        r.deal_type,
        r.move_in_time,
        r.wanted_options,
        r.note,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(s);
    });
  }, [rows, q, grade, dealType, propertyType]);

  const reset = () => {
    setGrade("");
    setDealType("");
    setPropertyType("");
    setQ("");
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      phone: "",
      first_inquiry_date: "",
      grade: "B",
      next_contact_date: "",
      deal_type: "전세",
      preferred_area: "",
      budget: "",
      property_type: "원룸",
      move_in_time: "",
      wanted_options: "",
      note: "",
    });
    setOpen(true);
  };

  const openEdit = (r: Row) => {
    setEditing(r);
    setForm({
      phone: r.phone || "",
      first_inquiry_date: r.first_inquiry_date ?? "",
      grade: r.grade ?? "B",
      next_contact_date: r.next_contact_date ?? "",
      deal_type: r.deal_type ?? "전세",
      preferred_area: r.preferred_area ?? "",
      budget: r.budget ?? "",
      property_type: r.property_type ?? "원룸",
      move_in_time: r.move_in_time ?? "",
      wanted_options: r.wanted_options ?? "",
      note: r.note ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.phone.trim()) {
      alert("연락처는 필수입니다.");
      return;
    }

    const payload: any = {
      phone: form.phone.trim(),
      first_inquiry_date: form.first_inquiry_date || null,
      grade: form.grade || null,
      next_contact_date: form.next_contact_date || null,
      deal_type: form.deal_type || null,
      preferred_area: form.preferred_area || null,
      budget: form.budget || null,
      property_type: form.property_type || null,
      move_in_time: form.move_in_time || null,
      wanted_options: form.wanted_options || null,
      note: form.note || null,
    };

    const body = editing ? { id: editing.id, ...payload } : payload;

    try {
      await apiUpsert(body);
      setOpen(false);
      await load();
    } catch (e: any) {
      alert(e?.message || "저장 실패");
    }
  };

  const remove = async (r: Row) => {
    const ok = confirm(`삭제할까?\n\n연락처: ${r.phone}\n매물종류: ${r.property_type ?? "-"}`);
    if (!ok) return;

    try {
      await apiDelete(r.id);
      await load();
    } catch (e: any) {
      alert(e?.message || "삭제 실패");
    }
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
            <h1 className="text-2xl font-bold">손님 관리 (찾는조건)</h1>
            <p className="text-sm text-slate-500">필터/검색 + 추가/수정/삭제</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50" onClick={signOut}>
              로그아웃
            </button>
            <button className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm" onClick={openAdd}>
              + 손님 추가
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-slate-600 mr-1">구분</span>
          {DEAL_TYPES.map((d) => (
            <Pill key={d} active={dealType === d} onClick={() => setDealType(dealType === d ? "" : d)}>
              {d}
            </Pill>
          ))}

          <span className="text-sm text-slate-600 ml-3 mr-1">매물종류</span>
          {PROPERTY_TYPES.map((p) => (
            <Pill key={p} active={propertyType === p} onClick={() => setPropertyType(propertyType === p ? "" : p)}>
              {p}
            </Pill>
          ))}

          <span className="text-sm text-slate-600 ml-3 mr-1">고객등급</span>
          {GRADES.map((g) => (
            <Pill key={g} active={grade === g} onClick={() => setGrade(grade === g ? "" : g)}>
              {g}
            </Pill>
          ))}
        </div>

        {/* Search + Table */}
        <div className="rounded-2xl border p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="text-sm text-slate-600">
              총 <span className="font-semibold text-slate-900">{filtered.length}</span>명
            </div>
            <div className="flex gap-2 flex-wrap">
              <input
                className="w-full md:w-[520px] rounded-xl border px-3 py-2 text-sm"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="연락처 / 희망지역 / 예산 / 매물종류 / 옵션 / 비고 검색"
              />
              <button className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50" onClick={reset}>
                초기화
              </button>
              <button className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50" onClick={load}>
                새로고침
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-auto rounded-2xl border">
            <table className="min-w-[1500px] w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left">
                  {[
                    "번호",
                    "매물종류",
                    "구분",
                    "희망지역",
                    "예산",
                    "입주희망시기",
                    "원하는옵션",
                    "연락처",
                    "다음연락예정일",
                    "고객등급",
                    "비고",
                    "작업",
                  ].map((h) => (
                    <th key={h} className="p-3 font-semibold text-slate-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={12} className="p-6 text-slate-500">
                      불러오는 중...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-6 text-slate-500">
                      데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, idx) => (
                    <tr key={r.id} className="border-t hover:bg-slate-50/50">
                      <td className="p-3 text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-medium">{r.property_type ?? "-"}</td>
                      <td className="p-3">{r.deal_type ?? "-"}</td>
                      <td className="p-3">{r.preferred_area ?? "-"}</td>
                      <td className="p-3">{r.budget ?? "-"}</td>
                      <td className="p-3">{r.move_in_time ?? "-"}</td>
                      <td className="p-3">{r.wanted_options ?? "-"}</td>
                      <td className="p-3">{r.phone}</td>
                      <td className="p-3">{r.next_contact_date ?? "-"}</td>
                      <td className="p-3">{r.grade ?? "-"}</td>
                      <td className="p-3">{r.note ?? "-"}</td>
                      <td className="p-3 whitespace-nowrap">
                        <button className="rounded-xl border px-2 py-1 text-xs hover:bg-white" onClick={() => openEdit(r)}>
                          수정
                        </button>
                        <button
                          className="ml-2 rounded-xl border px-2 py-1 text-xs hover:bg-white text-red-600"
                          onClick={() => remove(r)}
                        >
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

      {/* Modal */}
      <Modal open={open} title={editing ? "손님 수정" : "손님 추가"} onClose={() => setOpen(false)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="연락처 *"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: (e.target as HTMLInputElement).value }))}
            placeholder="예: 01012345678"
          />

          <Input
            label="최초문의일"
            type="date"
            value={form.first_inquiry_date}
            onChange={(e) => setForm((p) => ({ ...p, first_inquiry_date: (e.target as HTMLInputElement).value }))}
          />

          <div className="space-y-1">
            <div className="text-sm text-slate-600">고객등급</div>
            <select
              className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
              value={form.grade}
              onChange={(e) => setForm((p) => ({ ...p, grade: e.target.value }))}
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="다음연락예정일"
            type="date"
            value={form.next_contact_date}
            onChange={(e) => setForm((p) => ({ ...p, next_contact_date: (e.target as HTMLInputElement).value }))}
          />

          <div className="space-y-1">
            <div className="text-sm text-slate-600">구분</div>
            <select
              className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
              value={form.deal_type}
              onChange={(e) => setForm((p) => ({ ...p, deal_type: e.target.value }))}
            >
              {DEAL_TYPES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="희망지역(동)"
            value={form.preferred_area}
            onChange={(e) => setForm((p) => ({ ...p, preferred_area: (e.target as HTMLInputElement).value }))}
            placeholder="예: 자양동"
          />

          <Input
            label="예산"
            value={form.budget}
            onChange={(e) => setForm((p) => ({ ...p, budget: (e.target as HTMLInputElement).value }))}
            placeholder="예: 5000/65 또는 2억"
          />

          <div className="space-y-1">
            <div className="text-sm text-slate-600">매물종류</div>
            <select
              className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
              value={form.property_type}
              onChange={(e) => setForm((p) => ({ ...p, property_type: e.target.value }))}
            >
              {PROPERTY_TYPES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="입주희망시기"
            value={form.move_in_time}
            onChange={(e) => setForm((p) => ({ ...p, move_in_time: (e.target as HTMLInputElement).value }))}
            placeholder="예: 즉시/1개월/협의"
          />

          <Input
            label="원하는옵션(자유기입)"
            value={form.wanted_options}
            onChange={(e) => setForm((p) => ({ ...p, wanted_options: (e.target as HTMLInputElement).value }))}
            placeholder="예: 풀옵션, 주차, 엘베..."
          />
        </div>

        <div className="mt-4">
          <Textarea
            label="비고"
            value={form.note}
            onChange={(e) => setForm((p) => ({ ...p, note: (e.target as HTMLTextAreaElement).value }))}
            placeholder="메모/특이사항"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>
            취소
          </button>
          <button className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm" onClick={save}>
            저장
          </button>
        </div>
      </Modal>
    </div>
  );
}
