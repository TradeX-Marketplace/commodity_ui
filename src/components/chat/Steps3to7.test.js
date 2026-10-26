import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import SupplyExplorer from './SupplyExplorer';
import SupplyDetailsModal from './SupplyDetailsModal';
import DemandExplorer from './DemandExplorer';
import DemandDetailsModal from './DemandDetailsModal';
import BidExplorer from './BidExplorer';
import BidDetailsModal from './BidDetailsModal';
import DealExplorer from './DealExplorer';
import DealDetailsModal from './DealDetailsModal';
import WhatsAppDiagnosticsCard from './WhatsAppDiagnosticsCard';
import ChatMessage from './ChatMessage';
import SuggestedPrompts from './SuggestedPrompts';

// Mock fetch globally
beforeEach(() => {
  global.fetch = jest.fn((url) => {
    // 1. Supplies mock
    if (url.includes('/api/ai/supplies')) {
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () =>
          Promise.resolve([
            {
              id: 'SUP-101',
              commodityName: 'Soybean',
              partyName: 'Sangli Agro Traders',
              availableQuantity: 500,
              askingRate: 4400,
              location: 'Sangli',
              status: 'ACTIVE',
              validTill: '2026-11-01',
            },
            {
              id: 'SUP-102',
              commodityName: 'Soybean',
              partyName: 'Maharashtra Krishi',
              availableQuantity: 800,
              askingRate: 4600,
              location: 'Pune',
              status: 'ACTIVE',
              validTill: '2026-11-05',
            },
          ]),
      });
    }

    // 2. Buyer demands mock
    if (url.includes('/api/ai/buyer-demands')) {
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () =>
          Promise.resolve([
            {
              id: 'DEM-201',
              commodityName: 'Soybean',
              buyerName: 'National Edible Oils',
              quantity: 1200,
              unit: 'Quintal',
              targetRate: 4300,
              location: 'Sangli',
              status: 'OPEN',
              requiredDate: '2026-11-10',
            },
            {
              id: 'DEM-202',
              commodityName: 'Wheat',
              buyerName: 'Modern Flour Mills',
              quantity: 600,
              unit: 'Quintal',
              targetRate: 3800,
              location: 'Nagpur',
              status: 'OPEN',
              requiredDate: '2026-11-15',
            },
          ]),
      });
    }

    // 3. Bids mock
    if (url.includes('/api/ai/bids')) {
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () =>
          Promise.resolve([
            {
              id: 'BID-301',
              supplyId: 'SUP-101',
              commodityName: 'Soybean',
              bidderName: 'Pooja Traders',
              offerRate: 4350,
              quantity: 250,
              unit: 'Quintal',
              status: 'PENDING',
              createdAt: '2026-10-20T10:00:00Z',
            },
            {
              id: 'BID-302',
              supplyId: 'SUP-102',
              commodityName: 'Soybean',
              bidderName: 'Vikas Trading Co',
              offerRate: 4500,
              quantity: 400,
              unit: 'Quintal',
              status: 'COUNTER_OFFER',
              counterRate: 4550,
              createdAt: '2026-10-21T12:00:00Z',
            },
          ]),
      });
    }

    // 4. Deals mock
    if (url.includes('/api/ai/deals')) {
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () =>
          Promise.resolve([
            {
              id: 'DEAL-401',
              contractId: '901',
              commodityName: 'Soybean',
              buyerName: 'National Edible Oils',
              sellerName: 'Sangli Agro Traders',
              quantity: 500,
              rate: 4350,
              dealValue: 2175000,
              status: 'APPROVED',
              buyerSigned: true,
              sellerSigned: false,
              createdAt: '2026-10-21T14:00:00Z',
            },
          ]),
      });
    }

    // 5. WhatsApp Diagnostics mock
    if (url.includes('/api/v1/test/whatsapp/config')) {
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () =>
          Promise.resolve({
            enabled: true,
            provider: 'Meta Cloud API',
            senderNumber: '+91 ••••• ••099',
            apiKeyConfigured: true,
            baseUrl: 'https://graph.facebook.com/v18.0',
            timeout: '10,000 ms',
            retryAttempts: 3,
            dispatchDelay: '250 ms',
          }),
      });
    }

    if (url.includes('/api/v1/test/whatsapp/connection')) {
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () =>
          Promise.resolve({
            connected: true,
            success: true,
            message: 'Handshake successful with WhatsApp provider gateway',
          }),
      });
    }

    if (url.includes('/api/v1/test/whatsapp/live-status')) {
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () =>
          Promise.resolve({
            online: true,
            quota: 'Active Business Tier (Unlimited)',
          }),
      });
    }

    return Promise.resolve({
      ok: true,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve([]),
    });
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Step 3: Supplies & Inventory Explorer', () => {
  test('renders SupplyExplorer with KPI cards, filters, and records', async () => {
    const message = {
      id: 'msg-sup',
      userQuestion: 'Show all active Soybean supplies.',
    };

    render(<SupplyExplorer message={message} lang="en" />);

    // Check loading indicator or wait for load
    await waitFor(() => {
      expect(screen.getByText(/Commodity Supplies & Inventory/i)).toBeInTheDocument();
    });

    // Check KPI cards
    await waitFor(() => {
      expect(screen.getByText(/2 Active Supplies/i)).toBeInTheDocument();
      expect(screen.getByText(/Highest Available Quantity/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Maharashtra Krishi/i).length).toBeGreaterThan(0);
    });

    // Price filter check
    const filter4500Btn = screen.getByRole('button', { name: /Price < ₹4,500/i });
    expect(filter4500Btn).toBeInTheDocument();
    fireEvent.click(filter4500Btn);

    // Only Sangli Agro Traders (askingRate 4400) should match in the table
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(screen.getByText('Sangli Agro Traders')).toBeInTheDocument();
    expect(within(table).queryByText(/Maharashtra Krishi/i)).not.toBeInTheDocument();
  });

  test('opens SupplyDetailsModal with tabs and close button', () => {
    const mockSupply = {
      id: 'SUP-101',
      supplyNumber: 'SUP-101',
      commodityName: 'Soybean',
      partyName: 'Sangli Agro Traders',
      availableQuantity: 500,
      totalQuantity: 500,
      askingRate: 4400,
      location: 'Sangli',
      originZone: 'Western Maharashtra',
      qualityGrade: 'Grade A',
      status: 'ACTIVE',
    };

    const handleClose = jest.fn();
    render(
      <SupplyDetailsModal
        isOpen={true}
        supply={mockSupply}
        lang="en"
        onClose={handleClose}
      />
    );

    expect(screen.getAllByText('SUP-101').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Sangli Agro Traders/i).length).toBeGreaterThan(0);

    // Check tabs
    expect(screen.getByRole('tab', { name: /Specifications/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Inventory & Dates/i })).toBeInTheDocument();

    // Test tab click
    fireEvent.click(screen.getByRole('tab', { name: /Specifications/i }));
    expect(screen.getByText(/Grade A/i)).toBeInTheDocument();

    // Close button
    fireEvent.click(screen.getByLabelText(/Close/i));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('handles API connection failure gracefully with Retry button and never displays zero counts', async () => {
    // Override fetch to fail for supplies
    global.fetch.mockImplementationOnce((url) => {
      if (url.includes('/api/ai/supplies')) {
        return Promise.reject(new Error('Connection failed to http://localhost:8080/api/ai/supplies'));
      }
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve([]),
      });
    });

    const message = {
      id: 'msg-sup-err',
      userQuestion: 'Show active supplies',
    };

    render(<SupplyExplorer message={message} lang="en" />);

    // Wait for connection error banner to appear
    await waitFor(() => {
      expect(screen.getByTestId('supply-error-banner')).toBeInTheDocument();
    });

    // Verify error text is displayed
    expect(screen.getByText(/Could not retrieve supplies from the marketplace backend/i)).toBeInTheDocument();
    expect(screen.getByText(/Connection failed to http:\/\/localhost:8080\/api\/ai\/supplies/i)).toBeInTheDocument();

    // Verify zero counts are NOT displayed as if request succeeded
    expect(screen.queryByText(/0 Active Supplies/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Total Available: 0 Quintal/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/No supplies found/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/0 matching supplies/i)).not.toBeInTheDocument();

    // Verify Retry button is interactive
    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    expect(retryBtn).toBeInTheDocument();

    // Setup successful recovery on retry
    global.fetch.mockImplementationOnce((url) => {
      if (url.includes('/api/ai/supplies')) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () =>
            Promise.resolve({
              success: true,
              data: [
                {
                  id: 1,
                  supplyNumber: 'SUP-001',
                  commodityName: 'Soybean',
                  partyName: 'Sangli Agro Traders',
                  availableQuantity: 500,
                  askingRate: 4300,
                  location: 'Sangli',
                  status: 'ACTIVE',
                  validTill: '2026-11-30',
                },
              ],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve([]),
      });
    });

    fireEvent.click(retryBtn);

    // Verify recovery
    await waitFor(() => {
      expect(screen.getByText(/1 Active Supplies/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Available: 500 Quintal/i)).toBeInTheDocument();
    });
  });

  test('correctly parses TradeX ApiResponse envelope and calculates total available quantity', async () => {
    global.fetch.mockImplementationOnce((url) => {
      if (url.includes('/api/ai/supplies')) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () =>
            Promise.resolve({
              success: true,
              message: 'Supplies retrieved successfully',
              data: [
                { id: 1, supplyNumber: 'SUP-1', commodityName: 'Soybean', availableQuantity: 4000, askingRate: 4300, location: 'Sangli', status: 'ACTIVE', validTill: '2026-11-30' },
                { id: 2, supplyNumber: 'SUP-2', commodityName: 'MAIZE', availableQuantity: 600, askingRate: 2200, location: 'Sangli', status: 'ACTIVE', validTill: '2026-11-30' },
                { id: 3, supplyNumber: 'SUP-3', commodityName: 'MAIZEW', availableQuantity: 700, askingRate: 2250, location: 'Kolhapur', status: 'ACTIVE', validTill: '2026-11-30' },
                { id: 4, supplyNumber: 'SUP-4', commodityName: 'Wheat', availableQuantity: 800, askingRate: 2800, location: 'Sangli', status: 'ACTIVE', validTill: '2026-11-30' },
              ],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve([]),
      });
    });

    const message = {
      id: 'msg-sup-calc',
      userQuestion: 'Show active supplies in marketplace',
    };

    render(<SupplyExplorer message={message} lang="en" />);

    await waitFor(() => {
      expect(screen.getByText(/4 Active Supplies/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Available: 6,100 Quintal/i)).toBeInTheDocument();
    });
  });

  test('inspects expiry dates separately without silently redefining backend stored status', async () => {
    global.fetch.mockImplementationOnce((url) => {
      if (url.includes('/api/ai/supplies')) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () =>
            Promise.resolve({
              success: true,
              data: [
                {
                  id: 6,
                  supplyNumber: 'SUP-PAST-EXP',
                  commodityName: 'Soybean',
                  partyName: 'Sangli Agro Traders',
                  availableQuantity: 500,
                  askingRate: 4300,
                  location: 'Sangli',
                  status: 'ACTIVE', // Backend stored status is ACTIVE
                  validTill: '2020-01-01', // Expired date in the past
                },
              ],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve([]),
      });
    });

    const message = {
      id: 'msg-sup-exp',
      userQuestion: 'Show all supplies',
    };

    render(<SupplyExplorer message={message} lang="en" />);

    await waitFor(() => {
      expect(screen.getByText('SUP-PAST-EXP')).toBeInTheDocument();
    });

    // Backend status column must still display Active (stored status not overwritten)
    expect(screen.getByText('Active')).toBeInTheDocument();

    // Valid Till column indicates (Expired) separately from stored status
    expect(screen.getByText(/\(Expired\)/i)).toBeInTheDocument();
  });

  test('searches correctly by Supply ID: full, partial, case-insensitive, with spaces, and clears search', async () => {
    // Supplies with distinct supply numbers and IDs
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/ai/supplies')) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () =>
            Promise.resolve({
              success: true,
              data: [
                { id: 1, supplyNumber: 'SUP-1792400860244', partyName: 'Sangli Agro Traders', commodityName: 'Soybean', availableQuantity: 500, askingRate: 4300, location: 'Sangli', status: 'ACTIVE' },
                { id: 2, supplyNumber: 'SUP-1792572585508', partyName: 'Maharashtra Krishi', commodityName: 'Soybean', availableQuantity: 800, askingRate: 4500, location: 'Pune', status: 'ACTIVE' },
                { id: 3, supplyNumber: 'SUP-101', partyName: 'Kisan Kendra', commodityName: 'Soybean', availableQuantity: 300, askingRate: 4400, location: 'Latur', status: 'ACTIVE' },
              ],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve([]),
      });
    });

    const message = {
      id: 'msg-search-test',
      userQuestion: 'Show all supplies',
    };

    render(<SupplyExplorer message={message} lang="en" />);

    await waitFor(() => {
      expect(screen.getByText('SUP-1792400860244')).toBeInTheDocument();
      expect(screen.getByText('SUP-1792572585508')).toBeInTheDocument();
      expect(screen.getByText('SUP-101')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText(/Search commodity supplies/i);

    // 1. Full Supply ID search
    fireEvent.change(searchInput, { target: { value: 'SUP-1792400860244' } });
    expect(screen.getByText('SUP-1792400860244')).toBeInTheDocument();
    expect(screen.queryByText('SUP-1792572585508')).not.toBeInTheDocument();
    expect(screen.queryByText('SUP-101')).not.toBeInTheDocument();

    // 2. Partial Supply ID search (trailing numbers only)
    fireEvent.change(searchInput, { target: { value: '585508' } });
    expect(screen.getByText('SUP-1792572585508')).toBeInTheDocument();
    expect(screen.queryByText('SUP-1792400860244')).not.toBeInTheDocument();

    // 3. Lowercase partial with leading/trailing spaces
    fireEvent.change(searchInput, { target: { value: '  sup-101  ' } });
    expect(screen.getByText('SUP-101')).toBeInTheDocument();
    expect(screen.queryByText('SUP-1792400860244')).not.toBeInTheDocument();

    // 4. Clear search restores all supplies
    const clearBtn = screen.getByLabelText(/Clear search/i);
    fireEvent.click(clearBtn);
    expect(screen.getByText('SUP-1792400860244')).toBeInTheDocument();
    expect(screen.getByText('SUP-1792572585508')).toBeInTheDocument();
    expect(screen.getByText('SUP-101')).toBeInTheDocument();
  });
});

