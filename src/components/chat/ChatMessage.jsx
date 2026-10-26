import React, { useState, useMemo } from 'react';
import { SparklesIcon, RateIcon } from '../common/Icons';
import TrendChart from '../common/TrendChart';
import OrderExplorer from './OrderExplorer';
import PartyCountCard from './PartyCountCard';
import PartyExplorer from './PartyExplorer';
import SupplyExplorer from './SupplyExplorer';
import DemandExplorer from './DemandExplorer';
import BidExplorer from './BidExplorer';
import DealExplorer from './DealExplorer';
import WhatsAppDiagnosticsCard from './WhatsAppDiagnosticsCard';
import { translateQuestion } from './SuggestedPrompts';

/**
 * Checks if message represents a registered parties query.
 */
function isPartiesQuery(question, content, displayType, parties) {
  if (displayType === 'PARTIES' || displayType === 'PARTY_COUNT') return true;
  if (Array.isArray(parties) && parties.length > 0) return true;
  const qLower = (question || '').toLowerCase();
  const cLower = (content || '').toLowerCase();
  const combined = `${qLower} ${cLower}`;
  return (
    combined.includes('registered parties') ||
    combined.includes('registered party') ||
    combined.includes('parties are registered') ||
    combined.includes('parties registered') ||
    combined.includes('parties in ') ||
    combined.includes('parties located') ||
    combined.includes('party prt-') ||
    combined.includes('prt-') ||
    combined.includes('buyers are registered') ||
    combined.includes('sellers are registered') ||
    combined.includes('inactive or deleted parties') ||
    combined.includes('inactive parties') ||
    combined.includes('deleted parties') ||
    combined.includes('registered buyers') ||
    combined.includes('registered sellers') ||
    combined.includes('total parties') ||
    combined.includes('all parties') ||
    combined.includes('all registered parties') ||
    combined.includes('नोंदणीकृत पार्ट्या') ||
    combined.includes('नोंदणीकृत पार्टी') ||
    combined.includes('पंजीकृत पार्टियां') ||
    combined.includes('पंजीकृत पार्टी') ||
    combined.includes('पार्टी तपशील') ||
    combined.includes('पार्टी विवरण')
  );
}

/**
 * Checks if query specifically requests the 2-KPI total count view with 4 action cards.
 */
function isPartyCountQuery(question, content, displayType) {
  if (displayType === 'PARTY_COUNT') return true;
  const qLower = (question || '').toLowerCase();

  // If question is asking for list of parties or specific details, return false
  if (
    qLower.includes('list') ||
    qLower.includes('show all') ||
    qLower.includes('यादी') ||
    qLower.includes('सूची') ||
    qLower.includes('details') ||
    qLower.includes('तपशील') ||
    qLower.includes('विवरण') ||
    qLower.includes('prt-')
  ) {
    return false;
  }

  // Specific sub-queries (buyers, sellers, location, month) should render explorer view
  if (
    qLower.includes('buyer') ||
    qLower.includes('seller') ||
    qLower.includes('month') ||
    qLower.includes('sangli') ||
    qLower.includes('सांगली') ||
    qLower.includes('खरेदीदार') ||
    qLower.includes('विक्रेता') ||
    qLower.includes('या महिन्यात') ||
    qLower.includes('इस महीने')
  ) {
    return false;
  }

  // General count question keywords
  return (
    qLower.includes('how many parties') ||
    qLower.includes('total parties') ||
    qLower.includes('count of parties') ||
    qLower.includes('number of parties') ||
    qLower.includes('पार्ट्या किती') ||
    qLower.includes('पार्टी संख्या') ||
    qLower.includes('कितनी पार्टियां') ||
    qLower.includes('कुल पार्टियां')
  );
}

/**
 * Checks if message represents an orders query.
 */
function isOrdersQuery(question, content, displayType, orders) {
  if (displayType === 'ORDERS') return true;
  if (Array.isArray(orders) && orders.length > 0) return true;
  const qLower = (question || '').toLowerCase();
  const cLower = (content || '').toLowerCase();
  const combined = `${qLower} ${cLower}`;
  return (
    (combined.includes('order') ||
      combined.includes('orders') ||
      combined.includes('ऑर्डर') ||
      combined.includes('ऑर्डर्स') ||
      combined.includes('आर्डर') ||
      combined.includes('आर्डर्स')) &&
    !combined.includes('in order to') &&
    !combined.includes('ascending order') &&
    !combined.includes('descending order')
  );
}

/**
 * Checks if message represents a supplies and inventory query (Step 3).
 */
function isSupplyQuery(question, content, displayType) {
  if (displayType === 'SUPPLIES' || displayType === 'SUPPLY') return true;
  const q = (question || '').toLowerCase();
  const c = (content || '').toLowerCase();
  const combined = `${q} ${c}`;
  return (
    combined.includes('supply') ||
    combined.includes('supplies') ||
    combined.includes('sup-') ||
    combined.includes('आपूर्ति') ||
    combined.includes('पुरवठा') ||
    combined.includes('available inventory') ||
    combined.includes('expiring soon') ||
    (combined.includes('seller') && combined.includes('highest available quantity')) ||
    (combined.includes('available') && combined.includes('soybean quantity'))
  );
}

/**
 * Checks if message represents an advanced buyer demand explorer query (Step 4).
 */
function isDemandExplorerQuery(question, content, displayType) {
  if (displayType === 'DEMAND_EXPLORER') return true;
  if (displayType === 'DEMAND') return false; // Handled by Case 5 for tests and standard demand
  const q = (question || '').toLowerCase();
  const c = (content || '').toLowerCase();
  const combined = `${q} ${c}`;
  return (
    combined.includes('buyer demand') ||
    combined.includes('buyer demands') ||
    combined.includes('highest demand') ||
    combined.includes('requested quantity') ||
    combined.includes('expiring this week') ||
    (combined.includes('demand') && (combined.includes('above 4000') || combined.includes('above ₹4,000') || combined.includes('active') || combined.includes('soybean demands')))
  );
}

/**
 * Checks if message represents a bids or negotiations query (Step 5).
 */
function isBidQuery(question, content, displayType) {
  if (displayType === 'BIDS' || displayType === 'NEGOTIATION' || displayType === 'BID') return true;
  const q = (question || '').toLowerCase();
  const c = (content || '').toLowerCase();
  const combined = `${q} ${c}`;
  return (
    combined.includes('bid') ||
    combined.includes('bids') ||
    combined.includes('negotiat') ||
    combined.includes('counter-offer') ||
    combined.includes('counter offer') ||
    combined.includes('offer rate') ||
    combined.includes('बोली') ||
    combined.includes('मोलभाव') ||
    combined.includes('वाटाघाटी')
  );
}

/**
 * Checks if message represents a deals or contracts query (Step 6).
 */
function isDealQuery(question, content, displayType) {
  if (
    displayType === 'DEALS' ||
    displayType === 'CONTRACTS' ||
    displayType === 'DEAL' ||
    displayType === 'CONTRACT'
  )
    return true;
  const q = (question || '').toLowerCase();
  const c = (content || '').toLowerCase();
  const combined = `${q} ${c}`;
  return (
    combined.includes('deal') ||
    combined.includes('deals') ||
    combined.includes('contract') ||
    combined.includes('contracts') ||
    combined.includes('signature') ||
    combined.includes('signatures') ||
    combined.includes('सौदा') ||
    combined.includes('सौदे') ||
    combined.includes('अनुबंध') ||
    combined.includes('करार')
  );
}

/**
 * Checks if message represents a WhatsApp or notifications diagnostics query (Step 7).
 */
function isWhatsAppDiagnosticsQuery(question, content, displayType) {
  if (displayType === 'WHATSAPP' || displayType === 'NOTIFICATION' || displayType === 'DIAGNOSTICS')
    return true;
  const q = (question || '').toLowerCase();
  const c = (content || '').toLowerCase();
  const combined = `${q} ${c}`;
  return (
    combined.includes('whatsapp') ||
    combined.includes('व्हाट्सएप') ||
    combined.includes('व्हॉट्सॲप') ||
    combined.includes('notification') ||
    combined.includes('notifications') ||
    combined.includes('failed notifications') ||
    combined.includes('failed whatsapp') ||
    combined.includes('delivery status') ||
    combined.includes('configured and connected') ||
    combined.includes('सूचना')
  );
}

/**
 * Checks if the user's natural language question is asking for historical rates / trends.
 * Supports English, Marathi, and Hindi keywords.
 */
function isHistoricalRateQuery(question, response) {
  if (response?.displayType === 'DEMAND' || response?.displayType === 'ORDERS') {
    return false;
  }
  if (response?.displayType === 'CHART' || response?.displayType === 'RATE_AND_CHART') {
    return true;
  }
  if (response?.chartData && Array.isArray(response.chartData) && response.chartData.length >= 2) {
    return true;
  }
  if (!question || typeof question !== 'string') return false;

  const lower = question.toLowerCase();

  // If question is strictly about demand without asking for rates/prices/trends, do NOT trigger historical flow
  const isDemandQuery =
    lower.includes('demand') || lower.includes('मागणी') || lower.includes('मांग');
  const isRateQuery =
    lower.includes('rate') || lower.includes('price') || lower.includes('दर') || lower.includes('भाव') || lower.includes('trend') || lower.includes('chart');

  if (isDemandQuery && !isRateQuery) {
    return false;
  }

  const historicalKeywords = [
    'last 7 days',
    'past 7 days',
    '7 days',
    '7 day',
    '7 दिवस',
    '7 दिवसांचा',
    '7 दिवसांचे',
    '7 दिन',
    '7 दिनों',
    'trend',
    'trends',
    'history',
    'historical',
    'कल',
    'ट्रेंड',
    'इतिहास',
    'yesterday',
    'काल',
    'दर इतिहास',
    'period',
    'requested period',
    'turned for the requested period',
    'records',
    'all records',
    'all actual',
    'actual records',
    'कालावधी',
    'अवधि',
    'मागील',
    'गेल्या',
    'पिछले',
  ];

  return historicalKeywords.some((kw) => lower.includes(kw));
}

/**
 * Normalizes date string to YYYY-MM-DD if possible.
 */
