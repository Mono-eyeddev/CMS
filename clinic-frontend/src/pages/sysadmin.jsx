import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:8000";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

/* ═══════════════════════════════════════════════════════════════
   THEME ENGINE
═══════════════════════════════════════════════════════════════ */
const mkT = (dark) => ({
  pageBg:    dark ? "#020c1a"                      : "#EEF2F7",
  sidebarBg: dark ? "#010810"                      : "#0A1628",
  headerBg:  dark ? "rgba(2,12,26,0.97)"           : "rgba(255,255,255,0.97)",
  cardBg:    dark ? "rgba(255,255,255,0.03)"       : "#FFFFFF",
  cardHd:    dark ? "rgba(0,174,239,0.05)"         : "rgba(0,100,180,0.03)",
  inputBg:   dark ? "rgba(255,255,255,0.06)"       : "#F0F4F8",
  rowBg:     dark ? "rgba(255,255,255,0.02)"       : "#FAFCFF",
  popBg:     dark ? "#0a1e36"                      : "#FFFFFF",
  border:    dark ? "rgba(0,174,239,0.12)"         : "#D0DFF0",
  borderSt:  dark ? "rgba(0,174,239,0.28)"         : "#A8C4E0",
  inputBd:   dark ? "rgba(0,174,239,0.22)"         : "#B8D0E8",
  text:      dark ? "#EFF6FF"                      : "#0A1628",
  textSub:   dark ? "#5A7090"                      : "#3D5175",
  textMt:    dark ? "#2E4460"                      : "#8FA3BF",
  accent:    dark ? "#00AEEF"                      : "#0077B6",
  accentDk:  dark ? "#0077B6"                      : "#005A8E",
  accentGl:  dark ? "rgba(0,174,239,0.13)"         : "rgba(0,119,182,0.09)",
  success:   dark ? "#00C48C"                      : "#009E72",
  warning:   dark ? "#FFB020"                      : "#C4870A",
  danger:    dark ? "#FF4D4D"                      : "#D93636",
  purple:    dark ? "#A855F7"                      : "#7C3AED",
  shadow:    dark ? "0 4px 24px rgba(0,0,0,.5)"   : "0 4px 20px rgba(10,22,40,.08)",
  popShadow: dark ? "0 16px 48px rgba(0,0,0,.7)"  : "0 16px 48px rgba(10,22,40,.18)",
});

/* ═══════════════════════════════════════════════════════════════
   ICON SYSTEM
═══════════════════════════════════════════════════════════════ */
const Ico = ({ d, size = 16, color = "currentColor", stroke = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const IC = {
  dashboard:  "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  clinic:     "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  users:      "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  kpi:        "M18 20V10M12 20V4M6 20v-6",
  monitor:    "M22 12h-4l-3 9L9 3l-3 9H2",
  governance: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  audit:      "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  settings:   "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  profile:    "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  bell:       "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  logout:     "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  sun:        "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z",
  moon:       "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  plus:       "M12 5v14M5 12h14",
  edit:       "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:      "M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6",
  key:        "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  check:      "M20 6L9 17l-5-5",
  chevR:      "M9 18l6-6-6-6",
  chevL:      "M15 18l-6-6 6-6",
  download:   "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  shield:     "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  mail:       "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  phone:      "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  calendar:   "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  activity:   "M22 12h-4l-3 9L9 3l-3 9H2",
  server:     "M2 2h20v8H2zM2 14h20v8H2zM6 6h.01M6 18h.01",
  database:   "M12 2C6.48 2 2 4.24 2 7s4.48 5 10 5 10-2.24 10-5-4.48-5-10-5zM2 7v5c0 2.76 4.48 5 10 5s10-2.24 10-5V7M2 12v5c0 2.76 4.48 5 10 5s10-2.24 10-5v-5",
  cpu:        "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",
  info:       "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 16v-4M12 8h.01",
};

/* ═══════════════════════════════════════════════════════════════
   SHARED UI PRIMITIVES
═══════════════════════════════════════════════════════════════ */
const StatusBadge = ({ label, color }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:`${color}18`, border:`1px solid ${color}33`, borderRadius:20, padding:"2px 9px", fontSize:10, fontWeight:700, color, fontFamily:"'Syne',sans-serif", whiteSpace:"nowrap" }}>
    <span style={{ width:5, height:5, borderRadius:"50%", background:color, display:"inline-block" }}/>
    {label}
  </span>
);

const badgeColor = (val) => {
  const v = (val || "").toLowerCase();
  if (["active","online","operational","valid","reported","day"].includes(v))    return "#00C48C";
  if (["pending","warning","flagged","inactive","night"].includes(v))            return "#FFB020";
  if (["disabled","invalid","late","not reported","offline"].includes(v))        return "#FF4D4D";
  return "#00AEEF";
};

const roleColor = (role) => {
  if (role === "SYSADMIN") return "#A855F7";
  if (role === "CNO")      return "#00AEEF";
  return "#00C48C";
};

function LoadingRows({ t, cols = 5 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"40px", gap:"10px", color:t.textSub, fontSize:"13px" }}>
      <span style={{ width:"16px", height:"16px", border:`2px solid ${t.border}`, borderTop:`2px solid ${t.accent}`, borderRadius:"50%", display:"inline-block", animation:"spin .7s linear infinite" }}/>
      Loading...
    </div>
  );
}

function ErrorMsg({ t, msg }) {
  return <div style={{ textAlign:"center", padding:40, color:t.danger, fontSize:13 }}>⚠ {msg}</div>;
}

