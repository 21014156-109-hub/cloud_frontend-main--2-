import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ClientTestSuitService } from '../clientTestSuit.service';
import type { TestPlanEntry, TestSelection } from '../clientTestSuit.service';
import { TestSuitesService } from '../../test-suites/testSuites.service';
import { getAuthUserData } from '../../utils/helper';
import { toast } from 'react-toastify';

type SuiteOption = { id: number; displayName: string };

export default function UpdateClientTestSuit() {
  const { id } = useParams();
  const clientTestSuitService = useMemo(() => new ClientTestSuitService(), []);
  const testSuitesService = useMemo(() => new TestSuitesService(), []);
  const isAdmin = (getAuthUserData()?.roleSlug === 'admin');

  const [clientTestSuitId] = useState<number>(Number(id));
  const [suiteOptions, setSuiteOptions] = useState<SuiteOption[]>([]);
  const [selectedSuite, setSelectedSuite] = useState<number | ''>('');
  const [active, setActive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // For client view: parsed selections (keys)
  const [adminSelections, setAdminSelections] = useState<Set<string>>(new Set());
  const [clientSelections, setClientSelections] = useState<Set<string>>(new Set());
  const [availableTests, setAvailableTests] = useState<Array<{ key: string; value: string }>>([]);

  useEffect(() => {
    (async () => {
      try {
        if (isAdmin) {
          const record = await testSuitesService.getAllTestSuites();
          if (record.status) {
            const opts = record.data.map((t) => ({ id: t.id, displayName: t.testSuitName || t.name || `Test Suite ${t.id}` }));
            setSuiteOptions(opts);
          }
        }
        const detail = await clientTestSuitService.getClientTestSuit(clientTestSuitId);
        if (detail.status) {
          const d = detail.data;
          setActive(!!d.active);
          const sId = (d.testSuitId ?? ((d as unknown as { testSuit?: { id?: number } })?.testSuit?.id)) as number | undefined;
          if (isAdmin) setSelectedSuite(typeof sId === 'number' ? sId : '');
          // Parse plans and selections when not admin (client can see/toggle their options)
          if (!isAdmin) {
            const plan: TestPlanEntry[] = Array.isArray(d.testSuit?.testPlan) ? (d.testSuit?.testPlan as TestPlanEntry[]) : (typeof d.testSuit?.testPlan === 'string' ? JSON.parse(d.testSuit?.testPlan as string) : []);
            setAvailableTests(plan);
            const aSel: TestSelection[] = Array.isArray(d.testOptionsByAdmin) ? d.testOptionsByAdmin as TestSelection[] : (typeof d.testOptionsByAdmin === 'string' ? JSON.parse(d.testOptionsByAdmin as string) : []);
            const cSel: TestSelection[] = Array.isArray(d.testOptionsByClient) ? d.testOptionsByClient as TestSelection[] : (typeof d.testOptionsByClient === 'string' ? JSON.parse(d.testOptionsByClient as string) : []);
            setAdminSelections(new Set(aSel.map(t => t.key)));
            setClientSelections(new Set(cSel.map(t => t.key)));
          }
        }
      } catch {
        toast.error('Failed to load test suite');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [clientTestSuitId, clientTestSuitService, isAdmin, testSuitesService]);

  useEffect(() => {
    const w = window as Window & { __BREADCRUMB?: { name: string; link?: string }[] };
    w.__BREADCRUMB = [{ name: 'Dashboard', link: '/dashboard' }, { name: 'Update Client Test Suite', link: '' }];
    return () => { w.__BREADCRUMB = []; };
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isAdmin) {
        if (!selectedSuite) { toast.error('Please Select Test Suite'); return; }
        const body = { testSuitId: Number(selectedSuite), active };
        const res = await clientTestSuitService.updateClientTestSuit(clientTestSuitId, body);
        if (res.status) toast.success('Updated');
      } else {
        // client updates only their selections
        const body = { testOptionsByClient: Array.from(clientSelections).map(k => ({ key: k })) };
        const res = await clientTestSuitService.updateClientTestSuitForClient(clientTestSuitId, body);
        if (res.status) toast.success('Saved');
      }
    } catch {
      toast.error('Save failed');
    }
  }

  function toggleClientKey(key: string) {
    setClientSelections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  if (isLoading) return <div className="p-4">Loading…</div>;

  return (
    <div className="container-fluid pt-0">
      <div className="row">
        <div className="col">
          <div className="card shadow p-3">
            <form onSubmit={onSave}>
              {isAdmin ? (
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-control-label">Select Test Suite</label>
                    <select className="form-control" value={selectedSuite} onChange={(e) => setSelectedSuite(e.target.value ? Number(e.target.value) : '')}>
                      <option value="">Select Test Suite</option>
                      {suiteOptions.map((s) => <option key={s.id} value={s.id}>{s.displayName}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3 d-flex align-items-end">
                    <div className="custom-control custom-checkbox">
                      <input type="checkbox" className="custom-control-input" id="active" checked={active} onChange={(e) => setActive(e.target.checked)} />
                      <label className="custom-control-label" htmlFor="active">Active</label>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h5 className="mb-3">Available Tests</h5>
                  <div className="row">
                    {availableTests.map((t) => {
                      const disabled = adminSelections.has(t.key) === false && adminSelections.size > 0; // if admin set keys, only those keys are allowed
                      return (
                        <div key={t.key} className="col-md-4 mb-2">
                          <div className="custom-control custom-checkbox">
                            <input type="checkbox" className="custom-control-input" id={`k-${t.key}`} checked={clientSelections.has(t.key)} disabled={disabled} onChange={() => toggleClientKey(t.key)} />
                            <label className="custom-control-label" htmlFor={`k-${t.key}`}>{t.value}</label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="text-right mt-3">
                <button className="btn btn-dark" type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
