import { useEffect, useState } from 'react';
import LicenseService from './license.service';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function AddRequest() {
  const [types, setTypes] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const res = await LicenseService.getLicenseTypes();
      setTypes(res?.status ? res.data : []);
    })();
  }, []);

  async function save() {
    const payload = { licenses: types };
    try {
      const res = await LicenseService.insertRequest(payload);
      if (res?.status) {
        toast.success(res.message);
        navigate('/licenses/request');
      } else {
        toast.error(res?.message || 'Error');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error');
    }
  }

  return (
    <div className="container-fluid mt-3">
      <h3>Add License Request</h3>
      <div className="mb-3">
        {/* Simple list of types with inputs to set assignCount */}
        {types.map((t, idx) => (
          <div className="form-group row" key={t.id || idx}>
            <label className="col-sm-6 col-form-label">{t.title}</label>
            <div className="col-sm-3">
              <input className="form-control" type="number" value={t.assignCount || 0} onChange={(e) => { t.assignCount = Number(e.target.value); setTypes([...types]); }} />
            </div>
          </div>
        ))}
      </div>
      <div className="text-end">
        <button className="btn btn-success" onClick={save}>Submit</button>
      </div>
    </div>
  );
}