function ActionBtn({ label, color = "#00AEEF", t, onClick, icon }) {
  return (
    <button onClick={onClick}
      style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", background:`${color}15`, border:`1px solid ${color}30`, borderRadius:7, fontSize:11, fontWeight:600, color, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", transition:"background .15s" }}
      onMouseEnter={e => e.currentTarget.style.background = `${color}28`}
      onMouseLeave={e => e.currentTarget.style.background = `${color}15`}>
      {icon && <Ico d={icon} size={12} color={color}/>}
      {label}
    </button>
  );
}

function SectionHeader({ title, sub, t, action }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
      <div>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:800, color:t.text, margin:0 }}>{title}</h2>
        {sub && <p style={{ fontSize:12, color:t.textSub, margin:"3px 0 0" }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function AdminCard({ t, title, sub, icon, iconColor, children, style = {} }) {
  const ic = iconColor || t.accent;
  return (
    <div style={{ background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:14, overflow:"hidden", boxShadow:t.shadow, ...style }}>
      {title && (
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"13px 18px", borderBottom:`1px solid ${t.border}`, background:t.cardHd }}>
          {icon && (
            <div style={{ width:28, height:28, borderRadius:7, background:`${ic}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Ico d={icon} size={14} color={ic}/>
            </div>
          )}
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800, color:t.text }}>{title}</div>
            {sub && <div style={{ fontSize:10, color:t.textMt, marginTop:1 }}>{sub}</div>}
          </div>
        </div>
      )}
      <div style={{ padding:"16px 18px" }}>{children}</div>
    </div>
  );
}

function StatCard({ t, label, value, sub, color, icon }) {
  return (
    <div style={{ background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:13, padding:"16px 14px", boxShadow:t.shadow }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Ico d={icon} size={15} color={color}/>
        </div>
        <span style={{ fontSize:10, color:t.textMt, fontFamily:"'Syne',sans-serif", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>Live</span>
      </div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, color, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12, fontWeight:600, color:t.text, marginTop:5 }}>{label}</div>
      {sub && <div style={{ fontSize:10, color:t.textMt, marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function AdminTable({ t, headers, rows }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{ textAlign:"left", padding:"9px 12px", color:t.textMt, fontWeight:700, fontSize:10, letterSpacing:"0.8px", textTransform:"uppercase", fontFamily:"'Syne',sans-serif", borderBottom:`1px solid ${t.border}`, whiteSpace:"nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}
              style={{ background: i % 2 === 0 ? "transparent" : t.rowBg, transition:"background .12s" }}
              onMouseEnter={e => e.currentTarget.style.background = `${t.accent}0a`}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : t.rowBg}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding:"10px 12px", color:t.textSub, verticalAlign:"middle", borderBottom:`1px solid ${t.border}33` }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIEWS
═══════════════════════════════════════════════════════════════ */

/* ── Dashboard ── */
function ViewDashboard({ t }) {
  const [stats, setStats]   = useState(null);
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/auth/dashboard/stats/`,  { headers: authHeaders() }),
      axios.get(`${API}/api/auth/audit-logs/`,        { headers: authHeaders() }),
    ]).then(([s, l]) => {
      setStats(s.data);
      setLogs(l.data.slice(0, 5));
    }).catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label:"Total Clinics",    value: stats?.total_clinics    ?? "—", sub:"Registered facilities",  color:t.accent,  icon:IC.clinic   },
    { label:"Active Clinics",   value: stats?.active_clinics   ?? "—", sub:"Reporting this cycle",   color:t.success, icon:IC.check    },
    { label:"Registered Users", value: stats?.total_users      ?? "—", sub:"Across all roles",       color:t.purple,  icon:IC.users    },
    { label:"Reports Today",    value: stats?.reports_today    ?? "—", sub:"Submitted today",        color:t.success, icon:IC.audit    },
    { label:"Pending Reports",  value: stats?.pending_reports  ?? "—", sub:"Due before deadline",   color:t.warning, icon:IC.calendar },
    { label:"System Alerts",    value: stats?.system_alerts    ?? "—", sub:"Require attention",      color:t.danger,  icon:IC.bell     },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SectionHeader t={t} title="System Overview" sub="Live snapshot of CIMS infrastructure and reporting status"/>
      {loading ? <LoadingRows t={t}/> : error ? <ErrorMsg t={t} msg={error}/> : (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12 }}>
            {statCards.map(s => <StatCard key={s.label} t={t} {...s}/>)}
          </div>
          <AdminCard t={t} title="Recent Activity" sub="Last 5 system actions" icon={IC.audit} iconColor={t.purple}>
            {logs.length === 0 ? (
              <div style={{ textAlign:"center", padding:30, color:t.textMt, fontStyle:"italic", fontSize:13 }}>No recent activity</div>
            ) : (
              <AdminTable t={t}
                headers={["User","Action","IP Address","Timestamp","Details"]}
                rows={logs.map(a => [
                  <span style={{ fontWeight:600, color:t.text }}>{a.user || "—"}</span>,
                  a.action || "—",
                  <span style={{ fontFamily:"monospace", fontSize:11 }}>{a.ip_address || "—"}</span>,
                  <span style={{ color:t.textMt }}>{new Date(a.timestamp).toLocaleString()}</span>,
                  <span style={{ color:t.textSub, fontStyle:"italic" }}>{a.details || "—"}</span>,
                ])}
              />
            )}
          </AdminCard>
        </>
      )}
    </div>
  );
}

