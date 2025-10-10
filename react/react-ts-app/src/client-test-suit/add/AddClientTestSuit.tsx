import { useEffect, useMemo, useState } from 'react';
import { ClientTestSuitService } from '../clientTestSuit.service';
import { TestSuitesService } from '../../test-suites/testSuites.service';
import { UserService } from '../../users/user.service';
import { getAuthUserData } from '../../utils/helper';
import { toast } from 'react-toastify';
import '../../styles/client-test-suit.css';

type ClientOption = { id: number; text: string };
type TestSuiteOption = { id: number; displayName: string };

export default function AddClientTestSuit() {
  const clientTestSuitService = useMemo(() => new ClientTestSuitService(), []);
  const testSuitesService = useMemo(() => new TestSuitesService(), []);
  const userService = useMemo(() => new UserService(), []);
  const isAdmin = (getAuthUserData()?.roleSlug === 'admin');

  const [clientOptions, setClientOptions] = useState<ClientOption[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
  const [suiteOptions, setSuiteOptions] = useState<TestSuiteOption[]>([]);
  const [selectedSuiteId, setSelectedSuiteId] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // load test suites for everyone
    (async () => {
      try {
        const record = await testSuitesService.getAllTestSuites();
        if (record.status) {
          const opts = record.data.map((t) => ({ id: t.id, displayName: t.testSuitName || t.name || `Test Suite ${t.id}` }));
          setSuiteOptions(opts);
        }
      } catch {
        // try paginated
        const rec = await testSuitesService.getTestSuites(0, 1000);
        if (rec.status) {
          const opts = (rec.data as any[]).map((t: any) => ({ id: t.id, displayName: t.testSuitName || t.name || `Test Suite ${t.id}` }));
          setSuiteOptions(opts);
        }
      }
    })();

    if (isAdmin) {
      void loadClients('');
    } else {
      const u = getAuthUserData();
      if (u?.roleSlug === 'client') setSelectedClientId(Number(u.id));
      else if (u?.clientId) setSelectedClientId(Number(u.clientId));
    }
  }, [isAdmin, testSuitesService]);

  async function loadClients(term: string) {
    const record = await userService.getRecords(0, 'client', '1', term);
    if (record.status) {
      const opts = record.data.map((c) => ({ id: c.id, text: `${c.fName ?? ''} ${c.lName ?? ''} (${c.userName ?? ''})` }));
      setClientOptions(opts);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isAdmin && !selectedClientId) { toast.error('Please Select Client'); return; }
    if (!selectedSuiteId) { toast.error('Please Select Test Suite'); return; }
    const body: { testSuitId: number; active: boolean; clientId?: number } = { testSuitId: Number(selectedSuiteId), active: true };
    if (isAdmin && selectedClientId) body.clientId = Number(selectedClientId);
    setSaving(true);
    try {
      const res = await clientTestSuitService.createClientTestSuit(body);
      if (res.status) {
        toast.success('Test Suite Assigned to Client Successfully');
        window.location.href = '/client-test-suit/listing';
      }
    } catch (err) {
      const msg = (typeof err === 'object' && err && 'error' in err) ? (err as { error?: { message?: string } }).error?.message : 'Failed to assign';
      toast.error(msg || 'Failed to assign');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-fluid pt-0">
      <div className="row">
        <div className="col">
          <div className="card shadow p-3">
            <form onSubmit={onSubmit}>
              <div className="row">
                {isAdmin && (
                  <div className="col-md-6">
                    <label className="form-control-label">Select Client</label>
                    <input className="form-control mb-2" placeholder="Search client" onChange={(e) => { const term = e.target.value; if (term.length >= 2 || term.length === 0) void loadClients(term); }} />
                    <select className="form-control" value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value ? Number(e.target.value) : '')}>
                      <option value="">Select</option>
                      {clientOptions.map((c) => <option key={c.id} value={c.id}>{c.text}</option>)}
                    </select>
                  </div>
                )}
                <div className="col-md-6">
                  <label className="form-control-label">Select Test Suite</label>
                  <select className="form-control" value={selectedSuiteId} onChange={(e) => setSelectedSuiteId(e.target.value ? Number(e.target.value) : '')}>
                    <option value="">Select Test Suite</option>
                    {suiteOptions.map((s) => <option key={s.id} value={s.id}>{s.displayName}</option>)}
                  </select>
                </div>
              </div>
              <div className="text-right mt-3">
                <button className="btn btn-dark" disabled={saving}>{saving ? 'Saving…' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
