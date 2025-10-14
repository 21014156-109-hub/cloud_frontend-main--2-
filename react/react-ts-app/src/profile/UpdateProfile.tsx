import { useEffect, useState } from 'react';
import { Breadcrumbs } from '../components';
import profileSvc from './profile.service';
import { getAuthUserData, updateAuthUserData } from '../utils/helper';
import { toast } from 'react-toastify';

export default function UpdateProfile() {
  const user = getAuthUserData();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fName: '', lName: '', email: '', userName: '', password: '', confirmPassword: '', currentPassword: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const w = window as Window & { __BREADCRUMB?: { name: string; link?: string }[] };
    w.__BREADCRUMB = [{ name: 'Dashboard', link: '/dashboard' }, { name: 'Update Profile', link: '' }];

    // read auth user once at mount to avoid effect re-running due to object identity changes
    const authUser = getAuthUserData();
    // prefill from local storage immediately
    if (authUser) {
      setForm(f => ({ ...f, fName: (authUser.fName as string) || '', lName: (authUser.lName as string) || '', email: (authUser.email as string) || '', userName: (authUser.userName as string) || '' }));
    }

    // fetch authoritative record from server if possible
    (async () => {
      try {
        const id = (authUser && authUser.id) ? Number(authUser.id) : 0;
        if (id > 0) {
          const rec = await profileSvc.getRecord(id) as unknown;
          // align shape: rec.collection contains user info in Angular API, but may vary; try common keys
          let data: { fName?: string; lName?: string; email?: string; userName?: string } | undefined;
          if (rec && typeof rec === 'object') {
            const obj = rec as Record<string, unknown>;
            const candidate = (obj['collection'] ?? obj['data'] ?? obj) as Record<string, unknown> | undefined;
            if (candidate && typeof candidate === 'object') {
              data = {
                fName: typeof candidate['fName'] === 'string' ? (candidate['fName'] as string) : undefined,
                lName: typeof candidate['lName'] === 'string' ? (candidate['lName'] as string) : undefined,
                email: typeof candidate['email'] === 'string' ? (candidate['email'] as string) : undefined,
                userName: typeof candidate['userName'] === 'string' ? (candidate['userName'] as string) : undefined,
              };
            }
          }
          if (data) {
            setForm(f => ({ ...f, fName: data!.fName || f.fName, lName: data!.lName || f.lName, email: data!.email || f.email, userName: data!.userName || f.userName }));
          }
        }
      } catch {
        // ignore fetch errors; keep local data
      }
    })();

    return () => { w.__BREADCRUMB = []; };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password && !form.currentPassword) {
      toast.warning('Current password field is required', { position: 'top-right' });
      return;
    }
    const payload = {
      fName: form.fName.trim(),
      lName: form.lName.trim(),
      password: form.password ? form.password.trim() : '',
      currentPassword: form.currentPassword ? form.currentPassword.trim() : '',
    };
    try {
      setLoading(true);
      const resp = await profileSvc.update(payload);
      const result = resp as unknown;
      let ok = false;
      if (result && typeof result === 'object') {
        const r = result as Record<string, unknown>;
        ok = Boolean(r['status'] || r['success']);
      }
      if (ok) {
        toast.success('Profile updated');
        // Update local storage user data and local form state instead of forcing a full reload
        updateAuthUserData(user, { fName: payload.fName, lName: payload.lName });
        setForm(f => ({ ...f, fName: payload.fName, lName: payload.lName }));
      }
    } catch (err) {
      // try to extract error message
      let msg = 'Failed to update profile';
      if (err && typeof err === 'object') {
        const o = err as Record<string, unknown>;
        const inner = o['error'] as Record<string, unknown> | undefined;
        if (inner && typeof inner['message'] === 'string') msg = inner['message'] as string;
        else if (typeof o['message'] === 'string') msg = o['message'] as string;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function markTouched(field: string) {
    setTouched(t => ({ ...t, [field]: true }));
  }



  const isFormValid = (() => {
    if (!form.fName.trim() || !form.lName.trim()) return false;
    if (form.password) {
      if (!form.currentPassword) return false;
      if (!form.confirmPassword) return false;
      if (form.password !== form.confirmPassword) return false;
      if (form.password.length < 6) return false;
    }
    return true;
  })();

  return (
    <div>
      <Breadcrumbs />
      <div className="container-fluid pt-8">
        <div className="row">
          <div className="col-xl-12 order-xl-1">
            <div className="card">
              <div className="card-body">
                <form onSubmit={onSubmit}>
                  <div className="pl-lg-4">
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="form-group">
                          <label className="form-control-label" htmlFor="fName">First Name</label>
                          <input id="fName" value={form.fName} onChange={e => setForm({ ...form, fName: e.target.value })} onBlur={() => markTouched('fName')} className="form-control" autoComplete="new-password" />
                          {touched.fName && !form.fName && <small className="text-danger">First Name is required</small>}
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="form-group">
                          <label className="form-control-label" htmlFor="lName">Last Name</label>
                          <input id="lName" value={form.lName} onChange={e => setForm({ ...form, lName: e.target.value })} onBlur={() => markTouched('lName')} className="form-control" autoComplete="new-password" />
                          {touched.lName && !form.lName && <small className="text-danger">Last Name is required</small>}
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="form-group">
                          <label className="form-control-label" htmlFor="email">Email</label>
                          <input id="email" value={form.email} readOnly className="form-control" autoComplete="new-password" />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="form-group">
                          <label className="form-control-label" htmlFor="userName">UserName</label>
                          <input id="userName" value={form.userName} readOnly className="form-control" autoComplete="new-password" />
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="form-group">
                          <label className="form-control-label" htmlFor="currentPassword">Current Password</label>
                          <input id="currentPassword" type="password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} onBlur={() => markTouched('currentPassword')} className="form-control" autoComplete="new-password" />
                        
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="form-group">
                          <label className="form-control-label" htmlFor="password">Password</label>
                          <input id="password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onBlur={() => markTouched('password')} className="form-control" autoComplete="new-password" />
                          {touched.password && form.password && form.password.length < 6 && <small className="text-danger">Password must be at least 6 characters</small>}
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="form-group">
                          <label className="form-control-label" htmlFor="confirmPassword">Confirm Password</label>
                          <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} onBlur={() => markTouched('confirmPassword')} className="form-control" autoComplete="new-password" />
                          {touched.confirmPassword && form.password && (!form.confirmPassword || form.password !== form.confirmPassword) && <small className="text-danger">{!form.confirmPassword ? 'Confirm Password is required' : 'Passwords do not match'}</small>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-12 text-right">
                    <button className="btn btn-padding btn-dark-custom" type="submit" disabled={loading || !isFormValid}>Submit</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
