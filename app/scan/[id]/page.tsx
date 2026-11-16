"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Finding = {
  id: number;
  code: string;
  title: string;
  severity: string;
  status: string;
  description: string;
  recommendation: string;
  evidence: any;
};

type Scan = {
  id: number;
  domain: string;
  status: string;
  security_score: number;
  created_dtm: string;
  findings: Finding[];
};

type ComparisonFinding = {
  code: string;
  title: string;
  severity: string;
  status: string;
  description: string;
  recommendation: string;
  evidence: any;
};

type Comparison = {
  domain: string;

  previous_scan: {
    id: number;
    security_score: number;
    created_dtm: string;
  } | null;

  current_scan: {
    id: number;
    security_score: number;
    created_dtm: string;
  };

  score_change: number;

  findings_comparison: {
    fixed: ComparisonFinding[];
    new: ComparisonFinding[];
    still_present: ComparisonFinding[];
  };
};

export default function ScanDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [comparison, setComparison] =
  useState<Comparison | null>(null);

  const [comparisonLoading, setComparisonLoading] =
  useState(false);

  const [comparisonError, setComparisonError] =
  useState("");

  useEffect(() => {
    async function loadScan() {
      try {
        const { id } = await params;

        const response = await fetch(
          `http://127.0.0.1:8000/scans/id/${id}`
        );

        if (!response.ok) {
          throw new Error("Failed to load scan");
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setScan(data);
      } catch (err) {
        setError("Unable to load scan details.");
      } finally {
        setLoading(false);
      }
    }

    loadScan();
  }, [params]);

  async function loadComparison() {
  if (!scan) {
    return;
  }

  setComparisonLoading(true);
  setComparisonError("");

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/scans/id/${scan.id}/compare`
    );

    if (!response.ok) {
      throw new Error("Failed to load comparison");
    }

    const data = await response.json();

    setComparison(data);
  } catch (err) {
    setComparisonError(
      "Unable to load scan comparison."
    );
  } finally {
    setComparisonLoading(false);
  }
 }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Loading scan details...
        </p>
      </main>
    );
  }

  if (error || !scan) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Scan not found
          </h2>

          <p className="mt-2 text-gray-600">
            {error}
          </p>

          <a
            href="/history"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Back to History
          </a>
        </div>
      </main>
    );
  }

  const summary = {
    critical: scan.findings.filter(
      (f) => f.severity.toUpperCase() === "CRITICAL"
    ).length,

    high: scan.findings.filter(
      (f) => f.severity.toUpperCase() === "HIGH"
    ).length,

    medium: scan.findings.filter(
      (f) => f.severity.toUpperCase() === "MEDIUM"
    ).length,

    low: scan.findings.filter(
      (f) => f.severity.toUpperCase() === "LOW"
    ).length,
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a
            href="/"
            className="text-2xl font-bold text-gray-900"
          >
            Vigilez
          </a>

          <a
            href="/history"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Scan History
          </a>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        {/* Scan Header */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Security Scan #{scan.id}
              </p>

              <h1 className="mt-1 text-3xl font-bold text-gray-900">
                {scan.domain}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                {new Date(scan.created_dtm).toLocaleString()}
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">
                Security Score
              </p>

              <p className="mt-1 text-5xl font-bold text-blue-600">
                {scan.security_score}
              </p>

              <p className="text-sm text-gray-500">
                out of 100
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={loadComparison}
            disabled={comparisonLoading}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {comparisonLoading
              ? "Comparing..."
              : "Compare with Previous Scan"}
          </button>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <SummaryCard
            label="Critical"
            value={summary.critical}
          />

          <SummaryCard
            label="High"
            value={summary.high}
          />

          <SummaryCard
            label="Medium"
            value={summary.medium}
          />

          <SummaryCard
            label="Low"
            value={summary.low}
          />
        </div>

        {comparisonError && (
  <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
    <p className="text-sm text-red-700">
      {comparisonError}
    </p>
  </div>
)}

{comparison && (
  <section className="mt-10">
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Scan Comparison
          </h2>

          <p className="mt-1 text-gray-500">
            Compare this scan with the previous scan.
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">
            Score Change
          </p>

          <p
            className={`text-3xl font-bold ${
              comparison.score_change > 0
                ? "text-green-600"
                : comparison.score_change < 0
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {comparison.score_change > 0
              ? `+${comparison.score_change}`
              : comparison.score_change}
          </p>
        </div>
      </div>

      {comparison.previous_scan ? (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-medium text-gray-500">
                Previous Scan
              </p>

              <p className="mt-1 text-lg font-bold text-gray-900">
                #{comparison.previous_scan.id}
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-700">
                {comparison.previous_scan.security_score}
                <span className="text-sm font-normal text-gray-400">
                  {" "}
                  / 100
                </span>
              </p>

              <p className="mt-2 text-sm text-gray-500">
                {new Date(
                  comparison.previous_scan.created_dtm
                ).toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-sm font-medium text-blue-600">
                Current Scan
              </p>

              <p className="mt-1 text-lg font-bold text-gray-900">
                #{comparison.current_scan.id}
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {comparison.current_scan.security_score}
                <span className="text-sm font-normal text-gray-400">
                  {" "}
                  / 100
                </span>
              </p>

              <p className="mt-2 text-sm text-gray-500">
                {new Date(
                  comparison.current_scan.created_dtm
                ).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
              <ComparisonCard
                title="Fixed Findings"
                count={
                  comparison.findings_comparison.fixed.length
                }
                findings={
                  comparison.findings_comparison.fixed
                }
                type="fixed"
              />

              <ComparisonCard
                title="New Findings"
                count={
                  comparison.findings_comparison.new.length
                }
                findings={
                  comparison.findings_comparison.new
                }
                type="new"
              />

              <ComparisonCard
                title="Still Present"
                count={
                  comparison.findings_comparison.still_present
                    .length
                }
                findings={
                  comparison.findings_comparison.still_present
                }
                type="still"
              />
            </div>
          </>
              ) : (
                <div className="mt-8 rounded-xl bg-gray-50 p-6 text-center">
                  <p className="text-gray-600">
                    This is the first scan for this domain.
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    There is no previous scan available for comparison.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Findings */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Security Findings
          </h2>

          <p className="mt-1 text-gray-500">
            Detailed findings from this scan.
          </p>

          <div className="mt-6 space-y-5">
            {scan.findings.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                <p className="text-gray-600">
                  No security issues found.
                </p>
              </div>
            ) : (
              scan.findings.map((finding) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                />
              ))
            )}
          </div>
        </div>

        {/* Back */}
        <div className="mt-8">
          <button
            onClick={() => router.back()}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to Scan History
          </button>
        </div>
      </section>
    </main>
  );
}

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

function FindingCard({
  finding,
}: {
  finding: Finding;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={finding.severity} />

        <span className="text-xs font-medium text-gray-400">
          {finding.code}
        </span>
      </div>

      <h3 className="mt-3 text-xl font-bold text-gray-900">
        {finding.title}
      </h3>

      <p className="mt-2 text-gray-600">
        {finding.description}
      </p>

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

          <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
            {JSON.stringify(finding.evidence, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function SeverityBadge({
  severity,
}: {
  severity: string;
}) {
  const normalizedSeverity = severity.toUpperCase();

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
        styles[normalizedSeverity] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {normalizedSeverity}
    </span>
  );
}

function ComparisonCard({
  title,
  count,
  findings,
  type,
}: {
  title: string;
  count: number;
  findings: ComparisonFinding[];
  type: "fixed" | "new" | "still";
}) {
  const titleStyles = {
    fixed: "text-green-700",
    new: "text-red-700",
    still: "text-gray-700",
  };

  const badgeStyles = {
    fixed: "bg-green-100 text-green-700",
    new: "bg-red-100 text-red-700",
    still: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3
          className={`font-bold ${titleStyles[type]}`}
        >
          {title}
        </h3>

        <span
          className={`rounded-full px-3 py-1 text-sm font-bold ${badgeStyles[type]}`}
        >
          {count}
        </span>
      </div>

      {findings.length === 0 ? (
        <p className="mt-5 text-sm text-gray-400">
          None
        </p>
      ) : (
        <ul className="mt-5 space-y-2">
          {findings.map((finding) => (
            <div
              key={finding.code}
              className="rounded-lg bg-gray-50 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {finding.title}
                </span>

                <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-bold text-gray-700">
                  {finding.severity}
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                {finding.code}
              </p>

              <p className="mt-2 text-sm text-gray-600">
                {finding.description}
              </p>

              <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-xs font-semibold text-gray-700">
                  Recommendation
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {finding.recommendation}
                </p>
              </div>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
}