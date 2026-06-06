import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export default function DomainForm({ onSubmit, disabled, onValidationError }) {
  const [domain, setDomain] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!domain.trim()) {
      onValidationError?.("Please enter a domain.");
      return;
    }
    onSubmit({ domain: domain.trim() });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="domain-form-row">
        <div className="domain-input-group">
          <label htmlFor="domain">Target Domain</label>
          <input
            id="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="e.g., stripe.com, notion.so, figma.com"
            disabled={disabled}
            required
            autoFocus
          />
          <small className="text-muted">
            Enter the corporate domain to initiate semantic similarity search and lead mining.
          </small>
        </div>
        <button type="submit" disabled={disabled} className="pipeline-btn" aria-label="Run outreach pipeline">
          {disabled ? (
            <>
              <Loader2 className="spinner" size={14} /> ANALYZING...
            </>
          ) : (
            <>
              <Sparkles size={14} /> RUN DISCOVERY
            </>
          )}
        </button>
      </div>
    </form>
  );
}
