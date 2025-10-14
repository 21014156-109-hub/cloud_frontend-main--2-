import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DeviceCatalogueService } from './deviceCatalogue.service';

const svc = new DeviceCatalogueService();

export default function ViewDeviceCatalogue() {
  const params = useParams();
  const id = params['id'];
  const [record, setRecord] = useState<any>(null);

  useEffect(() => { if (id) loadRecord(id); }, [id]);

  async function loadRecord(id: string | undefined) {
    try {
      const resp: any = await svc.info(id);
      if (resp.status) setRecord(resp.data);
    } catch (e) { console.error(e); }
  }

  if (!record) return <div>Loading...</div>;
  return (
    <div className="container-fluid pt-4">
      <h3>View Device Catalogue</h3>
      <div className="card p-3">
        <div><strong>Make:</strong> {record.make}</div>
        <div><strong>OS:</strong> {record.os}</div>
        <div><strong>Model Name:</strong> {record.modelName}</div>
        <div><strong>Model No:</strong> {record.modelNo}</div>
        <div style={{ marginTop: 8 }}><strong>Other:</strong></div>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(record, null, 2)}</pre>
      </div>
    </div>
  );
}
