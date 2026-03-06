import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { saveAuth, UI_ROLE_TO_CODE, ROLE_TO_ROUTE, UI_ROLES } from "../auth/auth";

const CIMS_LOGO = ({ size = 60 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
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
);

const EyeIcon = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const ACCENT = "#00AEEF";
const ACCENT_DARK = "#0077B6";
const NAVY = "#020d1f";

const styles = {
  root: {
    minHeight: "100vh",
    background: NAVY,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "20px",
  },

  // overlays above rain
  gridBg: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,174,239,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,174,239,0.05) 1px, transparent 1px)
    `,
    backgroundSize: "48px 48px",
    zIndex: 2,
  },
  blob1: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,174,239,0.15) 0%, transparent 70%)",
    top: "-100px",
    left: "-100px",
    animation: "pulse-blob 8s ease-in-out infinite",
    zIndex: 2,
  },
  blob2: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,80,180,0.15) 0%, transparent 70%)",
    bottom: "-80px",
    right: "-80px",
    animation: "pulse-blob 10s ease-in-out infinite reverse",
    zIndex: 2,
  },

  container: {
    display: "flex",
    width: "100%",
    maxWidth: "1100px",
    minHeight: "620px",
    borderRadius: "24px",
    overflow: "hidden",
    border: "1px solid rgba(0,174,239,0.15)",
    boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 80px rgba(0,174,239,0.05)",
    position: "relative",
    zIndex: 3,
    animation: "fadeUp 0.6s ease both",
  },

  leftPanel: {
    flex: "1.1",
    background: "linear-gradient(145deg, #020d1f 0%, #031a38 60%, #042050 100%)",
    padding: "60px 48px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRight: "1px solid rgba(0,174,239,0.1)",
    position: "relative",
    overflow: "hidden",
  },
  tagline: {
    fontSize: "11px",
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    letterSpacing: "4px",
    color: ACCENT,
    marginBottom: "28px",
    opacity: 0.8,
  },
  headline: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "52px",
    fontWeight: 800,
    lineHeight: 1.05,
    color: "#FFFFFF",
    marginBottom: "24px",
  },
  accentText: { color: ACCENT },
  subtext: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.5)",
    lineHeight: 1.7,
    maxWidth: "320px",
    marginBottom: "48px",
    fontWeight: 300,
  },
  statsRow: { display: "flex", gap: "16px" },
  statBox: {
    flex: 1,
    background: "rgba(0,174,239,0.07)",
    border: "1px solid rgba(0,174,239,0.2)",
    borderRadius: "12px",
    padding: "16px 12px",
  },
  statValue: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "22px",
    fontWeight: 800,
    color: ACCENT,
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: "0.5px",
    lineHeight: 1.4,
  },
  versionBadge: { fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "1px" },

  rightPanel: {
    flex: "1",
    background: "#F0F4F8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 40px",
  },
  formCard: { width: "100%", maxWidth: "400px" },
  formHeader: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "36px" },
  formTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "20px",
    fontWeight: 800,
    color: "#0A1628",
    letterSpacing: "2px",
  },
  formSubtitle: { fontSize: "11px", color: "#888", letterSpacing: "0.3px" },
  signInText: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "30px",
    fontWeight: 800,
    color: "#0A1628",
    marginBottom: "6px",
  },
  signInSub: { fontSize: "14px", color: "#888", marginBottom: "28px", fontWeight: 300 },
  errorBox: {
    background: "#fff0f0",
    border: "1px solid #ffcccc",
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "13px",
    color: "#cc0000",
    marginBottom: "20px",
  },

  form: { display: "flex", flexDirection: "column", gap: "20px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#444",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    fontFamily: "'Syne', sans-serif",
  },
  labelRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  input: {
    width: "100%",
    padding: "14px 16px",
    background: "#FFFFFF",
    border: "1.5px solid #D6E4EF",
    borderRadius: "10px",
    fontSize: "14px",
    color: "#0A1628",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "'DM Sans', sans-serif",
  },
  inputFocused: {
    borderColor: ACCENT,
    boxShadow: "0 0 0 3px rgba(0,174,239,0.15)",
  },
  passwordWrap: { position: "relative" },
  eyeBtn: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#888",
    display: "flex",
    alignItems: "center",
    padding: "4px",
  },
  forgotLink: {
    fontSize: "12px",
    color: ACCENT_DARK,
    textDecoration: "none",
    fontWeight: 600,
    borderBottom: `1px solid ${ACCENT_DARK}`,
  },
  submitBtn: {
    width: "100%",
    padding: "16px",
    background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 700,
    fontFamily: "'Syne', sans-serif",
    letterSpacing: "0.5px",
    transition: "filter 0.2s",
    marginTop: "4px",
    boxShadow: "0 8px 24px rgba(0,119,182,0.35)",
  },
  loadingRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  footer: {
    marginTop: "28px",
    textAlign: "center",
    fontSize: "11px",
    color: "#AAA",
    letterSpacing: "1px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  footerDot: { width: "4px", height: "4px", borderRadius: "50%", background: "#CCC", display: "inline-block" },
};


export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !role) {
      setError("Please fill in all fields.");
      return;
    }

    const roleCode = UI_ROLE_TO_CODE[role];

    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login/", {
        email,
        password,
        role: roleCode,
      });

      const { access, refresh, role: returnedRole } = res.data;
    
      saveAuth({ access, refresh, role: returnedRole });

      navigate(ROLE_TO_ROUTE[returnedRole] || "/login", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Login failed. Check credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <div style={styles.root} className="rain-bg">
      <div style={styles.gridBg} />
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.container}>
        {/* Left Panel */}
        <div style={styles.leftPanel}>
          <div>
            <div style={styles.tagline}>CLINICAL GOVERNANCE</div>
            <h1 style={styles.headline}>
              Monitor.<br />
              <span style={styles.accentText}>Detect.</span><br />
              Respond.
            </h1>
            <p style={styles.subtext}>Real-time monitoring across all satellite clinics</p>

            <div style={styles.statsRow}>
              {[
                { label: "Clinics Monitored", value: "24/7" },
                { label: "KPI Indicators", value: "16+" },
                { label: "Response Time", value: "< 1hr" },
              ].map((s) => (
                <div key={s.label} style={styles.statBox}>
                  <div style={styles.statValue}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.versionBadge}>CMS v1.0 — Secure Access Portal</div>
        </div>

        {/* Right Panel */}
        <div style={styles.rightPanel}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <CIMS_LOGO />
              <div>
                <div style={styles.formTitle}>CMS</div>
                <div style={styles.formSubtitle}>Clinic Monitoring System</div>
              </div>
            </div>

            <h2 style={styles.signInText}>Sign In</h2>
            <p style={styles.signInSub}>Enter your credentials to access your dashboard</p>

            {error && <div style={styles.errorBox}>⚠ {error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  onFocus={() => setFocused("role")}
                  onBlur={() => setFocused("")}
                  style={{
                    ...styles.input,
                    ...(focused === "role" ? styles.inputFocused : {}),
                    color: role ? "#0A1628" : "#888",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 16px center",
                    paddingRight: "40px",
                    cursor: "pointer",
                  }}
                >
                  <option value="" disabled>
                    Select your role
                  </option>
                  {(UI_ROLES || []).map((r) => (
                    <option key={r} value={r} style={{ color: "#0A1628" }}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  placeholder="you@clinic.gov"
                  style={{ ...styles.input, ...(focused === "email" ? styles.inputFocused : {}) }}
                />
              </div>

              <div style={styles.fieldGroup}>
                <div style={styles.labelRow}>
                  <label style={styles.label}>Password</label>
                  <a href="#" style={styles.forgotLink}>
                    Forgot password?
                  </a>
                </div>

                <div style={styles.passwordWrap}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused("")}
                    placeholder="••••••••"
                    style={{
                      ...styles.input,
                      ...(focused === "password" ? styles.inputFocused : {}),
                      paddingRight: "48px",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={styles.eyeBtn}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.85 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <span style={styles.loadingRow}>
                    <span style={styles.spinner} />
                    Authenticating...
                  </span>
                ) : (
                  "Access Dashboard →"
                )}
              </button>
            </form>

            <div style={styles.footer}>
              <span style={styles.footerDot} />
              Secure · Role-Based · Monitored Access
              <span style={styles.footerDot} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* WHITISH RAIN BG */
        .rain-bg { position: relative; overflow: hidden; }
        .rain-bg::before{
          content:"";
          position:absolute;
          inset:-30%;
          z-index:0;
          pointer-events:none;
          background-image:
            radial-gradient(2px 90px at 20px 200px, rgba(255,255,255,0.22), transparent),
            radial-gradient(2px 110px at 120px 120px, rgba(255,255,255,0.18), transparent),
            radial-gradient(2px 80px at 220px 260px, rgba(255,255,255,0.16), transparent),
            radial-gradient(2px 120px at 320px 80px, rgba(255,255,255,0.20), transparent),
            radial-gradient(2px 95px at 420px 220px, rgba(255,255,255,0.14), transparent),
            radial-gradient(2px 105px at 520px 160px, rgba(255,255,255,0.17), transparent);
          background-size: 600px 300px;
          animation: rainMove 12s linear infinite;
          will-change: background-position;
        }
        .rain-bg::after{
          content:"";
          position:absolute;
          inset:0;
          z-index:1;
          pointer-events:none;
          backdrop-filter: blur(2px);
          background: rgba(2, 13, 31, 0.05);
        }
        @keyframes rainMove { from { background-position: 0 0; } to { background-position: 0 5000px; } }

        @keyframes pulse-blob {
          0%, 100% { transform: scale(1) translate(0,0); opacity: 0.7; }
          50% { transform: scale(1.15) translate(20px,-20px); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        select option { background: #fff; color: #0A1628; }
        input::placeholder { color: #aaa; }
        button:hover:not(:disabled) { filter: brightness(1.08); }
        a:hover { opacity: 0.75; }
      `}</style>
    </div>
  );
}