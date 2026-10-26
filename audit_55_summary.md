# 55-Question Audit Verification Summary

**Evaluation Scope:** Factual verification of all 55 chatbot responses from `audit_55_results.json` against actual TradeX (port 8080) and PostgreSQL database records.  
**Reference Report:** `final_chatbot_verification_report.md`  

---

## 1. Table of All 55 Questions

| # | Short Question | Actual Chatbot Answer (Summary) | Actual Status | Factually Verified? | Error or Missing Evidence |
|:---:|---|---|:---:|:---:|---|
| 1 | Show me the Soybean rate for the last 7 days. | Table of 3 rates (10-19: ₹4300, 10-20: ₹4600, 10-21: ₹4650) + notes 10-22 to 10-25 unrecorded + chart | 200 (RATE) | Verified Correct | None. Verified against real PostgreSQL historical rates. |
| 2 | What is today's Soybean rate? | Current asking price for Soybean in Sangli is ₹4650.0/Quintal (as of 2026-10-21) | 200 (RATE) | Verified Correct | None. Verified against real latest rate record. |
| 3 | What is the Soybean rate in Sangli? | Current asking price for Soybean in Sangli is ₹4650.0/Quintal (as of 2026-10-21) | 200 (RATE) | Verified Correct | None. Verified against real Sangli rate record. |
| 4 | Show me the last 7 days of Soybean rates in Sangli. | Table of 3 rates (10-19 to 10-21) + notes 10-22 to 10-25 unrecorded + chart | 200 (RATE) | Verified Correct | None. Verified against PostgreSQL records. |
| 5 | Compare today's Soybean rates across locations. | Sangli rate changed from ₹4300 (10-19) to ₹4650 (10-21) (+₹350, +8.14%); notes Sangli is only location | 200 (RATE) | Verified Correct | None. Truthfully identifies Sangli as only recorded location. |
| 6 | Show me the highest and lowest Soybean rates for the last 7 days. | Table showing 3 available rates (Min: ₹4300 on 10-19, Max: ₹4650 on 10-21) | 200 (RATE) | Verified Correct | None. Min and Max match database rates. |
| 7 | Plot a chart of Soybean rates for the last 7 days. | displayType CHART + 3 historical rates table + chartData points | 200 (CHART) | Verified Correct | None. Chart points match database records. |
| 8 | Compare Soybean rates for the last 7 days with the previous 7 days. | Compares Sangli rate on 10-19 (₹4300) with 10-21 (₹4650) (+₹350 / +8.14%) | 200 (RATE) | Verified Correct | None. Compares available historical window. |
| 9 | Show me all actual Soybean records. | Table of all 22 historical rate records for Soybean in Sangli (2026-10-01 to 2026-11-30, ₹4000-₹4800) | 200 (RATE) | Verified Correct | None. Matches 22 records in PostgreSQL `market_rates`. |
| 10 | What is today's demand for Soybean? | Table with 1 Soybean demand: DEM-1792400874398 (200 Quintals @ ₹4,400/Qtl, Pune, K.K. Canvassing) | 200 (DEMAND) | Verified Correct | None. Matches TradeX active buyer demands. |
| 11 | Today what is the demand for Soybean? | Table with 1 Soybean demand: DEM-1792400874398 (200 Quintals @ ₹4,400/Qtl, Pune, K.K. Canvassing) | 200 (DEMAND) | Verified Correct | None. Matches TradeX active buyer demands. |
| 12 | Show me all active buyer demands. | Reports 4 active buyer demands in marketplace from 1 distinct buyer (K.K. Canvassing Agent) | 200 (DEMAND) | Verified Correct | None. Total demand count matches TradeX. |
| 13 | How many buyer demands are registered in Sangli? | Lists 2 registered PARTIES in Sangli (PRT-0001, PRT-0003 Sangli Agro Traders) | 200 (PARTIES) | Incorrect | Misrouted to PARTIES intent; answered with registered parties instead of buyer demands in Sangli. |
| 14 | Show me the requested quantity for each commodity. | Table of 4 demands: Wheat 100 Qtl, MAIZE 150 Qtl, MAIZEW 120 Qtl, Soybean 200 Qtl | 200 (DEMAND) | Verified Correct | None. Matches TradeX demand quantities. |
| 15 | Show me buyer demands with their target prices. | Table of 4 demands with Buyer, Commodity, Qty, Location, Date, Status (Target Price column omitted) | 200 (DEMAND) | Incorrect | Target Price column was completely omitted from the rendered markdown table. |
| 16 | Which commodities have the highest buyer demand? | Soybean has highest demand with total requested quantity of 200 Quintals (1 active listing) | 200 (DEMAND) | Verified Correct | None. Matches numerical demand quantity in TradeX. |
| 17 | Show me all pending buyer demands. | Table of all 4 active pending buyer demands in the marketplace | 200 (DEMAND) | Verified Correct | None. Matches TradeX pending demands. |
| 18 | Find supplies matching active Soybean demands. | Generic summary stating 1 active Soybean buyer demand exists; did not list matching supplies | 200 (DEMAND) | Not Proven | Generic fallback text. Did not search or display matching supplies for the active Soybean demand. |
| 19 | Show me all active supplies. | Table of all 11 active supplies: 8 Soybean (500 Qtl each), 1 MAIZE (600), 1 MAIZEW (700), 1 Wheat (800) | 200 (SUPPLIES) | Verified Correct | None. Matches all 11 listings in TradeX GET /supplies. |
| 20 | How much Soybean is available in the marketplace? | Total available Soybean is 4,000 Quintals across 8 active listings (1,000 unexpired, 3,000 past validity) | 200 (SUPPLIES) | Verified Correct | None. 8 listings * 500 = 4,000 Qtl matches TradeX. |
| 21 | Show me Soybean supplies in Sangli. | Lists all 8 Soybean listings located in Sangli (Total: 4,000 Quintals, Sangli Agro Traders) | 200 (SUPPLIES) | Verified Correct | None. Sangli listings verified against TradeX. |
| 22 | Which suppliers have the largest available quantities? | Sangli Agro Traders has largest quantity with 6,100 Quintals across 11 listings (Soybean 4000, Maize 600, MaizeW 700, Wheat 800) | 200 (SUPPLIES) | Verified Correct | None. Sum of 11 listings matches TradeX seller totals. |
| 23 | Show me supplies with prices below ₹4,500 per quintal. | Table with 4 listings priced <= ₹4,500/Qtl (SUP-1792572721202 @ ₹4300, and 3 listings @ ₹4500) | 200 (SUPPLIES) | Verified Correct | None. Verified against TradeX asking rates. |
| 24 | Which supplies have expired validity dates? | Dumped full overview table of all 11 supplies without filtering or identifying expired ones | 200 (SUPPLIES) | Incorrect | Did not filter or calculate expired supplies; returned full 11 listings overview as generic fallback. |
| 25 | Show me supplies expiring in the next 7 days. | Identifies SUP-1792572585508 expiring soonest on 2026-10-31 (in 9 days) + lists other validity ranges | 200 (SUPPLIES) | Verified Correct | None. Matches TradeX validity dates. |
| 26 | Compare available quantities across commodities. | Table shows Soybean 4000 Qtl, Maize 600, MaizeW 700, Wheat 800; but bullet text claims 0 listings for Wheat/Maize | 200 (SUPPLIES) | Incorrect | Self-contradictory. Table correctly lists 4 commodities, but bullet points state Wheat/Maize have 0 listings. |
| 27 | How many bids are currently active? | Table of all 9 active/pending bids (BID-1792654013980 to BID-1792400918453, ₹4200 to ₹4450) | 200 (BIDS) | Verified Correct | None. 9 bids verified against TradeX GET /bids. |
| 28 | Show me all pending bids. | Table of all 9 pending bids | 200 (BIDS) | Verified Correct | None. Matches 9 pending bids in TradeX. |
| 29 | What is the highest bid for Soybean? | Identifies 2 tied highest bids at ₹4,450/Quintal (BID-1792653528878 and BID-1792400918453) | 200 (BIDS) | Verified Correct | None. Top bid rate ₹4,450 matches TradeX bids. |
| 30 | Show me ongoing negotiations. | Reports 0 active negotiations in TradeX; explains 9 buyer bids remain in PENDING status | 200 (NEGOTIATIONS) | Verified Correct | None. Factually verified (TradeX has 0 negotiations). |
| 31 | Show me the latest negotiation rounds. | Returned table of 9 pending bids labeled as negotiation rounds | 200 (NEGOTIATIONS) | Incorrect | Returned initial pending bids instead of reporting 0 negotiation rounds. |
| 32 | Which negotiations are awaiting a response? | Reports 0 active negotiation threads; clarifies 9 pending bids are awaiting seller response | 200 (NEGOTIATIONS) | Verified Correct | None. Verified against TradeX negotiation/bid status. |
| 33 | Show me the bid price and asking price for each available listing. | Cross-listing table comparing seller asking prices (₹4300-₹4800, etc.) with market bids (₹4200-₹4450) | 200 (BIDS) | Verified Correct | None. Asking rates and bid ranges verified against TradeX. |
| 34 | How many deals are currently registered? | Reports 0 active deals registered in TradeX; marketplace has 11 supplies and 9 bids in pre-deal stage | 200 (DEALS) | Verified Correct | None. Verified 0 executed deals in TradeX. |
| 35 | Show me all active deals. | Reports 0 active deals registered in TradeX | 200 (DEALS) | Verified Correct | None. Verified 0 active deals in TradeX. |
| 36 | Show me pending contracts. | Reports 0 pending contracts, 0 awaiting signatures, 0 finalized deals in TradeX | 200 (DEALS) | Verified Correct | None. Verified 0 pending contracts in TradeX. |
| 37 | Show me completed contracts. | Reports 0 completed contracts / 0 finalized deals in TradeX | 200 (DEALS) | Verified Correct | None. Verified 0 completed contracts in TradeX. |
| 38 | Show me the commodity, quantity, and agreed price for each deal. | Explains 0 registered deals exist in TradeX; references current asking/bid rates as pricing context | 200 (DEALS) | Verified Correct | None. Factually true (0 deals = 0 agreed prices). |
| 39 | Which contracts are still pending? | Reports 0 pending contracts in TradeX | 200 (DEALS) | Verified Correct | None. Verified 0 pending contracts in TradeX. |
| 40 | Summarize deal and contract statuses. | Status summary: 0 active deals, 0 pending contracts, 0 completed contracts, 9 active bids | 200 (DEALS) | Verified Correct | None. Summary matches TradeX state. |
| 41 | How many parties are registered in the marketplace? | 12 registered parties total (5 Manufacturers, 5 Traders, 2 Unassigned); all 12 active | 200 (PARTIES) | Verified Correct | None. 12 parties verified against TradeX GET /parties. |
| 42 | Which parties are registered in Sangli? | 2 registered parties in Sangli: PRT-0001 (Sangli Agro Traders) and PRT-0003 (Sangli Agro Traders) | 200 (PARTIES) | Verified Correct | None. Matches TradeX party registry. |
| 43 | Show me all registered buyers. | 0 parties with explicit BUYER role; explains TradeX classifies entities as Manufacturer/Trader | 200 (PARTIES) | Verified Correct | None. Accurately reflects TradeX role classifications. |
| 44 | Show me all registered suppliers. | Table of all 12 registered entities that can act as suppliers; notes Sangli Agro Traders is active | 200 (PARTIES) | Verified Correct | None. Verified against TradeX party records. |
| 45 | Show me the party details and locations. | Full table of 12 registered parties with Party Code, Company Name, City, State, Role, Status | 200 (PARTIES) | Verified Correct | None. All 12 party profiles match TradeX. |
| 46 | How many buyers and suppliers are active? | Returned table of 4 buyer demands for 1 buyer (K.K. Canvassing); omitted active suppliers count | 200 (DEMAND) | Incorrect | Incomplete response: omitted active suppliers count/details when asked for both buyers and suppliers. |
| 47 | Show me the commodities with the most available supplies. | Overview table of all 11 listings showing Soybean has 8 listings, Maize 1, MaizeW 1, Wheat 1 | 200 (SUPPLIES) | Verified Correct | None. Matches TradeX active supplies distribution. |
| 48 | Give me a summary of today's marketplace activity. | Marketplace summary: 12 parties, 11 supplies, 4 demands, 9 bids, 0 deals | 200 (PARTIES) | Verified Correct | None. Multi-entity aggregates match TradeX state. |
| 49 | Is WhatsApp configured and connected? | Canned fallback message: WhatsApp dispatch logs / delivery status unavailable in TradeX; suggests integration | 200 (WHATSAPP) | Blocked or Unsupported | TradeX backend does not expose WhatsApp API (GET /api/ai/whatsapp-logs). Chatbot returned canned fallback. |
| 50 | Is WhatsApp enabled or disabled? | Canned fallback message: WhatsApp dispatch logs / delivery status unavailable in TradeX; suggests integration | 200 (WHATSAPP) | Blocked or Unsupported | TradeX backend does not expose WhatsApp API (GET /api/ai/whatsapp-logs). Chatbot returned canned fallback. |
| 51 | Test the WhatsApp connection. | Canned fallback message: WhatsApp dispatch logs / delivery status unavailable in TradeX; suggests integration | 200 (WHATSAPP) | Blocked or Unsupported | TradeX backend does not expose WhatsApp API (GET /api/ai/whatsapp-logs). Chatbot returned canned fallback. |
| 52 | Show me the WhatsApp configuration status. | Canned fallback message: WhatsApp dispatch logs / delivery status unavailable in TradeX; suggests integration | 200 (WHATSAPP) | Blocked or Unsupported | TradeX backend does not expose WhatsApp API (GET /api/ai/whatsapp-logs). Chatbot returned canned fallback. |
| 53 | Is the WhatsApp provider currently available? | Canned fallback message: WhatsApp dispatch logs / delivery status unavailable in TradeX; suggests integration | 200 (WHATSAPP) | Blocked or Unsupported | TradeX backend does not expose WhatsApp API (GET /api/ai/whatsapp-logs). Chatbot returned canned fallback. |
| 54 | Why did the WhatsApp connection test fail? | Canned fallback message: WhatsApp dispatch logs / delivery status unavailable in TradeX; suggests integration | 200 (WHATSAPP) | Blocked or Unsupported | TradeX backend does not expose WhatsApp API (GET /api/ai/whatsapp-logs). Chatbot returned canned fallback. |
| 55 | Are WhatsApp message delivery records available? | Canned fallback message: WhatsApp dispatch logs / delivery status unavailable in TradeX; suggests integration | 200 (WHATSAPP) | Blocked or Unsupported | TradeX backend does not expose WhatsApp API (GET /api/ai/whatsapp-logs). Chatbot returned canned fallback. |

