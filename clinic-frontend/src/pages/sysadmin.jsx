import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/* ═══════════════════════════════════════════════════════════════
   THEME ENGINE  (mirrors CNODashboard)
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
  dashboard:   "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  clinic:      "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  users:       "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  kpi:         "M18 20V10M12 20V4M6 20v-6",
  monitor:     "M22 12h-4l-3 9L9 3l-3 9H2",
  governance:  "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  audit:       "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  settings:    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  profile:     "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  bell:        "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  logout:      "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  sun:         "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z",
  moon:        "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  plus:        "M12 5v14M5 12h14",
  edit:        "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:       "M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6",
  key:         "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  check:       "M20 6L9 17l-5-5",
  chevR:       "M9 18l6-6-6-6",
  chevL:       "M15 18l-6-6 6-6",
  download:    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  shield:      "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  mail:        "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  phone:       "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  calendar:    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  activity:    "M22 12h-4l-3 9L9 3l-3 9H2",
  server:      "M2 2h20v8H2zM2 14h20v8H2zM6 6h.01M6 18h.01",
  database:    "M12 2C6.48 2 2 4.24 2 7s4.48 5 10 5 10-2.24 10-5-4.48-5-10-5zM2 7v5c0 2.76 4.48 5 10 5s10-2.24 10-5V7M2 12v5c0 2.76 4.48 5 10 5s10-2.24 10-5v-5",
  cpu:         "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",
  info:        "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 16v-4M12 8h.01",
};

/* ═══════════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════════ */
const CLINICS_DATA = [
  { id:1, name:"City Clinic",   location:"Nairobi CBD",    manager:"Dr. Amina Osei",   status:"Reported",    last:"Apr 1, 2026",  operational:"Active"   },
  { id:2, name:"Ridge Clinic",  location:"Westlands",      manager:"Sr. Jane Mwangi",  status:"Pending",     last:"Mar 31, 2026", operational:"Active"   },
  { id:3, name:"Town Clinic",   location:"Thika Road",     manager:"Dr. Kevin Otieno", status:"Reported",    last:"Apr 1, 2026",  operational:"Active"   },
  { id:4, name:"Harbor Clinic", location:"Mombasa Rd",     manager:"Dr. Faith Njeru",  status:"Late",        last:"Mar 29, 2026", operational:"Active"   },
  { id:5, name:"Valley Clinic", location:"Karen",          manager:"Sr. Peter Kamau",  status:"Reported",    last:"Apr 1, 2026",  operational:"Active"   },
  { id:6, name:"Bay Clinic",    location:"Embakasi",       manager:"Unassigned",       status:"Not Reported",last:"Mar 25, 2026", operational:"Disabled" },
];

const USERS_DATA = [
  { id:1, name:"Dr. Amina Osei",    email:"amina@cims.go.ke",   role:"MANAGER",   clinic:"City Clinic",   status:"Active",   last:"Today, 07:42" },
  { id:2, name:"Sr. Jane Mwangi",   email:"jane@cims.go.ke",    role:"MANAGER",   clinic:"Ridge Clinic",  status:"Active",   last:"Today, 06:30" },
  { id:3, name:"Dr. Kevin Otieno",  email:"kevin@cims.go.ke",   role:"MANAGER",   clinic:"Town Clinic",   status:"Active",   last:"Yesterday"    },
  { id:4, name:"Dr. Faith Njeru",   email:"faith@cims.go.ke",   role:"CNO",       clinic:"All Clinics",   status:"Active",   last:"Today, 08:01" },
  { id:5, name:"Admin Sys",         email:"admin@cims.go.ke",   role:"SYSADMIN",  clinic:"System",        status:"Active",   last:"Today, 08:15" },
  { id:6, name:"Sr. Peter Kamau",   email:"peter@cims.go.ke",   role:"MANAGER",   clinic:"Valley Clinic", status:"Inactive", last:"3 days ago"   },
];

const KPI_DATA = [
  { id:1, name:"Patient Load",       desc:"Total daily patient volume",           threshold:"350",  weight:"0.18", status:"Active"   },
  { id:2, name:"Emergency Cases",    desc:"Daily emergency case count",           threshold:"40",   weight:"0.22", status:"Active"   },
  { id:3, name:"Staff Absenteeism",  desc:"% of staff absent per shift",          threshold:"25%",  weight:"0.20", status:"Active"   },
  { id:4, name:"Treatment Delays",   desc:"Avg delay in minutes before treatment",threshold:"30min",weight:"0.15", status:"Active"   },
  { id:5, name:"Bed Occupancy",      desc:"% of beds in use",                     threshold:"85%",  weight:"0.12", status:"Active"   },
  { id:6, name:"Drug Inventory",     desc:"Critical drug stock level",            threshold:"<20%", weight:"0.08", status:"Active"   },
  { id:7, name:"ICU Pressure",       desc:"ICU beds occupied vs total",           threshold:"90%",  weight:"0.05", status:"Inactive" },
];

