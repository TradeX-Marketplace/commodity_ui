import React from 'react';
import { AlertCircleIcon, RefreshIcon, ServerIcon } from './Icons';

export default function ErrorState({
  title = "API Request Error",
  message,
  onRetry,
  endpointName,
  port = 9090,
  upstreamPort = 7070,
  upstreamPath,
  isMissingMapping = false,
  isNetworkError = false,
  onToggleUpstream,
  isUpstreamDirect = false,
}) {
  return (
    <div className="error-state-card">
      <div className="error-header">
        <div className="error-icon-wrapper">
          <AlertCircleIcon className="error-icon" size={24} />
        </div>
        <div className="error-title-wrapper">
          <h3 className="error-title">{title}</h3>
          <p className="error-message">
            {message || "Unable to retrieve data from the backend service."}
          </p>
        </div>
      </div>

      {/* Backend Architectural Diagnostic Alert */}
      {(isMissingMapping || isNetworkError || endpointName) && (
        <div className="error-diagnostic-panel">
          <div className="diagnostic-header">
            <ServerIcon size={16} />
            <span>Backend Architecture Diagnostic</span>
          </div>
          <ul className="diagnostic-details">
            <li>
              <strong>Active Backend Base:</strong> <code>http://localhost:{isUpstreamDirect ? upstreamPort : port}</code>
            </li>
            {endpointName && (
              <li>
                <strong>Target Endpoint:</strong> <code>{endpointName}</code>
              </li>
            )}
            {isMissingMapping && (
              <li className="diagnostic-warning">
                <strong>Missing Controller Mapping:</strong> Spring Boot project <code>Commodity_Admin_AI</code> (Port {port}) does not currently expose a REST controller mapping for <code>{endpointName}</code>.
                In <code>MarketplaceApiClient.java</code>, this endpoint maps upstream to <code>http://localhost:{upstreamPort}{upstreamPath || endpointName}</code>.
              </li>
            )}
            {isNetworkError && (
              <li className="diagnostic-info">
                <strong>Connection Tip:</strong> Check that the Spring Boot server is started and that CORS headers (e.g. <code>@CrossOrigin</code>) permit requests from this origin.
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="error-actions">
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn btn-primary btn-sm">
            <RefreshIcon size={14} />
            <span>Retry Request</span>
          </button>
        )}

        {onToggleUpstream && (
          <button
            type="button"
            onClick={onToggleUpstream}
            className={`btn btn-outline btn-sm ${isUpstreamDirect ? 'btn-active' : ''}`}
            title="Inspect upstream Marketplace backend directly for testing"
          >
            <ServerIcon size={14} />
            <span>
              {isUpstreamDirect
                ? `Switch back to Admin AI (Port ${port})`
                : `Test Upstream Direct (Port ${upstreamPort})`}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
