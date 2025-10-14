import { useEffect, useState } from 'react';
import { DeviceCatalogueService } from './deviceCatalogue.service';
import { useNavigate } from 'react-router-dom';

const svc = new DeviceCatalogueService();

export default function UpdateDeviceCatalogue() {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    const sel = svc.getSelectedIdsArr();
    const ids = sel.map((s) => s.id);
    setSelectedIds(ids);
    if (ids.length === 1) {
      void (async function(){
        const resp: any = await svc.info(ids[0]);
        if (resp.status) setForm(resp.data);
      })();
    }
  }, []);

  async function onSubmit() {
    try {
      await svc.update({ ids: selectedIds, catalogue: form });
      navigate('/device-catalogue/listing');
    } catch (e) { console.error(e); }
  }

  return (
    <div className="container-fluid pt-4">
      <h3>Update Device Catalogue</h3>
      <div className="form-group"><label>Make</label><input name="make" value={form.make || ''} onChange={(e) => setForm({ ...form, make: e.target.value })} className="form-control" /></div>
      <div><button className="btn btn-dark-custom" onClick={onSubmit}>Update</button></div>
    </div>
  );
}