const REPORTS_DATA = [
  { id:1, clinic:"City Clinic",   date:"Apr 1, 2026",  by:"Dr. Amina Osei",   status:"Valid"   },
  { id:2, clinic:"Town Clinic",   date:"Apr 1, 2026",  by:"Dr. Kevin Otieno", status:"Valid"   },
  { id:3, clinic:"Ridge Clinic",  date:"Mar 31, 2026", by:"Sr. Jane Mwangi",  status:"Flagged" },
  { id:4, clinic:"Harbor Clinic", date:"Mar 29, 2026", by:"Dr. Faith Njeru",  status:"Invalid" },
  { id:5, clinic:"Valley Clinic", date:"Apr 1, 2026",  by:"Sr. Peter Kamau",  status:"Valid"   },
];

const AUDIT_DATA = [
  { id:1, user:"Admin Sys",       action:"Created new clinic",          module:"Clinic Mgmt",  time:"Today 08:10", record:"Bay Clinic"        },
  { id:2, user:"Dr. Faith Njeru", action:"Submitted daily report",      module:"Reporting",    time:"Today 07:55", record:"City Clinic Apr 1" },
  { id:3, user:"Admin Sys",       action:"Updated KPI threshold",       module:"KPI Config",   time:"Today 07:30", record:"Emergency Cases"   },
  { id:4, user:"Admin Sys",       action:"Disabled user account",       module:"User Mgmt",    time:"Yesterday",   record:"Sr. Peter Kamau"   },
  { id:5, user:"Sr. Jane Mwangi", action:"Submitted daily report",      module:"Reporting",    time:"Yesterday",   record:"Ridge Clinic Mar 31"},
  { id:6, user:"Admin Sys",       action:"Reset user password",         module:"User Mgmt",    time:"2 days ago",  record:"Dr. Kevin Otieno"  },
];

const SYS_METRICS = [
  { label:"Database",          status:"Online",      color:"#00C48C", extra:"PostgreSQL 15.2"  },
  { label:"API Server",        status:"Operational", color:"#00C48C", extra:"v2.4.1 · 142ms"  },
  { label:"ML Model (EBM)",    status:"Operational", color:"#00C48C", extra:"Last run: 07:00"  },
  { label:"File Storage",      status:"Online",      color:"#00C48C", extra:"68% used"         },
  { label:"Email Service",     status:"Warning",     color:"#FFB020", extra:"Queue: 12 pending" },
  { label:"Backup Service",    status:"Online",      color:"#00C48C", extra:"Last: 03:00 AM"   },
];

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
  const v = (val||"").toLowerCase();
  if (["active","online","operational","valid","reported"].includes(v))   return "#00C48C";
  if (["pending","warning","flagged","inactive"].includes(v))             return "#FFB020";
  if (["disabled","invalid","late","not reported","offline"].includes(v)) return "#FF4D4D";
  return "#00AEEF";
};

const roleColor = (role) => {
  if (role === "SYSADMIN") return "#A855F7";
  if (role === "CNO")      return "#00AEEF";
  return "#00C48C";
};

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
              onMouseEnter={e => e.currentTarget.style.background = t.accentGl || `${t.accent}0a`}
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
   VIEWS / PAGES
═══════════════════════════════════════════════════════════════ */

/* ── Dashboard Overview ── */
function ViewDashboard({ t }) {
  const stats = [
    { label:"Total Clinics",          value:6,    sub:"Registered facilities",     color:t.accent,   icon:IC.clinic    },
    { label:"Active Clinics",         value:5,    sub:"Reporting this cycle",       color:t.success,  icon:IC.check     },
    { label:"Registered Users",       value:6,    sub:"Across all roles",           color:t.purple,   icon:IC.users     },
    { label:"Reports Today",          value:4,    sub:"Of 5 expected",              color:t.success,  icon:IC.audit     },
    { label:"Pending Reports",        value:1,    sub:"Due before 17:00",           color:t.warning,  icon:IC.calendar  },
    { label:"System Alerts",          value:2,    sub:"Require admin attention",    color:t.danger,   icon:IC.bell      },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SectionHeader t={t} title="System Overview" sub="Live snapshot of CIMS infrastructure and reporting status"/>
      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12 }}>
        {stats.map(s => <StatCard key={s.label} t={t} {...s}/>)}
      </div>
      {/* System health */}
      <AdminCard t={t} title="System Health" sub="Real-time infrastructure status" icon={IC.monitor} iconColor={t.accent}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:10 }}>
          {SYS_METRICS.map(m => (
            <div key={m.label} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:t.rowBg, border:`1px solid ${t.border}`, borderRadius:9 }}>
              <span style={{ width:9, height:9, borderRadius:"50%", background:m.color, flexShrink:0, boxShadow:`0 0 6px ${m.color}66` }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:600, color:t.text }}>{m.label}</div>
                <div style={{ fontSize:10, color:t.textMt }}>{m.extra}</div>
              </div>
              <StatusBadge label={m.status} color={m.color}/>
            </div>
          ))}
        </div>
      </AdminCard>
      {/* Recent audit */}
      <AdminCard t={t} title="Recent Activity" sub="Last 5 system actions" icon={IC.audit} iconColor={t.purple}>
        <AdminTable t={t}
          headers={["User","Action","Module","Time"]}
          rows={AUDIT_DATA.slice(0,5).map(a => [
            <span style={{ fontWeight:600, color:t.text }}>{a.user}</span>,
            a.action, a.module,
            <span style={{ color:t.textMt }}>{a.time}</span>,
          ])}
        />
      </AdminCard>
    </div>
  );
}

