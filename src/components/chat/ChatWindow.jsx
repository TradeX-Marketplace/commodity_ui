import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import SuggestedPrompts, { LOCALIZED_SUGGESTED_QUESTIONS } from './SuggestedPrompts';
import {
  SendIcon,
  TrashIcon,
  SparklesIcon,
  AlertCircleIcon,
  RefreshIcon,
  MicIcon,
  MicOffIcon,
  GlobeIcon,
} from '../common/Icons';
import { sendAdminChatMessage } from '../../services/api';

const getStorageItem = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch (e) {
    return fallback;
  }
};

const setStorageItem = (key, val) => {
  try {
    localStorage.setItem(key, val);
  } catch (e) {
    // ignore in restricted envs
  }
};

const getWelcomeMessage = (lang = 'en') => {
  if (lang === 'hi') {
    return {
      id: 'welcome',
      role: 'assistant',
      content: `नमस्ते! मैं आपका कमोडिटी एडमिन AI असिस्टेंट हूँ।

आप लाइव मार्केट रेट्स, खरीदार मांग, मूल्य रुझान, सूचनाओं और व्हाट्सएप लॉग्स के बारे में पूछने के लिए माइक में बोल सकते हैं या टाइप कर सकते हैं।

मार्केट जानकारी या मूल्य चार्ट देखने के लिए रेट और चार्ट विकल्पों का उपयोग करें।`,
      timestamp: new Date().toISOString(),
      language: 'hi',
      displayType: 'RATE',
    };
  }
  if (lang === 'mr') {
    return {
      id: 'welcome',
      role: 'assistant',
      content: `नमस्कार! मी तुमचा कमोडिटी ॲडमिन AI सहाय्यक आहे.

तुम्ही थेट बाजार भाव, खरेदीदार मागणी, किमतीचे ट्रेंड, सूचना आणि व्हॉट्सॲप नोंदींबद्दल विचारण्यासाठी बोलू शकता किंवा टाइप करू शकता.

माहिती किंवा चार्ट पाहण्यासाठी दर आणि चार्ट पर्याय वापरा.`,
      timestamp: new Date().toISOString(),
      language: 'mr',
      displayType: 'RATE',
    };
  }
  return {
    id: 'welcome',
    role: 'assistant',
    content: `Hello! I am your Commodity Admin AI Assistant.

You can type or speak into the microphone to ask about live market rates, buyer demands, price trends, notifications, and WhatsApp logs.

Use the Rate and Chart options on my responses to view formatted market information or price charts.`,
    timestamp: new Date().toISOString(),
    language: 'en',
    displayType: 'RATE',
  };
};

