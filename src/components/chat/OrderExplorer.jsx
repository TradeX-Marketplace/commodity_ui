import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchOrders, fetchOrderById } from '../../services/api';
import { SearchIcon } from '../common/Icons';

/**
 * Localization strings for Order Explorer UI.
 */
const ORDER_I18N = {
  en: {
    selectorPrompt: 'Select commodity to view orders of the month:',
    allCommodities: 'All commodities',
    ordersBadge: (count) => `${count} Orders`,
    totalValueBadge: (val) => `Total Value: ₹${val}`,
    totalQtyBadge: (qty, unit) => `Total Quantity: ${qty} ${unit}`,
    statusTitle: 'Status Breakdown:',
    idCol: 'Order ID',
    buyerCol: 'Buyer',
    commodityCol: 'Commodity',
    quantityCol: 'Quantity',
    priceCol: 'Unit Price',
    totalCol: 'Total Amount',
    marketCol: 'Market',
    deliveryCol: 'Delivery Location',
    statusCol: 'Status',
    dateCol: 'Created Date',
    noOrders: 'No orders found for this commodity or date range.',
    noOrdersFound: 'No orders found',
    matchingOrdersCount: (count) => `${count} matching orders`,
    searchPlaceholder: 'Search orders...',
    searchAriaLabel: 'Search orders',
    clearSearch: 'Clear search',
    apiError: 'Could not retrieve orders from the Marketplace Backend. Please try again.',
    loading: 'Loading orders...',
    pageText: (curr, total, count) => `Page ${curr} of ${total} (${count} total orders)`,
    prev: 'Previous',
    next: 'Next',
    modalTitle: 'Order Details',
    modalClose: 'Close',
    doubleClickHint: 'Tip: Double-click any row to view complete order details.',
    statusLabels: {
      CONFIRMED: 'Confirmed',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      PLACED: 'Placed',
      PROCESSING: 'Processing',
    },
  },
  hi: {
    selectorPrompt: 'महीने के ऑर्डर देखने के लिए कमोडिटी चुनें:',
    allCommodities: 'सभी कमोडिटी',
    ordersBadge: (count) => `${count} ऑर्डर`,
    totalValueBadge: (val) => `कुल मूल्य: ₹${val}`,
    totalQtyBadge: (qty, unit) => `कुल मात्रा: ${qty} ${unit}`,
    statusTitle: 'स्थिति विवरण:',
    idCol: 'ऑर्डर ID',
    buyerCol: 'खरीदार',
    commodityCol: 'कमोडिटी',
    quantityCol: 'मात्रा',
    priceCol: 'प्रति इकाई मूल्य',
    totalCol: 'कुल राशि',
    marketCol: 'मंडी',
    deliveryCol: 'डिलीवरी स्थान',
    statusCol: 'स्थिति',
    dateCol: 'दिनांक',
    noOrders: 'इस कमोडिटी या तिथि सीमा के लिए कोई ऑर्डर नहीं मिले।',
    noOrdersFound: 'No orders found',
    matchingOrdersCount: (count) => `${count} matching orders`,
    searchPlaceholder: 'ऑर्डर खोजें...',
    searchAriaLabel: 'ऑर्डर खोजें',
    clearSearch: 'खोज हटाएं',
    apiError: 'मार्केटप्लेस बैकएंड से ऑर्डर प्राप्त नहीं किए जा सके। कृपया पुनः प्रयास करें।',
    loading: 'ऑर्डर लोड हो रहे हैं...',
    pageText: (curr, total, count) => `पृष्ठ ${curr} / ${total} (कुल ${count} ऑर्डर)`,
    prev: 'पिछला',
    next: 'अगला',
    modalTitle: 'ऑर्डर विवरण',
    modalClose: 'बंद करें',
    doubleClickHint: 'सुझाव: संपूर्ण ऑर्डर विवरण देखने के लिए किसी भी पंक्ति पर डबल-क्लिक करें।',
    statusLabels: {
      CONFIRMED: 'पुष्ट (Confirmed)',
      COMPLETED: 'पूर्ण (Completed)',
      CANCELLED: 'रद्द (Cancelled)',
      PLACED: 'दर्ज (Placed)',
      PROCESSING: 'प्रक्रियाधीन (Processing)',
    },
  },
  mr: {
    selectorPrompt: 'महिन्यातील ऑर्डर्स पाहण्यासाठी शेतमाल निवडा:',
    allCommodities: 'सर्व शेतमाल',
    ordersBadge: (count) => `${count} ऑर्डर्स`,
    totalValueBadge: (val) => `एकूण मूल्य: ₹${val}`,
    totalQtyBadge: (qty, unit) => `एकूण प्रमाण: ${qty} ${unit}`,
    statusTitle: 'स्थिती तपशील:',
    idCol: 'ऑर्डर ID',
    buyerCol: 'खरेदीदार',
    commodityCol: 'शेतमाल',
    quantityCol: 'प्रमाण',
    priceCol: 'प्रति एकक दर',
    totalCol: 'एकूण रक्कम',
    marketCol: 'बाजारपेठ',
    deliveryCol: 'पोहोच ठिकाण',
    statusCol: 'स्थिती',
    dateCol: 'नोंदणी तारीख',
    noOrders: 'या शेतमालासाठी किंवा कालावधीसाठी कोणत्याही ऑर्डर्स आढळल्या नाहीत.',
    noOrdersFound: 'No orders found',
    matchingOrdersCount: (count) => `${count} matching orders`,
    searchPlaceholder: 'ऑर्डर्स शोधा...',
    searchAriaLabel: 'ऑर्डर्स शोधा',
    clearSearch: 'शोध साफ करा',
    apiError: 'मार्केटप्लेस बॅकएंडकडून ऑर्डर्स मिळवण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.',
    loading: 'ऑर्डर्स लोड होत आहेत...',
    pageText: (curr, total, count) => `पान ${curr} / ${total} (एकूण ${count} ऑर्डर्स)`,
    prev: 'मागील',
    next: 'पुढील',
    modalTitle: 'ऑर्डर तपशील',
    modalClose: 'बंद करा',
    doubleClickHint: 'टीप: संपूर्ण ऑर्डर तपशील पाहण्यासाठी कोणत्याही ओळीवर डबल-क्लिक करा.',
    statusLabels: {
      CONFIRMED: 'निश्चित (Confirmed)',
      COMPLETED: 'पूर्ण (Completed)',
      CANCELLED: 'रद्द (Cancelled)',
      PLACED: 'नोंदवलेली (Placed)',
      PROCESSING: 'प्रक्रिया चालू (Processing)',
    },
  },
};