/* ── Clinic Management ── */
function ViewClinics({ t }) {
  const [showModal, setShowModal] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SectionHeader t={t} title="Clinic Management" sub={`${CLINICS_DATA.length} registered satellite facilities`}
        action={<ActionBtn t={t} label="+ Add Clinic" color={t.accent} onClick={() => setShowModal(true)} icon={IC.plus}/>}
      />
      {showModal && (
        <div style={{ background:`${t.accent}10`, border:`1px solid ${t.accent}33`, borderRadius:12, padding:"16px 18px", fontSize:13, color:t.accent, fontWeight:600 }}>
          ℹ Add Clinic form would open here (modal/drawer). <button onClick={() => setShowModal(false)} style={{ marginLeft:12, background:"none", border:"none", color:t.danger, cursor:"pointer", fontWeight:700, fontSize:12 }}>Dismiss</button>
        </div>
      )}
      <AdminCard t={t} title="Registered Clinics" sub="All satellite clinics in the CIMS network" icon={IC.clinic} iconColor={t.accent}>
        <AdminTable t={t}
          headers={["Clinic","Location","Assigned Manager","Reporting","Last Report","Status","Actions"]}
          rows={CLINICS_DATA.map(c => [
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:t.text }}>{c.name}</span>,
            c.location, c.manager,
            <StatusBadge label={c.status} color={badgeColor(c.status)}/>,
            <span style={{ color:t.textMt }}>{c.last}</span>,
            <StatusBadge label={c.operational} color={badgeColor(c.operational)}/>,
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              <ActionBtn t={t} label="Edit"    color={t.accent}   icon={IC.edit}/>
              <ActionBtn t={t} label="Assign"  color={t.purple}   icon={IC.users}/>
              <ActionBtn t={t} label="Disable" color={t.danger}   icon={IC.trash}/>
            </div>,
          ])}
        />
      </AdminCard>
    </div>
  );
}

/* ── User Management ── */
function ViewUsers({ t }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SectionHeader t={t} title="User Management" sub={`${USERS_DATA.length} system accounts`}
        action={<ActionBtn t={t} label="+ Create User" color={t.accent} icon={IC.plus}/>}
      />
      <AdminCard t={t} title="System Users" sub="All CNO, Manager and Admin accounts" icon={IC.users} iconColor={t.purple}>
        <AdminTable t={t}
          headers={["Name","Email","Role","Clinic","Status","Last Login","Actions"]}
          rows={USERS_DATA.map(u => [
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:t.text }}>{u.name}</span>,
            <span style={{ color:t.textMt }}>{u.email}</span>,
            <StatusBadge label={u.role} color={roleColor(u.role)}/>,
            u.clinic,
            <StatusBadge label={u.status} color={badgeColor(u.status)}/>,
            <span style={{ color:t.textMt }}>{u.last}</span>,
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              <ActionBtn t={t} label="Edit"     color={t.accent}  icon={IC.edit}/>
              <ActionBtn t={t} label="Reset Pwd" color={t.warning} icon={IC.key}/>
              <ActionBtn t={t} label="Disable"  color={t.danger}  icon={IC.trash}/>
            </div>,
          ])}
        />
      </AdminCard>
    </div>
  );
}

