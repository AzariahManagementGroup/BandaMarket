import React, { useState, useEffect } from "react";
import { getApiUrl } from "@/config";

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl('/api/activity_logs.php'), { headers: { 'Authorization': `Bearer ${localStorage.getItem('camemark_token')}` } })
      .then(res => res.json())
      .then(data => { if (data.success) setLogs(data.logs); })
      .catch(e => console.error('Error fetching logs', e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Global Activity Logs</h3>
        <p className="text-muted-foreground text-sm">Monitor platform-wide admin and user actions.</p>
      </div>
      <div className="bg-card rounded-xl border p-4 space-y-4">
        {loading ? <p>Loading logs...</p> : logs.map((log: any) => (
          <div key={log.id} className="border-b pb-4 last:border-b-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{log.adminEmail}</span>
                <span className="text-xs bg-muted px-2 py-0.5 rounded">{log.actionType}</span>
              </div>
              <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm mt-1 text-muted-foreground">{log.description}</p>
            {log.targetEntity && <p className="text-xs mt-1 font-mono text-primary">Target: {log.targetEntity} (ID: {log.targetId})</p>}
          </div>
        ))}
        {!loading && logs.length === 0 && <p className="text-sm text-muted-foreground italic">No activity logs found.</p>}
      </div>
    </div>
  );
};

export default AdminActivityLogs;
