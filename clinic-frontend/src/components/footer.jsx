function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        marginTop: "40px",
        padding: "20px",
        borderTop: "1px solid #e5e7eb",
        background: "#ffffff",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {/* Brand */}
        <div style={{ fontWeight: "700", fontSize: "14px" }}>
          Clinic<span style={{ color: "#3b82f6" }}>MS</span>
        </div>

        {/* Copyright */}
        <div style={{ fontSize: "12px", color: "#6b7280" }}>
          © {year} <strong>Sajaad Iqbal</strong> — All Rights Reserved.
        </div>

        {/* Website */}
        <a
          href="https://mono-eyeddev.github.io/myPortfolio/"
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: "12px",
            color: "#3b82f6",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          sajaadiqbal.dev
        </a>
      </div>
    </footer>
  );
}

export default Footer;