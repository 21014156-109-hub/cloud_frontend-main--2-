import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserService } from '../../users/user.service';
import { WarehouseService } from '../../warehouses/warehouse.service';
import { StationsService } from '../../stations/stations.service';
import { getAuthUserData } from '../../utils/helper';

const userSvc = new UserService();
const warehouseSvc = new WarehouseService();
const stationSvc = new StationsService();

type ClientOption = { id: number; text: string };

type WifiProfile = { id: number; networkName: string };
type Role = { id: number; title?: string };
type Warehouse = { id: number | string; warehouseName: string };
type FormState = {
  fName: string; lName: string; userName: string; email: string; password: string; confirmPassword: string;
  warehouseId: string | number; stationName: string; pcMacAddress: string; platform: string; networkName: string; wifiPassword: string; clientId: string | number | ''
};

export default function AddTester() {
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [wifiProfiles, setWifiProfiles] = useState<WifiProfile[]>([]);
  const [selectedWifiProfiles, setSelectedWifiProfiles] = useState<number[]>([]);
  const [selectedFormType, setSelectedFormType] = useState<'new'|'existing'>('new');
  const [isWarehouseDisabled, setIsWarehouseDisabled] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState<FormState>({
    fName: '', lName: '', userName: '', email: '', password: '', confirmPassword: '',
    warehouseId: '', stationName: '', pcMacAddress: '', platform: 'MacOs', networkName: '', wifiPassword: '', clientId: ''
  });
  const navigate = useNavigate();

  const auth = getAuthUserData();

  useEffect(() => {
    setIsAdmin(auth?.roleSlug === 'admin');
    void getUserRoles();
    if (auth?.roleSlug === 'admin') {
      void getClients('');
    } else if (auth?.id) {
      void getWarehouses(auth.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getUserRoles() {
    const rec = await userSvc.getUserRoles('tester');
    setUserRoles(rec.status ? (rec.data as Role[]) : []);
  }

  async function getClients(search: string) {
    const record = await userSvc.getRecords(0, 'client', '1', search);
    if (record.status) {
      type Client = { id: number; fName: string; lName: string; userName: string };
      const list = (record.data as Client[]) || [];
      setClients(list.map((client: Client) => ({ id: client.id, text: `${client.fName} ${client.lName} (${client.userName})` })));
    }
  }

  async function getWarehouses(clientId: number | string) {
    const warehouseList = await warehouseSvc.getCollectionInfoById(clientId, '1');
    setWarehouses(warehouseList.status ? (warehouseList.data as Warehouse[]) : []);
    setIsWarehouseDisabled(false);
  }

  async function getWifiProfilesByWarehouse(warehouseId: number) {
    const record = await stationSvc.getwifiprofilesbyWarehouse(warehouseId);
    if (record.status) {
      setWifiProfiles((record.data as WifiProfile[]) || []);
      setSelectedWifiProfiles([]);
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev: FormState) => ({ ...prev, [name]: value } as FormState));
    if (name === 'clientId' && value) {
      setIsWarehouseDisabled(true);
      void getWarehouses(value);
    }
    if (name === 'warehouseId' && value) {
      setSelectedFormType('new');
      void getWifiProfilesByWarehouse(Number(value));
    }
  }

  function toggleWifi(id: number, checked: boolean) {
    setSelectedWifiProfiles(prev => {
      const set = new Set(prev);
      if (checked) set.add(id); else set.delete(id);
      return Array.from(set);
    });
  }

  function validate(): string | null {
    if (!form.fName.trim()) return 'First Name is required';
    if (!form.lName.trim()) return 'Last Name is required';
    if (!form.userName.trim()) return 'UserName is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Valid Email is required';
    if (!form.password.trim()) return 'Password is required';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    if (!form.warehouseId) return 'Warehouse is required';
    if (isAdmin && !form.clientId) return 'Client is required';

    const networkName = form.networkName.trim();
    const wifiPassword = form.wifiPassword.trim();
    if ((selectedFormType === 'new') && ((networkName && !wifiPassword) || (!networkName && wifiPassword))) {
      return 'Network name and password both fields are required';
    }
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { toast.warning(err); return; }

    const payload = {
      fName: form.fName.trim(),
      lName: form.lName.trim(),
      userName: form.userName.trim(),
      email: form.email.trim(),
      password: form.password.trim(),
      roleId: userRoles[0]?.id,
      warehouseId: form.warehouseId,
      clientId: isAdmin ? Number(form.clientId) : auth?.id,
      stationName: form.stationName.trim(),
      pcMacAddress: form.pcMacAddress.trim(),
      operatingSystem: form.platform,
      networkName: form.networkName.trim(),
      wifiPassword: form.wifiPassword.trim(),
      wifiProfiles: selectedWifiProfiles
    };

    try {
      const rec = await userSvc.insert(payload) as { status: boolean; message?: string };
      if (rec.status) {
        toast.success('Tester added successfully');
        navigate('/testers/listing');
      } else {
        toast.error(rec.message || 'Error');
      }
    } catch (error: unknown) {
      const e = error as { error?: { message?: string }, message?: string } | undefined;
      toast.error(e?.error?.message || e?.message || 'Error');
    }
  }

  const header = useMemo(() => (
    <div className="d-flex justify-content-between mb-3">
      <h3>Add Tester</h3>
    </div>
  ), []);

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">
          {header}
          <form onSubmit={onSubmit}>
            <div className="row">
              {isAdmin && (
                <div className="col-lg-4">
                  <select name="clientId" className="form-control mb-2" value={form.clientId} onChange={onChange}>
                    <option value="">Select Client</option>
                    {clients.map((c) => (<option key={c.id} value={c.id}>{c.text}</option>))}
                  </select>
                </div>
              )}
              <div className="col-lg-4">
                <input name="fName" className="form-control mb-2" placeholder="First Name" value={form.fName} onChange={onChange} />
                <input name="lName" className="form-control mb-2" placeholder="Last Name" value={form.lName} onChange={onChange} />
                <input name="userName" className="form-control mb-2" placeholder="Username" value={form.userName} onChange={onChange} />
                <input name="email" className="form-control mb-2" placeholder="Email" value={form.email} onChange={onChange} />
                <input type="password" name="password" className="form-control mb-2" placeholder="Password" value={form.password} onChange={onChange} />
                <input type="password" name="confirmPassword" className="form-control mb-2" placeholder="Confirm Password" value={form.confirmPassword} onChange={onChange} />
                <select name="warehouseId" className="form-control mb-2" value={form.warehouseId} onChange={onChange} disabled={isWarehouseDisabled}>
                  <option value="">Select Warehouse</option>
                  {warehouses.map((w: Warehouse) => (<option key={w.id} value={w.id}>{w.warehouseName}</option>))}
                </select>
                <div className="mb-2">
                  <label className="me-3">Wifi Settings:</label>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" name="formType" id="formNew" value="new" checked={selectedFormType==='new'} onChange={() => setSelectedFormType('new')} />
                    <label className="form-check-label" htmlFor="formNew">New</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" name="formType" id="formExisting" value="existing" checked={selectedFormType==='existing'} onChange={() => setSelectedFormType('existing')} />
                    <label className="form-check-label" htmlFor="formExisting">Existing</label>
                  </div>
                </div>
                {selectedFormType === 'new' && (
                  <>
                    <input name="networkName" className="form-control mb-2" placeholder="Network Name" value={form.networkName} onChange={onChange} />
                    <input name="wifiPassword" type="password" className="form-control mb-2" placeholder="Wifi Password" value={form.wifiPassword} onChange={onChange} />
                  </>
                )}
                {selectedFormType === 'existing' && (
                  <div className="mb-2">
                    <label>Wifi Profiles</label>
                    <div>
                      {wifiProfiles.map((p) => (
                        <div className="form-check" key={p.id}>
                          <input className="form-check-input" type="checkbox" id={`wifi-${p.id}`} checked={selectedWifiProfiles.includes(p.id)} onChange={(e) => toggleWifi(p.id, e.target.checked)} />
                          <label className="form-check-label" htmlFor={`wifi-${p.id}`}>{p.networkName}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <input name="stationName" className="form-control mb-2" placeholder="Station Name" value={form.stationName} onChange={onChange} />
                <input name="pcMacAddress" className="form-control mb-2" placeholder="PC Mac Address" value={form.pcMacAddress} onChange={onChange} />
                <input name="platform" className="form-control mb-2" placeholder="Platform" value={form.platform} onChange={onChange} />
              </div>
            </div>
            <div className="mt-3">
              <button className="btn btn-primary" type="submit">Submit</button>
              <button className="btn btn-link ms-2" type="button" onClick={() => navigate('/testers/listing')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