/**
 * Standard commodities list.
 */
const DEFAULT_COMMODITIES = ['Soybean', 'Wheat', 'Maize', 'Cotton'];

/**
 * Maps commodity names to display format for buttons.
 */
function formatCommodityDisplay(comm, lang) {
  if (!comm) return '';
  const lower = comm.toLowerCase();
  if (lower === 'all' || lower === 'all commodities') {
    return ORDER_I18N[lang]?.allCommodities || 'All commodities';
  }
  if (lower.includes('soybean') || lower.includes('सोयाबीन')) return lang === 'hi' || lang === 'mr' ? 'सोयाबीन' : 'Soybean';
  if (lower.includes('wheat') || lower.includes('गहू') || lower.includes('गेहूं')) return lang === 'hi' ? 'गेहूं' : lang === 'mr' ? 'गहू' : 'Wheat';
  if (lower.includes('maize') || lower.includes('मका') || lower.includes('मक्का')) return lang === 'hi' ? 'मक्का' : lang === 'mr' ? 'मका' : 'Maize';
  if (lower.includes('cotton') || lower.includes('कापूस') || lower.includes('कपास')) return lang === 'hi' ? 'कपास' : lang === 'mr' ? 'कापूस' : 'Cotton';
  return comm;
}

/**
 * Detects if query mentions a specific commodity.
 */
function detectQueryCommodity(question) {
  if (!question || typeof question !== 'string') return null;
  const lower = question.toLowerCase();
  if (lower.includes('soybean') || lower.includes('सोयाबीन')) return 'Soybean';
  if (lower.includes('wheat') || lower.includes('गहू') || lower.includes('गेहूं')) return 'Wheat';
  if (lower.includes('maize') || lower.includes('मका') || lower.includes('मक्का')) return 'Maize';
  if (lower.includes('cotton') || lower.includes('कापूस') || lower.includes('कपास')) return 'Cotton';
  return null;
}

/**
 * Detects buyer name mentioned in user query.
 */
function extractBuyerNameFromQuestion(question) {
  if (!question || typeof question !== 'string') return null;
  const lower = question.toLowerCase();
  if (lower.includes('vishal patil') || lower.includes('विशाल पाटील') || lower.includes('विशाल पाटिल')) {
    return 'Vishal Patil';
  }
  if (lower.includes('amit deshmukh') || lower.includes('अमित देशमुख')) {
    return 'Amit Deshmukh';
  }
  if (lower.includes('kiran shinde') || lower.includes('किरण शिंदे')) {
    return 'Kiran Shinde';
  }
  if (lower.includes('suresh more') || lower.includes('सुरेश मोरे')) {
    return 'Suresh More';
  }
  if (lower.includes('rajesh kadam') || lower.includes('राजेश कदम')) {
    return 'Rajesh Kadam';
  }
  if (lower.includes('ramesh agro') || lower.includes('रमेश ॲग्रो')) {
    return 'Ramesh Agro';
  }
  const match1 = question.match(/([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)(?:'s|'|’s|’)\s+orders?/i);
  if (match1) {
    const cand = match1[1].trim();
    if (!cand.toLowerCase().includes('month') && !cand.toLowerCase().includes('today')) {
      return cand;
    }
  }
  const match2 = question.match(/(?:from|by|of)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)/i);
  if (match2) {
    const cand = match2[1].trim();
    if (!cand.toLowerCase().includes('month') && !cand.toLowerCase().includes('today')) {
      return cand;
    }
  }
  return null;
}

