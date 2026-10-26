/**
 * API Service for Commodity Admin AI Dashboard
 *
 * Configured according to the backend architecture:
 * - Backend Base URL: http://localhost:9090 (Commodity_Admin_AI)
 * - Upstream Marketplace Base URL: http://localhost:8080 (TradeX Marketplace Backend)
 *
 * Confirmed Endpoints on Port 9090:
 * - POST /api/admin/chat (AdminChatbotController)
 *
 * Upstream Marketplace Endpoints (via MarketplaceApiClient in Spring Boot):
 * - GET /api/ai/commodities
 * - GET /api/ai/market-rates
 * - GET /api/ai/rate-history
 * - GET /api/ai/buyer-demands
 * - GET /api/ai/notifications
 * - GET /api/ai/whatsapp-logs
 *
 * NOTE: If Commodity_Admin_AI (port 9090) does not have a controller mapping
 * for upstream marketplace endpoints, requests will return 404. This service
 * captures that architectural state and reports missing controller mappings clearly.
 */

const getEnvVar = (viteKey, reactAppKey, fallback) => {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[reactAppKey]) return process.env[reactAppKey];
    if (process.env[viteKey]) return process.env[viteKey];
  }
  return fallback;
};

export const API_BASE_URL = getEnvVar(
  'VITE_API_BASE_URL',
  'REACT_APP_API_BASE_URL',
  'http://localhost:9090'
);

export const MARKETPLACE_BASE_URL = getEnvVar(
  'VITE_MARKETPLACE_API_BASE_URL',
  'REACT_APP_MARKETPLACE_API_BASE_URL',
  'http://localhost:8080'
);

/**
 * Generic Fetch helper with detailed error diagnostics.
 */
async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const error = new Error(
        (data && data.message) ||
        `HTTP ${response.status}: ${response.statusText || 'Request failed'}`
      );
      error.status = response.status;
      error.statusText = response.statusText;
      error.data = data;
      error.isMissingMapping = response.status === 404;
      throw error;
    }

    // Attach server-side pagination metadata from HTTP response headers if available
    const totalCountHeader = response.headers?.get('x-total-count');
    const totalPagesHeader = response.headers?.get('x-total-pages');
    const pageNumHeader = response.headers?.get('x-page-number');
    const pageSizeHeader = response.headers?.get('x-page-size');

    if (totalCountHeader !== null && totalCountHeader !== undefined) {
      const totalCount = parseInt(totalCountHeader, 10);
      const totalPages = totalPagesHeader !== null ? parseInt(totalPagesHeader, 10) : 1;
      const pageNum = pageNumHeader !== null ? parseInt(pageNumHeader, 10) : 0;
      const pageSize = pageSizeHeader !== null ? parseInt(pageSizeHeader, 10) : 5;

      if (Array.isArray(data)) {
        data.totalElements = totalCount;
        data.totalPages = totalPages;
        data.page = pageNum;
        data.size = pageSize;
      }
    }

    return data;
  } catch (err) {
    // Distinguish between network/CORS error and HTTP response error
    if (!err.status) {
      err.isNetworkError = true;
      err.message = err.message === 'Failed to fetch'
        ? `Connection failed to ${url}. Ensure the backend service is running and CORS is configured.`
        : err.message;
    }
    throw err;
  }
}

// ==========================================
// 1. AI ADMIN CHATBOT API (Port 9090 - Confirmed)
// ==========================================

/**
 * Sends a natural language chat message to the Admin AI Chatbot.
 * Endpoint: POST http://localhost:9090/api/admin/chat
 * Payload matches com.example.Commodity_Admin_AI.dto.ChatRequest:
 *   - sessionId: Long (optional, preserved for multi-turn conversation)
 *   - message: String (required)
 *   - language: String (optional, e.g. "en", "hi", "mr")
 *
 * Response matches com.example.Commodity_Admin_AI.dto.ChatResponse:
 *   - sessionId: Long
 *   - message: String
 *   - language: String
 *   - displayType: String (e.g. "RATE", "CHART", "RATE_AND_CHART", null)
 *   - chartData: Array<{ date: string, rate: number }>
 */