---

## 2. Issues Breakdown and Exception Analysis

### 2.1 Questions Where the Answer is Incorrect
- **Q13 (DEMANDS): "How many buyer demands are registered in Sangli?"**
  - **Chatbot Answer:** Returned 2 registered *parties* located in Sangli (`PRT-0001` and `PRT-0003` Sangli Agro Traders) with `displayType: "PARTIES"`.
  - **Factual Error:** Misrouted intent to `isPartiesQuestion`. The question asked for buyer demands registered in Sangli, not registered parties. In TradeX, buyer demands contain destination locations (e.g., `DEM-1792400874398` has destination Sangli for MAIZEW 120 Qtl).

- **Q15 (DEMANDS): "Show me buyer demands with their target prices."**
  - **Chatbot Answer:** Rendered a markdown table of 4 demands listing Buyer, Commodity, Quantity, Location, Required Date, Status.
  - **Factual Error:** Omitted the requested **Target Price** column completely from the rendered table (target prices are ₹27,000/MT for Wheat, ₹21,000/MT for Maize, ₹22,000/MT for MaizeW, ₹4,400/Qtl for Soybean).

- **Q24 (SUPPLIES): "Which supplies have expired validity dates?"**
  - **Chatbot Answer:** Rendered the entire overview table of all 11 active supplies across all commodities without any date filtering.
  - **Factual Error:** Failed to calculate or filter which supply listings have passed their validity dates (e.g., `SUP-1792572661871` expired 2026-10-16, `SUP-1792572691806` expired 2026-10-17, etc.).

