import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Download, Eye, Inbox, Loader2, LogOut, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ApiError, deleteEnquiry, getStats, listEnquiries, updateEnquiryStatus } from '../lib/api';
import { useDebounce } from '../lib/useDebounce';
import { downloadFile, formatDateTime, timeAgo, toCsv } from '../lib/format';
import { STATUSES } from '../types';
import type { Enquiry, ListFilters, ListMeta, Stats, Status } from '../types';
import StatusBadge from '../components/StatusBadge';
import EnquiryDrawer from '../components/EnquiryDrawer';
import ConfirmDialog from '../components/ConfirmDialog';

const INITIAL: ListFilters = { search: '', userType: '', status: '', sort: 'newest', page: 1 };

export default function AdminDashboard() {
  const { email, logout } = useAuth();
  const { notify } = useToast();

  const [filters, setFilters] = useState<ListFilters>(INITIAL);
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText);

  const [items, setItems] = useState<Enquiry[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<Enquiry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const selected = useMemo(() => items.find((i) => i.id === selectedId) ?? null, [items, selectedId]);

  // A new search term goes back to page 1
  useEffect(() => {
    setFilters((f) => (f.search === debouncedSearch ? f : { ...f, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await getStats());
    } catch {
      /* the list shows its own error state */
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listEnquiries(filters);
      setItems(res.items);
      setMeta(res.meta);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load enquiries.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { loadStats(); }, [loadStats]);

  const patchFilter = (patch: Partial<ListFilters>) => setFilters((f) => ({ ...f, ...patch, page: 1 }));
  const hasFilters = !!(filters.search || filters.userType || filters.status);
  const clearFilters = () => { setSearchText(''); setFilters(INITIAL); };

  const changeStatus = async (id: number, status: Status) => {
    try {
      const updated = await updateEnquiryStatus(id, status);
      setItems((list) => list.map((i) => (i.id === id ? updated : i)));
      notify('success', `Status changed to ${status}`);
      loadStats();
    } catch (e) {
      notify('error', e instanceof ApiError ? e.message : 'Could not update the status.');
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteEnquiry(toDelete.id);
      notify('success', 'Enquiry deleted');
      setToDelete(null);
      setSelectedId(null);
      // If that was the last row on this page, step back a page
      if (items.length === 1 && filters.page > 1) setFilters((f) => ({ ...f, page: f.page - 1 }));
      else loadList();
      loadStats();
    } catch (e) {
      notify('error', e instanceof ApiError ? e.message : 'Could not delete the enquiry.');
    } finally {
      setDeleting(false);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const rows: Enquiry[] = [];
      let page = 1;
      let pages = 1;
      do {
        const res = await listEnquiries({ ...filters, page, limit: 100 });
        rows.push(...res.items);
        pages = res.meta.pages;
        page++;
      } while (page <= pages && page <= 50);
      if (!rows.length) return notify('error', 'Nothing to export for these filters.');
      const csv = toCsv(rows.map((r) => ({ ID: r.id, Name: r.name, Email: r.email, Phone: r.phone, Type: r.userType, Interest: r.interest, Status: r.status, Source: r.source, Message: r.message, Created: r.createdAt })));
      downloadFile(`enquiries-${new Date().toISOString().slice(0, 10)}.csv`, csv);
      notify('success', `Exported ${rows.length} enquiries`);
    } catch (e) {
      notify('error', e instanceof ApiError ? e.message : 'Export failed.');
    } finally {
      setExporting(false);
    }
  };

  const statCards: { label: string; value: number | undefined; tone: string; onClick?: () => void }[] = [
    { label: 'Total enquiries', value: stats?.total, tone: 'total', onClick: clearFilters },
    { label: 'New', value: stats?.new, tone: 'new', onClick: () => patchFilter({ status: 'New' }) },
    { label: 'In progress', value: stats?.inProgress, tone: 'in-progress', onClick: () => patchFilter({ status: 'In Progress' }) },
    { label: 'Closed', value: stats?.closed, tone: 'closed', onClick: () => patchFilter({ status: 'Closed' }) },
  ];

  const total = stats?.total || 0;
  const pct = (n = 0) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <main className="container admin">
      <div className="admin-head">
        <div>
          <h1>Enquiries</h1>
          <p className="muted">Signed in as {email}{stats ? ` · ${stats.lastSevenDays} received in the last 7 days` : ''}</p>
        </div>
        <button className="btn btn-outline" onClick={logout}><LogOut size={16} /> Sign out</button>
      </div>

      <div className="stat-grid">
        {statCards.map((s) => (
          <button key={s.label} className={`stat stat-${s.tone}`} onClick={s.onClick}>
            <span className="stat-value">{s.value ?? '–'}</span>
            <span className="stat-label">{s.label}</span>
          </button>
        ))}
      </div>

      {stats && total > 0 && (
        <div className="split card">
          <div>
            <span className="label-like">Status mix</span>
            <div className="bar" aria-hidden="true">
              <i className="seg new" style={{ width: `${pct(stats.new)}%` }} />
              <i className="seg contacted" style={{ width: `${pct(stats.contacted)}%` }} />
              <i className="seg in-progress" style={{ width: `${pct(stats.inProgress)}%` }} />
              <i className="seg closed" style={{ width: `${pct(stats.closed)}%` }} />
            </div>
            <ul className="legend">
              <li><i className="seg new" /> New {stats.new}</li>
              <li><i className="seg contacted" /> Contacted {stats.contacted}</li>
              <li><i className="seg in-progress" /> In progress {stats.inProgress}</li>
              <li><i className="seg closed" /> Closed {stats.closed}</li>
            </ul>
          </div>
          <div>
            <span className="label-like">Who is asking</span>
            <div className="bar" aria-hidden="true">
              <i className="seg student" style={{ width: `${pct(stats.students)}%` }} />
              <i className="seg customer" style={{ width: `${pct(stats.customers)}%` }} />
              <i className="seg other" style={{ width: `${pct(stats.other)}%` }} />
            </div>
            <ul className="legend">
              <li><i className="seg student" /> Students {stats.students}</li>
              <li><i className="seg customer" /> Customers {stats.customers}</li>
              <li><i className="seg other" /> Other {stats.other}</li>
            </ul>
          </div>
        </div>
      )}

      <div className="toolbar">
        <div className="search">
          <Search size={18} />
          <input type="search" placeholder="Search name, email, phone or message" value={searchText} onChange={(e) => setSearchText(e.target.value)} aria-label="Search enquiries" />
        </div>
        <select value={filters.userType} onChange={(e) => patchFilter({ userType: e.target.value as ListFilters['userType'] })} aria-label="Filter by type">
          <option value="">All types</option>
          <option value="Student">Students</option>
          <option value="Customer">Customers</option>
          <option value="Other">Other</option>
        </select>
        <select value={filters.status} onChange={(e) => patchFilter({ status: e.target.value as ListFilters['status'] })} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.sort} onChange={(e) => patchFilter({ sort: e.target.value as ListFilters['sort'] })} aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A to Z</option>
        </select>
        <button className="icon-btn bordered" onClick={() => { loadList(); loadStats(); }} aria-label="Refresh"><RefreshCw size={18} className={loading ? 'spin' : ''} /></button>
        <button className="btn btn-outline" onClick={exportCsv} disabled={exporting}>
          {exporting ? <Loader2 size={16} className="spin" /> : <Download size={16} />} Export CSV
        </button>
      </div>

      <div className="card table-card">
        {error ? (
          <div className="state">
            <AlertCircle size={32} />
            <h3>Could not load enquiries</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={loadList}>Try again</button>
          </div>
        ) : loading && !items.length ? (
          <div className="state"><Loader2 size={30} className="spin" /><p>Loading enquiries…</p></div>
        ) : !items.length ? (
          <div className="state">
            <Inbox size={34} />
            <h3>{hasFilters ? 'No enquiries match these filters' : 'No enquiries yet'}</h3>
            <p>{hasFilters ? 'Try a different search or clear the filters.' : 'New enquiries from the website and chatbot will show up here.'}</p>
            {hasFilters && <button className="btn btn-outline" onClick={clearFilters}>Clear filters</button>}
          </div>
        ) : (
          <table className={`table ${loading ? 'dim' : ''}`}>
            <thead>
              <tr><th>Name</th><th>Interest</th><th>Type</th><th>Status</th><th>Received</th><th><span className="sr-only">Actions</span></th></tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td data-label="Name"><button className="name-btn" onClick={() => setSelectedId(r.id)}><strong>{r.name}</strong><small>{r.email}</small></button></td>
                  <td data-label="Interest">{r.interest}</td>
                  <td data-label="Type"><span className={`pill pill-${r.userType.toLowerCase()}`}>{r.userType}</span></td>
                  <td data-label="Status">
                    <label className="status-select">
                      <span className="sr-only">Status for {r.name}</span>
                      <StatusBadge status={r.status} />
                      <select value={r.status} onChange={(e) => changeStatus(r.id, e.target.value as Status)}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </label>
                  </td>
                  <td data-label="Received" title={formatDateTime(r.createdAt)}>{timeAgo(r.createdAt)}</td>
                  <td className="actions">
                    <button className="icon-btn" onClick={() => setSelectedId(r.id)} aria-label={`View ${r.name}`}><Eye size={18} /></button>
                    <button className="icon-btn danger" onClick={() => setToDelete(r)} aria-label={`Delete ${r.name}`}><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {meta && meta.total > 0 && !error && (
        <div className="pager">
          <span className="muted">{(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}</span>
          <div>
            <button className="icon-btn bordered" disabled={meta.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))} aria-label="Previous page"><ChevronLeft size={18} /></button>
            <span className="page-no">Page {meta.page} of {meta.pages}</span>
            <button className="icon-btn bordered" disabled={meta.page >= meta.pages} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))} aria-label="Next page"><ChevronRight size={18} /></button>
          </div>
        </div>
      )}

      {selected && (
        <EnquiryDrawer enquiry={selected} onClose={() => setSelectedId(null)} onStatus={(s) => changeStatus(selected.id, s)} onDelete={() => setToDelete(selected)} />
      )}
      {toDelete && (
        <ConfirmDialog title="Delete this enquiry?" body={`${toDelete.name}'s enquiry will be permanently removed. This cannot be undone.`} confirmLabel="Delete" busy={deleting} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
      )}
    </main>
  );
}
