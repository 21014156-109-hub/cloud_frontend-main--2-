import { useCallback, useEffect, useMemo, useState } from 'react';
import { UserService } from '../../users/user.service';
import { ClientTestSuitService } from '../../client-test-suit/clientTestSuit.service';
import { TestSuitesAssignmentService } from '../../test-suites/testSuitesAssignment.service';
import type { ClientTestSuitItem, ClientTestSuitPage } from '../../client-test-suit/clientTestSuit.service';
import { getAuthUserData } from '../../utils/helper';
import { toast } from 'react-toastify';

type Tester = { id: number; fName?: string; lName?: string; userName?: string };
type AssignmentPayload = { testerId: number; clientTestSuitId: number };

export default function AddTestSuitesAssignment({ onClose, onSuccess }: { onClose?: () => void; onSuccess?: () => void }) {
  const userService = useMemo(() => new UserService(), []);
  const clientSuitService = useMemo(() => new ClientTestSuitService(), []);
  const assignService = useMemo(() => new TestSuitesAssignmentService(), []);
  const auth = useMemo(() => getAuthUserData(), []);

  const [testers, setTesters] = useState<Tester[]>([]);
  const [selectedTesterId, setSelectedTesterId] = useState<number | ''>('');

  const [clientSuites, setClientSuites] = useState<ClientTestSuitItem[]>([]);
  const [selectedClientSuitId, setSelectedClientSuitId] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Breadcrumb (only when page-routed, not embedded)
    if (!onClose) {
      const w = window as Window & { __BREADCRUMB?: { name: string; link?: string }[] };
      w.__BREADCRUMB = [{ name: 'Dashboard', link: '/dashboard' }, { name: 'Assign Test Suites', link: '' }];
      return () => { w.__BREADCRUMB = []; };
    }
    return () => {};
  }, [onClose]);

  const loadTesters = useCallback(async (term: string) => {
    try {
      const res = await userService.getRecords(0, 'tester', '1', term);
      if (res.status) setTesters(res.data);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && (err as { code?: string }).code === 'AUTH_EXPIRED') return;
      toast.error('Failed to load testers');
    }
  }, [userService]);

  const loadClientSuites = useCallback(async () => {
    try {
      const res = await clientSuitService.getClientTestSuitListing(0, 1000);
      if (res.status) {
        const page = res.data as ClientTestSuitPage;
        const items = page.data ?? [];
        // If client user, show only their suites
        const filtered = auth?.roleSlug === 'client' && auth?.id
          ? items.filter(i => i.client?.userName === auth.userName || (auth.clientId && (i as unknown as { clientId?: number }).clientId === auth.clientId))
          : items;
        setClientSuites(filtered);
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && (err as { code?: string }).code === 'AUTH_EXPIRED') return;
      toast.error('Failed to load client test suites');
    }
  }, [auth, clientSuitService]);

  useEffect(() => {
    // initial load testers and client test suites
    void loadTesters('');
    void loadClientSuites();
  }, [loadClientSuites, loadTesters]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTesterId) { toast.error('Please Select Tester'); return; }
    if (!selectedClientSuitId) { toast.error('Please Select Client Test Suite'); return; }
    const payload: AssignmentPayload = { testerId: Number(selectedTesterId), clientTestSuitId: Number(selectedClientSuitId) };
    setSaving(true);
    try {
      const res = await assignService.assignTestSuites(payload);
      if (res.status) {
        toast.success(res.message || 'Assigned successfully');
        if (onSuccess) onSuccess();
        if (onClose) onClose();
        else window.location.href = '/test-suites-assignment/listing';
      } else {
        toast.error(res.message || 'Assignment failed');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && (err as { code?: string }).code === 'AUTH_EXPIRED') return;
      const msg = (typeof err === 'object' && err && 'error' in err) ? (err as { error?: { message?: string } }).error?.message : 'Assignment failed';
      toast.error(msg || 'Assignment failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-fluid pt-0">
      <div className="row">
        <div className="col">
          <div className="card shadow p-4">
            <form onSubmit={onSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <label className="form-control-label">Select Tester <span className="text-danger">*</span></label>
                  <select className="form-control" value={selectedTesterId} onChange={(e) => setSelectedTesterId(e.target.value ? Number(e.target.value) : '')}>
                    <option value="">Select</option>
                    {testers.map((t) => (
                      <option key={t.id} value={t.id}>{`${t.fName ?? ''} ${t.lName ?? ''}`.trim() || t.userName || `Tester ${t.id}`}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-control-label">Select Client Test Suite <span className="text-danger">*</span></label>
                  <select className="form-control" value={selectedClientSuitId} onChange={(e) => setSelectedClientSuitId(e.target.value ? Number(e.target.value) : '')}>
                    <option value="">Select</option>
                    {clientSuites.map((c) => (
                      <option key={c.id} value={c.id}>{`${c.client?.userName ?? 'Client'} - ${c.testSuit?.testSuitName ?? 'Suite'}`}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="d-flex justify-content-end mt-4">
                {onClose && (
                  <button type="button" className="btn btn-light mr-2" onClick={onClose}>Cancel</button>
                )}
                <button className="btn btn-success" disabled={saving} type="submit">{saving ? 'Submitting…' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