- **Q26 (SUPPLIES): "Compare available quantities across commodities."**
  - **Chatbot Answer:** Rendered a comparative table with Soybean (4,000 Qtl), MAIZE (600 Qtl), MAIZEW (700 Qtl), Wheat (800 Qtl), but included contradictory text below.
  - **Factual Error:** Direct internal contradiction. The summary text asserted *"Wheat, Maize & MaizeW: Currently 0 active seller listings in the marketplace"* and *"Soybean: 500.0 Quintals available across 11 active listings"*, directly contradicting its own table.

- **Q31 (BIDS): "Show me the latest negotiation rounds."**
  - **Chatbot Answer:** Rendered the table of 9 initial pending buyer bids (`BID-1792654013980` through `BID-1792400918453`).
  - **Factual Error:** Misrouted initial bids as negotiation rounds. In TradeX, 0 active negotiations or counter-offers exist; initial bids are not multi-round negotiations.

- **Q46 (PARTIES): "How many buyers and suppliers are active?"**
  - **Chatbot Answer:** Rendered a table containing only 4 active buyer demand listings from 1 buyer (`K.K. Canvassing Agent`).
  - **Factual Error:** Incomplete response. Completely omitted the count and listing of active suppliers (1 active supplier entity: Sangli Agro Traders with 11 active supply listings).

