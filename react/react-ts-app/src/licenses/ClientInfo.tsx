import { useEffect, useState } from 'react';
import LicenseService from './license.service';
import { AuthConfig } from '../utils/helper';

export default function ClientInfo() {
  const [licensesDetail, setLicensesDetail] = useState<unknown[]>([]);

  useEffect(() => {
    (async () => {
      const res = await LicenseService.getLicenseInfo(String(AuthConfig.CLIENT_ID));
      setLicensesDetail(res?.status ? res.data : []);
    })();
  }, []);

  return (
    <div className="container-fluid mt-3">
      <h3>License Info</h3>
      <div>
        { (licensesDetail as Array<Record<string, unknown>>).map(l => (
            <div key={String(l['id'] ?? '')} className="mb-2">
              <strong>{String(l['name'] ?? l['title'] ?? '')}</strong>: {String(l['runningTotal'] ?? '')}
            </div>
          ))}
      </div>
    </div>
  );
}
