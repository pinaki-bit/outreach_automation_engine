export default function Emails({ emails, contacts }) {
  if (!emails || emails.length === 0) {
    return <div className="empty">No verified emails found.</div>;
  }
  const byId = Object.fromEntries((contacts || []).map((c) => [c.contact_id, c]));
  return (
    <div className="contact-chips">
      {emails.map((e) => {
        const c = byId[e.contact_id];
        return (
          <div className="card" key={e.contact_id} style={{ display: "flex", flexDirection: "column", gap: "8px", margin: 0 }}>
            <div className="row tight" style={{ justifyContent: "space-between", width: "100%" }}>
              <code style={{ color: "var(--color-gold)", fontFamily: "monospace", fontSize: "12px" }}>
                {e.email}
              </code>
              <span 
                className="badge" 
                style={{ 
                  backgroundColor: e.status === "verified" ? "rgba(34, 197, 94, 0.08)" : "rgba(197, 168, 128, 0.08)", 
                  color: e.status === "verified" ? "#8aff9a" : "var(--color-gold)",
                  borderColor: e.status === "verified" ? "rgba(34, 197, 94, 0.2)" : "rgba(197, 168, 128, 0.2)"
                }}
              >
                {e.status}
              </span>
            </div>
            {c && (
              <div className="subtle" style={{ fontSize: "11px", marginTop: 4 }}>
                {c.full_name} • {c.company}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
