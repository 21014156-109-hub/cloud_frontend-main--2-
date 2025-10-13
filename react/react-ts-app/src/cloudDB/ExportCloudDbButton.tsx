import { useState } from 'react';
import { CloudDBService } from './cloudDB.service';

const svc = new CloudDBService();

type Props = {
  clientId: number | string;
  type: string;
  searchText?: string;
  searchType?: string;
  columns?: { name: string; prop: string; checked?: boolean }[];
  className?: string;
};

export default function ExportCloudDbButton({ clientId, type, searchText = '', searchType = '', columns = [], className }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const blob = await svc.exportReport({ clientId, type, searchText, searchType, columns });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clouddb_export_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
      // Keep toast handling to caller; here we only log.
      alert('Export failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={handleExport} disabled={loading} className={className}>
      {loading ? 'Exporting...' : 'Export'}
    </button>
  );
}