/* ── Clinics ── */
function ViewClinics({ t }) {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    axios.get(`${API}/api/auth/clinics/`, { headers: authHeaders() })
      .then(r => setClinics(r.data))
      .catch(() => setError("Failed to load clinics."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SectionHeader t={t} title="Clinic Management" sub={`${clinics.length} registered satellite facilities`}
        action={<ActionBtn t={t} label="+ Add Clinic" color={t.accent} icon={IC.plus}/>}
      />
      <AdminCard t={t} title="Registered Clinics" sub="All satellite clinics in the CIMS network" icon={IC.clinic} iconColor={t.accent}>
        {loading ? <LoadingRows t={t}/> : error ? <ErrorMsg t={t} msg={error}/> : (
          <AdminTable t={t}
            headers={["Clinic","Location","Timezone","Code","Actions"]}
            rows={clinics.map(c => [
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:t.text }}>{c.name}</span>,
              c.location || "—",
              <span style={{ color:t.textMt }}>{c.timezone || "UTC"}</span>,
              <span style={{ fontFamily:"monospace", fontSize:11, color:t.accent }}>{c.code}</span>,
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                <ActionBtn t={t} label="Edit"    color={t.accent} icon={IC.edit}/>
                <ActionBtn t={t} label="Disable" color={t.danger} icon={IC.trash}/>
              </div>,
            ])}
          />
        )}
      </AdminCard>
    </div>
  );
}

/* ── Users ── */
function ViewUsers({ t }) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    axios.get(`${API}/api/auth/users/`, { headers: authHeaders() })
      .then(r => setUsers(r.data))
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SectionHeader t={t} title="User Management" sub={`${users.length} system accounts`}
        action={<ActionBtn t={t} label="+ Create User" color={t.accent} icon={IC.plus}/>}
      />
      <AdminCard t={t} title="System Users" sub="All CNO, Manager and Admin accounts" icon={IC.users} iconColor={t.purple}>
        {loading ? <LoadingRows t={t}/> : error ? <ErrorMsg t={t} msg={error}/> : (
          <AdminTable t={t}
            headers={["Name","Email","Role","Clinic","Actions"]}
            rows={users.map(u => [
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:t.text }}>{u.username}</span>,
              <span style={{ color:t.textMt }}>{u.email}</span>,
              <StatusBadge label={u.role} color={roleColor(u.role)}/>,
              u.clinic || <span style={{ color:t.textMt, fontStyle:"italic" }}>Unassigned</span>,
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                <ActionBtn t={t} label="Edit"      color={t.accent}  icon={IC.edit}/>
                <ActionBtn t={t} label="Reset Pwd" color={t.warning} icon={IC.key}/>
                <ActionBtn t={t} label="Disable"   color={t.danger}  icon={IC.trash}/>
              </div>,
            ])}
          />
        )}
      </AdminCard>
    </div>
  );
}

/* ── KPI Configuration ── */
function ViewKPI({ t }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SectionHeader t={t} title="KPI Configuration" sub="Manage the indicators tracked per shift"
        action={<ActionBtn t={t} label="+ Add KPI" color={t.accent} icon={IC.plus}/>}
      />
      <AdminCard t={t} title="Tracked KPI Fields" sub="All fields submitted per shift report" icon={IC.kpi} iconColor={t.warning}>
        <AdminTable t={t}
          headers={["KPI Field","Category","Type","Status"]}
          rows={[
            ["Total Patients",             "Patient Load",       "Integer", "Active"],
            ["New Cases",                  "Patient Load",       "Integer", "Active"],
            ["Emergency Cases",            "Patient Load",       "Integer", "Active"],
            ["Critical Cases",             "Patient Load",       "Integer", "Active"],
            ["ICU Transfers",              "Patient Load",       "Integer", "Active"],
            ["Mortality Count",            "Patient Load",       "Integer", "Active"],
            ["Staff on Duty",              "Staffing",           "Integer", "Active"],
            ["Nurses Absent",              "Staffing",           "Integer", "Active"],
            ["Overtime Hours",             "Staffing",           "Integer", "Active"],
            ["Unattended Critical Cases",  "Critical Handling",  "Integer", "Active"],
            ["Power Outage Hours",         "Infrastructure",     "Integer", "Active"],
            ["Internet Downtime Hours",    "Infrastructure",     "Integer", "Active"],
            ["Stockout: Oxygen",           "Infrastructure",     "Boolean", "Active"],
            ["Stockout: Essential Drugs",  "Infrastructure",     "Boolean", "Active"],
            ["Bed Occupancy Rate",         "Quality",            "Float",   "Active"],
            ["Readmission Rate",           "Quality",            "Float",   "Active"],
            ["Patient Complaints",         "Quality",            "Integer", "Active"],
            ["Malaria Cases",              "Disease Surveillance","Integer","Active"],
            ["Cholera Cases",              "Disease Surveillance","Integer","Active"],
            ["Respiratory Cases",          "Disease Surveillance","Integer","Active"],
            ["Triage Wait Time",           "Turnaround Times",   "Integer", "Active"],
            ["Lab Turnaround Time",        "Turnaround Times",   "Integer", "Active"],
            ["Pharmacy Wait Time",         "Turnaround Times",   "Integer", "Active"],
          ].map(([name, cat, type, status]) => [
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:t.text }}>{name}</span>,
            <span style={{ color:t.textSub }}>{cat}</span>,
            <span style={{ fontFamily:"monospace", fontSize:11, color:t.accent }}>{type}</span>,
            <StatusBadge label={status} color={badgeColor(status)}/>,
          ])}
        />
      </AdminCard>
    </div>
  );
}

