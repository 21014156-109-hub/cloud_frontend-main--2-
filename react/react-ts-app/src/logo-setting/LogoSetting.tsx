import { useEffect, useState } from 'react';
import { LogosService } from './logos.service';
import http from '../services/http';
import { getAuthUserData, getClientID } from '../utils/helper';
import { toast } from 'react-toastify';

const svc = new LogosService();

export default function LogoSetting() {
  const user = getAuthUserData();
  const isAdmin = user?.roleSlug === 'admin';
  const clientId = getClientID();
  const [clients, setClients] = useState<{ id: number; text: string }[]>([]);
  const [selectedClient, setSelectedClient] = useState<{ id: number; text: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logoImage, setLogoImage] = useState<string | ArrayBuffer | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const w = window as Window & { __BREADCRUMB?: { name: string; link?: string }[] };
    w.__BREADCRUMB = [{ name: 'Dashboard', link: '/dashboard' }, { name: 'Client Logo Settings', link: '' }];
    return () => { w.__BREADCRUMB = []; };
  }, []);

  useEffect(() => {
    if (isAdmin) fetchClients();
    else fetchClientLogo(clientId);
  }, [isAdmin, clientId]);

  async function fetchClients(search = '') {
    try {
      const resp = await http(`users?search=${encodeURIComponent(search)}`);
      if (resp.status) {
        const list = resp.data || [] as unknown[];
        setClients((list as Array<Record<string, unknown>>).map((rec) => ({ id: Number(rec.id as number), text: `${rec.fName as string} ${rec.lName as string} (${rec.userName as string})` })));
      }
    } catch {
      // ignore
    }
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
    const fd = new FormData();
    if (selectedFile) {
      fd.append('clientId', isAdmin ? String(selectedClient?.id ?? '') : String(clientId));
      fd.append('logo', selectedFile);
      try {
        const resp = await svc.uploadLogotoBucket(fd);
        if (resp.status) toast.success('Logo Added');
      } catch {
        toast.error('Upload failed');
      }
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
                    <select className="form-control" value={selectedClient?.id ?? ''} onChange={(e) => setSelectedClient(clients.find(c => String(c.id) === e.target.value) ?? null)}>
                      <option value="">Select Client</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.text}</option>)}
                    </select>
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
