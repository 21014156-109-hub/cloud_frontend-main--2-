import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserService } from '../../users/user.service';

const userSvc = new UserService();

interface TesterRecord {
  id?: string | number;
  fName?: string;
  lName?: string;
  email?: string;
  status?: string | number;
}

export default function UpdateTester() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<{ fName: string; lName: string; email: string; status: string; password: string; confirmPassword: string }>({ fName: '', lName: '', email: '', status: '', password: '', confirmPassword: '' });

  useEffect(() => { if (id) void getRecord(id); }, [id]);

  async function getRecord(apiID: string) {
    const record = await userSvc.getRecord(apiID);
    if (record.status) {
      const r = record.data as TesterRecord;
      setForm({ fName: r.fName || '', lName: r.lName || '', email: r.email || '', status: String(r.status ?? ''), password: '', confirmPassword: '' });
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fName.trim()) { toast.warning('First Name is required'); return; }
    if (!form.lName.trim()) { toast.warning('Last Name is required'); return; }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) { toast.warning('Valid Email is required'); return; }
    if (form.password && form.password !== form.confirmPassword) { toast.warning('Passwords do not match'); return; }

    const payload = {
      id,
      fName: form.fName.trim(),
      lName: form.lName.trim(),
      email: form.email.trim(),
      password: form.password ? form.password.trim() : '',
      status: form.status,
    };
    const rec = await userSvc.update(payload) as { status: boolean };
    if (rec.status) {
      toast.success('Tester updated successfully');
      navigate('/testers/listing');
    }
  }

  return (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body">
          <h3>Update Tester</h3>
          <form onSubmit={onSubmit}>
            <div className="row">
              <div className="col-lg-4">
                <input name="fName" className="form-control mb-2" placeholder="First Name" value={form.fName} onChange={onChange} />
                <input name="lName" className="form-control mb-2" placeholder="Last Name" value={form.lName} onChange={onChange} />
                <input name="email" className="form-control mb-2" placeholder="Email" value={form.email} onChange={onChange} />
                <select name="status" className="form-control mb-2" value={form.status} onChange={onChange}>
                  <option value="">Select Status</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
                <input type="password" name="password" className="form-control mb-2" placeholder="Password" value={form.password} onChange={onChange} />
                <input type="password" name="confirmPassword" className="form-control mb-2" placeholder="Confirm Password" value={form.confirmPassword} onChange={onChange} />
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
