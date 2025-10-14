import { useEffect, useState, useCallback } from 'react';
import { LogosService } from './logos.service';
import { UserService } from '../users/user.service';
import { getAuthUserData, getClientID } from '../utils/helper';
import { toast } from 'react-toastify';

const svc = new LogosService();

export default function LogoSetting() {
  const user = getAuthUserData();
  const isAdmin = user?.roleSlug === 'admin';
  const clientId = getClientID();
  const [clients, setClients] = useState<{ id: number; text: string }[]>([]);
  const [selectedClient, setSelectedClient] = useState<{ id: number; text: string } | null>(null);
  // users service will be instantiated inside fetchClients so it doesn't change across renders
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logoImage, setLogoImage] = useState<string | ArrayBuffer | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const w = window as Window & { __BREADCRUMB?: { name: string; link?: string }[] };
    w.__BREADCRUMB = [{ name: 'Dashboard', link: '/dashboard' }, { name: 'Client Logo Settings', link: '' }];
    return () => { w.__BREADCRUMB = []; };
  }, []);

  // Fetch clients or client logo on mount / when admin status changes
  const fetchClients = useCallback(async (search = '') => {
    try {
      // Match Angular: getRecords(0, 'client', '1', search)
      const users = new UserService();
      const resp = await users.getRecords(0, 'client', '1', search);
      if (resp.status) {
        const list: Array<{ id: number; fName?: string; lName?: string; userName?: string }> = resp.data || [];
        setClients(list.map((rec) => ({ id: Number(rec.id), text: `${rec.fName || ''} ${rec.lName || ''} (${rec.userName || ''})` })));
      }
    } catch {
      // ignore errors for now
    }
  }, []);

  useEffect(() => {
    if (isAdmin) { fetchClients(); } else { fetchClientLogo(clientId); }
  }, [isAdmin, clientId, fetchClients]);

  function onClientSearch(term: string) {
    if (!term || term.length === 0) { void fetchClients(); }
    else if (term.length >= 2) { void fetchClients(term); }
  }

  function onClientDropdownOpen() {
    void fetchClients();
  }

  async function fetchClientLogo(id: number) {
    try {
      const resp = await svc.getClientLogo(id);
      if (resp.status && resp.data?.imageURL) setLogoImage(resp.data.imageURL as string);
    } catch {
      // ignore
    }
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.match(/image\/*/)) { toast.error('File Not Supported. Please upload valid Image File'); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoImage(reader.result);
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    // If admin, require a client selection
    if (isAdmin && !selectedClient) {
      toast.error('Please select a client before submitting');
      return;
    }
    if (!selectedFile) {
      toast.error('Please select a logo file before submitting');
      return;
    }

    const fd = new FormData();
    fd.append('clientId', isAdmin ? String(selectedClient?.id ?? '') : String(clientId));
    fd.append('logo', selectedFile);
    try {
      const resp = await svc.uploadLogotoBucket(fd);
      if (resp.status) {
        toast.success('Logo Added');
        // Refresh preview for the selected client (or current client)
        const cid = isAdmin ? (selectedClient?.id ?? clientId) : clientId;
        void fetchClientLogo(Number(cid));
      } else {
        toast.error(resp?.message || 'Upload failed');
      }
    } catch (err: unknown) {
      let msg = 'Upload failed';
      if (err && typeof err === 'object') {
        const o = err as Record<string, unknown>;
        if (typeof o['error'] === 'object' && o['error'] !== null) {
          const inner = o['error'] as Record<string, unknown>;
          if (typeof inner['error'] === 'string') msg = inner['error'];
        } else if (typeof o['message'] === 'string') msg = o['message'];
      }
      toast.error(String(msg));
    }
  }

  return (
    <div className="container-fluid pt-3">
      <div className="card shadow">
        <div className="card-body">
          <form onSubmit={onSubmit} encType="multipart/form-data">
            <div className="row">
              {isAdmin && (
                <div className="col-lg-4">
                  <div className="form-group">
                    <label>Select Client <span className="text-warning">*</span></label>
                    <div>
                      <input className="form-control mb-2" placeholder="Search clients" onChange={(e) => onClientSearch(e.target.value)} />
                      <select className="form-control" value={selectedClient?.id ?? ''} onChange={(e) => {
                        const sel = clients.find(c => String(c.id) === e.target.value) ?? null;
                        setSelectedClient(sel);
                        if (sel && sel.id) void fetchClientLogo(sel.id);
                      }} onFocus={() => onClientDropdownOpen()}>
                        <option value="">Select Client</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.text}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
              <div className="col-lg-4">
                <div className="form-group">
                  <label>Select Image <span className="text-warning">*</span></label>
                  <input type="file" className={`form-control ${submitted && !selectedFile ? 'is-invalid' : ''}`} onChange={onFileSelected} />
                  <div className="muted-text">Add a logo to be used on the label and diagnostic report</div>
                  {submitted && !selectedFile && <div className="text-danger mt-1">The Select Logo Field Is Required</div>}
                </div>
              </div>
            </div>
            {logoImage && (
              <div className="row mt-3">
                <div className="col-lg-4">
                  <img src={String(logoImage)} alt="logo preview" style={{ maxWidth: '100%', height: 'auto' }} />
                </div>
              </div>
            )}
            <div className="col-sm-12 text-right mt-3">
              <button className="btn" style={{ background: '#2ecc71', color: '#fff', padding: '8px 18px', borderRadius: 6 }} type="submit">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
