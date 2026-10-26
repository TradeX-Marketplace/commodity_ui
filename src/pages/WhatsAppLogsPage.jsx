import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import ErrorState from '../components/common/ErrorState';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { fetchWhatsAppLogs } from '../services/api';
import { ServerIcon } from '../components/common/Icons';

export default function WhatsAppLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [todayOnly, setTodayOnly] = useState(false);
  const [useUpstreamDirect, setUseUpstreamDirect] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWhatsAppLogs({
        status: statusFilter,
        todayOnly,
        useUpstreamDirect,
      });
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, todayOnly, useUpstreamDirect]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns = [
    {
      key: 'id',
      label: 'ID',
      width: '70px',
      sortable: true,
    },
    {
      key: 'phoneNumber',
      label: 'Recipient Phone',
      sortable: true,
      render: (val) => (
        <span className="phone-badge">
          {val ? `${val.slice(0, 4)}***${val.slice(-3)}` : '--'}
        </span>
      ),
    },
    {
      key: 'messageType',
      label: 'Dispatch Type',
      sortable: true,
      render: (val) => <span className="type-tag">{val || 'STANDARD'}</span>,
    },
    {
      key: 'commodityName',
      label: 'Commodity',
      sortable: true,
      render: (val) => val || 'General',
    },
    {
      key: 'message',
      label: 'Message Body',
      render: (val) => <span className="cell-truncate" title={val}>{val || '--'}</span>,
    },
    {
      key: 'status',
      label: 'Delivery Status',
      sortable: true,
      render: (val) => {
        const s = (val || '').toUpperCase();
        const variant =
          s === 'DELIVERED' || s === 'SENT'
            ? 'success'
            : s === 'FAILED'
            ? 'danger'
            : s === 'PENDING'
            ? 'warning'
            : 'neutral';
        return <Badge variant={variant}>{val || 'SENT'}</Badge>;
      },
    },
    {
      key: 'sentAt',
      label: 'Dispatched At',
      sortable: true,
      render: (val) => (val ? new Date(val).toLocaleString() : '--'),
    },
  ];

  return (
    <div className="data-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-heading">WhatsApp Activity & Dispatch Logs</h2>
          <p className="page-subheading">
            Track automated WhatsApp notifications, daily price broadcasts, and delivery confirmations.
          </p>
        </div>

        <div className="page-actions-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-input"
          >
            <option value="">All Statuses</option>
            <option value="DELIVERED">Delivered</option>
            <option value="SENT">Sent</option>
            <option value="FAILED">Failed</option>
            <option value="PENDING">Pending</option>
          </select>

          <label className="checkbox-filter-label">
            <input
              type="checkbox"
              checked={todayOnly}
              onChange={(e) => setTodayOnly(e.target.checked)}
            />
            <span>Today's Dispatches</span>
          </label>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setUseUpstreamDirect((prev) => !prev)}
            title="Toggle data source"
          >
            <ServerIcon size={14} />
            <span>
              {useUpstreamDirect
                ? 'Using Upstream: Port 7070'
                : 'Using Admin AI: Port 9090'}
            </span>
          </button>
        </div>
      </div>

      {loading && <LoadingSkeleton type="table" rows={6} columns={7} />}

      {!loading && error && (
        <ErrorState
          title="WhatsApp Logs API Unavailable"
          message={error.message}
          endpointName="/api/ai/whatsapp-logs"
          port={9090}
          upstreamPort={7070}
          upstreamPath="/api/ai/whatsapp-logs"
          isMissingMapping={error.status === 404}
          isNetworkError={error.isNetworkError}
          onRetry={loadData}
          isUpstreamDirect={useUpstreamDirect}
          onToggleUpstream={() => setUseUpstreamDirect((prev) => !prev)}
        />
      )}

      {!loading && !error && (
        <DataTable
          columns={columns}
          data={logs}
          title="WhatsApp Message History"
          subtitle={`Total: ${logs.length} dispatches logged`}
          searchPlaceholder="Search logs by phone number, message type, or status..."
          emptyMessage="No WhatsApp log entries found."
        />
      )}
    </div>
  );
}
