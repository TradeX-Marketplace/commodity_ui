import React from 'react';

export function StatCardSkeleton() {
  return (
    <div className="stat-card skeleton-container">
      <div className="skeleton skeleton-icon" />
      <div className="skeleton-content">
        <div className="skeleton skeleton-text skeleton-w-40" />
        <div className="skeleton skeleton-title skeleton-w-60" />
        <div className="skeleton skeleton-subtext skeleton-w-80" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="table-skeleton-container">
      <div className="table-skeleton-header">
        <div className="skeleton skeleton-search" />
        <div className="skeleton skeleton-button" />
      </div>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i}>
                  <div className="skeleton skeleton-header-cell" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx}>
                {Array.from({ length: columns }).map((_, cIdx) => (
                  <td key={cIdx}>
                    <div className="skeleton skeleton-cell" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="chat-skeleton">
      <div className="skeleton-chat-bubble assistant">
        <div className="skeleton skeleton-text skeleton-w-80" />
        <div className="skeleton skeleton-text skeleton-w-60" />
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ type = 'table', ...props }) {
  if (type === 'stat') return <StatCardSkeleton {...props} />;
  if (type === 'chat') return <ChatSkeleton {...props} />;
  return <TableSkeleton {...props} />;
}
