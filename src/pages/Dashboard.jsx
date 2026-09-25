import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BadgeCheck, BriefcaseBusiness, CalendarDays, ChevronLeft, ChevronRight, CircleCheck, FileText, FolderArchive, IndianRupee, Receipt, Search, ShieldCheck, TrendingUp, UserPlus, Users } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import PrivateImage from '../components/PrivateImage';
import { useEmployee } from '../context/EmployeeContext';
import { getApiUrl, getServerBase } from '../utils/serverBase';
import api from '../../services/api';

const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
const dateLabel = value => value && Number.isFinite(new Date(value).getTime()) ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const panel = 'rounded-2xl border border-slate-200/80 bg-white shadow-sm';
const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2';
const workflows = [
  { title: 'Offer letter', detail: 'Start a new hire', path: '/offer', icon: FileText },
  { title: 'Appointment', detail: 'Make it official', path: '/appointment', icon: BadgeCheck },
  { title: 'Salary slip', detail: 'Prepare a payslip', path: '/salary', icon: Receipt },
  { title: 'Increment', detail: 'Recognize growth', path: '/increment', icon: TrendingUp },
  { title: 'Onboarding', detail: 'Welcome your team', path: '/onboarding', icon: UserPlus },
  { title: 'FNF settlement', detail: 'Manage an exit', path: '/fnf', icon: BriefcaseBusiness },
];

