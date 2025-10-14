import { useEffect, useState } from 'react';
import { UserService } from '../../users/user.service';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const svc = new UserService();

export default function AddUser() {
  const [userRoles, setUserRoles] = useState<Array<{ id?: number; title?: string }>>([]);
  const [form, setForm] = useState({ fName: '', lName: '', organizationName: '', userName: '', email: '', roleId: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();

  useEffect(() => { void getUserRoles(); setBreadcrumb(); }, []);

  function setBreadcrumb() {
    const w = window as Window & { __BREADCRUMB?: { name: string; link?: string }[] };
    w.__BREADCRUMB = [{ name: 'Dashboard', link: '/dashboard' }, { name: 'Client Management', link: '/users/listing' }, { name: 'Add Client', link: '' }];
  }

  async function getUserRoles() {
    const res = await svc.getUserRoles('admin,client');
    if (res.status) setUserRoles(res.data || []);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  type ApiResp = { status: boolean; message?: string };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const data = {
      fName: form.fName.trim(), lName: form.lName.trim(), userName: form.userName.trim(), email: form.email.trim(), password: form.password.trim(), roleId: form.roleId, warehouseId: 0, clientId: 0, organizationName: form.organizationName.trim()
    };
    try {
      const res = await svc.insert(data) as ApiResp;
      if (res.status) {
        toast.success(res.message || 'Added');
        navigate('/users/listing');
      } else {
        toast.error(res.message || 'Error');
      }
    } catch (err: unknown) {
      const e = err as { message?: string; error?: { message?: string } } | undefined;
      const msg = e?.message || e?.error?.message || 'Request failed';
      toast.error(String(msg));
    }
  }

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">
          <h3>Add Client</h3>
          <form onSubmit={onSubmit}>
            <div className="row">
              <div className="col-lg-4">
                <input className="form-control mb-2" name="fName" placeholder="First Name" value={form.fName} onChange={onChange} />
                <input className="form-control mb-2" name="lName" placeholder="Last Name" value={form.lName} onChange={onChange} />
                <input className="form-control mb-2" name="organizationName" placeholder="Organization Name" value={form.organizationName} onChange={onChange} />
              </div>
              <div className="col-lg-4">
                <input className="form-control mb-2" name="userName" placeholder="Username" value={form.userName} onChange={onChange} />
                <input className="form-control mb-2" name="email" placeholder="Email" value={form.email} onChange={onChange} />
                <select className="form-control mb-2" name="roleId" value={form.roleId} onChange={onChange}>
                  <option value="">Select Role</option>
                  {userRoles.map(r => <option key={String(r.id)} value={String(r.id)}>{r.title}</option>)}
                </select>
                <input className="form-control mb-2" type="password" name="password" placeholder="Password" value={form.password} onChange={onChange} />
                <input className="form-control mb-2" type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={onChange} />
              </div>
            </div>
            <div className="mt-3">
              <button className="btn btn-primary" type="submit">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
