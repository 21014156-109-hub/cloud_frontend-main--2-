import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeviceCatalogueService } from './deviceCatalogue.service';

const svc = new DeviceCatalogueService();

export default function AddDeviceCatalogue() {
  const navigate = useNavigate();
  const [form, setForm] = useState<any>({ make: '', os: '', modelName: '', modelNo: '' });

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function onSubmit() {
    try {
      const resp: any = await svc.insert({ catalogue: form });
      if (resp.status) navigate('/device-catalogue/listing');
    } catch (e) { console.error(e); }
  }

  return (
    <div className="container-fluid pt-4">
      <h3>Add Device Catalogue</h3>
      <div className="form-group"><label>Make</label><input name="make" value={form.make} onChange={onChange} className="form-control" /></div>
      <div className="form-group"><label>OS</label><select name="os" value={form.os} onChange={onChange} className="form-control"><option value="">Select</option><option value="ios">iOS</option><option value="android">Android</option></select></div>
      <div className="form-group"><label>Model Name</label><input name="modelName" value={form.modelName} onChange={onChange} className="form-control" /></div>
      <div className="form-group"><label>Model No</label><input name="modelNo" value={form.modelNo} onChange={onChange} className="form-control" /></div>
      <div><button className="btn btn-dark-custom" onClick={onSubmit}>Save</button></div>
    </div>
  );
}