export async function sendAdminChatMessage({
  message,
  sessionId = null,
  language = null,
  signal = null,
}) {
  if (!message || !message.trim()) {
    throw new Error('Message cannot be empty');
  }

  const payload = {
    message: message.trim(),
  };

  if (sessionId !== null && sessionId !== undefined) {
    payload.sessionId = Number(sessionId);
  }

  if (language && language.trim()) {
    payload.language = language.trim();
  }

  const url = `${API_BASE_URL}/api/admin/chat`;
  return await apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    ...(signal ? { signal } : {}),
  });
}

// ==========================================
// 2. MARKETPLACE APIS
// Upstream paths defined in MarketplaceApiClient:
// React calls Commodity_Admin_AI port 9090 by default,
// or upstream port 7070 if directly inspecting.
// ==========================================

/**
 * Helper to build marketplace endpoint URLs
 * @param {string} path - e.g. "/api/ai/commodities"
 * @param {boolean} useUpstreamDirect - whether to call port 7070 directly for testing
 * @param {object} queryParams - optional query params
 */
function buildMarketplaceUrl(path, useUpstreamDirect = false, queryParams = {}) {
  const base = useUpstreamDirect ? MARKETPLACE_BASE_URL : API_BASE_URL;
  const url = new URL(path, base);
  Object.entries(queryParams).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      url.searchParams.append(key, val);
    }
  });
  return url.toString();
}

/**
 * Fetches approved commodities
 * Path: /api/ai/commodities
 */
export async function fetchCommodities({ useUpstreamDirect = false } = {}) {
  const url = buildMarketplaceUrl('/api/ai/commodities', useUpstreamDirect);
  return await apiFetch(url);
}

/**
 * Fetches current market rates
 * Path: /api/ai/market-rates
 * Optional params: commodity, location
 */
export async function fetchMarketRates({ commodity, location, useUpstreamDirect = false } = {}) {
  const url = buildMarketplaceUrl('/api/ai/market-rates', useUpstreamDirect, { commodity, location });
  return await apiFetch(url);
}

/**
 * Fetches historical rates and trends
 * Path: /api/ai/rate-history
 * Optional params: commodity, location, last7Days
 */
export async function fetchRateHistory({ commodity, location, last7Days = false, useUpstreamDirect = false } = {}) {
  const url = buildMarketplaceUrl('/api/ai/rate-history', useUpstreamDirect, {
    commodity,
    location,
    last7Days: last7Days ? 'true' : undefined,
  });
  return await apiFetch(url);
}

/**
 * Fetches buyer demands
 * Path: /api/ai/buyer-demands
 * Optional params: commodity, location, openOnly
 */
export async function fetchBuyerDemands({ commodity, location, openOnly = false, useUpstreamDirect = false } = {}) {
  const url = buildMarketplaceUrl('/api/ai/buyer-demands', useUpstreamDirect, {
    commodity,
    location,
    openOnly: openOnly ? 'true' : undefined,
  });
  return await apiFetch(url);
}

/**
 * Fetches notification logs
 * Path: /api/ai/notifications
 * Optional params: commodity, todayOnly
 */
export async function fetchNotifications({ commodity, todayOnly = false, useUpstreamDirect = false } = {}) {
  const url = buildMarketplaceUrl('/api/ai/notifications', useUpstreamDirect, {
    commodity,
    todayOnly: todayOnly ? 'true' : undefined,
  });
  return await apiFetch(url);
}

/**
 * Fetches WhatsApp message logs
 * Path: /api/ai/whatsapp-logs
 * Optional params: commodity, status, todayOnly
 */
export async function fetchWhatsAppLogs({ commodity, status, todayOnly = false, useUpstreamDirect = false } = {}) {
  const url = buildMarketplaceUrl('/api/ai/whatsapp-logs', useUpstreamDirect, {
    commodity,
    status,
    todayOnly: todayOnly ? 'true' : undefined,
  });
  return await apiFetch(url);
}

/**
 * Fetches authoritative orders from Marketplace Backend Orders REST API.
 * Path: /api/ai/orders
 * Supported params: commodity, commodityName, status, buyerName, startDate, endDate,
 * marketLocation, deliveryLocation, minQuantity, maxQuantity, minPrice, maxPrice, page, size.
 */
