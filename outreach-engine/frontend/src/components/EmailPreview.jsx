import { useState } from "react";
import { Check, X, Sparkles, Send, RotateCcw, Sliders, Loader2 } from "lucide-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "";

export default function EmailPreview({
  contacts,
  emails,
  emailContent,
  overrides,
  onOverrideChange,
  onContentUpdate,
  onSent,
  onError,
  onSending,
  senderCompany,
}) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sending, setSending] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [styleHint, setStyleHint] = useState("");
  const [showStyleInput, setShowStyleInput] = useState(false);

  // The first selected contact drives the preview
  const previewId = [...selectedIds][0] || null;
  const previewContact = contacts?.find((c) => c.contact_id === previewId) || null;
  const previewEmail = emails?.find((e) => e.contact_id === previewId) || null;
  const generatedContent = emailContent?.[previewId] || null;
  const override = overrides?.[previewId] || {};
  const previewSubject = override.subject ?? generatedContent?.subject ?? "";
  const previewBody = override.body ?? generatedContent?.body ?? "";

  if (!contacts || contacts.length === 0) {
    return <div className="empty">No contacts available for generation.</div>;
  }

  function toggleContact(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(contacts.map((c) => c.contact_id)));
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  async function handleRegenerate() {
    if (!previewContact) return;
    setRegenerating(true);
    try {
      const r = await fetch(`${BACKEND}/api/email/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: previewContact,
          sender_company: senderCompany || null,
          style_hint: styleHint || null,
        }),
      });
      if (!r.ok) {
        const detail = await r.json().catch(() => ({}));
        throw new Error(detail.detail || `HTTP ${r.status}`);
      }
      const data = await r.json();
      // Update the content for this contact
      onContentUpdate(previewId, data);
      // Clear any manual overrides so the new content shows
      onOverrideChange(previewId, "subject", null);
      onOverrideChange(previewId, "body", null);
    } catch (e) {
      onError(`Regeneration failed: ${e.message}`);
    } finally {
      setRegenerating(false);
    }
  }

  async function handleSend() {
    const recipientEntries = [...selectedIds]
      .map((id) => {
        const emailObj = emails?.find((e) => e.contact_id === id);
        return emailObj?.email;
      })
      .filter(Boolean);

    if (recipientEntries.length === 0) {
      onError("No verified emails for the selected contacts.");
      return;
    }

    setSending(true);
    onSending();
    try {
      if (recipientEntries.length === 1) {
        const r = await fetch(`${BACKEND}/api/email/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: recipientEntries[0],
            subject: previewSubject,
            body: previewBody,
          }),
        });
        if (!r.ok) {
          const detail = await r.json().catch(() => ({}));
          throw new Error(detail.detail || `HTTP ${r.status}`);
        }
        onSent(`Email sent to ${recipientEntries[0]}`);
      } else {
        const r = await fetch(`${BACKEND}/api/email/send_bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipients: recipientEntries,
            subject: previewSubject,
            body: previewBody,
          }),
        });
        if (!r.ok) {
          const detail = await r.json().catch(() => ({}));
          throw new Error(detail.detail || `HTTP ${r.status}`);
        }
        const data = await r.json();
        const succeeded = data.results.filter((r) => r.ok).length;
        const failed = data.results.filter((r) => !r.ok).length;
        onSent(
          `Sent to ${succeeded} recipient${succeeded !== 1 ? "s" : ""}` +
            (failed ? `, ${failed} failed` : "")
        );
      }
    } catch (e) {
      onError(`Send failed: ${e.message}`);
    } finally {
      setSending(false);
    }
  }

  function handleReset() {
    if (previewId) {
      onOverrideChange(previewId, "subject", null);
      onOverrideChange(previewId, "body", null);
    }
  }

  // Filter contacts that have verified emails
  const contactsWithEmail = contacts.filter((c) =>
    emails?.some((e) => e.contact_id === c.contact_id && e.email)
  );

  return (
    <div className="email-preview-container">
      {/* ── Contact selector ── */}
      <div className="contact-selector">
        <div className="selector-header">
          <span className="subtle">Select recipients ({contactsWithEmail.length} verified):</span>
          <div className="selector-actions">
            <button type="button" className="link-btn" onClick={selectAll} disabled={contactsWithEmail.length === 0}>
              Select all
            </button>
            <button type="button" className="link-btn" onClick={deselectAll} disabled={selectedIds.size === 0}>
              Clear
            </button>
          </div>
        </div>
        <div className="contact-chips">
          {contacts.map((c) => {
            const emailObj = emails?.find((e) => e.contact_id === c.contact_id);
            const hasVerifiedEmail = emailObj?.email && emailObj.status === "verified";
            const isSelected = selectedIds.has(c.contact_id);
            return (
              <button
                key={c.contact_id}
                type="button"
                className={`contact-chip ${isSelected ? "selected" : ""} ${!hasVerifiedEmail ? "no-email" : ""}`}
                onClick={() => hasVerifiedEmail && toggleContact(c.contact_id)}
                disabled={!hasVerifiedEmail}
                title={hasVerifiedEmail ? emailObj.email : "No verified email available"}
              >
                <span className="chip-check">
                  {isSelected ? <Check size={10} strokeWidth={3} /> : hasVerifiedEmail ? "" : <X size={10} strokeWidth={3} />}
                </span>
                <span className="chip-info">
                  <strong>{c.full_name}</strong>
                  <span className="subtle">{c.title} @ {c.company}</span>
                  {emailObj?.email && (
                    <code className="chip-email">{emailObj.email}</code>
                  )}
                  {!hasVerifiedEmail && (
                    <span className="no-email-badge">No verified email</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        {selectedIds.size > 0 && (
          <div className="selection-summary">
            {selectedIds.size} recipient{selectedIds.size !== 1 ? "s" : ""} selected for transmission
          </div>
        )}
      </div>

      {/* ── Preview area ── */}
      {previewContact ? (
        <div className="preview-area">
          <div className="preview-header">
            <div className="subtle">
              Recipient: <strong className="bright">{previewContact.full_name}</strong>{" "}
              ({previewContact.title})
            </div>
            {previewEmail?.email && (
              <div className="subtle" style={{ fontFamily: "monospace", fontSize: "11px" }}>
                Target: <code>{previewEmail.email}</code>
              </div>
            )}
          </div>

          <div className="col">
            <label className="subtle" style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>Subject</label>
            <input
              value={previewSubject}
              onChange={(e) =>
                onOverrideChange(previewId, "subject", e.target.value)
              }
            />
          </div>

          <div className="col">
            <label className="subtle" style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>Body</label>
            <textarea
              rows={12}
              value={previewBody}
              onChange={(e) =>
                onOverrideChange(previewId, "body", e.target.value)
              }
              placeholder="Select a contact to preview the generated email..."
            />
          </div>

          {/* ── Style hint for regeneration ── */}
          {showStyleInput && (
            <div className="style-hint-box">
              <label className="subtle" style={{ fontSize: "10px", color: "var(--color-gold)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Style & Tone Guidance</label>
              <input
                value={styleHint}
                onChange={(e) => setStyleHint(e.target.value)}
                placeholder='e.g., "more casual", "extremely short", "include a direct case study reference"'
              />
            </div>
          )}

          {/* ── Action buttons ── */}
          <div className="preview-actions">
            <button
              onClick={handleRegenerate}
              disabled={regenerating || !previewContact}
              className="regenerate-btn"
              title="Generate a fresh version of this email with optional style hints"
            >
              {regenerating ? (
                <>
                  <Loader2 className="spinner" size={14} /> REGENERATING...
                </>
              ) : (
                <>
                  <Sparkles size={14} /> REGENERATE
                </>
              )}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setShowStyleInput((v) => !v)}
            >
              <Sliders size={14} /> {showStyleInput ? "HIDE OPTIONS" : "SET STYLE"}
            </button>
            <button className="secondary" onClick={handleReset} disabled={sending || !previewContact}>
              <RotateCcw size={14} /> RESET
            </button>
            <button
              onClick={handleSend}
              disabled={sending || selectedIds.size === 0}
              className="send-btn"
            >
              {sending ? (
                <>
                  <Loader2 className="spinner" size={14} /> TRANSMITTING...
                </>
              ) : (
                <>
                  <Send size={14} /> DISPATCH ({selectedIds.size})
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="empty" style={{ marginTop: 12 }}>
          Select a contact above to initiate email personalization & review.
        </div>
      )}
    </div>
  );
}