/* ── System Monitoring ── */
function ViewMonitor({ t }) {
  const SYS_METRICS = [
    { label:"Database",       status:"Online",      color:"#00C48C", extra:"PostgreSQL 15.2"   },
    { label:"API Server",     status:"Operational", color:"#00C48C", extra:"v2.4.1 · 142ms"   },
    { label:"File Storage",   status:"Online",      color:"#00C48C", extra:"68% used"          },
    { label:"Email Service",  status:"Warning",     color:"#FFB020", extra:"Queue: 12 pending" },
    { label:"Backup Service", status:"Online",      color:"#00C48C", extra:"Last: 03:00 AM"    },
    { label:"Auth Service",   status:"Operational", color:"#00C48C", extra:"JWT Active"        },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SectionHeader t={t} title="System Monitoring" sub="Infrastructure and service health"/>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
        {SYS_METRICS.map(m => (
          <div key={m.label} style={{ background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:13, padding:"18px 16px", boxShadow:t.shadow }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <div style={{ fontSize:13, fontWeight:700, color:t.text, fontFamily:"'Syne',sans-serif" }}>{m.label}</div>
              <StatusBadge label={m.status} color={m.color}/>
            </div>
            <div style={{ fontSize:11, color:t.textMt, marginBottom:10 }}>{m.extra}</div>
            <div style={{ height:4, background:t.inputBg, borderRadius:2, overflow:"hidden" }}>
              <div style={{ height:"100%", width: m.color === "#FFB020" ? "62%" : "94%", background:m.color, borderRadius:2 }}/>
            </div>
          </div>
        ))}
      </div>
      <AdminCard t={t} title="Performance Metrics" sub="Server response averages" icon={IC.cpu} iconColor={t.accent}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {[["Avg Response","142 ms",t.success],["Peak Response","380 ms",t.warning],["Server Load","34%",t.success],["Uptime","99.94%",t.success]].map(([lbl,val,col]) => (
            <div key={lbl} style={{ textAlign:"center", padding:"14px 10px", background:t.rowBg, borderRadius:10, border:`1px solid ${t.border}` }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:col }}>{val}</div>
              <div style={{ fontSize:10, color:t.textMt, marginTop:4, fontWeight:600 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}

/* ── Data Governance ── */
function ViewGovernance({ t }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    axios.get(`${API}/api/auth/kpi/reports/`, { headers: authHeaders() })
      .then(r => setReports(r.data))
      .catch(() => setError("Failed to load reports."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SectionHeader t={t} title="Data Governance" sub="Validate, manage and export submitted clinic reports"
        action={<ActionBtn t={t} label="Export Dataset" color={t.success} icon={IC.download}/>}
      />
      <AdminCard t={t} title="Report Log" sub={`${reports.length} submitted reports`} icon={IC.governance} iconColor={t.success}>
        {loading ? <LoadingRows t={t}/> : error ? <ErrorMsg t={t} msg={error}/> : reports.length === 0 ? (
          <div style={{ textAlign:"center", padding:30, color:t.textMt, fontStyle:"italic", fontSize:13 }}>No reports found</div>
        ) : (
          <AdminTable t={t}
            headers={["Clinic","Shift","Shift Date","Submitted By","Submitted At","Actions"]}
            rows={reports.map(r => [
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:t.text }}>{r.clinic}</span>,
              <StatusBadge label={r.shift} color={r.shift === "DAY" ? t.warning : t.purple}/>,
              <span style={{ color:t.textMt }}>{r.shift_date}</span>,
              r.manager || "—",
              <span style={{ color:t.textMt }}>{new Date(r.created_at).toLocaleString()}</span>,
              <div style={{ display:"flex", gap:5 }}>
                <ActionBtn t={t} label="Export" color={t.accent} icon={IC.download}/>
                <ActionBtn t={t} label="Delete" color={t.danger} icon={IC.trash}/>
              </div>,
            ])}
          />
        )}
      </AdminCard>
    </div>
  );
}

/* ── Audit Logs ── */
function ViewAudit({ t }) {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");

  useEffect(() => {
    axios.get(`${API}/api/auth/audit-logs/`, { headers: authHeaders() })
      .then(r => setLogs(r.data))
      .catch(() => setError("Failed to load audit logs."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(log =>
    log.user?.toLowerCase().includes(search.toLowerCase()) ||
    log.action?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SectionHeader t={t} title="Audit Logs" sub="Full accountability trail for all system actions"
       action={
  <ActionBtn
    t={t}
    label="Export Logs"
    color={t.accent}
    icon={IC.download}
    onClick={async () => {

      const token = localStorage.getItem("access_token");

      const res = await fetch(
        "http://127.0.0.1:8000/api/auth/audit-logs/export/",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "audit_logs.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();

    }}
  />
}

      />
      <AdminCard t={t} title="System Audit Trail" sub={`${filtered.length} recorded actions`} icon={IC.audit} iconColor={t.purple}>
        <div style={{ marginBottom:14 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by user or action..."
            style={{ padding:"8px 13px", background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:"8px", fontSize:"12px", color:t.text, outline:"none", fontFamily:"'DM Sans',sans-serif", width:"240px" }}
          />
        </div>
        {loading ? <LoadingRows t={t}/> : error ? <ErrorMsg t={t} msg={error}/> : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:30, color:t.textMt, fontStyle:"italic", fontSize:13 }}>No logs found</div>
        ) : (
          <AdminTable t={t}
            headers={["User","Action","IP Address","Timestamp","Details"]}
            rows={filtered.map(a => [
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:t.text }}>{a.user || "—"}</span>,
              <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", background:`${t.accent}15`, border:`1px solid ${t.accent}33`, borderRadius:20, fontSize:11, fontWeight:700, color:t.accent, fontFamily:"'Syne',sans-serif", whiteSpace:"nowrap" }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:t.accent, display:"inline-block" }}/>
                {a.action || "—"}
              </span>,
              <span style={{ fontFamily:"monospace", fontSize:11, color:t.textSub }}>{a.ip_address || "—"}</span>,
              <span style={{ color:t.textMt }}>{new Date(a.timestamp).toLocaleString("en-US", { month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" })}</span>,
              <span style={{ color:t.textSub, fontStyle:"italic" }}>{a.details || "—"}</span>,
            ])}
          />
        )}
      </AdminCard>
    </div>
  );
}

/* ── Settings ── */
function ViewSettings({ t }) {
  const [alertThreshold, setAlertThreshold] = useState("0.75");
  const [deadline, setDeadline]             = useState("18:30");
  const [retention, setRetention]           = useState("90");
  const [emailNotif, setEmailNotif]         = useState(true);
  const [smsNotif, setSmsNotif]             = useState(false);
  const [autoBackup, setAutoBackup]         = useState(true);
  const [saved, setSaved]                   = useState(false);

  const Toggle = ({ val, set }) => (
    <div onClick={() => set(v => !v)}
      style={{ width:40, height:22, borderRadius:11, background:val?t.accent:t.inputBg, border:`1px solid ${val?t.accent:t.border}`, cursor:"pointer", position:"relative", transition:"all .22s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:2, left:val?"20px":"2px", width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left .22s", boxShadow:"0 1px 4px rgba(0,0,0,.25)" }}/>
    </div>
  );

  const Field = ({ label, value, set, type="text", unit }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:`1px solid ${t.border}33` }}>
      <span style={{ fontSize:13, color:t.text, fontWeight:500 }}>{label}</span>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <input type={type} value={value} onChange={e => set(e.target.value)}
          style={{ width:90, padding:"5px 9px", background:t.inputBg, border:`1px solid ${t.inputBd}`, borderRadius:8, fontSize:12, color:t.text, outline:"none", fontFamily:"'DM Sans',sans-serif", textAlign:"right" }}/>
        {unit && <span style={{ fontSize:11, color:t.textMt }}>{unit}</span>}
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SectionHeader t={t} title="System Settings" sub="Configure global CIMS behaviour and thresholds"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, alignItems:"start" }}>
        <AdminCard t={t} title="Risk & Alert Configuration" icon={IC.shield} iconColor={t.danger}>
          <Field label="Critical Risk Threshold" value={alertThreshold} set={setAlertThreshold} unit="(0–1)"/>
          <Field label="Reporting Deadline"       value={deadline}       set={setDeadline}       unit="daily"/>
          <Field label="Data Retention Period"    value={retention}      set={setRetention}      unit="days"/>
        </AdminCard>
        <AdminCard t={t} title="Notification Settings" icon={IC.bell} iconColor={t.warning}>
          {[
            { label:"Email Alerts", sub:"Send risk alerts via email",       val:emailNotif, set:setEmailNotif },
            { label:"SMS Alerts",   sub:"Critical alerts via SMS gateway",  val:smsNotif,   set:setSmsNotif   },
            { label:"Auto Backup",  sub:"Daily automated database backup",  val:autoBackup, set:setAutoBackup },
          ].map(item => (
            <div key={item.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:"12px 0", borderBottom:`1px solid ${t.border}33` }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:t.text }}>{item.label}</div>
                <div style={{ fontSize:11, color:t.textSub }}>{item.sub}</div>
              </div>
              <Toggle val={item.val} set={item.set}/>
            </div>
          ))}
        </AdminCard>
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
          style={{ padding:"10px 24px", background:t.accent, border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:700, fontFamily:"'Syne',sans-serif", cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}>
          {saved ? <><Ico d={IC.check} size={14} color="#fff"/> Saved!</> : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

/* ── Profile ── */
function ViewProfile({ t, dark, setDark, onLogout }) {
  const [editing, setEditing] = useState(false);
  const [name,    setName]    = useState("System Administrator");
  const [email,   setEmail]   = useState("admin@cims.go.ke");
  const [phone,   setPhone]   = useState("+254 700 000 001");
  const [saved,   setSaved]   = useState(false);

  const save = () => { setSaved(true); setEditing(false); setTimeout(() => setSaved(false), 2500); };

  const FieldRow = ({ icon, label, value, set, editable }) => (
    <div style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 0", borderBottom:`1px solid ${t.border}33` }}>
      <div style={{ width:34, height:34, borderRadius:9, background:`${t.accent}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Ico d={icon} size={15} color={t.accent}/>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:10, color:t.textMt, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:2 }}>{label}</div>
        {editing && editable
          ? <input value={value} onChange={e => set(e.target.value)} style={{ width:"100%", background:t.inputBg, border:`1px solid ${t.inputBd}`, borderRadius:7, padding:"5px 9px", fontSize:13, color:t.text, outline:"none", fontFamily:"'DM Sans',sans-serif" }}/>
          : <div style={{ fontSize:13, fontWeight:600, color:t.text }}>{value}</div>
        }
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SectionHeader t={t} title="My Profile" sub="Manage your account details and preferences"/>
      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:16, alignItems:"start" }}>
        <AdminCard t={t}>
          <div style={{ textAlign:"center", padding:"10px 0 6px" }}>
            <div style={{ width:76, height:76, borderRadius:"50%", background:`linear-gradient(135deg,${t.accent},${t.accentDk})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:28, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif", boxShadow:`0 8px 24px ${t.accent}44` }}>A</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:t.text }}>{name}</div>
            <div style={{ fontSize:11, color:t.textSub, marginTop:3 }}>{email}</div>
            <div style={{ marginTop:10 }}><StatusBadge label="SYSADMIN" color="#A855F7"/></div>
            <div style={{ marginTop:12, display:"inline-flex", alignItems:"center", gap:5, background:`${t.success}15`, border:`1px solid ${t.success}33`, borderRadius:20, padding:"3px 10px" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:t.success, display:"inline-block" }}/>
              <span style={{ fontSize:10, color:t.success, fontWeight:700 }}>Active Session</span>
            </div>
          </div>
          <div style={{ marginTop:16, paddingTop:14, borderTop:`1px solid ${t.border}`, display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Ico d={dark ? IC.sun : IC.moon} size={15} color={t.accent}/>
                <span style={{ fontSize:12, color:t.textSub }}>{dark ? "Light Mode" : "Dark Mode"}</span>
              </div>
              <div onClick={() => setDark(d => !d)}
                style={{ width:38, height:21, borderRadius:11, background:dark?t.accent:t.inputBg, border:`1px solid ${dark?t.accent:t.border}`, cursor:"pointer", position:"relative", transition:"all .22s" }}>
                <div style={{ position:"absolute", top:2, left:dark?"18px":"2px", width:17, height:17, borderRadius:"50%", background:"#fff", transition:"left .22s" }}/>
              </div>
            </div>
            <button onClick={onLogout}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", width:"100%", background:`${t.danger}0d`, border:`1px solid ${t.danger}25`, borderRadius:9, cursor:"pointer", color:t.danger, fontSize:13, fontWeight:700, fontFamily:"'DM Sans',sans-serif", marginTop:4 }}>
              <Ico d={IC.logout} size={15} color={t.danger}/> Sign Out
            </button>
          </div>
        </AdminCard>
        <AdminCard t={t} title="Account Details" sub="Update your profile information" icon={IC.profile} iconColor={t.accent}>
          <FieldRow icon={IC.profile}  label="Full Name"  value={name}  set={setName}  editable/>
          <FieldRow icon={IC.mail}     label="Email"      value={email} set={setEmail} editable/>
          <FieldRow icon={IC.phone}    label="Phone"      value={phone} set={setPhone} editable/>
          <FieldRow icon={IC.shield}   label="Role"       value="System Administrator" editable={false}/>
          <FieldRow icon={IC.calendar} label="Last Login" value="Today, 08:15 AM"      editable={false}/>
          <FieldRow icon={IC.server}   label="Session ID" value="sess_8f2d91a3"         editable={false}/>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:16 }}>
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} style={{ padding:"8px 18px", background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:9, fontSize:12, color:t.textSub, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
                <button onClick={save} style={{ padding:"8px 18px", background:t.accent, border:"none", borderRadius:9, fontSize:12, color:"#fff", fontWeight:700, cursor:"pointer", fontFamily:"'Syne',sans-serif" }}>
                  {saved ? "✓ Saved" : "Save Changes"}
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 18px", background:`${t.accent}15`, border:`1px solid ${t.accent}30`, borderRadius:9, fontSize:12, color:t.accent, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                <Ico d={IC.edit} size={13} color={t.accent}/> Edit Profile
              </button>
            )}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════════ */
const NAV = [
  { id:"dashboard",  label:"Dashboard",         icon:IC.dashboard  },
  { id:"clinics",    label:"Clinic Management", icon:IC.clinic     },
  { id:"users",      label:"User Management",   icon:IC.users      },
  { id:"kpi",        label:"KPI Configuration", icon:IC.kpi        },
  { id:"monitor",    label:"System Monitoring", icon:IC.monitor    },
  { id:"governance", label:"Data Governance",   icon:IC.governance },
  { id:"audit",      label:"Audit Logs",        icon:IC.audit      },
  { id:"settings",   label:"Settings",          icon:IC.settings   },
];

function Sidebar({ t, active, setActive, dark, setDark, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const W = collapsed ? 60 : 230;

  const IconSlot = ({ d, color }) => (
    <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:36, height:36, flexShrink:0 }}>
      <Ico d={d} size={17} color={color}/>
    </span>
  );

  return (
    <aside style={{ width:W, minWidth:W, background:t.sidebarBg, borderRight:`1px solid ${t.border}22`, display:"flex", flexDirection:"column", padding:"14px 0", transition:"width .24s cubic-bezier(.4,0,.2,1), min-width .24s cubic-bezier(.4,0,.2,1)", overflowX:"hidden", position:"relative", zIndex:50, flexShrink:0 }}>

      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:16, paddingBottom:14, borderBottom:`1px solid ${t.border}22` }}>
        <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:60, height:36, flexShrink:0 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 1500 1500" preserveAspectRatio="xMidYMid meet">
            <defs>
              <clipPath id="sc1"><path d="M185 225L677 225L677 1268L185 1268Z"/></clipPath>
              <clipPath id="sc2"><path d="M536 571L899 571L899 933L536 933Z"/></clipPath>
              <clipPath id="sc3"><path d="M536 559L899 559L899 922L536 922Z"/></clipPath>
            </defs>
            <g clipPath="url(#sc1)"><path fill="#0097b2" d="M551 714L676 787L676 289L566 225L450 292L450 426L419 444L419 310L317 369L317 511L435 578L551 512L551 386L582 368L582 530L450 606L450 739L419 757L419 606L304 539L185 607L185 722L317 646L317 682L185 758L185 888L304 956L402 900L309 846L309 810L582 968L582 1154L551 1136L551 986L433 918L317 985L317 1122L419 1181L419 1027L450 1045L450 1199L569 1268L676 1205L676 823L551 750Z"/></g>
            <path fill="#0097b2" d="M775 763L997 763C1004 791 1030 812 1061 812C1098 812 1127 783 1127 746C1127 710 1098 680 1061 680C1030 680 1004 702 997 730L775 730Z"/>
            <g clipPath="url(#sc2)"><path fill="#0097b2" d="M899 752C899 652 817 571 717 571C618 571 536 652 536 752C536 852 618 933 717 933C817 933 899 852 899 752Z"/></g>
            <g clipPath="url(#sc3)"><path fill="#000" d="M899 741C899 641 817 560 717 560C618 560 536 641 536 741C536 840 618 922 717 922C817 922 899 840 899 741Z"/></g>
            <path fill="#0097b2" d="M717 904C627 904 554 831 554 741C554 650 627 577 717 577C808 577 881 650 881 741C881 831 808 904 717 904Z"/>
            <path fill="#0097b2" d="M795 760C795 764 791 768 787 768L745 768L745 810C745 815 741 818 737 818L698 818C694 818 690 815 690 810L690 768L648 768C644 768 640 764 640 760L640 721C640 717 644 713 648 713L690 713L690 671C690 667 694 663 698 663L737 663C741 663 745 667 745 671L745 713L787 713C791 713 795 717 795 721Z"/>
          </svg>
        </span>
        {!collapsed && (
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:"#EFF6FF", letterSpacing:"1.5px" }}>CMS</div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", letterSpacing:"0.4px" }}>Admin Console</div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(c => !c)}
        style={{ position:"absolute", top:20, right:-11, width:22, height:22, borderRadius:"50%", background:t.sidebarBg, border:`1px solid ${t.border}44`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", zIndex:60, padding:0 }}>
        <Ico d={collapsed ? IC.chevR : IC.chevL} size={10} color="rgba(255,255,255,0.3)"/>
      </button>

      {!collapsed && (
        <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.22)", letterSpacing:"1.4px", textTransform:"uppercase", fontFamily:"'Syne',sans-serif", padding:"0 0 6px 14px" }}>Main Menu</div>
      )}

      <nav style={{ display:"flex", flexDirection:"column", gap:2, flex:1, paddingRight:8 }}>
        {NAV.map(item => {
          const isAct = active === item.id;
          const ic    = isAct ? t.accent : "rgba(255,255,255,0.38)";
          return (
            <button key={item.id} onClick={() => setActive(item.id)} title={collapsed ? item.label : ""}
              style={{ display:"flex", alignItems:"center", gap:0, width:"100%", padding:"2px 0", background:isAct?`${t.accent}18`:"transparent", border:"none", borderLeft:isAct?`3px solid ${t.accent}`:"3px solid transparent", borderRadius:"0 10px 10px 0", cursor:"pointer", outline:"none", transition:"background .13s" }}
              onMouseEnter={e => { if (!isAct) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { if (!isAct) e.currentTarget.style.background = "transparent"; }}>
              <IconSlot d={item.icon} color={ic}/>
              {!collapsed && <span style={{ fontSize:12, fontWeight:isAct?700:400, color:isAct?t.accent:"rgba(255,255,255,0.55)", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", flex:1, textAlign:"left" }}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop:`1px solid rgba(255,255,255,0.07)`, marginTop:12, paddingTop:10, paddingRight:8, display:"flex", flexDirection:"column", gap:2 }}>
        <button onClick={() => setActive("profile")} title="Profile"
          style={{ display:"flex", alignItems:"center", gap:0, width:"100%", padding:"2px 0", background:active==="profile"?`${t.accent}18`:"transparent", border:"none", borderLeft:active==="profile"?`3px solid ${t.accent}`:"3px solid transparent", borderRadius:"0 10px 10px 0", cursor:"pointer", outline:"none", transition:"background .13s" }}
          onMouseEnter={e => { if (active!=="profile") e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          onMouseLeave={e => { if (active!=="profile") e.currentTarget.style.background = "transparent"; }}>
          <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:36, height:36, flexShrink:0 }}>
            <div style={{ width:26, height:26, borderRadius:"50%", background:`linear-gradient(135deg,${t.accent},${t.accentDk})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif" }}>A</div>
          </span>
          {!collapsed && (
            <div style={{ flex:1, textAlign:"left" }}>
              <div style={{ fontSize:12, fontWeight:700, color:active==="profile"?t.accent:"rgba(255,255,255,0.7)", fontFamily:"'DM Sans',sans-serif", lineHeight:1.2 }}>Admin Sys</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)" }}>View Profile</div>
            </div>
          )}
        </button>

        <button onClick={() => setDark(d => !d)} title={collapsed?"Toggle theme":""}
          style={{ display:"flex", alignItems:"center", gap:0, width:"100%", padding:"2px 0", background:"transparent", border:"none", borderLeft:"3px solid transparent", borderRadius:"0 10px 10px 0", cursor:"pointer", outline:"none" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:36, height:36, flexShrink:0 }}>
            <Ico d={dark?IC.sun:IC.moon} size={15} color={t.accent}/>
          </span>
          {!collapsed && <span style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>{dark?"Light Mode":"Dark Mode"}</span>}
        </button>

        <button onClick={onLogout} title="Logout"
          style={{ display:"flex", alignItems:"center", gap:0, width:"100%", padding:"2px 0", background:"rgba(255,77,77,0.08)", border:"none", borderLeft:`3px solid ${t.danger}44`, borderRadius:"0 10px 10px 0", cursor:"pointer", outline:"none" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,77,77,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,77,77,0.08)"}>
          <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:36, height:36, flexShrink:0 }}>
            <Ico d={IC.logout} size={15} color={t.danger}/>
          </span>
          {!collapsed && <span style={{ fontSize:12, fontWeight:700, color:t.danger, fontFamily:"'DM Sans',sans-serif" }}>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HEADER
═══════════════════════════════════════════════════════════════ */
function Header({ t, active, onProfileClick }) {
  const ALL = [...NAV, { id:"profile", label:"My Profile" }];
  const pageTitle = ALL.find(n => n.id === active)?.label || "Dashboard";
  const [showNotif, setShowNotif] = useState(false);

  return (
    <header style={{ display:"flex", alignItems:"center", padding:"0 22px", height:60, background:t.headerBg, borderBottom:`1px solid ${t.border}`, flexShrink:0, boxShadow:t.shadow, position:"sticky", top:0, zIndex:30, gap:14 }}>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:800, color:t.text }}>Clinic Monitoring System</div>
        <div style={{ fontSize:10, color:t.textSub }}>Admin Console · {pageTitle}</div>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", background:`${t.success}12`, border:`1px solid ${t.success}30`, borderRadius:20 }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:t.success, animation:"pulse 2s ease infinite" }}/>
        <span style={{ fontSize:11, color:t.success, fontWeight:700, fontFamily:"'Syne',sans-serif" }}>System Online</span>
      </div>

      <div style={{ position:"relative" }}>
        <button onClick={() => setShowNotif(v => !v)}
          style={{ width:36, height:36, borderRadius:9, background:showNotif?t.accentGl:t.inputBg, border:`1px solid ${showNotif?t.accent:t.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"relative" }}>
          <Ico d={IC.bell} size={16} color={showNotif?t.accent:t.textSub}/>
          <span style={{ position:"absolute", top:7, right:7, width:8, height:8, borderRadius:"50%", background:t.danger, border:`2px solid ${t.headerBg}` }}/>
        </button>
        {showNotif && (
          <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, width:300, background:t.popBg, border:`1px solid ${t.borderSt}`, borderRadius:14, boxShadow:t.popShadow, zIndex:200, overflow:"hidden" }}
            onClick={() => setShowNotif(false)}>
            <div style={{ padding:"12px 16px", borderBottom:`1px solid ${t.border}`, fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:t.text }}>Notifications</div>
            {[
              { msg:"Harbor Clinic report is 3 days late", color:t.danger,  time:"2h ago" },
              { msg:"Email service queue building up",     color:t.warning, time:"4h ago" },
            ].map((n,i) => (
              <div key={i} style={{ display:"flex", gap:10, padding:"12px 16px", borderBottom:`1px solid ${t.border}33`, cursor:"pointer" }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:n.color, flexShrink:0, marginTop:3 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:t.text }}>{n.msg}</div>
                  <div style={{ fontSize:10, color:t.textMt, marginTop:2 }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={onProfileClick}
        style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${t.accent},${t.accentDk})`, border:`2px solid ${active==="profile"?t.accent:t.border}`, cursor:"pointer", fontSize:14, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:active==="profile"?`0 0 0 3px ${t.accent}44`:"none", transition:"box-shadow .2s, border-color .2s" }}>
        A
      </button>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate            = useNavigate();
  const [dark, setDark]     = useState(true);
  const [active, setActive] = useState("dashboard");
  const t = mkT(dark);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setTimeout(() => navigate("/login"), 300);
  }, [navigate]);

  const goTo = useCallback((id) => setActive(id), []);

  const renderView = () => {
    switch (active) {
      case "dashboard":  return <ViewDashboard  t={t}/>;
      case "clinics":    return <ViewClinics    t={t}/>;
      case "users":      return <ViewUsers      t={t}/>;
      case "kpi":        return <ViewKPI        t={t}/>;
      case "monitor":    return <ViewMonitor    t={t}/>;
      case "governance": return <ViewGovernance t={t}/>;
      case "audit":      return <ViewAudit      t={t}/>;
      case "settings":   return <ViewSettings   t={t}/>;
      case "profile":    return <ViewProfile    t={t} dark={dark} setDark={setDark} onLogout={handleLogout}/>;
      default:           return <ViewDashboard  t={t}/>;
    }
  };

  return (
    <div style={{ display:"flex", height:"100vh", background:t.pageBg, fontFamily:"'DM Sans',sans-serif", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(0,174,239,0.2);border-radius:4px;}
        select option{background:#0a1e36;color:#fff;}
        @keyframes pulse{0%,100%{transform:scale(1);opacity:.7;}50%{transform:scale(1.5);opacity:.2;}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      <Sidebar t={t} active={active} setActive={goTo} dark={dark} setDark={setDark} onLogout={handleLogout}/>

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        <Header t={t} active={active} onProfileClick={() => goTo("profile")}/>
        <main key={active} style={{ flex:1, overflowY:"auto", padding:22, animation:"fadeUp .25s ease both" }}>
          {renderView()}
        </main>
      </div>
    </div>
  );
}