/**
 * Computes calendar-month boundaries in Asia/Kolkata timezone.
 */
function getAsiaKolkataCurrentMonth() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(new Date());
  const year = parts.find((p) => p.type === 'year')?.value || '2026';
  const month = parts.find((p) => p.type === 'month')?.value || '10';
  const start = `${year}-${month}-01`;
  const lastDayNum = new Date(Number(year), Number(month), 0).getDate();
  const end = `${year}-${month}-${String(lastDayNum).padStart(2, '0')}`;
  return { startDate: start, endDate: end };
}

/**
 * Extracts month date boundaries in Asia/Kolkata timezone.
 */
function extractDateRangeFromQuestion(question) {
  if (!question || typeof question !== 'string') {
    return null;
  }
  const lower = question.toLowerCase();

  // Explicit YYYY-MM-DD
  const isoMatches = question.match(/\b\d{4}-\d{2}-\d{2}\b/g);
  if (isoMatches && isoMatches.length >= 2) {
    return { startDate: isoMatches[0], endDate: isoMatches[1] };
  }
  if (isoMatches && isoMatches.length === 1) {
    return { startDate: isoMatches[0], endDate: isoMatches[0] };
  }

  // Explicit dates like '14 October 2026'
  const dateMatch = question.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})/i);
  if (dateMatch) {
    const day = String(parseInt(dateMatch[1], 10)).padStart(2, '0');
    const monthStr = dateMatch[2].toLowerCase();
    const year = dateMatch[3];
    let month = '10';
    if (monthStr.startsWith('jan')) month = '01';
    else if (monthStr.startsWith('feb')) month = '02';
    else if (monthStr.startsWith('mar')) month = '03';
    else if (monthStr.startsWith('apr')) month = '04';
    else if (monthStr.startsWith('may')) month = '05';
    else if (monthStr.startsWith('jun')) month = '06';
    else if (monthStr.startsWith('jul')) month = '07';
    else if (monthStr.startsWith('aug')) month = '08';
    else if (monthStr.startsWith('sep')) month = '09';
    else if (monthStr.startsWith('oct')) month = '10';
    else if (monthStr.startsWith('nov')) month = '11';
    else if (monthStr.startsWith('dec')) month = '12';
    const parsedDate = `${year}-${month}-${day}`;
    return { startDate: parsedDate, endDate: parsedDate };
  }

  // Relative "today" (simulated system date: 2026-10-14)
  if (lower.includes('today') || lower.includes('आज')) {
    return { startDate: '2026-10-14', endDate: '2026-10-14' };
  }

  // "this month" or "current month" or "orders of the month"
  if (
    lower.includes('this month') ||
    lower.includes('current month') ||
    lower.includes('या महिन्यात') ||
    lower.includes('या महिन्यातील') ||
    lower.includes('इस महीने') ||
    lower.includes('of the month') ||
    lower.includes('from this month')
  ) {
    return getAsiaKolkataCurrentMonth();
  }

  return null;
}

/**
 * Dynamic search matching across 6 order fields:
 * - Order ID (numeric, string, or #ID prefix)
 * - Buyer Name
 * - Commodity
 * - Market Location
 * - Delivery Location
 * - Status (raw uppercase code or friendly/localized status labels)
 */