function normalizeDate(raw) {
  if (!raw) return null;
  const str = String(raw).trim().replace(/\*\*/g, '');
  // YYYY-MM-DD
  const ymd = str.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (ymd) return ymd[1];
  // DD-MM-YYYY or DD/MM/YYYY
  const dmy = str.match(/\b(\d{2})[-/](\d{2})[-/](\d{4})\b/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  // YYYY/MM/DD
  const ymdSlash = str.match(/\b(\d{4})\/(\d{2})\/(\d{2})\b/);
  if (ymdSlash) return `${ymdSlash[1]}-${ymdSlash[2]}-${ymdSlash[3]}`;
  return null;
}

/**
 * Parses all actual historical rate records returned by the backend in chartData,
 * markdown tables, JSON code blocks, or text.
 * Strictly uses data returned from the backend — never fabricates dates or prices.
 * Never parses demand figures as rates.
 */
function parseAllHistoricalRateRecords(text, chartData = [], userQuestion = '') {
  const recordsMap = new Map();

  // If question is strictly about demand, do not extract demand numbers as rate records
  const qLower = (userQuestion || '').toLowerCase();
  const isDemandOnly =
    (qLower.includes('demand') || qLower.includes('मागणी') || qLower.includes('मांग')) &&
    !qLower.includes('rate') &&
    !qLower.includes('price') &&
    !qLower.includes('दर') &&
    !qLower.includes('भाव') &&
    !qLower.includes('trend') &&
    !qLower.includes('chart');

  if (isDemandOnly) {
    return [];
  }

  // 1. Structured chartData from backend DTO (ChatResponse.java: List<ChartData>)
  if (Array.isArray(chartData)) {
    if (chartData.length > 0) {
      const qComm = extractCommodityFromText(userQuestion);
      const qLoc = extractLocationFromText(userQuestion);
      chartData.forEach((cd) => {
        if (cd && cd.date && cd.rate !== undefined && cd.rate !== null) {
          const rateNum = parseFloat(String(cd.rate).replace(/,/g, ''));
          const normDate = normalizeDate(cd.date);
          if (!isNaN(rateNum) && normDate && rateNum > 0) {
            recordsMap.set(normDate, {
              date: normDate,
              rate: rateNum,
              unit: cd.unit || null,
              location: cd.location || qLoc || null,
              commodity: cd.commodity || qComm || null,
            });
          }
        }
      });
    }
    // Backend provided authoritative chartData array; do not scrape out-of-range records from free text notes
    return Array.from(recordsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  if (text && typeof text === 'string') {
    // 2. JSON code blocks in text: e.g. ```json [ { "date": "...", "rate": ... } ] ```
    const jsonMatches = text.match(/```(?:json)?\s*(\[\s*\{[\s\S]*?\}\s*\])\s*```/i);
    if (jsonMatches) {
      try {
        const parsed = JSON.parse(jsonMatches[1]);
        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            const d = normalizeDate(item.date || item.rateDate);
            const r = parseFloat(String(item.rate || item.price || item.dar || '').replace(/,/g, ''));
            if (d && !isNaN(r) && r > 0) {
              recordsMap.set(d, {
                date: d,
                rate: r,
                unit: item.unit || null,
                location: item.location || null,
                commodity: item.commodity || null,
              });
            }
          });
        }
      } catch (e) {
        // Ignore malformed JSON
      }
    }

    // 3. Markdown Table Parsing (e.g. "| Date | Rate (INR per Quintal) |" or "| Date | Rate | Location |")
    const lines = text.split('\n');
    let dateColIdx = -1;
    let rateColIdx = -1;
    let commodityColIdx = -1;
    let unitColIdx = -1;
    let locationColIdx = -1;
    let tableUnit = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line.includes('|')) {
        // Reset table column tracking when line is empty
        if (dateColIdx !== -1 && rateColIdx !== -1 && line.length === 0) {
          dateColIdx = -1;
          rateColIdx = -1;
        }
        continue;
      }

      // Extract cells
      let cells = line.split('|').map((c) => c.trim().replace(/\*\*/g, ''));
      if (line.startsWith('|')) cells.shift();
      if (line.endsWith('|')) cells.pop();

      // Check if markdown divider line (e.g. |---|---:|)
      const isDivider = cells.length > 0 && cells.every((c) => /^:?-+:?$/.test(c.trim()));
      if (isDivider) continue;

      // Check for Header Line (only if columns not yet identified and cells are not data values)
      const hasDataValue = cells.some((c) => normalizeDate(c) || /^(?:INR|Rs\.?|₹)?\s*[0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?\s*(?:INR|Rs\.?|₹)?$/i.test(c.trim()));
      const hasDateHeader = cells.some((c) => /(?:date|tarikh|day|तारीख|दिनांक)/i.test(c) && !normalizeDate(c));
      const hasRateHeader = cells.some((c) =>
        /(?:rate|price|dar|bhav|दर|भाव)/i.test(c) &&
        !/(?:demand|quantity|volume|stock|मागणी|मांग)/i.test(c) &&
        !/^[₹$\d,.\s]+$/.test(c.trim())
      );

      if ((dateColIdx === -1 || rateColIdx === -1) && (hasDateHeader || hasRateHeader) && !hasDataValue) {
        for (let cIdx = 0; cIdx < cells.length; cIdx++) {
          const c = cells[cIdx];
          if (/(?:date|tarikh|day|तारीख|दिनांक)/i.test(c)) dateColIdx = cIdx;
          if (
            /(?:rate|price|dar|bhav|inr|₹|दर|भाव)/i.test(c) &&
            !/(?:demand|quantity|volume|stock|मागणी|मांग)/i.test(c)
          ) {
            rateColIdx = cIdx;
            const unitM = c.match(/(?:per|\/)\s*([A-Za-z]+)/i);
            if (unitM) tableUnit = unitM[1];
          }
          if (/(?:commodity|crop|pik|पीक)/i.test(c)) commodityColIdx = cIdx;
          if (/(?:unit|measure|एकक)/i.test(c)) unitColIdx = cIdx;
          if (/(?:location|market|mandi|apmc|city|बाजार|मंडी)/i.test(c)) locationColIdx = cIdx;
        }
        continue;
      }

      // If headers were found, extract from identified columns
      if (dateColIdx !== -1 && rateColIdx !== -1 && cells.length > Math.max(dateColIdx, rateColIdx)) {
        const rawDate = cells[dateColIdx];
        const rawRate = cells[rateColIdx];
        const normDate = normalizeDate(rawDate);
        const rateNum = parseFloat(rawRate.replace(/[^0-9.]/g, ''));

        if (normDate && !isNaN(rateNum) && rateNum > 10) {
          const comm = commodityColIdx !== -1 && cells[commodityColIdx] ? cells[commodityColIdx] : null;
          const loc = locationColIdx !== -1 && cells[locationColIdx] ? cells[locationColIdx] : null;
          const un = unitColIdx !== -1 && cells[unitColIdx] ? cells[unitColIdx] : tableUnit;

          recordsMap.set(normDate, {
            date: normDate,
            rate: rateNum,
            commodity: comm,
            location: loc,
            unit: un,
          });
          continue;
        }
      }

      // Fallback for tables without recognized header: search cells directly
      let rowDate = null;
      let rowRate = null;
      let rowComm = null;
      let rowLoc = null;
      let rowUnit = null;

      for (let cellIdx = 0; cellIdx < cells.length; cellIdx++) {
        const cell = cells[cellIdx];
        const dMatch = normalizeDate(cell);
        if (dMatch && !rowDate) {
          rowDate = dMatch;
          continue;
        }
        const cleanVal = cell.replace(/,/g, '').trim();
        const rMatch = cleanVal.match(/^(?:INR|Rs\.?|₹)?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:INR|Rs\.?|₹)?$/i);
        if (rMatch && !rowRate) {
          const val = parseFloat(rMatch[1]);
          if (!isNaN(val) && val > 10) {
            rowRate = val;
            continue;
          }
        }
        if (cell.match(/^(Soybean|Wheat|Rice|Cotton|Maize|Gram|Tur|Chana|Mustard|Bajra|Jowar)/i)) {
          rowComm = cell;
        } else if (cell.match(/^(Quintal|MT|Kg|Bori|Bag|Ton|unit)$/i)) {
          rowUnit = cell;
        } else if (cell.length > 2 && !cell.includes('-') && !rowLoc) {
          rowLoc = cell;
        }
      }

      if (rowDate && rowRate && !recordsMap.has(rowDate)) {
        recordsMap.set(rowDate, {
          date: rowDate,
          rate: rowRate,
          commodity: rowComm,
          unit: rowUnit || tableUnit,
          location: rowLoc,
        });
      }
    }

    // 4. Multi-line Blocks (e.g. Spring Boot MarketplaceDataService "Market Rate Information:\nCommodity: ...\nRate: ...\nDate: ...")
    const blocks = text.split(/(?:Market Rate Information:|\n\s*\n|\r\n\s*\r\n)/i);
    blocks.forEach((block) => {
      if (!block || !block.trim() || block.includes('|')) return;

      const dateMatch =
        block.match(/\b([0-9]{4}-[0-9]{2}-[0-9]{2})\b/) ||
        block.match(/(?:Date|Tarikh|Tarikh:|As of)[:\s]*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}[-/][0-9]{2}[-/][0-9]{4})/i);

      const rateMatch =
        block.match(/(?:Rate|Price|Dar|Bhav)[:\s]+(?:INR|Rs\.?|₹)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/i) ||
        block.match(/(?:INR|Rs\.?|₹)\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/i);

      if (dateMatch && rateMatch) {
        const date = normalizeDate(dateMatch[1] || dateMatch[0]);
        const rate = parseFloat(rateMatch[1].replace(/,/g, ''));
        if (date && !isNaN(rate) && rate > 10 && !recordsMap.has(date)) {
          const locMatch = block.match(/(?:Location|Market|Mandi|APMC|in|at)\s*[:\s]+([A-Za-z\u0900-\u097F]+)/i);
          const unitMatch =
            block.match(/(?:Unit|Per|Prati)\s*[:\s]+([A-Za-z\u0900-\u097F]+)/i) ||
            block.match(/per\s+(Quintal|MT|Kg|Bori|Bag|Ton|unit)/i);
          const commMatch =
            block.match(/(?:Commodity|Pik)\s*[:\s]+([A-Za-z\u0900-\u097F]+)/i) ||
            block.match(/(Soybean|Wheat|Rice|Cotton|MaizeW|Maize|Gram|Tur|Chana|Mustard|Bajra|Jowar|सोयाबीन|गहू|तांदूळ|कापूस|मका)/i);

          recordsMap.set(date, {
            date,
            rate,
            commodity: commMatch ? (commMatch[1] || commMatch[0]) : null,
            location: locMatch ? locMatch[1] : null,
            unit: unitMatch ? (unitMatch[1] || unitMatch[0]) : null,
          });
        }
      }
    });

    // 5. Line-by-line fallback: e.g. "- 2026-10-01: ₹4,180.0 / Quintal"
    lines.forEach((l) => {
      const line = l.trim();
      if (!line || line.includes('|') || line.toLowerCase().includes('demand')) return;

      const dateMatch =
        line.match(/\b([0-9]{4}-[0-9]{2}-[0-9]{2})\b/) ||
        line.match(/(?:Date|Tarikh|Tarikh:)\s*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}[-/][0-9]{2}[-/][0-9]{4})/i);

      const rateMatch =
        line.match(/(?:Rate|Price|Dar|Bhav)[:\s]+(?:INR|Rs\.?|₹)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/i) ||
        line.match(/(?:INR|Rs\.?|₹)\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/i);

      if (dateMatch && rateMatch) {
        const date = normalizeDate(dateMatch[1] || dateMatch[0]);
        const rate = parseFloat(rateMatch[1].replace(/,/g, ''));
        if (date && !isNaN(rate) && rate > 10 && !recordsMap.has(date)) {
          const locMatch = line.match(/(?:Location|Market|Mandi|APMC|in|at)\s*[:\s]+([A-Za-z\u0900-\u097F]+)/i);
          const unitMatch =
            line.match(/(?:Unit|Per|Prati)\s*[:\s]+([A-Za-z\u0900-\u097F]+)/i) ||
            line.match(/per\s+(Quintal|MT|Kg|Bori|Bag|Ton|unit)/i);
          const commMatch = line.match(/(Soybean|Wheat|Rice|Cotton|MaizeW|Maize|Gram|Tur|Chana|Mustard|Bajra|Jowar|सोयाबीन|गहू|तांदूळ|कापूस|मका)/i);

          recordsMap.set(date, {
            date,
            rate,
            commodity: commMatch ? (commMatch[1] || commMatch[0]) : null,
            location: locMatch ? locMatch[1] : null,
            unit: unitMatch ? (unitMatch[1] || unitMatch[0]) : null,
          });
        }
      }
    });
  }

  // 6. Contextual enrichment: propagate commodity / location / unit if records lack them
  const globalCommMatch =
    (userQuestion && userQuestion.match(/(Soybean|Wheat|Rice|Cotton|MaizeW|Maize|Gram|Tur|Chana|Mustard|Bajra|Jowar|सोयाबीन|गहू|तांदूळ|कापूस|मका)/i)) ||
    (text && text.match(/(?:Commodity(?:\s*Name)?|Pik):\s*([A-Za-z\u0900-\u097F]+)/i)) ||
    (text && text.match(/(Soybean|Wheat|Rice|Cotton|MaizeW|Maize|Gram|Tur|Chana|Mustard|Bajra|Jowar|सोयाबीन|गहू|तांदूळ|कापूस|मका)/i));

  const stopWords = new Set([
    'the', 'a', 'an', 'last', 'past', 'today', 'yesterday', 'this', 'that', 'all', 'me', 'us', 'days', 'day'
  ]);
  const locRaw =
    (userQuestion && userQuestion.match(/\b(?:in|at)\s+([A-Za-z\u0900-\u097F]+)/i)) ||
    (text && text.match(/(?:Location|Market|Mandi|APMC):\s*([A-Za-z\u0900-\u097F]+)/i));

  let fallbackLocation = null;
  if (locRaw) {
    const candidate = (locRaw[1] || locRaw[0]).trim();
    if (!stopWords.has(candidate.toLowerCase())) {
      fallbackLocation = candidate;
    }
  }

  const globalUnitMatch =
    (text && text.match(/(?:per|\/)\s*(Quintal|MT|Kg|Bori|Bag|Ton|unit)/i)) ||
    (userQuestion && userQuestion.match(/(?:per|\/)\s*(Quintal|MT|Kg|Bori|Bag|Ton|unit)/i));

  const fallbackCommodity = globalCommMatch ? (globalCommMatch[1] || globalCommMatch[0]) : null;
  const fallbackUnit = globalUnitMatch ? globalUnitMatch[1] : 'Quintal';

  for (const record of recordsMap.values()) {
    if (!record.commodity && fallbackCommodity) record.commodity = fallbackCommodity;
    if (!record.location && fallbackLocation) record.location = fallbackLocation;
    if (!record.unit) record.unit = fallbackUnit;
  }

  // Convert map to chronologically sorted list (oldest to newest)
  return Array.from(recordsMap.values()).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
}

/**
 * Converts Devanagari numerals (०-९) to ASCII numerals (0-9).
 */
