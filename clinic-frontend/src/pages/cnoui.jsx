import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";

const API = "http://127.0.0.1:8000/api/auth/cno";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

const CLINIC_COORDS = {
  nairobi: { x: 55, y: 52 },
  kisumu:  { x: 28, y: 47 },
  mombasa: { x: 72, y: 72 },
  eldoret: { x: 35, y: 32 },
};
const getCoords = (name) => {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(CLINIC_COORDS)) {
    if (key.includes(k)) return v;
  }
  return { x: 50, y: 50 };
};

const mkT = (dark) => ({
  pageBg:    dark ? "#030f1e"                    : "#EEF2F7",
  sidebarBg: dark ? "rgba(3,15,30,0.98)"         : "#FFFFFF",
  headerBg:  dark ? "rgba(3,15,30,0.96)"         : "rgba(255,255,255,0.97)",
  cardBg:    dark ? "rgba(255,255,255,0.03)"     : "#FFFFFF",
  cardHd:    dark ? "rgba(0,174,239,0.05)"       : "rgba(0,100,180,0.03)",
  inputBg:   dark ? "rgba(255,255,255,0.06)"     : "#F0F4F8",
  popBg:     dark ? "#0a1e36"                    : "#FFFFFF",
  rowBg:     dark ? "rgba(255,255,255,0.025)"    : "#FAFCFF",
  tooltipBg: dark ? "#0d2540"                    : "#FFFFFF",
  border:    dark ? "rgba(0,174,239,0.11)"       : "#D0DFF0",
  borderSt:  dark ? "rgba(0,174,239,0.28)"       : "#A8C4E0",
  inputBd:   dark ? "rgba(0,174,239,0.22)"       : "#B8D0E8",
  text:      dark ? "#F0F6FF"                    : "#0A1628",
  textSub:   dark ? "#6B7A99"                    : "#3D5175",
  textMt:    dark ? "#3D5175"                    : "#8FA3BF",
  accent:    dark ? "#00AEEF"                    : "#0077B6",
  accentDk:  dark ? "#0077B6"                    : "#005A8E",
  accentGl:  dark ? "rgba(0,174,239,0.13)"       : "rgba(0,119,182,0.09)",
  success:   dark ? "#00C48C"                    : "#009E72",
  warning:   dark ? "#FFB020"                    : "#C4870A",
  danger:    dark ? "#FF4D4D"                    : "#D93636",
  purple:    dark ? "#A855F7"                    : "#7C3AED",
  gridLine:  dark ? "rgba(255,255,255,0.045)"    : "rgba(10,22,40,0.06)",
  chartText: dark ? "#4A6080"                    : "#8FA3BF",
  shadow:    dark ? "0 4px 28px rgba(0,0,0,.45)": "0 4px 24px rgba(10,22,40,.08)",
  popShadow: dark ? "0 16px 48px rgba(0,0,0,.7)": "0 16px 48px rgba(10,22,40,.18)",
});

// FIX 1: scores from backend are 0-1 floats, not 0-100 integers
const riskScore = (score) => ({
  color: score >= 0.75 ? "#FF4D4D" : score >= 0.50 ? "#FFB020" : score >= 0.30 ? "#FFB020" : "#00C48C",
  label: score >= 0.75 ? "Critical" : score >= 0.50 ? "High Risk" : score >= 0.30 ? "Moderate" : "Stable",
  bg:    score >= 0.75 ? "rgba(255,77,77,0.10)"  : score >= 0.50 ? "rgba(255,176,32,0.10)" : score >= 0.30 ? "rgba(255,176,32,0.08)" : "rgba(0,196,140,0.10)",
  bd:    score >= 0.75 ? "rgba(255,77,77,0.35)"  : score >= 0.50 ? "rgba(255,176,32,0.35)" : score >= 0.30 ? "rgba(255,176,32,0.28)" : "rgba(0,196,140,0.35)",
});

const resourceColor = (value, warning, critical, invert) => {
  if (invert) {
    if (value <= critical) return "#FF4D4D";
    if (value <= warning)  return "#FFB020";
    return "#00C48C";
  }
  if (value >= critical) return "#FF4D4D";
  if (value >= warning)  return "#FFB020";
  return "#00C48C";
};

function useOutsideClick(ref, fn) {
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) fn(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, fn]);
}

const Ico = ({ d, size=16, color="currentColor", stroke=2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);
const IC = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  heatmap:   "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  alerts:    "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  reports:   "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8",
  bell:      "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  settings:  "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  sun:       "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z",
  moon:      "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  logout:    "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  download:  "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  activity:  "M22 12h-4l-3 9L9 3l-3 9H2",
  check:     "M20 6L9 17l-5-5",
  filter:    "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  calendar:  "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",
  user:      "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  chevL:     "M15 18l-6-6 6-6",
  chevR:     "M9 18l6-6-6-6",
  info:      "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 16v-4M12 8h.01",
  refresh:   "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  trend:     "M23 6l-9.5 9.5-5-5L1 18",
};

function Toast({ toast }) {
  if (!toast) return null;
  const bg = { success:"#00C48C", error:"#FF4D4D", info:"#00AEEF", warning:"#FFB020" }[toast.type] || "#00AEEF";
  return (
    <div style={{ position:"fixed", top:20, right:24, zIndex:9999, background:bg, color:"#fff", borderRadius:12, padding:"13px 20px", fontSize:13, fontWeight:700, fontFamily:"'Syne',sans-serif", boxShadow:"0 8px 32px rgba(0,0,0,.35)", display:"flex", alignItems:"center", gap:10, animation:"slideIn .3s ease both", maxWidth:360 }}>
      <Ico d={toast.type==="error"?IC.alerts:IC.check} size={16} color="#fff"/>
      {toast.msg}
    </div>
  );
}

function EmptyState({ t, loading, label }) {
  return (
    <div style={{ padding:"32px", textAlign:"center", color:t.textSub, fontSize:13 }}>
      {loading
        ? <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color:t.accent }}>Loading…</div>
        : <div style={{ color:t.textMt }}>{label || "No data available."}</div>
      }
    </div>
  );
}