export async function fetchOrders({
  commodity,
  commodityName,
  status,
  buyerName,
  startDate,
  endDate,
  marketLocation,
  deliveryLocation,
  minQuantity,
  maxQuantity,
  minPrice,
  maxPrice,
  page,
  size,
  paged,
  useUpstreamDirect = true,
} = {}) {
  const queryParams = {
    commodity: commodity || commodityName,
    status,
    buyerName,
    startDate,
    endDate,
    marketLocation,
    deliveryLocation,
    minQuantity,
    maxQuantity,
    minPrice,
    maxPrice,
    page: page !== undefined && page !== null ? page : undefined,
    size: size !== undefined && size !== null ? size : undefined,
    paged: paged ? 'true' : undefined,
  };
  const url = buildMarketplaceUrl('/api/ai/orders', useUpstreamDirect, queryParams);
  return await apiFetch(url);
}

/**
 * Fetches single order details by ID from Marketplace Backend Orders REST API.
 * Path: /api/ai/orders/{id}
 */
export async function fetchOrderById(id, { useUpstreamDirect = true } = {}) {
  if (!id) throw new Error('Order ID is required');
  const base = useUpstreamDirect ? MARKETPLACE_BASE_URL : API_BASE_URL;
  const url = `${base}/api/ai/orders/${id}`;
  return await apiFetch(url);
}

// ==========================================
// 3. REGISTERED PARTIES APIS (TradeX Marketplace Backend)
// Confirmed TradeX Endpoints on Port 8080:
// - GET /api/v1/parties?page=0&size=20&showDeleted=false
// - GET /api/v1/parties/{partyId}
// - GET /api/v1/parties/code/{partyCode}
// ==========================================

/**
 * Fetches registered parties from Marketplace Backend /api/v1/parties REST API.
 * Path: /api/v1/parties
 * Supported params: page, size, showDeleted.
 */
export async function fetchParties({
  page = 0,
  size = 20,
  showDeleted = false,
  useUpstreamDirect = true,
} = {}) {
  const queryParams = {
    page: page !== undefined && page !== null ? page : undefined,
    size: size !== undefined && size !== null ? size : undefined,
    showDeleted: showDeleted ? 'true' : 'false',
  };
  const url = buildMarketplaceUrl('/api/v1/parties', useUpstreamDirect, queryParams);
  return await apiFetch(url);
}

/**
 * Fetches single party details by numerical ID from Marketplace Backend REST API.
 * Path: /api/v1/parties/{id}
 */
export async function fetchPartyById(id, { useUpstreamDirect = true } = {}) {
  if (!id) throw new Error('Party ID is required');
  const base = useUpstreamDirect ? MARKETPLACE_BASE_URL : API_BASE_URL;
  const url = `${base}/api/v1/parties/${id}`;
  return await apiFetch(url);
}

/**
 * Fetches single party details by Party Code (e.g. "PRT-0001") from Marketplace Backend REST API.
 * Path: /api/v1/parties/code/{partyCode}
 */
export async function fetchPartyByCode(partyCode, { useUpstreamDirect = true } = {}) {
  if (!partyCode) throw new Error('Party code is required');
  const base = useUpstreamDirect ? MARKETPLACE_BASE_URL : API_BASE_URL;
  const url = `${base}/api/v1/parties/code/${encodeURIComponent(partyCode.trim())}`;
  return await apiFetch(url);
}

// ==========================================
// 4. COMMODITY SUPPLIES & INVENTORY (Step 3)
// Upstream Path: GET /api/ai/supplies
// ==========================================

/**
 * Fetches active commodity supplies from Marketplace Backend.
 * Path: /api/ai/supplies
 */
export async function fetchSupplies({ commodityId, partyId, useUpstreamDirect = true } = {}) {
  const queryParams = {
    commodityId: commodityId !== undefined && commodityId !== null ? commodityId : undefined,
    partyId: partyId !== undefined && partyId !== null ? partyId : undefined,
  };
  const url = buildMarketplaceUrl('/api/ai/supplies', useUpstreamDirect, queryParams);
  return await apiFetch(url);
}

/**
 * Fetches single supply details by ID.
 * Path: /api/ai/supplies/{id}
 */
