"use client";
import { useState } from "react";

export default function Home() {
const [domain, setDomain] = useState("");
const [loading, setLoading] = useState(false);
const [result, setResult] = useState<any>(null);
const [error, setError] = useState("");

async function startScan() {
  if (!domain.trim()) {
    setError("Please enter a domain...");
    return;
  }

  setLoading(true);
  setError("");
  setResult(null);

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/scan?domain=${encodeURIComponent(domain)}`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("Scan failed");
    }

    const data = await response.json();

    setResult(data);
  } catch (err) {
    setError("Unable to connect to Vigilez backend.");
  } finally {
    setLoading(false);
  }
}

  return (
    <main className = "min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Vigilez
          </h1>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Login
            </a>
            <a
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Sign up
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center">
        <div className="mb-4 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
          Website Security Scanner
        </div>

        <h2 className="max-w-3xl text-5xl font-bold tracking-tight text-gray-900">
          Keep your website protected and always audit-ready
        </h2>

        <p className="mt-6 max-w-2xl text-lg text-gray-600">
          Vigilez scans your website for common security issues and
          provides clear findings, risk severity, and recommendations.
        </p>

        {/* Scan Form */}
        <div className="mt-10 flex w-full max-w-2xl gap-3">
          <input
            type="text"
            placeholder={error === "Please enter a domain..." ? error : "example.com"}
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
              if (error === "Please enter a domain...") setError("");
            }}
            className={`flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
              error === "Please enter a domain..."
                ? "placeholder:text-red-600"
                : "placeholder:text-gray-400"
            }`}
          />

          <button
            onClick={startScan}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Scanning..." : "Start Scan"}
          </button>
        </div>

        {error && error !== "Please enter a domain..." && (
          <p className="mt-3 w-full max-w-2xl text-left text-sm text-red-600">
            {error}
          </p>
        )}

        <p className="mt-4 text-sm text-gray-500">
          No installation required. Enter your website domain to begin.
        </p>
      </section>

      {result && (
        <div className="mt-10 w-full max-w-5xl text-left">
          {/* Scan Header */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Security Scan
                </p>

                <h3 className="mt-1 text-2xl font-bold text-gray-900">
                  {result.domain}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Status: {result.status}
                </p>
              </div>

              {/* Score */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">
                  Security Score
                </p>

                <p className="mt-1 text-5xl font-bold text-blue-600">
                  {result.security_score}
                </p>

                <p className="text-sm text-gray-500">
                  out of 100
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <SummaryCard
              label="Critical"
              value={result.summary?.critical ?? 0}
            />

            <SummaryCard
              label="High"
              value={result.summary?.high ?? 0}
            />

            <SummaryCard
              label="Medium"
              value={result.summary?.medium ?? 0}
            />

            <SummaryCard
              label="Low"
              value={result.summary?.low ?? 0}
            />
          </div>

          {/* Findings */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900">
              Security Findings
            </h3>

            <p className="mt-1 text-gray-500">
              Issues identified during the security scan.
            </p>

            <div className="mt-5 space-y-4">
              {result.findings?.map((finding: any, index: number) => (
                <FindingCard
                  key={finding.code ?? index}
                  finding={finding}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <section className="border-t bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
          <Feature
            title="Security Headers"
            description="Check important HTTP security headers such as HSTS and CSP."
          />

          <Feature
            title="Cookie Security"
            description="Identify missing Secure, HttpOnly and SameSite cookie attributes."
          />

          <Feature
            title="Security Score"
            description="Get a simple security score and understand the issues affecting it."
          />
        </div>
      </section>
    </main>
  );
}

/* feature */
function Feature({
  title,
  description
}: {
  title: string,
  description:string
}){
  return (
    <div className="rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-gray-600">
        {description}
      </p>
    </div>
  );
}

/* summary card */
function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

/* finding care */
function FindingCard({
  finding,
}: {
  finding: any;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={finding.severity} />

            <span className="text-xs font-medium text-gray-400">
              {finding.code}
            </span>
          </div>

          <h4 className="mt-3 text-lg font-bold text-gray-900">
            {finding.title}
          </h4>

          <p className="mt-2 text-gray-600">
            {finding.description}
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-5 rounded-lg bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-900">
          Recommendation
        </p>

        <p className="mt-1 text-sm text-gray-600">
          {finding.recommendation}
        </p>
      </div>

      {/* Evidence */}
      {finding.evidence && (
        <div className="mt-4 rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-900">
            Evidence
          </p>

          <pre className="mt-2 overflow-x-auto text-xs text-gray-600">
            {JSON.stringify(finding.evidence, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

/* severity badge */
function SeverityBadge({
  severity,
}: {
  severity: string;
}) {
  const normalizedSeverity = severity?.toUpperCase();

  const styles: Record<string, string> = {
    CRITICAL: "bg-red-100 text-red-700",
    HIGH: "bg-orange-100 text-orange-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    LOW: "bg-blue-100 text-blue-700",
    NONE: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        styles[normalizedSeverity] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {normalizedSeverity}
    </span>
  );
}
