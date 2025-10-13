import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ReportingService } from '../../services/reporting.service';
import { getAuthUserData } from '../../utils/helper';
import '../../styles/cloudDB-listing.css';
import './monthly-report.css';

const reporting = new ReportingService();

type Column = { prop: string; name: string; visible: boolean };

export default function MonthlyReport() {
  const user = getAuthUserData();
  const isAdmin = user?.roleSlug === 'admin';
  const [clientId] = useState<number | ''>(isAdmin ? 0 : (user?.id ?? ''));
  const [reports, setReports] = useState<Record<string, unknown>[]>([]);
  const [testers, setTesters] = useState<Record<string, unknown>[]>([]);
  const [allTesters, setAllTesters] = useState<Record<string, unknown>[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [dateOption, setDateOption] = useState<number>(0);
  const [selectedDateArray, setSelectedDateArray] = useState<string[]>([]);
  const [isCustomSelected, setIsCustomSelected] = useState(false);
  const [columns, setColumns] = useState<Column[]>([
    { prop: 'srno', name: 'Sr No.', visible: true },
    { prop: 'fName', name: 'Tester', visible: true },
    { prop: 'totalCount', name: 'Total Devices', visible: true },
    { prop: 'averageCount', name: 'Average Devices', visible: true },
  ]);

  const tableRef = useRef<HTMLTableElement | null>(null);
  const topInnerRef = useRef<HTMLDivElement | null>(null);

  const dateOptions = ['Today', 'Yesterday', 'This Week', 'Last Week', 'This Month', 'Last Month', 'This Year', 'Last Year', 'Custom'];

  

  function formatDateISO(d: Date) { return d.toISOString().slice(0, 10); }

  const getSelectedRange = useCallback((): { start: string; end: string } => {
    const now = new Date();
    switch (Number(dateOption)) {
      case 0: return { start: formatDateISO(now), end: formatDateISO(now) };
      case 1: { const t = new Date(now); t.setDate(now.getDate() - 1); return { start: formatDateISO(t), end: formatDateISO(t) }; }
      case 2: { const start = new Date(now); start.setDate(now.getDate() - (start.getDay() || 7) + 1); return { start: formatDateISO(start), end: formatDateISO(now) }; }
      case 8: return { start: selectedDateArray[0] || formatDateISO(now), end: selectedDateArray[1] || selectedDateArray[0] || formatDateISO(now) };
      default: return { start: formatDateISO(now), end: formatDateISO(now) };
    }
  }, [dateOption, selectedDateArray]);

  const fetchReport = useCallback(async () => {
    try {
      const range = getSelectedRange();
      const cid = typeof clientId === 'object' ? (clientId as unknown as Record<string, unknown>).id as number : (clientId as number | '');
      const res = await reporting.getMonthlyReport(String(cid || ''), range as { start: string; end: string });
      if (res.status) {
        const data = res.data as Record<string, unknown> | undefined;
        const reportsArr: Record<string, unknown>[] = Array.isArray(data?.reports) ? (data!.reports as unknown[]).map(r => r as Record<string, unknown>) : [];
        const testersArr: Record<string, unknown>[] = Array.isArray(data?.testers) ? (data!.testers as unknown[]).map(t => t as Record<string, unknown>) : [];
        const daysArr: string[] = Array.isArray(data?.daysArr) ? (data!.daysArr as string[]) : [];
        setReports(reportsArr);
        setTesters(testersArr);
        setAllTesters(testersArr);
        setDays(daysArr);
      }
    } catch {
      // ignore
    }
  }, [clientId, getSelectedRange]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  function findDeviceCount(testerId: number, date: string): number {
    const repIndex = reports.findIndex((item) => {
      const it = item as Record<string, unknown>;
      return Number(it['testerId'] as number) === Number(testerId) && String(it['day'] ?? '') === String(date);
    });
    if (repIndex > -1) {
      const it = reports[repIndex] as Record<string, unknown>;
      return Number(it['deviceCount'] as number || 0);
    }
    return 0;
  }

  function toggleColumn(idx: number) { setColumns(prev => prev.map((c, i) => i === idx ? { ...c, visible: !c.visible } : c)); }

  function exportCSV() {
    const visibleCols = columns.filter(c => c.visible).map(c => c.name);
    const header = [...visibleCols, ...days];
    const rows: string[][] = testers.map((t) => {
      const row: string[] = [];
      for (const c of columns) {
        if (!c.visible) continue;
        if (c.prop === 'srno') row.push('');
        else if (c.prop === 'fName') row.push(`${String(t['fName'] ?? '')} ${String(t['lName'] ?? '')}`);
        else row.push(String(t[c.prop as keyof typeof t] ?? ''));
      }
      for (const d of days) row.push(String(findDeviceCount(Number(t['id']), d)));
      return row;
    });
    const csvContent = [header.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); const url = URL.createObjectURL(blob); a.href = url; a.download = `monthly-report.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  function syncTopWidth() {
    if (topInnerRef.current && tableRef.current) topInnerRef.current.style.width = `${tableRef.current.scrollWidth}px`;
    const wrapper1 = document.getElementById('wrapper5');
    const wrapper2 = document.getElementById('wrapper6');
    if (wrapper1 && wrapper2) {
      wrapper1.onscroll = function () { wrapper2.scrollLeft = wrapper1.scrollLeft; };
      wrapper2.onscroll = function () { wrapper1.scrollLeft = wrapper2.scrollLeft; };
    }
  }

  useEffect(() => { syncTopWidth(); }, [reports, testers, days]);

  function handleDateChange(e: React.ChangeEvent<HTMLSelectElement>) { const val = Number(e.target.value); setDateOption(val); setIsCustomSelected(val === 8); }

  function onCustomDateChange(idx: number, value: string) { setSelectedDateArray(prev => { const next = [...prev]; next[idx] = value; return next; }); }

  function filterData(ev: React.ChangeEvent<HTMLInputElement>) {
    const term = ev.target.value;
    const cols = columns.map(c => c.prop);
    const filtered = allTesters.filter((row) => cols.some((prop) => String(row[prop] ?? '').toLowerCase().includes(term.toLowerCase())));
    setTesters(filtered);
  }

  return (
    <div className="container-fluid pt-8">
              <div className="row mb-3 align-items-end">
                <div className="col-md-6 d-flex justify-content-center">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ textAlign: 'left', marginRight: -12, width: 200 }}>
                      <label className="form-control-label" style={{ display: 'block', marginBottom: 6 }}>Select Date</label>
                      <select className="form-control select-date" value={dateOption} onChange={handleDateChange}>
                        {dateOptions.map((d, i) => <option key={i} value={i}>{d}</option>)}
                      </select>
                    </div>
                    <div style={{ marginLeft: 20 , marginTop: 26, backgroundColor: '#06d606',color: '#fff', }}>
                      <button className="btn btn-submit" onClick={fetchReport} disabled={!clientId && isAdmin}>Submit</button>
                    </div>
                    <div style={{ marginLeft: 8 }}>
                      <button className="btn btn-sm btn-outline-secondary" onClick={exportCSV}>CSV</button>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 d-flex justify-content-end">
                  <input id="search-textbox" className="form-control" type="text" placeholder="Search" style={{ width: 260 }} onChange={filterData} />
                </div>
                <div className="col-12 mt-3">
                  {isCustomSelected && (
                    <div className="d-flex gap-2 justify-content-center">
                      <input type="date" className="form-control" value={selectedDateArray[0] ?? ''} onChange={(e) => onCustomDateChange(0, e.target.value)} />
                      <input type="date" className="form-control" value={selectedDateArray[1] ?? ''} onChange={(e) => onCustomDateChange(1, e.target.value)} />
                    </div>
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-md-3">
                  <div className="column-selector">
                    <button className="btn btn-sm btn-outline-secondary">Columns ▾</button>
                    <div className="column-dropdown">
                      {columns.map((c, i) => (
                        <label key={c.prop}><input type="checkbox" checked={c.visible} onChange={() => toggleColumn(i)} /> {c.name}</label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="wrapperDiv">
                <div id="wrapper5" className="top-scrollbar"><div ref={topInnerRef} /></div>
                <div id="wrapper6" style={{ overflowX: 'auto' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table" ref={tableRef}>
                      <thead>
                        <tr>
                          {columns.filter(c => c.visible).map(c => <th key={c.prop}>{c.name}</th>)}
                          {days.map(d => <th key={d}>{d}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {testers.map((t, i) => (
                          <tr key={i}>
                            {columns.filter(c => c.visible).map(c => (
                              <td key={c.prop}>{c.prop === 'fName' ? `${String(t['fName'] ?? '')} ${String(t['lName'] ?? '')}` : String(t[c.prop as keyof typeof t] ?? '')}</td>
                            ))}
                            {days.map(d => <td key={d}>{findDeviceCount(Number(t['id']), d)}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
    </div>
  );
}
