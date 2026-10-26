import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon, MaximizeIcon } from './Icons';

/**
 * Pure SVG Trend Chart component with full-screen expansion modal.
 * Plots time-series data without requiring heavy external chart libraries.
 * Supported data format: Array<{ date: string, rate: number | string }>
 */
export default function TrendChart({
  data = [],
  title = "Rate Trend Analysis",
  currency = "₹",
  unit = "Quintal",
  height = 240,
  emptyMessage = "Insufficient time-series rate data to render a trend chart.",
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [expandedHoveredPoint, setExpandedHoveredPoint] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const previousActiveElementRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Validate and parse points
  const points = (data || [])
    .map((item) => {
      const rateVal = parseFloat(item.rate);
      return {
        date: item.date || item.rateDate || 'N/A',
        rate: isNaN(rateVal) ? null : rateVal,
        commodity: item.commodityName || item.commodity || '',
        location: item.location || '',
        unit: item.unit || unit,
      };
    })
    .filter((pt) => pt.rate !== null);

  // Open modal handler
  const handleOpenModal = (e) => {
    if (points.length < 2) return;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    previousActiveElementRef.current = document.activeElement;
    setIsExpanded(true);
  };

  // Close modal handler
  const handleCloseModal = () => {
    setIsExpanded(false);
    setExpandedHoveredPoint(null);
    if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
      setTimeout(() => {
        try {
          previousActiveElementRef.current?.focus();
        } catch (err) {
          // Ignore focus errors
        }
      }, 50);
    }
  };

  // Close when clicking the dark backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  // Focus management, body overflow locking, and Escape key listener
  useEffect(() => {
    if (!isExpanded) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the close button for accessibility
    if (closeBtnRef.current) {
      closeBtnRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        e.stopPropagation();
        handleCloseModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded]);

  if (points.length < 2) {
    return (
      <div className="trend-chart-card">
        <div className="trend-chart-header">
          <h4 className="chart-title">{title}</h4>
        </div>
        <div className="trend-chart-empty">
          <p className="empty-chart-text">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Calculate scales
  const minRate = Math.min(...points.map((p) => p.rate));
  const maxRate = Math.max(...points.map((p) => p.rate));
  // Add 10% padding to rate axis
  const ratePadding = Math.max((maxRate - minRate) * 0.1, 10);
  const yMin = Math.max(0, minRate - ratePadding);
  const yMax = maxRate + ratePadding;

  const dateRangeStr = points.length >= 2
    ? `${points[0].date} – ${points[points.length - 1].date}`
    : (points[0]?.date || 'N/A');

  // ==========================================
  // NORMAL VIEW SCALES & PATHS
  // ==========================================
  const svgWidth = 700;
  const svgHeight = height;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  const getX = (index) => {
    return padding.left + (index / (points.length - 1)) * innerWidth;
  };

  const getY = (val) => {
    const ratio = (val - yMin) / (yMax - yMin || 1);
    return padding.top + innerHeight - ratio * innerHeight;
  };

  const linePath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(p.rate).toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${getX(points.length - 1).toFixed(1)} ${(padding.top + innerHeight).toFixed(1)} L ${getX(0).toFixed(1)} ${(padding.top + innerHeight).toFixed(1)} Z`;

  const yTicks = [0, 0.33, 0.66, 1].map((ratio) => {
    const val = yMin + ratio * (yMax - yMin);
    return {
      value: Math.round(val),
      y: getY(val),
    };
  });

  // ==========================================
  // EXPANDED FULL-SCREEN MODAL SCALES & PATHS
  // ==========================================
  const expSvgWidth = 1100;
  const expSvgHeight = 540;
  const expPadding = { top: 35, right: 50, bottom: 65, left: 85 };
  const expInnerWidth = expSvgWidth - expPadding.left - expPadding.right;
  const expInnerHeight = expSvgHeight - expPadding.top - expPadding.bottom;

  const getExpX = (index) => {
    return expPadding.left + (index / (points.length - 1)) * expInnerWidth;
  };

  const getExpY = (val) => {
    const ratio = (val - yMin) / (yMax - yMin || 1);
    return expPadding.top + expInnerHeight - ratio * expInnerHeight;
  };

  const expLinePath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getExpX(idx).toFixed(1)} ${getExpY(p.rate).toFixed(1)}`)
    .join(' ');

  const expAreaPath = `${expLinePath} L ${getExpX(points.length - 1).toFixed(1)} ${(expPadding.top + expInnerHeight).toFixed(1)} L ${getExpX(0).toFixed(1)} ${(expPadding.top + expInnerHeight).toFixed(1)} Z`;

  const expYTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const val = yMin + ratio * (yMax - yMin);
    return {
      value: Math.round(val),
      y: getExpY(val),
    };
  });

  // Render expanded modal popup
  const renderExpandedModal = () => {
    if (!isExpanded) return null;

    const modalContent = (
      <div
        className="chart-modal-backdrop"
        onClick={handleBackdropClick}
        role="presentation"
      >
        <div
          className="chart-modal-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="expanded-chart-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="chart-modal-header">
            <div className="chart-modal-header-left">
              <div className="chart-modal-title-row">
                <h3 id="expanded-chart-title" className="chart-modal-title">
                  {title}
                </h3>
                <span className="chart-modal-unit-badge">{currency} per {unit}</span>
              </div>
              <div className="chart-modal-subtitle">
                <span>Date Range: <strong>{dateRangeStr}</strong></span>
                <span className="dot-separator">&bull;</span>
                <span>Records: <strong>{points.length} data points</strong></span>
              </div>
            </div>

            <div className="chart-modal-header-right">
              <div className="chart-legend">
                <span className="legend-indicator" />
                <span className="legend-label">Rate ({currency} / {unit})</span>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                className="chart-modal-close-btn"
                onClick={handleCloseModal}
                aria-label="Close full-screen chart"
                title="Close (Esc)"
              >
                <CloseIcon size={18} />
              </button>
            </div>
          </div>

          {/* Modal Stats Bar */}
          <div className="chart-modal-stats-bar">
            <div className="chart-modal-stat-pill">
              <span className="stat-pill-label">Lowest:</span>
              <span className="stat-pill-value">{currency}{Math.round(minRate).toLocaleString()}</span>
            </div>
            <div className="chart-modal-stat-pill">
              <span className="stat-pill-label">Highest:</span>
              <span className="stat-pill-value">{currency}{Math.round(maxRate).toLocaleString()}</span>
            </div>
            <div className="chart-modal-stat-pill">
              <span className="stat-pill-label">Latest Rate:</span>
              <span className="stat-pill-value highlight">{currency}{Math.round(points[points.length - 1].rate).toLocaleString()}</span>
            </div>
            <div className="chart-modal-stat-pill">
              <span className="stat-pill-label">Unit:</span>
              <span className="stat-pill-value">{currency} / {unit}</span>
            </div>
          </div>

          {/* Modal Plotting Body */}
          <div className="chart-modal-body">
            <div className="expanded-chart-svg-container">
              <svg
                viewBox={`0 0 ${expSvgWidth} ${expSvgHeight}`}
                className="expanded-trend-chart-svg"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id="expandedChartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Expanded Grid lines and Y axis labels */}
                {expYTicks.map((tick, i) => (
                  <g key={`exp-grid-${i}`}>
                    <line
                      x1={expPadding.left}
                      y1={tick.y}
                      x2={expSvgWidth - expPadding.right}
                      y2={tick.y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={expPadding.left - 12}
                      y={tick.y + 5}
                      textAnchor="end"
                      className="expanded-chart-axis-label-y"
                    >
                      {currency}{tick.value.toLocaleString()}
                    </text>
                  </g>
                ))}

                {/* Expanded Area under curve */}
                <path d={expAreaPath} fill="url(#expandedChartGradient)" />

                {/* Expanded Line curve */}
                <path
                  d={expLinePath}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Expanded Data Points & Direct Value Labels */}
                {points.map((pt, idx) => {
                  const cx = getExpX(idx);
                  const cy = getExpY(pt.rate);
                  const isHovered = expandedHoveredPoint?.idx === idx;

                  return (
                    <g
                      key={`exp-pt-${idx}`}
                      onMouseEnter={() => setExpandedHoveredPoint({ ...pt, idx, x: cx, y: cy })}
                      onMouseLeave={() => setExpandedHoveredPoint(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Pulse ring on hover */}
                      {isHovered && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={12}
                          fill="#2563eb"
                          fillOpacity="0.2"
                        />
                      )}

                      {/* Point Circle */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? 7 : 5}
                        fill="#ffffff"
                        stroke="#2563eb"
                        strokeWidth={isHovered ? 3 : 2.5}
                        className="chart-point"
                      />

                      {/* Explicit Rate Value displayed cleanly above point */}
                      <text
                        x={cx}
                        y={cy - 12}
                        textAnchor="middle"
                        className="expanded-chart-value-label"
                      >
                        {currency}{Math.round(pt.rate).toLocaleString()}
                      </text>

                      {/* Date label along X axis */}
                      <text
                        x={cx}
                        y={expPadding.top + expInnerHeight + 25}
                        textAnchor="middle"
                        className="expanded-chart-axis-label-x"
                      >
                        {pt.date}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Expanded Hover Tooltip */}
              {expandedHoveredPoint && (
                <div
                  className="chart-tooltip expanded-tooltip"
                  style={{
                    left: `${(expandedHoveredPoint.x / expSvgWidth) * 100}%`,
                    top: `${(expandedHoveredPoint.y / expSvgHeight) * 100}%`,
                  }}
                >
                  <div className="tooltip-date">{expandedHoveredPoint.date}</div>
                  <div className="tooltip-rate">
                    {currency}{expandedHoveredPoint.rate.toLocaleString()} / {expandedHoveredPoint.unit || unit}
                  </div>
                  {expandedHoveredPoint.commodity && (
                    <div className="tooltip-commodity">
                      {expandedHoveredPoint.commodity} {expandedHoveredPoint.location ? `• ${expandedHoveredPoint.location}` : ''}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer Hint */}
          <div className="chart-modal-footer">
            <span className="modal-keyboard-hint">
              Press <kbd>Esc</kbd> or click outside to close full-screen view
            </span>
          </div>
        </div>
      </div>
    );

    if (typeof document !== 'undefined' && document.body) {
      return createPortal(modalContent, document.body);
    }
    return modalContent;
  };

  return (
    <>
      <div
        className="trend-chart-card"
        onDoubleClick={handleOpenModal}
        title="Double-click to expand to full screen"
      >
        <div className="trend-chart-header">
          <div>
            <h4 className="chart-title">{title}</h4>
            <span className="chart-subtitle">
              Range: {currency}{Math.round(minRate).toLocaleString()} - {currency}{Math.round(maxRate).toLocaleString()} per {unit}
            </span>
          </div>
          <div className="trend-chart-header-actions">
            <div className="chart-legend">
              <span className="legend-indicator" />
              <span className="legend-label">Rate ({currency} / {unit})</span>
            </div>
            <button
              type="button"
              className="chart-expand-btn"
              onClick={handleOpenModal}
              aria-label="Expand chart to full screen"
              title="Expand chart (or double-click anywhere)"
            >
              <MaximizeIcon size={14} />
            </button>
          </div>
        </div>

        <div className="trend-chart-svg-container">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="trend-chart-svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines and Y axis labels */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={tick.y}
                  x2={svgWidth - padding.right}
                  y2={tick.y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={tick.y + 4}
                  textAnchor="end"
                  className="chart-axis-label"
                >
                  {currency}{tick.value}
                </text>
              </g>
            ))}

            {/* Area under curve */}
            <path d={areaPath} fill="url(#chartGradient)" />

            {/* Line curve */}
            <path
              d={linePath}
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            {points.map((pt, idx) => {
              const cx = getX(idx);
              const cy = getY(pt.rate);
              const isHovered = hoveredPoint?.idx === idx;
              const showDateLabel =
                points.length <= 8 ||
                idx === 0 ||
                idx === points.length - 1 ||
                idx % Math.ceil(points.length / 6) === 0;

              return (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredPoint({ ...pt, idx, x: cx, y: cy })}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 6 : 4}
                    fill="#ffffff"
                    stroke="#2563eb"
                    strokeWidth={isHovered ? 3 : 2}
                    className="chart-point"
                  />
                  {/* Date labels along X axis */}
                  {showDateLabel && (
                    <text
                      x={cx}
                      y={padding.top + innerHeight + 20}
                      textAnchor="middle"
                      className="chart-axis-label"
                    >
                      {pt.date}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip */}
          {hoveredPoint && (
            <div
              className="chart-tooltip"
              style={{
                left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                top: `${(hoveredPoint.y / svgHeight) * 100}%`,
              }}
            >
              <div className="tooltip-date">{hoveredPoint.date}</div>
              <div className="tooltip-rate">
                {currency}{hoveredPoint.rate.toLocaleString()} / {hoveredPoint.unit || unit}
              </div>
              {hoveredPoint.commodity && (
                <div className="tooltip-commodity">
                  {hoveredPoint.commodity} {hoveredPoint.location ? `• ${hoveredPoint.location}` : ''}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Double click hint footer */}
        <div className="trend-chart-footer-hint">
          <span className="chart-hint-text">
            <MaximizeIcon size={11} className="hint-icon" />
            Double-click to expand
          </span>
        </div>
      </div>

      {/* Full-screen popup modal */}
      {renderExpandedModal()}
    </>
  );
}
