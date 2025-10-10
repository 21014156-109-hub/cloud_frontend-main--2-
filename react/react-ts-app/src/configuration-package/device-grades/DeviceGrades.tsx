import { useEffect, useMemo, useState } from 'react';
import { ConfigurationPackageService } from '../configurationPackage.service';
import { toast } from 'react-toastify';

export default function DeviceGrades() {
  const svc = useMemo(() => new ConfigurationPackageService(), []);
  const [grades, setGrades] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const resp = await svc.getClientGrades();
      if (resp.status) {
        const g = resp.data?.grades ?? [];
        setGrades(g.length ? g : ['']);
      }
    })();
  }, [svc]);

  async function load() {
    const resp = await svc.getClientGrades();
    if (resp.status) {
      const g = resp.data?.grades ?? [];
      setGrades(g.length ? g : ['']);
    }
  }

  function addNewGrade() { setGrades(prev => [...prev, '']); }
  function removeGrade(idx: number) { setGrades(prev => prev.filter((_, i) => i !== idx)); }

  async function saveGrade() {
    const cleaned = grades.map(g => g.trim()).filter(Boolean);
    if (cleaned.length === 0) { toast.error('Please provide at least one grade to continue.'); return; }
    setSaving(true);
    try {
      const resp = await svc.updateClientGrades(cleaned);
      if (resp.status) { toast.success(resp.message || 'Grades updated'); await load(); }
      else { toast.error('Failed to update grades'); }
    } catch { toast.error('Failed to update grades'); } finally { setSaving(false); }
  }

  return (
    <div>
      <div className="card-header">
        <div className="row">
          <div className="col-sm-6">
            <button className="btn btn-dark-custom btn-padding" onClick={addNewGrade} disabled={saving}>
              <i className="fa fa-plus" aria-hidden="true" /> Add New Grade
            </button>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="row">
          {grades.map((grade, i) => (
            <div className="col-md-2" key={i}>
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-control-label">Grade</label>
                <input type="text" className="form-control" value={grade} onChange={(e) => setGrades(prev => prev.map((g, idx) => idx === i ? e.target.value : g))} />
                {grades.length > 1 && (
                  <a className="text-black-50" href="#" onClick={(e) => { e.preventDefault(); removeGrade(i); }} style={{ position: 'absolute', right: 7, top: 20 }}>
                    <i className="fa fa-times-circle text-danger" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          ))}
          <div className="col-lg-12 text-right">
            <button className="btn btn-dark-custom btn-padding" type="button" onClick={saveGrade} disabled={saving || grades.length === 0}>
              {saving ? 'Saving…' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
