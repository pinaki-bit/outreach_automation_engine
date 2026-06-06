export default function SimilarCompanies({ companies }) {
  if (!companies || companies.length === 0) {
    return <div className="empty">No similar companies identified.</div>;
  }
  return (
    <div className="companies-scroll-container">
      {companies.map((c) => (
        <div className="company-card-glass" key={c.domain}>
          <div className="row tight" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <strong style={{ color: "var(--text-white)", fontSize: "15px" }}>{c.name}</strong>
            <span className="subtle" style={{ fontFamily: "monospace", fontSize: "11px" }}>{c.domain}</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <span className="badge">{c.industry}</span>
            <span className="badge" style={{ marginLeft: "4px" }}>{c.size_range} EMPLOYEES</span>
          </div>
        </div>
      ))}
    </div>
  );
}