function Card({ t, title, sub, icon, iconColor, action, children, style={} }) {
  const ic = iconColor || t.accent;
  return (
    <div style={{ background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:16, overflow:"hidden", boxShadow:t.shadow, ...style }}>
      {(title || action) && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:`1px solid ${t.border}`, background:t.cardHd }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {icon && (
              <div style={{ width:30, height:30, borderRadius:8, background:`${ic}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Ico d={icon} size={14} color={ic}/>
              </div>
            )}
            <div>
              {title && <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800, color:t.text, letterSpacing:"0.3px" }}>{title}</div>}
              {sub   && <div style={{ fontSize:11, color:t.textMt, marginTop:1 }}>{sub}</div>}
            </div>
          </div>
          {action}
        </div>
      )}
      <div style={{ padding:"16px 20px" }}>{children}</div>
    </div>
  );
}

function NotifPanel({ t, notifs, setNotifs, onClose }) {
  const ref = useRef();
  useOutsideClick(ref, onClose);
  const unread = notifs.filter(n => !n.read).length;
  const tc = { danger:t.danger, warning:t.warning, info:t.accent, success:t.success };
  return (
    <div ref={ref} style={{ position:"absolute", top:"calc(100% + 10px)", right:0, width:340, background:t.popBg, border:`1px solid ${t.borderSt}`, borderRadius:16, boxShadow:t.popShadow, zIndex:600, overflow:"hidden", animation:"dropIn .2s ease both" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 16px", borderBottom:`1px solid ${t.border}`, background:t.cardHd }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:t.text }}>Notifications</span>
          {unread > 0 && <span style={{ background:t.danger, color:"#fff", borderRadius:20, padding:"1px 7px", fontSize:10, fontWeight:700 }}>{unread}</span>}
        </div>
        <button onClick={() => setNotifs(n => n.map(x => ({ ...x, read:true })))} style={{ fontSize:11, color:t.accent, background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>Mark all read</button>
      </div>
      <div style={{ maxHeight:320, overflowY:"auto" }}>
        {notifs.length === 0 && <div style={{ padding:"20px", textAlign:"center", fontSize:12, color:t.textMt }}>No notifications</div>}
        {notifs.map(n => (
          <div key={n.id} onClick={() => setNotifs(p => p.map(x => x.id===n.id?{...x,read:true}:x))}
            style={{ display:"flex", gap:12, padding:"12px 16px", borderBottom:`1px solid ${t.border}`, cursor:"pointer", background:n.read?"transparent":t.accentGl }}>
            <div style={{ width:32, height:32, borderRadius:8, background:`${tc[n.type]||t.accent}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Ico d={n.type==="success"?IC.check:IC.alerts} size={14} color={tc[n.type]||t.accent}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:2 }}>
                <span style={{ fontSize:12, fontWeight:700, color:t.text }}>{n.title}</span>
                {!n.read && <span style={{ width:7, height:7, borderRadius:"50%", background:t.danger, display:"inline-block" }}/>}
              </div>
              <div style={{ fontSize:11, color:t.textSub, lineHeight:1.4 }}>{n.body}</div>
              <div style={{ fontSize:10, color:t.textMt, marginTop:3 }}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding:"10px 16px", textAlign:"center", borderTop:`1px solid ${t.border}` }}>
        <button onClick={onClose} style={{ fontSize:12, color:t.accent, background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>View all notifications →</button>
      </div>
    </div>
  );
}

function SettingsPanel({ t, dark, setDark, onClose }) {
  const ref = useRef();
  useOutsideClick(ref, onClose);
  const [emailAlerts,  setEmailAlerts]  = useState(true);
  const [autoRefresh,  setAutoRefresh]  = useState(true);
  const [soundAlerts,  setSoundAlerts]  = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const Toggle = ({ val, set, color }) => (
    <div onClick={() => set(v => !v)} style={{ width:40, height:22, borderRadius:11, background:val?(color||t.accent):t.inputBg, border:`1px solid ${val?(color||t.accent):t.border}`, cursor:"pointer", position:"relative", transition:"all .25s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:2, left:val?"20px":"2px", width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left .25s", boxShadow:"0 1px 4px rgba(0,0,0,.3)" }}/>
    </div>
  );

  return (
    <div ref={ref} style={{ position:"absolute", top:"calc(100% + 10px)", right:0, width:290, background:t.popBg, border:`1px solid ${t.borderSt}`, borderRadius:16, boxShadow:t.popShadow, zIndex:600, overflow:"hidden", animation:"dropIn .2s ease both" }}>
      <div style={{ padding:"13px 16px", borderBottom:`1px solid ${t.border}`, background:t.cardHd }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:t.text }}>Dashboard Settings</div>
      </div>
      <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:14 }}>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:t.textMt, letterSpacing:"1.2px", textTransform:"uppercase", fontFamily:"'Syne',sans-serif", marginBottom:8 }}>Appearance</div>
          <div style={{ display:"flex", gap:8 }}>
            {["Dark","Light"].map(m => (
              <button key={m} onClick={() => setDark(m==="Dark")} style={{ flex:1, padding:"8px", borderRadius:9, background:(dark&&m==="Dark")||(!dark&&m==="Light")?`${t.accent}18`:t.inputBg, border:`1.5px solid ${(dark&&m==="Dark")||(!dark&&m==="Light")?t.accent:t.border}`, cursor:"pointer", fontSize:12, fontWeight:700, color:(dark&&m==="Dark")||(!dark&&m==="Light")?t.accent:t.textSub, fontFamily:"'Syne',sans-serif", transition:"all .2s" }}>
                {m==="Dark"?"🌙 Dark":"☀️ Light"}
              </button>
            ))}
          </div>
        </div>
        {[
          { label:"Email Alerts",  sub:"Risk alerts via email",    val:emailAlerts,  set:setEmailAlerts,  color:t.accent  },
          { label:"Auto-Refresh",  sub:"Refresh data every 5 min", val:autoRefresh,  set:setAutoRefresh,  color:t.success },
          { label:"Sound Alerts",  sub:"Audio for critical alerts", val:soundAlerts,  set:setSoundAlerts,  color:t.warning },
          { label:"High Contrast", sub:"Increase text contrast",    val:highContrast, set:setHighContrast, color:t.purple  },
        ].map(item => (
          <div key={item.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:t.text }}>{item.label}</div>
              <div style={{ fontSize:11, color:t.textSub }}>{item.sub}</div>
            </div>
            <Toggle val={item.val} set={item.set} color={item.color}/>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePanel({ t, profile, onClose }) {
  const ref = useRef();
  useOutsideClick(ref, onClose);
  const initial = profile?.name ? profile.name[0].toUpperCase() : "C";
  return (
    <div ref={ref} style={{ position:"absolute", top:"calc(100% + 10px)", right:0, width:250, background:t.popBg, border:`1px solid ${t.borderSt}`, borderRadius:16, boxShadow:t.popShadow, zIndex:600, overflow:"hidden", animation:"dropIn .2s ease both" }}>
      <div style={{ padding:"18px 16px", background:`linear-gradient(135deg,${t.accent}22,${t.accentDk}11)`, borderBottom:`1px solid ${t.border}`, textAlign:"center" }}>
        <div style={{ width:54, height:54, borderRadius:"50%", background:`linear-gradient(135deg,${t.accent},${t.accentDk})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px", fontSize:22, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif", boxShadow:`0 6px 20px ${t.accent}44` }}>{initial}</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:t.text }}>{profile?.name || "Chief Nursing Officer"}</div>
        <div style={{ fontSize:11, color:t.textSub, marginTop:2 }}>{profile?.email || ""}</div>
        <div style={{ marginTop:10, display:"inline-flex", alignItems:"center", gap:5, background:`${t.success}18`, border:`1px solid ${t.success}44`, borderRadius:20, padding:"3px 10px" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:t.success, display:"inline-block" }}/>
          <span style={{ fontSize:10, color:t.success, fontWeight:700 }}>Active Session</span>
        </div>
      </div>
      <div style={{ padding:"10px 10px 6px" }}>
        {[
          { icon:IC.user,     label:"My Profile",   color:t.accent  },
          { icon:IC.reports,  label:"My Reports",   color:t.success },
          { icon:IC.activity, label:"Activity Log", color:t.warning },
          { icon:IC.settings, label:"Preferences",  color:t.purple  },
        ].map(item => (
          <button key={item.label} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", width:"100%", background:"transparent", border:"none", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textAlign:"left" }}
            onMouseEnter={e=>e.currentTarget.style.background=t.inputBg}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{ width:28, height:28, borderRadius:7, background:`${item.color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ico d={item.icon} size={13} color={item.color}/>
            </div>
            <span style={{ fontSize:13, fontWeight:500, color:t.text }}>{item.label}</span>
          </button>
        ))}
      </div>
      <div style={{ padding:"6px 10px 10px", borderTop:`1px solid ${t.border}` }}>
        <button onClick={onClose} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", width:"100%", background:"rgba(255,77,77,.08)", border:"1px solid rgba(255,77,77,.22)", borderRadius:8, cursor:"pointer", color:t.danger, fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight:700 }}>
          <Ico d={IC.logout} size={14} color={t.danger}/> Sign Out
        </button>
      </div>
    </div>
  );
}

function Sidebar({ t, active, setActive, collapsed, setCollapsed, dark, setDark, onLogout, alertCount }) {
  const W = collapsed ? 60 : 220;
  const NAV_ITEMS = [
    { label:"Dashboard",    icon:IC.dashboard },
    { label:"Risk Heatmap", icon:IC.heatmap,  badge: alertCount.critical },
    { label:"Alerts",       icon:IC.alerts,   badge: alertCount.total    },
    { label:"Reports",      icon:IC.reports                              },
  ];
  const IconSlot = ({ d, color }) => (
    <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:36, height:36, flexShrink:0, borderRadius:9 }}>
      <Ico d={d} size={18} color={color}/>
    </span>
  );
  const NavBtn = ({ item }) => {
    const isAct = active === item.label;
    const ic = isAct ? t.accent : t.textSub;
    return (
      <button onClick={() => setActive(item.label)} title={item.label}
        style={{ display:"flex", alignItems:"center", gap:0, width:"100%", padding:"2px 0", background:isAct?`${t.accent}15`:"transparent", border:"none", borderLeft:isAct?`3px solid ${t.accent}`:"3px solid transparent", borderRadius:"0 10px 10px 0", cursor:"pointer", outline:"none", transition:"background .15s", overflow:"hidden" }}
        onMouseEnter={e => { if(!isAct) e.currentTarget.style.background=`${t.accent}08`; }}
        onMouseLeave={e => { if(!isAct) e.currentTarget.style.background="transparent"; }}>
        <IconSlot d={item.icon} color={ic}/>
        {!collapsed && (
          <>
            <span style={{ flex:1, fontSize:13, fontWeight:isAct?700:400, color:ic, fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>{item.label}</span>
            {item.badge > 0 && <span style={{ background:t.danger, color:"#fff", borderRadius:20, padding:"1px 8px", fontSize:10, fontWeight:700, fontFamily:"'Syne',sans-serif", marginRight:8, flexShrink:0 }}>{item.badge}</span>}
          </>
        )}
      </button>
    );
  };
  const UtilBtn = ({ d, label, color, onClick, danger }) => (
    <button onClick={onClick} title={label}
      style={{ display:"flex", alignItems:"center", gap:0, width:"100%", padding:"2px 0", background:danger?`${t.danger}09`:"transparent", border:danger?`1px solid ${t.danger}25`:"none", borderRadius:10, cursor:"pointer", outline:"none", transition:"background .15s", overflow:"hidden" }}
      onMouseEnter={e => { e.currentTarget.style.background=danger?`${t.danger}18`:`${t.accent}09`; }}
      onMouseLeave={e => { e.currentTarget.style.background=danger?`${t.danger}09`:"transparent"; }}>
      <IconSlot d={d} color={color}/>
      {!collapsed && <span style={{ flex:1, fontSize:12, fontWeight:danger?700:500, color, fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>{label}</span>}
    </button>
  );
  return (
    <aside style={{ width:W, minWidth:W, flexShrink:0, background:t.sidebarBg, borderRight:`1px solid ${t.border}`, display:"flex", flexDirection:"column", padding:"14px 0", transition:"width .25s cubic-bezier(.4,0,.2,1), min-width .25s cubic-bezier(.4,0,.2,1)", overflowX:"hidden", boxShadow:t.shadow, position:"relative", zIndex:50 }}>
      <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:16, paddingBottom:14, borderBottom:`1px solid ${t.border}` }}>
        <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:60, height:36, flexShrink:0 }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 1500" width="36" height="36" preserveAspectRatio="xMidYMid meet">
            <defs>
              <clipPath id="cc1"><path d="M 185.167969 225 L 677 225 L 677 1268 L 185.167969 1268 Z"/></clipPath>
              <clipPath id="cc2"><path d="M 536.332031 571 L 898.582031 571 L 898.582031 932.957031 L 536.332031 932.957031 Z"/></clipPath>
              <clipPath id="cc3"><path d="M 536.332031 559.457031 L 898.582031 559.457031 L 898.582031 922 L 536.332031 922 Z"/></clipPath>
            </defs>
            <g clipPath="url(#cc1)"><path fill="#0097b2" d="M 550.917969 714.304688 L 676.46875 786.933594 L 676.46875 289.117188 L 565.734375 225.121094 L 450.117188 291.722656 L 450.117188 425.90625 L 418.851562 443.984375 L 418.851562 309.796875 L 316.910156 368.75 L 316.910156 510.585938 L 434.808594 578.492188 L 550.589844 511.5625 L 550.589844 386.171875 L 581.859375 368.097656 L 581.859375 529.636719 L 450.117188 605.6875 L 450.117188 739.058594 L 418.851562 757.132812 L 418.851562 605.523438 L 303.71875 538.921875 L 185.167969 607.316406 L 185.167969 722.285156 L 316.910156 646.234375 L 316.910156 682.386719 L 185.167969 758.433594 L 185.167969 888.058594 L 303.71875 956.453125 L 401.589844 899.945312 L 308.765625 846.207031 L 308.765625 810.21875 L 581.859375 967.851562 L 581.859375 1153.820312 L 550.589844 1135.746094 L 550.589844 985.929688 L 432.855469 918.023438 L 316.910156 984.953125 L 316.910156 1122.394531 L 418.851562 1181.179688 L 418.851562 1027.292969 L 450.117188 1045.367188 L 450.117188 1199.253906 L 568.503906 1267.648438 L 676.46875 1205.28125 L 676.46875 823.085938 L 550.917969 750.457031 Z" fillRule="evenodd"/></g>
            <path fill="#000" d="M 708.714844 327.875 L 708.714844 1201.859375 L 740.792969 1220.585938 L 790.949219 1249.410156 C 782.808594 1277.746094 794.695312 1309.175781 821.402344 1324.484375 C 852.992188 1342.722656 893.214844 1331.972656 911.453125 1300.382812 C 929.53125 1268.953125 918.78125 1228.566406 887.355469 1210.328125 C 860.648438 1195.019531 827.589844 1200.394531 807.070312 1221.566406 L 740.792969 1183.296875 L 740.792969 309.308594 L 807.070312 271.042969 C 827.589844 292.375 860.648438 297.75 887.355469 282.277344 C 918.78125 264.039062 929.53125 223.816406 911.453125 192.226562 C 893.214844 160.796875 852.992188 150.046875 821.402344 168.125 C 794.695312 183.59375 782.808594 214.859375 790.949219 243.195312 L 740.792969 272.179688 L 708.714844 290.746094 Z" fillRule="evenodd"/>
            <path fill="#000" d="M 854.949219 569.859375 L 775.480469 569.859375 L 775.480469 601.941406 L 868.300781 601.941406 L 900.542969 569.859375 L 939.953125 530.453125 L 1112.40625 530.453125 L 1185.847656 603.894531 C 1170.703125 629.136719 1173.960938 662.519531 1195.78125 684.339844 C 1221.511719 710.070312 1263.363281 710.070312 1289.089844 684.339844 C 1314.820312 658.613281 1314.820312 616.921875 1289.089844 591.195312 C 1267.269531 569.371094 1233.886719 565.953125 1208.644531 581.097656 L 1157.839844 530.453125 L 1125.757812 498.210938 L 926.597656 498.210938 L 894.519531 530.453125 Z" fillRule="evenodd"/>
            <path fill="#0097b2" d="M 775.480469 438.933594 L 818.144531 438.933594 L 850.226562 406.855469 L 888.167969 368.910156 L 939.464844 368.910156 C 946.792969 397.570312 972.683594 418.742188 1003.460938 418.742188 C 1039.777344 418.742188 1069.414062 389.265625 1069.414062 352.789062 C 1069.414062 316.476562 1039.777344 287 1003.460938 287 C 972.683594 287 946.792969 308.171875 939.464844 336.667969 L 874.816406 336.667969 L 842.570312 368.910156 L 804.792969 406.855469 L 775.480469 406.855469 Z" fillRule="evenodd"/>
            <path fill="#000" d="M 822.867188 890.664062 L 775.480469 890.664062 L 775.480469 922.90625 L 854.949219 922.90625 L 894.519531 962.316406 L 926.597656 994.398438 L 1125.757812 994.398438 L 1157.839844 962.316406 L 1208.644531 911.507812 C 1233.886719 926.652344 1267.269531 923.398438 1289.089844 901.574219 C 1314.820312 875.847656 1314.820312 834.15625 1289.089844 808.429688 C 1263.363281 782.699219 1221.511719 782.699219 1195.78125 808.429688 C 1173.960938 830.25 1170.703125 863.46875 1185.847656 888.710938 L 1112.40625 962.316406 L 939.953125 962.316406 L 868.300781 890.664062 Z" fillRule="evenodd"/>
            <path fill="#0097b2" d="M 775.480469 762.507812 L 997.273438 762.507812 C 1004.4375 791.003906 1030.332031 812.175781 1061.109375 812.175781 C 1097.585938 812.175781 1127.0625 782.699219 1127.0625 746.382812 C 1127.0625 709.90625 1097.585938 680.433594 1061.109375 680.433594 C 1030.332031 680.433594 1004.4375 701.601562 997.273438 730.261719 L 775.480469 730.261719 Z" fillRule="evenodd"/>
            <path fill="#0097b2" d="M 850.226562 1085.914062 L 818.144531 1053.671875 L 775.480469 1053.671875 L 775.480469 1085.914062 L 804.792969 1085.914062 L 842.570312 1123.695312 L 874.816406 1155.9375 L 939.464844 1155.9375 C 946.792969 1184.597656 972.683594 1205.769531 1003.460938 1205.769531 C 1039.777344 1205.769531 1069.414062 1176.292969 1069.414062 1139.816406 C 1069.414062 1103.503906 1039.777344 1074.027344 1003.460938 1074.027344 C 972.683594 1074.027344 946.792969 1095.199219 939.464844 1123.695312 L 888.167969 1123.695312 Z" fillRule="evenodd"/>
            <g clipPath="url(#cc2)"><path fill="#0097b2" d="M 898.507812 752.183594 C 898.507812 652.328125 817.273438 571.09375 717.421875 571.09375 C 617.566406 571.09375 536.332031 652.328125 536.332031 752.183594 C 536.332031 852.039062 617.566406 933.269531 717.421875 933.269531 C 817.273438 933.269531 898.507812 852.035156 898.507812 752.183594 Z"/></g>
            <g clipPath="url(#cc3)"><path fill="#000" d="M 898.507812 740.59375 C 898.507812 640.738281 817.273438 559.503906 717.421875 559.503906 C 617.566406 559.503906 536.332031 640.738281 536.332031 740.59375 C 536.332031 840.445312 617.566406 921.679688 717.421875 921.679688 C 817.273438 921.679688 898.507812 840.445312 898.507812 740.59375 Z"/></g>
            <path fill="#0097b2" d="M 717.421875 904.296875 C 627.160156 904.296875 553.722656 830.859375 553.722656 740.59375 C 553.722656 650.332031 627.160156 576.894531 717.421875 576.894531 C 807.6875 576.894531 881.125 650.332031 881.125 740.59375 C 881.125 830.859375 807.6875 904.296875 717.421875 904.296875 Z"/>
            <path fill="#0097b2" d="M 717.421875 610.175781 C 645.398438 610.175781 587.007812 668.566406 587.007812 740.597656 C 587.007812 812.625 645.398438 871.015625 717.421875 871.015625 C 789.453125 871.015625 847.839844 812.625 847.839844 740.597656 C 847.839844 668.566406 789.453125 610.175781 717.421875 610.175781 Z"/>
            <path fill="#0097b2" d="M 795.019531 759.742188 C 795.019531 764.140625 791.453125 767.707031 787.054688 767.707031 L 744.535156 767.707031 L 744.535156 810.226562 C 744.535156 814.625 740.96875 818.191406 736.570312 818.191406 L 698.273438 818.191406 C 693.878906 818.191406 690.3125 814.625 690.3125 810.226562 L 690.3125 767.707031 L 647.792969 767.707031 C 643.394531 767.707031 639.828125 764.140625 639.828125 759.742188 L 639.828125 721.449219 C 639.828125 717.050781 643.394531 713.484375 647.792969 713.484375 L 690.3125 713.484375 L 690.3125 670.964844 C 690.3125 666.566406 693.878906 663 698.273438 663 L 736.570312 663 C 740.96875 663 744.535156 666.566406 744.535156 670.964844 L 744.535156 713.484375 L 787.054688 713.484375 C 791.453125 713.484375 795.019531 717.050781 795.019531 721.449219 Z"/>
          </svg>
        </span>
        {!collapsed && (
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:t.text, letterSpacing:"1.5px", lineHeight:1.2 }}>CMS</div>
            <div style={{ fontSize:10, color:t.textMt, letterSpacing:"0.4px" }}>CNO Command Center</div>
          </div>
        )}
      </div>
      <button onClick={() => setCollapsed(c => !c)} style={{ position:"absolute", top:20, right:-11, width:22, height:22, borderRadius:"50%", background:t.sidebarBg, border:`1px solid ${t.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", zIndex:60, boxShadow:t.shadow, padding:0 }}>
        <Ico d={collapsed?IC.chevR:IC.chevL} size={10} color={t.textSub}/>
      </button>
      {!collapsed && <div style={{ fontSize:9, fontWeight:700, color:t.textMt, letterSpacing:"1.4px", textTransform:"uppercase", fontFamily:"'Syne',sans-serif", padding:"0 12px 6px 14px" }}>Navigation</div>}
      <nav style={{ display:"flex", flexDirection:"column", gap:2, flex:1, padding:"0 8px 0 0" }}>
        {NAV_ITEMS.map(item => <NavBtn key={item.label} item={item}/>)}
      </nav>
      <div style={{ borderTop:`1px solid ${t.border}`, marginTop:12, paddingTop:10, display:"flex", flexDirection:"column", gap:2, padding:"10px 8px 0 0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:0, padding:"2px 0" }}>
          <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:60, height:32, flexShrink:0 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:t.success, display:"inline-block", animation:"pulse 2s ease infinite" }}/>
          </span>
          {!collapsed && <span style={{ fontSize:10, color:t.textMt, fontFamily:"'DM Sans',sans-serif" }}>System Online · Live</span>}
        </div>
        <UtilBtn d={dark?IC.sun:IC.moon} label={dark?"Light Mode":"Dark Mode"} color={t.accent} onClick={() => setDark(d => !d)}/>
        <UtilBtn d={IC.logout} label="Logout" color={t.danger} onClick={onLogout} danger/>
      </div>
    </aside>
  );
}

function Header({ t, dark, setDark, notifs, setNotifs, clinicFilter, setClinicFilter, dateRange, setDateRange, clinics, profile }) {
  const [showNotif,    setShowNotif]    = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile,  setShowProfile]  = useState(false);
  const unread = notifs.filter(n => !n.read).length;
  const closeAll = () => { setShowNotif(false); setShowSettings(false); setShowProfile(false); };
  const initial = profile?.name ? profile.name[0].toUpperCase() : "C";
  return (
    <header style={{ display:"flex", alignItems:"center", padding:"0 20px", height:62, background:t.headerBg, backdropFilter:"blur(20px)", borderBottom:`1px solid ${t.border}`, flexShrink:0, boxShadow:t.shadow, position:"sticky", top:0, zIndex:30, gap:12 }}>
      <div style={{ flexShrink:0 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, color:t.text, lineHeight:1.2 }}>Clinic Monitoring System</div>
        <div style={{ fontSize:11, color:t.textSub }}>CNO Risk Command · EBM Risk Engine · Updated {new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</div>
      </div>
      <div style={{ flex:1 }}/>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {[
          { icon:IC.calendar, val:dateRange,    set:setDateRange,    opts:["Last 7 Days","Last 14 Days","Last 30 Days","This Month"] },
          { icon:IC.filter,   val:clinicFilter, set:setClinicFilter, opts:["All Clinics",...clinics.map(c=>c.name)] },
        ].map((f,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:6, background:t.inputBg, border:`1px solid ${t.inputBd}`, borderRadius:9, padding:"6px 10px" }}>
            <Ico d={f.icon} size={12} color={t.textSub}/>
            <select value={f.val} onChange={e=>f.set(e.target.value)} style={{ background:"transparent", border:"none", fontSize:12, color:t.text, outline:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <div style={{ position:"relative" }}>
          <button onClick={() => { closeAll(); setShowNotif(v=>!v); }} style={{ width:36, height:36, borderRadius:9, background:showNotif?t.accentGl:t.inputBg, border:`1px solid ${showNotif?t.accent:t.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"relative" }}>
            <Ico d={IC.bell} size={16} color={showNotif?t.accent:t.textSub}/>
            {unread > 0 && <span style={{ position:"absolute", top:7, right:7, width:8, height:8, borderRadius:"50%", background:t.danger, border:`2px solid ${t.headerBg}` }}/>}
          </button>
          {showNotif && <NotifPanel t={t} notifs={notifs} setNotifs={setNotifs} onClose={() => setShowNotif(false)}/>}
        </div>
        <div style={{ position:"relative" }}>
          <button onClick={() => { closeAll(); setShowSettings(v=>!v); }} style={{ width:36, height:36, borderRadius:9, background:showSettings?t.accentGl:t.inputBg, border:`1px solid ${showSettings?t.accent:t.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <Ico d={IC.settings} size={16} color={showSettings?t.accent:t.textSub}/>
          </button>
          {showSettings && <SettingsPanel t={t} dark={dark} setDark={setDark} onClose={() => setShowSettings(false)}/>}
        </div>
        <button onClick={() => setDark(d => !d)} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 11px", background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:9, cursor:"pointer", fontSize:12, fontWeight:600, color:t.textSub, fontFamily:"'DM Sans',sans-serif" }}>
          <Ico d={dark?IC.sun:IC.moon} size={13} color={t.accent}/>{dark?"Light":"Dark"}
        </button>
        <div style={{ position:"relative" }}>
          <button onClick={() => { closeAll(); setShowProfile(v=>!v); }} style={{ width:36, height:36, borderRadius:9, background:`linear-gradient(135deg,${t.accent},${t.accentDk})`, border:`2px solid ${showProfile?t.accent:t.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:15, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif", boxShadow:showProfile?`0 4px 16px ${t.accent}44`:"none" }}>
            {initial}
          </button>
          {showProfile && <ProfilePanel t={t} profile={profile} onClose={() => setShowProfile(false)}/>}
        </div>
      </div>
    </header>
  );
}

function SummaryStats({ t, clinics }) {
  const critical = clinics.filter(c => c.score >= 0.75).length;
  const high     = clinics.filter(c => c.score >= 0.50 && c.score < 0.75).length;
  const moderate = clinics.filter(c => c.score >= 0.30 && c.score < 0.50).length;
  const stable   = clinics.filter(c => c.score < 0.30).length;
  const avg      = clinics.length ? (clinics.reduce((a,c) => a+c.score, 0) / clinics.length) : 0;
  const stats = [
    { label:"Total Clinics",   value:clinics.length,  sub:"Monitored",       color:t.accent,                    icon:IC.dashboard },
    { label:"Reporting Today", value:clinics.length,  sub:"All reporting",   color:t.accent,                    icon:IC.check     },
    { label:"Critical",        value:critical,        sub:"Score ≥ 0.75",    color:t.danger,                    icon:IC.alerts    },
    { label:"High Risk",       value:high,            sub:"Score 0.50–0.74", color:t.warning,                   icon:IC.alerts    },
    { label:"Moderate",        value:moderate,        sub:"Score 0.30–0.49", color:"#FFB020",                   icon:IC.info      },
    { label:"Stable",          value:stable,          sub:"Score < 0.30",    color:t.success,                   icon:IC.check     },
    { label:"Avg Risk Score",  value:avg.toFixed(2),  sub:"Network-wide",    color:avg>=0.5?t.danger:t.success, icon:IC.activity  },
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:10 }}>
      {stats.map((s,i) => (
        <div key={s.label} style={{ background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:13, padding:"14px 12px", boxShadow:t.shadow, animation:"fadeUp .4s ease both", animationDelay:`${i*.05}s` }}>
          <div style={{ width:28, height:28, borderRadius:7, background:`${s.color}18`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}>
            <Ico d={s.icon} size={13} color={s.color}/>
          </div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
          <div style={{ fontSize:11, fontWeight:600, color:t.text, marginTop:3 }}>{s.label}</div>
          <div style={{ fontSize:10, color:t.textMt, marginTop:1 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

function ClinicCards({ t, clinics, dark }) {
  const [hovered, setHovered] = useState(null);
  const kpiDefs = [
    { key:"bed_occupancy",   label:"Beds",  max:100, dangerAt:85, warnAt:70 },
    { key:"absenteeism",     label:"Absent",max:60,  dangerAt:30, warnAt:20 },
    { key:"icu_pressure",    label:"ICU",   max:100, dangerAt:85, warnAt:70 },
    { key:"treatment_delay", label:"Delay", max:60,  dangerAt:30, warnAt:20 },
  ];
  if (clinics.length === 0) return <EmptyState t={t} label="No clinics to display."/>;
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:14 }}>
      {clinics.map((c, i) => {
        const rs  = riskScore(c.score);
        const isH = hovered === c.id;
        return (
          <div key={c.id} onMouseEnter={() => setHovered(c.id)} onMouseLeave={() => setHovered(null)}
            style={{ background:t.cardBg, border:`1px solid ${isH?rs.color+"88":t.border}`, borderRadius:14, overflow:"hidden", boxShadow:isH?`0 8px 32px ${rs.color}22`:t.shadow, transition:"all .22s", animation:"fadeUp .4s ease both", animationDelay:`${i*.06}s` }}>
            <div style={{ height:4, background:`linear-gradient(90deg,${rs.color},${rs.color}66)` }}/>
            <div style={{ padding:"14px 15px 15px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:800, color:t.text, marginBottom:5 }}>{c.name}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:rs.bg, border:`1px solid ${rs.bd}`, borderRadius:20, padding:"3px 9px", fontSize:10, fontWeight:700, color:rs.color, fontFamily:"'Syne',sans-serif" }}>
                      <span style={{ width:5, height:5, borderRadius:"50%", background:rs.color, display:"inline-block" }}/>{rs.label}
                    </span>
                    <span style={{ fontSize:12, color:t.textMt, fontWeight:700 }}>{c.trend}</span>
                  </div>
                </div>
                <div style={{ position:"relative", width:68, height:68, flexShrink:0 }}>
                  <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:`conic-gradient(${rs.color} ${Math.round(c.score*360)}deg, rgba(128,128,128,0.18) ${Math.round(c.score*360)}deg)` }}/>
                  <div style={{ position:"absolute", inset:7, borderRadius:"50%", background:isH?(dark?"#0a1828":"#f4f8fb"):(dark?"#030f1e":"#ffffff"), display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:2 }}>
                    <span style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800, color:rs.color, lineHeight:1, zIndex:3, position:"relative" }}>{Math.round(c.score*100)}</span>
                    <span style={{ fontSize:8, color:rs.color, opacity:.75, fontWeight:700, zIndex:3, position:"relative" }}>/100</span>
                  </div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 12px", marginBottom:12 }}>
                {kpiDefs.map(kd => {
                  const val = c[kd.key] ?? 0;
                  const barColor = val >= kd.dangerAt ? t.danger : val >= kd.warnAt ? t.warning : t.success;
                  const pct = Math.min((val / kd.max) * 100, 100);
                  return (
                    <div key={kd.key}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:t.textMt, marginBottom:3, fontFamily:"'Syne',sans-serif", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                        <span>{kd.label}</span>
                        <span style={{ color:barColor, fontWeight:800 }}>{val}{kd.key==="treatment_delay"?" min":"%"}</span>
                      </div>
                      <div style={{ height:4, background:t.inputBg, borderRadius:2, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:barColor, borderRadius:2, transition:"width .7s ease" }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
              {c.issues && c.issues.length > 0 ? (
                <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                  {c.issues.slice(0,2).map((iss,j) => (
                    <span key={j} style={{ fontSize:10, background:`${rs.color}0d`, border:`1px solid ${rs.color}25`, borderRadius:5, padding:"2px 7px", color:t.textSub }}>⚠ {iss}</span>
                  ))}
                  {c.issues.length > 2 && <span style={{ fontSize:10, color:t.textMt }}>+{c.issues.length-2} more</span>}
                </div>
              ) : (
                <span style={{ fontSize:11, color:t.success }}>✓ No active issues</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GeographicHeatmap({ t, clinics }) {
  const [tooltip, setTooltip] = useState(null);
  return (
    <div style={{ position:"relative", width:"100%", height:260, background:t.inputBg, borderRadius:12, border:`1px solid ${t.border}`, overflow:"hidden" }}>
      {[...Array(8)].map((_,i) => <div key={`h${i}`} style={{ position:"absolute", left:0, right:0, top:`${(i+1)*11}%`, height:1, background:t.gridLine }}/>)}
      {[...Array(10)].map((_,i) => <div key={`v${i}`} style={{ position:"absolute", top:0, bottom:0, left:`${(i+1)*9}%`, width:1, background:t.gridLine }}/>)}
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 55% 52%, ${t.danger}14 0%, transparent 30%)`, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 28% 47%, ${t.warning}10 0%, transparent 25%)`, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:10, left:14, fontSize:10, fontWeight:700, color:t.textMt, letterSpacing:"1.2px", fontFamily:"'Syne',sans-serif", textTransform:"uppercase" }}>
        Geographic Risk Distribution · {clinics.length} Facilities
      </div>
      <div style={{ position:"absolute", bottom:10, left:14, display:"flex", gap:12 }}>
        {[["Critical","#FF4D4D"],["High Risk","#FFB020"],["Stable","#00C48C"]].map(([l,c]) => (
          <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:c, opacity:.85 }}/>
            <span style={{ fontSize:9, color:t.textMt, fontFamily:"'Syne',sans-serif" }}>{l}</span>
          </div>
        ))}
      </div>
      {clinics.map(c => {
        const rs = riskScore(c.score);
        const isCrit = c.score >= 0.75;
        return (
          <div key={c.id} style={{ position:"absolute", left:`${c.coords.x}%`, top:`${c.coords.y}%`, transform:"translate(-50%,-50%)", cursor:"pointer", zIndex:10 }}
            onMouseEnter={() => setTooltip(c)} onMouseLeave={() => setTooltip(null)}>
            {isCrit && <div style={{ position:"absolute", width:38, height:38, borderRadius:"50%", background:`${rs.color}20`, border:`1.5px solid ${rs.color}55`, top:-9, left:-9, animation:"pulse 2s ease infinite" }}/>}
            <div style={{ width:22, height:22, borderRadius:"50%", background:`linear-gradient(135deg,${rs.color},${rs.color}cc)`, border:"2.5px solid #fff", boxShadow:`0 3px 12px ${rs.color}66`, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
              <span style={{ fontSize:7, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif" }}>{c.score.toFixed(1)}</span>
            </div>
            <div style={{ position:"absolute", top:26, left:"50%", transform:"translateX(-50%)", whiteSpace:"nowrap", fontSize:9, fontWeight:700, color:t.text, background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:5, padding:"1px 5px", fontFamily:"'Syne',sans-serif", boxShadow:t.shadow }}>
              {c.name.split(" ")[0]}
            </div>
          </div>
        );
      })}
      {tooltip && (
        <div style={{ position:"absolute", left:tooltip.coords.x>65?"auto":`${Math.min(tooltip.coords.x+5,55)}%`, right:tooltip.coords.x>65?"8%":"auto", top:`${Math.min(tooltip.coords.y+5,62)}%`, background:t.tooltipBg, border:`1px solid ${riskScore(tooltip.score).color}55`, borderRadius:12, padding:"12px 14px", boxShadow:t.popShadow, zIndex:20, minWidth:170, pointerEvents:"none" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:800, color:t.text, marginBottom:5 }}>{tooltip.name}</div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:riskScore(tooltip.score).color }}>{tooltip.score.toFixed(2)}</span>
            <span style={{ fontSize:11, fontWeight:700, color:riskScore(tooltip.score).color, background:riskScore(tooltip.score).bg, borderRadius:6, padding:"2px 8px" }}>{riskScore(tooltip.score).label}</span>
          </div>
          {(tooltip.issues||[]).slice(0,2).map((iss,i) => <div key={i} style={{ fontSize:11, color:t.textSub, marginTop:2 }}>• {iss}</div>)}
          {(!tooltip.issues||tooltip.issues.length===0) && <div style={{ fontSize:11, color:t.success }}>✓ No active issues</div>}
        </div>
      )}
    </div>
  );
}

// FIX 2: domain changed from [0,100] to [0,1] — backend scores are decimals
function ClinicRankingChart({ t, clinics }) {
  if (!clinics.length) return <EmptyState t={t} label="No ranking data."/>;
  const data = [...clinics].sort((a,b) => b.score-a.score).map(c => ({ name:c.name, score:c.score, color:riskScore(c.score).color }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length*42)}>
      <BarChart data={data} layout="vertical" margin={{ top:0, right:40, left:0, bottom:0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={t.gridLine}/>
        <XAxis type="number" domain={[0, 1]} tickCount={6} tick={{ fontSize:9, fill:t.chartText }} axisLine={false} tickLine={false} tickFormatter={v => v.toFixed(1)}/>
        <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:t.textSub }} axisLine={false} tickLine={false} width={100}/>
        <Tooltip formatter={(v) => [v.toFixed(2),"Risk Score"]} contentStyle={{ fontSize:11, background:t.tooltipBg, border:`1px solid ${t.borderSt}`, borderRadius:8 }} labelStyle={{ color:t.text }}/>
        <ReferenceLine x={0.75} stroke={t.danger}  strokeDasharray="4 4" strokeWidth={1}/>
        <ReferenceLine x={0.50} stroke={t.warning} strokeDasharray="4 4" strokeWidth={1}/>
        <Bar dataKey="score" radius={[0,4,4,0]}>
          {data.map((d,i) => <Cell key={i} fill={d.color}/>)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function TrendCharts({ t }) {
  const [data,    setData]    = useState([]);
  const [active,  setActive]  = useState("absenteeism");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${API}/trends/`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  const charts = [
    { key:"absenteeism", label:"Absenteeism",  color:"#FF4D4D", unit:"%"     },
    { key:"emergencies", label:"Emergencies",  color:"#FFB020", unit:" cases" },
    { key:"delays",      label:"Treat. Delays",color:"#A855F7", unit:" min"  },
    { key:"occupancy",   label:"Bed Occupancy",color:"#00AEEF", unit:"%"     },
  ];
  const ac   = charts.find(c => c.key===active);
  const vals = data.map(d => d[ac.key]).filter(v => v !== undefined);
  const CustomTooltip = ({ active:isAct, payload, label }) => {
    if (!isAct || !payload?.length) return null;
    return (
      <div style={{ background:t.tooltipBg, border:`1px solid ${t.borderSt}`, borderRadius:10, padding:"9px 13px", boxShadow:t.popShadow }}>
        <div style={{ fontSize:10, color:t.textSub, marginBottom:3 }}>{label}</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:ac.color }}>{payload[0]?.value}{ac.unit}</div>
      </div>
    );
  };
  if (loading) return <EmptyState t={t} loading/>;
  if (!data.length) return <EmptyState t={t} label="No trend data available."/>;
  return (
    <div>
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        {charts.map(c => (
          <button key={c.key} onClick={() => setActive(c.key)}
            style={{ padding:"6px 13px", borderRadius:20, background:active===c.key?`${c.color}18`:t.inputBg, border:`1.5px solid ${active===c.key?c.color:t.border}`, cursor:"pointer", fontSize:11, fontWeight:700, color:active===c.key?c.color:t.textSub, fontFamily:"'Syne',sans-serif", transition:"all .18s" }}>
            {c.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <AreaChart data={data} margin={{ top:4, right:4, left:-22, bottom:0 }}>
          <defs>
            <linearGradient id={`grad_${ac.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={ac.color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={ac.color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={t.gridLine} vertical={false}/>
          <XAxis dataKey="day" tick={{ fontSize:9, fill:t.chartText }} axisLine={false} tickLine={false} interval={1}/>
          <YAxis tick={{ fontSize:9, fill:t.chartText }} axisLine={false} tickLine={false}/>
          <Tooltip content={<CustomTooltip/>}/>
          <Area type="monotone" dataKey={ac.key} stroke={ac.color} strokeWidth={2.5} fill={`url(#grad_${ac.key})`} dot={false} activeDot={{ r:5, fill:ac.color, stroke:"#fff", strokeWidth:2 }}/>
        </AreaChart>
      </ResponsiveContainer>
      {vals.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:12, paddingTop:12, borderTop:`1px solid ${t.border}` }}>
          {["Min","Max","Avg"].map(stat => {
            const v = stat==="Min"?Math.min(...vals):stat==="Max"?Math.max(...vals):Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
            return (
              <div key={stat} style={{ background:t.rowBg, border:`1px solid ${t.border}`, borderRadius:9, padding:"8px 10px", textAlign:"center" }}>
                <div style={{ fontSize:10, color:t.textMt, fontFamily:"'Syne',sans-serif", fontWeight:600 }}>{stat}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:800, color:ac.color, marginTop:2 }}>{v}{ac.unit}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ResourceMonitor({ t }) {
  const [resources, setResources] = useState([]);
  const [loading,   setLoading]   = useState(true);
  useEffect(() => {
    fetch(`${API}/resources/`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setResources(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  if (loading) return <EmptyState t={t} loading/>;
  if (!resources.length) return <EmptyState t={t} label="No resource data."/>;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {resources.map(r => {
        const color = resourceColor(r.value, r.warning, r.critical, r.invert);
        return (
          <div key={r.label}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
              <span style={{ fontSize:12, color:t.textSub, fontWeight:500 }}>{r.label}</span>
              <span style={{ fontSize:12, fontWeight:800, fontFamily:"'Syne',sans-serif", color }}>{r.value}%</span>
            </div>
            <div style={{ height:6, background:t.inputBg, borderRadius:4, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${r.value}%`, background:`linear-gradient(90deg,${color}99,${color})`, borderRadius:4, transition:"width .8s ease" }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function kpiStatus(kpi) {
  if (kpi.fmt === "status") return kpi.value >= 1 ? "ok" : "crit";
  if (kpi.hiWarn) {
    if (kpi.crit > 0 && kpi.value >= kpi.crit) return "crit";
    if (kpi.warn > 0 && kpi.value >= kpi.warn) return "warn";
    return "ok";
  }
  if (kpi.loWarn) {
    if (kpi.crit > 0 && kpi.value <= kpi.crit) return "crit";
    if (kpi.warn > 0 && kpi.value <= kpi.warn) return "warn";
    return "ok";
  }
  return "ok";
}
function kpiColor(status, t) {
  if (status==="crit") return t.danger;
  if (status==="warn") return t.warning;
  return t.success;
}
function kpiBarPct(kpi) {
  if (kpi.fmt==="status") return kpi.value>=1?100:0;
  if (kpi.fmt==="pct") return Math.min(kpi.value, 100);
  const ceiling = kpi.hiWarn
    ? Math.max(kpi.crit*1.3, kpi.value*1.2, 10)
    : Math.max(kpi.warn*1.5, kpi.value*1.2, 10);
  return Math.min((kpi.value/ceiling)*100, 100);
}

function KpiMonitor({ t }) {
  const [categories, setCategories] = useState([]);
  const [activeTab,  setActiveTab]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  useEffect(() => {
    fetch(`${API}/kpis/`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setCategories(d); setActiveTab(d[0]?.id || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  if (loading) return <EmptyState t={t} loading/>;
  if (!categories.length) return <EmptyState t={t} label="No KPI data available."/>;
  const cat = categories.find(c => c.id===activeTab) || categories[0];
  const alertCount = (c) => c.kpis.filter(k => kpiStatus(k) !== "ok").length;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:12, marginBottom:4, scrollbarWidth:"none" }}>
        {categories.map(c => {
          const alerts = alertCount(c);
          const isAct  = activeTab === c.id;
          return (
            <button key={c.id} onClick={() => setActiveTab(c.id)}
              style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:20, background:isAct?`${c.color}18`:t.inputBg, border:`1.5px solid ${isAct?c.color:t.border}`, cursor:"pointer", fontSize:11, fontWeight:700, color:isAct?c.color:t.textSub, fontFamily:"'Syne',sans-serif", whiteSpace:"nowrap", flexShrink:0, transition:"all .18s" }}>
              <span style={{ fontSize:13 }}>{c.icon}</span>
              {c.label}
              {alerts > 0 && <span style={{ background:alerts>=2?t.danger:t.warning, color:"#fff", borderRadius:20, padding:"0px 5px", fontSize:9, fontWeight:800, minWidth:16, textAlign:"center" }}>{alerts}</span>}
            </button>
          );
        })}
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, paddingBottom:10, borderBottom:`1px solid ${t.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:18 }}>{cat.icon}</span>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800, color:t.text }}>{cat.label}</div>
            <div style={{ fontSize:10, color:t.textMt }}>{cat.kpis.length} indicators · {alertCount(cat)} flagged</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {[["ok",t.success,"OK"],["warn",t.warning,"Warn"],["crit",t.danger,"Critical"]].map(([s,cl,lbl]) => (
            <span key={s} style={{ fontSize:10, fontWeight:700, background:`${cl}18`, border:`1px solid ${cl}33`, borderRadius:20, padding:"2px 8px", color:cl, fontFamily:"'Syne',sans-serif" }}>
              {cat.kpis.filter(k=>kpiStatus(k)===s).length} {lbl}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {cat.kpis.map((kpi, i) => {
          const status     = kpiStatus(kpi);
          const color      = kpiColor(status, t);
          const pct        = kpiBarPct(kpi);
          const displayVal = kpi.fmt==="status" ? (kpi.value>=1?"Operational":"Offline") : `${kpi.value}${kpi.unit}`;
          return (
            <div key={kpi.key} style={{ animation:"fadeUp .3s ease both", animationDelay:`${i*.04}s` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0, boxShadow:`0 0 5px ${color}66` }}/>
                  <span style={{ fontSize:12, fontWeight:500, color:t.textSub }}>{kpi.label}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  {status!=="ok" && (
                    <span style={{ fontSize:9, fontWeight:800, background:`${color}18`, border:`1px solid ${color}33`, borderRadius:20, padding:"1px 6px", color, fontFamily:"'Syne',sans-serif", textTransform:"uppercase" }}>
                      {status==="crit"?"⚠ Critical":"⚠ Warning"}
                    </span>
                  )}
                  <span style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800, color, minWidth:52, textAlign:"right" }}>{displayVal}</span>
                </div>
              </div>
              {!(kpi.warn===0&&kpi.crit===0) && (
                <div style={{ height:5, background:t.inputBg, borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${color}77,${color})`, borderRadius:3, transition:"width .6s ease" }}/>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlertsPanel({ t }) {
  const [alerts,   setAlerts]   = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading,  setLoading]  = useState(true);
  useEffect(() => {
    fetch(`${API}/alerts/`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setAlerts(d); setExpanded(d[0]?.id || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  const levelCfg = {
    critical: { color:t.danger,  bg:`${t.danger}10`,  bd:`${t.danger}35`,  tag:"CRITICAL" },
    high:     { color:t.warning, bg:`${t.warning}10`, bd:`${t.warning}35`, tag:"HIGH"     },
    warning:  { color:"#FFB020", bg:"rgba(255,176,32,0.08)", bd:"rgba(255,176,32,0.28)", tag:"WARNING" },
  };
  if (loading) return <EmptyState t={t} loading/>;
  if (!alerts.length) return <EmptyState t={t} label="No active alerts."/>;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {alerts.map((a,i) => {
        const cfg   = levelCfg[a.level] || levelCfg.warning;
        const isExp = expanded === a.id;
        return (
          <div key={a.id} onClick={() => setExpanded(isExp?null:a.id)}
            style={{ background:cfg.bg, border:`1px solid ${cfg.bd}`, borderRadius:12, overflow:"hidden", cursor:"pointer", transition:"all .2s", animation:"fadeUp .4s ease both", animationDelay:`${i*.07}s` }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", padding:"13px 15px", gap:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800, color:cfg.color }}>{a.clinic}</span>
                  <span style={{ fontSize:10, fontWeight:700, background:"rgba(0,0,0,0.1)", border:`1px solid ${cfg.bd}`, borderRadius:20, padding:"2px 8px", color:cfg.color, fontFamily:"'Syne',sans-serif" }}>{cfg.tag}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:cfg.color, lineHeight:1 }}>{a.score.toFixed(2)}</span>
                  <span style={{ fontSize:11, color:t.textSub }}>risk score</span>
                </div>
              </div>
              <span style={{ fontSize:15, color:cfg.color, transition:"transform .2s", transform:isExp?"rotate(180deg)":"rotate(0)", lineHeight:1, paddingTop:2, flexShrink:0 }}>▾</span>
            </div>
            <div style={{ padding:"0 15px 12px", display:"flex", flexWrap:"wrap", gap:5 }}>
              {(a.issues||[]).map((iss,j) => (
                <span key={j} style={{ fontSize:10, background:"rgba(0,0,0,0.09)", border:`1px solid ${cfg.bd}`, borderRadius:6, padding:"2px 8px", color:t.textSub }}>⚠ {iss}</span>
              ))}
            </div>
            {isExp && (
              <div style={{ padding:"11px 15px 13px", borderTop:`1px solid ${cfg.bd}`, background:"rgba(0,0,0,0.07)" }}>
                <div style={{ fontSize:10, fontWeight:700, color:cfg.color, letterSpacing:"1.2px", textTransform:"uppercase", fontFamily:"'Syne',sans-serif", marginBottom:8 }}>Recommended Actions</div>
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {(a.actions||[]).map((act,j) => (
                    <div key={j} style={{ display:"flex", alignItems:"flex-start", gap:7 }}>
                      <span style={{ fontSize:12, color:cfg.color, marginTop:1, flexShrink:0 }}>→</span>
                      <span style={{ fontSize:12, color:t.textSub, lineHeight:1.5 }}>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ClinicTable({ t, clinics }) {
  if (!clinics.length) return <EmptyState t={t} label="No clinic data."/>;
  const sorted  = [...clinics].sort((a,b) => b.score-a.score);
  const headers = ["Clinic","Risk Score","Status","Bed Occ.","Staff Avail.","Emergency/hr","Absenteeism","Treat. Delay","ICU Pressure"];
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
        <thead>
          <tr>{headers.map(h => (
            <th key={h} style={{ textAlign:"left", padding:"8px 12px", color:t.textMt, fontWeight:700, fontSize:10, letterSpacing:"0.8px", textTransform:"uppercase", fontFamily:"'Syne',sans-serif", borderBottom:`1px solid ${t.border}`, whiteSpace:"nowrap" }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {sorted.map((c,i) => {
            const rs = riskScore(c.score);
            return (
              <tr key={c.id} style={{ background:i%2===0?"transparent":t.rowBg, transition:"background .15s" }}
                onMouseEnter={e=>e.currentTarget.style.background=`${rs.color}0a`}
                onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"transparent":t.rowBg}>
                <td style={{ padding:"10px 12px", fontFamily:"'Syne',sans-serif", fontWeight:700, color:t.text, whiteSpace:"nowrap" }}>{c.name}</td>
                <td style={{ padding:"10px 12px", fontFamily:"'Syne',sans-serif", fontWeight:800, color:rs.color }}>{c.score.toFixed(2)}</td>
                <td style={{ padding:"10px 12px" }}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:rs.bg, border:`1px solid ${rs.bd}`, borderRadius:20, padding:"2px 8px", fontSize:10, fontWeight:700, color:rs.color, fontFamily:"'Syne',sans-serif", whiteSpace:"nowrap" }}>
                    <span style={{ width:5, height:5, borderRadius:"50%", background:rs.color, display:"inline-block" }}/>{rs.label}
                  </span>
                </td>
                <td style={{ padding:"10px 12px", color:(c.bed_occupancy??0)>=85?t.danger:(c.bed_occupancy??0)>=70?t.warning:t.textSub }}>{c.bed_occupancy??"-"}%</td>
                <td style={{ padding:"10px 12px", color:(c.staff_availability??100)<65?t.danger:(c.staff_availability??100)<75?t.warning:t.textSub }}>{c.staff_availability??"-"}%</td>
                <td style={{ padding:"10px 12px", color:t.textSub }}>{c.emergency_cases??"-"}</td>
                <td style={{ padding:"10px 12px", color:(c.absenteeism??0)>=30?t.danger:(c.absenteeism??0)>=20?t.warning:t.textSub }}>{c.absenteeism??"-"}%</td>
                <td style={{ padding:"10px 12px", color:(c.treatment_delay??0)>=30?t.danger:(c.treatment_delay??0)>=20?t.warning:t.textSub }}>{c.treatment_delay??"-"} min</td>
                <td style={{ padding:"10px 12px", color:(c.icu_pressure??0)>=85?t.danger:(c.icu_pressure??0)>=70?t.warning:t.textSub }}>{c.icu_pressure??"-"}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RecentReports({ t, showToast }) {
  const [reports,     setReports]     = useState([]);
  const [downloading, setDownloading] = useState(null);
  const [loading,     setLoading]     = useState(true);
  useEffect(() => {
    fetch(`${API}/reports/`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setReports(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  const typeColor = { summary:t.accent, daily:t.success, weekly:t.purple, monthly:t.warning };
  const typeLabel = { summary:"Summary", daily:"Daily", weekly:"Weekly", monthly:"Monthly" };
  const handleDownload = (r) => {
    setDownloading(r.id);
    setTimeout(() => { setDownloading(null); showToast(`Downloaded: ${r.title}`, "success"); }, 1400);
  };
  if (loading) return <EmptyState t={t} loading/>;
  if (!reports.length) return <EmptyState t={t} label="No reports available."/>;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {reports.map((r,i) => {
        const color = typeColor[r.type] || t.accent;
        const isDL  = downloading === r.id;
        return (
          <div key={r.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 12px", background:t.rowBg, border:`1px solid ${t.border}`, borderRadius:11, transition:"all .18s", animation:"fadeUp .4s ease both", animationDelay:`${i*.05}s` }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=`${color}55`}
            onMouseLeave={e=>e.currentTarget.style.borderColor=t.border}>
            <div style={{ width:34, height:34, borderRadius:8, background:`${color}18`, border:`1px solid ${color}33`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Ico d={IC.reports} size={15} color={color}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:700, color:t.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.title}</div>
              <div style={{ fontSize:10, color:t.textSub, marginTop:1 }}>{r.date} · {r.size}</div>
            </div>
            <span style={{ fontSize:10, fontWeight:700, background:`${color}18`, border:`1px solid ${color}33`, borderRadius:20, padding:"2px 7px", color, fontFamily:"'Syne',sans-serif", flexShrink:0 }}>{typeLabel[r.type]||r.type}</span>
            <button onClick={() => handleDownload(r)} style={{ width:30, height:30, borderRadius:8, background:isDL?`${t.success}18`:t.accentGl, border:`1px solid ${isDL?t.success:t.accent}33`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, transition:"all .2s" }}>
              {isDL ? <Ico d={IC.check} size={13} color={t.success} stroke={2.5}/> : <Ico d={IC.download} size={13} color={t.accent}/>}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function CNODashboard() {
  const navigate = useNavigate();
  const [dark,         setDark]         = useState(true);
  const [activeNav,    setActiveNav]    = useState("Dashboard");
  const [collapsed,    setCollapsed]    = useState(false);
  const [clinics,      setClinics]      = useState([]);
  const [notifs,       setNotifs]       = useState([]);
  const [profile,      setProfile]      = useState(null);
  const [clinicFilter, setClinicFilter] = useState("All Clinics");
  const [dateRange,    setDateRange]    = useState("Last 14 Days");
  const [toast,        setToast]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const t = mkT(dark);

  useEffect(() => {
    fetch(`${API}/clinic-risk/`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        const list = data.clinics || data || [];
        setClinics(list.map((c, idx) => ({
          id:                 idx + 1,
          name:               c.name,
          score:              c.score,
          trend:              c.trend === "up" ? "↑" : c.trend === "down" ? "↓" : "→",
          issues:             c.issues || [],
          coords:             getCoords(c.name),
          bed_occupancy:      c.bedOccupancy      ?? null,
          staff_availability: c.staffAvailability ?? null,
          emergency_cases:    c.emergencyCases    ?? null,
          absenteeism:        c.absenteeism       ?? null,
          treatment_delay:    c.treatmentDelay    ?? null,
          icu_pressure:       c.icuPressure       ?? null,
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch(`${API}/notifications/`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setNotifs(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API}/profile/`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setProfile(data))
      .catch(() => {});
  }, []);

  const showToast = useCallback((msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    showToast("You have been signed out.", "info");
    setTimeout(() => navigate("/login"), 800);
  }, [showToast, navigate]);

  const filteredClinics = clinicFilter === "All Clinics"
    ? clinics
    : clinics.filter(c => c.name === clinicFilter);

  const criticalCount = clinics.filter(c => c.score >= 0.75).length;
  const alertBadge    = { critical: criticalCount, total: clinics.filter(c => c.score >= 0.50).length };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:t.pageBg, fontFamily:"'DM Sans',sans-serif", transition:"background .3s", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(0,174,239,0.22);border-radius:4px;}
        select option{background:#1a2f4a;color:#fff;}
        button:hover:not(:disabled){filter:brightness(1.08);}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        @keyframes slideIn{from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);}}
        @keyframes dropIn{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{transform:scale(1);opacity:.6;}50%{transform:scale(1.5);opacity:.15;}}
      `}</style>
      <Toast toast={toast}/>
      <Sidebar t={t} active={activeNav} setActive={setActiveNav} collapsed={collapsed} setCollapsed={setCollapsed} dark={dark} setDark={setDark} onLogout={handleLogout} alertCount={alertBadge}/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        <Header t={t} dark={dark} setDark={setDark} notifs={notifs} setNotifs={setNotifs} clinicFilter={clinicFilter} setClinicFilter={setClinicFilter} dateRange={dateRange} setDateRange={setDateRange} clinics={clinics} profile={profile}/>

       <main style={{ flex:1, overflowY:"auto", padding:18, display:"flex", flexDirection:"column", gap:16 }}>
  {(() => {
    if (activeNav === "Risk Heatmap") return (
      <Card t={t} title="Geographic Risk Distribution" sub="Full heatmap view" icon={IC.heatmap} iconColor={t.purple}>
        <GeographicHeatmap t={t} clinics={filteredClinics}/>
      </Card>
    );
    if (activeNav === "Alerts") return (
      <>
        <SummaryStats t={t} clinics={clinics}/>
        <Card t={t} title="Active System Alerts" sub="Click an alert to expand recommended actions" icon={IC.alerts} iconColor={t.danger}>
          <AlertsPanel t={t}/>
        </Card>
      </>
    );
    if (activeNav === "Reports") return (
      <Card t={t} title="Recent Reports" sub="Latest submitted operational reports" icon={IC.reports} iconColor={t.accent}>
        <RecentReports t={t} showToast={showToast}/>
      </Card>
    );
    // Default: Dashboard
    return (
      <>
        {criticalCount > 0 && (
          <div style={{ background:`${t.danger}12`, border:`1px solid ${t.danger}44`, borderRadius:10, padding:"10px 16px", display:"flex", alignItems:"center", gap:10, animation:"fadeUp .3s ease both" }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:t.danger, animation:"pulse 1.5s ease infinite", flexShrink:0 }}/>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:t.danger }}>
              {criticalCount} Critical Clinic{criticalCount>1?"s":""} Require Immediate Attention
            </span>
            <div style={{ marginLeft:"auto", fontSize:11, color:t.danger, fontWeight:600 }}>
              {new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})} · {new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
            </div>
          </div>
        )}
        {loading && (
          <div style={{ background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:10, padding:"12px 20px", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:t.accent, animation:"pulse 1.5s ease infinite", flexShrink:0 }}/>
            <span style={{ fontSize:12, color:t.textSub, fontFamily:"'Syne',sans-serif" }}>Loading clinic data from server…</span>
          </div>
        )}
        <SummaryStats t={t} clinics={clinics}/>
        <Card t={t} title="Clinic Performance Overview" sub={`${filteredClinics.length} facilities · ${dateRange}`} icon={IC.dashboard} iconColor={t.accent}
          action={<span style={{ fontSize:11, color:t.textMt, background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:6, padding:"3px 9px" }}>{new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>}>
          <ClinicCards t={t} clinics={filteredClinics} dark={dark}/>
        </Card>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:14, alignItems:"start" }}>
          <Card t={t} title="Geographic Risk Distribution" sub="Hover a marker for clinic details" icon={IC.heatmap} iconColor={t.purple}>
            <GeographicHeatmap t={t} clinics={filteredClinics}/>
          </Card>
          <Card t={t} title="Risk Ranking" sub="By instability score · EBM" icon={IC.activity} iconColor={t.danger}>
            <ClinicRankingChart t={t} clinics={filteredClinics}/>
            <div style={{ display:"flex", gap:12, marginTop:10, paddingTop:10, borderTop:`1px solid ${t.border}` }}>
              <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, color:t.textMt }}>
                <span style={{ display:"inline-block", width:24, height:1, borderTop:`2px dashed ${t.danger}` }}/> Critical ≥ 0.75
              </span>
              <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:10, color:t.textMt }}>
                <span style={{ display:"inline-block", width:24, height:1, borderTop:`2px dashed ${t.warning}` }}/> High ≥ 0.50
              </span>
            </div>
          </Card>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 260px", gap:14, alignItems:"start" }}>
          <Card t={t} title="Operational Trend Analysis" sub={`${dateRange} · click a tab to switch metric`} icon={IC.trend} iconColor={t.success}
            action={
              <button onClick={() => window.location.reload()} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:8, cursor:"pointer", fontSize:11, color:t.textSub, fontWeight:600, fontFamily:"'Syne',sans-serif" }}>
                <Ico d={IC.refresh} size={11} color={t.textSub}/> Refresh
              </button>
            }>
            <TrendCharts t={t}/>
          </Card>
          <Card t={t} title="Resource Pressure" sub="System capacity indicators" icon={IC.alerts} iconColor={t.warning}>
            <ResourceMonitor t={t}/>
          </Card>
        </div>
        <Card t={t} title="Clinical KPI Monitor" sub="Live indicators — click a category tab to explore" icon={IC.activity} iconColor={t.danger}>
          <KpiMonitor t={t}/>
        </Card>
        <Card t={t} title="Active System Alerts" sub="Click an alert to expand recommended actions" icon={IC.alerts} iconColor={t.danger}>
          <AlertsPanel t={t}/>
        </Card>
        <Card t={t} title="Clinic Status Overview · All Facilities" sub="Color-coded KPI columns — red = critical, amber = warning" icon={IC.dashboard} iconColor={t.accent}>
          <ClinicTable t={t} clinics={filteredClinics}/>
        </Card>
        <Card t={t} title="Recent Reports" sub="Latest submitted operational reports" icon={IC.reports} iconColor={t.accent}>
          <RecentReports t={t} showToast={showToast}/>
        </Card>
      </>
    );
  })()}
</main>
      </div>
    </div>
  );
}
