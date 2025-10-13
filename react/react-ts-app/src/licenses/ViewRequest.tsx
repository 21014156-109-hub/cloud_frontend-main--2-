import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LicenseService from './license.service';
import { toast } from 'react-toastify';

export default function ViewRequest() {
  const { id } = useParams();
  type LicenseType = { id?: number | string; title?: string };
  type LicenseDataItem = { id?: number | string; assignCount?: number };
  type InfoShape = { licenseData?: LicenseDataItem[]; status?: string };
  const [info, setInfo] = useState<InfoShape>({});
  const [types, setTypes] = useState<LicenseType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (!id) return navigate('/licenses/request');
      const res = await LicenseService.getLicenseRequest(id);
      if (!res?.status) {
        toast.error('Invalid request');
        return navigate('/licenses/request');
      }
      const data = res.data || {};
      if (data.licenseData) {
        try {
          data.licenseData = JSON.parse(data.licenseData) as LicenseDataItem[];
        } catch {
          data.licenseData = [];
        }
      }
      setInfo(data);
      const t = await LicenseService.getLicenseTypes();
      setTypes(t?.status ? t.data : []);
    })();
  }, [id, navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = { id, status: info.status, reviewedBy: 1 };
    const res = await LicenseService.updateRequest(payload);
    if (res?.status) {
      toast.success(res.message);
      navigate('/licenses/admin-request');
    }
  }

  function getLicenseTypeName(typeId: number | string | undefined) {
    const found = types.find((t) => t.id == typeId);
    return found ? found.title : '';
  }

  return (
    <div className="container-fluid mt-3">
      <h3>License Details</h3>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Status</label>
          <select className="form-select" value={info.status || ''} onChange={(e) => setInfo({ ...info, status: e.target.value })}>
            <option value="">Select</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="mb-3">
          <h5>Requested Licenses</h5>
          {(info.licenseData || []).map((l: LicenseDataItem, i: number) => (
            <div key={i} className="d-flex justify-content-between">
              <div>{getLicenseTypeName(l.id)}</div>
              <div>{l.assignCount}</div>
            </div>
          ))}
        </div>
        <div className="text-end">
          <button className="btn btn-success" type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}