function toAsciiDigits(str) {
  if (!str) return '';
  const map = { '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9' };
  return String(str).replace(/[०-९]/g, (d) => map[d] || d);
}

/**
 * Helper to extract commodity name from text.
 */
function extractCommodityFromText(text) {
  if (!text) return null;
  const t = text.toLowerCase();
  if (t.includes('soybean') || t.includes('सोयाबीन')) return 'Soybean';
  if (t.includes('wheat') || t.includes('गहू') || t.includes('गेहूं')) return 'Wheat';
  if (t.includes('rice') || t.includes('तांदूळ') || t.includes('चावल')) return 'Rice';
  if (t.includes('cotton') || t.includes('कापूस') || t.includes('कपास')) return 'Cotton';
  if (t.includes('maizew')) return 'MaizeW';
  if (t.includes('maize') || t.includes('corn') || t.includes('मका') || t.includes('मक्का')) return 'Maize';
  if (t.includes('chana') || t.includes('gram') || t.includes('चना')) return 'Chana';
  if (t.includes('tur') || t.includes('तूर') || t.includes('अरहर')) return 'Tur';
  if (t.includes('mustard') || t.includes('मोहरी') || t.includes('सरसों')) return 'Mustard';
  if (t.includes('bajra') || t.includes('बाजरी') || t.includes('बाजरा')) return 'Bajra';
  if (t.includes('jowar') || t.includes('ज्वारी') || t.includes('ज्वार')) return 'Jowar';
  return null;
}

/**
 * Helper to extract location name from text.
 */
function extractLocationFromText(text) {
  if (!text) return null;
  const t = text.toLowerCase();
  if (t.includes('sangli') || t.includes('सांगली')) return 'Sangli';
  if (t.includes('pune') || t.includes('पुणे')) return 'Pune';
  if (t.includes('akola') || t.includes('अकोला')) return 'Akola';
  if (t.includes('latur') || t.includes('लातूर')) return 'Latur';
  if (t.includes('nagpur') || t.includes('नागपूर')) return 'Nagpur';
  if (t.includes('mumbai') || t.includes('मुंबई')) return 'Mumbai';
  if (t.includes('nashik') || t.includes('नाशिक')) return 'Nashik';
  const m = text.match(/\b(?:in|at|मंडी|बाजारपेठ|बाजार)\s+([A-Za-z\u0900-\u097F]+)/i);
  if (m) {
    const cand = m[1].trim();
    const stopWords = new Set(['the', 'a', 'an', 'last', 'past', 'today', 'all', 'me', 'us', 'days', 'day']);
    if (!stopWords.has(cand.toLowerCase())) return cand;
  }
  return null;
}

/**
 * Formats commodity for display in current rate card.
 */
function formatCommodityDisplay(raw, lang) {
  if (!raw) return '';
  const lower = raw.toLowerCase();
  if (lower.includes('soybean') || lower.includes('सोयाबीन')) return lang === 'hi' || lang === 'mr' ? 'सोयाबीन' : 'Soybean';
  if (lower.includes('wheat') || lower.includes('गहू') || lower.includes('गेहूं')) return lang === 'hi' ? 'गेहूं' : lang === 'mr' ? 'गहू' : 'Wheat';
  if (lower.includes('rice') || lower.includes('तांदूळ') || lower.includes('चावल')) return lang === 'hi' ? 'चावल' : lang === 'mr' ? 'तांदूळ' : 'Rice';
  if (lower.includes('cotton') || lower.includes('कापूस') || lower.includes('कपास')) return lang === 'hi' ? 'कपास' : lang === 'mr' ? 'कापूस' : 'Cotton';
  if (lower.includes('maizew')) return lang === 'hi' ? 'मक्काW' : lang === 'mr' ? 'MaizeW' : 'MaizeW';
  if (lower.includes('maize') || lower.includes('मका') || lower.includes('मक्का')) return lang === 'hi' ? 'मक्का' : lang === 'mr' ? 'मका' : 'Maize';
  if (lower.includes('chana') || lower.includes('चना')) return lang === 'hi' || lang === 'mr' ? 'चना' : 'Chana';
  if (lower.includes('tur') || lower.includes('तूर') || lower.includes('अरहर')) return lang === 'hi' ? 'अरहर / तूर' : lang === 'mr' ? 'तूर' : 'Tur';
  if (lower.includes('mustard') || lower.includes('मोहरी') || lower.includes('सरसों')) return lang === 'hi' ? 'सरसों' : lang === 'mr' ? 'मोहरी' : 'Mustard';
  if (lower.includes('bajra') || lower.includes('बाजरी') || lower.includes('बाजरा')) return lang === 'hi' ? 'बाजरा' : lang === 'mr' ? 'बाजरी' : 'Bajra';
  if (lower.includes('jowar') || lower.includes('ज्वारी') || lower.includes('ज्वार')) return lang === 'hi' ? 'ज्वार' : lang === 'mr' ? 'ज्वारी' : 'Jowar';
  return raw;
}

/**
 * Formats location for display in current rate card.
 */
function formatLocationDisplay(raw, lang) {
  if (!raw) return '';
  const lower = raw.toLowerCase();
  if (lower.includes('sangli') || lower.includes('सांगली')) return lang === 'hi' || lang === 'mr' ? 'सांगली' : 'Sangli';
  if (lower.includes('pune') || lower.includes('पुणे')) return lang === 'hi' || lang === 'mr' ? 'पुणे' : 'Pune';
  if (lower.includes('akola') || lower.includes('अकोला')) return lang === 'hi' || lang === 'mr' ? 'अकोला' : 'Akola';
  if (lower.includes('latur') || lower.includes('लातूर')) return lang === 'hi' || lang === 'mr' ? 'लातूर' : 'Latur';
  if (lower.includes('nagpur') || lower.includes('नागपूर')) return lang === 'hi' || lang === 'mr' ? 'नागपूर' : 'Nagpur';
  if (lower.includes('mumbai') || lower.includes('मुंबई')) return lang === 'hi' || lang === 'mr' ? 'मुंबई' : 'Mumbai';
  if (lower.includes('nashik') || lower.includes('नाशिक')) return lang === 'hi' || lang === 'mr' ? 'नाशिक' : 'Nashik';
  return raw;
}

/**
 * Formats unit for display in current rate card.
 */
function formatUnitDisplay(raw, lang) {
  const norm = (raw || 'Quintal').toLowerCase();
  if (norm.includes('quintal') || norm.includes('क्विंटल')) {
    return lang === 'hi' || lang === 'mr' ? 'प्रति क्विंटल' : 'Per Quintal';
  }
  if (norm.includes('kg') || norm.includes('किलो')) {
    return lang === 'hi' || lang === 'mr' ? 'प्रति किलो' : 'Per Kg';
  }
  if (norm.includes('mt') || norm.includes('टन') || norm.includes('ton')) {
    return lang === 'hi' || lang === 'mr' ? 'प्रति टन' : 'Per MT';
  }
  return raw || 'Quintal';
}

/**
 * Generates an authoritative localized single-rate summary if AI service communication fails.
 */
function generateLocalizedSingleRateSummary(info, lang) {
  if (!info) return '';
  const comm = formatCommodityDisplay(info.commodity, lang);
  const loc = formatLocationDisplay(info.location, lang);
  const rateVal = info.rate || '';
  const unit = info.unit || 'Quintal';
  const dateStr = info.date ? ` (दिनांक: ${info.date})` : '';
  const dateStrEn = info.date ? ` (as of ${info.date})` : '';

  if (lang === 'hi') {
    return `मार्केटप्लेस रिकॉर्ड्स के अनुसार, ${loc} मंडी में आज ${comm} का भाव ₹${rateVal} प्रति ${unit} है${dateStr}।`;
  }
  if (lang === 'mr') {
    return `मार्केटप्लेसच्या नोंदीनुसार, ${loc} बाजारपेठेत ${comm}चा आजचा दर ₹${rateVal} प्रति ${unit} आहे${dateStr}.`;
  }
  return `According to marketplace records, the current market rate for ${comm} in ${loc} is ₹${rateVal} per ${unit}${dateStrEn}.`;
}

/**
 * Maps commodity string or alias to canonical English commodity name.
 */
function getCanonicalCommodity(name) {
  if (!name || typeof name !== 'string') return '';
  const lower = name.trim().toLowerCase();
  if (lower.includes('soybean') || lower.includes('सोयाबीन') || lower.includes('soya')) return 'Soybean';
  if (lower.includes('wheat') || lower.includes('गेहूं') || lower.includes('गहू') || lower.includes('गव्हा')) return 'Wheat';
  if (lower.includes('rice') || lower.includes('चावल') || lower.includes('तांदूळ') || lower.includes('तांदळा') || lower.includes('paddy') || lower.includes('धान')) return 'Rice';
  if (lower.includes('maizew')) return 'MaizeW';
  if (lower.includes('maize') || lower.includes('corn') || lower.includes('मक्का') || lower.includes('मका') || lower.includes('मक्या')) return 'Maize';
  if (lower.includes('cotton') || lower.includes('कपास') || lower.includes('कापूस') || lower.includes('कापसा')) return 'Cotton';
  if (lower.includes('chana') || lower.includes('gram') || lower.includes('चना') || lower.includes('हरभरा') || lower.includes('हरभऱ्या')) return 'Chana';
  if (lower.includes('tur') || lower.includes('arhar') || lower.includes('अरहर') || lower.includes('तूर') || lower.includes('तुरी')) return 'Tur';
  if (lower.includes('mustard') || lower.includes('सरसों') || lower.includes('मोहरी')) return 'Mustard';
  if (lower.includes('bajra') || lower.includes('बाजरा') || lower.includes('बाजरी') || lower.includes('pearl millet')) return 'Bajra';
  if (lower.includes('jowar') || lower.includes('ज्वार') || lower.includes('ज्वारी') || lower.includes('sorghum')) return 'Jowar';
  return name.trim();
}

/**
 * Extracts all referenced commodities in the exact order they appear in the query.
 * Deduplicates case-insensitively while preserving first occurrence.
 * Supports English, Hindi, and Marathi names and common aliases.
 */
function extractCommodities(text) {
  if (!text || typeof text !== 'string') return [];
  const lower = text.toLowerCase();

  const dict = [
    { canonical: 'Soybean', aliases: ['soybean', 'soya', 'सोयाबीन'] },
    { canonical: 'Wheat', aliases: ['wheat', 'गहू', 'गव्हा', 'गेहूं'] },
    { canonical: 'Rice', aliases: ['rice', 'paddy', 'तांदूळ', 'तांदळा', 'चावल', 'धान'] },
    { canonical: 'MaizeW', aliases: ['maizew'] },
    { canonical: 'Maize', aliases: ['maize', 'corn', 'मका', 'मक्या', 'मक्का'] },
    { canonical: 'Cotton', aliases: ['cotton', 'कापूस', 'कापसा', 'कपास'] },
    { canonical: 'Chana', aliases: ['chana', 'gram', 'चना', 'हरभरा', 'हरभऱ्या'] },
    { canonical: 'Tur', aliases: ['tur', 'arhar', 'तूर', 'तुरी', 'अरहर'] },
    { canonical: 'Mustard', aliases: ['mustard', 'मोहरी', 'सरसों'] },
    { canonical: 'Bajra', aliases: ['bajra', 'pearl millet', 'बाजरी', 'बाजरा'] },
    { canonical: 'Jowar', aliases: ['jowar', 'sorghum', 'ज्वारी', 'ज्वार'] },
  ];

  const matches = [];
  dict.forEach(({ canonical, aliases }) => {
    let earliest = -1;
    aliases.forEach((alias) => {
      const pos = lower.indexOf(alias);
      if (pos !== -1) {
        if (earliest === -1 || pos < earliest) {
          earliest = pos;
        }
      }
    });
    if (earliest !== -1) {
      matches.push({ canonical, index: earliest });
    }
  });

  // Sort by appearance index in the question to preserve exact query order
  matches.sort((a, b) => a.index - b.index);

  const seen = new Set();
  const result = [];
  matches.forEach((m) => {
    const key = m.canonical.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(m.canonical);
    }
  });

  return result;
}

/**
 * Translates canonical commodity name for display in buttons, cards, and tables.
 */