export function matchesOrderSearch(order, query) {
  if (!query || !query.trim()) return true;
  if (!order) return false;
  const q = query.trim().toLowerCase();
  const cleanQ = q.replace(/^#\s*/, '');

  // 1. Order ID
  if (order.id !== undefined && order.id !== null) {
    const idStr = String(order.id).toLowerCase();
    if (idStr.includes(cleanQ) || `#${idStr}`.includes(q)) {
      return true;
    }
  }

  // 2. Buyer Name
  const buyer = order.buyerName || order.buyer || '';
  if (buyer && String(buyer).toLowerCase().includes(q)) {
    return true;
  }

  // 3. Commodity
  const commodity = order.commodityName || order.commodity || '';
  if (commodity && String(commodity).toLowerCase().includes(q)) {
    return true;
  }

  // 4. Market Location
  const market = order.marketLocation || order.market || '';
  if (market && String(market).toLowerCase().includes(q)) {
    return true;
  }

  // 5. Delivery Location
  const delivery = order.deliveryLocation || order.location || '';
  if (delivery && String(delivery).toLowerCase().includes(q)) {
    return true;
  }

  // 6. Status
  const status = order.status || order.orderStatus || '';
  if (status && String(status).toLowerCase().includes(q)) {
    return true;
  }
  for (const langKey of ['en', 'hi', 'mr']) {
    const label = ORDER_I18N[langKey]?.statusLabels?.[status];
    if (label && String(label).toLowerCase().includes(q)) {
      return true;
    }
  }

  return false;
}

export default function OrderExplorer({ message, lang = 'en' }) {
  const i18n = ORDER_I18N[lang] || ORDER_I18N.en;

  // Resolve available commodities from message or defaults
  const availableCommodities = useMemo(() => {
    const list = [];
    if (Array.isArray(message.commodities) && message.commodities.length > 0) {
      message.commodities.forEach((c) => {
        if (c && typeof c === 'string' && c.trim()) {
          const trimmed = c.trim();
          if (!list.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
            list.push(trimmed);
          }
        }
      });
    }
    // Also include defaults if missing
    DEFAULT_COMMODITIES.forEach((c) => {
      if (!list.some((item) => item.toLowerCase() === c.toLowerCase())) {
        list.push(c);
      }
    });
    return list;
  }, [message.commodities]);

  // Initial commodity selection: check if question specifies one
  const initialCommodity = useMemo(() => {
    const detected = detectQueryCommodity(message.userQuestion);
    if (detected) {
      const match = availableCommodities.find(
        (c) => c.toLowerCase() === detected.toLowerCase()
      );
      if (match) return match;
    }
    return 'ALL';
  }, [message.userQuestion, availableCommodities]);

  // Active state
  const [selectedCommodity, setSelectedCommodity] = useState(initialCommodity);

  // Active buyer filter (from backend ChatResponse or extracted from question)
  const buyerNameFilter = useMemo(() => {
    if (message.buyerName && typeof message.buyerName === 'string' && message.buyerName.trim()) {
      return message.buyerName.trim();
    }
    return extractBuyerNameFromQuestion(message.userQuestion);
  }, [message.buyerName, message.userQuestion]);

  // Active date range (from backend ChatResponse or extracted from question)
  const dateRange = useMemo(() => {
    if (message.startDate && message.endDate) {
      return { startDate: message.startDate, endDate: message.endDate };
    }
    const extracted = extractDateRangeFromQuestion(message.userQuestion);
    if (extracted) {
      return extracted;
    }
    const lowerQ = (message.userQuestion || '').toLowerCase();
    if (lowerQ.includes('month') || lowerQ.includes('महिना') || lowerQ.includes('महीना') || lowerQ.includes('all orders')) {
      return getAsiaKolkataCurrentMonth();
    }
    return null;
  }, [message.startDate, message.endDate, message.userQuestion]);

  // Active status filter (from message or question)
  const statusFilter = useMemo(() => {
    if (message.status && typeof message.status === 'string' && message.status.trim()) {
      return message.status.trim().toUpperCase();
    }
    const qLower = (message.userQuestion || '').toLowerCase();
    if (qLower.includes('cancel') || qLower.includes('रद्द')) return 'CANCELLED';
    if (qLower.includes('complete') || qLower.includes('पूर्ण')) return 'COMPLETED';
    if (qLower.includes('confirm') || qLower.includes('निश्चित')) return 'CONFIRMED';
    if (qLower.includes('process') || qLower.includes('प्रक्रिया')) return 'PROCESSING';
    if (qLower.includes('placed') || qLower.includes('नोंदवलेली')) return 'PLACED';
    return null;
  }, [message.status, message.userQuestion]);

  // Server-Side Pagination & Order Data
  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(0);
  const [totalMatchingOrders, setTotalMatchingOrders] = useState(() => {
    // Seed with initial orders from backend if provided
    return Array.isArray(message.orders) ? message.orders : [];
  });
  const [serverTotalElements, setServerTotalElements] = useState(() => {
    return Array.isArray(message.orders) ? message.orders.length : null;
  });
  const [serverTotalPages, setServerTotalPages] = useState(() => {
    return Array.isArray(message.orders)
      ? Math.max(1, Math.ceil(message.orders.length / PAGE_SIZE))
      : null;
  });
  const [pageOrders, setPageOrders] = useState(() => {
    return Array.isArray(message.orders) ? message.orders.slice(0, PAGE_SIZE) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic Search State
  const [searchTerm, setSearchTerm] = useState('');
  const isSearching = Boolean(searchTerm && searchTerm.trim());

  // Filter orders dynamically matching search query across 6 fields
  const filteredOrders = useMemo(() => {
    if (!isSearching) return totalMatchingOrders;
    return totalMatchingOrders.filter((order) =>
      matchesOrderSearch(order, searchTerm)
    );
  }, [totalMatchingOrders, searchTerm, isSearching]);

  // Sliced page orders to display (guaranteed empty when 0 matches)
  const displayedOrders = useMemo(() => {
    if (isSearching) {
      if (filteredOrders.length === 0) return [];
      const start = currentPage * PAGE_SIZE;
      return filteredOrders.slice(start, start + PAGE_SIZE);
    }
    return pageOrders;
  }, [isSearching, filteredOrders, pageOrders, currentPage, PAGE_SIZE]);

  // Row selection & Modal state
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [modalOrderId, setModalOrderId] = useState(null);
  const [modalOrderData, setModalOrderData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Fetch orders when commodity or page changes, preserving active buyer, status, and date filters
  const loadOrders = useCallback(
    async (commodity, page) => {
      setIsLoading(true);
      setError(null);
      try {
        const commParam = commodity === 'ALL' ? undefined : commodity;
        const buyerParam = buyerNameFilter ? buyerNameFilter : undefined;
        const statusParam = statusFilter ? statusFilter : undefined;
        const startParam = dateRange?.startDate || undefined;
        const endParam = dateRange?.endDate || undefined;

        // 1. Fetch total matching orders (unpaginated) for active filters
        // This guarantees accurate summary totals across all matching orders
        const allMatching = await fetchOrders({
          commodity: commParam,
          buyerName: buyerParam,
          status: statusParam,
          startDate: startParam,
          endDate: endParam,
        });

        const safeMatching = Array.isArray(allMatching)
          ? allMatching
          : Array.isArray(allMatching?.content)
          ? allMatching.content
          : [];
        setTotalMatchingOrders(safeMatching);

        // 2. Fetch server-side paginated slice
        const paged = await fetchOrders({
          commodity: commParam,
          buyerName: buyerParam,
          status: statusParam,
          startDate: startParam,
          endDate: endParam,
          page: page,
          size: PAGE_SIZE,
        });

        const safePaged = Array.isArray(paged)
          ? paged
          : Array.isArray(paged?.content)
          ? paged.content
          : [];
        setPageOrders(safePaged);

        // 3. Extract authoritative pagination metadata from API response headers or DTO
        if (paged && paged.totalElements !== undefined) {
          setServerTotalElements(paged.totalElements);
          setServerTotalPages(paged.totalPages);
        } else if (safeMatching.length > 0) {
          setServerTotalElements(safeMatching.length);
          setServerTotalPages(Math.max(1, Math.ceil(safeMatching.length / PAGE_SIZE)));
        } else {
          setServerTotalElements(0);
          setServerTotalPages(1);
        }
      } catch (err) {
        setError(err.message || i18n.apiError);
      } finally {
        setIsLoading(false);
      }
    },
    [buyerNameFilter, statusFilter, dateRange, PAGE_SIZE, i18n.apiError]
  );

  // Reset pagination and search when new query or filter message is received
  useEffect(() => {
    setCurrentPage(0);
    setSelectedRowId(null);
    setSearchTerm('');
  }, [message.id, message.userQuestion]);

  // Initial load check: verify both commodity and buyer filter match seeded orders
  useEffect(() => {
    const isSeededCommodityMatch =
      selectedCommodity === 'ALL' ||
      (totalMatchingOrders.length > 0 &&
        totalMatchingOrders.every(
          (o) =>
            o.commodityName &&
            o.commodityName.toLowerCase() === selectedCommodity.toLowerCase()
        ));

    const isSeededBuyerMatch =
      !buyerNameFilter ||
      (totalMatchingOrders.length > 0 &&
        totalMatchingOrders.every(
          (o) =>
            o.buyerName &&
            o.buyerName.toLowerCase().includes(buyerNameFilter.toLowerCase())
        ));

    const isSeededStatusMatch =
      !statusFilter ||
      (totalMatchingOrders.length > 0 &&
        totalMatchingOrders.every(
          (o) =>
            o.status &&
            o.status.toUpperCase() === statusFilter.toUpperCase()
        ));

    if (
      !isSeededCommodityMatch ||
      !isSeededBuyerMatch ||
      !isSeededStatusMatch ||
      totalMatchingOrders.length === 0 ||
      totalMatchingOrders.length > PAGE_SIZE
    ) {
      loadOrders(selectedCommodity, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Handle commodity button click: resets pagination to page 0
  const handleCommoditySelect = (commodity) => {
    if (isLoading && selectedCommodity === commodity) return;
    setSelectedCommodity(commodity);
    setCurrentPage(0);
    setSelectedRowId(null);
    loadOrders(commodity, 0);
  };

  // Handle pagination navigation: preserves active commodity and filters
  const handlePageChange = (newPage) => {
    if (isLoading || newPage === currentPage || newPage < 0) return;
    if (isSearching) {
      if (newPage >= totalPages) return;
      setCurrentPage(newPage);
      setSelectedRowId(null);
      return;
    }
    setCurrentPage(newPage);
    setSelectedRowId(null);
    loadOrders(selectedCommodity, newPage);
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
    setSelectedRowId(null);
  };

  // Handle clearing search: restores orders matching current commodity filter
  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(0);
    setSelectedRowId(null);
  };

  // Handle double-click row to open modal
  const handleRowDoubleClick = async (orderId) => {
    if (!orderId) return;
    setModalOrderId(orderId);
    setModalLoading(true);
    setModalError(null);
    setModalOrderData(null);

    try {
      const data = await fetchOrderById(orderId);
      setModalOrderData(data);
    } catch (err) {
      setModalError(err.message || 'Failed to load order details');
    } finally {
      setModalLoading(false);
    }
  };

  // Close modal handler
  const handleCloseModal = () => {
    setModalOrderId(null);
    setModalOrderData(null);
    setModalError(null);
  };

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalOrderId) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOrderId]);

  // Derive Summary Card values across active matching orders (or filtered when searching)
  const summaries = useMemo(() => {
    const ordersToSummarize = isSearching ? filteredOrders : totalMatchingOrders;
    const count = ordersToSummarize.length;
    let totalVal = 0;
    let totalQty = 0;
    let commonUnit = null;
    let hasMismatchedUnit = false;
    const statusCounts = {};

    ordersToSummarize.forEach((o) => {
      // Total value
      if (o.totalAmount !== undefined && o.totalAmount !== null) {
        const val = parseFloat(String(o.totalAmount).replace(/,/g, ''));
        if (!isNaN(val)) totalVal += val;
      }

      // Quantity aggregation with unit consistency check
      if (o.quantity !== undefined && o.quantity !== null) {
        const q = parseFloat(String(o.quantity).replace(/,/g, ''));
        if (!isNaN(q)) {
          totalQty += q;
          const u = (o.unit || '').trim();
          if (commonUnit === null) {
            commonUnit = u;
          } else if (commonUnit.toLowerCase() !== u.toLowerCase()) {
            hasMismatchedUnit = true;
          }
        }
      }

      // Status breakdown
      if (o.status) {
        const s = String(o.status).toUpperCase();
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      }
    });

    const formattedValue = totalVal.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: totalVal % 1 === 0 ? 0 : 2,
    });

    const formattedQty = hasMismatchedUnit
      ? `${totalQty.toLocaleString('en-IN')} (Mixed units)`
      : `${totalQty.toLocaleString('en-IN')} ${commonUnit || ''}`.trim();

    return {
      count,
      totalValue: formattedValue,
      totalQuantity: formattedQty,
      statusCounts,
    };
  }, [isSearching, filteredOrders, totalMatchingOrders]);

  // Derived authoritative pagination counts from API response metadata or client-side search filter
  const totalCount = isSearching
    ? filteredOrders.length
    : serverTotalElements !== null
    ? serverTotalElements
    : totalMatchingOrders.length;

  const totalPages = isSearching
    ? Math.max(0, Math.ceil(totalCount / PAGE_SIZE))
    : serverTotalPages !== null
    ? Math.max(1, serverTotalPages)
    : Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="order-explorer-container">
      {/* 1. Interactive Commodity Selector */}
      <div className="order-selector-section">
        <div className="order-selector-prompt">
          <strong>{i18n.selectorPrompt}</strong>
        </div>
        <div className="commodity-buttons-scroll" role="tablist" aria-label="Commodity order selector">
          {/* "All commodities" button */}
          <button
            type="button"
            role="tab"
            aria-selected={selectedCommodity === 'ALL'}
            className={`commodity-btn ${selectedCommodity === 'ALL' ? 'active' : ''}`}
            onClick={() => handleCommoditySelect('ALL')}
            disabled={isLoading}
          >
            <span className="commodity-btn-name">{i18n.allCommodities}</span>
          </button>

          {/* Individual dynamic commodity buttons */}
          {availableCommodities.map((comm) => {
            const isSelected = selectedCommodity.toLowerCase() === comm.toLowerCase();
            const localized = formatCommodityDisplay(comm, lang);
            return (
              <button
                key={comm}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`commodity-btn ${isSelected ? 'active' : ''}`}
                onClick={() => handleCommoditySelect(comm)}
                disabled={isLoading}
              >
                <span className="commodity-btn-name">{localized}</span>
                {lang !== 'en' && comm.toLowerCase() !== localized.toLowerCase() && (
                  <span className="commodity-btn-en-sub">({comm})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Compact Summary Cards (covers ALL matching orders) */}
      <div className="order-summary-cards">
        <div className="order-stat-card card-count">
          <div className="stat-card-label">{i18n.ordersBadge(summaries.count)}</div>
          <div className="stat-card-sub">
            {buyerNameFilter
              ? `${buyerNameFilter}${selectedCommodity !== 'ALL' ? ` (${formatCommodityDisplay(selectedCommodity, lang)})` : ''}`
              : selectedCommodity === 'ALL'
              ? i18n.allCommodities
              : formatCommodityDisplay(selectedCommodity, lang)}
          </div>
        </div>

        <div className="order-stat-card card-value">
          <div className="stat-card-label">{i18n.totalValueBadge(summaries.totalValue)}</div>
          <div className="stat-card-sub">Authoritative Total</div>
        </div>

        <div className="order-stat-card card-quantity">
          <div className="stat-card-label">Total Qty: {summaries.totalQuantity}</div>
          <div className="stat-card-sub">Requested / Placed</div>
        </div>

        {/* Status Breakdown Pills */}
        <div className="order-stat-card card-status">
          <div className="stat-status-title">{i18n.statusTitle}</div>
          <div className="status-pills-wrap">
            {Object.entries(summaries.statusCounts).map(([statusKey, count]) => {
              const label = i18n.statusLabels[statusKey] || statusKey;
              return (
                <span key={statusKey} className={`order-status-pill status-${statusKey.toLowerCase()}`}>
                  {label}: <strong>{count}</strong>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2.5 Dynamic Order Search Bar */}
      <div className="order-search-container">
        <div className="search-box order-search-box">
          <SearchIcon className="search-icon" size={16} />
          <input
            type="text"
            className="search-input order-search-input"
            placeholder={i18n.searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label={i18n.searchAriaLabel}
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClearSearch}
              aria-label={i18n.clearSearch}
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Helpful Hint */}
      <div className="order-table-hint">
        <span className="hint-icon">💡</span>
        <span>{i18n.doubleClickHint}</span>
      </div>

      {/* 3. Orders Table / Loading / Empty / Error States */}
      <div className="order-table-wrapper">
        {isLoading && (
          <div className="order-loading-overlay">
            <div className="order-spinner" />
            <span>{i18n.loading}</span>
          </div>
        )}

        {error && (
          <div className="order-error-banner">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {!isLoading && !error && displayedOrders.length === 0 && (
          <div className="order-empty-banner" data-testid="order-empty-banner">
            <span className="empty-icon">📋</span>
            <div className="order-empty-message">
              <span className="order-empty-title">
                {isSearching ? i18n.noOrdersFound : i18n.noOrders}
              </span>
              {isSearching && (
                <span className="order-empty-subtitle">0 matching orders</span>
              )}
            </div>
          </div>
        )}

        {!error && displayedOrders.length > 0 && (
          <div className="table-responsive">
            <table className="order-records-table">
              <thead>
                <tr>
                  <th>{i18n.idCol}</th>
                  <th>{i18n.buyerCol}</th>
                  <th>{i18n.commodityCol}</th>
                  <th className="text-right">{i18n.quantityCol}</th>
                  <th className="text-right">{i18n.priceCol}</th>
                  <th className="text-right">{i18n.totalCol}</th>
                  <th>{i18n.marketCol}</th>
                  <th>{i18n.deliveryCol}</th>
                  <th>{i18n.statusCol}</th>
                  <th>{i18n.dateCol}</th>
                </tr>
              </thead>
              <tbody>
                {displayedOrders.map((order) => {
                  const isSelected = selectedRowId === order.id;
                  const dateStr = order.createdAt
                    ? order.createdAt.includes('T')
                      ? order.createdAt.substring(0, order.createdAt.indexOf('T'))
                      : order.createdAt
                    : '-';
                  const formattedPrice = order.pricePerUnit
                    ? `₹${Number(order.pricePerUnit).toLocaleString('en-IN')}`
                    : '-';
                  const formattedTotal = order.totalAmount
                    ? `₹${Number(order.totalAmount).toLocaleString('en-IN')}`
                    : '-';
                  const qtyDisplay = `${order.quantity || 0} ${order.unit || ''}`.trim();
                  const statusLabel =
                    i18n.statusLabels[order.status] || order.status || '-';

                  return (
                    <tr
                      key={order.id}
                      className={`order-row ${isSelected ? 'selected-row' : ''}`}
                      onClick={() => setSelectedRowId(order.id)}
                      onDoubleClick={() => handleRowDoubleClick(order.id)}
                      title="Double-click to view order details"
                    >
                      <td>
                        <strong>#{order.id}</strong>
                      </td>
                      <td>
                        <span className="buyer-name-cell">{order.buyerName || '-'}</span>
                      </td>
                      <td>{order.commodityName || '-'}</td>
                      <td className="text-right">{qtyDisplay}</td>
                      <td className="text-right">{formattedPrice}</td>
                      <td className="text-right">
                        <span className="total-amount-bold">{formattedTotal}</span>
                      </td>
                      <td>{order.marketLocation || '-'}</td>
                      <td>{order.deliveryLocation || '-'}</td>
                      <td>
                        <span
                          className={`order-status-badge status-${String(
                            order.status || ''
                          ).toLowerCase()}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td>{dateStr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Real Server-Side Pagination Controls */}
      {totalPages >= 1 && displayedOrders.length > 0 && (
        <div className="order-pagination-controls" aria-label="Order pagination controls">
          <button
            type="button"
            className="pagination-btn prev-btn"
            disabled={currentPage === 0 || isLoading}
            onClick={() => handlePageChange(currentPage - 1)}
            aria-label={i18n.prev}
          >
            ← {i18n.prev}
          </button>

          <div className="pagination-pages" role="navigation" aria-label="Numbered page navigation">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`pagination-num-btn ${currentPage === idx ? 'active' : ''}`}
                onClick={() => handlePageChange(idx)}
                disabled={isLoading}
                aria-current={currentPage === idx ? 'page' : undefined}
                aria-label={`Page ${idx + 1}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="pagination-btn next-btn"
            disabled={currentPage >= totalPages - 1 || isLoading}
            onClick={() => handlePageChange(currentPage + 1)}
            aria-label={i18n.next}
          >
            {i18n.next} →
          </button>

          <span className="pagination-info">
            {i18n.pageText(currentPage + 1, totalPages, totalCount)}
          </span>
        </div>
      )}

      {/* 5. Double-Click In-Chat Order Details Modal Overlay */}
      {modalOrderId && (
        <div className="order-modal-backdrop" onClick={handleCloseModal}>
          <div
            className="order-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4 id="modal-title" className="modal-title">
                {i18n.modalTitle} #{modalOrderId}
              </h4>
              <button
                type="button"
                className="modal-close-icon"
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              {modalLoading && (
                <div className="modal-loading-box">
                  <div className="order-spinner" />
                  <span>Loading authoritative order details...</span>
                </div>
              )}

              {modalError && (
                <div className="modal-error-box">
                  <span className="error-icon">⚠️</span>
                  <span>{modalError}</span>
                </div>
              )}

              {!modalLoading && !modalError && modalOrderData && (
                <div className="modal-details-grid">
                  <div className="modal-field-group">
                    <span className="field-label">Order ID:</span>
                    <span className="field-value font-bold">#{modalOrderData.id}</span>
                  </div>

                  <div className="modal-field-group">
                    <span className="field-label">Status:</span>
                    <span
                      className={`order-status-badge status-${String(
                        modalOrderData.status || ''
                      ).toLowerCase()}`}
                    >
                      {i18n.statusLabels[modalOrderData.status] || modalOrderData.status}
                    </span>
                  </div>

                  <div className="modal-field-group">
                    <span className="field-label">Buyer Name:</span>
                    <span className="field-value font-bold">
                      {modalOrderData.buyerName || '-'}
                    </span>
                  </div>

                  <div className="modal-field-group">
                    <span className="field-label">Commodity:</span>
                    <span className="field-value">
                      {formatCommodityDisplay(modalOrderData.commodityName, lang)}
                    </span>
                  </div>

                  <div className="modal-field-group">
                    <span className="field-label">Quantity:</span>
                    <span className="field-value font-bold">
                      {modalOrderData.quantity} {modalOrderData.unit}
                    </span>
                  </div>

                  <div className="modal-field-group">
                    <span className="field-label">Price Per Unit:</span>
                    <span className="field-value">
                      ₹{Number(modalOrderData.pricePerUnit).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="modal-field-group">
                    <span className="field-label">Total Amount:</span>
                    <span className="field-value total-highlight">
                      ₹{Number(modalOrderData.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="modal-field-group">
                    <span className="field-label">Market Location:</span>
                    <span className="field-value">
                      {modalOrderData.marketLocation || '-'}
                    </span>
                  </div>

                  <div className="modal-field-group">
                    <span className="field-label">Delivery Location:</span>
                    <span className="field-value">
                      {modalOrderData.deliveryLocation || '-'}
                    </span>
                  </div>

                  <div className="modal-field-group">
                    <span className="field-label">Created At:</span>
                    <span className="field-value font-mono">
                      {modalOrderData.createdAt
                        ? modalOrderData.createdAt.replace('T', ' ')
                        : '-'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-action-btn"
                onClick={handleCloseModal}
              >
                {i18n.modalClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
