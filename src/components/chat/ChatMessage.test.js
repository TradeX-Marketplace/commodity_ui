import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ChatMessage from './ChatMessage';

describe('ChatMessage Multilingual Support and Error Fallback Handling', () => {
  const sampleSoybeanRecords = [
    { date: '2026-10-01', rate: 4180.0, commodity: 'Soybean', location: 'Sangli', unit: 'Quintal' },
    { date: '2026-10-02', rate: 4200.0, commodity: 'Soybean', location: 'Sangli', unit: 'Quintal' },
    { date: '2026-10-03', rate: 4210.0, commodity: 'Soybean', location: 'Sangli', unit: 'Quintal' },
    { date: '2026-10-04', rate: 4225.0, commodity: 'Soybean', location: 'Sangli', unit: 'Quintal' },
    { date: '2026-10-05', rate: 4235.0, commodity: 'Soybean', location: 'Sangli', unit: 'Quintal' },
    { date: '2026-10-06', rate: 4240.0, commodity: 'Soybean', location: 'Sangli', unit: 'Quintal' },
    { date: '2026-10-07', rate: 4250.0, commodity: 'Soybean', location: 'Sangli', unit: 'Quintal' },
  ];

  test('generates natural Hindi rate summary and localized table when Gemini fails but 7 records exist', () => {
    const message = {
      id: 'assistant-test-1',
      role: 'assistant',
      userQuestion: 'पिछले 7 दिनों का सोयाबीन का रेट दिखाएं।',
      content: 'An error occurred while communicating with the AI service: Failed to generate content',
      language: 'hi',
      displayType: 'RATE',
      chartData: sampleSoybeanRecords,
      timestamp: '2026-10-07T12:00:00Z',
    };

    render(<ChatMessage message={message} />);

    // 1. Raw technical English error should NOT be displayed
    expect(
      screen.queryByText(/An error occurred while communicating with the AI service/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Failed to generate content/i)).not.toBeInTheDocument();

    // 2. Natural Hindi summary is synthesized using actual data
    expect(
      screen.getByText(/सांगली मंडी में सोयाबीन के पिछले 7 दिनों के वास्तविक बाजार भाव सफलतापूर्वक प्राप्त कर लिए गए हैं/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/दिनांक: 2026-10-07/i)).toBeInTheDocument();
    expect(screen.getByText(/न्यूनतम भाव ₹4,180 तथा उच्चतम भाव ₹4,250 प्रति Quintal/i)).toBeInTheDocument();

    // 3. Selection controls and table headers are localized in Hindi
    expect(screen.getByText('मार्केट जानकारी देखने का तरीका चुनें:')).toBeInTheDocument();
    expect(screen.getByText(/प्राप्त वास्तविक दरें \(7 रिकॉर्ड\)/i)).toBeInTheDocument();
    expect(screen.getByText('तारीख')).toBeInTheDocument();
    expect(screen.getByText('कमोडिटी')).toBeInTheDocument();
    expect(screen.getByText('भाव / दर')).toBeInTheDocument();
    expect(screen.getByText('इकाई')).toBeInTheDocument();
    expect(screen.getByText('मंडी / स्थान')).toBeInTheDocument();

    // 4. Rate view and Chart view can be toggled
    const chartTab = screen.getByRole('tab', { name: /Chart/i });
    fireEvent.click(chartTab);

    // Chart view renders TrendChart without error
    expect(screen.getByRole('heading', { name: /मूल्य रुझान/i })).toBeInTheDocument();
  });

  test('generates Marathi summary and localized controls for Marathi queries when AI generation fails', () => {
    const message = {
      id: 'assistant-test-2',
      role: 'assistant',
      userQuestion: 'गेल्या ७ दिवसांचे सोयाबीनचे दर दाखवा.',
      content: 'An error occurred while communicating with the AI service: 429 Quota Exceeded',
      language: 'mr',
      displayType: 'RATE',
      chartData: sampleSoybeanRecords,
      timestamp: '2026-10-07T12:00:00Z',
    };

    render(<ChatMessage message={message} />);

    // Raw error suppressed
    expect(screen.queryByText(/Quota Exceeded/i)).not.toBeInTheDocument();

    // Natural Marathi summary generated
    expect(
      screen.getByText(/सांगली बाजारपेठेत सोयाबीनचे मागील 7 दिवसांचे प्रत्यक्ष बाजार भाव यशस्वीरित्या उपलब्ध झाले आहेत/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/तारीख: 2026-10-07/i)).toBeInTheDocument();

    // Marathi table title and headers
    expect(screen.getByText(/प्राप्त झालेले प्रत्यक्ष दर \(7 नोंदी\)/i)).toBeInTheDocument();
    expect(screen.getByText('तारीख')).toBeInTheDocument();
    expect(screen.getByText('दर / भाव')).toBeInTheDocument();
    expect(screen.getByText('एकक')).toBeInTheDocument();
    expect(screen.getByText('बाजार / ठिकाण')).toBeInTheDocument();

    // Toggle to Chart view
    const chartTab = screen.getByRole('tab', { name: /Chart/i });
    fireEvent.click(chartTab);
    expect(screen.getByText(/किमतीचा कल/i)).toBeInTheDocument();
  });

  test('displays polite localized error message when AI fails and no records are returned', () => {
    const message = {
      id: 'assistant-test-3',
      role: 'assistant',
      userQuestion: 'सोयाबीन का रेट दिखाएं',
      content: 'An error occurred while communicating with the AI service: Failed to generate content',
      language: 'hi',
      chartData: null,
      timestamp: '2026-10-07T12:00:00Z',
    };

    render(<ChatMessage message={message} />);

    // Raw English error is replaced with user-friendly Hindi message
    expect(screen.queryByText(/Failed to generate content/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/क्षमा करें, AI सेवा के साथ संचार करने में अस्थायी समस्या आई/i)
    ).toBeInTheDocument();
  });

  test('preserves original English textual content when Gemini succeeds and allows toggling to Chart', () => {
    const message = {
      id: 'assistant-test-4',
      role: 'assistant',
      userQuestion: 'Show me the last 7 days of Soybean rates in Sangli',
      content: 'Here is the detailed price analysis for Soybean over the last 7 days in Sangli mandi.',
      language: 'en',
      displayType: 'RATE',
      chartData: sampleSoybeanRecords,
      timestamp: '2026-10-07T12:00:00Z',
    };

    render(<ChatMessage message={message} />);

    // Content from Gemini is preserved in Rate view
    expect(
      screen.getByText(/Here is the detailed price analysis for Soybean over the last 7 days in Sangli mandi/i)
    ).toBeInTheDocument();

    // English table title and headers
    expect(screen.getByText(/Actual Rates Retrieved for Period \(7 records\)/i)).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Commodity')).toBeInTheDocument();
    expect(screen.getByText('Price / Rate')).toBeInTheDocument();

    // Switch to Chart
    const chartTab = screen.getByRole('tab', { name: /Chart/i });
    fireEvent.click(chartTab);
    expect(screen.getByRole('heading', { level: 4, name: /Soybean Price Trend - Sangli/i })).toBeInTheDocument();
  });

  test('Scenario 1: Current Soybean rate in English renders professional rate card with NO Chart button', () => {
    const message = {
      id: 'current-rate-en',
      role: 'assistant',
      userQuestion: "What is today's Soybean rate in Sangli?",
      content: 'According to marketplace records, the current market rate for Soybean in Sangli is ₹4200 per Quintal (as of 2026-10-07).',
      language: 'en',
      displayType: 'RATE',
      chartData: null,
      timestamp: '2026-10-07T12:00:00Z',
    };

    const { container } = render(<ChatMessage message={message} />);

    // Professional rate card is rendered
    expect(container.querySelector('.single-current-rate-card')).toBeInTheDocument();
    expect(container.querySelector('.current-rate-badge-text')).toHaveTextContent(/Current Market Rate/i);
    expect(screen.getByText('4,200')).toBeInTheDocument();
    expect(screen.getAllByText(/Soybean/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Sangli/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Per Quintal/i).length).toBeGreaterThan(0);

    // CRITICAL REQUIREMENT: NO Chart button or tab for single current rate
    expect(screen.queryByRole('tab', { name: /Chart/i })).not.toBeInTheDocument();
    expect(container.querySelector('.trend-chart-card')).not.toBeInTheDocument();
    expect(container.querySelector('.view-selector-container')).not.toBeInTheDocument();
  });

  test('Scenario 2: Current Soybean rate in Hindi renders localized rate card with NO Chart button', () => {
    const message = {
      id: 'current-rate-hi',
      role: 'assistant',
      userQuestion: 'आज सांगली में सोयाबीन का भाव क्या है?',
      content: 'मार्केटप्लेस रिकॉर्ड्स के अनुसार, सांगली मंडी में आज सोयाबीन का भाव ₹4200 प्रति Quintal है (दिनांक: 2026-10-07)।',
      language: 'hi',
      displayType: 'RATE',
      chartData: null,
      timestamp: '2026-10-07T12:00:00Z',
    };

    const { container } = render(<ChatMessage message={message} />);

    // Localized Hindi card
    expect(container.querySelector('.single-current-rate-card')).toBeInTheDocument();
    expect(screen.getByText('वर्तमान बाजार भाव')).toBeInTheDocument();
    expect(screen.getByText('4,200')).toBeInTheDocument();
    expect(screen.getAllByText('सोयाबीन').length).toBeGreaterThan(0);
    expect(screen.getAllByText('सांगली').length).toBeGreaterThan(0);
    expect(screen.getByText('वर्तमान भाव')).toBeInTheDocument();

    // NO Chart button or tab
    expect(screen.queryByRole('tab', { name: /Chart/i })).not.toBeInTheDocument();
    expect(container.querySelector('.trend-chart-card')).not.toBeInTheDocument();
  });

  test('Scenario 3: Current Soybean rate in Marathi renders localized rate card with NO Chart button', () => {
    const message = {
      id: 'current-rate-mr',
      role: 'assistant',
      userQuestion: 'आज सांगलीत सोयाबीनचा दर किती आहे?',
      content: 'मार्केटप्लेसच्या नोंदीनुसार, सांगली बाजारपेठेत सोयाबीनचा आजचा दर ₹4200 प्रति Quintal आहे (दिनांक: 2026-10-07).',
      language: 'mr',
      displayType: 'RATE',
      chartData: null,
      timestamp: '2026-10-07T12:00:00Z',
    };

    const { container } = render(<ChatMessage message={message} />);

    // Localized Marathi card
    expect(container.querySelector('.single-current-rate-card')).toBeInTheDocument();
    expect(screen.getByText('सध्याचा बाजार दर')).toBeInTheDocument();
    expect(screen.getByText('4,200')).toBeInTheDocument();
    expect(screen.getAllByText('सोयाबीन').length).toBeGreaterThan(0);
    expect(screen.getAllByText('सांगली').length).toBeGreaterThan(0);
    expect(screen.getByText('सध्याचा दर')).toBeInTheDocument();

    // NO Chart button or tab
    expect(screen.queryByRole('tab', { name: /Chart/i })).not.toBeInTheDocument();
    expect(container.querySelector('.trend-chart-card')).not.toBeInTheDocument();
  });

  test('Scenario 7: Historical query with no available records renders localized empty state and NO Chart button', () => {
    const message = {
      id: 'history-no-records',
      role: 'assistant',
      userQuestion: 'Show me the last 7 days of Cotton rates in Pune',
      content: 'No historical rate records were found in the database for the requested period.',
      language: 'en',
      displayType: 'RATE',
      chartData: [],
      timestamp: '2026-10-07T12:00:00Z',
    };

    const { container } = render(<ChatMessage message={message} />);

    // Renders clean localized empty-state box
    expect(container.querySelector('.historical-unavailable-box')).toBeInTheDocument();
    expect(
      screen.getByText(/No historical rate data was found for this period to plot a trend chart/i)
    ).toBeInTheDocument();

    // NO Chart button or tab
    expect(screen.queryByRole('tab', { name: /Chart/i })).not.toBeInTheDocument();
    expect(container.querySelector('.trend-chart-card')).not.toBeInTheDocument();
    expect(container.querySelector('.view-selector-container')).not.toBeInTheDocument();
  });

  test('Scenario 7b: Historical Wheat query for October 8-14 returns empty chartData and mentions October 7 outside period without misleadingly presenting it in trend', () => {
    const message = {
      id: 'history-wheat-out-of-range',
      role: 'assistant',
      userQuestion: 'Show me the Wheat rate for the last 7 days',
      content: 'No Wheat historical rates are recorded for October 8–14, 2026.\n\nNote: The latest available Wheat rate on record is ₹2,800 per Quintal (Pune, 2026-10-07), which is outside the requested period.',
      language: 'en',
      displayType: null,
      chartData: [],
      timestamp: '2026-10-14T12:00:00Z',
    };

    const { container } = render(<ChatMessage message={message} />);

    // Renders clean localized empty-state box
    expect(container.querySelector('.historical-unavailable-box')).toBeInTheDocument();
    expect(
      screen.getByText(/No historical rate data was found for this period to plot a trend chart/i)
    ).toBeInTheDocument();

    // Renders clear message explaining no records for October 8-14
    expect(screen.getByText(/No Wheat historical rates are recorded for October 8–14, 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/outside the requested period/i)).toBeInTheDocument();

    // MUST NOT render a rate table or trend view pretending Oct 7 is in the requested trend
    expect(container.querySelector('.mini-records-table')).not.toBeInTheDocument();
    expect(screen.queryByText(/Actual Rates Retrieved for Period/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Chart/i })).not.toBeInTheDocument();
  });
});

