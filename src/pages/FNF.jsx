import { vaultForm } from '../utils/vaultForm';
import VaultEditNotice from '../components/VaultEditNotice';
import DocumentPreview from "../components/DocumentPreview";
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useEmployee } from '../context/EmployeeContext';
import api from '../../services/api';
import { getApiUrl } from '../utils/serverBase';

const initial = {
  employeeId: '',
  employeeName: '',
  email: '',
  phone: '',
  dateOfJoining: '',
  lastWorkingDay: '',
  designation: '',
  address: '',
  bankAccount: '',
  ifsc: '',
  pendingSalary: 0,
  leaveEncashment: 0,
  incentive: 0,
  gratuity: 0,
  noticeRecovery: 0,
  deductions: 0,
  laptopReturned: false,
  idCardReturned: false,
  clearanceApproved: false,
  remarks: '',
};

const moneyFields = {
  pendingSalary: 'Unpaid salary',
  leaveEncashment: 'Leave encashment',
  incentive: 'Bonus / incentive',
  gratuity: 'Gratuity',
  noticeRecovery: 'Notice recovery',
  deductions: 'Other deductions / tax',
};

const textFields = {
  employeeId: 'Employee ID',
  employeeName: 'Employee name',
  email: 'Registered email',
  phone: 'Phone',
  dateOfJoining: 'Joining date',
  lastWorkingDay: 'Last working day',
  designation: 'Designation',
  bankAccount: 'Bank account',
  ifsc: 'IFSC',
  address: 'Address',
};

const inr = (value) =>
  Number(value).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

