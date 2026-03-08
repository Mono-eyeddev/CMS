import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { submitKPI } from "../api/kpi";
// ─── THEME ────────────────────────────────────────────────────────────────────
const mkTheme = (dark) => ({
  pageBg:      dark ? "#020d1f"                    : "#EEF2F7",
  sidebarBg:   dark ? "rgba(2,13,31,0.98)"         : "#FFFFFF",
  headerBg:    dark ? "rgba(2,13,31,0.94)"         : "rgba(255,255,255,0.97)",
  cardBg:      dark ? "rgba(255,255,255,0.028)"    : "#FFFFFF",
  cardHd:      dark ? "rgba(0,174,239,0.04)"       : "rgba(0,119,182,0.03)",
  inputBg:     dark ? "rgba(255,255,255,0.055)"    : "#F0F4F8",
  popBg:       dark ? "#0a1e36"                    : "#FFFFFF",
  statBg:      dark ? "rgba(0,174,239,0.06)"       : "#EAF3FB",
  rowBg:       dark ? "rgba(255,255,255,0.018)"    : "#FFFFFF",
  border:      dark ? "rgba(0,174,239,0.11)"       : "#D0DFF0",
  borderSt:    dark ? "rgba(0,174,239,0.24)"       : "#A8C4E0",
  inputBd:     dark ? "rgba(0,174,239,0.20)"       : "#B8D0E8",
  text:        dark ? "#FFFFFF"                    : "#0A1628",
  textSub:     dark ? "#6B7A99"                    : "#3D5175",
  textMt:      dark ? "#3D5175"                    : "#8FA3BF",
  accent:      dark ? "#00AEEF"                    : "#0077B6",
  accentDk:    dark ? "#0077B6"                    : "#005A8E",
  accentGl:    dark ? "rgba(0,174,239,0.13)"       : "rgba(0,119,182,0.09)",
  success:     dark ? "#00C48C"                    : "#009E72",
  warning:     dark ? "#FFB020"                    : "#C4870A",
  danger:      dark ? "#FF4D4D"                    : "#D93636",
  shadow:      dark ? "0 4px 28px rgba(0,0,0,.40)" : "0 4px 28px rgba(10,22,40,.09)",
  popShadow:   dark ? "0 16px 48px rgba(0,0,0,.6)" : "0 16px 48px rgba(10,22,40,.16)",
  overlay:     dark ? "rgba(0,0,0,.55)"            : "rgba(10,22,40,.35)",
});

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_NOTIFS = [
  { id:1, type:"warning", title:"Submission Reminder",    body:"Today's KPI report is due at 6:30 PM.",       time:"2h ago",  read:false },
  { id:2, type:"success", title:"Report Approved",        body:"March 3rd report approved by CNO.",           time:"Yesterday",read:false },
  { id:3, type:"danger",  title:"Missing KPIs Flagged",   body:"March 2nd report flagged — incomplete data.", time:"2d ago",  read:true  },
  { id:4, type:"info",    title:"System Maintenance",     body:"Scheduled downtime Sunday 2–4 AM.",           time:"3d ago",  read:true  },
];

const MOCK_HISTORY = [
  { id:1, date:"Today",       status:"draft",   note:"Saved draft — not submitted" },
  { id:2, date:"Yesterday",   status:"success", note:"Submitted 6:22 PM"           },
  { id:3, date:"2 days ago",  status:"failed",  note:"Missing KPIs"                },
  { id:4, date:"3 days ago",  status:"success", note:"Submitted 5:58 PM"           },
  { id:5, date:"4 days ago",  status:"success", note:"Submitted 6:15 PM"           },
];

const DEFAULT_KPI = {

  // Shift
  shift: "DAY",

  // ===============================
  // A – Patient Load
  // ===============================
  total_patients: "",
  new_cases: "",
  emergency_cases: "",
  critical_cases: "",
  icu_transfers: "",
  mortality_count: "",

  // ===============================
  // B – Staffing
  // ===============================
  staff_on_duty: "",
  nurses_absent: "",
  overtime_hours: "",

  // ===============================
  // C – Critical Handling
  // ===============================
  unattended_critical_cases: "",

  // ===============================
  // D – Infrastructure
  // ===============================
  power_outage_hours: "",
  internet_downtime_hours: "",
  stockout_oxygen: "No",
  stockout_essential_drugs: "No",

  // ===============================
  // E – Quality
  // ===============================
  bed_occupancy_rate: "",
  readmission_rate: "",
  patient_complaints: "",

  // ===============================
  // F – Disease Surveillance
  // ===============================
  malaria_cases: "",
  cholera_cases: "",
  respiratory_cases: "",

  // ===============================
  // G – Service Turnaround Time
  // ===============================
  triage_wait_time: "",
  lab_turnaround_time: "",
  pharmacy_wait_time: "",

  // ===============================
  // H – Manager Comments
  // ===============================
  comments: ""

};

const KPI_BLOCKS = [

  // ===============================
  // A. PATIENT LOAD
  // ===============================

  {
    id: "A",
    label: "Patient Load",
    color: "#00AEEF",
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    fields: [
      { key: "total_patients", label: "Total Patients", type: "number", unit: "pts" },
      { key: "new_cases", label: "New Cases", type: "number", unit: "pts" },
      { key: "emergency_cases", label: "Emergency Cases", type: "number", unit: "pts" },
      { key: "critical_cases", label: "Critical Cases", type: "number", unit: "pts" },
      { key: "icu_transfers", label: "ICU Transfers", type: "number", unit: "pts" },
      { key: "mortality_count", label: "Mortality Count", type: "number", unit: "pts" }
    ]
  },

  // ===============================
  // B. STAFFING
  // ===============================

  {
    id: "B",
    label: "Staffing",
    color: "#00C48C",
    icon: "M17 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    fields: [
      { key: "staff_on_duty", label: "Staff on Duty", type: "number", unit: "ppl" },
      { key: "nurses_absent", label: "Nurses Absent", type: "number", unit: "ppl" },
      { key: "overtime_hours", label: "Overtime Hours", type: "number", unit: "hrs" }
    ]
  },

  // ===============================
  // C. CRITICAL HANDLING
  // ===============================

  {
    id: "C",
    label: "Critical Handling",
    color: "#FF4D4D",
    icon: "M22 12h-4l-3 9L9 3l-3 9H2",
    fields: [
      { key: "unattended_critical_cases", label: "Unattended Critical Cases", type: "number", unit: "pts" }
    ]
  },

  // ===============================
  // D. INFRASTRUCTURE
  // ===============================

  {
    id: "D",
    label: "Infrastructure",
    color: "#FFB020",
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    fields: [
      { key: "power_outage_hours", label: "Power Outage Hours", type: "number", unit: "hrs" },
      { key: "internet_downtime_hours", label: "Internet Downtime Hours", type: "number", unit: "hrs" },
      { key: "stockout_oxygen", label: "Stockout: Oxygen", type: "select", options: ["No", "Yes"] },
      { key: "stockout_essential_drugs", label: "Stockout: Essential Drugs", type: "select", options: ["No", "Yes"] }
    ]
  },

  // ===============================
  // E. QUALITY
  // ===============================

  {
    id: "E",
    label: "Quality",
    color: "#A855F7",
    icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
    fields: [
      { key: "bed_occupancy_rate", label: "Bed Occupancy Rate", type: "number", unit: "%" },
      { key: "readmission_rate", label: "Readmission Rate", type: "number", unit: "%" },
      { key: "patient_complaints", label: "Patient Complaints", type: "number", unit: "no" }
    ]
  },

  // ===============================
  // F. DISEASE SURVEILLANCE
  // ===============================

  {
    id: "F",
    label: "Disease Surveillance",
    color: "#EF4444",
    icon: "M3 12h18M12 3v18",
    fields: [
      { key: "malaria_cases", label: "Malaria Cases", type: "number", unit: "cases" },
      { key: "cholera_cases", label: "Cholera Cases", type: "number", unit: "cases" },
      { key: "respiratory_cases", label: "Respiratory Cases", type: "number", unit: "cases" }
    ]
  },

  // ===============================
  // G. SERVICE TURNAROUND TIMES
  // ===============================

  {
    id: "G",
    label: "Service Turnaround Time",
    color: "#0EA5E9",
    icon: "M12 8v4l3 3",
    fields: [
      { key: "triage_wait_time", label: "Triage Wait Time", type: "number", unit: "mins" },
      { key: "lab_turnaround_time", label: "Lab Result Time", type: "number", unit: "mins" },
      { key: "pharmacy_wait_time", label: "Pharmacy Wait Time", type: "number", unit: "mins" }
    ]
  },

  // ===============================
  // H. COMMENTS
  // ===============================

