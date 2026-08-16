import React, { useState, useEffect, useCallback } from "react";
import {
  Home, ClipboardList, Building2, LogOut, Loader2, AlertCircle,
  CheckCircle2, Circle, Clock, ChevronLeft, ChevronRight,
  FileText, Users, Eye, EyeOff, Plus, Calendar, GraduationCap,
} from "lucide-react";
import { supabase } from "./supabaseClient";

/*
  Bybus HQ — المقر الافتراضي للشركة
  ===================================
  3 مستويات صلاحيات: مؤسس (قراءة فقط) / مدير عام (تحكم كامل) / موظف (تحكم في مهامه بس)
  كل الصلاحيات دي متطبقة فعلياً كـ RLS على قاعدة البيانات، مش بس في الواجهة.
*/

const LIFECYCLE_ICONS = ["🧭", "🏗️", "🚀", "⚖️", "🎯", "📈"];

function todayStr() {
  return new Date().toLocaleDateString("en-CA");
}

function BybusHQMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="4" y="16" width="56" height="34" rx="14" fill="#4FB6E8" />
      <rect x="10" y="22" width="14" height="12" rx="4" fill="#12151C" />
      <rect x="28" y="22" width="14" height="12" rx="4" fill="#12151C" />
      <rect x="46" y="24" width="10" height="16" rx="4" fill="#FFC93C" />
    </svg>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-10 text-gray-500">
      <Loader2 size={22} className="animate-spin" />
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl p-3 mb-3">
      <AlertCircle size={16} className="shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

const STATUS_STYLE = {
  "لم تبدأ": { bg: "bg-gray-100", text: "text-gray-500", icon: Circle },
  "قيد التنفيذ": { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
  "تم": { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle2 },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE["لم تبدأ"];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
      <Icon size={12} /> {status}
    </span>
  );
}

/* ================= شاشة الدخول ================= */

function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (password.length < 6) {
      setError("كلمة المرور لازم تكون 6 حروف/أرقام على الأقل");
      return;
    }
    setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      if (err) throw new Error(err.message);
      if (!data.session) {
        setInfo("تم إنشاء الحساب. لو مطلوب تأكيد البريد، هيوصلك إيميل تأكيد الأول.");
        setMode("login");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4" dir="rtl">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="rounded-3xl p-4 mb-3 bg-white border border-gray-100 shadow-sm">
            <BybusHQMark size={52} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Bybus HQ</h1>
          <p className="text-gray-400 text-sm mt-1">المقر الافتراضي للشركة</p>
        </div>

        <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
          <button
            onClick={() => { setMode("login"); setError(""); setInfo(""); }}
            className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors"
            style={mode === "login" ? { backgroundColor: "white", color: "#12151C" } : { color: "#8A93A6" }}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => { setMode("signup"); setError(""); setInfo(""); }}
            className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors"
            style={mode === "signup" ? { backgroundColor: "white", color: "#12151C" } : { color: "#8A93A6" }}
          >
            حساب جديد
          </button>
        </div>

        <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="bg-white rounded-2xl p-6">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl p-3 mb-4">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> <span>{error}</span>
            </div>
          )}
          {info && (
            <div className="flex items-start gap-2 bg-sky-50 border border-sky-100 text-sky-700 text-xs rounded-xl p-3 mb-4">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> <span>{info}</span>
            </div>
          )}

          <label className="block text-sm font-medium text-gray-600 mb-1.5">البريد الإلكتروني</label>
          <input
            type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 mb-4 text-sm text-left focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
          <label className="block text-sm font-medium text-gray-600 mb-1.5">كلمة المرور</label>
          <div className="relative mb-6">
            <input
              type={showPw ? "text" : "password"} dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full rounded-xl py-3 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ backgroundColor: "#FF8C42" }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ============ شاشة الربط لأول مرة (اختر هويتك من الشركاء) ============ */

