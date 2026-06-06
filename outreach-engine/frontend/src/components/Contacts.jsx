export default function Contacts({ contacts, selectedId, onSelect }) {
  if (!contacts || contacts.length === 0) {
    return <div className="empty">No decision makers identified.</div>;
  }
  return (
    <div className="contact-chips">
      {contacts.map((c) => (
        <button
          key={c.contact_id}
          className={`contact-chip ${c.contact_id === selectedId ? "selected" : ""}`}
          onClick={() => onSelect(c.contact_id)}
          type="button"
          style={{ width: "100%" }}
        >
          <span className="chip-info">
            <div className="row tight" style={{ justifyContent: "space-between", width: "100%", marginBottom: 4 }}>
              <strong>{c.full_name}</strong>
              <span className="subtle" style={{ color: "var(--color-gold)", fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {c.title}
              </span>
            </div>
            <div className="subtle" style={{ fontSize: "11px" }}>
              {c.company} • {c.company_domain}
            </div>
          </span>
        </button>
      ))}
    </div>
  );
}