export async function fetchSupplyById(id, { useUpstreamDirect = true } = {}) {
  if (!id) throw new Error('Supply ID is required');
  const base = useUpstreamDirect ? MARKETPLACE_BASE_URL : API_BASE_URL;
  const url = `${base}/api/ai/supplies/${encodeURIComponent(String(id).trim())}`;
  return await apiFetch(url);
}

// ==========================================
// 5. BIDS & NEGOTIATIONS (Step 5)
// Upstream Paths: GET /api/ai/bids, GET /api/ai/negotiations
// ==========================================

/**
 * Fetches bids from Marketplace Backend.
 * Path: /api/ai/bids
 */
export async function fetchBids({ page, size, myBidsOnly, partyId, date, useUpstreamDirect = true } = {}) {
  const queryParams = {
    page: page !== undefined && page !== null ? page : undefined,
    size: size !== undefined && size !== null ? size : undefined,
    myBidsOnly: myBidsOnly ? 'true' : undefined,
    partyId: partyId !== undefined && partyId !== null ? partyId : undefined,
    date: date || undefined,
  };
  const url = buildMarketplaceUrl('/api/ai/bids', useUpstreamDirect, queryParams);
  return await apiFetch(url);
}

/**
 * Fetches negotiations threads from Marketplace Backend.
 * Path: /api/ai/negotiations
 */
export async function fetchNegotiations({ partyId, useUpstreamDirect = true } = {}) {
  const queryParams = {
    partyId: partyId !== undefined && partyId !== null ? partyId : undefined,
  };
  const url = buildMarketplaceUrl('/api/ai/negotiations', useUpstreamDirect, queryParams);
  return await apiFetch(url);
}

// ==========================================
// 6. DEALS & CONTRACTS (Step 6)
// Upstream Paths: GET /api/ai/deals, GET /api/ai/contracts/{id}
// ==========================================

/**
 * Fetches deals from Marketplace Backend.
 * Path: /api/ai/deals?role={role}
 */
export async function fetchDeals({ role = 'BUYER', useUpstreamDirect = true } = {}) {
  const queryParams = { role };
  const url = buildMarketplaceUrl('/api/ai/deals', useUpstreamDirect, queryParams);
  return await apiFetch(url);
}

/**
 * Fetches contract by ID from Marketplace Backend.
 * Path: /api/ai/contracts/{id}
 */
export async function fetchContractById(id, { useUpstreamDirect = true } = {}) {
  if (!id) throw new Error('Contract ID is required');
  const base = useUpstreamDirect ? MARKETPLACE_BASE_URL : API_BASE_URL;
  const url = `${base}/api/ai/contracts/${id}`;
  return await apiFetch(url);
}

// ==========================================
// 7. WHATSAPP & DIAGNOSTICS (Step 7)
// Confirmed TradeX Endpoints on Port 8080:
// - GET /api/v1/test/whatsapp/config
// - GET /api/v1/test/whatsapp/connection
// - GET /api/v1/test/whatsapp/live-status
// ==========================================

/**
 * Fetches WhatsApp configuration status.
 * Path: /api/v1/test/whatsapp/config
 */
export async function fetchWhatsAppConfig({ useUpstreamDirect = true } = {}) {
  const base = useUpstreamDirect ? MARKETPLACE_BASE_URL : API_BASE_URL;
  const url = `${base}/api/v1/test/whatsapp/config`;
  return await apiFetch(url);
}

/**
 * Tests live connection to WhatsApp provider gateway.
 * Path: /api/v1/test/whatsapp/connection
 */
export async function fetchWhatsAppConnection({ useUpstreamDirect = true } = {}) {
  const base = useUpstreamDirect ? MARKETPLACE_BASE_URL : API_BASE_URL;
  const url = `${base}/api/v1/test/whatsapp/connection`;
  return await apiFetch(url);
}

/**
 * Checks provider live status and quota.
 * Path: /api/v1/test/whatsapp/live-status
 */
export async function fetchWhatsAppLiveStatus({ useUpstreamDirect = true } = {}) {
  const base = useUpstreamDirect ? MARKETPLACE_BASE_URL : API_BASE_URL;
  const url = `${base}/api/v1/test/whatsapp/live-status`;
  return await apiFetch(url);
}


