import { useEffect, useState } from 'react';
import { UserService } from '../../users/user.service';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const svc = new UserService();

export default function UpdateUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fName: '', lName: '', organizationName: '', email: '', status: '', password: '', confirmPassword: '' });
  type UserRecord = { fName?: string; lName?: string; organizationName?: string; email?: string; status?: string };

  useEffect(() => {
    const w = window as Window & { __BREADCRUMB?: { name: string; link?: string }[] };
    w.__BREADCRUMB = [{ name: 'Dashboard', link: '/dashboard' }, { name: 'Client Management', link: '/users/listing' }, { name: 'Update Client', link: '' }];
    if (!id) return;
    void (async () => {
      const res = await svc.getRecord(id) as { status: boolean; data?: UserRecord };
      if (res.status) {
        const r = res.data || {};
        setForm({ fName: r.fName || '', lName: r.lName || '', organizationName: r.organizationName || '', email: r.email || '', status: r.status || '', password: '', confirmPassword: '' });
      }
    })();
  }, [id]);

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { id, fName: form.fName.trim(), lName: form.lName.trim(), email: form.email.trim(), password: form.password ? form.password.trim() : '', organizationName: form.organizationName.trim(), status: form.status };
    const res = await svc.update(data) as { status: boolean; message?: string };
    if (res.status) {
      toast.success(res.message || 'Updated');
      navigate('/users/listing');
    } else {
      toast.error(res.message || 'Error');
    }
  }

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">
          <h3>Update Client</h3>
          <form onSubmit={onSubmit}>
            <div className="row">
              <div className="col-lg-4">
                <input className="form-control mb-2" name="fName" placeholder="First Name" value={form.fName} onChange={onChange} />
                <input className="form-control mb-2" name="lName" placeholder="Last Name" value={form.lName} onChange={onChange} />
                <input className="form-control mb-2" name="organizationName" placeholder="Organization Name" value={form.organizationName} onChange={onChange} />
              </div>
              <div className="col-lg-4">
                <input className="form-control mb-2" name="email" placeholder="Email" value={form.email} onChange={onChange} />
                <select className="form-control mb-2" name="status" value={form.status} onChange={onChange}>
                  <option value="">Select Status</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
                <input className="form-control mb-2" type="password" name="password" placeholder="Password" value={form.password} onChange={onChange} />
                <input className="form-control mb-2" type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={onChange} />
              </div>
            </div>
            <div className="mt-3">
              <button className="btn btn-primary" type="submit">Update</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