{
  id: "H",
  label: "Manager Comments",
  color: "#64748B",
  icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14",
  fields: [
    { 
      key: "comments", 
      label: "Additional Notes", 
      type: "textarea",
      inputType: "text"  // Force text input
    }
  ]
}

];


// ─── ICON ─────────────────────────────────────────────────────────────────────
const Ico = ({ d, size=18, color="currentColor", stroke=2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useOutsideClick(ref, handler) {
  useEffect(() => {
    const listener = (e) => { if (ref.current && !ref.current.contains(e.target)) handler(); };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

// ─── COUNTDOWN TIMER ─────────────────────────────────────────────────────────
function useDeadlineCountdown() {
  const [timeLeft, setTimeLeft] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [shiftLabel, setShiftLabel] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Current time in minutes since midnight
      const currentMinutes = hours * 60 + minutes;
      const dayStart = 6 * 60 + 30;   // 06:30
      const nightStart = 18 * 60 + 30; // 18:30

      let deadline = new Date();
      let label = "";

      const isDayShift = currentMinutes >= dayStart && currentMinutes < nightStart;

      if (isDayShift) {
        // Day shift: 06:30 → 18:30
        label = "Day Shift";
        deadline.setHours(18, 30, 0, 0);
      } else {
        // Night shift: 18:30 → 06:30 next day
        label = "Night Shift";
        deadline.setHours(6, 30, 0, 0);
        // If we're past midnight (00:00–06:30), deadline is today
        // If we're before midnight (18:30–23:59), deadline is tomorrow
        if (currentMinutes >= nightStart) {
          deadline.setDate(deadline.getDate() + 1);
        }
      }

      setShiftLabel(label);

      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft("Deadline passed");
        setUrgent(true);
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setUrgent(diff < 3600000); // urgent if less than 1 hour left
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return { timeLeft, urgent, shiftLabel };
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function Badge({ status, t }) {
  const cfg = {
    success: { bg:t.success+"18", bd:t.success+"44", color:t.success, label:"Submitted" },
    draft:   { bg:t.warning+"18", bd:t.warning+"44", color:t.warning, label:"Draft"     },
    failed:  { bg:t.danger +"18", bd:t.danger +"44", color:t.danger,  label:"Failed"    },
    pending: { bg:t.accent +"18", bd:t.accent +"44", color:t.accent,  label:"Pending"   },
  }[status] || { bg:t.accentGl, bd:t.borderSt, color:t.accent, label:status };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:"5px", background:cfg.bg, border:`1px solid ${cfg.bd}`, borderRadius:"20px", padding:"3px 10px", fontSize:"11px", fontWeight:700, color:cfg.color, fontFamily:"'Syne',sans-serif", whiteSpace:"nowrap" }}>
      <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:cfg.color, display:"inline-block" }}/>
      {cfg.label}
    </span>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const colors = { success:"#00C48C", error:"#FF4D4D", info:"#00AEEF", warning:"#FFB020" };
  return (
    <div style={{ position:"fixed", top:"20px", right:"24px", zIndex:9999, background:colors[toast.type]||"#00C48C", color:"#fff", borderRadius:"12px", padding:"13px 20px", fontSize:"13px", fontWeight:700, fontFamily:"'Syne',sans-serif", boxShadow:"0 8px 32px rgba(0,0,0,.35)", display:"flex", alignItems:"center", gap:"10px", animation:"slideIn .3s ease both", maxWidth:"340px" }}>
      <Ico d={toast.type==="error"?"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01":"M20 6L9 17l-5-5"} size={16} color="#fff"/>
      {toast.msg}
    </div>
  );
}

// ─── NOTIFICATION PANEL ───────────────────────────────────────────────────────
function NotifPanel({ t, notifs, setNotifs, onClose }) {
  const ref = useRef();
  useOutsideClick(ref, onClose);
  const unread = notifs.filter(n=>!n.read).length;
  const typeIcon = { warning:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01", success:"M20 6L9 17l-5-5", danger:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01", info:"M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 16v-4M12 8h.01" };
  const typeColor = { warning:t.warning, success:t.success, danger:t.danger, info:t.accent };
  return (
    <div ref={ref} style={{ position:"absolute", top:"calc(100% + 10px)", right:0, width:"340px", background:t.popBg, border:`1px solid ${t.borderSt}`, borderRadius:"16px", boxShadow:t.popShadow, zIndex:500, overflow:"hidden", animation:"dropIn .2s ease both" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderBottom:`1px solid ${t.border}`, background:t.cardHd }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"14px", color:t.text }}>Notifications</div>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          {unread>0 && <span style={{ background:t.accent, color:"#fff", borderRadius:"20px", padding:"2px 8px", fontSize:"10px", fontWeight:700, fontFamily:"'Syne',sans-serif" }}>{unread} new</span>}
          <button onClick={()=>setNotifs(n=>n.map(x=>({...x,read:true})))} style={{ fontSize:"11px", color:t.accent, background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>Mark all read</button>
        </div>
      </div>
      <div style={{ maxHeight:"320px", overflowY:"auto" }}>
        {notifs.map(n=>(
          <div key={n.id} onClick={()=>setNotifs(prev=>prev.map(x=>x.id===n.id?{...x,read:true}:x))}
            style={{ display:"flex", gap:"12px", padding:"13px 18px", borderBottom:`1px solid ${t.border}`, cursor:"pointer", background:n.read?"transparent":t.accentGl, transition:"background .15s" }}>
            <div style={{ width:"34px", height:"34px", borderRadius:"9px", background:typeColor[n.type]+"18", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Ico d={typeIcon[n.type]} size={15} color={typeColor[n.type]}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"12px", fontWeight:700, color:t.text, marginBottom:"2px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span>{n.title}</span>
                {!n.read && <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:t.accent, display:"inline-block", flexShrink:0 }}/>}
              </div>
              <div style={{ fontSize:"12px", color:t.textSub, lineHeight:1.5 }}>{n.body}</div>
              <div style={{ fontSize:"10px", color:t.textMt, marginTop:"4px" }}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding:"12px 18px", borderTop:`1px solid ${t.border}`, textAlign:"center" }}>
        <button onClick={onClose} style={{ fontSize:"12px", color:t.accent, background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>View all notifications</button>
      </div>
    </div>
  );
}

// ─── SETTINGS PANEL ───────────────────────────────────────────────────────────
function SettingsPanel({ t, dark, setDark, onClose }) {
  const ref = useRef();
  useOutsideClick(ref, onClose);
  const [fontSize, setFontSize] = useState("Medium");
  const [compactMode, setCompactMode] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const Toggle = ({ val, setVal }) => (
    <div onClick={()=>setVal(v=>!v)} style={{ width:"40px", height:"22px", borderRadius:"11px", background:val?t.accent:t.inputBg, border:`1px solid ${val?t.accent:t.border}`, cursor:"pointer", position:"relative", transition:"all .2s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:"2px", left:val?"20px":"2px", width:"18px", height:"18px", borderRadius:"50%", background:"#fff", transition:"left .2s", boxShadow:"0 1px 4px rgba(0,0,0,.2)" }}/>
    </div>
  );

  return (
    <div ref={ref} style={{ position:"absolute", top:"calc(100% + 10px)", right:0, width:"300px", background:t.popBg, border:`1px solid ${t.borderSt}`, borderRadius:"16px", boxShadow:t.popShadow, zIndex:500, overflow:"hidden", animation:"dropIn .2s ease both" }}>
      <div style={{ padding:"14px 18px", borderBottom:`1px solid ${t.border}`, background:t.cardHd }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"14px", color:t.text }}>Settings</div>
      </div>
      <div style={{ padding:"14px 18px", display:"flex", flexDirection:"column", gap:"14px" }}>
        {/* Theme */}
        <div>
          <div style={{ fontSize:"10px", fontWeight:700, color:t.textMt, letterSpacing:"1px", textTransform:"uppercase", fontFamily:"'Syne',sans-serif", marginBottom:"8px" }}>Appearance</div>
          <div style={{ display:"flex", gap:"8px" }}>
            {["Dark","Light"].map(mode=>(
              <button key={mode} onClick={()=>setDark(mode==="Dark")}
                style={{ flex:1, padding:"9px", borderRadius:"9px", background:(dark&&mode==="Dark")||(!dark&&mode==="Light")?t.accent+"18":t.inputBg, border:`1.5px solid ${(dark&&mode==="Dark")||(!dark&&mode==="Light")?t.accent:t.border}`, cursor:"pointer", fontSize:"12px", fontWeight:700, color:(dark&&mode==="Dark")||(!dark&&mode==="Light")?t.accent:t.textSub, fontFamily:"'Syne',sans-serif" }}>
                {mode==="Dark"?"🌙 Dark":"☀️ Light"}
              </button>
            ))}
          </div>
        </div>
        {/* Font size */}
        <div>
          <div style={{ fontSize:"10px", fontWeight:700, color:t.textMt, letterSpacing:"1px", textTransform:"uppercase", fontFamily:"'Syne',sans-serif", marginBottom:"8px" }}>Font Size</div>
          <div style={{ display:"flex", gap:"6px" }}>
            {["Small","Medium","Large"].map(sz=>(
              <button key={sz} onClick={()=>setFontSize(sz)}
                style={{ flex:1, padding:"7px", borderRadius:"8px", background:fontSize===sz?t.accent+"18":t.inputBg, border:`1.5px solid ${fontSize===sz?t.accent:t.border}`, cursor:"pointer", fontSize:"11px", fontWeight:700, color:fontSize===sz?t.accent:t.textSub, fontFamily:"'Syne',sans-serif" }}>
                {sz}
              </button>
            ))}
          </div>
        </div>
        {/* Toggles */}
        {[
          { label:"Compact Mode",   sub:"Reduce spacing and padding", val:compactMode, set:setCompactMode },
          { label:"Email Alerts",   sub:"Get notified via email",     val:emailAlerts,  set:setEmailAlerts },
          { label:"Auto-save Draft",sub:"Save form progress automatically", val:autoSave, set:setAutoSave },
        ].map(item=>(
          <div key={item.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px" }}>
            <div>
              <div style={{ fontSize:"13px", fontWeight:600, color:t.text }}>{item.label}</div>
              <div style={{ fontSize:"11px", color:t.textSub }}>{item.sub}</div>
            </div>
            <Toggle val={item.val} setVal={item.set}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PROFILE PANEL ────────────────────────────────────────────────────────────
function ProfilePanel({ t, onLogout, onClose }) {
  const ref = useRef();
  useOutsideClick(ref, onClose);
  const menuItems = [
    { icon:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", label:"My Profile",    color:t.accent   },
    { icon:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",          label:"My Reports",    color:t.success  },
    { icon:"M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2", label:"Activity Log", color:t.warning },
    { icon:"M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",                                            label:"Preferences",   color:"#A855F7"  },
  ];
  return (
    <div ref={ref} style={{ position:"absolute", top:"calc(100% + 10px)", right:0, width:"260px", background:t.popBg, border:`1px solid ${t.borderSt}`, borderRadius:"16px", boxShadow:t.popShadow, zIndex:500, overflow:"hidden", animation:"dropIn .2s ease both" }}>
      {/* Profile header */}
      <div style={{ padding:"18px", background:`linear-gradient(135deg, ${t.accent}22, ${t.accentDk}11)`, borderBottom:`1px solid ${t.border}`, textAlign:"center" }}>
        <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:`linear-gradient(135deg,${t.accent},${t.accentDk})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px", fontSize:"22px", fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif", boxShadow:`0 6px 20px ${t.accent}44` }}>M</div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"15px", color:t.text }}>Clinical Manager</div>
        <div style={{ fontSize:"12px", color:t.textSub, marginTop:"3px" }}>manager@clinic.gov</div>
        <div style={{ marginTop:"8px", display:"inline-flex", alignItems:"center", gap:"5px", background:t.success+"18", border:`1px solid ${t.success}44`, borderRadius:"20px", padding:"4px 10px" }}>
          <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:t.success, display:"inline-block" }}/>
          <span style={{ fontSize:"11px", color:t.success, fontWeight:700 }}>Active</span>
        </div>
      </div>
      {/* Menu */}
      <div style={{ padding:"8px" }}>
        {menuItems.map(item=>(
          <button key={item.label}
            style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", width:"100%", background:"transparent", border:"none", borderRadius:"9px", cursor:"pointer", color:t.textSub, fontSize:"13px", fontFamily:"'DM Sans',sans-serif", textAlign:"left", transition:"background .15s" }}
            onMouseEnter={e=>e.currentTarget.style.background=t.inputBg}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{ width:"30px", height:"30px", borderRadius:"8px", background:item.color+"18", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ico d={item.icon} size={14} color={item.color}/>
            </div>
            <span style={{ fontWeight:500, color:t.text }}>{item.label}</span>
          </button>
        ))}
      </div>
      <div style={{ padding:"8px", borderTop:`1px solid ${t.border}` }}>
        <button onClick={onLogout}
          style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", width:"100%", background:"rgba(255,77,77,.08)", border:"1px solid rgba(255,77,77,.2)", borderRadius:"9px", cursor:"pointer", color:t.danger, fontSize:"13px", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
          <Ico d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={15} color={t.danger}/>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ t, active, setActive, collapsed, setCollapsed, mobileOpen, setMobileOpen, dark, setDark, onLogout }) {
  const navItems = [
    { label:"Dashboard",          icon:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
    { label:"Submit Report",      icon:"M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" },
    { label:"Submission History", icon:"M12 8v4l3 3M3.05 11a9 9 0 1 0 .5-4M3 3v5h5" },
    { label:"Reports",            icon:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8" },
  ];
  const w = collapsed ? "68px" : "240px";
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && <div onClick={()=>setMobileOpen(false)} style={{ position:"fixed", inset:0, background:t.overlay, zIndex:40, backdropFilter:"blur(3px)" }}/>}

      <aside style={{
        width: w,
        minWidth: w,
        flexShrink: 0,
        background: t.sidebarBg,
        borderRight: `1px solid ${t.border}`,
        display: "flex",
        flexDirection: "column",
        padding: collapsed ? "20px 10px" : "22px 14px",
        transition: "all 0.28s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
        boxShadow: t.shadow,
        position: "relative",
        zIndex: 50,
        // Mobile: fixed overlay
        ...(typeof window !== "undefined" && window.innerWidth < 768 ? {
          position:"fixed", left: mobileOpen?"0":"-260px", top:0, bottom:0, width:"240px", zIndex:50,
        } : {}),
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"22px", paddingBottom:"18px", borderBottom:`1px solid ${t.border}`, overflow:"hidden" }}>
           <svg
    xmlns="http://www.w3.org/2000/svg"
    width="60"
    height="60"
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
          {!collapsed && (
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"17px", color:t.text, letterSpacing:"2px", whiteSpace:"nowrap" }}>CMS</div>
              <div style={{ fontSize:"10px", color:t.textSub, letterSpacing:"1px" }}>Manager Portal</div>
            </div>
          )}
        </div>

        {/* Collapse toggle (desktop only) */}
        <button onClick={()=>setCollapsed(c=>!c)}
          style={{ position:"absolute", top:"26px", right:"-13px", width:"26px", height:"26px", borderRadius:"50%", background:t.sidebarBg, border:`1px solid ${t.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:t.textSub, zIndex:60, boxShadow:t.shadow }}>
          <Ico d={collapsed?"M9 18l6-6-6-6":"M15 18l-6-6 6-6"} size={12} color={t.textSub}/>
        </button>

        {/* Nav items */}
        <nav style={{ display:"flex", flexDirection:"column", gap:"2px", flex:1 }}>
          {navItems.map(item=>{
            const isAct = active===item.label;
            return (
              <button key={item.label}
                onClick={()=>{ setActive(item.label); setMobileOpen(false); }}
                title={collapsed?item.label:""}
                style={{ display:"flex", alignItems:"center", gap:collapsed?0:"10px", justifyContent:collapsed?"center":"flex-start", padding:collapsed?"11px":"10px 12px", borderRadius:"10px", background:isAct?t.accent+"18":"transparent", borderLeft:!collapsed&&isAct?`3px solid ${t.accent}`:"3px solid transparent", paddingLeft:!collapsed&&isAct?"10px":collapsed?undefined:"12px", border:"none", cursor:"pointer", color:isAct?t.accent:t.textSub, fontSize:"13px", fontFamily:"'DM Sans',sans-serif", textAlign:"left", transition:"all .2s", width:"100%", overflow:"hidden", whiteSpace:"nowrap" }}>
                <div style={{ flexShrink:0 }}><Ico d={item.icon} size={16} color={isAct?t.accent:t.textSub}/></div>
                {!collapsed && <span style={{ fontWeight:isAct?700:400 }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom: theme + logout */}
        <div style={{ display:"flex", flexDirection:"column", gap:"6px", paddingTop:"14px", borderTop:`1px solid ${t.border}` }}>
          <button onClick={()=>setDark(d=>!d)}
            title={collapsed?(dark?"Light Mode":"Dark Mode"):""}
            style={{ display:"flex", alignItems:"center", gap:collapsed?0:"10px", justifyContent:collapsed?"center":"flex-start", padding:collapsed?"10px":"9px 12px", background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:"10px", cursor:"pointer", color:t.textSub, fontSize:"12px", fontFamily:"'DM Sans',sans-serif", fontWeight:500, overflow:"hidden", whiteSpace:"nowrap", width:"100%" }}>
            <Ico d={dark?"M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z":"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"} size={15} color={t.accent}/>
            {!collapsed && <span>{dark?"Light Mode":"Dark Mode"}</span>}
            {!collapsed && <span style={{ marginLeft:"auto", background:t.accent+"20", border:`1px solid ${t.accent}33`, borderRadius:"20px", padding:"2px 7px", fontSize:"10px", color:t.accent, fontWeight:700 }}>{dark?"☀️":"🌙"}</span>}
          </button>
          <button onClick={onLogout}
            title={collapsed?"Logout":""}
            style={{ display:"flex", alignItems:"center", gap:collapsed?0:"10px", justifyContent:collapsed?"center":"flex-start", padding:collapsed?"10px":"9px 12px", background:"rgba(255,77,77,.07)", border:"1px solid rgba(255,77,77,.18)", borderRadius:"10px", cursor:"pointer", color:t.danger, fontSize:"13px", fontFamily:"'DM Sans',sans-serif", fontWeight:600, overflow:"hidden", whiteSpace:"nowrap", width:"100%" }}>
            <Ico d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" size={15} color={t.danger}/>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header({ t, dark, setDark, notifs, setNotifs, mobileOpen, setMobileOpen }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const unread = notifs.filter(n=>!n.read).length;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});

  const closeAll = () => { setShowNotif(false); setShowSettings(false); setShowProfile(false); };

  return (
    <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px 0 16px", height:"62px", background:t.headerBg, backdropFilter:"blur(20px)", borderBottom:`1px solid ${t.border}`, flexShrink:0, boxShadow:t.shadow, position:"sticky", top:0, zIndex:30 }}>
      {/* Left: hamburger + title */}
      <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
        <button onClick={()=>setMobileOpen(o=>!o)} style={{ width:"36px", height:"36px", borderRadius:"9px", background:t.inputBg, border:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:t.textSub }}>
          <Ico d="M3 12h18M3 6h18M3 18h18" size={17} color={t.textSub}/>
        </button>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:800, color:t.text, lineHeight:1.2 }}>Clinic Manager Dashboard</div>
          <div style={{ fontSize:"11px", color:t.textSub }}>{dateStr}</div>
        </div>
      </div>

      {/* Right: actions */}
      <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>

        {/* Notifications */}
        <div style={{ position:"relative" }}>
          <button onClick={()=>{ closeAll(); setShowNotif(v=>!v); }}
            style={{ width:"38px", height:"38px", borderRadius:"10px", background:showNotif?t.accentGl:t.inputBg, border:`1px solid ${showNotif?t.accent:t.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"relative", transition:"all .2s" }}>
            <Ico d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={17} color={showNotif?t.accent:t.textSub}/>
            {unread>0 && <span style={{ position:"absolute", top:"7px", right:"7px", width:"8px", height:"8px", borderRadius:"50%", background:t.danger, border:`2px solid ${t.headerBg}` }}/>}
          </button>
          {showNotif && <NotifPanel t={t} notifs={notifs} setNotifs={setNotifs} onClose={()=>setShowNotif(false)}/>}
        </div>

        {/* Settings */}
        <div style={{ position:"relative" }}>
          <button onClick={()=>{ closeAll(); setShowSettings(v=>!v); }}
            style={{ width:"38px", height:"38px", borderRadius:"10px", background:showSettings?t.accentGl:t.inputBg, border:`1px solid ${showSettings?t.accent:t.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all .2s" }}>
            <Ico d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" size={17} color={showSettings?t.accent:t.textSub}/>
          </button>
          {showSettings && <SettingsPanel t={t} dark={dark} setDark={setDark} onClose={()=>setShowSettings(false)}/>}
        </div>

        {/* Dark/light quick toggle */}
        <button onClick={()=>setDark(d=>!d)}
          style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 12px", background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:"10px", cursor:"pointer", fontSize:"12px", fontWeight:600, color:t.textSub, fontFamily:"'DM Sans',sans-serif" }}>
          <Ico d={dark?"M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z":"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"} size={14} color={t.accent}/>
          <span style={{ display:"none", "@media(minWidth:600px)":{ display:"block" } }}>{dark?"Light":"Dark"}</span>
        </button>

        {/* Profile avatar */}
        <div style={{ position:"relative" }}>
          <button onClick={()=>{ closeAll(); setShowProfile(v=>!v); }}
            style={{ width:"38px", height:"38px", borderRadius:"10px", background:`linear-gradient(135deg,${t.accent},${t.accentDk})`, border:`2px solid ${showProfile?t.accent:t.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:"15px", fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif", boxShadow:showProfile?`0 4px 16px ${t.accent}44`:"none", transition:"all .2s" }}>
            M
          </button>
          {showProfile && <ProfilePanel t={t} onLogout={()=>navigate("/login")} onClose={()=>setShowProfile(false)}/>}
        </div>
      </div>
    </header>
  );
}

// ─── DEADLINE BANNER ──────────────────────────────────────────────────────────
function DeadlineBanner({ t }) {
  const { timeLeft, urgent, shiftLabel } = useDeadlineCountdown();
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 18px", background:urgent?t.danger+"12":t.accentGl, border:`1px solid ${urgent?t.danger+"44":t.borderSt}`, borderRadius:"12px" }}>
      <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:urgent?t.danger+"20":t.accent+"20", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Ico d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2" size={16} color={urgent?t.danger:t.accent}/>
      </div>
      <div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"13px", fontWeight:700, color:urgent?t.danger:t.text }}>
          {shiftLabel} Deadline: {shiftLabel === "Day Shift" ? "6:30 PM" : "6:30 AM"}
        </div>
        <div style={{ fontSize:"12px", color:t.textSub, marginTop:"1px" }}>
          Time remaining: <strong style={{ color:urgent?t.danger:t.accent }}>
            {timeLeft === "Deadline passed" ? "Deadline passed" : timeLeft}
          </strong>
        </div>
      </div>

      {/* Shift pill */}
      <div style={{ display:"flex", alignItems:"center", gap:"6px", padding:"4px 10px", background:urgent?t.danger+"15":t.accent+"15", border:`1px solid ${urgent?t.danger+"33":t.accent+"33"}`, borderRadius:"20px" }}>
        <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:urgent?t.danger:t.accent, display:"inline-block" }}/>
        <span style={{ fontFamily:"'Syne',sans-serif", fontSize:"11px", fontWeight:700, color:urgent?t.danger:t.accent }}>
          {shiftLabel}
        </span>
      </div>

      {/* Countdown */}
      <div style={{ marginLeft:"auto", fontFamily:"'Syne',sans-serif", fontSize:"22px", fontWeight:800, color:urgent?t.danger:t.accent }}>
        {timeLeft}
      </div>
    </div>
  );
}

// ─── KPI FORM ─────────────────────────────────────────────────────────────────
function KPIForm({ t, kpi, setKpi, formState }) {
  const handleChange = (key, val) => setKpi(p=>({...p,[key]:val}));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      {KPI_BLOCKS.map((block, bi)=>(
        <div key={block.id} style={{ background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:"14px", overflow:"hidden", boxShadow:t.shadow, animation:`fadeUp .4s ease both`, animationDelay:`${bi*.07}s` }}>
          {/* Block header */}
          <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"14px 18px", background:block.color+"0a", borderBottom:`1px solid ${block.color}22` }}>
            <div style={{ width:"34px", height:"34px", borderRadius:"9px", background:block.color+"18", border:`1px solid ${block.color}33`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Ico d={block.icon} size={17} color={block.color}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <span style={{ fontFamily:"'Syne',sans-serif", fontSize:"13px", fontWeight:800, color:t.text }}>{block.label}</span>
                <span style={{ fontFamily:"'Syne',sans-serif", fontSize:"10px", fontWeight:700, background:block.color+"18", color:block.color, borderRadius:"20px", padding:"2px 8px" }}>Block {block.id}</span>
              </div>
              <div style={{ fontSize:"11px", color:t.textSub, marginTop:"1px" }}>{block.fields.length} field{block.fields.length>1?"s":""}</div>
            </div>
            {/* Completion indicator */}
            <div style={{ fontSize:"11px", color:block.fields.every(f=>f.type==="select"||kpi[f.key]!=="")? block.color:t.textMt, fontWeight:700 }}>
              {block.fields.filter(f=>f.type==="select"||kpi[f.key]!=="").length}/{block.fields.length} filled
            </div>
          </div>

          {/* Fields */}
          <div style={{ padding:"16px 18px", display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", gap:"12px" }}>
            {block.fields.map(field=>{
              const filled = field.type==="select" || kpi[field.key]!=="";
              return (
                <div key={field.key} style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                  <label style={{ fontSize:"11px", fontWeight:600, color:t.textSub, letterSpacing:"0.4px", textTransform:"uppercase", fontFamily:"'Syne',sans-serif", display:"flex", alignItems:"center", gap:"5px" }}>
                    {field.label}
                    {field.unit && <span style={{ fontWeight:400, textTransform:"none", color:t.textMt, fontSize:"10px", letterSpacing:0 }}>({field.unit})</span>}
                    {filled && field.type!=="select" && <span style={{ marginLeft:"auto", color:block.color, fontSize:"10px" }}>✓</span>}
                  </label>
                 {field.type === "select" ? (

  <select
    value={kpi[field.key]}
    onChange={e=>handleChange(field.key,e.target.value)}
    style={{
      width:"100%",
      padding:"10px 12px",
      background:t.inputBg,
      border:`1.5px solid ${t.inputBd}`,
      borderRadius:"9px",
      fontSize:"13px",
      color:t.text,
      outline:"none",
      fontFamily:"'DM Sans',sans-serif",
      appearance:"none",
      backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat:"no-repeat",
      backgroundPosition:"right 10px center",
      paddingRight:"30px",
      cursor:"pointer"
    }}
  >
    {field.options.map(o=><option key={o} value={o}>{o}</option>)}
  </select>

) : field.type === "textarea" ? (

  <textarea
    value={kpi[field.key] || ""}
    placeholder="Enter additional notes..."
    rows={4}
    onChange={e=>handleChange(field.key,e.target.value)}
    style={{
      width:"500%",
      padding:"10px 12px",
      background:t.inputBg,
      border:`1.5px solid ${t.inputBd}`,
      borderRadius:"9px",
      fontSize:"13px",
      color:t.text,
      outline:"none",
      fontFamily:"'DM Sans',sans-serif",
      resize:"vertical",
      transition:"border-color .2s, box-shadow .2s"
    }}
  />

) : (

  <input
    type="number"
    min="0"
    step={field.unit==="%"?"0.1":"1"}
    value={kpi[field.key]}
    placeholder="0"
    onChange={e=>handleChange(field.key,e.target.value)}
    onFocus={e=>{
      e.target.style.borderColor=block.color;
      e.target.style.boxShadow=`0 0 0 3px ${block.color}20`;
    }}
    onBlur={e=>{
      e.target.style.borderColor=t.inputBd;
      e.target.style.boxShadow="none";
    }}
    style={{
      width:"100%",
      padding:"10px 12px",
      background:t.inputBg,
      border:`1.5px solid ${t.inputBd}`,
      borderRadius:"9px",
      fontSize:"13px",
      color:t.text,
      outline:"none",
      fontFamily:"'DM Sans',sans-serif",
      transition:"border-color .2s, box-shadow .2s"
    }}
  />

)}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── HISTORY TABLE ────────────────────────────────────────────────────────────
function HistoryTable({ t, history }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:"0 4px" }}>
        <thead>
          <tr>
            {["Date","Status","Notes","Action"].map(h=>(
              <th key={h} style={{ padding:"8px 16px", textAlign:"left", fontSize:"10px", fontWeight:700, color:t.textMt, letterSpacing:"1px", textTransform:"uppercase", fontFamily:"'Syne',sans-serif", borderBottom:`1px solid ${t.border}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {history.map((row,i)=>(
            <tr key={row.id} style={{ animation:`fadeUp .4s ease both`, animationDelay:`${i*.05}s` }}>
              <td style={{ padding:"11px 16px", background:t.rowBg, borderRadius:"9px 0 0 9px", border:`1px solid ${t.border}`, borderRight:"none", fontSize:"13px", fontWeight:600, color:t.text, fontFamily:"'Syne',sans-serif", whiteSpace:"nowrap" }}>{row.date}</td>
              <td style={{ padding:"11px 16px", background:t.rowBg, border:`1px solid ${t.border}`, borderLeft:"none", borderRight:"none" }}><Badge status={row.status} t={t}/></td>
              <td style={{ padding:"11px 16px", background:t.rowBg, border:`1px solid ${t.border}`, borderLeft:"none", borderRight:"none", fontSize:"12px", color:t.textSub }}>{row.note}</td>
              <td style={{ padding:"11px 16px", background:t.rowBg, borderRadius:"0 9px 9px 0", border:`1px solid ${t.border}`, borderLeft:"none" }}>
                <button style={{ fontSize:"11px", fontWeight:700, color:t.accent, background:t.accentGl, border:`1px solid ${t.accent}33`, borderRadius:"7px", padding:"4px 12px", cursor:"pointer", fontFamily:"'Syne',sans-serif" }}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Manager() {
  const navigate = useNavigate();
  const [dark, setDark]         = useState(true);
  const [activeNav, setActiveNav] = useState("Submit Report");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [kpi, setKpi]           = useState(DEFAULT_KPI);
  const [formState, setFormState] = useState("idle"); // idle | draft | submitted | submitting
  const [history, setHistory]   = useState(MOCK_HISTORY);
  const [notifs, setNotifs]     = useState(MOCK_NOTIFS);
  const [toast, setToast]       = useState(null);
  const [staff, setStaff]       = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const t = mkTheme(dark);

  const showToast = useCallback((msg, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3500);
  }, []);

  const allFilled = () => KPI_BLOCKS.every(b=>b.fields.every(f=>f.type==="select"||kpi[f.key]!==""));

  const handleSaveDraft = () => {
    localStorage.setItem("cims_kpi_draft", JSON.stringify(kpi));
    setFormState("draft");
    showToast("Draft saved locally.", "info");
  };

const { timeLeft, urgent, shiftLabel } = useDeadlineCountdown();

const handleSubmit = async () => {
  if (!allFilled()) {
    showToast("Please fill all KPI fields before submitting.", "error");
    return;
  }

  const data = {
    shift: shiftLabel === "Day Shift" ? "DAY" : "NIGHT",

    total_patients: Number(kpi.total_patients),
    new_cases: Number(kpi.new_cases),
    emergency_cases: Number(kpi.emergency_cases),
    critical_cases: Number(kpi.critical_cases),
    icu_transfers: Number(kpi.icu_transfers),
    mortality_count: Number(kpi.mortality_count),

    staff_on_duty: Number(kpi.staff_on_duty),
    nurses_absent: Number(kpi.nurses_absent),
    overtime_hours: Number(kpi.overtime_hours),

    unattended_critical_cases: Number(kpi.unattended_critical_cases),

    power_outage_hours: Number(kpi.power_outage_hours),
    internet_downtime_hours: Number(kpi.internet_downtime_hours),

    malaria_cases: Number(kpi.malaria_cases),
    cholera_cases: Number(kpi.cholera_cases),
    respiratory_cases: Number(kpi.respiratory_cases),

    triage_wait_time: Number(kpi.triage_wait_time),
    lab_turnaround_time: Number(kpi.lab_turnaround_time),
    pharmacy_wait_time: Number(kpi.pharmacy_wait_time),

    stockout_oxygen: kpi.stockout_oxygen === "Yes",
    stockout_essential_drugs: kpi.stockout_essential_drugs === "Yes",

    bed_occupancy_rate: Number(kpi.bed_occupancy_rate),
    readmission_rate: Number(kpi.readmission_rate),
    patient_complaints: Number(kpi.patient_complaints),

    comments: kpi.comments,
  };

  try {
    setFormState("submitting");

    await submitKPI(data);

    setFormState("submitted");

    setHistory((prev) => [
      {
        id: Date.now(),
        date: "Just now",
        status: "success",
        note: `${shiftLabel} submitted at ${new Date().toLocaleTimeString()}`,
      },
      ...prev,
    ]);

    showToast(`${shiftLabel} report submitted successfully!`);

  } catch (error) {
    setFormState("idle");

    if (error.message.includes("already submitted")) {
      showToast(`You have already submitted the ${shiftLabel} report.`, "error");
    } else {
      showToast("Submission failed. Please try again.", "error");
    }
  }
};
   
  const handleClear = () => { setKpi(DEFAULT_KPI); setFormState("idle"); showToast("Form cleared.", "info"); };

  // Load draft on mount
  useEffect(()=>{
    const draft = localStorage.getItem("cims_kpi_draft");
    if (draft) { try { setKpi(JSON.parse(draft)); setFormState("draft"); } catch {} }
  }, []);
// Fetch clinic staff
  useEffect(() => {
   api.get("/api/auth/manager/staff/")
    .then(res => setStaff(res.data))
    .catch(() => setStaff([]))
    .finally(() => setStaffLoading(false));
}, []);
// On mount, check if already submitted for current shift
useEffect(() => {
  const checkSubmission = async () => {
    try {
      const response = await fetch("api/auth/manager/kpi/check-submission/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      const data = await response.json();
      if (data.already_submitted) {
        setFormState("submitted");
      }
    } catch (err) {
      console.error("Failed to check submission status", err);
    }
  };
  checkSubmission();
}, []);


  const totalFilled = KPI_BLOCKS.reduce((acc,b)=>acc+b.fields.filter(f=>f.type==="select"||kpi[f.key]!=="").length, 0);
  const totalFields = KPI_BLOCKS.reduce((acc,b)=>acc+b.fields.length, 0);
  const progress = Math.round((totalFilled/totalFields)*100);

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:t.pageBg, fontFamily:"'DM Sans',sans-serif", transition:"background .3s", position:"relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(0,174,239,0.2);border-radius:4px;}
        input[type=number]::-webkit-inner-spin-button{opacity:.3;}
        input::placeholder{color:#aaa;}
        select option{background:#fff;color:#0A1628;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        @keyframes slideIn{from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);}}
        @keyframes dropIn{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        button:hover:not(:disabled){filter:brightness(1.07);}
        input:focus{outline:none;}
      `}</style>

      <Toast toast={toast}/>

      <Sidebar t={t} active={activeNav} setActive={setActiveNav} collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} dark={dark} setDark={setDark} onLogout={()=>navigate("/login")}/>

      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        <Header t={t} dark={dark} setDark={setDark} notifs={notifs} setNotifs={setNotifs} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>

        <main style={{ flex:1, overflowY:"auto", padding:"20px", display:"flex", flexDirection:"column", gap:"18px" }}>

          {/* Deadline banner */}
           <DeadlineBanner t={t} />

          {/* Page info row */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"10px" }}>
            <div>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"20px", fontWeight:800, color:t.text }}>Daily KPI Report</h2>
              <p style={{ fontSize:"12px", color:t.textSub, marginTop:"2px" }}>
                1 report per clinic per day · Auto-date: <strong style={{color:t.accent}}>{new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</strong>
              </p>
            </div>
            {/* Progress pill */}
            <div style={{ display:"flex", alignItems:"center", gap:"10px", background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:"12px", padding:"10px 16px" }}>
              <div style={{ fontSize:"12px", color:t.textSub }}>Completion</div>
              <div style={{ width:"120px", height:"7px", background:t.inputBg, borderRadius:"4px", overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(90deg,${t.accent},${t.accentDk})`, borderRadius:"4px", transition:"width .4s" }}/>
              </div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"13px", fontWeight:800, color:t.accent }}>{progress}%</div>
              {formState==="draft" && <Badge status="draft" t={t}/>}
              {formState==="submitted" && <Badge status="success" t={t}/>}
            </div>
          </div>

          {/* Two-col layout: form + sidebar */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:"18px", alignItems:"start" }}>

            {/* LEFT: KPI form */}
            <div>
              <KPIForm t={t} kpi={kpi} setKpi={setKpi} formState={formState}/>

              {/* Action buttons */}
              <div style={{ display:"flex", gap:"12px", justifyContent:"flex-end", marginTop:"18px", paddingTop:"16px", borderTop:`1px solid ${t.border}` }}>
                <button onClick={handleClear}
                  style={{ display:"flex", alignItems:"center", gap:"8px", padding:"12px 22px", background:t.inputBg, border:`1px solid ${t.border}`, borderRadius:"10px", color:t.textSub, fontSize:"13px", fontWeight:700, fontFamily:"'Syne',sans-serif", cursor:"pointer" }}>
                  <Ico d="M18 6L6 18M6 6l12 12" size={14} color={t.textSub}/>
                  Clear
                </button>
                <button onClick={handleSaveDraft} disabled={formState==="submitting"}
                  style={{ display:"flex", alignItems:"center", gap:"8px", padding:"12px 22px", background:t.warning+"15", border:`1px solid ${t.warning}44`, borderRadius:"10px", color:t.warning, fontSize:"13px", fontWeight:700, fontFamily:"'Syne',sans-serif", cursor:"pointer" }}>
                  <Ico d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8" size={14} color={t.warning}/>
                  Save Draft
                </button>
                <button onClick={handleSubmit} disabled={formState==="submitting"||formState==="submitted"||timeLeft==="Deadline passed"}
                      style={{ display:"flex", alignItems:"center", gap:"8px", padding:"12px 26px", background:formState==="submitted"?t.success+`99`:timeLeft==="Deadline passed"?t.danger+"99":`linear-gradient(135deg,${t.accent},${t.accentDk})`, border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", fontWeight:700, fontFamily:"'Syne',sans-serif", cursor:formState==="submitting"||formState==="submitted"||timeLeft==="Deadline passed"?"not-allowed":"pointer", opacity:formState==="submitting"?.8:1, boxShadow:`0 6px 20px ${t.accent}44`, transition:"all .2s" }}>
                    {formState==="submitting" ? (
                    <><span style={{ width:"14px", height:"14px", border:"2px solid rgba(255,255,255,.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block" }}/> Submitting…</>
                     ) : formState==="submitted" ? (
                       <><Ico d="M20 6L9 17l-5-5" size={14} color="#fff" stroke={2.5}/> Submitted!</>
                    ) : timeLeft==="Deadline passed" ? (
                       <><Ico d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" size={14} color="#fff"/> Deadline Passed</>
                         ) : (
                       <><Ico d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" size={14} color="#fff"/> Submit Final</>
                     )}
                    </button>
              </div>
            </div>

            {/* RIGHT: Info panel */}
            <div style={{ display:"flex", flexDirection:"column", gap:"14px", position:"sticky", top:"16px" }}>

              {/* Clinic info */}
              <div style={{ background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:"14px", overflow:"hidden", boxShadow:t.shadow }}>
                <div style={{ padding:"13px 16px", borderBottom:`1px solid ${t.border}`, background:t.accentGl }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"13px", color:t.text }}>Report Info</div>
                </div>
                <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:"10px" }}>
                  {[
                    { label:"Clinic",    value:"Central Clinic",                       icon:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
                    { label:"Manager",   value:"Clinical Manager",                     icon:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
                    { label:"Date",      value:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}), icon:"M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2" },
                    { label:"Deadline",  value:"6:30 PM daily",                        icon:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" },
                  ].map(item=>(
                    <div key={item.label} style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                      <div style={{ width:"28px", height:"28px", borderRadius:"7px", background:t.accentGl, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <Ico d={item.icon} size={13} color={t.accent}/>
                      </div>
                      <div>
                        <div style={{ fontSize:"10px", color:t.textMt, textTransform:"uppercase", letterSpacing:"0.5px", fontFamily:"'Syne',sans-serif" }}>{item.label}</div>
                        <div style={{ fontSize:"13px", fontWeight:600, color:t.text }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div style={{ background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:"14px", overflow:"hidden", boxShadow:t.shadow }}>
                <div style={{ padding:"13px 16px", borderBottom:`1px solid ${t.border}`, background:t.accentGl }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"13px", color:t.text }}>How to Submit</div>
                </div>
                <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:"8px" }}>
                  {[
                    { c:t.accent,   txt:"Date and clinic are auto-filled — do not change." },
                    { c:t.success,  txt:"Fill all 5 blocks completely." },
                    { c:t.warning,  txt:"Save draft anytime to preserve progress." },
                    { c:"#A855F7",  txt:"Submit Final once all fields are complete." },
                    { c:t.danger,   txt:"Must be submitted before 6:30 PM daily." },
                  ].map((s,i)=>(
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"9px", padding:"9px 11px", background:s.c+"0a", border:`1px solid ${s.c}22`, borderRadius:"9px" }}>
                      <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:s.c, marginTop:"5px", flexShrink:0, display:"inline-block" }}/>
                      <p style={{ fontSize:"12px", color:t.textSub, lineHeight:1.5, margin:0 }}>{s.txt}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* This week summary */}
              <div style={{ background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:"14px", overflow:"hidden", boxShadow:t.shadow }}>
                <div style={{ padding:"13px 16px", borderBottom:`1px solid ${t.border}`, background:t.accentGl }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"13px", color:t.text }}>This Week</div>
                </div>
                <div style={{ padding:"14px 16px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px" }}>
                  {[
                    { label:"Submitted", val:history.filter(h=>h.status==="success").length, c:t.success },
                    { label:"Drafts",    val:history.filter(h=>h.status==="draft").length,   c:t.warning },
                    { label:"Failed",    val:history.filter(h=>h.status==="failed").length,  c:t.danger  },
                  ].map(s=>(
                    <div key={s.label} style={{ background:s.c+"10", border:`1px solid ${s.c}33`, borderRadius:"10px", padding:"10px 8px", textAlign:"center" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"22px", fontWeight:800, color:s.c }}>{s.val}</div>
                      <div style={{ fontSize:"10px", color:t.textSub, marginTop:"2px" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submission history */}
          <div style={{ background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:"16px", overflow:"hidden", boxShadow:t.shadow }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"15px 20px", borderBottom:`1px solid ${t.border}`, background:t.accentGl }}>
              <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                <div style={{ width:"34px", height:"34px", borderRadius:"9px", background:t.accent+"20", border:`1px solid ${t.accent}44`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Ico d="M12 8v4l3 3M3.05 11a9 9 0 1 0 .5-4M3 3v5h5" size={17} color={t.accent}/>
                </div>
                <div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"14px", fontWeight:700, color:t.text }}>Submission History</div>
                  <div style={{ fontSize:"11px", color:t.textSub }}>{history.length} recent entries</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:"6px" }}>
                {["success","draft","failed"].map(s=><Badge key={s} status={s} t={t}/>)}
              </div>
            </div>
            <div style={{ padding:"14px 18px" }}>
              <HistoryTable t={t} history={history}/>
            </div>
          </div>
        {/* ── Clinic Staff ── */}
          <div style={{ background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:"16px", overflow:"hidden", boxShadow:t.shadow }}>
            <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"15px 20px", borderBottom:`1px solid ${t.border}`, background:t.accentGl }}>
              <div style={{ width:"34px", height:"34px", borderRadius:"9px", background:t.accent+"20", border:`1px solid ${t.accent}44`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Ico d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" size={17} color={t.accent}/>
              </div>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"14px", fontWeight:700, color:t.text }}>Clinic Staff</div>
                <div style={{ fontSize:"11px", color:t.textSub }}>
                  {staffLoading ? "Loading…" : `${staff.length} staff member${staff.length !== 1 ? "s" : ""}`}
                </div>
              </div>
            </div>
            <div style={{ padding:"14px 18px", overflowX:"auto" }}>
              {staffLoading ? (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"32px", gap:"10px", color:t.textSub, fontSize:"13px" }}>
                  <span style={{ width:"16px", height:"16px", border:`2px solid ${t.border}`, borderTop:`2px solid ${t.accent}`, borderRadius:"50%", display:"inline-block", animation:"spin .7s linear infinite" }}/>
                  Loading staff…
                </div>
              ) : staff.length === 0 ? (
                <div style={{ textAlign:"center", padding:"32px", color:t.textMt, fontSize:"13px", fontStyle:"italic" }}>
                  No staff found
                </div>
              ) : (
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
                  <thead>
                    <tr>
                      {["Name","Role","Qualification","Training Coverage"].map(h => (
                        <th key={h} style={{ textAlign:"left", padding:"9px 14px", color:t.textMt, fontWeight:700, fontSize:"10px", letterSpacing:"0.8px", textTransform:"uppercase", fontFamily:"'Syne',sans-serif", borderBottom:`1px solid ${t.border}`, whiteSpace:"nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((s, i) => (
                      <tr key={s.id}
                        style={{ background: i % 2 === 0 ? "transparent" : t.rowBg, transition:"background .15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = t.accentGl}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : t.rowBg}>
                        <td style={{ padding:"11px 14px", fontWeight:600, color:t.text, whiteSpace:"nowrap" }}>{s.name}</td>
                        <td style={{ padding:"11px 14px", color:t.textSub }}>{s.role}</td>
                        <td style={{ padding:"11px 14px", color:t.textSub }}>{s.qualification}</td>
                        <td style={{ padding:"11px 14px" }}>
                          <span style={{
                            display:"inline-flex", alignItems:"center", gap:"5px",
                            background: s.training_coverage ? t.success+"18" : t.danger+"12",
                            border: `1px solid ${s.training_coverage ? t.success+"44" : t.danger+"33"}`,
                            borderRadius:"20px", padding:"3px 10px",
                            fontSize:"11px", fontWeight:700,
                            color: s.training_coverage ? t.success : t.danger,
                            fontFamily:"'Syne',sans-serif",
                          }}>
                            <span style={{ width:"5px", height:"5px", borderRadius:"50%", background: s.training_coverage ? t.success : t.danger, display:"inline-block" }}/>
                            {s.training_coverage ? "Yes" : "No"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        
        </main>
      </div>
    </div>
  );
}