function IdentityLinkScreen({ userId, onLinked }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from("team_members")
        .select("id, full_name, role_title, auth_user_id")
        .is("auth_user_id", null);
      if (err) setError(err.message);
      setMembers(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function claim(memberId) {
    setLinking(memberId);
    setError("");
    try {
      const { error: err } = await supabase.from("team_members").update({ auth_user_id: userId }).eq("id", memberId);
      if (err) throw err;
      onLinked();
    } catch (err) {
      setError(err.message);
      setLinking(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" dir="rtl">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-1">مين حضرتك؟</h2>
        <p className="text-xs text-gray-400 mb-5">أول دخول — اختار اسمك من قايمة الشركاء عشان نربط حسابك.</p>
        <ErrorBanner message={error} />
        {loading ? (
          <Spinner />
        ) : members.length === 0 ? (
          <div className="text-center text-sm text-gray-400 py-8">كل الشركاء متربطين بالفعل. لو ده حسابك الأول، كلّم المدير العام.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {members.map((m) => (
              <button
                key={m.id} onClick={() => claim(m.id)} disabled={linking === m.id}
                className="text-right rounded-xl border border-gray-200 p-3.5 hover:bg-gray-50 flex items-center justify-between disabled:opacity-60"
              >
                <div>
                  <div className="text-sm font-bold text-gray-800">{m.full_name}</div>
                  <div className="text-xs text-gray-400">{m.role_title}</div>
                </div>
                {linking === m.id ? <Loader2 size={16} className="animate-spin text-gray-400" /> : <ChevronLeft size={16} className="text-gray-600" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= البطاقة التفاعلية المتحركة (الطيارة) ================= */

function FlightProgressCard({ lifecyclePhases, onOpen }) {
  const currentIdx = lifecyclePhases.findIndex((p) => p.status === "جارية");
  return (
    <button
      onClick={onOpen}
      className="w-full text-right rounded-3xl overflow-hidden relative group"
      style={{ background: "linear-gradient(180deg, #0B1A2E 0%, #1B3A5C 45%, #3E6B8C 75%, #E8A063 100%)" }}
    >
      <div className="relative h-56 px-6 pt-6 pb-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-gray-400 tracking-wide mono">FLIGHT PROGRESS</span>
          <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5">
            رحلة Bybus <ChevronLeft size={13} className="opacity-70 group-hover:-translate-x-0.5 transition-transform" />
          </span>
        </div>

        <div className="relative mt-10" style={{ height: 70 }}>
          <div className="absolute top-1/2 right-0 left-0 border-t border-dashed border-white/25" />
          {lifecyclePhases.map((p, i) => {
            const pct = (i / (lifecyclePhases.length - 1)) * 100;
            const done = p.status === "مكتملة";
            const current = p.status === "جارية";
            return (
              <div key={p.id} className="absolute top-1/2 -translate-y-1/2" style={{ right: `${pct}%`, transform: "translate(50%, -50%)" }}>
                {current && (
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 text-2xl plane-bob" style={{ transform: "translateX(-50%) scaleX(-1)" }}>
                    ✈️
                  </div>
                )}
                <div
                  className={`w-3 h-3 rounded-full border-2 ${current ? "pulse-current" : ""}`}
                  style={{
                    background: done ? "#4ECDC4" : current ? "#FF8C42" : "transparent",
                    borderColor: done ? "#4ECDC4" : current ? "#FF8C42" : "rgba(255,255,255,0.35)",
                  }}
                />
              </div>
            );
          })}
        </div>

        <div className="relative mt-1 flex justify-between">
          {lifecyclePhases.map((p, i) => {
            const done = p.status === "مكتملة";
            const current = p.status === "جارية";
            return (
              <div key={p.id} className="flex flex-col items-center" style={{ width: `${100 / lifecyclePhases.length}%` }}>
                <span className="text-base leading-none mb-1 opacity-90">{LIFECYCLE_ICONS[i]}</span>
                <span
                  className={`text-[10px] font-bold text-center leading-tight ${current ? "text-white" : done ? "text-gray-400" : "text-white/40"}`}
                >
                  {p.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </button>
  );
}

/* ================= الصفحة الرئيسية ================= */

function HomePage({ member, onNavigate }) {
  const [lifecyclePhases, setLifecyclePhases] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [lcRes, todayRes, sumRes] = await Promise.all([
        supabase.from("strategic_lifecycle_phases").select("id, phase_order, name, status").order("phase_order"),
        supabase.from("today_tasks").select("*").eq("member_id", member.id).order("due_date"),
        supabase.from("member_task_summary").select("*").eq("member_id", member.id).maybeSingle(),
      ]);
      if (lcRes.error) throw lcRes.error;
      setLifecyclePhases(lcRes.data || []);
      setTodayTasks(todayRes.data || []);
      setSummary(sumRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [member.id]);

  useEffect(() => { load(); }, [load]);

  const currentPhase = lifecyclePhases.find((p) => p.status === "جارية");

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">أهلاً، {member.full_name.split(" ")[0]}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{member.role_title}</p>
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? <Spinner /> : (
        <>
          <FlightProgressCard lifecyclePhases={lifecyclePhases} onOpen={() => onNavigate("strategic")} />

          {currentPhase && (
            <div className="mt-4 rounded-2xl bg-white border border-gray-100 shadow-sm p-4 text-sm text-gray-600">
              <span className="text-gray-500">المرحلة الحالية: </span>
              <span className="font-bold text-gray-800">{currentPhase.name}</span>
            </div>
          )}

          {summary && (
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-gray-800 mono">{summary.not_started}</div>
                <div className="text-[11px] text-gray-400 mt-1">لم تبدأ</div>
              </div>
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-amber-400 mono">{summary.in_progress}</div>
                <div className="text-[11px] text-gray-400 mt-1">قيد التنفيذ</div>
              </div>
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400 mono">{summary.completed}</div>
                <div className="text-[11px] text-gray-400 mt-1">تم</div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-800">مهام اليوم</h2>
              <button onClick={() => onNavigate("mytasks")} className="text-xs text-sky font-bold flex items-center gap-1">
                كل المهام <ChevronLeft size={13} />
              </button>
            </div>
            {todayTasks.length === 0 ? (
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 text-center text-sm text-gray-400">
                مفيش مهام مستحقة عليك النهاردة 🎉
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {todayTasks.map((t) => (
                  <button
                    key={t.id} onClick={() => onNavigate("task", t.id)}
                    className="text-right rounded-2xl bg-white border border-gray-100 shadow-sm p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-800">{t.title}</span>
                      <StatusBadge status={t.status} />
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1.5">{t.department_name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ================= الخطة الاستراتيجية ================= */

function StrategicPlanPage({ onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [lifecyclePhases, setLifecyclePhases] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [pRes, lcRes, dRes] = await Promise.all([
          supabase.from("strategic_company_profile").select("*").single(),
          supabase.from("lifecycle_progress").select("*").order("phase_order"),
          supabase.from("strategic_reference_documents").select("*").order("created_at"),
        ]);
        if (pRes.error) throw pRes.error;
        setProfile(pRes.data);
        setLifecyclePhases(lcRes.data || []);
        setDocs(dRes.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="pb-10">
      <h1 className="text-xl font-bold text-gray-800 mb-5">الخطة الاستراتيجية</h1>
      <ErrorBanner message={error} />

      {profile && (
        <div className="flex flex-col gap-3 mb-6">
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
            <div className="text-[11px] font-bold text-sky mb-1.5">الرؤية</div>
            <p className="text-sm text-gray-600 leading-relaxed">{profile.vision_statement}</p>
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
            <div className="text-[11px] font-bold text-mint mb-1.5">الرسالة</div>
            <p className="text-sm text-gray-600 leading-relaxed">{profile.mission_statement}</p>
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
            <div className="text-[11px] font-bold text-orange mb-1.5">الأهداف الاستراتيجية الكبرى</div>
            <p className="text-sm text-gray-600 leading-relaxed">{profile.major_strategic_goals}</p>
          </div>
        </div>
      )}

      <h2 className="text-sm font-bold text-gray-800 mb-3">مراحل دورة الحياة</h2>
      <div className="flex flex-col gap-2 mb-6">
        {lifecyclePhases.map((p) => (
          <button
            key={p.id} onClick={() => onNavigate("phase", p.id)}
            className="text-right rounded-2xl bg-white border border-gray-100 shadow-sm p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{LIFECYCLE_ICONS[p.phase_order - 1]}</span>
                <div>
                  <div className="text-sm font-bold text-gray-800">{p.name}</div>
                  <div className="text-[11px] text-gray-500">{p.completed_sub_phases}/{p.total_sub_phases} مرحلة فرعية مكتملة</div>
                </div>
              </div>
              <StatusBadge status={p.status === "جارية" ? "قيد التنفيذ" : p.status === "مكتملة" ? "تم" : "لم تبدأ"} />
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-mint rounded-full" style={{ width: `${p.progress_percent}%` }} />
            </div>
          </button>
        ))}
      </div>

      <h2 className="text-sm font-bold text-gray-800 mb-3">الملفات المرجعية</h2>
      <div className="flex flex-col gap-2">
        {docs.map((d) => (
          <div key={d.id} className="flex items-center gap-3 rounded-2xl bg-white border border-gray-100 shadow-sm p-3.5">
            <div className="rounded-lg p-2 bg-sky/20"><FileText size={15} className="text-sky" /></div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-800">{d.title}</div>
              <div className="text-[11px] text-gray-500">{d.document_type}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= تفاصيل المرحلة ================= */

function PhaseDetailPage({ lifecyclePhaseId, onNavigate }) {
  const [lifecyclePhase, setLifecyclePhase] = useState(null);
  const [subPhases, setSubPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [lpRes, spRes] = await Promise.all([
          supabase.from("strategic_lifecycle_phases").select("*").eq("id", lifecyclePhaseId).single(),
          supabase.from("strategic_roadmap_phases").select("*").eq("lifecycle_phase_id", lifecyclePhaseId).order("display_order"),
        ]);
        if (lpRes.error) throw lpRes.error;
        setLifecyclePhase(lpRes.data);
        setSubPhases(spRes.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lifecyclePhaseId]);

  if (loading) return <Spinner />;
  if (!lifecyclePhase) return <ErrorBanner message="المرحلة مش موجودة" />;

  return (
    <div className="pb-10">
      <button onClick={() => onNavigate("strategic")} className="text-xs text-gray-400 flex items-center gap-1 mb-4">
        <ChevronRight size={14} /> رجوع للخطة الاستراتيجية
      </button>
      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl">{LIFECYCLE_ICONS[lifecyclePhase.phase_order - 1]}</span>
        <h1 className="text-xl font-bold text-gray-800">{lifecyclePhase.name}</h1>
      </div>
      <p className="text-sm text-gray-400 mb-6">{lifecyclePhase.description}</p>
      <ErrorBanner message={error} />

      <div className="flex flex-col gap-3">
        {subPhases.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 text-center text-sm text-gray-400">
            مفيش مراحل محددة مربوطة بالمرحلة العامة دي لسه.
          </div>
        ) : subPhases.map((sp) => (
          <div key={sp.id} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-gray-800">{sp.phase_name}</span>
              <StatusBadge status={sp.status === "جارية" ? "قيد التنفيذ" : sp.status === "مكتملة" ? "تم" : "لم تبدأ"} />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{sp.goal}</p>
            {sp.timeframe_label && <div className="text-[11px] text-gray-500 mt-2">الإطار الزمني: {sp.timeframe_label}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= تفاصيل المهمة ================= */

function TaskDetailPage({ taskId, member, onNavigate }) {
  const [task, setTask] = useState(null);
  const [stages, setStages] = useState([]);
  const [contingencies, setContingencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [newStage, setNewStage] = useState("");
  const [newStageDate, setNewStageDate] = useState(todayStr());
  const [addingStage, setAddingStage] = useState(false);
  const [contingencyText, setContingencyText] = useState("");
  const [addingContingency, setAddingContingency] = useState(false);
  const [estDays, setEstDays] = useState("");

  const canControl = member.is_general_manager || member.departmentIds?.includes(task?.department_id);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [tRes, sRes, cRes] = await Promise.all([
        supabase.from("tasks").select("*, departments(name, code)").eq("id", taskId).single(),
        supabase.from("task_stages").select("*").eq("task_id", taskId).order("stage_order"),
        supabase.from("task_contingency_plans").select("*, team_members(full_name)").eq("task_id", taskId).order("created_at"),
      ]);
      if (tRes.error) throw tRes.error;
      setTask(tRes.data);
      setEstDays(tRes.data.estimated_days || "");
      setStages(sRes.data || []);
      setContingencies(cRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(newStatus) {
    setSavingStatus(true);
    try {
      const { error: err } = await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
      if (err) throw err;
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingStatus(false);
    }
  }

  async function saveEstDays() {
    if (!estDays) return;
    await supabase.from("tasks").update({ estimated_days: Number(estDays) }).eq("id", taskId);
  }

  async function addStage(e) {
    e.preventDefault();
    if (!newStage.trim()) return;
    setAddingStage(true);
    try {
      const { error: err } = await supabase.from("task_stages").insert({
        task_id: taskId,
        stage_name: newStage.trim(),
        stage_order: stages.length + 1,
        planned_date: newStageDate,
        registered_by: member.id,
      });
      if (err) throw err;
      setNewStage("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingStage(false);
    }
  }

  async function toggleStage(stage) {
    const next = stage.status === "تم" ? "لسه" : stage.status === "لسه" ? "جاري" : "تم";
    await supabase.from("task_stages").update({ status: next }).eq("id", stage.id);
    load();
  }

  async function addContingency(e) {
    e.preventDefault();
    if (!contingencyText.trim()) return;
    setAddingContingency(true);
    try {
      const { error: err } = await supabase.from("task_contingency_plans").insert({
        task_id: taskId,
        plan_text: contingencyText.trim(),
        proposed_by: member.id,
      });
      if (err) throw err;
      setContingencyText("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingContingency(false);
    }
  }

  if (loading) return <Spinner />;
  if (!task) return <ErrorBanner message="المهمة مش موجودة" />;

  const stageInputClass = "flex-1 rounded-xl border border-gray-100 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400";

  return (
    <div className="pb-10">
      <button onClick={() => onNavigate("mytasks")} className="text-xs text-gray-400 flex items-center gap-1 mb-4">
        <ChevronRight size={14} /> رجوع
      </button>

      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 mb-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="text-lg font-bold text-gray-800 flex-1">{task.title}</h1>
          <StatusBadge status={task.status} />
        </div>
        {task.description && <p className="text-sm text-gray-400 leading-relaxed mb-3">{task.description}</p>}
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{task.departments?.name}</span>
          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">أولوية: {task.priority}</span>
          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">تاريخ الاستحقاق: {task.due_date}</span>
        </div>

        <ErrorBanner message={error} />

        {canControl && (
          <div className="flex gap-2 mt-4">
            {["لم تبدأ", "قيد التنفيذ", "تم"].map((s) => (
              <button
                key={s} onClick={() => updateStatus(s)} disabled={savingStatus}
                className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-colors disabled:opacity-50 ${
                  task.status === s ? "bg-orange text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-800">الخطة التنفيذية</h2>
          {!task.plan_registered && <span className="text-[10px] text-amber-400 font-bold">لسه محتاجة تسجيل</span>}
        </div>

        {canControl && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-gray-400">تقدير المدة (أيام):</span>
            <input
              type="number" value={estDays} onChange={(e) => setEstDays(e.target.value)} onBlur={saveEstDays}
              className="w-16 rounded-lg border border-gray-100 bg-white px-2 py-1 text-xs text-gray-800 text-center focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        )}

        {stages.length === 0 ? (
          <div className="text-center text-xs text-gray-500 py-6">مفيش مراحل متسجّلة لسه — المكلّف بالمهمة هو اللي يسجّلها.</div>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            {stages.map((s) => (
              <button
                key={s.id} onClick={() => canControl && toggleStage(s)}
                className="w-full text-right flex items-center gap-3 rounded-xl bg-white p-3 hover:bg-gray-50 transition-colors"
              >
                {s.status === "تم" ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  : s.status === "جاري" ? <Clock size={16} className="text-amber-400 shrink-0" />
                  : <Circle size={16} className="text-gray-500 shrink-0" />}
                <span className={`flex-1 text-sm ${s.status === "تم" ? "text-gray-400 line-through" : "text-gray-800"}`}>{s.stage_name}</span>
                {s.planned_date && <span className="text-[11px] text-gray-500 mono">{s.planned_date}</span>}
              </button>
            ))}
          </div>
        )}

        {canControl && (
          <form onSubmit={addStage} className="flex gap-2">
            <input value={newStage} onChange={(e) => setNewStage(e.target.value)} placeholder="أضف مرحلة جديدة..." className={stageInputClass} />
            <input type="date" dir="ltr" value={newStageDate} onChange={(e) => setNewStageDate(e.target.value)} className="rounded-xl border border-gray-100 bg-white px-3 py-2.5 text-xs text-gray-800" />
            <button type="submit" disabled={addingStage} className="rounded-xl px-4 bg-sky text-white shrink-0 disabled:opacity-60">
              {addingStage ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            </button>
          </form>
        )}
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-gray-800 mb-3">الخطة البديلة (Contingency Plan)</h2>
        {contingencies.length === 0 ? (
          <div className="text-center text-xs text-gray-500 py-4 mb-3">مفيش خطة بديلة مقترحة.</div>
        ) : (
          <div className="flex flex-col gap-2 mb-3">
            {contingencies.map((c) => (
              <div key={c.id} className="rounded-xl bg-white p-3">
                <p className="text-sm text-gray-200">{c.plan_text}</p>
                <div className="text-[11px] text-gray-500 mt-1.5">اقترحها: {c.team_members?.full_name} · {c.status}</div>
              </div>
            ))}
          </div>
        )}
        {canControl && (
          <form onSubmit={addContingency} className="flex gap-2">
            <input value={contingencyText} onChange={(e) => setContingencyText(e.target.value)} placeholder="اقترح خطة بديلة توصل لنفس الهدف..." className={stageInputClass} />
            <button type="submit" disabled={addingContingency} className="rounded-xl px-4 bg-orange text-white shrink-0 disabled:opacity-60">
              {addingContingency ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ================= صفحتي (المهام الشخصية) ================= */

function MyTasksPage({ member, onNavigate }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("today");
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let query = supabase.from("member_visible_tasks").select("*").eq("member_id", member.id).order("due_date", { ascending: false });
      if (viewMode === "today") query = query.eq("due_date", todayStr());
      if (viewMode === "date") query = query.eq("due_date", selectedDate);
      const { data, error: err } = await query;
      if (err) throw err;
      setTasks(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [member.id, viewMode, selectedDate]);

  useEffect(() => { load(); }, [load]);

  const grouped = tasks.reduce((acc, t) => {
    const key = t.department_name || "بدون إدارة";
    acc[key] = acc[key] || [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div className="pb-10">
      <h1 className="text-xl font-bold text-gray-800 mb-1">صفحتي</h1>
      <p className="text-sm text-gray-400 mb-5">كل مهامك عبر كل الإدارات اللي بتديرها</p>

      <div className="flex gap-2 mb-5">
        <button onClick={() => setViewMode("today")} className={`rounded-full px-4 py-2 text-xs font-bold ${viewMode === "today" ? "bg-orange text-white" : "bg-gray-100 text-gray-600"}`}>اليوم</button>
        <button onClick={() => setViewMode("date")} className={`rounded-full px-4 py-2 text-xs font-bold flex items-center gap-1.5 ${viewMode === "date" ? "bg-orange text-white" : "bg-gray-100 text-gray-600"}`}>
          <Calendar size={13} /> تاريخ محدد
        </button>
        <button onClick={() => setViewMode("all")} className={`rounded-full px-4 py-2 text-xs font-bold ${viewMode === "all" ? "bg-orange text-white" : "bg-gray-100 text-gray-600"}`}>كل المهام</button>
      </div>

      {viewMode === "date" && (
        <input
          type="date" dir="ltr" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm text-gray-800 mb-5"
        />
      )}

      <ErrorBanner message={error} />

      {loading ? <Spinner /> : Object.keys(grouped).length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8 text-center text-sm text-gray-400">مفيش مهام في النطاق ده.</div>
      ) : (
        Object.entries(grouped).map(([dept, deptTasks]) => (
          <div key={dept} className="mb-6">
            <div className="flex items-center gap-2 mb-2.5">
              <Building2 size={14} className="text-gray-500" />
              <h3 className="text-xs font-bold text-gray-400">{dept}</h3>
            </div>
            <div className="flex flex-col gap-2">
              {deptTasks.map((t) => (
                <button
                  key={t.id} onClick={() => onNavigate("task", t.id)}
                  className="text-right rounded-2xl bg-white border border-gray-100 shadow-sm p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-800">{t.title}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1.5 mono">{t.due_date}</div>
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ================= مكتب الإدارة (المدير العام بس) ================= */

function AdminOfficePage({ member }) {
  const [departments, setDepartments] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(todayStr());
  const [priority, setPriority] = useState("عادية");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    supabase.from("departments").select("code, name").then(({ data }) => setDepartments(data || []));
  }, []);

  function insertHashtag(code) {
    setTitle((prev) => `${prev.trim()} #${code}`.trim());
  }

  async function createTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const { error: err } = await supabase.from("tasks").insert({
        title: title.trim(),
        description: description.trim() || null,
        assigned_by: member.id,
        due_date: dueDate,
        priority,
      });
      if (err) throw err;
      setSuccess("اتضافت المهمة، والنظام وجّهها تلقائياً للإدارة المكتوبة بالهاشتاج.");
      setTitle(""); setDescription("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!member.is_general_manager) {
    return <div className="text-center text-sm text-gray-400 py-16">الصفحة دي للمدير العام بس.</div>;
  }

  const inputClass = "w-full rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400";

  return (
    <div className="pb-10">
      <h1 className="text-xl font-bold text-gray-800 mb-1">مكتب الإدارة</h1>
      <p className="text-sm text-gray-400 mb-6">كلّف إدارة بمهمة جديدة — استخدم الهاشتاج قبل اسم الإدارة عشان الاستدعاء يشتغل.</p>

      <ErrorBanner message={error} />
      {success && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl p-3 mb-4">{success}</div>}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {departments.map((d) => (
          <button key={d.code} type="button" onClick={() => insertHashtag(d.code)} className="text-[11px] bg-gray-100 hover:bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
            #{d.name}
          </button>
        ))}
      </div>

      <form onSubmit={createTask} className="flex flex-col gap-3">
        <textarea value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان المهمة... اكتب #اسم_الإدارة في أي مكان" rows={2} className={inputClass} />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="تفاصيل إضافية (اختياري)" rows={3} className={inputClass} />
        <div className="flex gap-3">
          <input type="date" dir="ltr" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClass}>
            <option value="عاجلة">عاجلة</option>
            <option value="عادية">عادية</option>
            <option value="منخفضة">منخفضة</option>
          </select>
        </div>
        <button type="submit" disabled={saving} className="rounded-xl py-3 bg-orange text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
          {saving && <Loader2 size={16} className="animate-spin" />} تكليف المهمة
        </button>
      </form>
    </div>
  );
}

/* ================= الهيكل الرئيسي ================= */

function BottomNav({ page, setPage, isGM }) {
  const items = [
    { key: "home", label: "الرئيسية", icon: Home },
    { key: "strategic", label: "الخطة", icon: Building2 },
    { key: "mytasks", label: "صفحتي", icon: ClipboardList },
    { key: "business-language", label: "لغة البزنس", icon: GraduationCap, external: true },
    ...(isGM ? [{ key: "admin", label: "مكتب الإدارة", icon: Users }] : []),
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex items-stretch z-40" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {items.map((it) => {
        const Icon = it.icon;
        const active = page === it.key;
        if (it.external) {
          return (
            <a
              key={it.key}
              href={`${import.meta.env.BASE_URL}business-language.html`}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5"
            >
              <Icon size={19} color="#6B7280" />
              <span className="text-[10px] font-bold" style={{ color: "#6B7280" }}>{it.label}</span>
            </a>
          );
        }
        return (
          <button key={it.key} onClick={() => setPage(it.key)} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5">
            <Icon size={19} color={active ? "#FF8C42" : "#6B7280"} />
            <span className="text-[10px] font-bold" style={{ color: active ? "#FF8C42" : "#6B7280" }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function Dashboard({ member }) {
  const [page, setPage] = useState("home");
  const [selectedId, setSelectedId] = useState(null);

  function navigate(target, id) {
    setPage(target);
    setSelectedId(id || null);
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="flex items-center justify-between px-5 pt-6 pb-3">
        <div className="flex items-center gap-2.5">
          <BybusHQMark size={30} />
          <span className="font-bold text-gray-800 text-base">Bybus HQ</span>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="text-gray-500 hover:text-gray-600">
          <LogOut size={18} />
        </button>
      </header>

      <main className="px-5" style={{ paddingBottom: 90 }}>
        {page === "home" && <HomePage member={member} onNavigate={navigate} />}
        {page === "strategic" && <StrategicPlanPage onNavigate={navigate} />}
        {page === "phase" && <PhaseDetailPage lifecyclePhaseId={selectedId} onNavigate={navigate} />}
        {page === "task" && <TaskDetailPage taskId={selectedId} member={member} onNavigate={navigate} />}
        {page === "mytasks" && <MyTasksPage member={member} onNavigate={navigate} />}
        {page === "admin" && <AdminOfficePage member={member} />}
      </main>

      <BottomNav page={page} setPage={navigate} isGM={member.is_general_manager} />
    </div>
  );
}

/* ================= الجذر ================= */

export default function App() {
  const [session, setSession] = useState(undefined);
  const [member, setMember] = useState(null);
  const [needsLinking, setNeedsLinking] = useState(false);

  const loadMember = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from("team_members")
      .select("*, member_departments(department_id)")
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (error || !data) {
      setNeedsLinking(true);
      setMember(null);
      return;
    }
    setNeedsLinking(false);
    setMember({ ...data, departmentIds: (data.member_departments || []).map((d) => d.department_id) });
  }, []);

  useEffect(() => {
    async function handleSession(currentSession) {
      if (!currentSession) {
        setSession(null);
        setMember(null);
        return;
      }
      setSession(currentSession);
      await loadMember(currentSession.user.id);
    }

    supabase.auth.getSession().then(({ data }) => handleSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      handleSession(currentSession);
    });
    return () => listener.subscription.unsubscribe();
  }, [loadMember]);

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={24} className="animate-spin text-gray-500" />
      </div>
    );
  }

  if (!session) return <AuthScreen />;
  if (needsLinking) return <IdentityLinkScreen userId={session.user.id} onLinked={() => loadMember(session.user.id)} />;
  if (!member) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 size={24} className="animate-spin text-gray-500" /></div>;

  return <Dashboard member={member} />;
}
