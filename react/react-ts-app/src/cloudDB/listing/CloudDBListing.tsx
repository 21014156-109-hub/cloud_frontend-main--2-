import { useCallback, useEffect, useMemo, useState, useRef, type ReactNode } from 'react';
import { CloudDBService } from '../cloudDB.service';
import { UserService } from '../../users/user.service';
import PaginationLinks from '../../shared-components/PaginationLinks';
import { getAuthUserData } from '../../utils/helper';
import { toast } from 'react-toastify';
import '../../styles/cloudDB-listing.css';

type Column = { prop: string; name: string; checked?: boolean };

interface CloudDBRow {
  transactionId?: number;
  updatedAt?: string | number;
  testerName?: string;
  make?: string;
  modelNo?: string;
  modelName?: string;
  regulatoryModelNo?: string;
  os?: string;
  storage?: string;
  memory?: string;
  colorName?: string;
  osVersion?: string;
  rooted?: number | boolean | null;
  imei?: string; imei2?: string;
  meid?: string; meid2?: string;
  decimalMeid?: string; decimalMeid2?: string;
  serial?: string; udid?: string;
  deviceCarrier?: string; simSerial?: string; simSerial2?: string; deviceLock?: string;
  carrierLockResponse?: unknown;
  simLockResponse?: unknown;
  esnResponse?: unknown;
  iCloudResponse?: unknown;
  grade?: string;
  mdmResponse?: unknown;
  testInfo?: unknown;
  oemStatus?: string;
  eraseInfo?: unknown;
  batteryInfo?: unknown;
  [key: string]: unknown;
}