### 2.2 Questions Where the Answer is Unsupported or Cannot be Verified
- **Q49 (WHATSAPP): "Is WhatsApp configured and connected?"**
- **Q50 (WHATSAPP): "Is WhatsApp enabled or disabled?"**
- **Q51 (WHATSAPP): "Test the WhatsApp connection."**
- **Q52 (WHATSAPP): "Show me the WhatsApp configuration status."**
- **Q53 (WHATSAPP): "Is the WhatsApp provider currently available?"**
- **Q54 (WHATSAPP): "Why did the WhatsApp connection test fail?"**
- **Q55 (WHATSAPP): "Are WhatsApp message delivery records available?"**
  - **Limitation:** Live WhatsApp configuration, provider health, test status, and delivery logs cannot be verified because TradeX does not implement or connect to an operational WhatsApp messaging provider.

### 2.3 Questions Where the API or Data Source Was Unavailable
- **Q49 to Q55 (WHATSAPP, 7 Questions):**
  - **Unavailable Source:** The upstream TradeX service (`http://localhost:8080`) has no WhatsApp messaging or log endpoints (such as `GET /api/ai/whatsapp-logs`). The chatbot returned a static explanation identifying the missing integration.

### 2.4 Questions Where the Chatbot Returned a Generic/Fallback Answer
- **Q18 (DEMANDS): "Find supplies matching active Soybean demands."**
  - **Chatbot Answer:** Returned generic fallback text: *"According to marketplace records, there is 1 active buyer demand record in the marketplace (from 1 distinct buyer: K.K.CANVANSSING AGENT Verified Buyer [West]). Note: This represents active demand listings..."*
  - **Missing Behavior:** The chatbot did not perform or display cross-matching between the active 200 Quintal Soybean demand and the 8 available Soybean supply listings.