function formatCommodityName(raw, lang) {
  if (!raw) return '';
  const canon = getCanonicalCommodity(raw);
  if (canon === 'Soybean') return lang === 'hi' || lang === 'mr' ? 'सोयाबीन' : 'Soybean';
  if (canon === 'Wheat') return lang === 'hi' ? 'गेहूं' : lang === 'mr' ? 'गहू' : 'Wheat';
  if (canon === 'Rice') return lang === 'hi' ? 'चावल' : lang === 'mr' ? 'तांदूळ' : 'Rice';
  if (canon === 'Cotton') return lang === 'hi' ? 'कपास' : lang === 'mr' ? 'कापूस' : 'Cotton';
  if (canon === 'MaizeW') return lang === 'hi' ? 'मक्काW' : lang === 'mr' ? 'MaizeW' : 'MaizeW';
  if (canon === 'Maize') return lang === 'hi' ? 'मक्का' : lang === 'mr' ? 'मका' : 'Maize';
  if (canon === 'Chana') return lang === 'hi' ? 'चना' : lang === 'mr' ? 'हरभरा' : 'Chana';
  if (canon === 'Tur') return lang === 'hi' ? 'अरहर' : lang === 'mr' ? 'तूर' : 'Tur';
  if (canon === 'Mustard') return lang === 'hi' ? 'सरसों' : lang === 'mr' ? 'मोहरी' : 'Mustard';
  if (canon === 'Bajra') return lang === 'hi' ? 'बाजरा' : lang === 'mr' ? 'बाजरी' : 'Bajra';
  if (canon === 'Jowar') return lang === 'hi' ? 'ज्वार' : lang === 'mr' ? 'ज्वारी' : 'Jowar';
  return raw;
}

/**
 * Translates status display for buyer demand table.
 */
function formatStatusDisplay(status, lang) {
  if (!status) return '-';
  const s = String(status).trim().toLowerCase();
  if (s === 'active' || s === 'open') {
    return lang === 'hi' ? 'सक्रिय' : lang === 'mr' ? 'सक्रिय' : 'Active';
  }
  if (s === 'pending') {
    return lang === 'hi' ? 'लंबित' : lang === 'mr' ? 'प्रलंबित' : 'Pending';
  }
  if (s === 'completed' || s === 'fulfilled') {
    return lang === 'hi' ? 'पूर्ण' : lang === 'mr' ? 'पूर्ण' : 'Completed';
  }
  return status;
}

/**
 * Localization strings for Buyer Demand UI.
 */
const DEMAND_I18N = {
  en: {
    selectorPrompt: 'Select commodity to view buyer demand:',
    recordsBadge: (count) => `Demand Records: ${count}`,
    buyersBadge: (count) => `Distinct Buyers: ${count}`,
    totalQtyBadge: (qty, unit) => `Total Quantity: ${qty} ${unit}`,
    buyerCol: 'Buyer',
    commodityCol: 'Commodity',
    quantityCol: 'Quantity',
    targetRateCol: 'Target Price',
    locationCol: 'Location',
    dateCol: 'Required Date',
    statusCol: 'Status',
    noRecords: 'No demand records found for this commodity.',
    unavailable: 'Unavailable',
  },
  hi: {
    selectorPrompt: 'खरीदार मांग देखने के लिए कमोडिटी चुनें:',
    recordsBadge: (count) => `मांग रिकॉर्ड: ${count}`,
    buyersBadge: (count) => `विशिष्ट खरीदार: ${count}`,
    totalQtyBadge: (qty, unit) => `कुल मात्रा: ${qty} ${unit}`,
    buyerCol: 'खरीदार',
    commodityCol: 'कमोडिटी',
    quantityCol: 'मात्रा',
    targetRateCol: 'लक्षित दर',
    locationCol: 'स्थान',
    dateCol: 'आवश्यक तिथि',
    statusCol: 'स्थिति',
    noRecords: 'इस कमोडिटी के लिए कोई मांग रिकॉर्ड नहीं मिला।',
    unavailable: 'अनुपलब्ध',
  },
  mr: {
    selectorPrompt: 'खरेदीदार मागणी पाहण्यासाठी शेतमाल निवडा:',
    recordsBadge: (count) => `मागणी नोंदी: ${count}`,
    buyersBadge: (count) => `एकूण खरेदीदार: ${count}`,
    totalQtyBadge: (qty, unit) => `एकूण प्रमाण: ${qty} ${unit}`,
    buyerCol: 'खरेदीदार',
    commodityCol: 'शेतमाल',
    quantityCol: 'प्रमाण',
    targetRateCol: 'अपेक्षित दर',
    locationCol: 'ठिकाण',
    dateCol: 'आवश्यक तारीख',
    statusCol: 'स्थिती',
    noRecords: 'या शेतमालासाठी कोणतीही मागणी नोंद आढळली नाही.',
    unavailable: 'उपलब्ध नाही',
  },
};

/**
 * Checks if message represents a buyer demand query.
 */
function isBuyerDemandQuery(question, content, displayType, commodities, buyerDemands) {
  if (displayType === 'ORDERS') return false;
  if (displayType === 'DEMAND_EXPLORER') return false;
  if (displayType === 'SUPPLIES' || displayType === 'SUPPLY') return false;
  if (displayType === 'BIDS' || displayType === 'NEGOTIATION' || displayType === 'BID') return false;
  if (displayType === 'DEALS' || displayType === 'CONTRACTS' || displayType === 'DEAL' || displayType === 'CONTRACT') return false;
  if (displayType === 'WHATSAPP' || displayType === 'NOTIFICATION' || displayType === 'DIAGNOSTICS') return false;
  if (displayType === 'DEMAND') return true;
  if (Array.isArray(buyerDemands) && buyerDemands.length > 0) return true;
  const qLower = (question || '').toLowerCase();
  const cLower = (content || '').toLowerCase();
  const combined = `${qLower} ${cLower}`;

  const hasDemandKeyword =
    combined.includes('demand') ||
    combined.includes('buyer') ||
    combined.includes('मागणी') ||
    combined.includes('मांग') ||
    combined.includes('खरीदार') ||
    combined.includes('खरेदीदार');

  const isRateOnly =
    (combined.includes('rate') || combined.includes('दर') || combined.includes('भाव') || combined.includes('price')) &&
    !hasDemandKeyword;

  return hasDemandKeyword && !isRateOnly;
}

/**
 * Checks if content indicates marketplace demand API error.
 */
function isBuyerDemandApiError(content) {
  if (!content || typeof content !== 'string') return false;
  const lower = content.toLowerCase();
  return (
    isAiCommunicationError(content) ||
    lower.includes('marketplace service is currently unavailable') ||
    lower.includes('मार्केटप्लेस सेवा वर्तमान में अनुपलब्ध है') ||
    lower.includes('मार्केटप्लेस सेवा सध्या अनुपलब्ध आहे')
  );
}

/**
 * Checks if content contains an outdated contradiction claiming placed orders or the orders API are unavailable.
 */
function isOutdatedOrdersUnavailableMessage(content) {
  if (!content || typeof content !== 'string') return false;
  const lower = content.toLowerCase();
  return (
    (lower.includes('placed order') && lower.includes('unavailable')) ||
    (lower.includes('placed order') && lower.includes('not currently tracked')) ||
    lower.includes('does not currently expose an orders api') ||
    lower.includes('would need to provide an orders api') ||
    lower.includes('ऑर्डर्स api किंवा ऑर्डर्स डेटाबेस स्रोत उपलब्ध नाही') ||
    lower.includes('कोई orders api या ऑर्डर्स डेटाबेस स्रोत उपलब्ध नहीं')
  );
}

/**
 * Parses demand records from markdown table in content as fallback.
 */
function parseDemandRecordsFromText(text) {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split('\n');
  let buyerCol = -1;
  let commCol = -1;
  let qtyCol = -1;
  let locCol = -1;
  let dateCol = -1;
  let statusCol = -1;

  const records = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.includes('|')) continue;

    const cells = line.split('|').map((c) => c.trim().replace(/\*\*/g, ''));
    if (line.startsWith('|')) cells.shift();
    if (line.endsWith('|')) cells.pop();

    if (cells.length > 0 && cells.every((c) => /^:?-+:?$/.test(c.trim()))) continue;

    const lowerCells = cells.map((c) => c.toLowerCase());
    if (
      lowerCells.some(
        (c) =>
          c.includes('buyer') ||
          c.includes('खरीदार') ||
          c.includes('खरेदीदार') ||
          c.includes('commodity') ||
          c.includes('शेतमाल')
      )
    ) {
      for (let idx = 0; idx < cells.length; idx++) {
        const cl = cells[idx].toLowerCase();
        if (cl.includes('buyer') || cl.includes('खरीदार') || cl.includes('खरेदीदार')) buyerCol = idx;
        else if (cl.includes('commodity') || cl.includes('शेतमाल') || cl.includes('कमोडिटी')) commCol = idx;
        else if (cl.includes('quantity') || cl.includes('मात्रा') || cl.includes('प्रमाण') || cl.includes('qty')) qtyCol = idx;
        else if (cl.includes('location') || cl.includes('स्थान') || cl.includes('ठिकाण')) locCol = idx;
        else if (cl.includes('date') || cl.includes('तारीख') || cl.includes('तिथि')) dateCol = idx;
        else if (cl.includes('status') || cl.includes('स्थिती') || cl.includes('स्थिति')) statusCol = idx;
      }
      continue;
    }

    if (qtyCol !== -1 && cells.length > qtyCol) {
      const buyer = buyerCol !== -1 ? cells[buyerCol] : '';
      const commodity = commCol !== -1 ? cells[commCol] : '';
      const rawQty = cells[qtyCol] || '';
      const loc = locCol !== -1 ? cells[locCol] : '';
      const date = dateCol !== -1 ? cells[dateCol] : '';
      const status = statusCol !== -1 ? cells[statusCol] : '';

      const qtyMatch = rawQty.match(/^([\d,]+(?:\.\d+)?)\s*(.*)$/);
      let qtyNum = 0;
      let unitStr = '';
      if (qtyMatch) {
        qtyNum = parseFloat(qtyMatch[1].replace(/,/g, ''));
        unitStr = qtyMatch[2].trim();
      }

      if (buyer || commodity || qtyNum > 0) {
        records.push({
          buyerName: buyer,
          commodityName: commodity,
          quantity: qtyNum,
          unit: unitStr,
          location: loc,
          requiredDate: date,
          status: status,
        });
      }
    }
  }
  return records;
}

/**
 * Extracts single market rate fields from response text or chartData for current rate queries.
 */
function extractSingleRateInfo(text, chartData = [], userQuestion = '') {
  const qLower = (userQuestion || '').toLowerCase();
  if (
    (qLower.includes('demand') || qLower.includes('मागणी') || qLower.includes('मांग') || qLower.includes('buyer') || qLower.includes('खरीदार') || qLower.includes('खरेदीदार')) &&
    !qLower.includes('rate') &&
    !qLower.includes('price') &&
    !qLower.includes('दर') &&
    !qLower.includes('भाव')
  ) {
    return null;
  }

  // 1. If structured chartData has exactly 1 record, use it as source of truth
  if (Array.isArray(chartData) && chartData.length === 1 && chartData[0]) {
    const cd = chartData[0];
    const rNum = typeof cd.rate === 'number' ? cd.rate : parseFloat(String(cd.rate).replace(/,/g, ''));
    if (!isNaN(rNum) && rNum > 0) {
      return {
        commodity: cd.commodity || extractCommodityFromText(userQuestion) || '',
        rate: rNum.toLocaleString('en-IN'),
        unit: cd.unit || 'Quintal',
        location: cd.location || extractLocationFromText(userQuestion) || '',
        date: normalizeDate(cd.date) || cd.date || null,
      };
    }
  }

  // 2. If chartData has >= 2 records, it's historical; don't treat as single rate
  if (Array.isArray(chartData) && chartData.length >= 2) {
    return null;
  }

  if (!text || typeof text !== 'string') return null;

  // If text contains multiple table rows with dates, don't treat as single rate
  const dateMatches = text.match(/\b\d{4}-\d{2}-\d{2}\b/g);
  if (dateMatches && dateMatches.length >= 2) {
    return null;
  }

  const data = {};
  const combinedText = `${userQuestion || ''}\n${text}`;

  // Commodity extraction
  const commKeyMatch = text.match(/(?:Commodity(?:\s*Name)?|Pik|पीक|फसल)[:\s]+([^\n\r,.]+)/i);
  if (commKeyMatch) {
    data.commodity = commKeyMatch[1].trim();
  } else {
    data.commodity = extractCommodityFromText(combinedText);
  }

  // Rate extraction with Devanagari numerals support
  const asciiText = toAsciiDigits(text);
  const rateMatch =
    asciiText.match(/(?:Rate|Price|Dar|Bhav|दर|भाव)[:\s]+(?:INR|Rs\.?|₹)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/i) ||
    asciiText.match(/(?:INR|Rs\.?|₹)\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/i) ||
    asciiText.match(/\b([0-9]{4,6}(?:\.[0-9]+)?)\s*(?:INR|Rs\.?|₹|\/|प्रति|per)/i);

  if (rateMatch) {
    const rawVal = parseFloat(rateMatch[1].replace(/,/g, ''));
    if (!isNaN(rawVal) && rawVal > 10) {
      data.rate = rawVal.toLocaleString('en-IN');
    }
  }

  // Unit extraction
  const unitMatch =
    text.match(/(?:Unit|Per|Prati|एकक|प्रति)[:\s]+([^\n\r,.)]+)/i) ||
    text.match(/(?:per|\/|प्रति)\s*(Quintal|MT|Kg|Bori|Bag|Ton|unit|क्विंटल|टन|किलो)/i);
  if (unitMatch) {
    data.unit = unitMatch[1].trim();
  } else {
    data.unit = 'Quintal';
  }

  // Location extraction
  const locNamed = extractLocationFromText(combinedText);
  if (locNamed) {
    data.location = locNamed;
  } else {
    const locKeyMatch = text.match(/(?:Location|Market|APMC|स्थान|ठिकाण):\s*([^\n\r,.]+)/i);
    if (locKeyMatch) {
      data.location = locKeyMatch[1].trim();
    }
  }

  // Date extraction
  const dateMatch =
    text.match(/(?:Date|Tarikh|दिनांक|तारीख|As of)[:\s]*([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{2}[-/][0-9]{2}[-/][0-9]{4})/i) ||
    text.match(/\b([0-9]{4}-[0-9]{2}-[0-9]{2})\b/);
  if (dateMatch) {
    data.date = normalizeDate(dateMatch[1] || dateMatch[0]);
  }

  if (data.rate) {
    if (!data.commodity) data.commodity = extractCommodityFromText(userQuestion) || '';
    if (!data.location) data.location = extractLocationFromText(userQuestion) || '';
    return data;
  }

  return null;
}