/* ── KPI Configuration ── */
function ViewKPI({ t }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SectionHeader t={t} title="KPI Configuration" sub="Manage the indicators that feed the EBM risk model"
        action={<ActionBtn t={t} label="+ Add KPI" color={t.accent} icon={IC.plus}/>}
      />
      <AdminCard t={t} title="Risk Indicators" sub="All KPIs weighted for the ML instability model" icon={IC.kpi} iconColor={t.warning}>
        <AdminTable t={t}
          headers={["KPI Name","Description","Risk Threshold","Model Weight","Status","Actions"]}
          rows={KPI_DATA.map(k => [
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:t.text }}>{k.name}</span>,
            <span style={{ color:t.textMt, maxWidth:220, display:"block" }}>{k.desc}</span>,
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:t.danger }}>{k.threshold}</span>,
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:t.accent }}>{k.weight}</span>,
            <StatusBadge label={k.status} color={badgeColor(k.status)}/>,
            <div style={{ display:"flex", gap:5 }}>
              <ActionBtn t={t} label="Edit"    color={t.accent} icon={IC.edit}/>
              <ActionBtn t={t} label="Remove"  color={t.danger} icon={IC.trash}/>
            </div>,
          ])}
        />
      </AdminCard>
      {/* Weights summary */}
      <AdminCard t={t} title="Weight Distribution" sub="Model contribution per KPI" icon={IC.activity} iconColor={t.accent}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {KPI_DATA.filter(k => k.status === "Active").map(k => {
            const pct = Math.round(parseFloat(k.weight) * 100);
            return (
              <div key={k.id}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:t.textSub, marginBottom:4 }}>
                  <span style={{ fontWeight:600 }}>{k.name}</span>
                  <span style={{ color:t.accent, fontWeight:700, fontFamily:"'Syne',sans-serif" }}>{pct}%</span>
                </div>
                <div style={{ height:5, background:t.inputBg, borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct * 5}%`, background:`linear-gradient(90deg,${t.accent}88,${t.accent})`, borderRadius:3 }}/>
                </div>
              </div>
            );
          })}
        </div>
      </AdminCard>
    </div>
  );
}

/* ── System Monitoring ── */
function ViewMonitor({ t }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SectionHeader t={t} title="System Monitoring" sub="Infrastructure and service health"/>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
        {SYS_METRICS.map((m,i) => (
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
      {/* Response time card */}
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
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SectionHeader t={t} title="Data Governance" sub="Validate, manage and export submitted clinic reports"
        action={<ActionBtn t={t} label="Export Dataset" color={t.success} icon={IC.download}/>}
      />
      <AdminCard t={t} title="Report Log" sub="Submitted clinic reports and validation status" icon={IC.governance} iconColor={t.success}>
        <AdminTable t={t}
          headers={["Clinic","Report Date","Submitted By","Validation Status","Actions"]}
          rows={REPORTS_DATA.map(r => [
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:t.text }}>{r.clinic}</span>,
            r.date,
            r.by,
            <StatusBadge label={r.status} color={badgeColor(r.status)}/>,
            <div style={{ display:"flex", gap:5 }}>
              <ActionBtn t={t} label="Validate" color={t.success} icon={IC.check}/>
              <ActionBtn t={t} label="Delete"   color={t.danger}  icon={IC.trash}/>
              <ActionBtn t={t} label="Export"   color={t.accent}  icon={IC.download}/>
            </div>,
          ])}
        />
      </AdminCard>
    </div>
  );
}

/* ── Audit Logs ── */
function ViewAudit({ t }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <SectionHeader t={t} title="Audit Logs" sub="Full accountability trail for all system actions"
        action={<ActionBtn t={t} label="Export Logs" color={t.accent} icon={IC.download}/>}
      />
      <AdminCard t={t} title="System Audit Trail" sub={`${AUDIT_DATA.length} recorded actions`} icon={IC.audit} iconColor={t.purple}>
        <AdminTable t={t}
          headers={["User","Action","Module","Timestamp","Affected Record"]}
          rows={AUDIT_DATA.map(a => [
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:t.text }}>{a.user}</span>,
            a.action,
            <span style={{ background:`${t.purple}15`, border:`1px solid ${t.purple}33`, borderRadius:6, padding:"2px 8px", fontSize:10, color:t.purple, fontWeight:600 }}>{a.module}</span>,
            <span style={{ color:t.textMt }}>{a.time}</span>,
            <span style={{ color:t.textSub, fontStyle:"italic" }}>{a.record}</span>,
          ])}
        />
      </AdminCard>
    </div>
  );
}

/* ── Settings ── */
function ViewSettings({ t }) {
  const [alertThreshold, setAlertThreshold] = useState("0.75");
  const [deadline, setDeadline]             = useState("17:00");
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
        {/* Thresholds */}
        <AdminCard t={t} title="Risk & Alert Configuration" icon={IC.shield} iconColor={t.danger}>
          <Field label="Critical Risk Threshold"  value={alertThreshold} set={setAlertThreshold} unit="(0–1)"/>
          <Field label="Reporting Deadline"        value={deadline}        set={setDeadline}        unit="daily"/>
          <Field label="Data Retention Period"     value={retention}       set={setRetention}        unit="days"/>
        </AdminCard>

        {/* Notifications */}
        <AdminCard t={t} title="Notification Settings" icon={IC.bell} iconColor={t.warning}>
          {[
            { label:"Email Alerts",   sub:"Send risk alerts via email",        val:emailNotif, set:setEmailNotif },
            { label:"SMS Alerts",     sub:"Critical alerts via SMS gateway",   val:smsNotif,   set:setSmsNotif   },
            { label:"Auto Backup",    sub:"Daily automated database backup",   val:autoBackup, set:setAutoBackup },
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

      {/* Save button */}
      <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
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
  const [email,   setEmail]   = useState("Sajaadiqbalkarim7@gmail.com");
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
        {/* Avatar card */}
        <AdminCard t={t}>
          <div style={{ textAlign:"center", padding:"10px 0 6px" }}>
            <div style={{ width:76, height:76, borderRadius:"50%", background:`linear-gradient(135deg,${t.accent},${t.accentDk})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:28, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif", boxShadow:`0 8px 24px ${t.accent}44` }}>A</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:t.text }}>{name}</div>
            <div style={{ fontSize:11, color:t.textSub, marginTop:3 }}>{email}</div>
            <div style={{ marginTop:10 }}>
              <StatusBadge label="SYSADMIN" color="#A855F7"/>
            </div>
            <div style={{ marginTop:12, display:"inline-flex", alignItems:"center", gap:5, background:`${t.success}15`, border:`1px solid ${t.success}33`, borderRadius:20, padding:"3px 10px" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:t.success, display:"inline-block" }}/>
              <span style={{ fontSize:10, color:t.success, fontWeight:700 }}>Active Session</span>
            </div>
          </div>

          <div style={{ marginTop:16, paddingTop:14, borderTop:`1px solid ${t.border}`, display:"flex", flexDirection:"column", gap:8 }}>
            {/* Theme toggle */}
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

            {/* Logout */}
            <button onClick={onLogout}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", width:"100%", background:`${t.danger}0d`, border:`1px solid ${t.danger}25`, borderRadius:9, cursor:"pointer", color:t.danger, fontSize:13, fontWeight:700, fontFamily:"'DM Sans',sans-serif", marginTop:4 }}>
              <Ico d={IC.logout} size={15} color={t.danger}/> Sign Out
            </button>
          </div>
        </AdminCard>

        {/* Details card */}
        <AdminCard t={t} title="Account Details" sub="Update your profile information" icon={IC.profile} iconColor={t.accent}>
          <FieldRow icon={IC.profile} label="Full Name"    value={name}  set={setName}  editable/>
          <FieldRow icon={IC.mail}    label="Email"        value={email} set={setEmail} editable/>
          <FieldRow icon={IC.phone}   label="Phone"        value={phone} set={setPhone} editable/>
          <FieldRow icon={IC.shield}  label="Role"         value="System Administrator" editable={false}/>
          <FieldRow icon={IC.calendar}label="Last Login"   value="Today, 08:15 AM"     editable={false}/>
          <FieldRow icon={IC.server}  label="Session ID"   value="sess_8f2d91a3"        editable={false}/>

          <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:16 }}>
            {editing
              ? <>
                  <button onClick={() => setEditing(false)} style={{ padding:"8px 18px", background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:9, fontSize:12, color:t.textSub, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
                  <button onClick={save} style={{ padding:"8px 18px", background:t.accent, border:"none", borderRadius:9, fontSize:12, color:"#fff", fontWeight:700, cursor:"pointer", fontFamily:"'Syne',sans-serif" }}>
                    {saved ? "✓ Saved" : "Save Changes"}
                  </button>
                </>
              : <button onClick={() => setEditing(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 18px", background:`${t.accent}15`, border:`1px solid ${t.accent}30`, borderRadius:9, fontSize:12, color:t.accent, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  <Ico d={IC.edit} size={13} color={t.accent}/> Edit Profile
                </button>
            }
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
  { id:"dashboard",   label:"Dashboard",          icon:IC.dashboard  },
  { id:"clinics",     label:"Clinic Management",  icon:IC.clinic     },
  { id:"users",       label:"User Management",    icon:IC.users      },
  { id:"kpi",         label:"KPI Configuration",  icon:IC.kpi        },
  { id:"monitor",     label:"System Monitoring",  icon:IC.monitor    },
  { id:"governance",  label:"Data Governance",    icon:IC.governance },
  { id:"audit",       label:"Audit Logs",         icon:IC.audit      },
  { id:"settings",    label:"Settings",           icon:IC.settings   },
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
            <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1500 1500"
    preserveAspectRatio="xMidYMid meet"
    style={{ display: "block" }}
  >
    <defs>
      <clipPath id="cims_clip_1">
        <path d="M 185.167969 225 L 677 225 L 677 1268 L 185.167969 1268 Z" />
      </clipPath>
      <clipPath id="cims_clip_2">
        <path d="M 536.332031 571 L 898.582031 571 L 898.582031 932.957031 L 536.332031 932.957031 Z" />
      </clipPath>
      <clipPath id="cims_clip_3">
        <path d="M 536.332031 559.457031 L 898.582031 559.457031 L 898.582031 922 L 536.332031 922 Z" />
      </clipPath>
    </defs>

    <g clipPath="url(#cims_clip_1)">
      <path
        fill="#0097b2"
        d="M 550.917969 714.304688 L 676.46875 786.933594 L 676.46875 289.117188 L 565.734375 225.121094 L 450.117188 291.722656 L 450.117188 425.90625 L 418.851562 443.984375 L 418.851562 309.796875 L 316.910156 368.75 L 316.910156 510.585938 L 434.808594 578.492188 L 550.589844 511.5625 L 550.589844 386.171875 L 581.859375 368.097656 L 581.859375 529.636719 L 450.117188 605.6875 L 450.117188 739.058594 L 418.851562 757.132812 L 418.851562 605.523438 L 303.71875 538.921875 L 185.167969 607.316406 L 185.167969 722.285156 L 316.910156 646.234375 L 316.910156 682.386719 L 185.167969 758.433594 L 185.167969 888.058594 L 303.71875 956.453125 L 401.589844 899.945312 L 308.765625 846.207031 L 308.765625 810.21875 L 581.859375 967.851562 L 581.859375 1153.820312 L 550.589844 1135.746094 L 550.589844 985.929688 L 432.855469 918.023438 L 316.910156 984.953125 L 316.910156 1122.394531 L 418.851562 1181.179688 L 418.851562 1027.292969 L 450.117188 1045.367188 L 450.117188 1199.253906 L 568.503906 1267.648438 L 676.46875 1205.28125 L 676.46875 823.085938 L 550.917969 750.457031 Z"
        fillRule="evenodd"
      />
    </g>

    <path
      fill="#000"
      d="M 708.714844 327.875 L 708.714844 1201.859375 L 740.792969 1220.585938 L 790.949219 1249.410156 C 782.808594 1277.746094 794.695312 1309.175781 821.402344 1324.484375 C 852.992188 1342.722656 893.214844 1331.972656 911.453125 1300.382812 C 929.53125 1268.953125 918.78125 1228.566406 887.355469 1210.328125 C 860.648438 1195.019531 827.589844 1200.394531 807.070312 1221.566406 L 740.792969 1183.296875 L 740.792969 309.308594 L 807.070312 271.042969 C 827.589844 292.375 860.648438 297.75 887.355469 282.277344 C 918.78125 264.039062 929.53125 223.816406 911.453125 192.226562 C 893.214844 160.796875 852.992188 150.046875 821.402344 168.125 C 794.695312 183.59375 782.808594 214.859375 790.949219 243.195312 L 740.792969 272.179688 L 708.714844 290.746094 Z"
      fillRule="evenodd"
    />

    <path
      fill="#000"
      d="M 854.949219 569.859375 L 775.480469 569.859375 L 775.480469 601.941406 L 868.300781 601.941406 L 900.542969 569.859375 L 939.953125 530.453125 L 1112.40625 530.453125 L 1185.847656 603.894531 C 1170.703125 629.136719 1173.960938 662.519531 1195.78125 684.339844 C 1221.511719 710.070312 1263.363281 710.070312 1289.089844 684.339844 C 1314.820312 658.613281 1314.820312 616.921875 1289.089844 591.195312 C 1267.269531 569.371094 1233.886719 565.953125 1208.644531 581.097656 L 1157.839844 530.453125 L 1125.757812 498.210938 L 926.597656 498.210938 L 894.519531 530.453125 Z"
      fillRule="evenodd"
    />

    <path
      fill="#0097b2"
      d="M 775.480469 438.933594 L 818.144531 438.933594 L 850.226562 406.855469 L 888.167969 368.910156 L 939.464844 368.910156 C 946.792969 397.570312 972.683594 418.742188 1003.460938 418.742188 C 1039.777344 418.742188 1069.414062 389.265625 1069.414062 352.789062 C 1069.414062 316.476562 1039.777344 287 1003.460938 287 C 972.683594 287 946.792969 308.171875 939.464844 336.667969 L 874.816406 336.667969 L 842.570312 368.910156 L 804.792969 406.855469 L 775.480469 406.855469 Z"
      fillRule="evenodd"
    />

    <path
      fill="#000"
      d="M 822.867188 890.664062 L 775.480469 890.664062 L 775.480469 922.90625 L 854.949219 922.90625 L 894.519531 962.316406 L 926.597656 994.398438 L 1125.757812 994.398438 L 1157.839844 962.316406 L 1208.644531 911.507812 C 1233.886719 926.652344 1267.269531 923.398438 1289.089844 901.574219 C 1314.820312 875.847656 1314.820312 834.15625 1289.089844 808.429688 C 1263.363281 782.699219 1221.511719 782.699219 1195.78125 808.429688 C 1173.960938 830.25 1170.703125 863.46875 1185.847656 888.710938 L 1112.40625 962.316406 L 939.953125 962.316406 L 868.300781 890.664062 Z"
      fillRule="evenodd"
    />

    <path
      fill="#0097b2"
      d="M 775.480469 762.507812 L 997.273438 762.507812 C 1004.4375 791.003906 1030.332031 812.175781 1061.109375 812.175781 C 1097.585938 812.175781 1127.0625 782.699219 1127.0625 746.382812 C 1127.0625 709.90625 1097.585938 680.433594 1061.109375 680.433594 C 1030.332031 680.433594 1004.4375 701.601562 997.273438 730.261719 L 775.480469 730.261719 Z"
      fillRule="evenodd"
    />

    <path
      fill="#0097b2"
      d="M 850.226562 1085.914062 L 818.144531 1053.671875 L 775.480469 1053.671875 L 775.480469 1085.914062 L 804.792969 1085.914062 L 842.570312 1123.695312 L 874.816406 1155.9375 L 939.464844 1155.9375 C 946.792969 1184.597656 972.683594 1205.769531 1003.460938 1205.769531 C 1039.777344 1205.769531 1069.414062 1176.292969 1069.414062 1139.816406 C 1069.414062 1103.503906 1039.777344 1074.027344 1003.460938 1074.027344 C 972.683594 1074.027344 946.792969 1095.199219 939.464844 1123.695312 L 888.167969 1123.695312 Z"
      fillRule="evenodd"
    />

    <g clipPath="url(#cims_clip_2)">
      <path
        fill="#0097b2"
        d="M 898.507812 752.183594 C 898.507812 652.328125 817.273438 571.09375 717.421875 571.09375 C 617.566406 571.09375 536.332031 652.328125 536.332031 752.183594 C 536.332031 852.039062 617.566406 933.269531 717.421875 933.269531 C 817.273438 933.269531 898.507812 852.035156 898.507812 752.183594 Z"
      />
    </g>

    <g clipPath="url(#cims_clip_3)">
      <path
        fill="#000"
        d="M 898.507812 740.59375 C 898.507812 640.738281 817.273438 559.503906 717.421875 559.503906 C 617.566406 559.503906 536.332031 640.738281 536.332031 740.59375 C 536.332031 840.445312 617.566406 921.679688 717.421875 921.679688 C 817.273438 921.679688 898.507812 840.445312 898.507812 740.59375 Z"
      />
    </g>

    <path
      fill="#0097b2"
      d="M 717.421875 904.296875 C 627.160156 904.296875 553.722656 830.859375 553.722656 740.59375 C 553.722656 650.332031 627.160156 576.894531 717.421875 576.894531 C 807.6875 576.894531 881.125 650.332031 881.125 740.59375 C 881.125 830.859375 807.6875 904.296875 717.421875 904.296875 Z"
    />

    <path
      fill="#0097b2"
      d="M 717.421875 610.175781 C 645.398438 610.175781 587.007812 668.566406 587.007812 740.597656 C 587.007812 812.625 645.398438 871.015625 717.421875 871.015625 C 789.453125 871.015625 847.839844 812.625 847.839844 740.597656 C 847.839844 668.566406 789.453125 610.175781 717.421875 610.175781 Z"
    />

    <path
      fill="#0097b2"
      d="M 795.019531 759.742188 C 795.019531 764.140625 791.453125 767.707031 787.054688 767.707031 L 744.535156 767.707031 L 744.535156 810.226562 C 744.535156 814.625 740.96875 818.191406 736.570312 818.191406 L 698.273438 818.191406 C 693.878906 818.191406 690.3125 814.625 690.3125 810.226562 L 690.3125 767.707031 L 647.792969 767.707031 C 643.394531 767.707031 639.828125 764.140625 639.828125 759.742188 L 639.828125 721.449219 C 639.828125 717.050781 643.394531 713.484375 647.792969 713.484375 L 690.3125 713.484375 L 690.3125 670.964844 C 690.3125 666.566406 693.878906 663 698.273438 663 L 736.570312 663 C 740.96875 663 744.535156 666.566406 744.535156 670.964844 L 744.535156 713.484375 L 787.054688 713.484375 C 791.453125 713.484375 795.019531 717.050781 795.019531 721.449219 Z"
    />
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

      {/* Section label */}
      {!collapsed && (
        <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.22)", letterSpacing:"1.4px", textTransform:"uppercase", fontFamily:"'Syne',sans-serif", padding:"0 0 6px 14px" }}>Main Menu</div>
      )}

      {/* Nav items */}
      <nav style={{ display:"flex", flexDirection:"column", gap:2, flex:1, paddingRight:8 }}>
        {NAV.map(item => {
          const isAct = active === item.id;
          const ic    = isAct ? t.accent : "rgba(255,255,255,0.38)";
          return (
            <button key={item.id} onClick={() => setActive(item.id)}
              title={collapsed ? item.label : ""}
              style={{ display:"flex", alignItems:"center", gap:0, width:"100%", padding:"2px 0", background:isAct?`${t.accent}18`:"transparent", border:"none", borderLeft:isAct?`3px solid ${t.accent}`:"3px solid transparent", borderRadius:"0 10px 10px 0", cursor:"pointer", outline:"none", transition:"background .13s" }}
              onMouseEnter={e => { if (!isAct) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { if (!isAct) e.currentTarget.style.background = "transparent"; }}>
              <IconSlot d={item.icon} color={ic}/>
              {!collapsed && (
                <span style={{ fontSize:12, fontWeight:isAct?700:400, color:isAct?t.accent:"rgba(255,255,255,0.55)", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", flex:1, textAlign:"left" }}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: divider + profile + theme + logout */}
      <div style={{ borderTop:`1px solid rgba(255,255,255,0.07)`, marginTop:12, paddingTop:10, paddingRight:8, display:"flex", flexDirection:"column", gap:2 }}>

        {/* Profile button */}
        <button onClick={() => setActive("profile")} title="Profile"
          style={{ display:"flex", alignItems:"center", gap:0, width:"100%", padding:"2px 0", background: active==="profile"?`${t.accent}18`:"transparent", border:"none", borderLeft: active==="profile"?`3px solid ${t.accent}`:"3px solid transparent", borderRadius:"0 10px 10px 0", cursor:"pointer", outline:"none", transition:"background .13s" }}
          onMouseEnter={e => { if (active!=="profile") e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          onMouseLeave={e => { if (active!=="profile") e.currentTarget.style.background = "transparent"; }}>
          <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:36, height:36, flexShrink:0 }}>
            <div style={{ width:26, height:26, borderRadius:"50%", background:`linear-gradient(135deg,${t.accent},${t.accentDk})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif" }}>A</div>
          </span>
          {!collapsed && (
            <div style={{ flex:1, textAlign:"left" }}>
              <div style={{ fontSize:12, fontWeight:700, color: active==="profile"?t.accent:"rgba(255,255,255,0.7)", fontFamily:"'DM Sans',sans-serif", lineHeight:1.2 }}>Admin Sys</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)" }}>View Profile</div>
            </div>
          )}
        </button>

        {/* Theme toggle */}
        <button onClick={() => setDark(d => !d)} title={collapsed?"Toggle theme":""}
          style={{ display:"flex", alignItems:"center", gap:0, width:"100%", padding:"2px 0", background:"transparent", border:"none", borderLeft:"3px solid transparent", borderRadius:"0 10px 10px 0", cursor:"pointer", outline:"none" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:36, height:36, flexShrink:0 }}>
            <Ico d={dark?IC.sun:IC.moon} size={15} color={t.accent}/>
          </span>
          {!collapsed && <span style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>{dark?"Light Mode":"Dark Mode"}</span>}
        </button>

        {/* Logout */}
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
   HEADER BAR
═══════════════════════════════════════════════════════════════ */
function Header({ t, active, onProfileClick }) {
  const ALL_SECTIONS = [
    ...NAV,
    { id:"profile", label:"My Profile" },
  ];
  const pageTitle = ALL_SECTIONS.find(n => n.id === active)?.label || "Dashboard";
  const unread = 2;
  const [showNotif, setShowNotif] = useState(false);

  return (
    <header style={{ display:"flex", alignItems:"center", padding:"0 22px", height:60, background:t.headerBg, borderBottom:`1px solid ${t.border}`, flexShrink:0, boxShadow:t.shadow, position:"sticky", top:0, zIndex:30, gap:14 }}>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:800, color:t.text }}>Clinic Monitoring System</div>
        <div style={{ fontSize:10, color:t.textSub }}>Admin Console · {pageTitle}</div>
      </div>

      {/* System status */}
      <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", background:`${t.success}12`, border:`1px solid ${t.success}30`, borderRadius:20 }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:t.success, animation:"pulse 2s ease infinite" }}/>
        <span style={{ fontSize:11, color:t.success, fontWeight:700, fontFamily:"'Syne',sans-serif" }}>System Online</span>
      </div>

      {/* Notifications */}
      <div style={{ position:"relative" }}>
        <button onClick={() => setShowNotif(v => !v)}
          style={{ width:36, height:36, borderRadius:9, background:showNotif?t.accentGl:t.inputBg, border:`1px solid ${showNotif?t.accent:t.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"relative" }}>
          <Ico d={IC.bell} size={16} color={showNotif?t.accent:t.textSub}/>
          {unread > 0 && <span style={{ position:"absolute", top:7, right:7, width:8, height:8, borderRadius:"50%", background:t.danger, border:`2px solid ${t.headerBg}` }}/>}
        </button>
        {showNotif && (
          <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, width:300, background:t.popBg, border:`1px solid ${t.borderSt}`, borderRadius:14, boxShadow:t.popShadow, zIndex:200, overflow:"hidden" }}
            onClick={() => setShowNotif(false)}>
            <div style={{ padding:"12px 16px", borderBottom:`1px solid ${t.border}`, fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:t.text }}>Notifications</div>
            {[
              { msg:"Harbor Clinic report is 3 days late", color:t.danger,  time:"2h ago" },
              { msg:"Email service queue building up",      color:t.warning, time:"4h ago" },
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

      {/* Profile avatar — ring highlight when on profile page */}
      <button onClick={onProfileClick}
        style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${t.accent},${t.accentDk})`, border:`2px solid ${active === "profile" ? t.accent : t.border}`, cursor:"pointer", fontSize:14, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", boxShadow: active === "profile" ? `0 0 0 3px ${t.accent}44` : "none", transition:"box-shadow .2s, border-color .2s" }}>
        A
      </button>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate         = useNavigate();
  const [dark, setDark]  = useState(true);
  const [active, setActive] = useState("dashboard");

  const t = mkT(dark);

  const handleLogout = useCallback(() => {
    setTimeout(() => navigate("/login"), 600);
  }, [navigate]);

  /* Navigate to a section — single source of truth */
  const goTo = useCallback((id) => setActive(id), []);

  /* Render the correct view lazily — only the active one mounts */
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
      `}</style>

      <Sidebar
        t={t}
        active={active}
        setActive={goTo}
        dark={dark}
        setDark={setDark}
        onLogout={handleLogout}
      />

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        <Header
          t={t}
          active={active}
          onProfileClick={() => goTo("profile")}
        />
        {/* key=active forces a clean mount + fadeUp animation on every section change */}
        <main
          key={active}
          style={{ flex:1, overflowY:"auto", padding:22, animation:"fadeUp .25s ease both" }}
        >
          {renderView()}
        </main>
      </div>
    </div>
  );
}
