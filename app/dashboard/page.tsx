"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type LatestScan = {
  id: number;
  domain: string;
  security_score: number;
  status: string;
  created_dtm: string;
};

type Summary = {
  critical: number;
  high: number;
  medium: number;
  low: number;
};

type ScanHistory = {
  id: number;
  domain: string;
  security_score: number;
  status: string;
  created_dtm: string;
};

type ScoreTrend = {
  id: number;
  domain: string;
  score: number;
  created_dtm: string;
};

type DomainStats = {
  domain: string;
  latest_score: number;
  scan_count: number;
};

type DashboardData = {
  total_scans: number;
  latest_scan: LatestScan | null;
  summary: Summary;
  scan_history: ScanHistory[];
  score_trend: ScoreTrend[];
  domains: DomainStats[];
};

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/dashboard"
      );

      if (!response.ok) {
        throw new Error("Failed to load dashboard");
      }

      const data = await response.json();

      setDashboard(data);
    } catch (err) {
      setError("Unable to connect to SecureCheck backend.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-6 py-4">
            <a
              href="/"
              className="text-2xl font-bold text-gray-900"
            >
              SecureCheck
            </a>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-gray-500">
            Loading dashboard...
          </p>
        </section>
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-6 py-4">
            <a
              href="/"
              className="text-2xl font-bold text-gray-900"
            >
              SecureCheck
            </a>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <p className="font-medium text-red-700">
              {error || "Dashboard data unavailable."}
            </p>
          </div>
        </section>
      </main>
    );
  }

  const latestScan = dashboard.latest_scan;

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <a
            href="/"
            className="text-2xl font-bold text-gray-900"
          >
            SecureCheck
          </a>

          <div className="flex items-center gap-6">

            <a
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              New Scan
            </a>

            <a
              href="/history"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Scan History
            </a>

            <span className="text-sm font-semibold text-blue-600">
              Dashboard
            </span>

          </div>

        </div>
      </header>


      {/* Content */}

      <section className="mx-auto max-w-6xl px-6 py-12">

        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Security Dashboard
          </h2>

          <p className="mt-2 text-gray-600">
            Overview of your website security scans.
          </p>
        </div>


        {/* Summary Cards */}

        <div className="mt-8 grid gap-4 md:grid-cols-4">

          <DashboardCard
            label="Total Scans"
            value={dashboard.total_scans}
          />

          <DashboardCard
            label="Latest Domain"
            value={latestScan?.domain ?? "-"}
          />

          <DashboardCard
            label="Security Score"
            value={
              latestScan
                ? `${latestScan.security_score}/100`
                : "-"
            }
          />

          <DashboardCard
            label="Latest Status"
            value={latestScan?.status ?? "-"}
          />

        </div>


        {/* Latest Scan */}

        {latestScan && (
          <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Latest Scan
                </p>

                <h3 className="mt-1 text-2xl font-bold text-gray-900">
                  {latestScan.domain}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Scan #{latestScan.id} •{" "}
                  {formatDate(latestScan.created_dtm)}
                </p>
              </div>

              <div className="text-center">

                <p className="text-sm font-medium text-gray-500">
                  Security Score
                </p>

                <p className="mt-1 text-4xl font-bold text-blue-600">
                  {latestScan.security_score}
                </p>

                <p className="text-sm text-gray-400">
                  out of 100
                </p>

              </div>

              <a
                href={`/scan/${latestScan.id}`}
                className="rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
              >
                View Scan
              </a>

            </div>

          </section>
        )}


        {/* Severity Summary */}

        <section className="mt-8">

          <h3 className="text-2xl font-bold text-gray-900">
            Latest Scan Findings
          </h3>

          <p className="mt-1 text-gray-600">
            Findings detected during the latest scan.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">

            <SeverityCard
              label="Critical"
              value={dashboard.summary.critical}
              style="bg-red-50 text-red-700"
            />

            <SeverityCard
              label="High"
              value={dashboard.summary.high}
              style="bg-orange-50 text-orange-700"
            />

            <SeverityCard
              label="Medium"
              value={dashboard.summary.medium}
              style="bg-yellow-50 text-yellow-700"
            />

            <SeverityCard
              label="Low"
              value={dashboard.summary.low}
              style="bg-blue-50 text-blue-700"
            />

          </div>

        </section>


        {/* Score Trend */}

        {/* Score Trend */}

        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

        <h3 className="text-xl font-bold text-gray-900">
            Score Trend
        </h3>

        <p className="mt-1 text-sm text-gray-500">
            Security scores from the latest scans.
        </p>

        <div className="mt-6 h-80 w-full">

            <ResponsiveContainer width="100%" height="100%">

            <LineChart
                data={dashboard.score_trend}
                margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 10,
                }}
            >

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                dataKey="id"
                tickFormatter={(value) => `#${value}`}
                />

                <YAxis
                domain={[0, 100]}
                tickCount={6}
                />

                <Tooltip
                formatter={(value) => [`${value}/100`, "Security Score"]}
                labelFormatter={(label) => `Scan #${label}`}
                />

                <Line
                type="monotone"
                dataKey="score"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                />

            </LineChart>

            </ResponsiveContainer>

        </div>

        </section>


        {/* Domains */}

        <section className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b px-6 py-5">

            <h3 className="text-xl font-bold text-gray-900">
              Scanned Domains
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Overview of domains scanned by SecureCheck.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="border-b bg-gray-50">

                <tr>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Domain
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Latest Score
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Scan Count
                  </th>

                </tr>

              </thead>

              <tbody>

                {dashboard.domains.map((domain) => (

                  <tr
                    key={domain.domain}
                    className="border-b last:border-b-0"
                  >

                    <td className="px-6 py-4 font-medium text-gray-900">
                      {domain.domain}
                    </td>

                    <td className="px-6 py-4">

                      <span className="font-bold text-blue-600">
                        {domain.latest_score}
                      </span>

                      <span className="text-gray-400">
                        /100
                      </span>

                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {domain.scan_count}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>


        {/* Recent Scans */}

        <section className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b px-6 py-5">

            <div className="flex items-center justify-between">

              <div>

                <h3 className="text-xl font-bold text-gray-900">
                  Recent Scans
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Latest security scans performed by SecureCheck.
                </p>

              </div>

              <a
                href="/history"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View History
              </a>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="border-b bg-gray-50">

                <tr>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Scan ID
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Domain
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Score
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {dashboard.scan_history.map((scan) => (

                  <tr
                    key={scan.id}
                    className="border-b last:border-b-0"
                  >

                    <td className="px-6 py-4 font-medium text-gray-900">
                      #{scan.id}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {scan.domain}
                    </td>

                    <td className="px-6 py-4">

                      <span className="font-bold text-blue-600">
                        {scan.security_score}
                      </span>

                      <span className="text-gray-400">
                        /100
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        {scan.status}
                      </span>

                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(scan.created_dtm)}
                    </td>

                    <td className="px-6 py-4">

                      <a
                        href={`/scan/${scan.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        View Details
                      </a>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

      </section>

    </main>
  );
}


/* Dashboard Card */

function DashboardCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-2 truncate text-2xl font-bold text-gray-900">
        {value}
      </p>

    </div>
  );
}


/* Severity Card */

function SeverityCard({
  label,
  value,
  style,
}: {
  label: string;
  value: number;
  style: string;
}) {
  return (
    <div className={`rounded-xl p-5 ${style}`}>

      <p className="text-sm font-semibold">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

    </div>
  );
}