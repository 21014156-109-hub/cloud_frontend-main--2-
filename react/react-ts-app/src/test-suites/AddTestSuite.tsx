import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TestSuitesService } from './testSuites.service';
import { toast } from 'react-toastify';

const svc = new TestSuitesService();

type TestOption = { key: string; label: string; checked: boolean; parent?: string };

export default function AddTestSuite() {
  const navigate = useNavigate();
  const [testOptions, setTestOptions] = useState<TestOption[]>([]);
  const [testCategories, setTestCategories] = useState<Array<{ key: string; label: string; tests: string[]; hasParentCheckbox: boolean }>>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    // test structure inspired by Angular implementation (trimmed)
    const testStructure = {
      default: { label: 'Default Tests', hasParentCheckbox: false, tests: { wifi: 'WiFi', bluetooth: 'Bluetooth' } },
      audio: { label: 'Audio Tests', hasParentCheckbox: true, tests: { audioOutput: 'Audio Output', audioTest: 'Audio Test', autoES: 'Auto ES' } },
      sensors: { label: 'Sensor Tests', hasParentCheckbox: false, tests: { proximitySensor: 'Proximity Sensor', vibration: 'Vibration', accelerometer: 'Accelerometer' } },
      touchDisplay: { label: 'Touch & Display Tests', hasParentCheckbox: false, tests: { flashlight: 'Flashlight', digitizer: 'Digitizer', lcd: 'LCD' } }
    } as const;

    const opts: TestOption[] = [];
    const cats: { key: string; label: string; tests: string[]; hasParentCheckbox: boolean }[] = [];
    (Object.keys(testStructure) as Array<keyof typeof testStructure>).forEach((catKey) => {
      const category = testStructure[catKey];
      cats.push({ key: String(catKey), label: category.label, tests: Object.keys(category.tests), hasParentCheckbox: category.hasParentCheckbox });
      Object.keys(category.tests).forEach((tKey) => {
        opts.push({ key: tKey, label: (category.tests as Record<string, string>)[tKey], checked: String(catKey) === 'default', parent: String(catKey) });
      });
    });

    setTestCategories(cats);
    setTestOptions(opts);

    // set breadcrumb used by layout (keeps parity with other pages)
    const w = window as Window & { __BREADCRUMB?: { name: string; link?: string }[] };
    w.__BREADCRUMB = [{ name: 'Dashboard', link: '/dashboard' }, { name: 'Test Suites', link: '/test-suites/listing' }, { name: 'Add Test Suite', link: '' }];
    return () => { w.__BREADCRUMB = []; };
  }, []);

  function getTestsByCategory(categoryKey: string) {
    return testOptions.filter(o => o.parent === categoryKey);
  }

  function onCategoryChange(categoryKey: string, checked: boolean) {
    setTestOptions(prev => prev.map(o => o.parent === categoryKey ? { ...o, checked } : o));
  }

  function onCheckboxChange(testKey: string, checked: boolean) {
    setTestOptions(prev => prev.map(o => o.key === testKey ? { ...o, checked } : o));
  }

  function getSelectedTests() {
    return testOptions.filter(o => o.checked).map(o => ({ key: o.key, value: o.label }));
  }

  function getSelectedCountByCategory(categoryKey: string) {
    return getTestsByCategory(categoryKey).filter(t => t.checked).length;
  }

  function onActiveToggle(checked: boolean) {
    setActive(checked);
    setTestOptions(prev => prev.map(o => ({ ...o, checked })));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.warning('Test Suite Name is required'); return; }
    const selected = getSelectedTests();
    if (selected.length === 0) { toast.warning('Please select at least one test'); return; }

    try {
      const resp = await svc.createTestSuite({ testSuitName: name.trim(), description: description.trim(), testPlan: selected, active });
      if (resp && resp.status) {
        toast.success('Test Suite created successfully');
        navigate('/test-suites/listing');
      } else {
        const msg = (resp && typeof resp === 'object' && 'message' in resp) ? String((resp as { message?: unknown }).message) : 'Failed to create test suite';
        toast.error(msg);
      }
    } catch (err: unknown) {
      const msg = ((): string => {
        if (!err) return 'Failed to create test suite';
        if (typeof err === 'string') return err;
        if (typeof err === 'object' && err !== null && 'message' in err) return String((err as { message?: unknown }).message);
        return 'Failed to create test suite';
      })();
      toast.error(msg);
    }
  }

  return (
    <div className="container-fluid pt-3">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Add Test Suite</h3>
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="row">
              <div className="col-md-6">
                <input className="form-control mb-2" placeholder="Test Suite Name" value={name} onChange={(e) => setName(e.target.value)} />
                <textarea className="form-control mb-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>

            {/* Active checkbox below the description */}
            <div className="row mt-2">
              <div className="col-12 d-flex justify-content-center">
                <div className="form-check d-flex align-items-center">
                  <input id="active-toggle" checked={active} onChange={(e) => onActiveToggle(e.target.checked)} className="form-check-input" type="checkbox" />
                  <label htmlFor="active-toggle" className="form-check-label ms-2 mb-0">Active (check/uncheck all tests)</label>
                </div>
              </div>
            </div>

            {/* Centered Save/Cancel buttons below the Active checkbox */}
            <div className="row mt-3">
              <div className="col-12 d-flex justify-content-center">
                <button className="btn btn-dark-custom" type="submit">Save</button>
                <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/test-suites/listing')}>Cancel</button>
              </div>
            </div>

            {/* Tests grid - placed below Save/Cancel per UX request */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="row mb-2">
                  <div className="col-md-6"><h6 className="mb-0">Default Tests</h6></div>
                  <div className="col-md-6"><h6 className="mb-0">Audio Tests</h6></div>
                </div>
                <div className="row">
                  {testCategories.map((cat) => (
                    <div key={cat.key} className="col-md-6 mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className="text-dark">{cat.label}</strong>
                        {cat.hasParentCheckbox && (
                          <input
                            type="checkbox"
                            checked={getSelectedCountByCategory(cat.key) === cat.tests.length && cat.tests.length > 0}
                            onChange={(e) => onCategoryChange(cat.key, e.target.checked)}
                          />
                        )}
                      </div>
                      <div className="ps-3">
                        {getTestsByCategory(cat.key).map(t => (
                          <div key={t.key} className="form-check mb-1">
                            <input
                              className="form-check-input"
                              id={`t-${t.key}`}
                              type="checkbox"
                              checked={t.checked}
                              onChange={(e) => onCheckboxChange(t.key, e.target.checked)}
                            />
                            <label className="form-check-label ms-2" htmlFor={`t-${t.key}`}>{t.label}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
