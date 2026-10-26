import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import OrderExplorer, { matchesOrderSearch } from './OrderExplorer';
import * as api from '../../services/api';

describe('OrderExplorer Component', () => {
  const mockOrders = [
    {
      id: 101,
      buyerName: 'Ramesh Agro',
      buyerPhone: '+919876543210',
      commodityName: 'Soybean',
      quantity: 50.0,
      unit: 'Quintal',
      pricePerUnit: 4200.0,
      totalAmount: 210000.0,
      marketLocation: 'Sangli APMC',
      deliveryLocation: 'Pune Warehouse',
      status: 'CONFIRMED',
      createdAt: '2026-10-05T10:30:00Z',
    },
    {
      id: 102,
      buyerName: 'Kisan Traders',
      buyerPhone: '+919123456789',
      commodityName: 'Wheat',
      quantity: 100.0,
      unit: 'Quintal',
      pricePerUnit: 2500.0,
      totalAmount: 250000.0,
      marketLocation: 'Nagpur APMC',
      deliveryLocation: 'Mumbai Port',
      status: 'COMPLETED',
      createdAt: '2026-10-06T14:15:00Z',
    },
    {
      id: 103,
      buyerName: 'Modern Mills',
      buyerPhone: '+919988776655',
      commodityName: 'Soybean',
      quantity: 30.0,
      unit: 'Quintal',
      pricePerUnit: 4250.0,
      totalAmount: 127500.0,
      marketLocation: 'Latur Mandi',
      deliveryLocation: 'Solapur Mill',
      status: 'PLACED',
      createdAt: '2026-10-08T09:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders interactive commodity selector and defaults to "All commodities" for generic monthly query', async () => {
    jest.spyOn(api, 'fetchOrders').mockResolvedValue(mockOrders);

    const message = {
      id: 'msg-1',
      userQuestion: 'Show all orders from this month',
      content: 'Here are the matching orders.',
      displayType: 'ORDERS',
      orders: mockOrders,
      commodities: ['Soybean', 'Wheat', 'Maize', 'Cotton'],
      startDate: '2026-10-01',
      endDate: '2026-10-31',
    };

    render(<OrderExplorer message={message} lang="en" />);

    // Selector heading
    expect(
      screen.getByText('Select commodity to view orders of the month:')
    ).toBeInTheDocument();

    // Commodity buttons
    expect(screen.getByRole('tab', { name: /All commodities/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Soybean/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Wheat/i })).toBeInTheDocument();

    // Default active should be All commodities
    const allBtn = screen.getByRole('tab', { name: /All commodities/i });
    expect(allBtn).toHaveClass('active');

    // Summary cards: 3 orders, ₹5,87,500 total value, 180 Quintal
    await waitFor(() => {
      expect(screen.getByText('3 Orders')).toBeInTheDocument();
      expect(screen.getByText('Total Value: ₹5,87,500')).toBeInTheDocument();
      expect(screen.getByText(/Total Qty: 180 Quintal/i)).toBeInTheDocument();
    });

    // Check status pills
    expect(screen.getByText(/Confirmed:/i)).toBeInTheDocument();
    expect(screen.getByText(/Completed:/i)).toBeInTheDocument();
    expect(screen.getByText(/Placed:/i)).toBeInTheDocument();

    // Check table headers
    expect(screen.getByText('Order ID')).toBeInTheDocument();
    expect(screen.getByText('Buyer')).toBeInTheDocument();
    expect(screen.getByText('Commodity')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Unit Price')).toBeInTheDocument();
    expect(screen.getByText('Total Amount')).toBeInTheDocument();
    expect(screen.getByText('Market')).toBeInTheDocument();
    expect(screen.getByText('Delivery Location')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Created Date')).toBeInTheDocument();

    // Check rows rendered
    expect(screen.getByText('#101')).toBeInTheDocument();
    expect(screen.getByText('Ramesh Agro')).toBeInTheDocument();
    expect(screen.getByText('#102')).toBeInTheDocument();
    expect(screen.getByText('Kisan Traders')).toBeInTheDocument();
    expect(screen.getByText('#103')).toBeInTheDocument();
    expect(screen.getByText('Modern Mills')).toBeInTheDocument();

    // PRIVACY ENFORCEMENT: buyerPhone must NEVER be present anywhere in the document
    expect(screen.queryByText('+919876543210')).not.toBeInTheDocument();
    expect(screen.queryByText('+919123456789')).not.toBeInTheDocument();
    expect(screen.queryByText('+919988776655')).not.toBeInTheDocument();
  });

  test('auto-selects specific commodity when user query asks for that commodity', async () => {
    const soybeanOrders = mockOrders.filter((o) => o.commodityName === 'Soybean');
    jest.spyOn(api, 'fetchOrders').mockResolvedValue(soybeanOrders);

    const message = {
      id: 'msg-2',
      userQuestion: 'Show Soybean orders',
      content: 'Here are the soybean orders.',
      displayType: 'ORDERS',
      orders: soybeanOrders,
      commodities: ['Soybean'],
    };

    render(<OrderExplorer message={message} lang="en" />);

    // Soybean button should be active
    const soybeanBtn = screen.getByRole('tab', { name: /^Soybean$/i });
    expect(soybeanBtn).toHaveClass('active');

    // Summary cards reflect only Soybean orders: 2 orders, ₹3,37,500 total value, 80 Quintal
    await waitFor(() => {
      expect(screen.getByText('2 Orders')).toBeInTheDocument();
      expect(screen.getByText('Total Value: ₹3,37,500')).toBeInTheDocument();
      expect(screen.getByText(/Total Qty: 80 Quintal/i)).toBeInTheDocument();
    });

    expect(screen.getByText('#101')).toBeInTheDocument();
    expect(screen.getByText('#103')).toBeInTheDocument();
    expect(screen.queryByText('#102')).not.toBeInTheDocument();
  });

  test('clicking a commodity button updates active commodity and filters records', async () => {
    const fetchOrdersSpy = jest.spyOn(api, 'fetchOrders').mockResolvedValue(mockOrders);

    const message = {
      id: 'msg-3',
      userQuestion: 'Show all orders from this month',
      content: 'Here are all orders.',
      displayType: 'ORDERS',
      orders: mockOrders,
      commodities: ['Soybean', 'Wheat'],
    };

    render(<OrderExplorer message={message} lang="en" />);

    // Initially All commodities is active
    expect(screen.getByRole('tab', { name: /All commodities/i })).toHaveClass('active');

    // Click Wheat button
    const wheatBtn = screen.getByRole('tab', { name: /^Wheat$/i });
    fireEvent.click(wheatBtn);

    // Now Wheat button is active
    expect(wheatBtn).toHaveClass('active');

    // API called with commodity: 'Wheat' and page: 0
    await waitFor(() => {
      expect(fetchOrdersSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          commodity: 'Wheat',
          page: 0,
        })
      );
    });
  });

  test('single-click highlights row; double-click opens in-chat order details modal', async () => {
    jest.spyOn(api, 'fetchOrders').mockResolvedValue(mockOrders);
    const fetchByIdSpy = jest.spyOn(api, 'fetchOrderById').mockResolvedValue(mockOrders[0]);

    const message = {
      id: 'msg-4',
      userQuestion: 'Show all orders',
      content: 'Orders list',
      displayType: 'ORDERS',
      orders: mockOrders,
    };

    const { container } = render(<OrderExplorer message={message} lang="en" />);

    const row101 = screen.getByText('#101').closest('tr');
    expect(row101).not.toHaveClass('selected-row');

    // Single-click highlights row
    fireEvent.click(row101);
    expect(row101).toHaveClass('selected-row');
    // Modal is NOT opened on single click
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Double-click opens modal
    fireEvent.doubleClick(row101);

    await waitFor(() => {
      expect(fetchByIdSpy).toHaveBeenCalledWith(101);
    });

    // Modal dialog is displayed
    const modal = await screen.findByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText(/Order Details #101/i)).toBeInTheDocument();
    expect(within(modal).getByText('Ramesh Agro')).toBeInTheDocument();
    expect(within(modal).getByText('Sangli APMC')).toBeInTheDocument();
    expect(within(modal).getByText('Pune Warehouse')).toBeInTheDocument();
    expect(within(modal).getByText('₹2,10,000')).toBeInTheDocument();

    // PRIVACY ENFORCEMENT in modal: buyerPhone must NOT be displayed in modal
    expect(within(modal).queryByText('+919876543210')).not.toBeInTheDocument();

    // Close button dismisses modal
    const closeBtn = within(modal).getByRole('button', { name: /^Close$/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('pressing Escape key dismisses the order details modal', async () => {
    jest.spyOn(api, 'fetchOrders').mockResolvedValue(mockOrders);
    jest.spyOn(api, 'fetchOrderById').mockResolvedValue(mockOrders[1]);

    const message = {
      id: 'msg-5',
      userQuestion: 'Show all orders',
      content: 'Orders list',
      displayType: 'ORDERS',
      orders: mockOrders,
    };

    render(<OrderExplorer message={message} lang="en" />);

    const row102 = screen.getByText('#102').closest('tr');
    fireEvent.doubleClick(row102);

    const modal = await screen.findByRole('dialog');
    expect(modal).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  test('renders Hindi and Marathi localized labels properly', async () => {
    jest.spyOn(api, 'fetchOrders').mockResolvedValue(mockOrders);

    const message = {
      id: 'msg-hi',
      userQuestion: 'इस महीने के सभी ऑर्डर दिखाएं',
      content: 'ऑर्डर सूची',
      displayType: 'ORDERS',
      orders: mockOrders,
      commodities: ['Soybean', 'Wheat'],
    };

    const { rerender } = render(<OrderExplorer message={message} lang="hi" />);

    expect(screen.getByText('महीने के ऑर्डर देखने के लिए कमोडिटी चुनें:')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /सभी कमोडिटी/i })).toBeInTheDocument();
    expect(screen.getAllByText(/3 ऑर्डर/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/खरीदार/i)).toBeInTheDocument();
    expect(screen.getByText(/कुल राशि/i)).toBeInTheDocument();

    // Rerender with Marathi
    rerender(<OrderExplorer message={message} lang="mr" />);
    expect(screen.getByText('महिन्यातील ऑर्डर्स पाहण्यासाठी शेतमाल निवडा:')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /सर्व शेतमाल/i })).toBeInTheDocument();
    expect(screen.getAllByText(/3 ऑर्डर्स/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/खरेदीदार/i)).toBeInTheDocument();
  });

  test('correctly filters for Vishal Patil orders and preserves buyer filter on commodity switch', async () => {
    const vishalOrders = [
      {
        id: 49,
        buyerName: 'Vishal Patil',
        buyerPhone: '+91-9876543210',
        commodityName: 'Soybean',
        quantity: 120.0,
        unit: 'Quintal',
        pricePerUnit: 4250.0,
        totalAmount: 510000.0,
        marketLocation: 'Sangli',
        deliveryLocation: 'Kolhapur',
        status: 'CONFIRMED',
        createdAt: '2026-10-14T09:30:00Z',
      },
      {
        id: 50,
        buyerName: 'Vishal Patil',
        buyerPhone: '+91-9876543210',
        commodityName: 'Soybean',
        quantity: 80.0,
        unit: 'Quintal',
        pricePerUnit: 4200.0,
        totalAmount: 336000.0,
        marketLocation: 'Sangli',
        deliveryLocation: 'Kolhapur',
        status: 'COMPLETED',
        createdAt: '2026-10-13T14:15:00Z',
      },
    ];

    const fetchOrdersSpy = jest.spyOn(api, 'fetchOrders').mockResolvedValue(vishalOrders);

    const message = {
      id: 'msg-vishal',
      userQuestion: "Show Vishal Patil's orders",
      content: 'Found 2 matching orders for Vishal Patil.',
      displayType: 'ORDERS',
      orders: vishalOrders,
      buyerName: 'Vishal Patil',
      commodities: ['Soybean', 'Wheat', 'Maize', 'Cotton'],
    };

    render(<OrderExplorer message={message} lang="en" />);

    // Renders ONLY the 2 matching orders
    expect(screen.getByText('#49')).toBeInTheDocument();
    expect(screen.getByText('#50')).toBeInTheDocument();
    expect(screen.queryByText('#51')).not.toBeInTheDocument();

    // Summary cards: 2 Orders, ₹8,46,000 total value, 200 Quintal
    await waitFor(() => {
      expect(screen.getByText('2 Orders')).toBeInTheDocument();
      expect(screen.getByText('Total Value: ₹8,46,000')).toBeInTheDocument();
      expect(screen.getByText(/Total Qty: 200 Quintal/i)).toBeInTheDocument();
    });

    // Subtitle and table cells display Vishal Patil
    expect(screen.getAllByText('Vishal Patil').length).toBeGreaterThanOrEqual(1);

    // Clicking commodity button 'Wheat' preserves the buyer filter
    const wheatBtn = screen.getByRole('tab', { name: /^Wheat$/i });
    fireEvent.click(wheatBtn);

    await waitFor(() => {
      expect(fetchOrdersSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          commodity: 'Wheat',
          buyerName: 'Vishal Patil',
        })
      );
    });
  });

  test('calculates totals across mixed units accurately without illegal aggregation', async () => {
    const mixedOrders = [
      { id: 49, buyerName: 'Vishal Patil', commodityName: 'Soybean', quantity: 120, unit: 'Quintal', totalAmount: 510000, status: 'CONFIRMED' },
      { id: 50, buyerName: 'Vishal Patil', commodityName: 'Soybean', quantity: 80, unit: 'Quintal', totalAmount: 336000, status: 'COMPLETED' },
      { id: 51, buyerName: 'Amit Deshmukh', commodityName: 'Soybean', quantity: 150, unit: 'Quintal', totalAmount: 645000, status: 'CANCELLED' },
      { id: 52, buyerName: 'Kiran Shinde', commodityName: 'Wheat', quantity: 50, unit: 'Quintal', totalAmount: 140000, status: 'PLACED' },
      { id: 53, buyerName: 'Suresh More', commodityName: 'Maize', quantity: 200, unit: 'Quintal', totalAmount: 440000, status: 'PROCESSING' },
      { id: 54, buyerName: 'Rajesh Kadam', commodityName: 'Cotton', quantity: 40, unit: 'Bale', totalAmount: 248000, status: 'CONFIRMED' },
    ];

    jest.spyOn(api, 'fetchOrders').mockResolvedValue(mixedOrders);

    const message = {
      id: 'msg-mixed',
      userQuestion: 'Show all orders from this month',
      content: 'Here are all orders.',
      displayType: 'ORDERS',
      orders: mixedOrders,
    };

    render(<OrderExplorer message={message} lang="en" />);

    await waitFor(() => {
      expect(screen.getByText('6 Orders')).toBeInTheDocument();
      expect(screen.getByText('Total Value: ₹23,19,000')).toBeInTheDocument();
      // Total quantity must show mixed units
      expect(screen.getByText(/Total Qty: 640 \(Mixed units\)/i)).toBeInTheDocument();
    });

    // Status breakdown: Confirmed: 2, Completed: 1, Cancelled: 1, Placed: 1, Processing: 1
    expect(screen.getByText(/Confirmed:/i)).toBeInTheDocument();
    expect(screen.getByText(/Completed:/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancelled:/i)).toBeInTheDocument();
    expect(screen.getByText(/Placed:/i)).toBeInTheDocument();
    expect(screen.getByText(/Processing:/i)).toBeInTheDocument();
  });

  test('displays useful error banner when API fails without claiming 0 orders', async () => {
    jest.spyOn(api, 'fetchOrders').mockRejectedValue(new Error('Marketplace Backend connection refused'));

    const message = {
      id: 'msg-err',
      userQuestion: 'Show all orders from this month',
      content: 'Error loading orders',
      displayType: 'ORDERS',
      orders: [],
    };

    render(<OrderExplorer message={message} lang="en" />);

    await waitFor(() => {
      expect(screen.getByText(/Marketplace Backend connection refused/i)).toBeInTheDocument();
    });

    // Should NOT say "No orders found" when it's an API failure
    expect(screen.queryByText(/No orders found for this commodity/i)).not.toBeInTheDocument();
  });

  test('server-side pagination: navigates >10 orders with default page size 5 across 3 pages without duplicates or omissions', async () => {
    // Generate 12 distinct mock orders
    const all12Orders = Array.from({ length: 12 }, (_, i) => ({
      id: 201 + i,
      buyerName: `Buyer ${i + 1}`,
      commodityName: i % 2 === 0 ? 'Soybean' : 'Wheat',
      quantity: 50 + i * 5,
      unit: 'Quintal',
      pricePerUnit: 4000 + i * 50,
      totalAmount: (50 + i * 5) * (4000 + i * 50),
      marketLocation: 'Sangli',
      deliveryLocation: 'Pune',
      status: 'CONFIRMED',
      createdAt: `2026-10-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
    }));

    const page0Slice = all12Orders.slice(0, 5);
    page0Slice.totalElements = 12;
    page0Slice.totalPages = 3;
    page0Slice.page = 0;
    page0Slice.size = 5;

    const page1Slice = all12Orders.slice(5, 10);
    page1Slice.totalElements = 12;
    page1Slice.totalPages = 3;
    page1Slice.page = 1;
    page1Slice.size = 5;

    const page2Slice = all12Orders.slice(10, 12);
    page2Slice.totalElements = 12;
    page2Slice.totalPages = 3;
    page2Slice.page = 2;
    page2Slice.size = 5;

    const fetchOrdersSpy = jest.spyOn(api, 'fetchOrders').mockImplementation(async (params) => {
      if (params && params.page === 1) return page1Slice;
      if (params && params.page === 2) return page2Slice;
      if (params && params.page === 0) return page0Slice;
      // unpaginated call returns all 12
      return all12Orders;
    });

    const message = {
      id: 'msg-paged-12',
      userQuestion: 'Show all orders from this month',
      content: 'Here are all orders.',
      displayType: 'ORDERS',
      orders: all12Orders,
      commodities: ['Soybean', 'Wheat'],
    };

    render(<OrderExplorer message={message} lang="en" />);

    // 1. Initial State: Page 1 of 3 (12 total orders)
    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3 (12 total orders)')).toBeInTheDocument();
    });

    // Page 1 contains orders #201 to #205
    expect(screen.getByText('#201')).toBeInTheDocument();
    expect(screen.getByText('#205')).toBeInTheDocument();
    expect(screen.queryByText('#206')).not.toBeInTheDocument();

    // Previous is disabled on page 1; Next is enabled
    const prevBtn = screen.getByRole('button', { name: /Previous/i });
    const nextBtn = screen.getByRole('button', { name: /Next/i });
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();

    // Numbered buttons 1, 2, 3 exist; button 1 is active
    const btn1 = screen.getByRole('button', { name: 'Page 1' });
    const btn2 = screen.getByRole('button', { name: 'Page 2' });
    const btn3 = screen.getByRole('button', { name: 'Page 3' });
    expect(btn1).toHaveClass('active');
    expect(btn2).not.toHaveClass('active');
    expect(btn3).not.toHaveClass('active');

    // 2. Navigate to Page 2 via button '2'
    fireEvent.click(btn2);

    await waitFor(() => {
      expect(fetchOrdersSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          size: 5,
        })
      );
      expect(screen.getByText('Page 2 of 3 (12 total orders)')).toBeInTheDocument();
    });

    // Page 2 contains orders #206 to #210; no page 1 or page 3 orders
    expect(screen.getByText('#206')).toBeInTheDocument();
    expect(screen.getByText('#210')).toBeInTheDocument();
    expect(screen.queryByText('#201')).not.toBeInTheDocument();
    expect(screen.queryByText('#211')).not.toBeInTheDocument();

    // On Page 2, both Previous and Next are enabled
    expect(prevBtn).toBeEnabled();
    expect(nextBtn).toBeEnabled();
    expect(btn2).toHaveClass('active');

    // 3. Navigate to Page 3 via Next button
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(fetchOrdersSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          size: 5,
        })
      );
      expect(screen.getByText('Page 3 of 3 (12 total orders)')).toBeInTheDocument();
    });

    // Page 3 contains orders #211 and #212 (2 items, complete set of 12)
    expect(screen.getByText('#211')).toBeInTheDocument();
    expect(screen.getByText('#212')).toBeInTheDocument();
    expect(screen.queryByText('#206')).not.toBeInTheDocument();

    // Next is disabled on the last page; Previous is enabled
    expect(nextBtn).toBeDisabled();
    expect(prevBtn).toBeEnabled();
    expect(btn3).toHaveClass('active');
  });

  test('server-side pagination: preserves active commodity, buyer name, date range, and status filter when navigating pages', async () => {
    const vishalOrders = [
      { id: 49, buyerName: 'Vishal Patil', commodityName: 'Soybean', quantity: 120, unit: 'Quintal', totalAmount: 510000, status: 'CONFIRMED' },
      { id: 50, buyerName: 'Vishal Patil', commodityName: 'Soybean', quantity: 80, unit: 'Quintal', totalAmount: 336000, status: 'CONFIRMED' },
      { id: 55, buyerName: 'Vishal Patil', commodityName: 'Soybean', quantity: 90, unit: 'Quintal', totalAmount: 380000, status: 'CONFIRMED' },
      { id: 56, buyerName: 'Vishal Patil', commodityName: 'Soybean', quantity: 70, unit: 'Quintal', totalAmount: 300000, status: 'CONFIRMED' },
      { id: 57, buyerName: 'Vishal Patil', commodityName: 'Soybean', quantity: 60, unit: 'Quintal', totalAmount: 260000, status: 'CONFIRMED' },
      { id: 58, buyerName: 'Vishal Patil', commodityName: 'Soybean', quantity: 50, unit: 'Quintal', totalAmount: 220000, status: 'CONFIRMED' },
    ];

    const fetchOrdersSpy = jest.spyOn(api, 'fetchOrders').mockImplementation(async (params) => {
      const page = params?.page ?? 0;
      const size = params?.size ?? 5;
      if (params && params.page !== undefined) {
        const slice = vishalOrders.slice(page * size, (page + 1) * size);
        slice.totalElements = vishalOrders.length;
        slice.totalPages = Math.ceil(vishalOrders.length / size);
        slice.page = page;
        slice.size = size;
        return slice;
      }
      return vishalOrders;
    });

    const message = {
      id: 'msg-filter-preserve',
      userQuestion: "Show confirmed orders for Vishal Patil",
      content: 'Here are Vishal Patil orders.',
      displayType: 'ORDERS',
      buyerName: 'Vishal Patil',
      status: 'CONFIRMED',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      orders: vishalOrders,
      commodities: ['Soybean'],
    };

    render(<OrderExplorer message={message} lang="en" />);

    // Page controls exist and show 2 pages (6 total orders)
    await waitFor(() => {
      expect(screen.getByText('Page 1 of 2 (6 total orders)')).toBeInTheDocument();
    });

    const nextBtn = screen.getByRole('button', { name: /Next/i });
    expect(nextBtn).toBeEnabled();
    fireEvent.click(nextBtn);

    // Verify all active filters are strictly preserved in page request
    await waitFor(() => {
      expect(fetchOrdersSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          buyerName: 'Vishal Patil',
          status: 'CONFIRMED',
          startDate: '2026-10-01',
          endDate: '2026-10-31',
          page: 1,
          size: 5,
        })
      );
      expect(screen.getByText('Page 2 of 2 (6 total orders)')).toBeInTheDocument();
    });
  });

  test('server-side pagination: resets to page 1 (index 0) when admin changes commodity filter', async () => {
    const orders = Array.from({ length: 12 }, (_, i) => ({
      id: 300 + i,
      buyerName: `Buyer ${i}`,
      commodityName: i < 6 ? 'Soybean' : 'Wheat',
      quantity: 50,
      unit: 'Quintal',
      pricePerUnit: 4000,
      totalAmount: 200000,
      status: 'CONFIRMED',
    }));

    const fetchOrdersSpy = jest.spyOn(api, 'fetchOrders').mockImplementation(async (params) => {
      const filtered = params?.commodity
        ? orders.filter((o) => o.commodityName.toLowerCase() === params.commodity.toLowerCase())
        : orders;
      const page = params?.page ?? 0;
      const size = params?.size ?? 5;
      if (params && params.page !== undefined) {
        const slice = filtered.slice(page * size, (page + 1) * size);
        slice.totalElements = filtered.length;
        slice.totalPages = Math.ceil(filtered.length / size);
        slice.page = page;
        slice.size = size;
        return slice;
      }
      return filtered;
    });

    const message = {
      id: 'msg-reset',
      userQuestion: 'Show all orders',
      content: 'All orders',
      displayType: 'ORDERS',
      orders: orders,
      commodities: ['Soybean', 'Wheat'],
    };

    render(<OrderExplorer message={message} lang="en" />);

    // Advance to page 2
    const btn2 = await screen.findByRole('button', { name: 'Page 2' });
    fireEvent.click(btn2);

    await waitFor(() => {
      expect(btn2).toHaveClass('active');
    });

    // Change commodity filter to Soybean
    const soybeanBtn = screen.getByRole('tab', { name: /^Soybean$/i });
    fireEvent.click(soybeanBtn);

    // Pagination must reset to page 0
    await waitFor(() => {
      expect(fetchOrdersSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          commodity: 'Soybean',
          page: 0,
          size: 5,
        })
      );
      const btn1 = screen.getByRole('button', { name: 'Page 1' });
      expect(btn1).toHaveClass('active');
    });
  });

  describe('Dynamic Search and Empty Results', () => {
    const searchMockOrders = [
      {
        id: 101,
        buyerName: 'Ramesh Agro',
        commodityName: 'Soybean',
        quantity: 50.0,
        unit: 'Quintal',
        pricePerUnit: 4200.0,
        totalAmount: 210000.0,
        marketLocation: 'Sangli APMC',
        deliveryLocation: 'Pune Warehouse',
        status: 'CONFIRMED',
        createdAt: '2026-10-05T10:30:00Z',
      },
      {
        id: 102,
        buyerName: 'Kisan Traders',
        commodityName: 'Wheat',
        quantity: 100.0,
        unit: 'Quintal',
        pricePerUnit: 2500.0,
        totalAmount: 250000.0,
        marketLocation: 'Nagpur APMC',
        deliveryLocation: 'Mumbai Port',
        status: 'COMPLETED',
        createdAt: '2026-10-06T14:15:00Z',
      },
      {
        id: 103,
        buyerName: 'Modern Mills',
        commodityName: 'Soybean',
        quantity: 30.0,
        unit: 'Quintal',
        pricePerUnit: 4250.0,
        totalAmount: 127500.0,
        marketLocation: 'Latur Mandi',
        deliveryLocation: 'Solapur Mill',
        status: 'PLACED',
        createdAt: '2026-10-08T09:00:00Z',
      },
    ];

    const baseMessage = {
      id: 'msg-search',
      userQuestion: 'Show all orders',
      content: 'Here are all orders.',
      displayType: 'ORDERS',
      orders: searchMockOrders,
      commodities: ['Soybean', 'Wheat'],
    };

    test('matchesOrderSearch utility correctly checks all 6 fields', () => {
      const order = searchMockOrders[0]; // 101, Ramesh Agro, Soybean, Sangli APMC, Pune Warehouse, CONFIRMED
      expect(matchesOrderSearch(order, '101')).toBe(true);
      expect(matchesOrderSearch(order, '#101')).toBe(true);
      expect(matchesOrderSearch(order, 'ramesh')).toBe(true);
      expect(matchesOrderSearch(order, 'soybean')).toBe(true);
      expect(matchesOrderSearch(order, 'sangli')).toBe(true);
      expect(matchesOrderSearch(order, 'pune')).toBe(true);
      expect(matchesOrderSearch(order, 'confirmed')).toBe(true);
      expect(matchesOrderSearch(order, 'nonexistent')).toBe(false);
    });

    test('renders search input with accessible placeholder and clear button', () => {
      jest.spyOn(api, 'fetchOrders').mockResolvedValue(searchMockOrders);
      render(<OrderExplorer message={baseMessage} lang="en" />);

      const searchInput = screen.getByRole('textbox', { name: /search orders/i });
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('placeholder', 'Search orders...');
    });

    test('dynamically filters orders across Order ID (#102 and 102)', async () => {
      jest.spyOn(api, 'fetchOrders').mockResolvedValue(searchMockOrders);
      render(<OrderExplorer message={baseMessage} lang="en" />);

      const searchInput = screen.getByRole('textbox', { name: /search orders/i });
      fireEvent.change(searchInput, { target: { value: '102' } });

      expect(screen.getByText('#102')).toBeInTheDocument();
      expect(screen.getByText('Kisan Traders')).toBeInTheDocument();
      expect(screen.queryByText('#101')).not.toBeInTheDocument();
      expect(screen.queryByText('#103')).not.toBeInTheDocument();
    });

    test('dynamically filters orders across Buyer Name (Modern Mills)', async () => {
      jest.spyOn(api, 'fetchOrders').mockResolvedValue(searchMockOrders);
      render(<OrderExplorer message={baseMessage} lang="en" />);

      const searchInput = screen.getByRole('textbox', { name: /search orders/i });
      fireEvent.change(searchInput, { target: { value: 'Modern' } });

      expect(screen.getByText('#103')).toBeInTheDocument();
      expect(screen.getByText('Modern Mills')).toBeInTheDocument();
      expect(screen.queryByText('#101')).not.toBeInTheDocument();
      expect(screen.queryByText('#102')).not.toBeInTheDocument();
    });

    test('dynamically filters orders across Commodity (Wheat)', async () => {
      jest.spyOn(api, 'fetchOrders').mockResolvedValue(searchMockOrders);
      render(<OrderExplorer message={baseMessage} lang="en" />);

      const searchInput = screen.getByRole('textbox', { name: /search orders/i });
      fireEvent.change(searchInput, { target: { value: 'Wheat' } });

      expect(screen.getByText('#102')).toBeInTheDocument();
      expect(screen.queryByText('#101')).not.toBeInTheDocument();
      expect(screen.queryByText('#103')).not.toBeInTheDocument();
    });

    test('dynamically filters orders across Market Location (Latur Mandi)', async () => {
      jest.spyOn(api, 'fetchOrders').mockResolvedValue(searchMockOrders);
      render(<OrderExplorer message={baseMessage} lang="en" />);

      const searchInput = screen.getByRole('textbox', { name: /search orders/i });
      fireEvent.change(searchInput, { target: { value: 'Latur' } });

      expect(screen.getByText('#103')).toBeInTheDocument();
      expect(screen.queryByText('#101')).not.toBeInTheDocument();
      expect(screen.queryByText('#102')).not.toBeInTheDocument();
    });

    test('dynamically filters orders across Delivery Location (Mumbai Port)', async () => {
      jest.spyOn(api, 'fetchOrders').mockResolvedValue(searchMockOrders);
      render(<OrderExplorer message={baseMessage} lang="en" />);

      const searchInput = screen.getByRole('textbox', { name: /search orders/i });
      fireEvent.change(searchInput, { target: { value: 'Mumbai' } });

      expect(screen.getByText('#102')).toBeInTheDocument();
      expect(screen.queryByText('#101')).not.toBeInTheDocument();
      expect(screen.queryByText('#103')).not.toBeInTheDocument();
    });

    test('dynamically filters orders across Status (COMPLETED / Completed)', async () => {
      jest.spyOn(api, 'fetchOrders').mockResolvedValue(searchMockOrders);
      render(<OrderExplorer message={baseMessage} lang="en" />);

      const searchInput = screen.getByRole('textbox', { name: /search orders/i });
      fireEvent.change(searchInput, { target: { value: 'completed' } });

      expect(screen.getByText('#102')).toBeInTheDocument();
      expect(screen.queryByText('#101')).not.toBeInTheDocument();
      expect(screen.queryByText('#103')).not.toBeInTheDocument();
    });

    test('shows "No orders found" and "0 matching orders" with no order rows when search matches no orders, never displaying unfiltered orders', async () => {
      jest.spyOn(api, 'fetchOrders').mockResolvedValue(searchMockOrders);
      render(<OrderExplorer message={baseMessage} lang="en" />);

      // Initially 3 orders are displayed
      expect(screen.getByText('#101')).toBeInTheDocument();
      expect(screen.getByText('#102')).toBeInTheDocument();
      expect(screen.getByText('#103')).toBeInTheDocument();

      const searchInput = screen.getByRole('textbox', { name: /search orders/i });
      // Dynamic arbitrary term that matches nothing
      fireEvent.change(searchInput, { target: { value: 'RandomSearchQuery999' } });

      // Shows "No orders found" and "0 matching orders"
      expect(screen.getByText('No orders found')).toBeInTheDocument();
      expect(screen.getByText('0 matching orders')).toBeInTheDocument();

      // No order rows rendered! Original unfiltered orders must NEVER be displayed
      expect(screen.queryByText('#101')).not.toBeInTheDocument();
      expect(screen.queryByText('#102')).not.toBeInTheDocument();
      expect(screen.queryByText('#103')).not.toBeInTheDocument();
      expect(screen.queryByText('Ramesh Agro')).not.toBeInTheDocument();
      expect(screen.queryByText('Kisan Traders')).not.toBeInTheDocument();
      expect(screen.queryByText('Modern Mills')).not.toBeInTheDocument();

      // Pagination must be hidden or disabled when there are no results
      const prevBtn = screen.queryByRole('button', { name: /previous/i });
      const nextBtn = screen.queryByRole('button', { name: /next/i });
      if (prevBtn) {
        expect(prevBtn).toBeDisabled();
      } else {
        expect(prevBtn).not.toBeInTheDocument();
      }
      if (nextBtn) {
        expect(nextBtn).toBeDisabled();
      } else {
        expect(nextBtn).not.toBeInTheDocument();
      }
    });

    test('clearing search via clear button restores orders matching the currently selected commodity filter', async () => {
      jest.spyOn(api, 'fetchOrders').mockResolvedValue(searchMockOrders);
      render(<OrderExplorer message={baseMessage} lang="en" />);

      const searchInput = screen.getByRole('textbox', { name: /search orders/i });
      fireEvent.change(searchInput, { target: { value: 'NonExistentTerm' } });

      expect(screen.getByText('No orders found')).toBeInTheDocument();
      expect(screen.getByText('0 matching orders')).toBeInTheDocument();

      // Clear search via clear button (&times;)
      const clearBtn = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearBtn);

      // Search input is cleared
      expect(searchInput.value).toBe('');

      // Restores orders
      expect(screen.getByText('#101')).toBeInTheDocument();
      expect(screen.getByText('#102')).toBeInTheDocument();
      expect(screen.getByText('#103')).toBeInTheDocument();
      expect(screen.queryByText('No orders found')).not.toBeInTheDocument();
    });

    test('clearing search input via backspace/empty text restores orders', async () => {
      jest.spyOn(api, 'fetchOrders').mockResolvedValue(searchMockOrders);
      render(<OrderExplorer message={baseMessage} lang="en" />);

      const searchInput = screen.getByRole('textbox', { name: /search orders/i });
      fireEvent.change(searchInput, { target: { value: 'Wheat' } });

      // Shows only Wheat order
      expect(screen.getByText('#102')).toBeInTheDocument();
      expect(screen.queryByText('#101')).not.toBeInTheDocument();

      // Clear search by typing empty string
      fireEvent.change(searchInput, { target: { value: '' } });

      // All orders restored
      expect(screen.getByText('#101')).toBeInTheDocument();
      expect(screen.getByText('#102')).toBeInTheDocument();
      expect(screen.getByText('#103')).toBeInTheDocument();
    });

    test('clearing search restores specific selected commodity filter (e.g. Wheat)', async () => {
      const wheatOrders = searchMockOrders.filter((o) => o.commodityName === 'Wheat');
      const fetchSpy = jest.spyOn(api, 'fetchOrders').mockImplementation(async (params) => {
        if (params?.commodity === 'Wheat') return wheatOrders;
        return searchMockOrders;
      });

      render(<OrderExplorer message={baseMessage} lang="en" />);

      // Select Wheat commodity filter
      const wheatTab = screen.getByRole('tab', { name: /^Wheat$/i });
      fireEvent.click(wheatTab);

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith(
          expect.objectContaining({ commodity: 'Wheat', page: 0 })
        );
      });

      // Type a search that matches no orders
      const searchInput = screen.getByRole('textbox', { name: /search orders/i });
      fireEvent.change(searchInput, { target: { value: 'NonExistentInWheat' } });

      expect(screen.getByText('No orders found')).toBeInTheDocument();
      expect(screen.getByText('0 matching orders')).toBeInTheDocument();
      expect(screen.queryByText('#102')).not.toBeInTheDocument();

      // Clear search
      const clearBtn = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearBtn);

      // Only Wheat orders are restored (respecting currently selected commodity)
      expect(screen.getByText('#102')).toBeInTheDocument();
      expect(screen.queryByText('#101')).not.toBeInTheDocument();
      expect(screen.queryByText('#103')).not.toBeInTheDocument();
    });

    test('summary cards dynamically update totals when searching', async () => {
      jest.spyOn(api, 'fetchOrders').mockResolvedValue(searchMockOrders);
      render(<OrderExplorer message={baseMessage} lang="en" />);

      // Initially 3 orders
      expect(screen.getByText('3 Orders')).toBeInTheDocument();

      const searchInput = screen.getByRole('textbox', { name: /search orders/i });
      fireEvent.change(searchInput, { target: { value: 'Soybean' } });

      // Soybean matches orders #101 (₹2,10,000, 50 Quintal) and #103 (₹1,27,500, 30 Quintal)
      // Total value: ₹3,37,500, Total Qty: 80 Quintal
      await waitFor(() => {
        expect(screen.getByText('2 Orders')).toBeInTheDocument();
        expect(screen.getByText('Total Value: ₹3,37,500')).toBeInTheDocument();
        expect(screen.getByText(/Total Qty: 80 Quintal/i)).toBeInTheDocument();
      });
    });
  });
});