export default function Dashboard() {
  const { employees = [], loading, user } = useEmployee();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [settlements, setSettlements] = useState({ loading: true, data: [], error: '' });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api.get(`${getApiUrl()}/fnf`, { signal: controller.signal })
      .then(({ data }) => setSettlements({ loading: false, data: data.data || [], error: '' }))
      .catch(() => { if (!controller.signal.aborted) setSettlements({ loading: false, data: [], error: 'Settlement data unavailable' }); });
    return () => controller.abort();
  }, [retry]);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const name = user?.name || user?.username || (user?.role === 'hr' ? 'HR team' : 'Administrator');
  const completed = employees.filter(e => e.onboardingStatus === 'Completed').length;
  const pending = employees.length - completed;
  const completion = employees.length ? Math.round(completed / employees.length * 100) : 0;
  const salaryTotal = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
  const joiners = employees.filter(e => { const d = new Date(e.dateOfJoining); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && d <= now; }).length;
  const openSettlements = settlements.data.filter(s => !s.deletedAt && s.status !== 'Disbursed');
  const pendingEmployees = employees.filter(e => e.onboardingStatus !== 'Completed').slice(0, 3);
  const roles = (() => {
    const counts = new Map();
    employees.forEach(e => { const role = e.designation?.trim() || 'Unassigned'; counts.set(role, (counts.get(role) || 0) + 1); });
    const sorted = [...counts].sort((a, b) => b[1] - a[1]);
    return sorted.length > 4 ? [...sorted.slice(0, 4), ['Other roles', sorted.slice(4).reduce((sum, [, count]) => sum + count, 0)]] : sorted;
  })();
  const filtered = (() => {
    const query = search.trim().toLowerCase();
    return employees.filter(e =>
      (status === 'all' || (e.onboardingStatus === 'Completed') === (status === 'completed')) &&
      (!query || [e.name, e.email, e.designation, e.empId].some(value => String(value || '').toLowerCase().includes(query)))
    ).sort((a, b) => (Date.parse(b.dateOfJoining) || 0) - (Date.parse(a.dateOfJoining) || 0));
  })();
  const pages = Math.max(1, Math.ceil(filtered.length / 6));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * 6, currentPage * 6);

  return (
    <div className="flex min-h-screen bg-[#f5f6f8] font-sans text-slate-800 selection:bg-orange-100">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 sm:p-6 xl:p-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <header className="flex flex-wrap items-center justify-between gap-4">
      
            <div className="flex items-center gap-3"><span className="hidden items-center gap-2 text-xs font-medium text-slate-500 sm:inline-flex"><CalendarDays size={15} />{dateLabel(now)}</span><Link to="/documents" className={`${focus} inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold hover:border-orange-300`}><FolderArchive size={16} />Document Vault</Link></div>
          </header>

          <section className="relative overflow-hidden rounded-3xl bg-[#101b30] p-6 text-white sm:p-8 xl:p-9">
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-32 h-96 w-96 rounded-full border-[50px] border-white/[0.025]" />
            <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-8">
              <div className="max-w-2xl"><p className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300"><span className="h-1.5 w-1.5 rounded-full bg-orange-400" />People & operations</p><h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{greeting}, <span className="text-orange-300">{name}.</span></h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">Your team, payroll and people workflows, in one place.</p>
                <div className="mt-6 flex flex-wrap gap-3"><Link to="/employees/add" className={`${focus} inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-600`}><UserPlus size={17} />Add employee</Link><Link to="/employees" className={`${focus} inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10`}>Explore directory<ArrowUpRight size={16} /></Link></div>
              </div>
              <div className="min-w-48 border-l border-white/10 pl-6"><p className="text-xs text-slate-400">This month’s new joiners</p><p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums">{loading ? '—' : String(joiners).padStart(2, '0')}<span className="ml-3 text-xs font-normal text-slate-400">team members</span></p><p className="mt-3 text-xs text-orange-300">{now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p></div>
            </div>
          </section>

          <section aria-label="Workspace metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric title="Total employees" value={employees.length} detail="Registered team members" icon={Users} to="/employees" loading={loading} />
            <Metric title="Monthly salary total" value={money(salaryTotal)} detail="Sum of recorded employee salaries" icon={IndianRupee} to="/salary" loading={loading} />
            <Metric title="Pending onboarding" value={pending} detail={`${completed} employees completed`} icon={ShieldCheck} to="/onboarding" loading={loading} attention={pending > 0} />
            <Metric title="Open settlements" value={settlements.error ? '—' : openSettlements.length} detail={settlements.error || 'Saved settlements not yet disbursed'} icon={BriefcaseBusiness} to="/fnf" loading={settlements.loading} attention={!settlements.error && openSettlements.length > 0} />
          </section>

          <div className="grid gap-6 xl:grid-cols-12">
            <section className={`${panel} p-5 sm:p-6 xl:col-span-5`}>
              <SectionTitle title="Quick workspace" detail="Move from a task to a finished document." />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">{workflows.map(({ title, detail, path, icon: Icon }) => <Link key={path} to={path} className={`${focus} group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition hover:border-orange-200 hover:bg-orange-50/60`}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/70 bg-white text-slate-600 group-hover:text-orange-600"><Icon size={17} /></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-800">{title}</span><span className="mt-1 block text-[11px] text-slate-500">{detail}</span></span><ArrowUpRight size={14} className="shrink-0 text-slate-400 group-hover:text-orange-600" /></Link>)}</div>
            </section>
            <section className={`${panel} p-5 sm:p-6 xl:col-span-3`}>
              <SectionTitle title="Onboarding health" detail="Completion across your directory." />
              {loading ? <Placeholder /> : <><div role="img" aria-label={`${completed} of ${employees.length} employees completed onboarding, ${completion} percent`} className="relative mx-auto my-5 flex h-36 w-36 items-center justify-center rounded-full" style={{ background: `conic-gradient(#f97316 ${completion}%, #f1f5f9 0)` }}><div className="flex h-[116px] w-[116px] flex-col items-center justify-center rounded-full bg-white"><span className="text-3xl font-semibold tracking-tight text-slate-900">{employees.length ? `${completion}%` : '—'}</span><span className="mt-1 text-[11px] text-slate-500">{employees.length ? 'completed' : 'No employees yet'}</span></div></div><div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-4 text-xs"><span className="flex items-center gap-2 text-slate-500"><span className="h-2 w-2 rounded-full bg-orange-500" />Complete <b className="text-slate-800">{completed}</b></span><span className="flex items-center gap-2 text-slate-500"><span className="h-2 w-2 rounded-full bg-slate-200" />Pending <b className="text-slate-800">{pending}</b></span></div></>}
            </section>
            <section className={`${panel} p-5 sm:p-6 xl:col-span-4`}>
              <SectionTitle title="Team composition" detail="Employees by designation." />
              {loading ? <Placeholder /> : roles.length ? <div className="mt-6 space-y-4">{roles.map(([role, count], index) => <div key={role}><div className="mb-2 flex justify-between gap-3 text-xs"><span className="truncate text-slate-600" title={role}>{role}</span><span className="shrink-0 font-semibold tabular-nums text-slate-900">{count} <span className="ml-1 font-normal text-slate-500">/ {employees.length}</span></span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${index === 0 ? 'bg-orange-500' : 'bg-slate-400'}`} style={{ width: `${count / employees.length * 100}%` }} /></div></div>)}</div> : <Empty title="Your team starts here" detail="Add employees to see the role breakdown." />}
            </section>
          </div>

          <div className="grid items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className={`${panel} min-w-0 overflow-hidden`}>
              <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6"><SectionTitle title="People directory" detail="Your team, with the newest joining dates first." /><Link to="/employees" className={`${focus} inline-flex items-center gap-1 rounded text-xs font-semibold text-orange-600 hover:text-orange-700`}>Manage employees<ArrowUpRight size={15} /></Link></div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-100 px-5 py-3 sm:px-6">
                <div className="flex rounded-lg bg-slate-100 p-1" role="group" aria-label="Filter onboarding status">{[['all', 'All staff'], ['pending', 'Pending'], ['completed', 'Completed']].map(([value, label]) => <button key={value} type="button" aria-pressed={status === value} onClick={() => { setStatus(value); setPage(1); }} className={`${focus} rounded-md px-3 py-2 text-xs font-medium transition ${status === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>{label}</button>)}</div>
                <label className="relative w-full sm:w-64"><Search size={15} className="pointer-events-none absolute left-3 top-3 text-slate-400" /><span className="sr-only">Search employees by name, email, role or employee ID</span><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search your team…" className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" /></label>
              </div>
              {loading ? <Placeholder /> : visible.length ? <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50/70 text-[10px] uppercase tracking-wider text-slate-500"><tr>{['Employee', 'Designation', 'Monthly salary', 'Joined', 'Onboarding', ''].map((label, i) => <th key={i} scope="col" className="whitespace-nowrap px-5 py-3 font-semibold">{label || <span className="sr-only">Action</span>}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{visible.map(employee => <tr key={employee._id} className="transition hover:bg-slate-50/80">
                <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar employee={employee} /><div className="min-w-0"><Link to="/employees" className={`${focus} whitespace-nowrap rounded font-semibold text-slate-900 hover:text-orange-600`}>{employee.name || 'Unnamed employee'}</Link><p className="mt-1 max-w-48 truncate text-[11px] text-slate-500" title={employee.email}>{employee.email || employee.empId || 'No email recorded'}</p></div></div></td>
                <td className="px-5 py-4 text-slate-600"><span className="line-clamp-2 min-w-28">{employee.designation || 'Unassigned'}</span></td>
                <td className="whitespace-nowrap px-5 py-4 font-medium tabular-nums text-slate-700">{employee.salary == null ? '—' : money(Number(employee.salary) || 0)}</td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-500">{dateLabel(employee.dateOfJoining)}</td>
                <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold ${employee.onboardingStatus === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}><span className={`h-1.5 w-1.5 rounded-full ${employee.onboardingStatus === 'Completed' ? 'bg-emerald-500' : 'bg-orange-500'}`} />{employee.onboardingStatus || 'Pending'}</span></td>
                <td className="px-4 py-4"><Link to={`/onboarding?employeeId=${encodeURIComponent(employee._id)}`} aria-label={`Open onboarding for ${employee.name}`} className={`${focus} inline-flex rounded-lg p-2 text-slate-400 hover:bg-orange-50 hover:text-orange-600`}><ArrowUpRight size={16} /></Link></td>
              </tr>)}</tbody></table></div> : <Empty title={employees.length ? 'No matching employees' : 'Welcome to your people workspace'} detail={employees.length ? 'Try another search or onboarding filter.' : 'Add your first employee to build your directory.'} />}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-500"><span aria-live="polite">{loading ? 'Loading employees…' : `${filtered.length ? (currentPage - 1) * 6 + 1 : 0}–${Math.min(currentPage * 6, filtered.length)} of ${filtered.length} employees`}</span><div className="flex items-center gap-3"><button type="button" aria-label="Previous page" disabled={currentPage === 1 || loading} onClick={() => setPage(currentPage - 1)} className={`${focus} rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-30`}><ChevronLeft size={16} /></button><span>{currentPage} / {pages}</span><button type="button" aria-label="Next page" disabled={currentPage === pages || loading} onClick={() => setPage(currentPage + 1)} className={`${focus} rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-30`}><ChevronRight size={16} /></button></div></div>
            </section>

            <aside className={`${panel} p-5 sm:p-6`}>
              <SectionTitle title="Needs attention" detail="Keep your next steps in sight." />
              {loading ? <Placeholder /> : pendingEmployees.length ? <div className="mt-5 space-y-4">{pendingEmployees.map(employee => <Link key={employee._id} to={`/onboarding?employeeId=${encodeURIComponent(employee._id)}`} className={`${focus} group flex items-center gap-3 rounded-lg`}><Avatar employee={employee} /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-slate-800 group-hover:text-orange-600">{employee.name}</span><span className="mt-1 block text-[11px] text-slate-500">Complete onboarding</span></span><ArrowRight size={14} className="text-slate-400 group-hover:text-orange-500" /></Link>)}</div> : <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-xs leading-relaxed text-emerald-800"><CircleCheck size={18} className="mb-2" />{employees.length ? 'All registered employees have completed onboarding.' : 'Add your first employee to get started.'}</div>}
              {pending > 3 && <button type="button" onClick={() => { setStatus('pending'); setSearch(''); setPage(1); }} className={`${focus} mt-4 rounded text-xs font-semibold text-orange-600`}>Show all {pending} in the directory<ArrowRight size={13} className="ml-1 inline" /></button>}
              <div className="mt-6 border-t border-slate-100 pt-5"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Exit workflows</p>{settlements.loading ? <p role="status" className="mt-3 text-xs text-slate-500">Loading settlements…</p> : settlements.error ? <div className="mt-3 text-xs text-slate-500"><p role="status">{settlements.error}</p><button type="button" onClick={() => { setSettlements({ loading: true, data: [], error: '' }); setRetry(v => v + 1); }} className={`${focus} mt-2 rounded font-semibold text-orange-600`}>Try again</button></div> : <Link to="/fnf" className={`${focus} mt-3 flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3.5`}><span><span className="block text-xs font-semibold text-slate-700">{openSettlements.length} open settlement{openSettlements.length === 1 ? '' : 's'}</span><span className="mt-1 block text-[11px] text-slate-500">Review drafts and payment status</span></span><ArrowUpRight size={16} className="shrink-0 text-slate-400" /></Link>}</div>
            </aside>
          </div>
          <footer className="flex flex-wrap justify-between gap-2 pb-2 text-[10px] text-slate-500"><span>Viral Ads Media · People operations</span><span>Metrics reflect saved records. Salary totals do not represent payments.</span></footer>
        </div>
      </main>
    </div>
  );
}

function SectionTitle({ title, detail }) {
  return <div><h2 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h2><p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{detail}</p></div>;
}
function Metric({ title, value, detail, icon: Icon, to, loading, attention }) {
  return <Link to={to} className={`${panel} ${focus} group p-5 transition hover:border-orange-200 hover:shadow-md`}><div className="mb-4 flex items-center justify-between"><span className={`rounded-xl p-2.5 ${attention ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-500'}`}><Icon size={19} /></span><ArrowUpRight size={15} className="text-slate-300 group-hover:text-orange-500" /></div><p className="text-xs font-medium text-slate-500">{title}</p>{loading ? <div role="status" aria-label={`Loading ${title}`} className="my-2 h-8 w-24 rounded bg-slate-100 motion-safe:animate-pulse" /> : <p className="mt-2 break-words text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>}<p className="mt-2 text-[11px] text-slate-500">{detail}</p></Link>;
}
function Avatar({ employee }) {
  const [failed, setFailed] = useState(false);
  const photo = employee.photo;
  const src = !photo ? null : /^https?:\/\//.test(photo) ? photo : `${getServerBase().replace(/\/api\/?$/, '')}/uploads/${photo.replace(/\\/g, '/').split('/').pop()}`;
  return <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-500">{src && !failed ? <PrivateImage src={src} alt="" loading="lazy" className="h-full w-full object-cover" onError={() => setFailed(true)} /> : (employee.name || 'E').split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()}</span>;
}
function Placeholder() {
  return <div role="status" aria-label="Loading dashboard data" className="space-y-4 p-6 motion-safe:animate-pulse">{[1, 2, 3].map(n => <div key={n} className="h-8 rounded-lg bg-slate-100" />)}</div>;
}
function Empty({ title, detail }) {
  return <div className="px-5 py-10 text-center"><Users size={24} className="mx-auto mb-3 text-slate-300" /><p className="text-sm font-medium text-slate-700">{title}</p><p className="mt-2 text-xs text-slate-500">{detail}</p></div>;
}