describe('Step 4: Buyer Demands & Orders Explorer', () => {
  test('renders DemandExplorer with active demands KPI and highest demand commodity', async () => {
    const message = {
      id: 'msg-dem',
      userQuestion: 'How many active buyer demands are there?',
    };

    render(<DemandExplorer message={message} lang="en" />);

    await waitFor(() => {
      expect(screen.getByText(/Buyer Demands & Procurement Requests/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Requested Quantity/i)).toBeInTheDocument();
      expect(screen.getByText(/Highest Demanded Commodity/i)).toBeInTheDocument();
      expect(screen.getByText(/National Edible Oils/i)).toBeInTheDocument();
    });

    // Check search functionality
    const searchInput = screen.getByLabelText(/Search buyer demands/i);
    fireEvent.change(searchInput, { target: { value: 'Wheat' } });

    expect(screen.getByText(/Modern Flour Mills/i)).toBeInTheDocument();
    expect(screen.queryByText(/National Edible Oils/i)).not.toBeInTheDocument();
  });

  test('opens DemandDetailsModal and navigates tabs', () => {
    const mockDemand = {
      id: 'DEM-201',
      commodityName: 'Soybean',
      buyerName: 'National Edible Oils',
      quantity: 1200,
      targetRate: 4300,
      location: 'Sangli',
      status: 'OPEN',
      requiredDate: '2026-11-10',
    };

    const handleClose = jest.fn();
    render(
      <DemandDetailsModal
        demandId="DEM-201"
        initialData={mockDemand}
        lang="en"
        onClose={handleClose}
      />
    );

    expect(screen.getByText(/DEMAND #DEM-201/i)).toBeInTheDocument();
    expect(screen.getAllByText(/National Edible Oils/i).length).toBeGreaterThan(0);

    // Switch to logistics tab
    fireEvent.click(screen.getByRole('tab', { name: /Logistics & Destination/i }));
    expect(screen.getByText(/Sangli Central Warehouse/i)).toBeInTheDocument();
  });
});

describe('Step 5: Bids & Negotiations Explorer', () => {
  test('renders BidExplorer with pending bids and highest offer rate', async () => {
    const message = {
      id: 'msg-bid',
      userQuestion: 'How many bids are pending?',
    };

    render(<BidExplorer message={message} lang="en" />);

    await waitFor(() => {
      expect(screen.getByText(/Bids & Negotiations Explorer/i)).toBeInTheDocument();
      expect(screen.getByText(/1 Pending Bids/i)).toBeInTheDocument();
      expect(screen.getByText(/Highest Offer Rate/i)).toBeInTheDocument();
    });

    // Check tab navigation
    const pendingTab = screen.getByRole('tab', { name: /Pending Bids/i });
    fireEvent.click(pendingTab);

    expect(screen.getByText(/Pooja Traders/i)).toBeInTheDocument();
  });

  test('opens BidDetailsModal with counter-offer thread', () => {
    const mockBid = {
      id: 'BID-302',
      supplyId: 'SUP-102',
      commodityName: 'Soybean',
      bidderName: 'Vikas Trading Co',
      offerRate: 4500,
      quantity: 400,
      unit: 'Quintal',
      status: 'COUNTER_OFFER',
      counterRate: 4550,
      createdAt: '2026-10-21T12:00:00Z',
    };

    const handleClose = jest.fn();
    render(
      <BidDetailsModal
        bidId="BID-302"
        initialData={mockBid}
        lang="en"
        onClose={handleClose}
      />
    );

    expect(screen.getByText(/BID #BID-302/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Vikas Trading Co/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('tab', { name: /Counter-Offers & Negotiation/i }));
    expect(screen.getByText(/Counter-Offer Issued/i)).toBeInTheDocument();
  });
});

describe('Step 6: Deals & Contracts Explorer', () => {
  test('renders DealExplorer with total deals and contracts generated', async () => {
    const message = {
      id: 'msg-deal',
      userQuestion: 'How many deals have been created?',
    };

    render(<DealExplorer message={message} lang="en" />);

    await waitFor(() => {
      expect(screen.getByText(/Deals & Contracts Explorer/i)).toBeInTheDocument();
      expect(screen.getByText('1 Total Deals')).toBeInTheDocument();
      expect(screen.getByText('1 Contracts Generated')).toBeInTheDocument();
    });

    expect(screen.getByText(/National Edible Oils/i)).toBeInTheDocument();
    expect(screen.getByText(/Sangli Agro Traders/i)).toBeInTheDocument();
  });

  test('opens DealDetailsModal with contract and commercial terms', () => {
    const mockDeal = {
      id: 'DEAL-401',
      contractId: '901',
      commodityName: 'Soybean',
      buyerName: 'National Edible Oils',
      sellerName: 'Sangli Agro Traders',
      quantity: 500,
      rate: 4350,
      dealValue: 2175000,
      status: 'APPROVED',
      buyerSigned: true,
      sellerSigned: false,
    };

    const handleClose = jest.fn();
    render(
      <DealDetailsModal
        dealId="DEAL-401"
        initialData={mockDeal}
        lang="en"
        onClose={handleClose}
      />
    );

    expect(screen.getByText(/DEAL #DEAL-401/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /Contract & Signatures/i }));
    expect(screen.getByText(/CTR-901/i)).toBeInTheDocument();
  });
});

describe('Step 7: WhatsApp Diagnostics & Delivery Policy', () => {
  test('renders WhatsAppDiagnosticsCard with live status and delivery policy note', async () => {
    render(<WhatsAppDiagnosticsCard lang="en" />);

    await waitFor(() => {
      expect(screen.getByText(/WhatsApp Gateway Diagnostics/i)).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Gateway Connection/i })).toBeInTheDocument();
      expect(screen.getByText(/Connected/i)).toBeInTheDocument();
    });

    // Check delivery policy tab explaining unpersisted message records
    const policyTab = screen.getByRole('tab', { name: /Delivery Policy/i });
    fireEvent.click(policyTab);

    expect(
      screen.getByText(/Notification Persistence & Delivery Log Policy/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Individual outbound message logs.*are not persisted/i)
    ).toBeInTheDocument();
  });
});

describe('ChatMessage Integration for Steps 3 - 7', () => {
  test('routes supply query to SupplyExplorer', async () => {
    const message = {
      id: 'msg-supply-route',
      userQuestion: 'Which seller has the highest available quantity?',
      content: 'Here are the available commodity supplies.',
      displayType: 'SUPPLY',
    };

    render(<ChatMessage message={message} lang="en" onSendMessage={jest.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/Commodity Supplies & Inventory/i)).toBeInTheDocument();
    });
  });

  test('routes demand query to DemandExplorer', async () => {
    const message = {
      id: 'msg-demand-route',
      userQuestion: 'Show all Soybean demands.',
      content: 'Here are the active buyer demands.',
      displayType: 'DEMAND_EXPLORER',
    };

    render(<ChatMessage message={message} lang="en" onSendMessage={jest.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/Buyer Demands & Procurement Requests/i)).toBeInTheDocument();
    });
  });

  test('routes bid query to BidExplorer', async () => {
    const message = {
      id: 'msg-bid-route',
      userQuestion: 'Which bid has the highest offer rate?',
      content: 'Here are the current bids and negotiations.',
      displayType: 'BIDS',
    };

    render(<ChatMessage message={message} lang="en" onSendMessage={jest.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/Bids & Negotiations Explorer/i)).toBeInTheDocument();
    });
  });

  test('routes deal query to DealExplorer', async () => {
    const message = {
      id: 'msg-deal-route',
      userQuestion: 'How many contracts have been generated?',
      content: 'Here are the registered trade deals and contracts.',
      displayType: 'DEALS',
    };

    render(<ChatMessage message={message} lang="en" onSendMessage={jest.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/Deals & Contracts Explorer/i)).toBeInTheDocument();
    });
  });

  test('routes WhatsApp query to WhatsAppDiagnosticsCard', async () => {
    const message = {
      id: 'msg-wa-route',
      userQuestion: 'Is WhatsApp configured and connected?',
      content: 'Here is the WhatsApp gateway diagnostic status.',
      displayType: 'WHATSAPP',
    };

    render(<ChatMessage message={message} lang="en" onSendMessage={jest.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/WhatsApp Gateway Diagnostics/i)).toBeInTheDocument();
    });
  });
});

