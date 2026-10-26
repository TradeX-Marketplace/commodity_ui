import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import TrendChart from './TrendChart';

describe('TrendChart Full-Screen Popup Feature', () => {
  const sampleData = [
    { date: '2026-10-01', rate: 4180.0, commodity: 'Soybean', location: 'Sangli', unit: 'Quintal' },
    { date: '2026-10-02', rate: 4200.0, commodity: 'Soybean', location: 'Sangli', unit: 'Quintal' },
    { date: '2026-10-03', rate: 4210.0, commodity: 'Soybean', location: 'Sangli', unit: 'Quintal' },
    { date: '2026-10-04', rate: 4225.0, commodity: 'Soybean', location: 'Sangli', unit: 'Quintal' },
    { date: '2026-10-05', rate: 4235.0, commodity: 'Soybean', location: 'Sangli', unit: 'Quintal' },
    { date: '2026-10-06', rate: 4240.0, commodity: 'Soybean', location: 'Sangli', unit: 'Quintal' },
    { date: '2026-10-07', rate: 4250.0, commodity: 'Soybean', location: 'Sangli', unit: 'Quintal' },
  ];

  afterEach(() => {
    document.body.style.overflow = '';
  });

  test('renders chart with title, range, maximize button, and subtle double-click hint', () => {
    render(
      <TrendChart
        data={sampleData}
        title="Soybean Price Trend – Sangli"
        unit="Quintal"
      />
    );

    expect(screen.getByText('Soybean Price Trend – Sangli')).toBeInTheDocument();
    expect(screen.getByText(/Range: ₹4,180 - ₹4,250 per Quintal/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Expand chart to full screen/i })).toBeInTheDocument();
    expect(screen.getByText(/Double-click to expand/i)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('opens full-screen modal popup on double-clicking anywhere on the chart card', () => {
    const { container } = render(
      <TrendChart
        data={sampleData}
        title="Soybean Price Trend – Sangli"
        unit="Quintal"
      />
    );

    const chartCard = container.querySelector('.trend-chart-card');
    expect(chartCard).toBeInTheDocument();

    // Double-click on chart card
    fireEvent.doubleClick(chartCard);

    // Verify modal is open
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'expanded-chart-title');

    // Title and stats inside dialog
    expect(within(dialog).getByRole('heading', { name: 'Soybean Price Trend – Sangli' })).toBeInTheDocument();
    expect(within(dialog).getByText(/Date Range:/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/2026-10-01 – 2026-10-07/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Lowest:/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Highest:/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Latest Rate:/i)).toBeInTheDocument();

    // Body overflow is locked
    expect(document.body.style.overflow).toBe('hidden');
  });

  test('opens full-screen modal popup via maximize button', () => {
    render(
      <TrendChart
        data={sampleData}
        title="Soybean Price Trend – Sangli"
        unit="Quintal"
      />
    );

    const maxBtn = screen.getByRole('button', { name: /Expand chart to full screen/i });
    fireEvent.click(maxBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
  });

  test('closes popup when close button is clicked and unlocks scrolling', () => {
    render(
      <TrendChart
        data={sampleData}
        title="Soybean Price Trend – Sangli"
        unit="Quintal"
      />
    );

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /Expand chart to full screen/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click close (×) button
    const closeBtn = screen.getByRole('button', { name: /Close full-screen chart/i });
    fireEvent.click(closeBtn);

    // Verify modal closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
  });

  test('closes popup when Escape key is pressed', () => {
    render(
      <TrendChart
        data={sampleData}
        title="Soybean Price Trend – Sangli"
        unit="Quintal"
      />
    );

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /Expand chart to full screen/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });

    // Verify modal closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
  });

  test('closes popup when clicking backdrop, but NOT when clicking inside the chart dialog', () => {
    const { baseElement } = render(
      <TrendChart
        data={sampleData}
        title="Soybean Price Trend – Sangli"
        unit="Quintal"
      />
    );

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /Expand chart to full screen/i }));
    const dialog = screen.getByRole('dialog');
    const backdrop = baseElement.querySelector('.chart-modal-backdrop');

    // Click inside the dialog: must NOT close
    fireEvent.click(dialog);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click on the backdrop overlay: must close
    fireEvent.click(backdrop);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('does not open modal when insufficient data points are provided', () => {
    const { container } = render(
      <TrendChart
        data={[{ date: '2026-10-01', rate: 4180.0 }]}
        title="Soybean Price Trend"
      />
    );

    const chartCard = container.querySelector('.trend-chart-card');
    fireEvent.doubleClick(chartCard);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText(/Insufficient time-series rate data/i)).toBeInTheDocument();
  });
});