export default function ChatWindow() {
  // Check if first-conversation language setup was previously completed
  const [hasCompletedSetup, setHasCompletedSetup] = useState(() => {
    return getStorageItem('commodity_ai_lang_setup_completed', 'false') === 'true';
  });

  // Chat Display Language: 'en' | 'hi' | 'mr'
  const [displayLanguage, setDisplayLanguage] = useState(() => {
    return getStorageItem('commodity_ai_chat_display_lang', 'en');
  });

  // Voice Input Language: 'en-IN' | 'hi-IN' | 'mr-IN'
  const [sttLanguage, setSttLanguage] = useState(() => {
    return getStorageItem('commodity_ai_voice_input_lang', 'en-IN');
  });

  // Temporary staged selection for welcome screen / settings modal
  const [tempDisplayLang, setTempDisplayLang] = useState(displayLanguage);
  const [tempVoiceLang, setTempVoiceLang] = useState(sttLanguage);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [setupError, setSetupError] = useState(null);

  const [messages, setMessages] = useState(() => [getWelcomeMessage(displayLanguage)]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);

  // Speech-to-Text states
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState(null);

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const abortControllerRef = useRef(null);
  const messageSeqRef = useRef(0);

  // Container-scoped scroll to bottom - never scrolls window or shifts fixed sidebar
  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto',
        });
      } else {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  useEffect(() => {
    if (hasCompletedSetup) {
      scrollToBottom(true);
    }
  }, [messages, isLoading, hasCompletedSetup]);

  // Stop recording helper
  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore already stopped
      }
    }
    setIsRecording(false);
  }, [isRecording]);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechError(null);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Display recognized text in the input before sending
        if (finalTranscript.trim()) {
          setInputText((prev) =>
            prev.trim() ? `${prev} ${finalTranscript.trim()}` : finalTranscript.trim()
          );
        } else if (interimTranscript.trim()) {
          setInputText((prev) => {
            return prev.trim() ? `${prev} ${interimTranscript.trim()}` : interimTranscript.trim();
          });
        }
      };

      recognition.onerror = (event) => {
        let errorMsg = `Speech recognition error: ${event.error}`;
        if (event.error === 'not-allowed') {
          errorMsg =
            'Microphone access was denied. Please allow microphone permissions in your browser.';
        } else if (event.error === 'no-speech') {
          errorMsg = 'No speech was detected. Please try speaking again.';
        }
        setSpeechError(errorMsg);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Toggle microphone
  const handleToggleMic = () => {
    if (!speechSupported) {
      setSpeechError(
        'Speech recognition is not supported in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      setSpeechError(null);
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = sttLanguage;
          recognitionRef.current.start();
        }
      } catch (err) {
        setSpeechError(`Unable to start microphone: ${err.message}`);
        setIsRecording(false);
      }
    }
  };

  // Language change handlers for settings controls in header
  const handleDisplayLanguageChange = (e) => {
    const newLang = e.target.value;
    setDisplayLanguage(newLang);
    setTempDisplayLang(newLang);
    setStorageItem('commodity_ai_chat_display_lang', newLang);

    // If only the default welcome greeting is in the chat, update it to the new language
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [getWelcomeMessage(newLang)];
      }
      return prev;
    });
  };

  const handleVoiceLanguageChange = (e) => {
    const newVoice = e.target.value;
    setSttLanguage(newVoice);
    setTempVoiceLang(newVoice);
    setStorageItem('commodity_ai_voice_input_lang', newVoice);
    if (recognitionRef.current) {
      recognitionRef.current.lang = newVoice;
    }
  };

  // Complete initial welcome language selection
  const handleCompleteLanguageSetup = () => {
    const validDisplayLangs = ['en', 'hi', 'mr'];
    const validVoiceLangs = ['en-IN', 'hi-IN', 'mr-IN'];

    if (!validDisplayLangs.includes(tempDisplayLang)) {
      setSetupError('Please select a valid Chat Display Language.');
      return;
    }
    if (!validVoiceLangs.includes(tempVoiceLang)) {
      setSetupError('Please select a valid Voice Input Language.');
      return;
    }

    setSetupError(null);
    setDisplayLanguage(tempDisplayLang);
    setSttLanguage(tempVoiceLang);
    setStorageItem('commodity_ai_chat_display_lang', tempDisplayLang);
    setStorageItem('commodity_ai_voice_input_lang', tempVoiceLang);
    setStorageItem('commodity_ai_lang_setup_completed', 'true');
    setHasCompletedSetup(true);
    setShowLanguageModal(false);

    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [getWelcomeMessage(tempDisplayLang)];
      }
      return prev;
    });
  };

  const handleSendMessage = async (textToSend) => {
    const question = (textToSend || inputText).trim();
    if (!question || isLoading) return;

    if (isRecording) {
      stopRecording();
    }

    const previousInput = inputText;
    setError(null);
    setSpeechError(null);
    setInputText('');

    // Append Admin User message
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) {
        // ignore
      }
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentSeq = ++messageSeqRef.current;

    try {
      // Map display language code to backend Language name for Gemini context
      const backendLang =
        displayLanguage === 'hi' ? 'Hindi' : displayLanguage === 'mr' ? 'Marathi' : 'English';

      const startTime = performance.now();
      const response = await sendAdminChatMessage({
        message: question,
        sessionId: sessionId,
        language: backendLang,
        signal: controller.signal,
      });

      if (currentSeq !== messageSeqRef.current) {
        return; // Guard against stale async race condition
      }

      const duration = Math.round(performance.now() - startTime);
      if (typeof console !== 'undefined' && console.log) {
        console.log(`[PERF] Admin Chat: API duration ${duration}ms`);
      }

      // Update sessionId if returned by backend
      if (response && response.sessionId) {
        setSessionId(response.sessionId);
      }

      // Append Assistant message
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        userQuestion: question,
        content: response?.message || 'No response content returned by assistant.',
        language: response?.language || displayLanguage,
        displayType: response?.displayType || 'RATE',
        chartData: response?.chartData || null,
        commodities: response?.commodities || null,
        buyerDemands: response?.buyerDemands || null,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      console.error('Failed to communicate with Admin AI Chatbot:', err);
      // Restore typed question if request failed and it wasn't triggered from suggested chip
      if (!textToSend && previousInput) {
        setInputText(previousInput);
      }
      setError({
        message: err.message || 'Failed to communicate with Admin Chatbot.',
        lastQuestion: question,
        isNetworkError: err.isNetworkError,
      });

      // Add system failure notice to chat history
      const localizedErrorNotice =
        displayLanguage === 'hi'
          ? `⚠️ AI एडमिन सेवा से संपर्क करने में समस्या: ${err.message}`
          : displayLanguage === 'mr'
          ? `⚠️ AI ॲडमिन सेवेशी संपर्क साधताना त्रुटी: ${err.message}`
          : `⚠️ Error contacting the AI Admin service: ${err.message}`;

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: localizedErrorNotice,
          timestamp: new Date().toISOString(),
          displayType: 'RATE',
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        if (textareaRef.current && document.activeElement !== textareaRef.current) {
          try {
            textareaRef.current.focus({ preventScroll: true });
          } catch (e) {
            textareaRef.current.focus();
          }
        }
      }, 50);
    }
  };

  const handleKeyDown = (e) => {
    // Avoid triggering submit if IME is active (e.g. Hindi/Marathi composition)
    if (e.nativeEvent && e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([getWelcomeMessage(displayLanguage)]);
    setSessionId(null);
    setError(null);
    setSpeechError(null);
  };

  const handleRetryLast = () => {
    if (error?.lastQuestion) {
      handleSendMessage(error.lastQuestion);
    }
  };

  // Localized placeholder and title helpers
  const getPlaceholderText = (lang) => {
    if (lang === 'hi') {
      return 'माइक में बोलें या अपना प्रश्न टाइप करें... (भेजने के लिए Enter दबाएं, नई पंक्ति के लिए Shift+Enter)';
    }
    if (lang === 'mr') {
      return 'माइकवर बोला किंवा तुमचा प्रश्न टाइप करा... (पाठवण्यासाठी Enter दाबा, नवीन ओळीसाठी Shift+Enter)';
    }
    return 'Speak into microphone or type your question... (Enter to send, Shift+Enter for new line)';
  };

  const getQuickCardsTitle = (lang) => {
    if (lang === 'hi') return 'बाजार से जुड़े उदाहरण प्रश्न पूछें:';
    if (lang === 'mr') return 'बाजारपेठेतील उदाहरण प्रश्न विचारून पहा:';
    return 'Try asking these example market questions:';
  };

  const getListeningLanguageName = (voiceLang) => {
    if (voiceLang === 'mr-IN') return 'मराठी (mr-IN)';
    if (voiceLang === 'hi-IN') return 'हिंदी (hi-IN)';
    return 'English (en-IN)';
  };

  const getQuickCardsForLanguage = (lang) => {
    const list = LOCALIZED_SUGGESTED_QUESTIONS[lang] || LOCALIZED_SUGGESTED_QUESTIONS.en;
    const icons = ['📈', '💰', '📦', '📍', '📊', '📋'];
    return list.map((q, idx) => ({
      prompt: q,
      icon: icons[idx % icons.length],
    }));
  };

  // 1. FIRST CONVERSATION WELCOME SCREEN
  if (!hasCompletedSetup) {
    return (
      <div className="chat-window-card">
        <div className="chat-window-header">
          <div className="chat-header-info">
            <div className="chat-bot-avatar">
              <SparklesIcon size={20} />
            </div>
            <div>
              <h3 className="chat-title">AI Admin Assistant</h3>
              <div className="chat-subtitle-meta">
                <span className="status-indicator-dot online" />
                <span>Language Preference Setup</span>
              </div>
            </div>
          </div>
        </div>

        <div className="welcome-language-screen" data-testid="welcome-language-screen">
          <div className="welcome-language-card">
            <div className="welcome-lang-icon-badge">
              <SparklesIcon size={32} />
            </div>
            <h2 className="welcome-lang-title">Welcome to Commodity Admin AI</h2>
            <p className="welcome-lang-subtitle">
              Please select your preferred languages to start your conversation.
            </p>

            {setupError && (
              <div className="welcome-setup-error">
                <AlertCircleIcon size={16} />
                <span>{setupError}</span>
              </div>
            )}

            <div className="welcome-lang-form">
              <div className="welcome-form-group">
                <label htmlFor="welcomeDisplayLang" className="welcome-form-label">
                  Dropdown 1 — Chat Display Language
                </label>
                <select
                  id="welcomeDisplayLang"
                  className="welcome-form-select"
                  value={tempDisplayLang}
                  onChange={(e) => {
                    setTempDisplayLang(e.target.value);
                    setSetupError(null);
                  }}
                  aria-label="Chat Display Language"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                </select>
                <span className="welcome-form-hint">
                  This controls the language used for the suggested questions, interface prompts, and AI response preference where supported.
                </span>
              </div>

              <div className="welcome-form-group">
                <label htmlFor="welcomeVoiceLang" className="welcome-form-label">
                  Dropdown 2 — Voice Input Language
                </label>
                <select
                  id="welcomeVoiceLang"
                  className="welcome-form-select"
                  value={tempVoiceLang}
                  onChange={(e) => {
                    setTempVoiceLang(e.target.value);
                    setSetupError(null);
                  }}
                  aria-label="Voice Input Language"
                >
                  <option value="en-IN">English (India) — en-IN</option>
                  <option value="hi-IN">Hindi (India) — hi-IN</option>
                  <option value="mr-IN">Marathi (India) — mr-IN</option>
                </select>
                <span className="welcome-form-hint">
                  This controls the microphone speech-recognition locale.
                </span>
              </div>

              <div className="welcome-form-actions">
                <button
                  type="button"
                  className="btn btn-primary welcome-continue-btn"
                  onClick={handleCompleteLanguageSetup}
                >
                  <span>Continue to Chat</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACTIVE CHATBOT INTERFACE (After completing setup or loaded from localStorage)
  return (
    <div className="chat-window-card">
      {/* Chat Header Toolbar */}
      <div className="chat-window-header">
        <div className="chat-header-info">
          <div className="chat-bot-avatar">
            <SparklesIcon size={20} />
          </div>
          <div>
            <h3 className="chat-title">AI Admin Assistant</h3>
            <div className="chat-subtitle-meta">
              <span className="status-indicator-dot online" />
              <span>Speech-to-Text &bull; RAG Intelligence</span>
              <span className="session-id-pill">
                {sessionId ? `Session #${sessionId}` : 'New Session'}
              </span>
            </div>
          </div>
        </div>

        <div className="chat-header-actions">
          {/* Dropdown 1: Chat Display Language */}
          <div className="header-lang-wrapper">
            <label htmlFor="chatDisplayLangSelect" className="header-lang-label">
              {displayLanguage === 'hi' ? 'चैट:' : displayLanguage === 'mr' ? 'चॅट:' : 'Chat:'}
            </label>
            <select
              id="chatDisplayLangSelect"
              className="voice-lang-select"
              value={displayLanguage}
              onChange={handleDisplayLanguageChange}
              title="Chat Display Language"
              aria-label="Chat Display Language"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="mr">Marathi</option>
            </select>
          </div>

          {/* Dropdown 2: Voice Input Language */}
          <div className="voice-lang-select-wrapper header-lang-wrapper">
            <label htmlFor="voiceLangSelect" className="voice-lang-label header-lang-label">
              {displayLanguage === 'hi' ? 'वॉइस:' : displayLanguage === 'mr' ? 'आवाज:' : 'Voice:'}
            </label>
            <select
              id="voiceLangSelect"
              className="voice-lang-select"
              value={sttLanguage}
              onChange={handleVoiceLanguageChange}
              title="Speech-to-Text Recognition Language"
              aria-label="Voice Input Language"
            >
              <option value="en-IN">English (en-IN)</option>
              <option value="hi-IN">हिंदी (hi-IN)</option>
              <option value="mr-IN">मराठी (mr-IN)</option>
            </select>
          </div>

          {/* Reopen Language Settings Modal Button */}
          <button
            type="button"
            className="btn btn-outline btn-sm lang-settings-btn"
            onClick={() => {
              setTempDisplayLang(displayLanguage);
              setTempVoiceLang(sttLanguage);
              setShowLanguageModal(true);
            }}
            title="Reopen Language Settings"
            aria-label="Language Settings"
          >
            <GlobeIcon size={14} />
            <span>{displayLanguage === 'hi' ? 'भाषाएं' : displayLanguage === 'mr' ? 'भाषा' : 'Languages'}</span>
          </button>

          <button
            type="button"
            className="btn btn-outline btn-sm clear-chat-btn"
            onClick={handleClearChat}
            title="Clear Chat Messages"
            aria-label="Clear Chat Messages"
          >
            <TrashIcon size={14} />
            <span>{displayLanguage === 'hi' ? 'चैट साफ़ करें' : displayLanguage === 'mr' ? 'चॅट साफ करा' : 'Clear Chat'}</span>
          </button>
        </div>
      </div>

      {/* Language Settings Modal (when reopened from header) */}
      {showLanguageModal && (
        <div
          className="language-settings-modal-backdrop"
          onClick={() => setShowLanguageModal(false)}
        >
          <div
            className="language-settings-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Language Settings"
          >
            <div className="modal-header">
              <div className="modal-title-with-icon">
                <GlobeIcon size={18} />
                <h4>Language Settings</h4>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowLanguageModal(false)}
                aria-label="Close language settings"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="welcome-form-group">
                <label htmlFor="modalDisplayLang" className="welcome-form-label">
                  Dropdown 1 — Chat Display Language
                </label>
                <select
                  id="modalDisplayLang"
                  className="welcome-form-select"
                  value={tempDisplayLang}
                  onChange={(e) => setTempDisplayLang(e.target.value)}
                  aria-label="Chat Display Language"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                </select>
                <span className="welcome-form-hint">
                  Controls the language used for suggested questions, interface prompts, and AI response preference.
                </span>
              </div>

              <div className="welcome-form-group">
                <label htmlFor="modalVoiceLang" className="welcome-form-label">
                  Dropdown 2 — Voice Input Language
                </label>
                <select
                  id="modalVoiceLang"
                  className="welcome-form-select"
                  value={tempVoiceLang}
                  onChange={(e) => setTempVoiceLang(e.target.value)}
                  aria-label="Voice Input Language"
                >
                  <option value="en-IN">English (India) — en-IN</option>
                  <option value="hi-IN">Hindi (India) — hi-IN</option>
                  <option value="mr-IN">Marathi (India) — mr-IN</option>
                </select>
                <span className="welcome-form-hint">
                  Controls microphone speech-recognition locale.
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowLanguageModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleCompleteLanguageSetup}
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Speech / API Error alert banner */}
      {(error || speechError) && (
        <div className="chat-error-banner">
          <div className="chat-error-text">
            <AlertCircleIcon size={16} />
            <span>{error ? error.message : speechError}</span>
          </div>
          {error?.lastQuestion ? (
            <button
              type="button"
              className="btn btn-xs btn-outline"
              onClick={handleRetryLast}
              disabled={isLoading}
            >
              <RefreshIcon size={12} />
              <span>Retry Question</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-xs btn-outline"
              onClick={() => setSpeechError(null)}
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        className="chat-messages-area"
        ref={messagesContainerRef}
        role="log"
        aria-live="polite"
      >
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onSendMessage={handleSendMessage}
            displayLanguage={displayLanguage}
          />
        ))}

        {/* Empty-state welcome prompt cards when only welcome message exists */}
        {messages.length === 1 && (
          <div className="welcome-quick-cards-container">
            <div className="welcome-quick-cards-title">
              <SparklesIcon size={14} />
              <span>{getQuickCardsTitle(displayLanguage)}</span>
            </div>
            <div className="welcome-quick-cards-grid">
              {getQuickCardsForLanguage(displayLanguage).map((card, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="welcome-quick-card"
                  onClick={() => handleSendMessage(card.prompt)}
                  disabled={isLoading}
                >
                  <span className="quick-card-icon">{card.icon}</span>
                  <span className="quick-card-text">{card.prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="chat-bubble-container assistant-message typing-indicator-container">
            <div className="message-avatar">
              <span className="bot-avatar-icon">
                <SparklesIcon size={16} />
              </span>
            </div>
            <div className="typing-indicator-bubble">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
              <span className="typing-text">
                {displayLanguage === 'hi'
                  ? 'AI मार्केटप्लेस रिकॉर्ड्स की जांच कर रहा है...'
                  : displayLanguage === 'mr'
                  ? 'AI बाजारपेठेतील नोंदी शोधत आहे...'
                  : 'Checking marketplace records...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Footer (localized to displayLanguage) */}
      <SuggestedPrompts
        onSelectPrompt={(prompt) => handleSendMessage(prompt)}
        disabled={isLoading}
        language={displayLanguage}
      />

      {/* Recording status pill if microphone is listening */}
      {isRecording && (
        <div className="active-listening-banner">
          <span className="listening-pulse-dot" />
          <span>
            {displayLanguage === 'hi'
              ? `${getListeningLanguageName(sttLanguage)} में सुन रहा है... माइक में स्पष्ट बोलें`
              : displayLanguage === 'mr'
              ? `${getListeningLanguageName(sttLanguage)} मध्ये ऐकत आहे... माइकवर स्पष्ट बोला`
              : `Listening in ${getListeningLanguageName(sttLanguage)}... Speak clearly into microphone`}
          </span>
          <button
            type="button"
            className="btn btn-xs btn-outline stop-listening-btn"
            onClick={stopRecording}
          >
            Stop
          </button>
        </div>
      )}

      {/* Input Box Footer */}
      <div className="chat-input-container">
        {/* Voice Input Microphone Button */}
        <button
          type="button"
          className={`btn-mic-chat ${isRecording ? 'is-recording' : ''} ${!speechSupported ? 'is-disabled' : ''}`}
          onClick={handleToggleMic}
          disabled={isLoading || !speechSupported}
          title={
            !speechSupported
              ? 'Speech recognition not supported in this browser'
              : isRecording
              ? 'Click to stop listening'
              : 'Click to speak via microphone'
          }
          aria-label={isRecording ? 'Stop speech recognition' : 'Start speech recognition'}
        >
          {isRecording ? <MicOffIcon size={18} /> : <MicIcon size={18} />}
          <span className="mic-btn-label">
            {isRecording
              ? (displayLanguage === 'hi' ? 'रोकें' : displayLanguage === 'mr' ? 'थांबवा' : 'Stop')
              : (displayLanguage === 'hi' ? 'बोलें' : displayLanguage === 'mr' ? 'बोला' : 'Speak')}
          </span>
        </button>

        <textarea
          ref={textareaRef}
          className="chat-textarea"
          rows={2}
          placeholder={getPlaceholderText(displayLanguage)}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          aria-label="Chat question input"
        />

        <button
          type="button"
          className="btn btn-primary chat-send-btn"
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
          aria-label="Send Question"
        >
          <SendIcon size={16} />
          <span>{displayLanguage === 'hi' ? 'भेजें' : displayLanguage === 'mr' ? 'पाठवा' : 'Send'}</span>
        </button>
      </div>
    </div>
  );
}