describe('Suggested Natural Language Queries - Commodity Dropdown', () => {
  test('renders compact Commodity dropdown with All Commodities default and filters by commodity', () => {
    const handleSelectPrompt = jest.fn();
    render(<SuggestedPrompts onSelectPrompt={handleSelectPrompt} language="en" />);

    // Expand the panel
    const toggleBtn = screen.getByRole('button', { name: /Suggested Natural Language Queries/i });
    fireEvent.click(toggleBtn);

    // 1. Dropdown labelled Commodity with correct options
    const dropdown = screen.getByLabelText('Commodity');
    expect(dropdown).toBeInTheDocument();
    expect(dropdown.value).toBe('ALL');

    const options = Array.from(dropdown.querySelectorAll('option')).map((o) => o.textContent);
    expect(options).toEqual([
      'All Commodities',
      'Soybean',
      'MAIZE',
      'MAIZEW',
      'Wheat',
    ]);

    // 2. With All Commodities selected, queries are counted across categories
    const allChip = screen.getByRole('button', { name: /^All \d+$/i });
    expect(allChip).toBeInTheDocument();

    // 3. Filter by Soybean - relevant Soybean queries are shown
    fireEvent.change(dropdown, { target: { value: 'Soybean' } });
    expect(screen.queryByText(/No matching questions found/i)).not.toBeInTheDocument();
    expect(screen.getByText('Show me the Soybean rate for the last 7 days.')).toBeInTheDocument();
    expect(screen.getByText("What is today's Soybean rate?")).toBeInTheDocument();

    // 4. Click a suggestion executes onSelectPrompt callback
    fireEvent.click(screen.getByText("What is today's Soybean rate?"));
    expect(handleSelectPrompt).toHaveBeenCalledWith("What is today's Soybean rate?");

    // 5. Filter by Wheat - refreshes immediately with suggestions, never shows "No matching questions found"
    fireEvent.change(dropdown, { target: { value: 'Wheat' } });
    expect(screen.queryByText(/No matching questions found/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Show me the Soybean rate/i)).not.toBeInTheDocument();
    expect(screen.getByText('Show me the Wheat rate for the last 7 days.')).toBeInTheDocument();

    // 6. Resetting to All Commodities restores all queries
    fireEvent.change(dropdown, { target: { value: 'ALL' } });
    expect(screen.getByText('Show me the Soybean rate for the last 7 days.')).toBeInTheDocument();
  });
});