export default function CloudDBListing() {
  const clouddb = useMemo(() => new CloudDBService(), []);
  const users = useMemo(() => new UserService(), []);
  const user = getAuthUserData();
  const isAdmin = user?.roleSlug === 'admin';

  // read optional query param ?id= from URL to support device-analysis links
  const params = new URLSearchParams(window.location.search);
  const qid = params.get('id');
  const [paramId] = useState<number>(qid ? Number(qid) : 0);
  const tableRef = useRef<HTMLTableElement | null>(null);
  const topInnerRef = useRef<HTMLDivElement | null>(null);
  const [clientId, setClientId] = useState<number | ''>(isAdmin ? 0 : Number(user?.id || user?.clientId || 0));
  const [clientOptions, setClientOptions] = useState<{ id: number; text: string }[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchType, setSearchType] = useState<'imei' | 'serial'>('imei');
  const [isExportDisabled, setIsExportDisabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [records, setRecords] = useState<CloudDBRow[]>([]);
  const [allRecords, setAllRecords] = useState<CloudDBRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [columns, setColumns] = useState<Column[]>([ 
    { prop: 'srno', name: 'SrNo', checked: true },
    { prop: 'createdAt', name: 'Date', checked: true },
    { prop: 'testerName', name: 'Tester Name', checked: true },
    { prop: 'make', name: 'Make', checked: true },
    { prop: 'modelNo', name: 'Model No', checked: true },
    { prop: 'modelName', name: 'Model Name', checked: true },
    { prop: 'regulatoryModelNo', name: 'Regulatory Model No', checked: true },
    { prop: 'os', name: 'OS', checked: true },
    { prop: 'storage', name: 'Storage', checked: true },
    { prop: 'colorName', name: 'Color', checked: true },
    { prop: 'memory', name: 'Memory', checked: true },
    { prop: 'source', name: 'Source', checked: true },
    { prop: 'osVersion', name: 'OS Version', checked: true },
    { prop: 'firmware', name: 'Firmware', checked: true },
    { prop: 'rooted', name: 'Rooted', checked: true },
    { prop: 'imei', name: 'IMEI', checked: true },
    { prop: 'imei2', name: 'IMEI2', checked: true },
    { prop: 'meid', name: 'MEID', checked: true },
    { prop: 'meid2', name: 'MEID2', checked: true },
    { prop: 'decimalMeid', name: 'Decimal MEID', checked: true },
    { prop: 'decimalMeid2', name: 'Decimal MEID2', checked: true },
    { prop: 'serial', name: 'Serial', checked: true },
    { prop: 'udid', name: 'UDID', checked: true },
    { prop: 'deviceCarrier', name: 'Carrier', checked: true },
    { prop: 'simSerial', name: 'Sim Serial', checked: true },
    { prop: 'simSerial2', name: 'Sim Serial2', checked: true },
    { prop: 'deviceLock', name: 'Device Lock', checked: true },
    { prop: 'carrierLockResponse', name: 'CarrierLock Response', checked: true },
    { prop: 'simLockResponse', name: 'SimLock Response', checked: true },
    { prop: 'esnResponse', name: 'ESN', checked: true },
    { prop: 'iCloudResponse', name: 'iCloud Response', checked: true },
    { prop: 'grade', name: 'Grade', checked: true },
    { prop: 'mdmResponse', name: 'MDM Response', checked: true },
    { prop: 'testInfo', name: 'Tested', checked: true },
    { prop: 'oemStatus', name: 'OEM', checked: true },
    { prop: 'eraseInfo', name: 'Erased', checked: true },
    { prop: 'batteryInfo', name: 'Battery', checked: true },
    { prop: 'skuCode', name: 'Sku Code', checked: true },
    { prop: 'platform', name: 'Platform', checked: true },
    { prop: 'transBuildNo', name: 'Trans Build No', checked: true },
    { prop: 'transAppVersion', name: 'Trans App Version', checked: true },
    { prop: 'manualEntry', name: 'Manual Entry', checked: true },
    { prop: 'notes', name: 'Notes', checked: true },
    { prop: 'clientName', name: 'Client Name', checked: true },
  ]);

  const fetchData = useCallback(async (page: number) => {
    setCurrentPage(page);
    try {
      const cid = typeof clientId === 'number' ? clientId : 0;
      const res = await clouddb.getCollectionInfo(cid, page - 1, pageSize, searchText, searchType);
      if (res.status) {
        const p = res.data as { totalItems: number; totalPages: number; data: CloudDBRow[] };
        setTotalRecords(p.totalItems);
        setTotalPages(p.totalPages);
        setRecords(p.data);
        setAllRecords(p.data);
        setIsExportDisabled(!p.totalItems);
      }
    } catch { toast.error('Failed to load device records'); }
  }, [clientId, clouddb, pageSize, searchText, searchType]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  // set breadcrumb like Angular
  useEffect(() => {
    const w = window as Window & { __BREADCRUMB?: { name: string; link?: string }[] };
    w.__BREADCRUMB = [{ name: 'Dashboard', link: '/dashboard' }, { name: 'Device Records', link: '' }];
    return () => { w.__BREADCRUMB = []; };
  }, []);

  // If page was opened with ?id=... and the user is admin, load device records for analysis
  useEffect(() => {
    if (paramId > 0 && isAdmin) {
      (async function loadAnalysis() {
        try {
          const resp = await clouddb.getDevicesRecords(paramId);
          if (resp.status) {
            const recs = resp.data as CloudDBRow[];
            setRecords(recs);
            setAllRecords(recs);
            setTotalRecords(recs.length);
            setTotalPages(1);
            setIsExportDisabled(false);
          }
        } catch {
          toast.error('Failed to load analysis records');
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramId, isAdmin]);

  // Setup top scrollbar sync (wrapper1 <-> wrapper2). It uses tableRef and sets a dummy inner element width
  useEffect(() => {
    const wrapper1 = document.getElementById('wrapper1');
    const wrapper2 = document.getElementById('wrapper2');
    if (!wrapper1 || !wrapper2) return;

    const sync = () => {
      if (wrapper1 && wrapper2) {
        wrapper2.scrollLeft = wrapper1.scrollLeft;
      }
    };
    // keep a small inner element width in wrapper1 that matches the table scroll width
    if (topInnerRef.current && tableRef.current) {
      topInnerRef.current.style.width = `${tableRef.current.scrollWidth}px`;
    }

    wrapper1.addEventListener('scroll', sync);
    wrapper2.addEventListener('scroll', () => { if (wrapper1) wrapper1.scrollLeft = wrapper2.scrollLeft; });
    window.addEventListener('resize', () => { if (topInnerRef.current && tableRef.current) topInnerRef.current.style.width = `${tableRef.current.scrollWidth}px`; });
    return () => {
      wrapper1.removeEventListener('scroll', sync);
      wrapper2.removeEventListener('scroll', () => { if (wrapper1) wrapper1.scrollLeft = wrapper2.scrollLeft; });
    };
  }, [records]);

  async function onSearchClick() { fetchData(1); }

  async function loadClients(term: string) {
    const rec = await users.getRecords(0, 'client', '1', term);
    if (rec.status) {
      setClientOptions(rec.data.map((c) => ({ id: c.id, text: `${c.fName ?? ''} ${c.lName ?? ''} (${c.userName ?? ''})` })));
    }
  }

  function filterData(term: string) {
    setSearchTerm(term);
    const cols = columns.map(c => c.prop);
    const filtered = allRecords.filter((row) => {
      const values = cols.map((prop) => String((row[prop] as string | number | null | undefined) ?? ''));
      return values.some((v) => v.toLowerCase().includes(term.toLowerCase()));
    });
    setRecords(filtered);
  }

  function exportReport(type: 'xlsx' | 'csv') {
  const postData: { clientId: number | string; type: 'xlsx' | 'csv'; searchText: string; searchType: string; columns: Column[] } = { clientId, type, searchText, searchType, columns };
  clouddb.exportReport(postData).then((blob) => {
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `device-records.${type}`;
      document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(blobUrl); a.remove();
    }).catch(() => toast.error('Failed to export'));
  }

  function deviceReport(id?: number) {
    if (typeof id !== 'number') return;
    const baseUrl = (window as any).__VITE_BASE_URL_UI || (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_BASE_URL_UI : undefined) || window.location.origin;
    const url = `${String(baseUrl).replace(/\/$/, '')}/device-report?id=${id}`;
    window.open(url, '_blank');
  }

  function text(v: string | number | null | undefined): string { return v == null || v === '' ? 'N/A' : String(v); }

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<CloudDBRow | null>(null);

  async function showDetail(transactionId?: number) {
    if (!transactionId) return;
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const resp = await clouddb.getDeviceByTransactionId(transactionId);
      if (resp.status) setDetailData(resp.data as CloudDBRow);
      else setDetailData(null);
    } catch {
      setDetailData(null);
      toast.error('Failed to load device details');
    } finally { setDetailLoading(false); }
  }

  // Render detail content with parity to Angular's parseResponse / showBatteryInfo
  function renderDetailContent(data: CloudDBRow | null) {
    if (!data) return <div>No details available</div>;
    // If diagnostics-like fields exist, render passed/failed tables
    const dd = data as unknown as Record<string, unknown>;
    const maybeDiag = dd['failedResult'] || dd['passedResult'];
    if (maybeDiag) {
      const passedVal = dd['passedResult'];
      const failedVal = dd['failedResult'];
      const passed = typeof passedVal === 'string' ? passedVal.split(',') : Array.isArray(passedVal) ? passedVal.map(String) : [];
      const failed = typeof failedVal === 'string' ? failedVal.split(',') : Array.isArray(failedVal) ? failedVal.map(String) : [];
  const rows: ReactNode[] = [];
      for (let i = 0; i < Math.max(passed.length, failed.length); i++) {
        rows.push(
          <tr key={i}><td>{passed[i] ?? ''}</td><td>{failed[i] ?? ''}</td></tr>
        );
      }
      return (
        <table className="table table-striped" style={{ textAlign: 'left' }}>
          <thead>
            <tr><th style={{ fontWeight: 'bold' }}>Passed</th><th style={{ fontWeight: 'bold' }}>Failed</th></tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      );
    }

    // Battery info - render two columns per row like Angular
    if (data.batteryInfo && typeof data.batteryInfo === 'object') {
      const b = data.batteryInfo as Record<string, unknown>;
  const cells: ReactNode[] = [];
      let i = 0;
  const rows: ReactNode[] = [];
      for (const key in b) {
        cells.push(<td style={{ fontWeight: 'bold' }} key={`k-${key}`}>{key}</td>);
  const val = (b as Record<string, unknown>)[key];
  cells.push(<td key={`v-${key}`}>{String(val ?? '')}</td>);
        i += 2;
        if (i === 4) { rows.push(<tr key={`r-${key}`}>{cells.splice(0)} </tr>); i = 0; }
      }
      if (cells.length) rows.push(<tr key="last">{cells}</tr>);
      return (
        <table className="table table-striped" style={{ textAlign: 'left' }}>
          <tbody>{rows}</tbody>
        </table>
      );
    }

    // Fallback: pretty JSON
    return (
      <div>
        <p><strong>IMEI:</strong> {text(data.imei)}</p>
        <p><strong>Serial:</strong> {text(data.serial)}</p>
        <pre style={{ maxHeight: 300, overflow: 'auto' }}>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }


  function onColumnChange(checked: boolean, idx: number) {
    setColumns(prev => prev.map((c, i) => i === idx ? { ...c, checked } : c));
  }

  function matchesSearch(name: string) { return name.toLowerCase().includes(searchTerm.toLowerCase()); }

  return (
    <div className="container-fluid pt-8">
      <div className="row">
        <div className="col">
          <div className="card shadow">
            {paramId === 0 && (
              <div className="row cust-row">
                {isAdmin && (
                  <div className="col-md-3">
                    <input className="form-control mb-2" placeholder="Search client" onChange={(e) => { const t = e.target.value; if (t.length >= 2 || t.length === 0) void loadClients(t); }} />
                    <select className="form-control" value={clientId} onChange={(e) => setClientId(e.target.value ? Number(e.target.value) : '')} onFocus={() => void loadClients('')}>
                      <option value="">Select Client</option>
                      {clientOptions.map((c) => <option key={c.id} value={c.id}>{c.text}</option>)}
                    </select>
                  </div>
                )}
                <div className="col-md-3">
                  <input className="form-control" placeholder="Enter IMEI/SERIAL" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                </div>
                <div className="col-md-4 form-inline">
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" name="searchType" id="imei" value="imei" checked={searchType === 'imei'} onChange={() => setSearchType('imei')} />
                    <label className="form-check-label" htmlFor="imei">Search By IMEI</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" name="searchType" id="serial" value="serial" checked={searchType === 'serial'} onChange={() => setSearchType('serial')} />
                    <label className="form-check-label" htmlFor="serial">Search By Serial</label>
                  </div>
                </div>
                <div className="col-md-2 form-inline">
                  <button type="button" onClick={onSearchClick} className="btn btn-padding btn-dark-custom mb-2 mt-2">Search</button>
                </div>
              </div>
            )}

            <div className="row search_row">
              <div className="col-md-10">
                <div className="dt-buttons btn-group pl-0">
                  <div className={`dropdown ${isExportDisabled ? 'disabled' : ''}`}>
                    <button type="button" className="btn buttons-copy buttons-html5 btn-sm btn-dark-custom" disabled={isExportDisabled}>Select Columns</button>
                    <div className="dropdown-content column-dropdown">
                      <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search" className="search-col form-control" />
                      <ul className="list-scroll columns-list">
                        {columns.map((column, i) => matchesSearch(column.name) && (
                          <li key={i} className="chkbox-select">
                            {i > 0 && (
                              <label>
                                <input className="file-type" type="checkbox" checked={!!column.checked} onChange={(e) => onColumnChange(e.target.checked, i)} />
                                {column.name}
                              </label>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button type="button" className="btn buttons-copy buttons-html5 btn-sm btn-dark-custom" onClick={() => exportReport('xlsx')} disabled={isExportDisabled}>Excel</button>
                  <button type="button" className="btn buttons-copy buttons-html5 btn-sm btn-dark-custom" onClick={() => exportReport('csv')} disabled={isExportDisabled}>CSV</button>
                </div>
              </div>
              <div className="col-md-2 justify-content-end">
                <input id="search-textbox" className="form-control search-textbox" type="text" placeholder="Search" style={{ height: 36 }} onChange={(e) => filterData(e.target.value)} disabled={isExportDisabled} />
              </div>
            </div>

            <div className="table-responsive">
              <div id="wrapper2" className="top-scrollbar" style={{ overflowX: 'auto' }}>
                <div ref={topInnerRef} />
              </div>
              <div id="wrapper1" style={{ overflowX: 'auto' }}>
                <table className="table" ref={tableRef}>
                <thead>
                  <tr>
                    <th>Sr No.</th>
                    <th>Report</th>
                    <th>Date</th>
                    <th>Tester Name</th>
                    <th>Make</th>
                    <th>Model No</th>
                    <th>Model Name</th>
                    <th>Regulatory Model No</th>
                    <th>OS</th>
                    <th>Storage</th>
                    <th>Memory</th>
                    <th>Color</th>
                    <th>OS Version</th>
                    <th>Jail/Rooted</th>
                    <th>IMEI</th>
                    <th>IMEI2</th>
                    <th>MEID</th>
                    <th>MEID2</th>
                    <th>Decimal MEID</th>
                    <th>Decimal MEID2</th>
                    <th>Serial</th>
                    <th>UDID</th>
                    <th>Carrier</th>
                    <th>Sim Serial</th>
                    <th>Sim Serial2</th>
                    <th>Device Lock</th>
                    <th>CarrierLock Response</th>
                    <th>SimLock Response</th>
                    <th>IMEI Check</th>
                    <th>iCloud Response</th>
                    <th>Grade</th>
                    <th>MDM Response</th>
                    <th>Tested</th>
                    <th>OEM</th>
                    <th>Data Wipe</th>
                    <th>Battery</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td>{((currentPage - 1) * pageSize) + rowIndex + 1}</td>
                      <td>
                        <a className="text-black-50" href="#" onClick={(e) => { e.preventDefault(); deviceReport(row.transactionId); }}>
                          <i className="fa fa-print fa-2x font-black" aria-hidden="true" />
                        </a>
                      </td>
                      <td>{row.updatedAt ? new Date(row.updatedAt).toLocaleString() : '-'}</td>
                      <td>{text(row.testerName)}</td>
                      <td>{text(row.make)}</td>
                      <td>{text(row.modelNo)}</td>
                      <td>{text(row.modelName)}</td>
                      <td>{text(row.regulatoryModelNo)}</td>
                      <td>{text(row.os)}</td>
                      <td>{text(row.storage)}</td>
                      <td>{text(row.memory)}</td>
                      <td>{text(row.colorName)}</td>
                      <td>{text(row.osVersion)}</td>
                      <td>{row.rooted != null ? ((row.rooted === 1 || row.rooted === true) ? 'Yes' : 'No') : 'N/A'}</td>
                      <td>{text(row.imei)}</td>
                      <td>{text(row.imei2)}</td>
                      <td>{text(row.meid)}</td>
                      <td>{text(row.meid2)}</td>
                      <td>{text(row.decimalMeid)}</td>
                      <td>{text(row.decimalMeid2)}</td>
                      <td>{text(row.serial)}</td>
                      <td>{text(row.udid)}</td>
                      <td>{text(row.deviceCarrier)}</td>
                      <td>{text(row.simSerial)}</td>
                      <td>{text(row.simSerial2)}</td>
                      <td>{text(row.deviceLock)}</td>
                      <td>{row.carrierLockResponse ? <a href="#" onClick={(e) => { e.preventDefault(); void showDetail(row.transactionId); }}>Show</a> : 'N/A'}</td>
                      <td>{row.simLockResponse ? <a href="#" onClick={(e) => { e.preventDefault(); void showDetail(row.transactionId); }}>Show</a> : 'N/A'}</td>
                      <td>{row.esnResponse ? <a href="#" onClick={(e) => { e.preventDefault(); void showDetail(row.transactionId); }}>Show</a> : 'N/A'}</td>
                      <td>{row.iCloudResponse ? <a href="#" onClick={(e) => { e.preventDefault(); void showDetail(row.transactionId); }}>Show</a> : 'N/A'}</td>
                      <td>{row.grade || 'N/A'}</td>
                      <td>{row.mdmResponse ? (typeof row.mdmResponse === 'object' ? <a href="#" onClick={(e) => { e.preventDefault(); void showDetail(row.transactionId); }}>Show</a> : String(row.mdmResponse)) : 'N/A'}</td>
                      <td>{row.testInfo ? <a href="#" onClick={(e) => { e.preventDefault(); void showDetail(row.transactionId); }}>Show</a> : 'Diagnostic Pending'}</td>
                      <td>{row.oemStatus || 'N/A'}</td>
                      <td>{row.eraseInfo ? <a href="#" onClick={(e) => { e.preventDefault(); void showDetail(row.transactionId); }}>Show</a> : 'N/A'}</td>
                      <td>{row.batteryInfo ? <a href="#" onClick={(e) => { e.preventDefault(); void showDetail(row.transactionId); }}>Show Results</a> : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </div>

            {detailOpen && (
              <div className="modal" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }} onClick={() => setDetailOpen(false)}>
                <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Device Details</h5>
                      <button type="button" className="close" onClick={() => setDetailOpen(false)}> d7</button>
                    </div>
                    <div className="modal-body">
                      {detailLoading && <div>Loading...</div>}
                      {!detailLoading && renderDetailContent(detailData)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {records.length > 0 && (
              <PaginationLinks
                totalRecords={totalRecords}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={(p) => fetchData(p)}
                onPageSizeChange={(s) => { setPageSize(s); fetchData(1); }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
