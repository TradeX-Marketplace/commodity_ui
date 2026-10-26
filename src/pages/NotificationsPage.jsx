import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../components/common/DataTable';
import Badge from '../components/common/Badge';
import ErrorState from '../components/common/ErrorState';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { fetchNotifications } from '../services/api';
import { ServerIcon } from '../components/common/Icons';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todayOnly, setTodayOnly] = useState(false);
  const [useUpstreamDirect, setUseUpstreamDirect] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications({ todayOnly, useUpstreamDirect });
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [todayOnly, useUpstreamDirect]);

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
      key: 'title',
      label: 'Notification Title',
      sortable: true,
      render: (val) => <strong>{val || '--'}</strong>,
    },
    {
      key: 'type',
      label: 'Event Type',
      sortable: true,
      render: (val) => <span className="type-tag">{val || 'GENERAL'}</span>,
    },
    {
      key: 'commodityName',
      label: 'Commodity',
      sortable: true,
      render: (val) => val || 'Market Wide',
    },
    {
      key: 'message',
      label: 'Message Details',
      render: (val) => <span className="cell-truncate" title={val}>{val || '--'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => {
        const s = (val || '').toUpperCase();
        const variant =
          s === 'SENT' || s === 'DELIVERED'
            ? 'success'
            : s === 'READ'
            ? 'neutral'
            : s === 'UNREAD'
            ? 'warning'
            : 'info';
        return <Badge variant={variant}>{val || 'ACTIVE'}</Badge>;
      },
    },
    {
      key: 'createdAt',
      label: 'Timestamp',
      sortable: true,
      render: (val) => (val ? new Date(val).toLocaleString() : '--'),
    },
  ];

  return (
    <div className="data-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-heading">System & Marketplace Notifications</h2>
          <p className="page-subheading">
            Audit rate alerts, demand notifications, and automated market dispatches.
          </p>
        </div>

        <div className="page-actions-group">
          <label className="checkbox-filter-label">
            <input
              type="checkbox"
              checked={todayOnly}
              onChange={(e) => setTodayOnly(e.target.checked)}
            />
            <span>Today's Alerts Only</span>
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
          title="Notifications API Unavailable"
          message={error.message}
          endpointName="/api/ai/notifications"
          port={9090}
          upstreamPort={7070}
          upstreamPath="/api/ai/notifications"
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
          data={notifications}
          title="Notification Audit Trail"
          subtitle={`Total: ${notifications.length} logged events`}
          searchPlaceholder="Search notifications by title, type, or commodity..."
          emptyMessage="No notifications found in log."
        />
      )}
    </div>
  );
}
