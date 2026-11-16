"use client";

import { useState } from "react";

type Scan = {
  id: number;
  domain: string;
  status: string;
  security_score: number;
  created_dtm: string;
};

export default function HistoryPage() {
  const [domain, setDomain] = useState("");
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadHistory() {

    if (!domain.trim()) {
      setError("Please enter a domain.");
      return;
    }

    setLoading(true);
    setError("");
    setScans([]);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/scans/${encodeURIComponent(domain)}`
      );

      if (!response.ok) {
        throw new Error("Failed to load scan history");
      }

      const data = await response.json();

      setScans(data);
    } catch (err) {
      setError("Unable to connect to Vigilez backend.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

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

          <span className="text-sm font-medium text-gray-500">
            Scan History
          </span>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Scan History
          </h2>

          <p className="mt-2 text-gray-600">
            View previous security scans for your domain.
          </p>
        </div>

        {/* Search */}
        <div className="mt-8 flex max-w-2xl gap-3">
          <input
            type="text"
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />

          <button
            onClick={() => loadHistory()}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load History"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Empty */}
        {!loading && !error && scans.length === 0 && (
          <div className="mt-10 rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">
              Enter a domain to view its scan history.
            </p>
          </div>
        )}

        {/* History table */}
        {scans.length > 0 && (
          <div className="mt-10 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
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
                  {scans.map((scan) => (
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
          </div>
        )}
      </section>
    </main>
  );
}