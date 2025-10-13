import { useEffect, useState } from 'react';
import LicenseService from './license.service';

export default function Management() {
  type ClientOpt = { id?: string | number; text?: string };
  type LicenseDetail = { id?: string | number; name?: string; title?: string; assignLicenses?: number; runningTotal?: number };
  const [clients, setClients] = useState<ClientOpt[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [licensesDetail, setLicensesDetail] = useState<LicenseDetail[]>([]);

  useEffect(() => {
    (async () => {
      await getClients();
    })();
  }, []);

  async function getClients(search = '') {
    const res = await LicenseService.getUsers('client', '1', search);
    if (res?.status) {
      const clientsInfo = res.data || [];
      setClients(clientsInfo.map((c: unknown) => {
  const obj = c as Record<string, unknown>;
  return { id: obj['id'] as string | number, text: `${(obj['fName'] as string) || ''} ${(obj['lName'] as string) || ''} (${(obj['userName'] as string) || ''})` };
      }));
    }
  }

  async function selectClient(clientId: string) {
    setSelectedClient(clientId);
    const res = await LicenseService.getLicenseInfo(clientId);
    setLicensesDetail(res?.status ? res.data : []);
  }

  async function save() {
    const payload = { clientId: selectedClient, licenses: licensesDetail };
    const res = await LicenseService.insert(payload);
    if (res?.status) {
      // refresh
      selectClient(selectedClient);
    }
  }

  return (
    <div className="container-fluid mt-3">
      <h3>License Info</h3>
      <div className="mb-3">
        <select className="form-select" onChange={(e) => selectClient(e.target.value)}>
          <option value="">Select Client</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.text}</option>)}
        </select>
      </div>
      <div>
        {licensesDetail.map((license) => (
          <div className="d-flex mb-2" key={license.id}>
            <div className="flex-grow-1">{license.name || license.title}</div>
            <div style={{ width: 120 }}>
              <input type="number" className="form-control" value={license.assignLicenses || 0} onChange={(e) => { license.assignLicenses = Number(e.target.value); setLicensesDetail([...licensesDetail]); }} />
            </div>
          </div>
        ))}
      </div>
      <div className="text-end mt-3">
        <button className="btn btn-success" onClick={save}>Save</button>
      </div>
    </div>
  );
}
