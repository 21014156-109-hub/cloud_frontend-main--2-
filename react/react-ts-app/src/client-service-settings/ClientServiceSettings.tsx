import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthUserData, getClientID } from '../utils/helper';
import { ClientServiceSettingsService } from './clientServiceSettings.service.ts';
import { UserService } from '../users/user.service';
import '../styles/client-service-settings.css';

type ClientOption = { id: number; text: string };
type ServiceItem = { id: number; title: string; isAssigned: 0 | 1 };

export default function ClientServiceSettings() {
  const navigate = useNavigate();
  const user = useMemo(() => getAuthUserData(), []);
  const isAdmin = (user?.roleSlug === 'admin');
  const myClientId = getClientID();

  const clientService = useMemo(() => new ClientServiceSettingsService(), []);
  const userService = useMemo(() => new UserService(), []);

  const [clientOptions, setClientOptions] = useState<ClientOption[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | null>(isAdmin ? null : myClientId);
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Breadcrumbs could be plumbed into Layout in the future

  useEffect(() => {
    if (isAdmin) {
      void fetchClients();
    } else if (myClientId !== null && myClientId !== undefined) {
      void fetchClientServices(myClientId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchClients(term: string = '') {
    try {
      const record = await userService.getRecords(0, 'client', '1', term);
      if (record.status) {
        const options: ClientOption[] = (record.data || []).map((c) => ({
          id: c.id,
          text: `${c.fName ?? ''} ${c.lName ?? ''} (${c.userName ?? ''})`,
        }));
        setClientOptions(options);
      }
    } catch {
      // noop; could add toast
    }
  }

  async function fetchClientServices(clientId: number) {
    setLoading(true);
    try {
      const record = await clientService.getClientServices(clientId);
      if (record.status) {
        setServicesList(record.data as ServiceItem[]);
      }
    } finally {
      setLoading(false);
    }
  }

  function onStatusChange(idx: number, checked: boolean) {
    setServicesList((prev) => {
      const copy = [...prev];
      if (copy[idx]) copy[idx] = { ...copy[idx], isAssigned: checked ? 1 : 0 };
      return copy;
    });
  }

  function getAssignedServices(): number[] {
    return servicesList.filter((i) => i.isAssigned === 1).map((i) => i.id);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clientId = isAdmin ? selectedClient : myClientId;
    if (!clientId) {
      alert('Please select a client');
      return;
    }
    const services = getAssignedServices();
    try {
      const resp = await clientService.saveClientService({ clientId, services });
      if (resp.status) {
        alert('Services Added Successfully');
        navigate('/client-service-settings');
      }
    } catch (err: unknown) {
      let message = 'Failed to save services';
      if (typeof err === 'object' && err !== null && 'error' in err) {
        const e = err as { error?: { message?: string } };
        if (e.error?.message) message = e.error.message;
      }
      alert(message);
      navigate('/client-service-settings');
    }
  }

  return (
    <div className="container-fluid pt-8">
      <div className="row">
        <div className="col">
          <div className="card shadow">
            <form onSubmit={onSubmit}>
              <div className="pl-lg-4">
                <div className="row">
                  {isAdmin && (
                    <div className="col-lg-4">
                      <div className="form-group">
                        <label className="form-control-label" htmlFor="clientId">Select Client</label>
                        <div className="client-select-wrapper">
                          <input
                            type="text"
                            className="form-control client-search"
                            placeholder="Search client"
                            value={search}
                            onChange={(e) => {
                              const term = e.target.value;
                              setSearch(term);
                              if (term.length >= 2 || term.length === 0) {
                                void fetchClients(term);
                              }
                            }}
                            onFocus={() => void fetchClients('')}
                          />
                          <select
                            id="clientId"
                            className="form-control client-select"
                            value={selectedClient ?? ''}
                            onChange={(e) => {
                              const id = Number(e.target.value);
                              setSelectedClient(isNaN(id) ? null : id);
                              if (!isNaN(id)) void fetchClientServices(id);
                            }}
                          >
                            <option value="" disabled>Select</option>
                            {clientOptions.map((c) => (
                              <option key={c.id} value={c.id}>{c.text}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {loading && (
                <div className="p-4">Loading services…</div>
              )}
              {!loading && servicesList && servicesList.length > 0 && (
                <>
                  <div className="table-responsive">
                    <table className="table align-items-center table-flush">
                      <thead className="thead-light">
                        <tr>
                          <th>Service Name</th>
                          <th>Is Assigned</th>
                        </tr>
                      </thead>
                      <tbody className="list">
                        {servicesList.map((item, idx) => (
                          <tr key={item.id}>
                            <td>{item.title}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <label className="custom-toggle custom-toggle-success">
                                  <input
                                    type="checkbox"
                                    checked={item.isAssigned === 1}
                                    onChange={(e) => onStatusChange(idx, e.target.checked)}
                                  />
                                  <span className="custom-toggle-slider rounded-circle" data-label-off="No" data-label-on="Yes"></span>
                                </label>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="row mb-5">
                    <div className="col-sm-11 text-right">
                      <button className="btn btn-padding btn-dark-custom" type="submit">Submit</button>
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