- **Q24 (SUPPLIES): "Which supplies have expired validity dates?"**
  - **Chatbot Answer:** Fell back to rendering the generic, unfiltered marketplace supplies overview table.
- **Q49 to Q55 (WHATSAPP, 7 Questions):**
  - **Chatbot Answer:** Returned an identical canned fallback response across all 7 prompts explaining that WhatsApp messaging endpoints are currently unavailable in TradeX and suggesting alternative queries.

---

## 3. Final Verification Counts

| Classification | Count | Percentage | Description |
|---|:---:|:---:|---|
| **Verified Correct** | **41** | **74.5%** | Answer accurately matches real TradeX GET API or PostgreSQL database records without factual discrepancies. |
| **Incorrect** | **6** | **10.9%** | Answer contains factual errors, contradictory text, missing requested columns, or intent misrouting (Q13, Q15, Q24, Q26, Q31, Q46). |
| **Not Proven** | **1** | **1.8%** | Query execution did not prove or supply matching data (Q18 returned generic demand count instead of matching supplies). |
| **Blocked or Unsupported** | **7** | **12.7%** | TradeX lacks WhatsApp integration or audit endpoints; queries received static fallback diagnostics (Q49–Q55). |
| **TOTAL** | **55** | **100.0%** | Full canonical audit corpus. |
