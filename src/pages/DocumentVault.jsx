import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getApiUrl } from '../utils/serverBase';
import Sidebar from '../components/Sidebar';
import DocumentPreview from '../components/DocumentPreview';
import { useEmployee } from '../context/EmployeeContext';

const types = [
  'Onboarding Report',
  'Offer Letter',
  'Appointment Letter',
  'Increment Letter',
  'Salary Slip',
  'FNF Settlement',
  'Termination Letter',
];

export default function DocumentVault() {
  const { user, employees, fetchAllDocuments, bulkDownloadZip, deleteDocument } = useEmployee();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const staff = ['admin', 'hr'].includes(user?.role);
  const [filters, setFilters] = useState({
    type: 'ALL',
    email: '',
    status: '',
    search: '',
    from: '',
    to: '',
  });
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const request = useRef(0);

  const edit = async (doc) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const routes = {'Onboarding Report':'/employees', 'Offer Letter':'/offer', 'Appointment Letter':'/appointment', 'Increment Letter':'/increment', 'Salary Slip':'/salary', 'Termination Letter':'/termination', 'FNF Settlement':'/fnf'};
      const route = routes[doc.docType];
      if (!route) throw new Error('Editing is unavailable for this document type');
      const result = await api.get(`${getApiUrl()}/documents/edit/${encodeURIComponent(doc.docType)}/${doc._id}`);
      navigate(route, {state:{vaultDocument:result.data.data}});
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (busy || !deleting) return;
    setBusy(true);
    setError('');
    try {
      await deleteDocument(deleting.docType, deleting._id);
      ++request.current;
      setDocuments(prev => prev.filter(doc => doc._id !== deleting._id));
      setSelected(prev => prev.filter(id => id !== deleting._id));
      setPreview(prev => prev?._id === deleting._id ? null : prev);
      setDeleting(null);
      setRefresh(value => value + 1);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const version = ++request.current;
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      fetchAllDocuments(filters)
        .then((result) => {
          if (version === request.current) {
            setDocuments(result.data || []);
            setSelected([]);
          }
        })
        .catch((e) => {
          if (version === request.current)
            setError(e.response?.data?.message || e.message);
        })
        .finally(() => {
          if (version === request.current) setLoading(false);
        });
    }, 250);
    return () => clearTimeout(timer);
  }, [filters, fetchAllDocuments, refresh]);

  const change = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));
  const toggle = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  const download = async (docs) => {
    if (!docs.length || downloading) return;
    setDownloading(true);
    setError('');
    try {
      for (let index = 0; index < docs.length; index += 25)
        await bulkDownloadZip(
          docs.slice(index, index + 25).map((d) => ({
            _id: d._id,
            docType: d.docType,
          }))
        );
    } catch (e) {
      setError(e.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const field =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20';

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <Sidebar />
      <main className="min-w-0 flex-1 space-y-8 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-100">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Document Center
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
              Document Vault &amp; Audit Hub
            </h1>
            <p className="max-w-xl text-sm text-slate-500">
              {staff
                ? 'Generated and emailed documents, preserved exactly as PDFs.'
                : 'Exact PDF attachments sent to your registered email address.'}
            </p>
          </div>
          <button
            onClick={() => setRefresh((v) => v + 1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow"
          >
            <svg
              className="h-4 w-4 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm ring-1 ring-slate-900/5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-slate-800">Filters</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500">
                Document type
              </span>
              <select
                className={field}
                value={filters.type}
                onChange={(e) => change('type', e.target.value)}
              >
                <option value="ALL">All document types</option>
                {types.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            {staff && (
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-slate-500">
                  Employee
                </span>
                <select
                  className={field}
                  value={filters.email}
                  onChange={(e) => change('email', e.target.value)}
                >
                  <option value="">All employees</option>
                  {employees.map((e) => (
                    <option key={e._id} value={e.email}>
                      {e.name} ({e.email})
                    </option>
                  ))}
                </select>
              </label>
            )}
            {staff && (
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-slate-500">
                  Status
                </span>
                <select
                  className={field}
                  value={filters.status}
                  onChange={(e) => change('status', e.target.value)}
                >
                  <option value="">All statuses</option>
                  {['Generated', 'Sent', 'Pending', 'Failed'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            )}
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500">
                From date
              </span>
              <input
                className={field}
                type="date"
                value={filters.from}
                onChange={(e) => change('from', e.target.value)}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500">
                To date
              </span>
              <input
                className={field}
                type="date"
                min={filters.from}
                value={filters.to}
                onChange={(e) => change('to', e.target.value)}
              />
            </label>
            <label className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <span className="text-xs font-medium text-slate-500">
                Search name, email or reference
              </span>
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  className={`${field} pl-10`}
                  value={filters.search}
                  onChange={(e) => change('search', e.target.value)}
                  placeholder="Search documents…"
                />
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            disabled={loading || downloading || !selected.length}
            onClick={() =>
              download(documents.filter((d) => selected.includes(d._id)))
            }
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download selected ({selected.length})
          </button>
          <button
            disabled={loading || downloading || !documents.length}
            onClick={() => download(documents)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              className="h-4 w-4 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download all filtered ({documents.length})
          </button>
          <span className="text-xs text-slate-500">
            {downloading
              ? 'Preparing downloads…'
              : 'Up to 25 PDFs per ZIP; larger selections download in batches.'}
          </span>
        </div>

        {error && (
          <p
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            <svg
              className="h-4 w-4 shrink-0 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="p-4">
                    <input
                      aria-label="Select all filtered documents"
                      type="checkbox"
                      checked={
                        !!documents.length &&
                        selected.length === documents.length
                      }
                      onChange={() =>
                        setSelected(
                          selected.length === documents.length
                            ? []
                            : documents.map((d) => d._id)
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  {['Document', 'Employee / recipient', 'Date', 'Status', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((d) => (
                  <tr
                    key={d._id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="p-4">
                      <input
                        aria-label={`Select ${d.docType} for ${d.employeeName}`}
                        type="checkbox"
                        checked={selected.includes(d._id)}
                        onChange={() => toggle(d._id)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-900">
                        {d.docType}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {d.refNo}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">
                        {d.employeeName}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {d.email}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      {new Date(d.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          d.status === 'Sent'
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                            : d.status === 'Generated'
                              ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20'
                              : d.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                                : d.status === 'Failed'
                                  ? 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
                                  : 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/20'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setPreview(d)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
                      >
                        View / download PDF
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </button>
                      {staff && <>
                        <button type="button" disabled={busy} onClick={() => edit(d)} className="rounded-lg border border-indigo-200 px-3 py-1.5 font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-50">Edit</button>
                        <button type="button" disabled={busy} onClick={() => setDeleting(d)} className="rounded-lg border border-red-200 px-3 py-1.5 font-medium text-red-700 hover:bg-red-50 disabled:opacity-50">Delete</button>
                      </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loading ? (
            <p
              className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500"
              role="status"
            >
              <svg
                className="h-4 w-4 animate-spin text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading documents…
            </p>
          ) : (
            !documents.length && (
              <p className="p-10 text-center text-sm text-slate-500">
                No documents match these filters.
              </p>
            )
          )}
        </div>

        {deleting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-document-title" onKeyDown={e => {if (e.key === 'Escape' && !busy) setDeleting(null);}}>
            <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">
              <h2 id="delete-document-title" className="text-lg font-semibold text-slate-900">Delete document?</h2>
              <p className="text-sm text-slate-600">Remove {deleting.docType} for {deleting.employeeName} ({deleting.refNo}) from the vault? This also removes this entry from the recipient’s vault. Previously sent emails are unaffected.</p>
              <div className="flex justify-end gap-3">
                <button autoFocus type="button" disabled={busy} onClick={() => setDeleting(null)} className="rounded-lg border px-4 py-2 disabled:opacity-50">Cancel</button>
                <button type="button" disabled={busy} onClick={remove} className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50">{busy ? 'Deleting…' : 'Delete'}</button>
              </div>
            </div>
          </div>
        )}
        {preview && (
          <DocumentPreview
            key={preview._id}
            archived
            type={preview.docType}
            id={preview._id}
            onClose={() => setPreview(null)}
          />
        )}
      </main>
    </div>
  );
}