describe('Dynamic Commodity Buttons for Buyer Demand', () => {
  test('detects 2, 3, and 5 commodities preserving exact query order and deduplicating', () => {
    // 1. Exactly 2 commodities: Compare Soybean and Wheat demand
    const msg2 = {
      id: 'demand-2',
      role: 'assistant',
      userQuestion: 'Compare Soybean and Wheat demand.',
      content: 'Comparison details.',
      language: 'en',
      displayType: 'DEMAND',
      commodities: ['Soybean', 'Wheat'],
      buyerDemands: [
        { buyerName: 'Buyer 1', commodityName: 'Soybean', quantity: 100, unit: 'Quintal', location: 'Sangli', requiredDate: '2026-10-15', status: 'ACTIVE' },
        { buyerName: 'Buyer 2', commodityName: 'Wheat', quantity: 200, unit: 'Quintal', location: 'Pune', requiredDate: '2026-10-16', status: 'ACTIVE' },
      ],
      timestamp: '2026-10-07T12:00:00Z',
    };
    const { unmount: unmount2 } = render(<ChatMessage message={msg2} />);
    const tablist2 = screen.getByRole('tablist', { name: /Commodity demand selector/i });
    const buttons2 = within(tablist2).getAllByRole('tab');
    expect(buttons2).toHaveLength(2);
    expect(buttons2[0]).toHaveTextContent(/^Soybean/);
    expect(buttons2[1]).toHaveTextContent(/^Wheat/);
    unmount2();

    // 2. Exactly 3 commodities: Compare Soybean, Wheat, and Rice demand
    const msg3 = {
      id: 'demand-3',
      role: 'assistant',
      userQuestion: 'Compare Soybean, Wheat, and Rice demand.',
      content: 'Comparison details.',
      language: 'en',
      displayType: 'DEMAND',
      commodities: ['Soybean', 'Wheat', 'Rice'],
      buyerDemands: [],
      timestamp: '2026-10-07T12:00:00Z',
    };
    const { unmount: unmount3 } = render(<ChatMessage message={msg3} />);
    const tablist3 = screen.getByRole('tablist', { name: /Commodity demand selector/i });
    const buttons3 = within(tablist3).getAllByRole('tab');
    expect(buttons3).toHaveLength(3);
    expect(buttons3[0]).toHaveTextContent(/^Soybean/);
    expect(buttons3[1]).toHaveTextContent(/^Wheat/);
    expect(buttons3[2]).toHaveTextContent(/^Rice/);
    unmount3();

    // 3. Exactly 5 commodities: Compare Soybean, Wheat, Rice, Maize, and Cotton demand
    const msg5 = {
      id: 'demand-5',
      role: 'assistant',
      userQuestion: 'Compare Soybean, Wheat, Rice, Maize, and Cotton demand.',
      content: 'Comparison details.',
      language: 'en',
      displayType: 'DEMAND',
      commodities: ['Soybean', 'Wheat', 'Rice', 'Maize', 'Cotton'],
      buyerDemands: [],
      timestamp: '2026-10-07T12:00:00Z',
    };
    const { unmount: unmount5 } = render(<ChatMessage message={msg5} />);
    const tablist5 = screen.getByRole('tablist', { name: /Commodity demand selector/i });
    const buttons5 = within(tablist5).getAllByRole('tab');
    expect(buttons5).toHaveLength(5);
    expect(buttons5[0]).toHaveTextContent(/^Soybean/);
    expect(buttons5[1]).toHaveTextContent(/^Wheat/);
    expect(buttons5[2]).toHaveTextContent(/^Rice/);
    expect(buttons5[3]).toHaveTextContent(/^Maize/);
    expect(buttons5[4]).toHaveTextContent(/^Cotton/);
    unmount5();

    // 4. Preserve query order: Wheat before Soybean
    const msgOrder = {
      id: 'demand-order',
      role: 'assistant',
      userQuestion: 'Compare Wheat and Soybean demand.',
      content: 'Comparison details.',
      language: 'en',
      displayType: 'DEMAND',
      commodities: ['Wheat', 'Soybean'],
      buyerDemands: [],
      timestamp: '2026-10-07T12:00:00Z',
    };
    const { unmount: unmountOrder } = render(<ChatMessage message={msgOrder} />);
    const tablistOrder = screen.getByRole('tablist', { name: /Commodity demand selector/i });
    const buttonsOrder = within(tablistOrder).getAllByRole('tab');
    expect(buttonsOrder[0]).toHaveTextContent(/^Wheat/);
    expect(buttonsOrder[1]).toHaveTextContent(/^Soybean/);
    unmountOrder();

    // 5. Case-insensitive deduplication: Soybean mentioned twice
    const msgDedup = {
      id: 'demand-dedup',
      role: 'assistant',
      userQuestion: 'Compare Soybean, wheat and soybean demand.',
      content: 'Comparison details.',
      language: 'en',
      displayType: 'DEMAND',
      commodities: ['Soybean', 'Wheat', 'soybean'],
      buyerDemands: [],
      timestamp: '2026-10-07T12:00:00Z',
    };
    const { unmount: unmountDedup } = render(<ChatMessage message={msgDedup} />);
    const tablistDedup = screen.getByRole('tablist', { name: /Commodity demand selector/i });
    const buttonsDedup = within(tablistDedup).getAllByRole('tab');
    expect(buttonsDedup).toHaveLength(2);
    unmountDedup();

    // 6. No identifiable commodity: do not fabricate buttons
    const msgNone = {
      id: 'demand-none',
      role: 'assistant',
      userQuestion: 'How many buyers are looking for commodities?',
      content: 'No specific commodity requested.',
      language: 'en',
      displayType: 'DEMAND',
      commodities: [],
      buyerDemands: [],
      timestamp: '2026-10-07T12:00:00Z',
    };
    const { unmount: unmountNone } = render(<ChatMessage message={msgNone} />);
    expect(screen.queryByRole('tablist', { name: /Commodity demand selector/i })).not.toBeInTheDocument();
    unmountNone();
  });

  test('switching active commodity displays only that commodity records and isolates others', () => {
    const message = {
      id: 'demand-switch',
      role: 'assistant',
      userQuestion: 'Compare Soybean, Wheat, and Rice demand.',
      content: 'Market buyer demand comparison.',
      language: 'en',
      displayType: 'DEMAND',
      commodities: ['Soybean', 'Wheat', 'Rice'],
      buyerDemands: [
        {
          id: 1,
          buyerName: 'ABC Foods Pvt Ltd',
          commodityName: 'Soybean',
          quantity: 500,
          unit: 'Quintal',
          location: 'Sangli',
          requiredDate: '2026-10-15',
          status: 'ACTIVE',
        },
        {
          id: 2,
          buyerName: 'Kisan Agro Industries',
          commodityName: 'Wheat',
          quantity: 300,
          unit: 'Quintal',
          location: 'Pune',
          requiredDate: '2026-10-18',
          status: 'PENDING',
        },
      ],
      timestamp: '2026-10-07T12:00:00Z',
    };

    render(<ChatMessage message={message} />);

    const tablist = screen.getByRole('tablist', { name: /Commodity demand selector/i });
    const [soybeanBtn, wheatBtn, riceBtn] = within(tablist).getAllByRole('tab');

    // 1. Initial view: Soybean is selected
    expect(soybeanBtn).toHaveClass('active');
    expect(screen.getByText('ABC Foods Pvt Ltd')).toBeInTheDocument();
    expect(screen.queryByText('Kisan Agro Industries')).not.toBeInTheDocument();
    expect(screen.getByText('Demand Records: 1')).toBeInTheDocument();

    // 2. Switch to Wheat
    fireEvent.click(wheatBtn);
    expect(wheatBtn).toHaveClass('active');
    expect(soybeanBtn).not.toHaveClass('active');
    expect(screen.getByText('Kisan Agro Industries')).toBeInTheDocument();
    // Critical: Soybean records must NEVER appear under Wheat!
    expect(screen.queryByText('ABC Foods Pvt Ltd')).not.toBeInTheDocument();
    expect(screen.getByText('Demand Records: 1')).toBeInTheDocument();

    // 3. Switch to Rice (has 0 records)
    fireEvent.click(riceBtn);
    expect(riceBtn).toHaveClass('active');
    expect(screen.getByText('No demand records found for this commodity.')).toBeInTheDocument();
    // Critical: Neither Soybean nor Wheat records appear under Rice!
    expect(screen.queryByText('ABC Foods Pvt Ltd')).not.toBeInTheDocument();
    expect(screen.queryByText('Kisan Agro Industries')).not.toBeInTheDocument();
  });

  test('distinct buyers count does not simply count demand records', () => {
    // 2 demand rows for the SAME buyer -> distinct buyers should be 1
    const message = {
      id: 'demand-distinct-buyers',
      role: 'assistant',
      userQuestion: 'What is the demand for Soybean?',
      content: 'Demand for Soybean.',
      language: 'en',
      displayType: 'DEMAND',
      commodities: ['Soybean'],
      buyerDemands: [
        {
          id: 1,
          buyerName: 'ABC Foods Pvt Ltd',
          commodityName: 'Soybean',
          quantity: 300,
          unit: 'Quintal',
          location: 'Sangli',
          requiredDate: '2026-10-15',
          status: 'ACTIVE',
        },
        {
          id: 2,
          buyerName: 'ABC Foods Pvt Ltd',
          commodityName: 'Soybean',
          quantity: 200,
          unit: 'Quintal',
          location: 'Sangli',
          requiredDate: '2026-10-20',
          status: 'ACTIVE',
        },
      ],
      timestamp: '2026-10-07T12:00:00Z',
    };

    render(<ChatMessage message={message} />);

    // Total records = 2
    expect(screen.getByText('Demand Records: 2')).toBeInTheDocument();
    // Distinct buyers = 1 (NOT 2)
    expect(screen.getByText('Distinct Buyers: 1')).toBeInTheDocument();
  });

  test('aggregates quantity only when units are identical and does NOT combine different units', () => {
    // Case A: Identical units (Quintal) -> aggregated total 800 Quintal
    const msgUniform = {
      id: 'demand-uniform-unit',
      role: 'assistant',
      userQuestion: 'What is the demand for Soybean?',
      content: 'Demand details.',
      language: 'en',
      displayType: 'DEMAND',
      commodities: ['Soybean'],
      buyerDemands: [
        { id: 1, buyerName: 'Buyer A', commodityName: 'Soybean', quantity: 500, unit: 'Quintal' },
        { id: 2, buyerName: 'Buyer B', commodityName: 'Soybean', quantity: 300, unit: 'Quintal' },
      ],
      timestamp: '2026-10-07T12:00:00Z',
    };

    const { unmount: unmountUniform } = render(<ChatMessage message={msgUniform} />);
    expect(screen.getByText('Total Quantity: 800 Quintal')).toBeInTheDocument();
    unmountUniform();

    // Case B: Different units (Quintal and MT) -> MUST NOT combine different units
    const msgMixed = {
      id: 'demand-mixed-unit',
      role: 'assistant',
      userQuestion: 'What is the demand for Soybean?',
      content: 'Demand details.',
      language: 'en',
      displayType: 'DEMAND',
      commodities: ['Soybean'],
      buyerDemands: [
        { id: 1, buyerName: 'Buyer A', commodityName: 'Soybean', quantity: 500, unit: 'Quintal' },
        { id: 2, buyerName: 'Buyer B', commodityName: 'Soybean', quantity: 10, unit: 'MT' },
      ],
      timestamp: '2026-10-07T12:00:00Z',
    };

    const { unmount: unmountMixed } = render(<ChatMessage message={msgMixed} />);
    // Total quantity stat pill must NOT be rendered when units are mismatched
    expect(screen.queryByText(/Total Quantity:/i)).not.toBeInTheDocument();
    unmountMixed();
  });

  test('full Marathi localization for commodity names, labels, badges, and empty states', () => {
    const message = {
      id: 'demand-mr',
      role: 'assistant',
      userQuestion: 'सोयाबीन आणि गव्हाची मागणी दाखवा.',
      content: 'खरेदीदार मागणी माहिती.',
      language: 'mr',
      displayType: 'DEMAND',
      commodities: ['Soybean', 'Wheat'],
      buyerDemands: [
        {
          id: 1,
          buyerName: 'गोदरेज ॲग्रोव्हेट',
          commodityName: 'Soybean',
          quantity: 450,
          unit: 'Quintal',
          location: 'सांगली',
          requiredDate: '2026-10-15',
          status: 'ACTIVE',
        },
      ],
      timestamp: '2026-10-07T12:00:00Z',
    };

    render(<ChatMessage message={message} />);

    // Selector prompt in Marathi
    expect(screen.getByText('खरेदीदार मागणी पाहण्यासाठी शेतमाल निवडा:')).toBeInTheDocument();

    // Button labels in Marathi
    expect(screen.getByRole('tab', { name: /सोयाबीन/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /गहू/i })).toBeInTheDocument();

    // Stat badges in Marathi
    expect(screen.getByText('मागणी नोंदी: 1')).toBeInTheDocument();
    expect(screen.getByText('एकूण खरेदीदार: 1')).toBeInTheDocument();
    expect(screen.getByText('एकूण प्रमाण: 450 Quintal')).toBeInTheDocument();

    // Table headers in Marathi
    expect(screen.getByText('खरेदीदार')).toBeInTheDocument();
    expect(screen.getByText('शेतमाल')).toBeInTheDocument();
    expect(screen.getByText('प्रमाण')).toBeInTheDocument();
    expect(screen.getByText('ठिकाण')).toBeInTheDocument();
    expect(screen.getByText('आवश्यक तारीख')).toBeInTheDocument();
    expect(screen.getByText('स्थिती')).toBeInTheDocument();

    // Switch to Wheat (has 0 records)
    const wheatBtn = screen.getByRole('tab', { name: /गहू/i });
    fireEvent.click(wheatBtn);

    // Localized Marathi empty state
    expect(screen.getByText('या शेतमालासाठी कोणतीही मागणी नोंद आढळली नाही.')).toBeInTheDocument();
  });

  test('full Hindi localization for commodity names, labels, badges, and empty states', () => {
    const message = {
      id: 'demand-hi',
      role: 'assistant',
      userQuestion: 'सोयाबीन और गेहूं की मांग दिखाएं।',
      content: 'खरीदार मांग जानकारी।',
      language: 'hi',
      displayType: 'DEMAND',
      commodities: ['Soybean', 'Wheat'],
      buyerDemands: [
        {
          id: 1,
          buyerName: 'पतंजलि फूड्स',
          commodityName: 'Soybean',
          quantity: 600,
          unit: 'Quintal',
          location: 'सांगली',
          requiredDate: '2026-10-15',
          status: 'ACTIVE',
        },
      ],
      timestamp: '2026-10-07T12:00:00Z',
    };

    render(<ChatMessage message={message} />);

    // Selector prompt in Hindi
    expect(screen.getByText('खरीदार मांग देखने के लिए कमोडिटी चुनें:')).toBeInTheDocument();

    // Button labels in Hindi
    expect(screen.getByRole('tab', { name: /सोयाबीन/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /गेहूं/i })).toBeInTheDocument();

    // Stat badges in Hindi
    expect(screen.getByText('मांग रिकॉर्ड: 1')).toBeInTheDocument();
    expect(screen.getByText('विशिष्ट खरीदार: 1')).toBeInTheDocument();
    expect(screen.getByText('कुल मात्रा: 600 Quintal')).toBeInTheDocument();

    // Table headers in Hindi
    expect(screen.getByText('खरीदार')).toBeInTheDocument();
    expect(screen.getByText('कमोडिटी')).toBeInTheDocument();
    expect(screen.getByText('मात्रा')).toBeInTheDocument();
    expect(screen.getByText('स्थान')).toBeInTheDocument();
    expect(screen.getByText('आवश्यक तिथि')).toBeInTheDocument();
    expect(screen.getByText('स्थिति')).toBeInTheDocument();

    // Switch to Wheat (has 0 records)
    const wheatBtn = screen.getByRole('tab', { name: /गेहूं/i });
    fireEvent.click(wheatBtn);

    // Localized Hindi empty state
    expect(screen.getByText('इस कमोडिटी के लिए कोई मांग रिकॉर्ड नहीं मिला।')).toBeInTheDocument();
  });

  test('displays clear error notice when marketplace API fails, not presenting failure as zero demand', () => {
    const message = {
      id: 'demand-error',
      role: 'assistant',
      userQuestion: 'सोयाबीनची मागणी दाखवा.',
      content: 'मार्केटप्लेस सेवा सध्या अनुपलब्ध आहे. या वेळी खरेदीदार मागणीच्या नोंदी मिळवता आल्या नाहीत.',
      language: 'mr',
      displayType: 'DEMAND',
      commodities: ['Soybean'],
      buyerDemands: [],
      timestamp: '2026-10-07T12:00:00Z',
    };

    const { container } = render(<ChatMessage message={message} />);

    // Must render error box, NOT empty box
    expect(container.querySelector('.demand-error-box')).toBeInTheDocument();
    expect(
      screen.getByText(/मार्केटप्लेस सेवा सध्या अनुपलब्ध आहे\. या वेळी खरेदीदार मागणीच्या नोंदी मिळवता आल्या नाहीत\./i)
    ).toBeInTheDocument();
    expect(container.querySelector('.demand-empty-box')).not.toBeInTheDocument();
  });

  test('renders order inquiry response directly when displayType is ORDERS without error masking', () => {
    const ordersContent =
      '**Marketplace Order Tracking Status: Placed Orders Not Available**\n\n' +
      'Currently, placed order records are not tracked or available in the marketplace backend for **Soybean**.\n\n' +
      '### Distinction of Records:\n' +
      '- **Placed Orders**: Actual executed customer buy/sell orders (missing endpoint: `GET /api/ai/orders`).\n' +
      '- **Buyer Demands**: Active RFQs and requests from buyers.\n' +
      '- **Market Rates**: Daily mandi benchmark prices.\n\n' +
      '### Required Marketplace Backend Integration:\n' +
      '- **Missing Endpoint**: `GET /api/ai/orders`\n' +
      '- **Required Backend Table**: `orders`';

    const message = {
      id: 'orders-msg-1',
      role: 'assistant',
      userQuestion: 'order of soybean',
      content: ordersContent,
      language: 'en',
      displayType: 'ORDERS',
      chartData: null,
      buyerDemands: null,
      timestamp: '2026-10-14T12:00:00Z',
    };

    const { container } = render(<ChatMessage message={message} />);

    // Content should NOT be replaced by AI communication error
    expect(
      screen.queryByText(/The AI service encountered a temporary communication issue/i)
    ).not.toBeInTheDocument();

    // Actual order tracking explanation is rendered
    expect(screen.getByText(/Marketplace Order Tracking Status: Placed Orders Not Available/i)).toBeInTheDocument();
    expect(screen.getByText(/Currently, placed order records are not tracked or available/i)).toBeInTheDocument();
    expect(screen.getByText(/Distinction of Records:/i)).toBeInTheDocument();

    // Must NOT render as demand table or chart
    expect(container.querySelector('.commodity-demand-container')).not.toBeInTheDocument();
    expect(container.querySelector('.view-selector-container')).not.toBeInTheDocument();
  });

  test('renders Hindi and Marathi order inquiry responses directly when displayType is ORDERS', () => {
    const hindiOrdersContent =
      '**मार्केटप्लेस ऑर्डर ट्रैकिंग स्थिति: ऑर्डर्स उपलब्ध नहीं**\n\n' +
      'वर्तमान में **Soybean** के लिए मार्केटप्लेस बैकएंड में कोई पूर्ण या दिए गए ऑर्डर (Placed Orders) रिकॉर्ड उपलब्ध नहीं हैं।\n\n' +
      '### रिकॉर्ड का अंतर:\n' +
      '- **ऑर्डर्स (Placed Orders)**: वास्तविक निष्पादित खरीद/बिक्री आदेश। वर्तमान में बैकएंड में `GET /api/ai/orders` एंडपॉइंट उपलब्ध नहीं है।';

    const message = {
      id: 'orders-msg-hi',
      role: 'assistant',
      userQuestion: 'सोयाबीन के ऑर्डर्स दिखाएं',
      content: hindiOrdersContent,
      language: 'hi',
      displayType: 'ORDERS',
      chartData: null,
      buyerDemands: null,
      timestamp: '2026-10-14T12:00:00Z',
    };

    render(<ChatMessage message={message} />);

    expect(
      screen.queryByText(/क्षमा करें, AI सेवा के साथ संचार करने में अस्थायी समस्या आई/i)
    ).not.toBeInTheDocument();
    expect(screen.getByText(/मार्केटप्लेस ऑर्डर ट्रैकिंग स्थिति: ऑर्डर्स उपलब्ध नहीं/i)).toBeInTheDocument();
  });
});