/**
 * Renders inline Markdown elements: bold (**text**), italic (*text*), inline code (`code`).
 */
function renderInlineFormatting(text) {
  if (!text || typeof text !== 'string') return text;

  const tokens = [];
  const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;
  let keyIdx = 0;

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      tokens.push(
        <code key={`code-${keyIdx++}`} className="chat-inline-code">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push(
        <strong key={`b-${keyIdx++}`} className="chat-strong">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      tokens.push(
        <em key={`i-${keyIdx++}`} className="chat-em">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = inlineRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.substring(lastIndex));
  }

  return tokens.length > 0 ? tokens : text;
}

/**
 * Pure-React Markdown parser: parses headings, bold, lists, code blocks, and tables.
 */
function renderMarkdown(content) {
  if (!content || typeof content !== 'string') return null;

  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalizedContent.split('\n');
  const elements = [];
  let i = 0;
  let keyCounter = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code blocks: ``` or ```lang
    if (trimmed.startsWith('```')) {
      const codeLines = [];
      const langMatch = trimmed.match(/^```([a-zA-Z0-9_-]*)/);
      const language = langMatch ? langMatch[1] : '';
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      elements.push(
        <div key={`code-block-${keyCounter++}`} className="chat-code-block-wrapper">
          {language && <div className="chat-code-lang-label">{language}</div>}
          <pre className="chat-code-block">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      continue;
    }

    // 2. Markdown Tables: lines with '|'
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 1) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        // First line is header
        const headerCells = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim().replace(/\*\*/g, ''));

        // Skip divider if line 1 is |---|---|
        let startBodyIdx = 1;
        if (
          tableLines.length > 1 &&
          tableLines[1].replace(/[:|\-\s]/g, '').length === 0
        ) {
          startBodyIdx = 2;
        }

        const bodyRows = [];
        for (let rIdx = startBodyIdx; rIdx < tableLines.length; rIdx++) {
          if (tableLines[rIdx].replace(/[:|\-\s]/g, '').length === 0) continue;
          const cells = tableLines[rIdx]
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());
          bodyRows.push(cells);
        }

        elements.push(
          <div key={`table-${keyCounter++}`} className="table-responsive chat-table-wrap">
            <table className="chat-rendered-table">
              <thead>
                <tr>
                  {headerCells.map((h, hIdx) => (
                    <th key={hIdx}>{renderInlineFormatting(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx}>{renderInlineFormatting(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 3. Headings: #, ##, ###
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h5 key={`h5-${keyCounter++}`} className="chat-heading-3">
          {renderInlineFormatting(trimmed.substring(4))}
        </h5>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h4 key={`h4-${keyCounter++}`} className="chat-heading-2">
          {renderInlineFormatting(trimmed.substring(3))}
        </h4>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h3 key={`h3-${keyCounter++}`} className="chat-heading-1">
          {renderInlineFormatting(trimmed.substring(2))}
        </h3>
      );
      i++;
      continue;
    }

    // 4. Blockquotes: >
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={`bq-${keyCounter++}`} className="chat-blockquote">
          {renderInlineFormatting(trimmed.substring(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    // 5. Bullet Lists: lines starting with "- " or "* "
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listItems = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))
      ) {
        listItems.push(lines[i].trim().substring(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${keyCounter++}`} className="chat-bullet-list">
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInlineFormatting(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // 6. Ordered Lists: lines starting with "1. ", "2. ", etc.
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s+/, '');
        listItems.push(itemText);
        i++;
      }
      elements.push(
        <ol key={`ol-${keyCounter++}`} className="chat-ordered-list">
          {listItems.map((item, idx) => (
            <li key={idx}>{renderInlineFormatting(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // 7. Empty line: skip
    if (trimmed.length === 0) {
      i++;
      continue;
    }

    // 8. Normal Paragraph: collect consecutive non-empty lines that aren't special blocks
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim().length > 0 &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('|') &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('> ') &&
      !lines[i].trim().startsWith('- ') &&
      !lines[i].trim().startsWith('* ') &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }

    if (paraLines.length > 0) {
      elements.push(
        <p key={`p-${keyCounter++}`} className="message-paragraph">
          {paraLines.map((pLine, plIdx) => (
            <React.Fragment key={plIdx}>
              {renderInlineFormatting(pLine)}
              {plIdx < paraLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );
    }
  }

  return elements;
}

/**
 * Normalizes language to 'en' | 'hi' | 'mr'.
 * Checks explicit language property first, then detects Devanagari script markers.
 */
function normalizeLangCode(lang, question = '', content = '') {
  if (lang) {
    const l = String(lang).toLowerCase().trim();
    if (l === 'hi' || l === 'hindi' || l.startsWith('hi-')) return 'hi';
    if (l === 'mr' || l === 'marathi' || l.startsWith('mr-')) return 'mr';
    if (l === 'en' || l === 'english' || l.startsWith('en-')) return 'en';
  }
  const combined = `${question} ${content}`;
  if (/[\u0900-\u097F]/.test(combined)) {
    if (/[ळॲॅ]/.test(combined) || /\b(आहे|आहेत|नाही|काय|किती|सांगा|दाखवा|दिवसांचा|मागणी)\b/.test(combined)) {
      return 'mr';
    }
    if (/\b(है|हैं|था|थी|क्या|कितना|बताओ|बताइए|दिखाएं|दिखाइए|दिनों|मांग|पिछले)\b/.test(combined)) {
      return 'hi';
    }
    return 'hi';
  }
  return 'en';
}

/**
 * Checks whether the text represents an AI communication or generation error.
 */
function isAiCommunicationError(text) {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase();
  return (
    lower.includes('an error occurred while communicating with the ai service') ||
    lower.includes('failed to generate content') ||
    lower.includes('error communicating with gemini') ||
    lower.includes('gemini ai model is not configured') ||
    lower.includes('clientexception') ||
    lower.includes('quota exceeded') ||
    lower.includes('resource_exhausted') ||
    lower.includes('429')
  );
}

/**
 * Generates an authoritative, natural localized summary from the actual historical records.
 * Never fabricates or invents market data; strictly preserves retrieved rates, dates, and locations.
 */
function generateLocalizedRateSummary(records, lang) {
  if (!records || records.length === 0) return '';
  const first = records[0];
  const last = records[records.length - 1];
  const rates = records.map((r) => r.rate).filter((r) => !isNaN(r) && r > 0);
  const minRate = rates.length > 0 ? Math.min(...rates) : null;
  const maxRate = rates.length > 0 ? Math.max(...rates) : null;
  const rawComm = last.commodity || first.commodity || '';
  const rawLoc = last.location || first.location || '';
  const unit = last.unit || first.unit || 'Quintal';

  const commText = formatCommodityName(rawComm, lang) || rawComm;
  const locText = formatLocationDisplay(rawLoc, lang) || rawLoc;

  if (lang === 'hi') {
    const locPhrase = locText ? `${locText} मंडी में ` : '';
    const rangePhrase =
      minRate !== null && maxRate !== null
        ? ` इस अवधि के दौरान न्यूनतम भाव ₹${minRate.toLocaleString('en-IN')} तथा उच्चतम भाव ₹${maxRate.toLocaleString('en-IN')} प्रति ${unit} दर्ज किया गया।`
        : '';
    return `${locPhrase}${commText} के पिछले ${records.length} दिनों के वास्तविक बाजार भाव सफलतापूर्वक प्राप्त कर लिए गए हैं। नवीनतम भाव ₹${last.rate.toLocaleString('en-IN')} प्रति ${unit} (दिनांक: ${last.date}) है।${rangePhrase} विस्तृत मूल्य रुझान देखने के लिए ऊपर दिए गए 'चार्ट' विकल्प का चयन करें।`;
  }

  if (lang === 'mr') {
    const locPhrase = locText ? `${locText} बाजारपेठेत ` : '';
    const rangePhrase =
      minRate !== null && maxRate !== null
        ? ` या कालावधीत किमान दर ₹${minRate.toLocaleString('en-IN')} आणि कमाल दर ₹${maxRate.toLocaleString('en-IN')} प्रति ${unit} नोंदवला गेला.`
        : '';
    return `${locPhrase}${commText}चे मागील ${records.length} दिवसांचे प्रत्यक्ष बाजार भाव यशस्वीरित्या उपलब्ध झाले आहेत. नवीनतम दर ₹${last.rate.toLocaleString('en-IN')} प्रति ${unit} (तारीख: ${last.date}) आहे.${rangePhrase} किमतीचा कल पाहण्यासाठी वरील 'चार्ट' पर्यायावर क्लिक करा.`;
  }

  // English fallback
  const locPhrase = locText ? ` in ${locText}` : '';
  const rangePhrase =
    minRate !== null && maxRate !== null
      ? ` During this period, the lowest recorded rate was ₹${minRate.toLocaleString('en-IN')} and the highest was ₹${maxRate.toLocaleString('en-IN')} per ${unit}.`
      : '';
  return `Successfully retrieved ${records.length} authoritative market rate records for ${commText}${locPhrase}. The latest recorded rate is ₹${last.rate.toLocaleString('en-IN')} per ${unit} (as of ${last.date}).${rangePhrase} Select the 'Chart' view above to visualize the price trend over time.`;
}

export default function ChatMessage({ message, onSendMessage, displayLanguage }) {
  const isUser = message.role === 'user';

  // Parse all historical records from response
  const historicalRecords = useMemo(() => {
    return parseAllHistoricalRateRecords(message.content, message.chartData, message.userQuestion);
  }, [message.content, message.chartData, message.userQuestion]);

  const lang = useMemo(() => {
    if (displayLanguage) return displayLanguage;
    return normalizeLangCode(message.language, message.userQuestion, message.content);
  }, [displayLanguage, message.language, message.userQuestion, message.content]);

  const chartCommodity = useMemo(() => {
    return (
      historicalRecords.find((r) => r.commodity)?.commodity ||
      (message.commodities && message.commodities[0]) ||
      extractCommodityFromText(message.userQuestion || message.content) ||
      ''
    );
  }, [historicalRecords, message.commodities, message.userQuestion, message.content]);

  const chartTitle = useMemo(() => {
    const comm = chartCommodity;
    const loc =
      historicalRecords.find((r) => r.location)?.location ||
      extractLocationFromText(message.userQuestion || message.content) ||
      '';
    if (lang === 'hi') {
      const commDisplay = formatCommodityName(comm, 'hi') || comm;
      const locDisplay = formatLocationDisplay(loc, 'hi') || loc;
      if (commDisplay && locDisplay) return `${commDisplay} मूल्य रुझान – ${locDisplay}`;
      if (commDisplay) return `${commDisplay} मूल्य रुझान`;
      return 'कमोडिटी मूल्य रुझान';
    }
    if (lang === 'mr') {
      const commDisplay = formatCommodityName(comm, 'mr') || comm;
      const locDisplay = formatLocationDisplay(loc, 'mr') || loc;
      if (commDisplay && locDisplay) return `${commDisplay} किमतीचा कल – ${locDisplay}`;
      if (commDisplay) return `${commDisplay} किमतीचा कल`;
      return 'कमोडिटी किमतीचा कल';
    }
    if (comm && loc) return `${comm} Price Trend - ${loc}`;
    if (comm) return `${comm} Price Trend`;
    return 'Commodity Price Trend';
  }, [chartCommodity, historicalRecords, lang, message.userQuestion, message.content]);

  const chartUnit = useMemo(() => {
    return historicalRecords.find((r) => r.unit)?.unit || 'Quintal';
  }, [historicalRecords]);

  // Determine if this is a historical rate query
  const isHistorical = isHistoricalRateQuery(message.userQuestion, message);

  // Single rate extraction for current rate queries
  const singleRateInfo = useMemo(() => {
    return extractSingleRateInfo(message.content, message.chartData, message.userQuestion);
  }, [message.content, message.chartData, message.userQuestion]);

  // Orders query detection
  const isOrders = useMemo(() => {
    return isOrdersQuery(
      message.userQuestion,
      message.content,
      message.displayType,
      message.orders
    );
  }, [message.userQuestion, message.content, message.displayType, message.orders]);

  // Parties query detection
  const isParties = useMemo(() => {
    return isPartiesQuery(
      message.userQuestion,
      message.content,
      message.displayType,
      message.parties
    );
  }, [message.userQuestion, message.content, message.displayType, message.parties]);

  // Party count (2 KPI cards + 4 action cards) query detection
  const isPartyCount = useMemo(() => {
    return isPartyCountQuery(
      message.userQuestion,
      message.content,
      message.displayType
    );
  }, [message.userQuestion, message.content, message.displayType]);

  // Supplies and inventory query detection (Step 3)
  const isSupply = useMemo(() => {
    return isSupplyQuery(message.userQuestion, message.content, message.displayType);
  }, [message.userQuestion, message.content, message.displayType]);

  // Advanced buyer demand explorer query detection (Step 4)
  const isDemandExplorer = useMemo(() => {
    return isDemandExplorerQuery(message.userQuestion, message.content, message.displayType);
  }, [message.userQuestion, message.content, message.displayType]);

  // Bids & negotiations query detection (Step 5)
  const isBid = useMemo(() => {
    return isBidQuery(message.userQuestion, message.content, message.displayType);
  }, [message.userQuestion, message.content, message.displayType]);

  // Deals & contracts query detection (Step 6)
  const isDeal = useMemo(() => {
    return isDealQuery(message.userQuestion, message.content, message.displayType);
  }, [message.userQuestion, message.content, message.displayType]);

  // WhatsApp & notifications diagnostics query detection (Step 7)
  const isWhatsApp = useMemo(() => {
    return isWhatsAppDiagnosticsQuery(message.userQuestion, message.content, message.displayType);
  }, [message.userQuestion, message.content, message.displayType]);

  // Cleaned content to avoid duplicate raw table if structured records table is rendered,
  // and provide localized summary if AI service communication failed
  const cleanedContent = useMemo(() => {
    if (message.displayType === 'ORDERS' || isOrders) {
      if (!message.content) return '';
      // When the API request has succeeded (matching orders are returned),
      // suppress any outdated fallback message claiming orders are unavailable
      const hasSucceededOrders = Array.isArray(message.orders) && message.orders.length > 0;
      if (hasSucceededOrders && isOutdatedOrdersUnavailableMessage(message.content)) {
        return '';
      }
      const lines = message.content.split('\n');
      const filtered = lines.filter((line) => {
        const trimmed = line.trim();
        return !(trimmed.startsWith('|') && trimmed.endsWith('|'));
      });
      return filtered.join('\n').trim();
    }

    if (message.displayType === 'PARTIES' || isParties) {
      if (!message.content) return '';
      // When displaying PartyExplorer data table, strip raw markdown table rows to prevent duplicate table
      if (!isPartyCount) {
        const lines = message.content.split('\n');
        const filtered = lines.filter((line) => {
          const trimmed = line.trim();
          return !(trimmed.startsWith('|') && trimmed.endsWith('|'));
        });
        return filtered.join('\n').trim();
      }
      return message.content;
    }

    if (isSupply || isDemandExplorer || isBid || isDeal || isWhatsApp) {
      if (!message.content) return '';
      const lines = message.content.split('\n');
      const filtered = lines.filter((line) => {
        const trimmed = line.trim();
        return !(trimmed.startsWith('|') && trimmed.endsWith('|'));
      });
      return filtered.join('\n').trim();
    }

    if (!message.content) {
      if (historicalRecords.length > 0) {
        return generateLocalizedRateSummary(historicalRecords, lang);
      }
      if (singleRateInfo) {
        return generateLocalizedSingleRateSummary(singleRateInfo, lang);
      }
      return '';
    }

    if (isAiCommunicationError(message.content)) {
      if (historicalRecords.length > 0) {
        return generateLocalizedRateSummary(historicalRecords, lang);
      }
      if (singleRateInfo) {
        return generateLocalizedSingleRateSummary(singleRateInfo, lang);
      }
      if (lang === 'hi') {
        return 'क्षमा करें, AI सेवा के साथ संचार करने में अस्थायी समस्या आई। कृपया थोड़ी देर बाद पुनः प्रयास करें।';
      }
      if (lang === 'mr') {
        return 'क्षमस्व, AI सेवेशी संवाद साधताना तात्पुरती अडचण आली. कृपया काही वेळाने पुन्हा प्रयत्न करा.';
      }
      return 'The AI service encountered a temporary communication issue. Please try again in a moment.';
    }

    if (historicalRecords.length > 0) {
      // Strip markdown table rows so we don't display duplicate tables in Rate view
      const lines = message.content.split('\n');
      const filtered = lines.filter((line) => {
        const trimmed = line.trim();
        return !(trimmed.startsWith('|') && trimmed.endsWith('|'));
      });
      const remaining = filtered.join('\n').trim();
      return remaining || generateLocalizedRateSummary(historicalRecords, lang);
    }
    return message.content;
  }, [
    message.content,
    message.displayType,
    message.orders,
    isOrders,
    isParties,
    isPartyCount,
    isSupply,
    isDemandExplorer,
    isBid,
    isDeal,
    isWhatsApp,
    historicalRecords,
    singleRateInfo,
    lang,
  ]);

  // Selected view option: 'rate' or 'chart' (relevant only when historical records exist)
  const hasHistoricalRecords = historicalRecords.length >= 2;
  const initialOption =
    message.displayType === 'CHART' && hasHistoricalRecords ? 'chart' : 'rate';
  const [selectedOption, setSelectedOption] = useState(initialOption);

  // Buyer demand query detection
  const isDemand = useMemo(() => {
    return isBuyerDemandQuery(
      message.userQuestion,
      message.content,
      message.displayType,
      message.commodities,
      message.buyerDemands
    );
  }, [message.userQuestion, message.content, message.displayType, message.commodities, message.buyerDemands]);

  // Extract / resolve dynamic commodities for Buyer Demand
  const demandCommodities = useMemo(() => {
    if (Array.isArray(message.commodities) && message.commodities.length > 0) {
      const seen = new Set();
      const list = [];
      message.commodities.forEach((c) => {
        if (c && typeof c === 'string' && c.trim()) {
          const canon = getCanonicalCommodity(c.trim());
          if (!seen.has(canon.toLowerCase())) {
            seen.add(canon.toLowerCase());
            list.push(canon);
          }
        }
      });
      if (list.length > 0) return list;
    }
    return extractCommodities(message.userQuestion || message.content || '');
  }, [message.commodities, message.userQuestion, message.content]);

  // Selected demand commodity state
  const [selectedDemandCommodity, setSelectedDemandCommodity] = useState(
    demandCommodities.length > 0 ? demandCommodities[0] : null
  );

  const activeDemandCommodity =
    selectedDemandCommodity && demandCommodities.includes(selectedDemandCommodity)
      ? selectedDemandCommodity
      : (demandCommodities[0] || null);

  // Retrieve all demand records (structured DTOs or markdown parsed)
  const allBuyerDemands = useMemo(() => {
    if (Array.isArray(message.buyerDemands) && message.buyerDemands.length > 0) {
      return message.buyerDemands;
    }
    return parseDemandRecordsFromText(message.content);
  }, [message.buyerDemands, message.content]);

  // Filter records specifically for active demand commodity
  const activeDemandRecords = useMemo(() => {
    if (!activeDemandCommodity) return allBuyerDemands;
    const targetCanonical = getCanonicalCommodity(activeDemandCommodity).toLowerCase();
    return allBuyerDemands.filter((d) => {
      const comm = d.commodityName || d.commodity;
      if (!comm) return false;
      return getCanonicalCommodity(comm).toLowerCase() === targetCanonical;
    });
  }, [allBuyerDemands, activeDemandCommodity]);

  // Distinct buyers calculation: Count distinct non-blank, non-generic buyer names
  const distinctBuyersCount = useMemo(() => {
    const names = new Set();
    activeDemandRecords.forEach((r) => {
      const raw = (r.buyerName || r.buyer || '').trim();
      if (
        raw &&
        raw.toLowerCase() !== 'unavailable' &&
        raw.toLowerCase() !== 'unknown' &&
        raw.toLowerCase() !== 'अनुपलब्ध' &&
        raw.toLowerCase() !== 'उपलब्ध नाही' &&
        raw !== '-'
      ) {
        names.add(raw.toLowerCase());
      }
    });
    return names.size;
  }, [activeDemandRecords]);

  // Total requested quantity aggregation: ONLY if quantities and units are consistent
  // Do NOT combine quantities with different units
  const totalDemandQuantityInfo = useMemo(() => {
    if (!activeDemandRecords || activeDemandRecords.length === 0) return null;
    let commonUnit = null;
    let total = 0;
    for (const d of activeDemandRecords) {
      if (d.quantity === undefined || d.quantity === null) return null;
      const num = parseFloat(String(d.quantity).replace(/,/g, ''));
      if (isNaN(num) || num <= 0) return null;
      const unit = (d.unit || '').trim();
      if (!unit) return null;

      if (commonUnit === null) {
        commonUnit = unit;
      } else if (commonUnit.toLowerCase() !== unit.toLowerCase()) {
        // Mixed units detected! Do not combine mismatched units.
        return null;
      }
      total += num;
    }
    const formattedTotal = total % 1 === 0 ? total.toLocaleString('en-IN') : total.toFixed(2);
    return {
      total: formattedTotal,
      unit: commonUnit,
    };
  }, [activeDemandRecords]);

  const isDemandApiError = useMemo(() => {
    return isBuyerDemandApiError(message.content);
  }, [message.content]);

  // Cleaned demand content to avoid duplicate raw table if structured UI is rendered
  const cleanedDemandContent = useMemo(() => {
    if (!message.content) return '';
    if (isAiCommunicationError(message.content) || isBuyerDemandApiError(message.content)) return '';
    const lines = message.content.split('\n');
    const filtered = lines.filter((line) => {
      const trimmed = line.trim();
      return !(trimmed.startsWith('|') && trimmed.endsWith('|'));
    });
    return filtered.join('\n').trim();
  }, [message.content]);

  const displayedUserContent = useMemo(() => {
    if (displayLanguage) {
      return translateQuestion(message.content, displayLanguage);
    }
    return message.content;
  }, [message.content, displayLanguage]);

  if (isUser) {
    return (
      <div className="chat-bubble-container user-message">
        <div className="message-avatar">
          <span className="user-initials">AD</span>
        </div>
        <div className="message-body">
          <div className="message-header">
            <span className="message-sender-name">Admin</span>
            <span className="message-timestamp">
              {message.timestamp
                ? new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''}
            </span>
          </div>
          <div className="message-content">
            <p className="message-paragraph">{displayedUserContent}</p>
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message
  // Chart data points formatted for TrendChart component
  const chartPoints = historicalRecords.map((r) => ({
    date: r.date,
    rate: r.rate,
    commodity: r.commodity || chartCommodity,
    location: r.location,
    unit: r.unit,
  }));

  const formattedRate = singleRateInfo?.rate
    ? (typeof singleRateInfo.rate === 'number'
        ? singleRateInfo.rate.toLocaleString('en-IN')
        : singleRateInfo.rate)
    : '';

  return (
    <div className="chat-bubble-container assistant-message">
      <div className="message-avatar">
        <span className="bot-avatar-icon">
          <SparklesIcon size={16} />
        </span>
      </div>

      <div className="message-body">
        <div className="message-header">
          <span className="message-sender-name">
            {lang === 'hi' ? 'कमोडिटी AI असिस्टेंट' : lang === 'mr' ? 'कमोडिटी AI सहाय्यक' : 'Commodity AI Assistant'}
          </span>
          <span className="message-timestamp">
            {message.timestamp
              ? new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </span>
          {message.language && (
            <span className="message-lang-badge">
              {message.language.toUpperCase()}
            </span>
          )}
        </div>

        {/* -------------------------------------------------------------
            CASE 1: HISTORICAL QUERY WITH AT LEAST 2 RECORDS
            Render Rate and Chart view tabs
            ------------------------------------------------------------- */}
        {isHistorical && hasHistoricalRecords && (
          <>
            <div className="view-selector-container">
              <div className="view-selector-prompt">
                <strong>
                  {lang === 'hi'
                    ? 'मार्केट जानकारी देखने का तरीका चुनें:'
                    : lang === 'mr'
                    ? 'बाजार माहिती पाहण्यासाठी पर्याय निवडा:'
                    : 'Select how you want to view the market information.'}
                </strong>
              </div>
              <div className="view-selector-options" role="tablist" aria-label="View options">
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedOption === 'rate'}
                  aria-label={lang === 'hi' ? 'Rate - मूल्य और विवरण' : lang === 'mr' ? 'Rate - किंमत आणि तपशील' : 'Rate - Price and details'}
                  className={`view-choice-card ${selectedOption === 'rate' ? 'selected' : ''}`}
                  onClick={() => setSelectedOption('rate')}
                >
                  <div className="choice-header">
                    <RateIcon size={16} />
                    <span className="choice-title">{lang === 'hi' ? 'रेट (Rate)' : lang === 'mr' ? 'दर (Rate)' : 'Rate'}</span>
                  </div>
                  <span className="choice-desc">
                    {lang === 'hi' ? 'मूल्य और विवरण' : lang === 'mr' ? 'किंमत आणि तपशील' : 'Price and details'}
                  </span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedOption === 'chart'}
                  aria-label={lang === 'hi' ? 'Chart - मूल्य रुझान' : lang === 'mr' ? 'Chart - किमतीचा कल' : 'Chart - Price trend'}
                  className={`view-choice-card ${selectedOption === 'chart' ? 'selected' : ''}`}
                  onClick={() => setSelectedOption('chart')}
                >
                  <div className="choice-header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" x2="18" y1="20" y2="10" />
                      <line x1="12" x2="12" y1="20" y2="4" />
                      <line x1="6" x2="6" y1="20" y2="14" />
                    </svg>
                    <span className="choice-title">{lang === 'hi' ? 'चार्ट (Chart)' : lang === 'mr' ? 'चार्ट (Chart)' : 'Chart'}</span>
                  </div>
                  <span className="choice-desc">
                    {lang === 'hi' ? 'मूल्य रुझान' : lang === 'mr' ? 'किमतीचा ट्रेंड' : 'Price trend'}
                  </span>
                </button>
              </div>
            </div>

            {selectedOption === 'rate' && (
              <div className="message-content rate-view-content">
                <div className="historical-records-table-container">
                  <div className="records-table-header">
                    <span className="records-table-title">
                      {lang === 'hi'
                        ? `प्राप्त वास्तविक दरें (${historicalRecords.length} रिकॉर्ड)`
                        : lang === 'mr'
                        ? `प्राप्त झालेले प्रत्यक्ष दर (${historicalRecords.length} नोंदी)`
                        : `Actual Rates Retrieved for Period (${historicalRecords.length} records)`}
                    </span>
                  </div>
                  <div className="table-responsive">
                    <table className="mini-records-table">
                      <thead>
                        <tr>
                          <th>{lang === 'hi' || lang === 'mr' ? 'तारीख' : 'Date'}</th>
                          {historicalRecords.some((r) => r.commodity) && (
                            <th>{lang === 'hi' || lang === 'mr' ? 'कमोडिटी' : 'Commodity'}</th>
                          )}
                          <th className="text-right">
                            {lang === 'hi' ? 'भाव / दर' : lang === 'mr' ? 'दर / भाव' : 'Price / Rate'}
                          </th>
                          {historicalRecords.some((r) => r.unit) && (
                            <th>{lang === 'hi' ? 'इकाई' : lang === 'mr' ? 'एकक' : 'Unit'}</th>
                          )}
                          {historicalRecords.some((r) => r.location) && (
                            <th>
                              {lang === 'hi' ? 'मंडी / स्थान' : lang === 'mr' ? 'बाजार / ठिकाण' : 'Mandi / Location'}
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {historicalRecords.map((rec, rIdx) => (
                          <tr key={rIdx}>
                            <td><strong>{rec.date}</strong></td>
                            {historicalRecords.some((r) => r.commodity) && (
                              <td>{rec.commodity || '--'}</td>
                            )}
                            <td className="text-right">
                              <span className="rate-value-bold">
                                ₹{rec.rate.toLocaleString()}
                              </span>
                            </td>
                            {historicalRecords.some((r) => r.unit) && (
                              <td>{rec.unit || 'unit'}</td>
                            )}
                            {historicalRecords.some((r) => r.location) && (
                              <td>{rec.location || '--'}</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="ai-text-body">
                  {renderMarkdown(cleanedContent)}
                </div>
              </div>
            )}

            {selectedOption === 'chart' && (
              <div className="message-content chart-view-content">
                <div className="message-chart-wrapper">
                  <TrendChart
                    data={chartPoints}
                    title={chartTitle}
                    unit={chartUnit}
                    height={220}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* -------------------------------------------------------------
            CASE 2: HISTORICAL QUERY BUT INSUFFICIENT / NO RECORDS
            Do NOT render Chart button or empty chart canvas.
            Display clean localized empty-state box + AI textual guidance.
            ------------------------------------------------------------- */}
        {isHistorical && !hasHistoricalRecords && (
          <div className="message-content rate-view-content">
            <div className="historical-unavailable-box">
              <div className="historical-unavailable-icon">📊</div>
              <p className="historical-unavailable-text">
                {lang === 'hi'
                  ? 'इस अवधि के लिए कोई ऐतिहासिक दर डेटा नहीं मिला। मूल्य रुझान चार्ट प्रदर्शित करने के लिए ऐतिहासिक दर रिकॉर्ड की आवश्यकता होती है।'
                  : lang === 'mr'
                  ? 'या कालावधीसाठी कोणताही ऐतिहासिक दर डेटा आढळला नाही. किमतीचा कल (Chart) दर्शवण्यासाठी ऐतिहासिक दर नोंदींची आवश्यकता आहे.'
                  : 'No historical rate data was found for this period to plot a trend chart. Price trend charts require historical rate records.'}
              </p>
            </div>
            <div className="ai-text-body">
              {renderMarkdown(cleanedContent)}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            CASE 3: SINGLE CURRENT RATE QUERY
            Do NOT display Chart button or rate/chart switcher.
            Display high-readability professional current-rate card.
            ------------------------------------------------------------- */}
        {!isHistorical && singleRateInfo && (
          <div className="message-content rate-view-content">
            <div className="single-current-rate-card">
              <div className="current-rate-card-header">
                <div className="current-rate-badge-wrapper">
                  <span className="current-rate-pulse-dot" />
                  <span className="current-rate-badge-text">
                    {lang === 'hi'
                      ? 'वर्तमान बाजार भाव'
                      : lang === 'mr'
                      ? 'सध्याचा बाजार दर'
                      : 'Current Market Rate'}
                  </span>
                </div>
                {singleRateInfo.date && (
                  <span className="current-rate-date-badge">
                    <span className="current-rate-date-label">
                      {lang === 'hi' || lang === 'mr' ? 'दिनांक:' : 'As of'}
                    </span>
                    <strong>{singleRateInfo.date}</strong>
                  </span>
                )}
              </div>

              <div className="current-rate-hero-section">
                <div className="current-rate-main-display">
                  <span className="current-rate-currency-symbol">₹</span>
                  <span className="current-rate-big-value">{formattedRate}</span>
                  <span className="current-rate-unit-suffix">
                    / {formatUnitDisplay(singleRateInfo.unit, lang)}
                  </span>
                </div>
                <div className="current-rate-status-tag">
                  <span className="status-live-tag">
                    {lang === 'hi'
                      ? 'सत्यापित रिकॉर्ड'
                      : lang === 'mr'
                      ? 'सत्यापित नोंद'
                      : 'Live Record'}
                  </span>
                </div>
              </div>

              <div className="current-rate-details-grid">
                <div className="current-rate-meta-item">
                  <span className="meta-item-label">
                    {lang === 'hi' || lang === 'mr' ? 'कमोडिटी' : 'Commodity'}
                  </span>
                  <span className="meta-item-value">
                    {formatCommodityDisplay(singleRateInfo.commodity, lang)}
                  </span>
                </div>
                <div className="current-rate-meta-item">
                  <span className="meta-item-label">
                    {lang === 'hi' ? 'मंडी / स्थान' : lang === 'mr' ? 'बाजार / ठिकाण' : 'Mandi / Location'}
                  </span>
                  <span className="meta-item-value">
                    {formatLocationDisplay(singleRateInfo.location, lang)}
                  </span>
                </div>
                <div className="current-rate-meta-item">
                  <span className="meta-item-label">
                    {lang === 'hi' ? 'इकाई' : lang === 'mr' ? 'एकक' : 'Unit'}
                  </span>
                  <span className="meta-item-value">
                    {formatUnitDisplay(singleRateInfo.unit, lang)}
                  </span>
                </div>
                <div className="current-rate-meta-item">
                  <span className="meta-item-label">
                    {lang === 'hi' ? 'वर्तमान भाव' : lang === 'mr' ? 'सध्याचा दर' : 'Current Rate'}
                  </span>
                  <span className="meta-item-value rate-highlight">
                    ₹{formattedRate}
                  </span>
                </div>
              </div>
            </div>

            <div className="ai-text-body">
              {renderMarkdown(cleanedContent)}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            CASE 4: INITIAL WELCOME MESSAGE (Demo tabs)
            Allowed only on the initial welcome message (id: 'welcome')
            to demo interface controls without making API calls.
            ------------------------------------------------------------- */}
        {!isHistorical && !singleRateInfo && message.id === 'welcome' && (
          <>
            <div className="response-view-switcher" role="tablist" aria-label="Response view options">
              <button
                type="button"
                role="tab"
                aria-selected={selectedOption === 'rate'}
                aria-label={lang === 'hi' ? 'Rate - भाव' : lang === 'mr' ? 'Rate - दर' : 'Rate'}
                className={`view-option-btn ${selectedOption === 'rate' ? 'active' : ''}`}
                onClick={() => setSelectedOption('rate')}
              >
                <RateIcon size={13} />
                <span>{lang === 'hi' ? 'रेट (Rate)' : lang === 'mr' ? 'दर (Rate)' : 'Rate'}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedOption === 'chart'}
                aria-label={lang === 'hi' ? 'Chart - चार्ट' : lang === 'mr' ? 'Chart - चार्ट' : 'Chart'}
                className={`view-option-btn ${selectedOption === 'chart' ? 'active' : ''}`}
                onClick={() => setSelectedOption('chart')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" x2="18" y1="20" y2="10" />
                  <line x1="12" x2="12" y1="20" y2="4" />
                  <line x1="6" x2="6" y1="20" y2="14" />
                </svg>
                <span>{lang === 'hi' ? 'चार्ट (Chart)' : lang === 'mr' ? 'चार्ट (Chart)' : 'Chart'}</span>
              </button>
            </div>
            <div className="message-content rate-view-content">
              <div className="ai-text-body">
                {selectedOption === 'chart' ? (
                  <div className="chart-unavailable-box">
                    <div className="chart-unavailable-icon">📊</div>
                    <p className="chart-unavailable-text">
                      {lang === 'hi'
                        ? 'मूल्य रुझान चार्ट देखने के लिए किसी कमोडिटी के ऐतिहासिक दरें पूछें (उदा. "पिछले 7 दिनों का सोयाबीन का रेट")।'
                        : lang === 'mr'
                        ? 'किमतीचा कल चार्ट पाहण्यासाठी कमोडिटीचे ऐतिहासिक दर विचारा (उदा. "गेल्या ७ दिवसांचे सोयाबीनचे दर").'
                        : 'To view price trend charts, ask for historical commodity rates (e.g., "Show me the last 7 days of Soybean rates").'}
                    </p>
                  </div>
                ) : (
                  renderMarkdown(cleanedContent)
                )}
              </div>
            </div>
          </>
        )}

        {/* -------------------------------------------------------------
            CASE 5: BUYER DEMAND QUERY WITH DYNAMIC COMMODITY BUTTONS
            ------------------------------------------------------------- */}
        {!isHistorical && !singleRateInfo && isDemand && message.id !== 'welcome' && (
          <div className="message-content rate-view-content commodity-demand-container">
            {/* Dynamic Commodity Selector Buttons (if commodities identified) */}
            {demandCommodities.length > 0 && (
              <div className="commodity-selector-container">
                <div className="commodity-selector-label">
                  <strong>
                    {DEMAND_I18N[lang]?.selectorPrompt || 'Select commodity to view buyer demand:'}
                  </strong>
                </div>
                <div
                  className="commodity-buttons-scroll"
                  role="tablist"
                  aria-label="Commodity demand selector"
                >
                  {demandCommodities.map((comm) => {
                    const isSelected =
                      activeDemandCommodity &&
                      comm.toLowerCase() === activeDemandCommodity.toLowerCase();
                    const localizedName = formatCommodityName(comm, lang);
                    return (
                      <button
                        key={comm}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        className={`commodity-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedDemandCommodity(comm)}
                      >
                        <span className="commodity-btn-name">{localizedName}</span>
                        {lang !== 'en' &&
                          comm.toLowerCase() !== localizedName.toLowerCase() && (
                            <span className="commodity-btn-en-sub">({comm})</span>
                          )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Demand Details Card */}
            <div className="demand-details-card">
              <div className="demand-card-header">
                <div className="demand-commodity-title">
                  <span className="demand-pulse-dot" />
                  <span>
                    {activeDemandCommodity
                      ? formatCommodityName(activeDemandCommodity, lang)
                      : lang === 'hi'
                      ? 'कमोडिटी मांग'
                      : lang === 'mr'
                      ? 'शेतमाल मागणी'
                      : 'Commodity Demand'}
                  </span>
                  {activeDemandCommodity &&
                    lang !== 'en' &&
                    activeDemandCommodity.toLowerCase() !==
                      formatCommodityName(activeDemandCommodity, lang).toLowerCase() && (
                      <span className="demand-title-sub">({activeDemandCommodity})</span>
                    )}
                </div>
                <div className="demand-status-badge">
                  <span className="status-live-tag">
                    {lang === 'hi'
                      ? 'सत्यापित मांग'
                      : lang === 'mr'
                      ? 'सत्यापित मागणी'
                      : 'Verified Demand'}
                  </span>
                </div>
              </div>

              {/* Statistics Badges / Pills */}
              <div className="demand-stats-row">
                <span className="demand-stat-pill pill-primary">
                  {DEMAND_I18N[lang]?.recordsBadge(activeDemandRecords.length) ||
                    `Demand Records: ${activeDemandRecords.length}`}
                </span>

                {distinctBuyersCount > 0 && (
                  <span className="demand-stat-pill pill-success">
                    {DEMAND_I18N[lang]?.buyersBadge(distinctBuyersCount) ||
                      `Distinct Buyers: ${distinctBuyersCount}`}
                  </span>
                )}

                {totalDemandQuantityInfo && (
                  <span className="demand-stat-pill pill-purple">
                    {DEMAND_I18N[lang]?.totalQtyBadge(
                      totalDemandQuantityInfo.total,
                      totalDemandQuantityInfo.unit
                    ) ||
                      `Total Quantity: ${totalDemandQuantityInfo.total} ${totalDemandQuantityInfo.unit}`}
                  </span>
                )}
              </div>

              {/* Records Table, Empty State, or API Error */}
              {isDemandApiError && allBuyerDemands.length === 0 ? (
                <div className="demand-error-box">
                  <span className="demand-error-icon">⚠️</span>
                  <span>
                    {lang === 'hi'
                      ? 'मार्केटप्लेस सेवा वर्तमान में अनुपलब्ध है। इस समय खरीदार मांग रिकॉर्ड प्राप्त नहीं किए जा सके।'
                      : lang === 'mr'
                      ? 'मार्केटप्लेस सेवा सध्या अनुपलब्ध आहे. या वेळी खरेदीदार मागणीच्या नोंदी मिळवता आल्या नाहीत.'
                      : 'The marketplace service is currently unavailable. Could not retrieve buyer demand records at this time.'}
                  </span>
                </div>
              ) : activeDemandRecords.length === 0 ? (
                <div className="demand-empty-box">
                  <span className="demand-empty-icon">📋</span>
                  <span className="demand-empty-text">
                    {DEMAND_I18N[lang]?.noRecords ||
                      'No demand records found for this commodity.'}
                  </span>
                </div>
              ) : (
                <div className="demand-table-container">
                  <div className="table-responsive">
                    <table className="mini-records-table demand-records-table">
                      <thead>
                        <tr>
                          <th>{DEMAND_I18N[lang]?.buyerCol || 'Buyer'}</th>
                          <th>{DEMAND_I18N[lang]?.commodityCol || 'Commodity'}</th>
                          <th className="text-right">
                            {DEMAND_I18N[lang]?.quantityCol || 'Quantity'}
                          </th>
                          <th className="text-right">
                            {DEMAND_I18N[lang]?.targetRateCol || 'Target Price'}
                          </th>
                          <th>{DEMAND_I18N[lang]?.locationCol || 'Location'}</th>
                          <th>{DEMAND_I18N[lang]?.dateCol || 'Required Date'}</th>
                          <th>{DEMAND_I18N[lang]?.statusCol || 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeDemandRecords.map((item, idx) => {
                          const buyerDisplay =
                            item.buyerName && item.buyerName.trim() && item.buyerName !== '-'
                              ? item.buyerName
                              : DEMAND_I18N[lang]?.unavailable || 'Unavailable';
                          const qtyDisplay =
                            item.quantity !== undefined && item.quantity !== null
                              ? `${
                                  typeof item.quantity === 'number'
                                    ? item.quantity.toLocaleString('en-IN')
                                    : item.quantity
                                } ${item.unit || ''}`.trim()
                              : '-';
                          const targetPriceVal = item.targetPrice ?? item.targetRate;
                          const targetRateDisplay =
                            targetPriceVal !== undefined && targetPriceVal !== null
                              ? `₹${typeof targetPriceVal === 'number' ? targetPriceVal.toLocaleString('en-IN') : targetPriceVal}${item.unit ? ` / ${item.unit}` : ''}`
                              : '-';
                          const commDisplay = formatCommodityName(
                            item.commodityName || item.commodity || activeDemandCommodity,
                            lang
                          );
                          const locDisplay = formatLocationDisplay(item.location, lang);
                          const dateDisplay = item.requiredDate || item.date || '-';
                          const statusDisplay = formatStatusDisplay(item.status, lang);

                          return (
                            <tr key={idx}>
                              <td>
                                <strong>{buyerDisplay}</strong>
                              </td>
                              <td>{commDisplay}</td>
                              <td className="text-right">
                                <span className="rate-value-bold">{qtyDisplay}</span>
                              </td>
                              <td className="text-right">
                                <span className="rate-value">{targetRateDisplay}</span>
                              </td>
                              <td>{locDisplay}</td>
                              <td>{dateDisplay}</td>
                              <td>
                                <span
                                  className={`type-tag status-${String(
                                    item.status || ''
                                  ).toLowerCase()}`}
                                >
                                  {statusDisplay}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* AI Summary / Contextual Notes below card */}
            {cleanedDemandContent && (
              <div className="ai-text-body">
                {renderMarkdown(cleanedDemandContent)}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            CASE 5.5: ORDERS BROWSING WITH INTERACTIVE COMMODITY SELECTOR,
            SUMMARY CARDS, COMPACT TABLE, PAGINATION & MODAL OVERLAY
            ------------------------------------------------------------- */}
        {!isHistorical && !singleRateInfo && !isDemand && isOrders && message.id !== 'welcome' && (
          <div className="message-content rate-view-content order-view-content">
            <OrderExplorer message={message} lang={lang} />
            {cleanedContent && (
              <div className="ai-text-body">
                {renderMarkdown(cleanedContent)}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            CASE 5.6: REGISTERED PARTIES BROWSING / COUNT / EXPLORER
            Handles:
            1. Count queries: 2 KPI cards + 4 action cards
            2. Directory & filtered queries: rich interactive table with search,
               filters, pagination, sortable columns, and details modal
            ------------------------------------------------------------- */}
        {!isHistorical && !singleRateInfo && !isDemand && !isOrders && isParties && message.id !== 'welcome' && (
          <div className="message-content rate-view-content party-view-content">
            {isPartyCount ? (
              <PartyCountCard message={message} lang={lang} onSendMessage={onSendMessage} />
            ) : (
              <PartyExplorer message={message} lang={lang} onSendMessage={onSendMessage} />
            )}
            {cleanedContent && (
              <div className="ai-text-body">
                {renderMarkdown(cleanedContent)}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            CASE 5.7: COMMODITY SUPPLIES & INVENTORY (STEP 3)
            Interactive table with highest-quantity card, active badges,
            filters (price < ₹4,500), pagination and details modal.
            ------------------------------------------------------------- */}
        {!isHistorical &&
          !singleRateInfo &&
          !isDemand &&
          !isOrders &&
          !isParties &&
          isSupply &&
          message.id !== 'welcome' && (
            <div className="message-content rate-view-content supply-view-content">
              <SupplyExplorer message={message} lang={lang} onSendMessage={onSendMessage} />
              {cleanedContent && (
                <div className="ai-text-body">
                  {renderMarkdown(cleanedContent)}
                </div>
              )}
            </div>
          )}

        {/* -------------------------------------------------------------
            CASE 5.8: ADVANCED BUYER DEMAND EXPLORER (STEP 4)
            Interactive table with active demands KPI, total requested qty,
            highest demanded commodity card, filters & detail modal.
            ------------------------------------------------------------- */}
        {!isHistorical &&
          !singleRateInfo &&
          !isDemand &&
          !isOrders &&
          !isParties &&
          !isSupply &&
          isDemandExplorer &&
          message.id !== 'welcome' && (
            <div className="message-content rate-view-content demand-view-content">
              <DemandExplorer message={message} lang={lang} onSendMessage={onSendMessage} />
              {cleanedContent && (
                <div className="ai-text-body">
                  {renderMarkdown(cleanedContent)}
                </div>
              )}
            </div>
          )}

        {/* -------------------------------------------------------------
            CASE 5.9: BIDS & NEGOTIATIONS (STEP 5)
            Interactive explorer with pending bids, highest offer rate,
            active negotiations, tab filtering & detail modal.
            ------------------------------------------------------------- */}
        {!isHistorical &&
          !singleRateInfo &&
          !isDemand &&
          !isOrders &&
          !isParties &&
          !isSupply &&
          !isDemandExplorer &&
          isBid &&
          message.id !== 'welcome' && (
            <div className="message-content rate-view-content bid-view-content">
              <BidExplorer message={message} lang={lang} />
              {cleanedContent && (
                <div className="ai-text-body">
                  {renderMarkdown(cleanedContent)}
                </div>
              )}
            </div>
          )}

        {/* -------------------------------------------------------------
            CASE 5.10: DEALS & CONTRACTS (STEP 6)
            Interactive explorer for deals, legal contracts, signatures,
            commercial terms, role authorization note & detail modal.
            ------------------------------------------------------------- */}
        {!isHistorical &&
          !singleRateInfo &&
          !isDemand &&
          !isOrders &&
          !isParties &&
          !isSupply &&
          !isDemandExplorer &&
          !isBid &&
          isDeal &&
          message.id !== 'welcome' && (
            <div className="message-content rate-view-content deal-view-content">
              <DealExplorer message={message} lang={lang} />
              {cleanedContent && (
                <div className="ai-text-body">
                  {renderMarkdown(cleanedContent)}
                </div>
              )}
            </div>
          )}

        {/* -------------------------------------------------------------
            CASE 5.11: WHATSAPP DIAGNOSTICS & SYSTEM STATUS (STEP 7)
            Live connection test, configuration, provider status, and
            transparent explanation of unpersisted message history.
            ------------------------------------------------------------- */}
        {!isHistorical &&
          !singleRateInfo &&
          !isDemand &&
          !isOrders &&
          !isParties &&
          !isSupply &&
          !isDemandExplorer &&
          !isBid &&
          !isDeal &&
          isWhatsApp &&
          message.id !== 'welcome' && (
            <div className="message-content rate-view-content whatsapp-view-content">
              <WhatsAppDiagnosticsCard lang={lang} />
              {cleanedContent && (
                <div className="ai-text-body">
                  {renderMarkdown(cleanedContent)}
                </div>
              )}
            </div>
          )}

        {/* -------------------------------------------------------------
            CASE 6: GENERAL / CONVERSATIONAL MESSAGE
            No chart button, no rate controls. Pure markdown text response.
            ------------------------------------------------------------- */}
        {!isHistorical &&
          !singleRateInfo &&
          !isDemand &&
          !isOrders &&
          !isParties &&
          !isSupply &&
          !isDemandExplorer &&
          !isBid &&
          !isDeal &&
          !isWhatsApp &&
          message.id !== 'welcome' && (
            <div className="message-content rate-view-content">
              <div className="ai-text-body">
                {renderMarkdown(cleanedContent)}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
