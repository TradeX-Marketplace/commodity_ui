import React from 'react';
import Badge from './Badge';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeVariant = 'neutral',
  isUnavailable = false,
  unavailableReason,
  trend,
  trendPositive = true,
  onClick,
}) {
  return (
    <div
      className={`stat-card ${onClick ? 'stat-card-clickable' : ''} ${isUnavailable ? 'stat-card-unavailable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className="stat-card-icon-container">
            <Icon className="stat-card-icon" size={20} />
          </div>
        )}
      </div>

      <div className="stat-card-body">
        {isUnavailable ? (
          <div className="stat-card-unavailable-view">
            <span className="stat-card-value unavailable-text">N/A</span>
            <Badge variant="warning" size="sm">
              {badgeText || "Unavailable"}
            </Badge>
          </div>
        ) : (
          <div className="stat-card-value-container">
            <span className="stat-card-value">
              {value !== undefined && value !== null ? value : '--'}
            </span>
            {badgeText && (
              <Badge variant={badgeVariant} size="sm">
                {badgeText}
              </Badge>
            )}
          </div>
        )}

        {(subtitle || unavailableReason || trend) && (
          <div className="stat-card-footer">
            {isUnavailable && unavailableReason ? (
              <span className="stat-card-subtext warning-text">{unavailableReason}</span>
            ) : subtitle ? (
              <span className="stat-card-subtext">{subtitle}</span>
            ) : null}

            {!isUnavailable && trend && (
              <span className={`stat-card-trend ${trendPositive ? 'trend-up' : 'trend-down'}`}>
                {trend}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
