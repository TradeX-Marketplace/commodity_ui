import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PartyCountCard from './PartyCountCard';
import PartyExplorer from './PartyExplorer';
import PartyDetailsModal from './PartyDetailsModal';
import ChatMessage from './ChatMessage';
import * as api from '../../services/api';

describe('Parties and Registered Users - Step 2 Tests', () => {
  const mockParties = [
    {
      id: 1,
      partyCode: 'PRT-0001',
      companyName: 'Sangli Agro Processors Ltd',
      city: 'Sangli',
      state: 'Maharashtra',
      roles: ['MANUFACTURER'],
      status: 'ACTIVE',
      active: true,
      isDeleted: false,
      contactPerson: 'Suresh Patil',
      phone: '+919876543210',
      alternatePhone: '+919876543211',
      email: 'suresh@sangliagro.com',
      address: 'Plot 45, MIDC Kupwad, Sangli',
      taluka: 'Miraj',
      plantLocation: 'Kupwad MIDC Phase 2',
      gstin: '27AABCS1234F1Z5',
      pan: 'AABCS1234F',
      registrationType: 'ADMIN_CREATED',
      createdAt: '2026-10-19T10:00:00Z',
      updatedAt: '2026-10-21T12:00:00Z',
    },
    {
      id: 2,
      partyCode: 'PRT-0002',
      companyName: 'Sahyadri Commodity Merchants',
      city: 'Pune',
      state: 'Maharashtra',
      roles: ['TRADER'],
      status: 'ACTIVE',
      active: true,
      isDeleted: false,
      contactPerson: 'Ramesh Deshmukh',
      phone: '+919123456780',
      alternatePhone: '',
      email: 'ramesh@sahyadritraders.in',
      address: 'Shop 12, Market Yard, Gultekdi, Pune',
      taluka: 'Haveli',
      plantLocation: 'Gultekdi Warehouse',
      gstin: '27AABCT5678G1Z2',
      pan: 'AABCT5678G',
      registrationType: 'ADMIN_CREATED',
      createdAt: '2026-10-19T11:30:00Z',
      updatedAt: '2026-10-21T12:00:00Z',
    },
    {
      id: 3,
      partyCode: 'PRT-0003',
      companyName: 'Krishna Valley Oil Mills',
      city: 'Sangli',
      state: 'Maharashtra',
      roles: ['MANUFACTURER'],
      status: 'ACTIVE',
      active: true,
      isDeleted: false,
      contactPerson: 'Anand Shinde',
      phone: '+919822001122',
      email: 'anand@krishnavalley.com',
      address: 'Haripur Road, Sangli',
      gstin: '27AABCK9012H1Z9',
      createdAt: '2026-10-21T09:15:00Z',
    },
    {
      id: 4,
      partyCode: 'PRT-0004',
      companyName: 'Akola Cotton Ginning Corp',
      city: 'Akola',
      state: 'Maharashtra',
      roles: ['MANUFACTURER'],
      status: 'INACTIVE',
      active: false,
      isDeleted: false,
      contactPerson: 'Vikram Joshi',
      phone: '+919765432109',
      email: 'vikram@akolaginning.com',
      address: 'Industrial Area, Akola',
      gstin: '27AABCJ3456K1Z1',
      createdAt: '2026-10-21T09:30:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------
  // 1. PartyCountCard Tests
  // -------------------------------------------------------------
  describe('PartyCountCard Component', () => {
    test('renders header, title, 2 KPI cards, 4 action buttons, and footer note', () => {
      const message = {
        id: 'msg-count-1',
        userQuestion: 'How many parties are registered in the marketplace?',
        content: 'A total of 4 registered parties are currently registered.',
        parties: mockParties,
      };

      const mockSendMessage = jest.fn();

      render(
        <PartyCountCard
          message={message}
          lang="en"
          onSendMessage={mockSendMessage}
        />
      );

      // Header branding and sub
      expect(screen.getByText('Commodity AI Assistant')).toBeInTheDocument();
      expect(screen.getByText('ENGLISH · Marketplace data')).toBeInTheDocument();

      // Title
      expect(screen.getByText('Registered Parties')).toBeInTheDocument();

      // KPI Card 1: Total parties
      expect(screen.getByText('Total parties')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();

      // KPI Card 2: Active parties (3 active, 1 inactive)
      expect(screen.getByText('Active parties')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();

      // Action prompt
      expect(
        screen.getByText('Choose an action to explore the registered parties.')
      ).toBeInTheDocument();

      // 4 Action cards
      expect(screen.getByText('List all parties')).toBeInTheDocument();
      expect(screen.getByText('Buyers vs sellers')).toBeInTheDocument();
      expect(screen.getByText('Parties by location')).toBeInTheDocument();
      expect(screen.getByText('Party details')).toBeInTheDocument();

      // Footer note
      expect(
        screen.getByText(
          'Counts and records come from existing marketplace APIs. Only supported data is displayed.'
        )
      ).toBeInTheDocument();
    });

    test('action buttons trigger correct messages via onSendMessage', () => {
      const message = {
        id: 'msg-count-2',
        userQuestion: 'How many parties are registered in the marketplace?',
        parties: mockParties,
      };
      const mockSendMessage = jest.fn();

      render(
        <PartyCountCard
          message={message}
          lang="en"
          onSendMessage={mockSendMessage}
        />
      );

      // 1. Click "List all parties"
      fireEvent.click(screen.getByText('List all parties'));
      expect(mockSendMessage).toHaveBeenCalledWith('List all registered parties');

      // 2. Click "Buyers vs sellers"
      fireEvent.click(screen.getByText('Buyers vs sellers'));
      expect(mockSendMessage).toHaveBeenCalledWith('How many buyers are registered?');

      // 3. Click "Parties by location"
      fireEvent.click(screen.getByText('Parties by location'));
      expect(mockSendMessage).toHaveBeenCalledWith('Which parties are registered in Sangli?');

      // 4. Click "Party details"
      fireEvent.click(screen.getByText('Party details'));
      expect(mockSendMessage).toHaveBeenCalledWith('Show the details of party PRT-0001');
    });

    test('renders localized Marathi and Hindi text correctly', () => {
      const message = {
        id: 'msg-count-3',
        parties: mockParties,
      };

      const { rerender } = render(
        <PartyCountCard message={message} lang="hi" />
      );
      expect(screen.getByText('कमोडिटी AI सहायक')).toBeInTheDocument();
      expect(screen.getByText('HINDI · मार्केटप्लेस डेटा')).toBeInTheDocument();
      expect(screen.getByText('कुल पार्टियां')).toBeInTheDocument();
      expect(screen.getByText('सक्रिय पार्टियां')).toBeInTheDocument();

      rerender(<PartyCountCard message={message} lang="mr" />);
      expect(screen.getByText('कमोडिटी AI सहाय्यक')).toBeInTheDocument();
      expect(screen.getByText('MARATHI · मार्केटप्लेस डेटा')).toBeInTheDocument();
      expect(screen.getByText('एकूण पार्ट्या')).toBeInTheDocument();
      expect(screen.getByText('सक्रिय पार्ट्या')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------
  // 2. PartyExplorer Component Tests
  // -------------------------------------------------------------
  describe('PartyExplorer Component', () => {
    test('renders table with party rows, badges, and controls', () => {
      const message = {
        id: 'msg-exp-1',
        userQuestion: 'List all registered parties',
        content: 'Here are the registered parties.',
        parties: mockParties,
      };

      render(<PartyExplorer message={message} lang="en" />);

      // Title & badges
      expect(screen.getByText('Registered Parties Explorer')).toBeInTheDocument();
      expect(screen.getByText('4 Registered Parties')).toBeInTheDocument();
      expect(screen.getByText('3 Active')).toBeInTheDocument();

      // Search box & filter selects
      expect(screen.getByPlaceholderText(/Search by party ID/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by role')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by location')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();

      // Table rows
      expect(screen.getByText('PRT-0001')).toBeInTheDocument();
      expect(screen.getByText('Sangli Agro Processors Ltd')).toBeInTheDocument();
      expect(screen.getByText('PRT-0002')).toBeInTheDocument();
      expect(screen.getByText('Sahyadri Commodity Merchants')).toBeInTheDocument();
    });

    test('search filters parties dynamically and displays empty state with 0 matches', () => {
      const message = {
        id: 'msg-exp-2',
        userQuestion: 'List all registered parties',
        parties: mockParties,
      };

      render(<PartyExplorer message={message} lang="en" />);

      const searchInput = screen.getByPlaceholderText(/Search by party ID/i);

      // Search for Sangli
      fireEvent.change(searchInput, { target: { value: 'Sangli' } });
      expect(screen.getByText('Sangli Agro Processors Ltd')).toBeInTheDocument();
      expect(screen.getByText('Krishna Valley Oil Mills')).toBeInTheDocument();
      expect(screen.queryByText('Sahyadri Commodity Merchants')).not.toBeInTheDocument();

      // Search for non-existent term
      fireEvent.change(searchInput, { target: { value: 'NonExistentParty' } });
      expect(screen.getByText('No parties found')).toBeInTheDocument();
      expect(screen.getByText('0 matching parties')).toBeInTheDocument();
      expect(screen.queryByText('PRT-0001')).not.toBeInTheDocument();

      // Clear search restores all records
      const clearBtn = screen.getByLabelText('Clear search');
      fireEvent.click(clearBtn);
      expect(screen.getByText('PRT-0001')).toBeInTheDocument();
      expect(screen.getByText('PRT-0002')).toBeInTheDocument();
    });

    test('filters parties by role, location, and status dropdowns', () => {
      const message = {
        id: 'msg-exp-3',
        parties: mockParties,
      };

      render(<PartyExplorer message={message} lang="en" />);

      // Filter by role: TRADER
      const roleSelect = screen.getByLabelText('Filter by role');
      fireEvent.change(roleSelect, { target: { value: 'TRADER' } });
      expect(screen.getByText('Sahyadri Commodity Merchants')).toBeInTheDocument();
      expect(screen.queryByText('Sangli Agro Processors Ltd')).not.toBeInTheDocument();

      // Reset role, filter by status: INACTIVE
      fireEvent.change(roleSelect, { target: { value: 'ALL' } });
      const statusSelect = screen.getByLabelText('Filter by status');
      fireEvent.change(statusSelect, { target: { value: 'INACTIVE' } });
      expect(screen.getByText('Akola Cotton Ginning Corp')).toBeInTheDocument();
      expect(screen.queryByText('Sangli Agro Processors Ltd')).not.toBeInTheDocument();
    });

    test('clicking party code or View Details button opens PartyDetailsModal', () => {
      const message = {
        id: 'msg-exp-4',
        parties: mockParties,
      };

      render(<PartyExplorer message={message} lang="en" />);

      // Click PRT-0001 code
      fireEvent.click(screen.getByText('PRT-0001'));

      // Modal appears
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Sangli Agro Processors Ltd' })).toBeInTheDocument();

      // Close modal
      const closeBtn = screen.getByLabelText('Close');
      fireEvent.click(closeBtn);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------
  // 3. PartyDetailsModal Component Tests
  // -------------------------------------------------------------
  describe('PartyDetailsModal Component', () => {
    test('renders tabs and all detailed fields correctly', () => {
      const party = mockParties[0];
      const handleClose = jest.fn();

      render(
        <PartyDetailsModal
          isOpen={true}
          party={party}
          onClose={handleClose}
          lang="en"
        />
      );

      // Dialog container
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getAllByText('Sangli Agro Processors Ltd')[0]).toBeInTheDocument();

      // Tab navigation
      expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Contact' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Business' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Activity' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Additional Info' })).toBeInTheDocument();

      // Overview Tab fields
      expect(screen.getByText('Party ID:')).toBeInTheDocument();
      expect(screen.getAllByText('PRT-0001')[0]).toBeInTheDocument();
      expect(screen.getByText('Sangli')).toBeInTheDocument();

      // Switch to Contact Tab
      fireEvent.click(screen.getByRole('tab', { name: 'Contact' }));
      expect(screen.getByText('Contact Person:')).toBeInTheDocument();
      expect(screen.getByText('Suresh Patil')).toBeInTheDocument();
      expect(screen.getByText('+919876543210')).toBeInTheDocument();
      expect(screen.getByText('suresh@sangliagro.com')).toBeInTheDocument();

      // Switch to Business Tab
      fireEvent.click(screen.getByRole('tab', { name: 'Business' }));
      expect(screen.getByText('GSTIN / Tax ID:')).toBeInTheDocument();
      expect(screen.getByText('27AABCS1234F1Z5')).toBeInTheDocument();
      expect(screen.getByText('PAN Number:')).toBeInTheDocument();
      expect(screen.getByText('AABCS1234F')).toBeInTheDocument();

      // Switch to Activity Tab
      fireEvent.click(screen.getByRole('tab', { name: 'Activity' }));
      expect(screen.getByText(/Activity records \(bids, supplies, demands, deals\)/i)).toBeInTheDocument();

      // Switch to Additional Info Tab
      fireEvent.click(screen.getByRole('tab', { name: 'Additional Info' }));
      expect(screen.getByText('Active Status:')).toBeInTheDocument();
      expect(screen.getByText('true')).toBeInTheDocument();
    });

    test('closes when Escape key is pressed', () => {
      const handleClose = jest.fn();

      render(
        <PartyDetailsModal
          isOpen={true}
          party={mockParties[0]}
          onClose={handleClose}
          lang="en"
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------
  // 4. ChatMessage Integration Tests
  // -------------------------------------------------------------
  describe('ChatMessage Integration for Parties', () => {
    test('renders PartyCountCard for "How many parties are registered in the marketplace?"', () => {
      const message = {
        id: 'chat-parties-count',
        role: 'assistant',
        userQuestion: 'How many parties are registered in the marketplace?',
        content: 'TradeX marketplace records report 4 registered parties.',
        displayType: 'PARTIES',
        parties: mockParties,
        language: 'en',
      };

      render(<ChatMessage message={message} />);

      expect(screen.getAllByText('Commodity AI Assistant')[0]).toBeInTheDocument();
      expect(screen.getByText('Registered Parties')).toBeInTheDocument();
      expect(screen.getByText('Total parties')).toBeInTheDocument();
      expect(screen.getByText('List all parties')).toBeInTheDocument();
    });

    test('renders PartyExplorer for "List all registered parties"', () => {
      const message = {
        id: 'chat-parties-list',
        role: 'assistant',
        userQuestion: 'List all registered parties',
        content: 'Here is the list of registered parties.',
        displayType: 'PARTIES',
        parties: mockParties,
        language: 'en',
      };

      render(<ChatMessage message={message} />);

      expect(screen.getByText('Registered Parties Explorer')).toBeInTheDocument();
      expect(screen.getByText('PRT-0001')).toBeInTheDocument();
      expect(screen.getByText('Sangli Agro Processors Ltd')).toBeInTheDocument();
    });

    test('renders PartyExplorer for location question "Which parties are registered in Sangli?"', () => {
      const message = {
        id: 'chat-parties-sangli',
        role: 'assistant',
        userQuestion: 'Which parties are registered in Sangli?',
        content: 'There are registered parties in Sangli.',
        displayType: 'PARTIES',
        parties: mockParties,
        language: 'en',
      };

      render(<ChatMessage message={message} />);

      expect(screen.getByText('Registered Parties Explorer')).toBeInTheDocument();
      expect(screen.getByText('Sangli Agro Processors Ltd')).toBeInTheDocument();
    });
  });
});
