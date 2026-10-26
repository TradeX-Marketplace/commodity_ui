import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import App from './App';

describe('Commodity Admin AI Dashboard', () => {
  beforeEach(() => {
    window.location.hash = '';
    localStorage.clear();
    // Default to completed setup for general tests; dedicated tests will remove this
    localStorage.setItem('commodity_ai_lang_setup_completed', 'true');
    localStorage.setItem('commodity_ai_chat_display_lang', 'en');
    localStorage.setItem('commodity_ai_voice_input_lang', 'en-IN');

    // Mock global fetch to prevent unhandled network requests in test environment
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        headers: {
          get: () => 'application/json',
        },
        json: () => Promise.resolve([]),
      })
    );
  });

  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test('renders sidebar brand and navigation tabs', async () => {
    await React.act(async () => {
      render(<App />);
    });

    // Brand title
    expect(screen.getAllByText(/Commodity Admin/i)[0]).toBeInTheDocument();

    const nav = screen.getByRole('navigation', { name: /Main Administration Navigation/i });

    // Sidebar navigation items: only AI Admin Assistant is visible, other 7 items are hidden
    expect(within(nav).getByRole('button', { name: /AI Admin Assistant/i })).toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: /Dashboard Overview/i })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: /Commodities/i })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: /Market Rates/i })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: /Rate History/i })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: /Buyer Demands/i })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: /Notifications/i })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: /WhatsApp Logs/i })).not.toBeInTheDocument();
  });

  test('defaults to AI Admin Assistant view and provides chat input', async () => {
    await React.act(async () => {
      render(<App />);
    });

    expect(screen.getByRole('textbox', { name: /Chat question input/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear Chat/i })).toBeInTheDocument();
  });

  test('integrates AI chatbot with microphone button and Rate/Chart view options', async () => {
    await React.act(async () => {
      render(<App />);
    });

    const nav = screen.getByRole('navigation', { name: /Main Administration Navigation/i });
    const aiBtn = within(nav).getByRole('button', { name: /AI Admin Assistant/i });
    await React.act(async () => {
      fireEvent.click(aiBtn);
    });

    // Check voice input microphone button
    expect(screen.getByRole('button', { name: /speech recognition/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Voice:/i)).toBeInTheDocument();

    // Check Rate and Chart response view options on initial assistant message
    const rateTab = screen.getByRole('tab', { name: /Rate/i });
    const chartTab = screen.getByRole('tab', { name: /Chart/i });
    expect(rateTab).toBeInTheDocument();
    expect(chartTab).toBeInTheDocument();

    // Toggle to Chart
    await React.act(async () => {
      fireEvent.click(chartTab);
    });
    expect(chartTab).toHaveAttribute('aria-selected', 'true');
    expect(rateTab).toHaveAttribute('aria-selected', 'false');

    // Toggle back to Rate without sending an API request
    await React.act(async () => {
      fireEvent.click(rateTab);
    });
    expect(rateTab).toHaveAttribute('aria-selected', 'true');
  });

  test('displays Rate and Chart selection options when user asks for 7 days rate', async () => {
    // Mock chat response with 7 days rate history
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/admin/chat')) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () =>
            Promise.resolve({
              sessionId: 101,
              message:
                "Market Rate Information:\nCommodity: Soybean\nLocation: Sangli\nRate: 42000 per MT\nDate: 2026-10-01\n\nCommodity: Soybean\nLocation: Sangli\nRate: 42500 per MT\nDate: 2026-10-02",
              language: 'en',
              displayType: 'CHART',
              chartData: [
                { date: '2026-10-01', rate: 42000 },
                { date: '2026-10-02', rate: 42500 },
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

    await React.act(async () => {
      render(<App />);
    });

    const nav = screen.getByRole('navigation', { name: /Main Administration Navigation/i });
    const aiBtn = within(nav).getByRole('button', { name: /AI Admin Assistant/i });
    await React.act(async () => {
      fireEvent.click(aiBtn);
    });

    // Type 7 days question
    const input = screen.getByLabelText(/Chat question input/i);
    await React.act(async () => {
      fireEvent.change(input, {
        target: { value: 'Show me the Soybean rate for the last 7 days.' },
      });
    });

    // Send question
    const sendBtn = screen.getByRole('button', { name: /Send Question/i });
    await React.act(async () => {
      fireEvent.click(sendBtn);
    });

    // Verify selection prompt is displayed
    const promptEl = screen.getByText(
      /Select how you want to view the market information/i
    );
    expect(promptEl).toBeInTheDocument();
    expect(screen.getByText(/Price and details/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Price trend/i)[0]).toBeInTheDocument();

    const selectorContainer = promptEl.closest('.view-selector-container');
    expect(selectorContainer).toBeInTheDocument();

    // Toggle to Rate
    const rateChoice = within(selectorContainer).getByRole('tab', { name: /Rate/i });
    await React.act(async () => {
      fireEvent.click(rateChoice);
    });
    expect(rateChoice).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByText(/Actual Rates Retrieved for Period/i)
    ).toBeInTheDocument();

    // Toggle to Chart
    const chartChoice = within(selectorContainer).getByRole('tab', { name: /Chart/i });
    await React.act(async () => {
      fireEvent.click(chartChoice);
    });
    expect(chartChoice).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { level: 4, name: /Price Trend/i })).toBeInTheDocument();
  });

  test('correctly extracts 7 days Soybean markdown table and plots it in Chart view without extra fetch calls', async () => {
    let chatCallCount = 0;
    const markdownTableResponse = `Here is the Soybean rate information for the last 7 days:

| Date | Rate (INR per Quintal) |
|---|---:|
| 2026-10-01 | 4180.0 |
| 2026-10-02 | 4200.0 |
| 2026-10-03 | 4210.0 |
| 2026-10-04 | 4225.0 |
| 2026-10-05 | 4235.0 |
| 2026-10-06 | 4240.0 |
| 2026-10-07 | 4250.0 |
`;

    global.fetch = jest.fn((url) => {
      if (url.includes('/api/admin/chat')) {
        chatCallCount++;
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () =>
            Promise.resolve({
              sessionId: 202,
              message: markdownTableResponse,
              language: 'en',
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve([]),
      });
    });

    await React.act(async () => {
      render(<App />);
    });

    const nav = screen.getByRole('navigation', { name: /Main Administration Navigation/i });
    const aiBtn = within(nav).getByRole('button', { name: /AI Admin Assistant/i });
    await React.act(async () => {
      fireEvent.click(aiBtn);
    });

    // Ask 7-day Soybean query
    const input = screen.getByLabelText(/Chat question input/i);
    await React.act(async () => {
      fireEvent.change(input, {
        target: { value: 'Show me the Soybean rate for the last 7 days.' },
      });
    });

    const sendBtn = screen.getByRole('button', { name: /Send Question/i });
    await React.act(async () => {
      fireEvent.click(sendBtn);
    });

    // 1. Verify Rate view displays all 7 dated records
    expect(screen.getByText(/Actual Rates Retrieved for Period \(7 records\)/i)).toBeInTheDocument();
    expect(screen.getByText(/4,180/i)).toBeInTheDocument();
    expect(screen.getByText(/4,250/i)).toBeInTheDocument();
    expect(chatCallCount).toBe(1);

    // 2. Switch to Chart view
    const selectorContainer = screen.getByText(/Select how you want to view/i).closest('.view-selector-container');
    const chartTab = within(selectorContainer).getByRole('tab', { name: /Chart/i });
    await React.act(async () => {
      fireEvent.click(chartTab);
    });

    // Verify Chart view plots records without showing error state
    expect(screen.queryByText(/No historical rate data was found/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Soybean Price Trend/i)).toBeInTheDocument();
    expect(screen.getByText(/Range: ₹4,180 - ₹4,250 per Quintal/i)).toBeInTheDocument();

    // 3. Confirm switching views sent NO extra chat requests
    expect(chatCallCount).toBe(1);

    // Switch back to Rate
    const rateTab = within(selectorContainer).getByRole('tab', { name: /Rate/i });
    await React.act(async () => {
      fireEvent.click(rateTab);
    });
    expect(screen.getByText(/Actual Rates Retrieved for Period \(7 records\)/i)).toBeInTheDocument();
    expect(chatCallCount).toBe(1);
  });

  test('does not plot demand-only queries as rates', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/admin/chat')) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () =>
            Promise.resolve({
              sessionId: 303,
              message: "Today's total buyer demand for Soybean is 450 MT across Maharashtra mandis.",
              language: 'en',
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve([]),
      });
    });

    await React.act(async () => {
      render(<App />);
    });

    const nav = screen.getByRole('navigation', { name: /Main Administration Navigation/i });
    const aiBtn = within(nav).getByRole('button', { name: /AI Admin Assistant/i });
    await React.act(async () => {
      fireEvent.click(aiBtn);
    });

    const input = screen.getByLabelText(/Chat question input/i);
    await React.act(async () => {
      fireEvent.change(input, {
        target: { value: 'Today what is the demand for Soybean?' },
      });
    });

    const sendBtn = screen.getByRole('button', { name: /Send Question/i });
    await React.act(async () => {
      fireEvent.click(sendBtn);
    });

    // Demand message is rendered as text without forcing the historical rate view selector
    expect(screen.getByText(/Today's total buyer demand for Soybean is 450 MT/i)).toBeInTheDocument();
    expect(screen.queryByText(/Select how you want to view the market information/i)).not.toBeInTheDocument();

    // Verify 450 MT was NOT parsed as a rate in the Rate table
    expect(screen.queryByText(/Actual Rates Retrieved for Period/i)).not.toBeInTheDocument();
  });

  test('displays welcome language-selection screen on first conversation and transitions to chat with selected languages', async () => {
    // Simulate first-time user: clear completion flag
    localStorage.removeItem('commodity_ai_lang_setup_completed');

    let chatFetchCalled = false;
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/admin/chat')) {
        chatFetchCalled = true;
      }
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve([]),
      });
    });

    await React.act(async () => {
      render(<App />);
    });

    const nav = screen.getByRole('navigation', { name: /Main Administration Navigation/i });
    const aiBtn = within(nav).getByRole('button', { name: /AI Admin Assistant/i });
    await React.act(async () => {
      fireEvent.click(aiBtn);
    });

    // 1. Verify Welcome Screen appears
    expect(screen.getByTestId('welcome-language-screen')).toBeInTheDocument();
    expect(screen.getByText(/Welcome to Commodity Admin AI/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Please select your preferred languages to start your conversation\./i)
    ).toBeInTheDocument();

    // 2. Verify Dropdown 1 (Chat Display Language) & Dropdown 2 (Voice Input Language)
    const displayLangSelect = screen.getByLabelText(/Chat Display Language/i);
    const voiceLangSelect = screen.getByLabelText(/Voice Input Language/i);
    const continueBtn = screen.getByRole('button', { name: /Continue to Chat/i });

    expect(displayLangSelect).toBeInTheDocument();
    expect(voiceLangSelect).toBeInTheDocument();
    expect(continueBtn).toBeInTheDocument();

    // No backend request should be sent before user continues
    expect(chatFetchCalled).toBe(false);

    // 3. User selects Hindi for Chat Display Language and Marathi for Voice Input Language
    await React.act(async () => {
      fireEvent.change(displayLangSelect, { target: { value: 'hi' } });
      fireEvent.change(voiceLangSelect, { target: { value: 'mr-IN' } });
    });

    // 4. Click Continue to Chat
    await React.act(async () => {
      fireEvent.click(continueBtn);
    });

    // 5. Verify transition: welcome screen is gone, chat interface is mounted
    expect(screen.queryByTestId('welcome-language-screen')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Chat question input/i)).toBeInTheDocument();

    // 6. Verify preferences are persisted in localStorage
    expect(localStorage.getItem('commodity_ai_lang_setup_completed')).toBe('true');
    expect(localStorage.getItem('commodity_ai_chat_display_lang')).toBe('hi');
    expect(localStorage.getItem('commodity_ai_voice_input_lang')).toBe('mr-IN');

    // 7. Verify suggested questions are presented in Hindi
    expect(screen.getByText(/सुझाए गए प्रश्न:/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /पिछले 7 दिनों का सोयाबीन का रेट दिखाएं।/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /सोयाबीन का आज का भाव क्या है\?/i })[0]).toBeInTheDocument();

    // 8. Verify voice input dropdown reflects mr-IN
    const headerVoiceSelect = screen.getByLabelText(/Voice Input Language/i);
    expect(headerVoiceSelect.value).toBe('mr-IN');
  });

  test('allows independent language changes in header and persists across reloads', async () => {
    // Pre-populate preferences
    localStorage.setItem('commodity_ai_lang_setup_completed', 'true');
    localStorage.setItem('commodity_ai_chat_display_lang', 'hi');
    localStorage.setItem('commodity_ai_voice_input_lang', 'mr-IN');

    await React.act(async () => {
      render(<App />);
    });

    const nav = screen.getByRole('navigation', { name: /Main Administration Navigation/i });
    const aiBtn = within(nav).getByRole('button', { name: /AI Admin Assistant/i });
    await React.act(async () => {
      fireEvent.click(aiBtn);
    });

    // Chatbot is directly visible
    expect(screen.queryByTestId('welcome-language-screen')).not.toBeInTheDocument();

    // Initial state: Hindi suggestions
    expect(screen.getByText(/सुझाए गए प्रश्न:/i)).toBeInTheDocument();

    // 1. Change display language to Marathi via header dropdown
    const headerDisplaySelect = screen.getByLabelText(/Chat Display Language/i);
    await React.act(async () => {
      fireEvent.change(headerDisplaySelect, { target: { value: 'mr' } });
    });

    // Suggestions immediately update to Marathi
    expect(screen.getByText(/सुचवलेले प्रश्न:/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /गेल्या ७ दिवसांचे सोयाबीनचे दर दाखवा\./i })[0]).toBeInTheDocument();
    expect(localStorage.getItem('commodity_ai_chat_display_lang')).toBe('mr');

    // Voice language should stay mr-IN
    const headerVoiceSelect = screen.getByLabelText(/Voice Input Language/i);
    expect(headerVoiceSelect.value).toBe('mr-IN');

    // 2. Change voice language to en-IN via header dropdown
    await React.act(async () => {
      fireEvent.change(headerVoiceSelect, { target: { value: 'en-IN' } });
    });

    expect(headerVoiceSelect.value).toBe('en-IN');
    expect(localStorage.getItem('commodity_ai_voice_input_lang')).toBe('en-IN');
    // Display language remains Marathi
    expect(screen.getByText(/सुचवलेले प्रश्न:/i)).toBeInTheDocument();

    // 3. Reopen language settings modal
    const langSettingsBtn = screen.getByRole('button', { name: /Language Settings/i });
    await React.act(async () => {
      fireEvent.click(langSettingsBtn);
    });

    const modal = screen.getByRole('dialog', { name: /Language Settings/i });
    expect(modal).toBeInTheDocument();

    // Close modal via close button
    const closeBtn = screen.getByRole('button', { name: /Close language settings/i });
    await React.act(async () => {
      fireEvent.click(closeBtn);
    });
    expect(screen.queryByRole('dialog', { name: /Language Settings/i })).not.toBeInTheDocument();
  });

  test('passes selected display language in POST /api/admin/chat request body', async () => {
    localStorage.setItem('commodity_ai_lang_setup_completed', 'true');
    localStorage.setItem('commodity_ai_chat_display_lang', 'mr');
    localStorage.setItem('commodity_ai_voice_input_lang', 'mr-IN');

    let requestBody = null;
    global.fetch = jest.fn((url, options) => {
      if (url.includes('/api/admin/chat')) {
        requestBody = JSON.parse(options.body);
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () =>
            Promise.resolve({
              sessionId: 404,
              message: 'सोयाबीनचा आजचा दर ₹४,२५० प्रति क्विंटल आहे.',
              language: 'Marathi',
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve([]),
      });
    });

    await React.act(async () => {
      render(<App />);
    });

    const nav = screen.getByRole('navigation', { name: /Main Administration Navigation/i });
    const aiBtn = within(nav).getByRole('button', { name: /AI Admin Assistant/i });
    await React.act(async () => {
      fireEvent.click(aiBtn);
    });

    const input = screen.getByLabelText(/Chat question input/i);
    await React.act(async () => {
      fireEvent.change(input, {
        target: { value: 'सोयाबीनचा आजचा दर काय आहे?' },
      });
    });

    const sendBtn = screen.getByRole('button', { name: /Send Question/i });
    await React.act(async () => {
      fireEvent.click(sendBtn);
    });

    // Verify request payload sent to Spring Boot
    expect(requestBody).not.toBeNull();
    expect(requestBody.message).toBe('सोयाबीनचा आजचा दर काय आहे?');
    expect(requestBody.language).toBe('Marathi');
  });

  test('confirms removal of top elements and side panels on AI Assistant page while expanding chatbot full-screen', async () => {
    window.location.hash = '#ai-assistant';
    await React.act(async () => {
      render(<App />);
    });

    // 1. Confirm the 5 specified items are NOT rendered
    expect(screen.queryByText(/Phase 1 Read-Only AI Agent/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/AI Admin Conversational Assistant/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Interact with the Spring Boot Gemini RAG intelligence engine/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/POST http:\/\/localhost:9090\/api\/admin\/chat/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Live Spring Boot Endpoint/i)).not.toBeInTheDocument();

    // 2. Confirm right-side panels are removed
    expect(screen.queryByText('Admin AI Capabilities')).not.toBeInTheDocument();
    expect(screen.queryByText('Interview Architecture Notes')).not.toBeInTheDocument();

    // 3. Confirm chatbot container and all functional controls remain visible and functional
    expect(screen.getByRole('button', { name: /Clear Chat/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Question/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Chat question input/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /speech recognition/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Voice:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Chat:/i)).toBeInTheDocument();
  });

  test('suggested questions panel refreshes immediately and supports Soybean, Maize, MaizeW, Wheat with fallbacks', async () => {
    await React.act(async () => {
      render(<App />);
    });

    // Expand suggested prompts panel
    const expandBtn = screen.getByRole('button', { name: /Suggested Natural Language Queries/i });
    await React.act(async () => {
      fireEvent.click(expandBtn);
    });

    const panel = screen.getByTestId('suggested-prompts-expanded');
    expect(panel).toBeInTheDocument();

    const select = screen.getByLabelText('Commodity');
    expect(select).toBeInTheDocument();

    // 1. Select Soybean
    await React.act(async () => {
      fireEvent.change(select, { target: { value: 'Soybean' } });
    });
    expect(within(panel).queryByText(/No matching questions found/i)).not.toBeInTheDocument();
    expect(within(panel).getByText('Show me the Soybean rate for the last 7 days.')).toBeInTheDocument();

    // 2. Select Maize
    await React.act(async () => {
      fireEvent.change(select, { target: { value: 'Maize' } });
    });
    expect(within(panel).queryByText(/No matching questions found/i)).not.toBeInTheDocument();
    expect(within(panel).getByText('Show me the Maize rate for the last 7 days.')).toBeInTheDocument();

    // 3. Select MaizeW
    await React.act(async () => {
      fireEvent.change(select, { target: { value: 'MaizeW' } });
    });
    expect(within(panel).queryByText(/No matching questions found/i)).not.toBeInTheDocument();
    expect(within(panel).getByText('Show me the MaizeW rate for the last 7 days.')).toBeInTheDocument();

    // 4. Select Wheat
    await React.act(async () => {
      fireEvent.change(select, { target: { value: 'Wheat' } });
    });
    expect(within(panel).queryByText(/No matching questions found/i)).not.toBeInTheDocument();
    expect(within(panel).getByText('Show me the Wheat rate for the last 7 days.')).toBeInTheDocument();

    // 5. Select Deals category chip under Wheat (which has no commodity-specific deal questions)
    // and verify general admin deals questions are shown as fallback
    const dealsChip = within(panel).getByRole('button', { name: /Deals & Contracts/i });
    await React.act(async () => {
      fireEvent.click(dealsChip);
    });
    expect(within(panel).queryByText(/No matching questions found/i)).not.toBeInTheDocument();
    expect(within(panel).getByText('Show me all active deals.')).toBeInTheDocument();
  });

  test('handles 7 days historical query for Wheat, Maize, and MaizeW when records are missing by showing clear explanation', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/admin/chat')) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () =>
            Promise.resolve({
              sessionId: 202,
              message:
                'No Wheat historical rates are recorded for October 20–26, 2026. The requested data is currently unavailable.',
              language: 'en',
              displayType: null,
              chartData: [],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve([]),
      });
    });

    let renderedContainer;
    await React.act(async () => {
      const { container } = render(<App />);
      renderedContainer = container;
    });

    const input = screen.getByLabelText(/Chat question input/i);
    await React.act(async () => {
      fireEvent.change(input, { target: { value: 'Show me the Wheat rate for the last 7 days.' } });
    });

    const sendBtn = screen.getByRole('button', { name: /Send Question/i });
    await React.act(async () => {
      fireEvent.click(sendBtn);
    });

    // Verify clear explanation is displayed and chart canvas is not rendered for the wheat message
    expect(
      await screen.findByText(/Price trend charts require historical rate records/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No Wheat historical rates are recorded for October 20–26, 2026/i)
    ).toBeInTheDocument();
    const assistantBubbles = renderedContainer.querySelectorAll('.assistant-message');
    const wheatBubble = assistantBubbles[assistantBubbles.length - 1];
    expect(within(wheatBubble).queryByRole('tab', { name: /Chart/i })).not.toBeInTheDocument();
  });

  test('displays price trend chart for Wheat when valid historical records exist', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/admin/chat')) {
        return Promise.resolve({
          ok: true,
          headers: { get: () => 'application/json' },
          json: () =>
            Promise.resolve({
              sessionId: 203,
              message: 'Wheat Price Trend for Pune from 2026-10-09 to 2026-10-15.',
              language: 'en',
              displayType: 'CHART',
              chartData: [
                { date: '2026-10-09', rate: 2810.0, commodity: 'Wheat', location: 'Pune', unit: 'Quintal' },
                { date: '2026-10-10', rate: 2805.0, commodity: 'Wheat', location: 'Pune', unit: 'Quintal' },
                { date: '2026-10-11', rate: 2820.0, commodity: 'Wheat', location: 'Pune', unit: 'Quintal' },
                { date: '2026-10-12', rate: 2815.0, commodity: 'Wheat', location: 'Pune', unit: 'Quintal' },
                { date: '2026-10-13', rate: 2830.0, commodity: 'Wheat', location: 'Pune', unit: 'Quintal' },
                { date: '2026-10-14', rate: 2825.0, commodity: 'Wheat', location: 'Pune', unit: 'Quintal' },
                { date: '2026-10-15', rate: 2840.0, commodity: 'Wheat', location: 'Pune', unit: 'Quintal' },
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

    await React.act(async () => {
      render(<App />);
    });

    const input = screen.getByLabelText(/Chat question input/i);
    await React.act(async () => {
      fireEvent.change(input, {
        target: { value: 'Plot a chart of Wheat rates between 9 October 2026 and 15 October 2026' },
      });
    });

    const sendBtn = screen.getByRole('button', { name: /Send Question/i });
    await React.act(async () => {
      fireEvent.click(sendBtn);
    });

    // Verify chart title has the actual commodity and location
    expect(await screen.findByText('Wheat Price Trend - Pune')).toBeInTheDocument();
    // Verify chart toggle options
    expect(screen.getAllByRole('tab', { name: /Chart/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('tab', { name: /Rate/i }).length).toBeGreaterThanOrEqual(1);
  });
});
