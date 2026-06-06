import { useState, useEffect, useRef } from "react";
import DomainForm from "./components/DomainForm.jsx";
import SimilarCompanies from "./components/SimilarCompanies.jsx";
import Contacts from "./components/Contacts.jsx";
import Emails from "./components/Emails.jsx";
import EmailPreview from "./components/EmailPreview.jsx";
import CustomCursor from "./components/CustomCursor.jsx";
import GridLines from "./components/GridLines.jsx";
import Loader from "./components/Loader.jsx";
import Scene3D from "./components/Scene3D.jsx";
import gsap from "gsap";
import Lenis from "lenis";
import { ArrowDown, Radio, Database, Cpu, Shield, Globe } from "lucide-react";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState({ kind: "idle", message: "" });
  const [overrides, setOverrides] = useState({});
  const [pipelineDomain, setPipelineDomain] = useState("");
  const [telemetry, setTelemetry] = useState(null);

  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const descRef = useRef(null);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Fetch API Telemetry
  useEffect(() => {
    async function fetchTelemetry() {
      try {
        const r = await fetch(`${BACKEND}/api/health`);
        if (r.ok) {
          const data = await r.json();
          setTelemetry(data.mode);
        }
      } catch (e) {
        console.warn("Failed to retrieve engine telemetry state.", e);
      }
    }
    fetchTelemetry();
  }, []);

  // GSAP Title and Description reveal
  useEffect(() => {
    if (loading) return;

    const chars = titleRef.current?.querySelectorAll(".char");
    if (chars) {
      gsap.fromTo(
        chars,
        { y: 150, rotateX: -40, opacity: 0 },
        {
          y: 0,
          rotateX: 0,
          opacity: 1,
          duration: 1.6,
          ease: "power4.out",
          stagger: 0.08,
          delay: 0.2,
        }
      );
    }

    if (subtitleRef.current && descRef.current) {
      gsap.fromTo(
        [subtitleRef.current, descRef.current.children],
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.1,
          delay: 0.8,
        }
      );
    }
  }, [loading]);

  async function runPipeline({ domain }) {
    setStatus({ kind: "loading", message: "MINING TARGET CORPORATE DATA INDEX..." });
    setResult(null);
    setOverrides({});
    setPipelineDomain(domain);
    try {
      const r = await fetch(`${BACKEND}/api/pipeline/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      if (!r.ok) {
        const detail = await r.json().catch(() => ({}));
        throw new Error(detail.detail || `HTTP ${r.status}`);
      }
      const data = await r.json();
      setResult(data);
      setStatus({
        kind: "success",
        message: `RETRIEVED: ${data.companies.length} SIMILAR ORGS, ${data.contacts.length} LEADS, ${data.emails.length} VERIFIED ENDPOINTS.`,
      });

      // Smooth scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById("pipeline-results");
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);

    } catch (e) {
      setStatus({ kind: "error", message: `PIPELINE EXCEPTION: ${e.message.toUpperCase()}` });
    }
  }

  function updateOverride(contactId, field, value) {
    setOverrides((prev) => ({
      ...prev,
      [contactId]: { ...(prev[contactId] || {}), [field]: value },
    }));
  }

  function updateContent(contactId, newContent) {
    setResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        email_content: {
          ...prev.email_content,
          [contactId]: newContent,
        },
      };
    });
  }

  const titleText = "EAZYREACH";

  return (
    <>
      {loading && <Loader onComplete={() => setLoading(false)} />}
      
      <CustomCursor />
      <GridLines />

      <div className="app-wrapper">
        {/* Left Editorial Navigation panel */}
        <aside className="sidebar">
          <div>
            <div className="sidebar-logo">
              EAZY<span>REACH</span>
            </div>
            <nav className="sidebar-menu">
              <a href="#" className="sidebar-link active">
                <Globe size={13} /> DISCOVERY
              </a>
              <a href="#dashboard" className="sidebar-link">
                <Cpu size={13} /> PIPELINE
              </a>
              <a href="#pipeline-results" className="sidebar-link">
                <Database size={13} /> TELEMETRY
              </a>
            </nav>
          </div>

          <div className="sidebar-footer">
            <div>ENGINE V0.6.0</div>
            <div style={{ fontSize: "8px", opacity: 0.5, marginTop: 4 }}>MMXXVI © ALL RIGHTS RESERVED</div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="main-content">
          
          {/* Top Header Navigation */}
          <header className="top-navbar">
            <div className="navbar-nav">
              <a className="navbar-item">PLATFORM</a>
              <a href="#dashboard" className="navbar-item">PIPELINE</a>
              <a href="#pipeline-results" className="navbar-item">ANALYTICS</a>
            </div>

            <div className="navbar-right">
              <div className="navbar-telemetry">
                <span
                  className="navbar-telemetry-dot"
                  style={{ background: telemetry ? "var(--color-gold)" : "rgba(255,255,255,0.2)", boxShadow: telemetry ? "0 0 8px var(--color-gold)" : "none" }}
                />
                {telemetry ? "CORE ENGINE: ONLINE" : "CONNECTING..."}
              </div>
            </div>
          </header>

          {/* Hero Centerpiece Column */}
          <section className="hero-section">
            <Scene3D />
            
            <div className="hero-grid">
              <div className="hero-center-col">
                <div className="hero-title-container">
                  <h1 ref={titleRef} className="hero-large-title">
                    {titleText.split("").map((char, index) => (
                      <span key={index} className="char">
                        {char}
                      </span>
                    ))}
                  </h1>
                </div>
                <div ref={subtitleRef} className="hero-subtitle">
                  B2B OUTREACH INTELLIGENCE
                </div>
              </div>

              <div className="hero-right-col">
                <div />
                <div ref={descRef} className="hero-metadata">
                  <span className="meta-tag">SYSTEM CORE I</span>
                  <p className="meta-desc">
                    AN IMMERSIVE, HIGH-CONTRAST CONSOLE DIRECTING SEMANTIC SIMILARITY LEAD MINING AND VERIFIED EMAIL TRANSMISSION.
                  </p>
                  <div className="meta-line" />
                  <div className="meta-stats">
                    INTEGRATION: ACTIVE <br />
                    DATA COMPILER: APOLLO <br />
                    AI GENERATOR: GEMINI
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    const dashboardEl = document.querySelector("#dashboard");
                    dashboardEl?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="hero-footer-link"
                >
                  SCROLL TO ENTER <ArrowDown size={12} />
                </button>
              </div>
            </div>
          </section>

          {/* Dashboard Search & Pipeline Execution */}
          <section id="dashboard" className="dashboard-wrapper">
            <div className="dashboard-title-box">
              <h2>PIPELINE DISCOVERY CONSOLE</h2>
              <p>Execute semantic business mapping, lead discovery, and email validation.</p>
            </div>

            <div className="section">
              <h2>
                <Globe size={16} style={{ color: "var(--color-gold)" }} /> TARGET SEARCH PARAMETERS
              </h2>
              <DomainForm
                onSubmit={runPipeline}
                disabled={status.kind === "loading"}
                onValidationError={(msg) => setStatus({ kind: "error", message: msg })}
              />
              {status.kind !== "idle" && (
                <div className={`status ${status.kind}`}>{status.message}</div>
              )}
            </div>

            {/* Results Grid revealing via anchor */}
            {result && (
              <div id="pipeline-results" style={{ animation: "fadeIn 0.8s ease" }}>
                
                <div className="section">
                  <h2>
                    <Database size={16} style={{ color: "var(--color-gold)" }} /> CO-MAPPED ORGANIZATIONS
                  </h2>
                  <SimilarCompanies companies={result.companies} />
                </div>

                <div className="section">
                  <h2>
                    <Cpu size={16} style={{ color: "var(--color-gold)" }} /> RETRIEVED DECISION MAKERS
                  </h2>
                  <Contacts
                    contacts={result.contacts}
                    selectedId={null}
                    onSelect={() => {}}
                  />
                </div>

                <div className="section">
                  <h2>
                    <Shield size={16} style={{ color: "var(--color-gold)" }} /> VERIFIED TRANSMISSION ENDPOINTS
                  </h2>
                  <Emails emails={result.emails} contacts={result.contacts} />
                </div>

                <div className="section">
                  <h2>
                    <Database size={16} style={{ color: "var(--color-gold)" }} /> AI EMAIL COMPILING & DISPATCH
                  </h2>
                  <p className="subtle" style={{ marginBottom: 24 }}>
                    Select targeted prospects below to edit, regenerate, or schedule cold-outreach campaigns.
                  </p>
                  <EmailPreview
                    contacts={result.contacts}
                    emails={result.emails}
                    emailContent={result.email_content}
                    overrides={overrides}
                    onOverrideChange={updateOverride}
                    onContentUpdate={updateContent}
                    onSent={(msg) => setStatus({ kind: "success", message: msg })}
                    onError={(msg) => setStatus({ kind: "error", message: msg })}
                    onSending={() =>
                      setStatus({ kind: "loading", message: "DISPATCHING EMAIL..." })
                    }
                    senderCompany={pipelineDomain}
                  />
                </div>

              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
