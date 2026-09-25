import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, CalendarDays, ChevronLeft, ChevronRight, Eye, IndianRupee, LayoutGrid, List, MoreHorizontal, Pencil, Search, ShieldCheck, Trash2, UserPlus, Users, X } from 'lucide-react';
import PrivateImage from './PrivateImage';
import EmployeeDialog from './EmployeeDialog';
import { filterEmployees } from '../utils/employeeDirectory';

const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2';
const control = `rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 ${focus}`;
const money = value => value == null || value === '' ? '—' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0);
const date = value => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not recorded';

export default function EmployeeDirectory({ employees, loading, onView, onEdit, onDelete, getPhotoUrl }) {
  const [filters, setFilters] = useState({ search: '', status: 'all', designation: '', sort: 'newest' });
  const [page, setPage] = useState(1);
  const [view, setView] = useState('table');
  const [actions, setActions] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const completed = employees.filter(e => e.onboardingStatus === 'Completed').length;
  const designations = [...new Set(employees.map(e => e.designation || 'Unassigned'))].sort();
  const filtered = filterEmployees(employees, filters);
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * 8, currentPage * 8);
  const change = (key, value) => { setFilters(previous => ({ ...previous, [key]: value })); setPage(1); };
  const reset = () => { setFilters({ search: '', status: 'all', designation: '', sort: 'newest' }); setPage(1); };
  const hasFilters = filters.search || filters.status !== 'all' || filters.designation;
  const stats = [
    { title: 'Total employees', value: employees.length, detail: 'People in your directory', icon: Users },
    { title: 'Onboarding complete', value: completed, detail: `${employees.length - completed} awaiting completion`, icon: ShieldCheck },
    { title: 'Team designations', value: designations.length, detail: 'Roles across your team', icon: BriefcaseBusiness },
    { title: 'Monthly salary total', value: money(employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0)), detail: 'Recorded salaries, before deductions', icon: IndianRupee },
  ];
  const employeeActions = employee => (
    <div className="flex items-center justify-end gap-1">
      <button type="button" onClick={() => onView(employee)} aria-label={`View ${employee.name}`} title="View profile" className={`${focus} rounded-lg p-2 text-slate-500 hover:bg-orange-50 hover:text-orange-600`}><Eye size={16} /></button>
      <button type="button" onClick={() => onEdit(employee)} aria-label={`Edit ${employee.name}`} title="Edit employee" className={`${focus} rounded-lg p-2 text-slate-500 hover:bg-orange-50 hover:text-orange-600`}><Pencil size={16} /></button>
      <button type="button" onClick={() => setActions(employee)} aria-label={`More actions for ${employee.name}`} title="Employee workflows" className={`${focus} rounded-lg p-2 text-slate-500 hover:bg-slate-100`}><MoreHorizontal size={18} /></button>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Viral Ads Media / People</p><h1 className="text-2xl font-bold tracking-tight text-slate-950">Employee Management</h1></div>
        <Link to="/dashboard" className={`${focus} inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:border-orange-300`}>Dashboard<ArrowUpRight size={15} /></Link>
      </header>
      <section className="relative overflow-hidden rounded-3xl bg-[#101b30] p-6 text-white sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 h-80 w-80 rounded-full border-[45px] border-white/[0.025]" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div><p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300"><span className="h-1.5 w-1.5 rounded-full bg-orange-400" />Your people, connected</p><h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">A better view of your team.</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">Manage employee profiles, keep records up to date, and move every people workflow forward.</p></div>
          <Link to="/employees/add" className={`${focus} inline-flex shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold shadow-lg shadow-orange-950/20 transition hover:bg-orange-600`}><UserPlus size={18} />Add employee</Link>
        </div>
      </section>
      <section aria-label="Employee summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, value, detail, icon: Icon }) => <div key={title} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-3"><span className="rounded-xl bg-orange-50 p-2.5 text-orange-600"><Icon size={18} /></span><h2 className="text-xs font-medium text-slate-500">{title}</h2></div>{loading ? <div className="h-8 w-24 rounded bg-slate-100 motion-safe:animate-pulse" /> : <p className="break-words text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>}<p className="mt-2 text-[11px] text-slate-500">{detail}</p></div>)}
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
          <div className="flex items-center gap-3"><h2 className="text-base font-semibold text-slate-900">People directory</h2><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">{loading ? '…' : employees.length}</span></div>
          <div className="flex rounded-lg bg-slate-100 p-1" role="group" aria-label="Directory display">{[['table', List, 'Table view'], ['cards', LayoutGrid, 'Card view']].map(([value, Icon, label]) => <button key={value} type="button" aria-label={label} aria-pressed={view === value} title={label} onClick={() => setView(value)} className={`${focus} rounded-md p-2 ${view === value ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}><Icon size={17} /></button>)}</div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-y border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">
          <label className="relative min-w-48 flex-1"><Search size={16} className="pointer-events-none absolute left-3.5 top-3 text-slate-400" /><span className="sr-only">Search employees</span><input type="search" value={filters.search} onChange={event => change('search', event.target.value)} placeholder="Search name, email, ID or phone…" className={`${control} w-full pl-10`} /></label>
          <select aria-label="Filter by designation" value={filters.designation} onChange={event => change('designation', event.target.value)} className={`${control} max-w-full sm:max-w-52`}><option value="">All designations</option>{designations.map(role => <option key={role} value={role}>{role}</option>)}</select>
          <select aria-label="Sort employees" value={filters.sort} onChange={event => change('sort', event.target.value)} className={control}><option value="newest">Newest joining date</option><option value="name">Name: A–Z</option><option value="salary">Salary: high to low</option></select>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-6">
          <div className="flex flex-wrap gap-1" role="group" aria-label="Onboarding status">{[['all', 'All employees', employees.length], ['pending', 'Pending', employees.length - completed], ['completed', 'Completed', completed]].map(([value, label, count]) => <button key={value} type="button" aria-pressed={filters.status === value} onClick={() => change('status', value)} className={`${focus} rounded-lg px-3 py-2 text-xs font-medium ${filters.status === value ? 'bg-orange-50 text-orange-700' : 'text-slate-500 hover:bg-slate-50'}`}>{label}<span className="ml-2 opacity-70">{loading ? '—' : count}</span></button>)}</div>
          {hasFilters && <button type="button" onClick={reset} className={`${focus} inline-flex items-center gap-1 rounded text-xs font-medium text-slate-500 hover:text-orange-600`}><X size={13} />Clear filters</button>}
        </div>
        {loading ? <div role="status" aria-label="Loading employees" className="space-y-4 p-6 motion-safe:animate-pulse">{[1, 2, 3, 4].map(n => <div key={n} className="h-16 rounded-xl bg-slate-100" />)}</div> : !visible.length ? <div className="px-6 py-16 text-center"><Users className="mx-auto mb-4 text-slate-300" size={32} /><h3 className="font-semibold text-slate-800">{employees.length ? 'No matching employees' : 'Build your team directory'}</h3><p className="mt-2 text-sm text-slate-500">{employees.length ? 'Try a different search or reset your filters.' : 'Add your first employee to get started.'}</p>{hasFilters ? <button type="button" onClick={reset} className={`${focus} mt-5 rounded-lg bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700`}>Reset filters</button> : <Link to="/employees/add" className={`${focus} mt-5 inline-flex rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white`}>Add employee</Link>}</div> : view === 'table' ? (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead className="border-y border-slate-100 bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500"><tr>{['Employee', 'Designation', 'Monthly salary', 'Joined', 'Onboarding', 'Actions'].map(label => <th key={label} scope="col" className="whitespace-nowrap px-5 py-3 font-semibold last:text-right">{label}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{visible.map(employee => <tr key={employee._id} className="transition hover:bg-orange-50/20">
              <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar employee={employee} getPhotoUrl={getPhotoUrl} /><div><button type="button" onClick={() => onView(employee)} className={`${focus} whitespace-nowrap rounded text-left text-sm font-semibold text-slate-900 hover:text-orange-600`}>{employee.name || 'Unnamed employee'}</button><p title={employee.email} className="mt-1 max-w-56 truncate text-xs text-slate-500">{employee.email || 'No email recorded'}</p><p className="mt-1 text-[10px] font-medium text-slate-400">{employee.empId || `ID: ${employee._id?.slice(-6).toUpperCase()}`}</p></div></div></td>
              <td className="px-5 py-4"><span className="inline-block rounded-lg border border-slate-200/70 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">{employee.designation || 'Unassigned'}</span></td>
              <td className="whitespace-nowrap px-5 py-4 text-xs font-semibold tabular-nums text-slate-700">{money(employee.salary)}</td>
              <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{date(employee.dateOfJoining)}</td>
              <td className="px-5 py-4"><Status employee={employee} /></td>
              <td className="px-4 py-4">{employeeActions(employee)}</td>
            </tr>)}</tbody>
          </table></div>
        ) : (
          <div className="grid gap-4 bg-slate-50/50 p-5 sm:grid-cols-2 sm:p-6 2xl:grid-cols-4">{visible.map(employee => <article key={employee._id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-200"><div className="flex items-center justify-between gap-2"><Avatar employee={employee} getPhotoUrl={getPhotoUrl} /><Status employee={employee} /></div><button type="button" onClick={() => onView(employee)} className={`${focus} mt-4 block max-w-full truncate rounded text-left text-sm font-semibold text-slate-900 hover:text-orange-600`}>{employee.name || 'Unnamed employee'}</button><p className="mt-1 truncate text-xs text-slate-500">{employee.designation || 'Unassigned'}</p><p title={employee.email} className="mt-3 truncate text-xs text-slate-500">{employee.email || 'No email recorded'}</p><div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs"><p className="flex justify-between gap-2"><span className="text-slate-400">Monthly salary</span><span className="font-medium text-slate-700">{money(employee.salary)}</span></p><p className="flex items-center gap-1.5 text-slate-500"><CalendarDays size={13} />{date(employee.dateOfJoining)}</p></div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><Link to={`/onboarding?employeeId=${encodeURIComponent(employee._id)}`} className={`${focus} rounded text-xs font-semibold text-orange-600`}>Onboarding</Link>{employeeActions(employee)}</div></article>)}</div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:px-6"><p aria-live="polite">{loading ? 'Loading your directory…' : `Showing ${filtered.length ? (currentPage - 1) * 8 + 1 : 0}–${Math.min(currentPage * 8, filtered.length)} of ${filtered.length} employees`}</p><div className="flex items-center gap-3"><button type="button" aria-label="Previous page" disabled={currentPage === 1 || loading} onClick={() => setPage(currentPage - 1)} className={`${control} p-2 disabled:opacity-30`}><ChevronLeft size={15} /></button><span>Page {currentPage} of {pages}</span><button type="button" aria-label="Next page" disabled={currentPage === pages || loading} onClick={() => setPage(currentPage + 1)} className={`${control} p-2 disabled:opacity-30`}><ChevronRight size={15} /></button></div></div>
      </section>
      <p className="pb-2 text-[10px] text-slate-500">Viral Ads Media · Employee profiles & people operations</p>
      {actions && <EmployeeDialog label={`Workflows for ${actions.name}`} onClose={() => setActions(null)} busy={deleting}>
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-6"><div><h2 className="text-lg font-semibold text-slate-900">Employee workflows</h2><p className="mt-1 text-sm text-slate-500">{actions.name} · {actions.designation || 'Unassigned'}</p></div><button type="button" disabled={deleting} onClick={() => setActions(null)} aria-label="Close employee workflows" className={`${focus} rounded-lg p-2 text-slate-500`}><X size={20} /></button></div>
        <div className="grid gap-3 overflow-y-auto p-6 sm:grid-cols-2">{[['onboarding', 'Onboarding', 'Complete employee setup'], ['salary', 'Salary slip', 'Prepare a payslip'], ['increment', 'Increment letter', 'Review a salary increase'], ['termination', 'Termination letter', 'Prepare exit documentation'], ['fnf', 'Full & final settlement', 'Manage final dues']].map(([path, title, detail]) => <Link key={path} to={`/${path}?employeeId=${encodeURIComponent(actions._id)}`} className={`${focus} group flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 hover:border-orange-200 hover:bg-orange-50`}><span><span className="block text-sm font-semibold text-slate-700">{title}</span><span className="mt-1 block text-xs text-slate-500">{detail}</span></span><ArrowRight size={16} className="text-slate-400 group-hover:text-orange-600" /></Link>)}</div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 p-6"><p className="text-xs text-slate-500">Choose a workflow for this employee.</p><button type="button" disabled={deleting} onClick={async () => { setDeleting(true); try { const removed = await onDelete(actions._id); if (removed) setActions(null); } finally { setDeleting(false); } }} className={`${focus} inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50`}><Trash2 size={14} />{deleting ? 'Deleting…' : 'Delete employee'}</button></div>
      </EmployeeDialog>}
    </div>
  );
}

function Status({ employee }) {
  const complete = employee.onboardingStatus === 'Completed';
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${complete ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}><span className={`h-1.5 w-1.5 rounded-full ${complete ? 'bg-emerald-500' : 'bg-orange-500'}`} />{employee.onboardingStatus || 'Pending'}</span>;
}

function Avatar({ employee, getPhotoUrl }) {
  const [failed, setFailed] = useState(false);
  return <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-500"><span>{(employee.name || 'E').split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()}</span>{employee.photo && !failed && <PrivateImage src={getPhotoUrl(employee.photo)} alt="" className="absolute inset-0 h-full w-full object-cover" onError={() => setFailed(true)} />}</div>;
}