export default function FNF() {
  const { employees } = useEmployee();
  const location = useLocation();
  const [data, setData] = useState(() => vaultForm(initial, location.state?.vaultDocument, {}));
  const [records, setRecords] = useState([]);
  const [previewRecord, setPreviewRecord] = useState(null);
  const [editId, setEditId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const endpoint = getApiUrl() + '/fnf';

  const refresh = useCallback(async () => {
    const response = await api.get(endpoint);
    setRecords(response.data.data);
  }, [endpoint]);

  useEffect(() => {
    refresh().catch((e) =>
      setMessage(e.response?.data?.message || 'Unable to load settlements')
    );
  }, [refresh]);

  const selectEmployee = useCallback(
    (id) => {
      const emp = employees.find((e) => e._id === id);
      if (!emp) return;
      setEditId(null);
      setData({
        ...initial,
        employeeId: emp.empId || `VAM-${emp._id.slice(-4).toUpperCase()}`,
        employeeName: emp.name,
        email: emp.email,
        phone: emp.phoneNumber || emp.phone || '',
        dateOfJoining: emp.dateOfJoining?.slice(0, 10) || '',
        lastWorkingDay: emp.dateOfExit?.slice(0, 10) || '',
        designation: emp.designation || '',
        bankAccount: emp.accountNumber || '',
        ifsc: emp.ifscCode || '',
        address: emp.address || '',
      });
    },
    [employees]
  );

  useEffect(() => {
    const id = new URLSearchParams(location.search).get('employeeId');
    if (id) selectEmployee(id);
  }, [location.search, selectEmployee]);

  const total =
    (Math.round(Number(data.pendingSalary) * 100) +
      Math.round(Number(data.leaveEncashment) * 100) +
      Math.round(Number(data.incentive) * 100) +
      Math.round(Number(data.gratuity) * 100) -
      Math.round(Number(data.noticeRecovery) * 100) -
      Math.round(Number(data.deductions) * 100)) /
    100;

  const run = async (action) => {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      await action();
      await refresh();
    } catch (e) {
      setMessage(e.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  };

  const save = (e) => {
    e.preventDefault();
    run(async () => {
      const response = editId
        ? await api.put(`${endpoint}/${editId}`, data)
        : await api.post(endpoint, data);
      if (e.nativeEvent.submitter?.value === 'preview')
        setPreviewRecord(response.data.data);
      setEditId(null);
      setData(initial);
      setMessage(
        'Draft saved. Review the saved amounts and approve when clearance is complete.'
      );
    });
  };

  const transition = (record, status) =>
    run(async () => {
      const paymentReference =
        status === 'Disbursed'
          ? window.prompt('Enter the completed bank payment reference')
          : undefined;
      if (status === 'Disbursed' && !paymentReference) return;
      await api.patch(`${endpoint}/${record._id}/status`, {
        status,
        paymentReference,
      });
      setMessage(
        status === 'Disbursed' ? 'Payment recorded.' : 'Settlement approved.'
      );
    });

  const send = (record, documentId) =>
    run(async () => {
      await api.post(`${endpoint}/${record._id}/send`, { documentId });
      setMessage(
        `Statement emailed to ${record.email}. The exact attachment is now in their wallet.`
      );
    });

  const remove = (record) => {
    if (
      window.confirm(
        'Delete this saved settlement? Archived PDFs remain in the audit hub.'
      )
    )
      run(async () => {
        await api.delete(endpoint + '/' + record._id);
        if (editId === record._id) {
          setEditId(null);
          setData(initial);
        }
        setMessage('Settlement deleted.');
      });
  };

  const input =
    'block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20';

  return (
    <div className="flex min-h-screen bg-slate-100 text-gray-800">
      <Sidebar />
      <main className="min-w-0 flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
        <VaultEditNotice />
        {/* Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 ring-1 ring-orange-100">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            Payroll · Exit
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
            Full &amp; Final Settlement
          </h1>
          <p className="max-w-2xl text-sm text-slate-500">
            Prepare a draft → review and approve → send the statement → record
            payment.
          </p>
        </div>

        {message && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-900 shadow-sm"
          >
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{message}</span>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={save}
          className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-md lg:p-8"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-slate-800">
              {editId ? 'Edit settlement draft' : 'New settlement draft'}
            </h2>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-slate-500">
              Choose employee
            </span>
            <select
              className={input}
              value={
                employees.find(
                  (e) =>
                    e.name === data.employeeName && e.email === data.email
                )?._id || ''
              }
              onChange={(e) => selectEmployee(e.target.value)}
            >
              <option value="">Select an employee</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name} — {e.email}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(textFields).map(([key, label]) => (
              <label key={key} className="space-y-1.5">
                <span className="text-xs font-medium text-slate-500">
                  {label}
                </span>
                <input
                  className={input}
                  type={
                    key === 'email'
                      ? 'email'
                      : key === 'dateOfJoining' || key === 'lastWorkingDay'
                        ? 'date'
                        : 'text'
                  }
                  required={[
                    'employeeId',
                    'employeeName',
                    'email',
                    'phone',
                    'dateOfJoining',
                    'lastWorkingDay',
                  ].includes(key)}
                  min={key === 'lastWorkingDay' ? data.dateOfJoining : undefined}
                  value={data[key]}
                  onChange={(e) =>
                    setData({ ...data, [key]: e.target.value })
                  }
                />
              </label>
            ))}
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm text-amber-900">
            Enter confirmed payroll amounts. Unpaid salary is the actual balance
            due, not automatically the full monthly salary. Gratuity, taxes and
            recoveries must be checked by payroll.
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(moneyFields).map(([key, label]) => (
              <label key={key} className="space-y-1.5">
                <span className="text-xs font-medium text-slate-500">
                  {label} (₹)
                </span>
                <input
                  className={input}
                  type="number"
                  min="0"
                  max="1000000000"
                  step="0.01"
                  required
                  value={data[key]}
                  onChange={(e) =>
                    setData({ ...data, [key]: e.target.value })
                  }
                />
              </label>
            ))}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {Object.entries({
              laptopReturned: 'Assets returned / not applicable',
              idCardReturned: 'ID card returned / not applicable',
              clearanceApproved: 'HR and payroll clearance complete',
            }).map(([key, label]) => (
              <label
                key={key}
                className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={data[key]}
                  onChange={(e) =>
                    setData({ ...data, [key]: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 accent-orange-600 text-orange-600 focus:ring-orange-500"
                />
                {label}
              </label>
            ))}
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Notes</span>
            <textarea
              className={`${input} min-h-[88px] resize-y`}
              value={data.remarks}
              onChange={(e) => setData({ ...data, remarks: e.target.value })}
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/80 px-5 py-4">
            <p className="text-lg font-semibold text-slate-900">
              <span className="text-sm font-medium text-slate-500">
                {total < 0 ? 'Recovery due' : 'Net payable'}
              </span>
              <span className="ml-2">{inr(Math.abs(total))}</span>
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editId ? 'Update draft' : 'Save draft'}
              </button>
              <button
                type="submit"
                value="preview"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-bold text-orange-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save &amp; preview PDF
              </button>
            </div>
          </div>
        </form>

        {/* Saved settlements */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-slate-800">
              Saved settlements
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  {['Employee', 'Last day', 'Net amount', 'Status', 'Actions'].map(
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
                {records.map((r) => (
                  <tr key={r._id} className="transition hover:bg-slate-50/80">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">
                        {r.employeeName}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {r.email}
                      </div>
                      <details className="mt-2 group">
                        <summary className="cursor-pointer text-xs font-medium text-indigo-600 hover:text-indigo-700">
                          View breakdown
                        </summary>
                        <div className="mt-2 space-y-1 rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-600">
                          {Object.entries(moneyFields).map(([key, label]) => (
                            <div key={key} className="flex justify-between gap-4">
                              <span>{label}</span>
                              <span className="font-medium tabular-nums">
                                {inr(r[key] || 0)}
                              </span>
                            </div>
                          ))}
                          {r.remarks && (
                            <p className="border-t border-slate-200 pt-2 text-slate-500">
                              {r.remarks}
                            </p>
                          )}
                          <p className="border-t border-slate-200 pt-2 text-slate-500">
                            Assets:{' '}
                            {r.laptopReturned ? 'Cleared' : 'Pending'} · ID:{' '}
                            {r.idCardReturned ? 'Cleared' : 'Pending'} · HR:{' '}
                            {r.clearanceApproved ? 'Cleared' : 'Pending'}
                          </p>
                        </div>
                      </details>
                    </td>
                    <td className="p-4 text-slate-600">{r.lastWorkingDay}</td>
                    <td className="p-4 font-medium tabular-nums text-slate-900">
                      {inr(r.totalPayable)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          r.status === 'Disbursed'
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                            : r.status === 'Approved'
                              ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20'
                              : r.status === 'Draft'
                                ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                                : 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/20'
                        }`}
                      >
                        {r.status}
                      </span>
                      {r.paymentReference && (
                        <div className="mt-1 text-xs text-slate-500">
                          {r.paymentReference}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                        <button
                          disabled={busy}
                          onClick={() => {
                            setData({ ...initial, ...r });
                            setEditId(
                              r.status === 'Disbursed' ? null : r._id
                            );
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-sm font-medium text-slate-600 transition hover:text-slate-900 disabled:opacity-50"
                        >
                          {r.status === 'Disbursed'
                            ? 'Edit as new draft'
                            : 'Edit'}
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => setPreviewRecord(r)}
                          className="text-sm font-medium text-indigo-600 transition hover:text-indigo-700 disabled:opacity-50"
                        >
                          Preview PDF
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => remove(r)}
                          className="text-sm font-medium text-red-600 transition hover:text-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                        {r.status === 'Draft' && (
                          <button
                            disabled={busy}
                            onClick={() => transition(r, 'Approved')}
                            className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700 disabled:opacity-50"
                          >
                            Approve
                          </button>
                        )}
                        {['Approved', 'Disbursed'].includes(r.status) && (
                          <button
                            disabled={busy}
                            onClick={() => setPreviewRecord(r)}
                            className="text-sm font-medium text-indigo-600 transition hover:text-indigo-700 disabled:opacity-50"
                          >
                            Send statement
                          </button>
                        )}
                        {r.status === 'Approved' && (
                          <button
                            disabled={busy}
                            onClick={() => transition(r, 'Disbursed')}
                            className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700 disabled:opacity-50"
                          >
                            Record payment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!records.length && (
            <p className="p-10 text-center text-sm text-slate-500">
              No settlements yet.
            </p>
          )}
        </section>

        {previewRecord && (
          <DocumentPreview
            key={previewRecord._id}
            type="FNF Settlement"
            id={previewRecord._id}
            busy={busy}
            onClose={() => setPreviewRecord(null)}
            onSend={
              ['Approved', 'Disbursed'].includes(previewRecord.status)
                ? (documentId) => send(previewRecord, documentId)
                : undefined
            }
          />
        )}
      </main>
    </div>
  );
}
