import React, { useState, useMemo } from 'react';
import {
  LightbulbIcon,
  SearchIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '../common/Icons';

export const SUGGESTED_CATEGORIES = [
  {
    id: 'RATES',
    icon: '📈',
    title: {
      en: 'Market Rates & Price Trends',
      hi: 'बाजार भाव एवं मूल्य रुझान',
      mr: 'बाजार भाव व किमतीचा कल',
    },
  },
  {
    id: 'DEMANDS',
    icon: '📊',
    title: {
      en: 'Buyer Demands',
      hi: 'खरीदार मांग',
      mr: 'खरेदीदार मागणी',
    },
  },
  {
    id: 'SUPPLIES',
    icon: '📦',
    title: {
      en: 'Supplies & Inventory',
      hi: 'आपूर्ति एवं स्टॉक',
      mr: 'पुरवठा व साठा',
    },
  },
  {
    id: 'BIDS',
    icon: '🤝',
    title: {
      en: 'Bids & Negotiations',
      hi: 'बोलियां एवं बातचीत',
      mr: 'बोली व वाटाघाटी',
    },
  },
  {
    id: 'DEALS',
    icon: '📝',
    title: {
      en: 'Deals & Contracts',
      hi: 'सौदा एवं अनुबंध',
      mr: 'सौदे व करार',
    },
  },
  {
    id: 'PARTIES',
    icon: '🏢',
    title: {
      en: 'Parties & Marketplace Overview',
      hi: 'व्यापारी पार्टियां एवं बाजार अवलोकन',
      mr: 'नोंदणीकृत व्यापारी व बाजार आढावा',
    },
  },
  {
    id: 'WHATSAPP',
    icon: '💬',
    title: {
      en: 'WhatsApp Diagnostics',
      hi: 'व्हाट्सएप डायग्नोस्टिक्स',
      mr: 'व्हॉट्सॲप तपासणी',
    },
  },
];

export const SUGGESTED_QUESTIONS_DATA = [
  // 1. Market Rates & Price Trends
  {
    id: 'q-rates-1',
    categoryId: 'RATES',
    commodity: 'Soybean',
    en: 'Show me the Soybean rate for the last 7 days.',
    hi: 'पिछले 7 दिनों का सोयाबीन का रेट दिखाएं।',
    mr: 'गेल्या ७ दिवसांचे सोयाबीनचे दर दाखवा.',
  },
  {
    id: 'q-rates-2',
    categoryId: 'RATES',
    commodity: 'Soybean',
    en: "What is today's Soybean rate?",
    hi: 'सोयाबीन का आज का भाव क्या है?',
    mr: 'सोयाबीनचा आजचा दर काय आहे?',
  },
  {
    id: 'q-rates-3',
    categoryId: 'RATES',
    commodity: 'Soybean',
    en: 'What is the Soybean rate in Sangli?',
    hi: 'सांगली में सोयाबीन का भाव क्या है?',
    mr: 'सांगलीमध्ये सोयाबीनचा दर काय आहे?',
  },
  {
    id: 'q-rates-4',
    categoryId: 'RATES',
    commodity: 'Soybean',
    en: 'Show me the last 7 days of Soybean rates in Sangli.',
    hi: 'सांगली में पिछले 7 दिनों का सोयाबीन का रेट दिखाएं।',
    mr: 'सांगलीतील गेल्या ७ दिवसांचे सोयाबीनचे दर दाखवा.',
  },
  {
    id: 'q-rates-5',
    categoryId: 'RATES',
    commodity: 'Soybean',
    en: "Compare today's Soybean rates across locations.",
    hi: 'विभिन्न स्थानों पर आज के सोयाबीन भाव की तुलना करें।',
    mr: 'वेगवेगळ्या ठिकाणांवरील आजच्या सोयाबीन दरांची तुलना करा.',
  },
  {
    id: 'q-rates-6',
    categoryId: 'RATES',
    commodity: 'Soybean',
    en: 'Show me the highest and lowest Soybean rates for the last 7 days.',
    hi: 'पिछले 7 दिनों में सोयाबीन का उच्चतम और न्यूनतम भाव दिखाएं।',
    mr: 'गेल्या ७ दिवसांतील सोयाबीनचे कमाल व किमान दर दाखवा.',
  },
  {
    id: 'q-rates-7',
    categoryId: 'RATES',
    commodity: 'Soybean',
    en: 'Plot a chart of Soybean rates for the last 7 days.',
    hi: 'पिछले 7 दिनों के सोयाबीन भाव का चार्ट बनाएं।',
    mr: 'गेल्या ७ दिवसांच्या सोयाबीन दरांचा चार्ट काढा.',
  },
  {
    id: 'q-rates-8',
    categoryId: 'RATES',
    commodity: 'Soybean',
    en: 'Compare Soybean rates for the last 7 days with the previous 7 days.',
    hi: 'पिछले 7 दिनों के सोयाबीन भाव की तुलना उससे पिछले 7 दिनों से करें।',
    mr: 'गेल्या ७ दिवसांच्या सोयाबीन दरांची मागील ७ दिवसांशी तुलना करा.',
  },
  {
    id: 'q-rates-9',
    categoryId: 'RATES',
    commodity: 'Soybean',
    en: 'Show me all actual Soybean records.',
    hi: 'सोयाबीन के सभी वास्तविक रिकॉर्ड दिखाएं।',
    mr: 'सोयाबीनच्या सर्व प्रत्यक्ष नोंदी दाखवा.',
  },

  // 2. Buyer Demands
  {
    id: 'q-demands-1',
    categoryId: 'DEMANDS',
    commodity: 'Soybean',
    en: "What is today's demand for Soybean?",
    hi: 'आज सोयाबीन की मांग क्या है?',
    mr: 'आज सोयाबीनची मागणी काय आहे?',
  },
  {
    id: 'q-demands-2',
    categoryId: 'DEMANDS',
    commodity: 'Soybean',
    en: 'Today what is the demand for Soybean?',
    hi: 'सोयाबीन के लिए आज की मांग क्या है?',
    mr: 'सोयाबीनसाठी आजची मागणी काय आहे?',
  },
  {
    id: 'q-demands-3',
    categoryId: 'DEMANDS',
    en: 'Show me all active buyer demands.',
    hi: 'सभी सक्रिय खरीदार मांग दिखाएं।',
    mr: 'सर्व सक्रिय खरेदीदार मागण्या दाखवा.',
  },
  {
    id: 'q-demands-4',
    categoryId: 'DEMANDS',
    en: 'How many buyer demands are registered in Sangli?',
    hi: 'सांगली में कितनी खरीदार मांगें दर्ज हैं?',
    mr: 'सांगलीमध्ये किती खरेदीदार मागण्या नोंदवल्या आहेत?',
  },
  {
    id: 'q-demands-5',
    categoryId: 'DEMANDS',
    en: 'Show me the requested quantity for each commodity.',
    hi: 'प्रत्येक कमोडिटी के लिए मांगी गई मात्रा दिखाएं।',
    mr: 'प्रत्येक शेतमालासाठी मागितलेले प्रमाण दाखवा.',
  },
  {
    id: 'q-demands-6',
    categoryId: 'DEMANDS',
    en: 'Show me buyer demands with their target prices.',
    hi: 'खरीदार मांगें उनके लक्षित मूल्यों के साथ दिखाएं।',
    mr: 'खरेदीदार मागण्या त्यांच्या अपेक्षित दरांसह दाखवा.',
  },
  {
    id: 'q-demands-7',
    categoryId: 'DEMANDS',
    en: 'Which commodities have the highest buyer demand?',
    hi: 'किस कमोडिटी में सबसे अधिक खरीदार मांग है?',
    mr: 'कोणत्या शेतमालाला सर्वाधिक खरेदीदार मागणी आहे?',
  },
  {
    id: 'q-demands-8',
    categoryId: 'DEMANDS',
    en: 'Show me all pending buyer demands.',
    hi: 'सभी लंबित खरीदार मांगें दिखाएं।',
    mr: 'सर्व प्रलंबित खरेदीदार मागण्या दाखवा.',
  },
  {
    id: 'q-demands-9',
    categoryId: 'DEMANDS',
    commodity: 'Soybean',
    en: 'Find supplies matching active Soybean demands.',
    hi: 'सक्रिय सोयाबीन मांग से मेल खाने वाली आपूर्ति खोजें।',
    mr: 'सक्रिय सोयाबीन मागणीशी जुळणारा पुरवठा शोधा.',
  },

  // 3. Supplies & Inventory
  {
    id: 'q-supplies-1',
    categoryId: 'SUPPLIES',
    en: 'Show me all active supplies.',
    hi: 'सभी सक्रिय आपूर्ति दिखाएं।',
    mr: 'सर्व सक्रिय पुरवठा नोंदी दाखवा.',
  },
  {
    id: 'q-supplies-2',
    categoryId: 'SUPPLIES',
    commodity: 'Soybean',
    en: 'How much Soybean is available in the marketplace?',
    hi: 'बाजार में कितना सोयाबीन उपलब्ध है?',
    mr: 'बाजारपेठेत किती सोयाबीन उपलब्ध आहे?',
  },
  {
    id: 'q-supplies-3',
    categoryId: 'SUPPLIES',
    commodity: 'Soybean',
    en: 'Show me Soybean supplies in Sangli.',
    hi: 'सांगली में सोयाबीन की आपूर्ति दिखाएं।',
    mr: 'सांगलीतील सोयाबीन पुरवठा दाखवा.',
  },
  {
    id: 'q-supplies-4',
    categoryId: 'SUPPLIES',
    en: 'Which suppliers have the largest available quantities?',
    hi: 'किन विक्रेताओं के पास सबसे अधिक उपलब्ध मात्रा है?',
    mr: 'कोणत्या पुरवठादारांकडे सर्वाधिक उपलब्ध प्रमाण आहे?',
  },
  {
    id: 'q-supplies-5',
    categoryId: 'SUPPLIES',
    en: 'Show me supplies with prices below ₹4,500 per quintal.',
    hi: '₹4,500 प्रति क्विंटल से कम दर वाली आपूर्ति दिखाएं।',
    mr: '₹४,५०० प्रति क्विंटलपेक्षा कमी दर असलेला पुरवठा दाखवा.',
  },
  {
    id: 'q-supplies-6',
    categoryId: 'SUPPLIES',
    en: 'Which supplies have expired validity dates?',
    hi: 'किन आपूर्तियों की वैधता समाप्त हो चुकी है?',
    mr: 'कोणत्या पुरवठ्याची मुदत संपलेली आहे?',
  },
  {
    id: 'q-supplies-7',
    categoryId: 'SUPPLIES',
    en: 'Show me supplies expiring in the next 7 days.',
    hi: 'अगले 7 दिनों में समाप्त होने वाली आपूर्ति दिखाएं।',
    mr: 'पुढील ७ दिवसांत मुदत संपणारा पुरवठा दाखवा.',
  },
  {
    id: 'q-supplies-8',
    categoryId: 'SUPPLIES',
    en: 'Compare available quantities across commodities.',
    hi: 'विभिन्न कमोडिटी की उपलब्ध मात्रा की तुलना करें।',
    mr: 'विविध शेतमालाच्या उपलब्ध प्रमाणाची तुलना करा.',
  },

  // 4. Bids & Negotiations
  {
    id: 'q-bids-1',
    categoryId: 'BIDS',
    en: 'How many bids are currently active?',
    hi: 'वर्तमान में कितनी बोलियां सक्रिय हैं?',
    mr: 'सध्या किती बोली सक्रिय आहेत?',
  },
  {
    id: 'q-bids-2',
    categoryId: 'BIDS',
    en: 'Show me all pending bids.',
    hi: 'सभी लंबित बोलियां दिखाएं।',
    mr: 'सर्व प्रलंबित बोली दाखवा.',
  },
  {
    id: 'q-bids-3',
    categoryId: 'BIDS',
    commodity: 'Soybean',
    en: 'What is the highest bid for Soybean?',
    hi: 'सोयाबीन के लिए उच्चतम बोली क्या है?',
    mr: 'सोयाबीनसाठी सर्वाधिक बोली कोणती आहे?',
  },
  {
    id: 'q-bids-4',
    categoryId: 'BIDS',
    en: 'Show me ongoing negotiations.',
    hi: 'चालू बातचीत (नेगोशिएशन) दिखाएं।',
    mr: 'सुरू असलेल्या वाटाघाटी दाखवा.',
  },
  {
    id: 'q-bids-5',
    categoryId: 'BIDS',
    en: 'Show me the latest negotiation rounds.',
    hi: 'नवीनतम बातचीत के दौर दिखाएं।',
    mr: 'वाटाघाटीच्या ताज्या फेऱ्या दाखवा.',
  },
  {
    id: 'q-bids-6',
    categoryId: 'BIDS',
    en: 'Which negotiations are awaiting a response?',
    hi: 'किन बातचीतों में प्रतिक्रिया की प्रतीक्षा है?',
    mr: 'कोणत्या वाटाघाटी प्रतिसादाच्या प्रतीक्षेत आहेत?',
  },
  {
    id: 'q-bids-7',
    categoryId: 'BIDS',
    en: 'Show me the bid price and asking price for each available listing.',
    hi: 'प्रत्येक उपलब्ध लिस्टिंग के लिए बोली दर और मांग दर दिखाएं।',
    mr: 'प्रत्येक उपलब्ध पुरवठ्यासाठी बोली दर व अपेक्षित दर दाखवा.',
  },

  // 5. Deals & Contracts
  {
    id: 'q-deals-1',
    categoryId: 'DEALS',
    en: 'How many deals are currently registered?',
    hi: 'वर्तमान में कितने सौदे पंजीकृत हैं?',
    mr: 'सध्या किती सौदे नोंदणीकृत आहेत?',
  },
  {
    id: 'q-deals-2',
    categoryId: 'DEALS',
    en: 'Show me all active deals.',
    hi: 'सभी सक्रिय सौदे दिखाएं।',
    mr: 'सर्व सक्रिय सौदे दाखवा.',
  },
  {
    id: 'q-deals-3',
    categoryId: 'DEALS',
    en: 'Show me pending contracts.',
    hi: 'लंबित अनुबंध (कॉन्ट्रैक्ट) दिखाएं।',
    mr: 'प्रलंबित करार दाखवा.',
  },
  {
    id: 'q-deals-4',
    categoryId: 'DEALS',
    en: 'Show me completed contracts.',
    hi: 'पूरे हो चुके अनुबंध दिखाएं।',
    mr: 'पूर्ण झालेले करार दाखवा.',
  },
  {
    id: 'q-deals-5',
    categoryId: 'DEALS',
    en: 'Show me the commodity, quantity, and agreed price for each deal.',
    hi: 'प्रत्येक सौदे के लिए कमोडिटी, मात्रा और तय मूल्य दिखाएं।',
    mr: 'प्रत्येक सौद्यासाठी शेतमाल, प्रमाण आणि ठरलेला दर दाखवा.',
  },
  {
    id: 'q-deals-6',
    categoryId: 'DEALS',
    en: 'Which contracts are still pending?',
    hi: 'कौन से अनुबंध अभी भी लंबित हैं?',
    mr: 'कोणते करार अजूनही प्रलंबित आहेत?',
  },
  {
    id: 'q-deals-7',
    categoryId: 'DEALS',
    en: 'Summarize deal and contract statuses.',
    hi: 'सौदे और अनुबंध की स्थिति का सारांश दें।',
    mr: 'सौदे आणि करारांच्या स्थितीचा सारांश द्या.',
  },

  // 6. Parties & Marketplace Overview
  {
    id: 'q-parties-1',
    categoryId: 'PARTIES',
    en: 'How many parties are registered in the marketplace?',
    hi: 'बाजार में कितनी पार्टियां पंजीकृत हैं?',
    mr: 'बाजारपेठेत किती व्यापारी नोंदणीकृत आहेत?',
  },
  {
    id: 'q-parties-2',
    categoryId: 'PARTIES',
    en: 'Which parties are registered in Sangli?',
    hi: 'सांगली में कौन सी पार्टियां पंजीकृत हैं?',
    mr: 'सांगलीत कोणते व्यापारी नोंदणीकृत आहेत?',
  },
  {
    id: 'q-parties-3',
    categoryId: 'PARTIES',
    en: 'Show me all registered buyers.',
    hi: 'सभी पंजीकृत खरीदार दिखाएं।',
    mr: 'सर्व नोंदणीकृत खरेदीदार दाखवा.',
  },
  {
    id: 'q-parties-4',
    categoryId: 'PARTIES',
    en: 'Show me all registered suppliers.',
    hi: 'सभी पंजीकृत विक्रेता दिखाएं।',
    mr: 'सर्व नोंदणीकृत पुरवठादार दाखवा.',
  },
  {
    id: 'q-parties-5',
    categoryId: 'PARTIES',
    en: 'Show me the party details and locations.',
    hi: 'पार्टियों का विवरण और उनके स्थान दिखाएं।',
    mr: 'व्यापाऱ्यांचे तपशील आणि ठिकाणे दाखवा.',
  },
  {
    id: 'q-parties-6',
    categoryId: 'PARTIES',
    en: 'How many buyers and suppliers are active?',
    hi: 'कितने खरीदार और विक्रेता सक्रिय हैं?',
    mr: 'किती खरेदीदार आणि पुरवठादार सक्रिय आहेत?',
  },
  {
    id: 'q-parties-7',
    categoryId: 'PARTIES',
    en: 'Show me the commodities with the most available supplies.',
    hi: 'सबसे अधिक उपलब्ध आपूर्ति वाली कमोडिटीज दिखाएं।',
    mr: 'सर्वाधिक उपलब्ध पुरवठा असलेला शेतमाल दाखवा.',
  },
  {
    id: 'q-parties-8',
    categoryId: 'PARTIES',
    en: "Give me a summary of today's marketplace activity.",
    hi: 'मुझे आज की बाजार गतिविधि का सारांश दें।',
    mr: 'आजच्या बाजारपेठ हालचालींचा सारांश द्या.',
  },

  // 7. WhatsApp Diagnostics
  {
    id: 'q-whatsapp-1',
    categoryId: 'WHATSAPP',
    en: 'Is WhatsApp configured and connected?',
    hi: 'क्या व्हाट्सएप कॉन्फ़िगर और कनेक्टेड है?',
    mr: 'व्हॉट्सॲप कॉन्फिगर आणि कनेक्ट केलेले आहे का?',
  },
  {
    id: 'q-whatsapp-2',
    categoryId: 'WHATSAPP',
    en: 'Is WhatsApp enabled or disabled?',
    hi: 'क्या व्हाट्सएप सक्षम या अक्षम है?',
    mr: 'व्हॉट्सॲप सक्षम की अक्षम आहे?',
  },
  {
    id: 'q-whatsapp-3',
    categoryId: 'WHATSAPP',
    en: 'Test the WhatsApp connection.',
    hi: 'व्हाट्सएप कनेक्शन का परीक्षण करें।',
    mr: 'व्हॉट्सॲप कनेक्शन तपासा.',
  },
  {
    id: 'q-whatsapp-4',
    categoryId: 'WHATSAPP',
    en: 'Show me the WhatsApp configuration status.',
    hi: 'व्हाट्सएप कॉन्फ़िगरेशन स्थिति दिखाएं।',
    mr: 'व्हॉट्सॲप कॉन्फिगरेशन स्थिती दाखवा.',
  },
  {
    id: 'q-whatsapp-5',
    categoryId: 'WHATSAPP',
    en: 'Is the WhatsApp provider currently available?',
    hi: 'क्या व्हाट्सएप प्रदाता वर्तमान में उपलब्ध है?',
    mr: 'व्हॉट्सॲप प्रदाता सध्या उपलब्ध आहे का?',
  },
  {
    id: 'q-whatsapp-6',
    categoryId: 'WHATSAPP',
    en: 'Why did the WhatsApp connection test fail?',
    hi: 'व्हाट्सएप कनेक्शन परीक्षण विफल क्यों हुआ?',
    mr: 'व्हॉट्सॲप कनेक्शन चाचणी का अयशस्वी झाली?',
  },
  {
    id: 'q-whatsapp-7',
    categoryId: 'WHATSAPP',
    en: 'Are WhatsApp message delivery records available?',
    hi: 'क्या व्हाट्सएप संदेश वितरण रिकॉर्ड उपलब्ध हैं?',
    mr: 'व्हॉट्सॲप संदेश वितरण नोंदी उपलब्ध आहेत का?',
  },

  // 8. Wheat Specific Questions
  {
    id: 'q-rates-wheat-1',
    categoryId: 'RATES',
    commodity: 'Wheat',
    en: 'Show me the Wheat rate for the last 7 days.',
    hi: 'पिछले 7 दिनों का गेहूं का रेट दिखाएं।',
    mr: 'गेल्या ७ दिवसांचे गव्हाचे दर दाखवा.',
  },
  {
    id: 'q-rates-wheat-2',
    categoryId: 'RATES',
    commodity: 'Wheat',
    en: "What is today's Wheat rate?",
    hi: 'गेहूं का आज का भाव क्या है?',
    mr: 'गव्हाचा आजचा दर काय आहे?',
  },
  {
    id: 'q-rates-wheat-3',
    categoryId: 'RATES',
    commodity: 'Wheat',
    en: 'What is the Wheat rate in Pune?',
    hi: 'पुणे में गेहूं का भाव क्या है?',
    mr: 'पुण्यात गव्हाचा दर काय आहे?',
  },
  {
    id: 'q-rates-wheat-4',
    categoryId: 'RATES',
    commodity: 'Wheat',
    en: 'Plot a chart of Wheat rates for the last 7 days.',
    hi: 'पिछले 7 दिनों के गेहूं भाव का चार्ट बनाएं।',
    mr: 'गेल्या ७ दिवसांच्या गव्हाच्या दरांचा चार्ट काढा.',
  },
  {
    id: 'q-rates-wheat-5',
    categoryId: 'RATES',
    commodity: 'Wheat',
    en: 'Show me all actual Wheat records.',
    hi: 'गेहूं के सभी वास्तविक रिकॉर्ड दिखाएं।',
    mr: 'गव्हाच्या सर्व प्रत्यक्ष नोंदी दाखवा.',
  },
  {
    id: 'q-demands-wheat-1',
    categoryId: 'DEMANDS',
    commodity: 'Wheat',
    en: "What is today's demand for Wheat?",
    hi: 'आज गेहूं की मांग क्या है?',
    mr: 'आज गव्हाची मागणी काय आहे?',
  },
  {
    id: 'q-supplies-wheat-1',
    categoryId: 'SUPPLIES',
    commodity: 'Wheat',
    en: 'How much Wheat is available in the marketplace?',
    hi: 'बाजार में कितना गेहूं उपलब्ध है?',
    mr: 'बाजारपेठेत किती गहू उपलब्ध आहे?',
  },
  {
    id: 'q-supplies-wheat-2',
    categoryId: 'SUPPLIES',
    commodity: 'Wheat',
    en: 'Show me Wheat supplies.',
    hi: 'गेहूं की आपूर्ति दिखाएं।',
    mr: 'गहू पुरवठा दाखवा.',
  },
  {
    id: 'q-bids-wheat-1',
    categoryId: 'BIDS',
    commodity: 'Wheat',
    en: 'What is the highest bid for Wheat?',
    hi: 'गेहूं के लिए उच्चतम बोली क्या है?',
    mr: 'गव्हासाठी सर्वाधिक बोली कोणती आहे?',
  },

  // 9. Maize Specific Questions
  {
    id: 'q-rates-maize-1',
    categoryId: 'RATES',
    commodity: 'Maize',
    en: 'Show me the Maize rate for the last 7 days.',
    hi: 'पिछले 7 दिनों का मक्का का रेट दिखाएं।',
    mr: 'गेल्या ७ दिवसांचे मक्याचे दर दाखवा.',
  },
  {
    id: 'q-rates-maize-2',
    categoryId: 'RATES',
    commodity: 'Maize',
    en: "What is today's Maize rate?",
    hi: 'मक्का का आज का भाव क्या है?',
    mr: 'मक्याचा आजचा दर काय आहे?',
  },
  {
    id: 'q-rates-maize-3',
    categoryId: 'RATES',
    commodity: 'Maize',
    en: 'What is the Maize rate in Sangli?',
    hi: 'सांगली में मक्का का भाव क्या है?',
    mr: 'सांगलीमध्ये मक्याचा दर काय आहे?',
  },
  {
    id: 'q-rates-maize-4',
    categoryId: 'RATES',
    commodity: 'Maize',
    en: 'Plot a chart of Maize rates for the last 7 days.',
    hi: 'पिछले 7 दिनों के मक्का भाव का चार्ट बनाएं।',
    mr: 'गेल्या ७ दिवसांच्या मक्याच्या दरांचा चार्ट काढा.',
  },
  {
    id: 'q-rates-maize-5',
    categoryId: 'RATES',
    commodity: 'Maize',
    en: 'Show me all actual Maize records.',
    hi: 'मक्का के सभी वास्तविक रिकॉर्ड दिखाएं।',
    mr: 'मक्याच्या सर्व प्रत्यक्ष नोंदी दाखवा.',
  },
  {
    id: 'q-demands-maize-1',
    categoryId: 'DEMANDS',
    commodity: 'Maize',
    en: "What is today's demand for Maize?",
    hi: 'आज मक्का की मांग क्या है?',
    mr: 'आज मक्याची मागणी काय आहे?',
  },
  {
    id: 'q-supplies-maize-1',
    categoryId: 'SUPPLIES',
    commodity: 'Maize',
    en: 'How much Maize is available in the marketplace?',
    hi: 'बाजार में कितना मक्का उपलब्ध है?',
    mr: 'बाजारपेठेत किती मका उपलब्ध आहे?',
  },
  {
    id: 'q-supplies-maize-2',
    categoryId: 'SUPPLIES',
    commodity: 'Maize',
    en: 'Show me Maize supplies in Sangli.',
    hi: 'सांगली में मक्का की आपूर्ति दिखाएं।',
    mr: 'सांगलीतील मका पुरवठा दाखवा.',
  },
  {
    id: 'q-bids-maize-1',
    categoryId: 'BIDS',
    commodity: 'Maize',
    en: 'What is the highest bid for Maize?',
    hi: 'मक्का के लिए उच्चतम बोली क्या है?',
    mr: 'मक्यासाठी सर्वाधिक बोली कोणती आहे?',
  },

  // 10. MaizeW Specific Questions
  {
    id: 'q-rates-maizew-1',
    categoryId: 'RATES',
    commodity: 'MaizeW',
    en: 'Show me the MaizeW rate for the last 7 days.',
    hi: 'पिछले 7 दिनों का मक्काW का रेट दिखाएं।',
    mr: 'गेल्या ७ दिवसांचे MaizeW चे दर दाखवा.',
  },
  {
    id: 'q-rates-maizew-2',
    categoryId: 'RATES',
    commodity: 'MaizeW',
    en: "What is today's MaizeW rate?",
    hi: 'मक्काW का आज का भाव क्या है?',
    mr: 'MaizeW चा आजचा दर काय आहे?',
  },
  {
    id: 'q-rates-maizew-3',
    categoryId: 'RATES',
    commodity: 'MaizeW',
    en: 'What is the MaizeW rate in Kolhapur?',
    hi: 'कोल्हापुर में मक्काW का भाव क्या है?',
    mr: 'कोल्हापूरमध्ये MaizeW चा दर काय आहे?',
  },
  {
    id: 'q-rates-maizew-4',
    categoryId: 'RATES',
    commodity: 'MaizeW',
    en: 'Plot a chart of MaizeW rates for the last 7 days.',
    hi: 'पिछले 7 दिनों के मक्काW भाव का चार्ट बनाएं।',
    mr: 'गेल्या ७ दिवसांच्या MaizeW दरांचा चार्ट काढा.',
  },
  {
    id: 'q-rates-maizew-5',
    categoryId: 'RATES',
    commodity: 'MaizeW',
    en: 'Show me all actual MaizeW records.',
    hi: 'मक्काW के सभी वास्तविक रिकॉर्ड दिखाएं।',
    mr: 'MaizeW च्या सर्व प्रत्यक्ष नोंदी दाखवा.',
  },
  {
    id: 'q-demands-maizew-1',
    categoryId: 'DEMANDS',
    commodity: 'MaizeW',
    en: "What is today's demand for MaizeW?",
    hi: 'आज मक्काW की मांग क्या है?',
    mr: 'आज MaizeW ची मागणी काय आहे?',
  },
  {
    id: 'q-supplies-maizew-1',
    categoryId: 'SUPPLIES',
    commodity: 'MaizeW',
    en: 'How much MaizeW is available in the marketplace?',
    hi: 'बाजार में कितना मक्काW उपलब्ध है?',
    mr: 'बाजारपेठेत किती MaizeW उपलब्ध आहे?',
  },
  {
    id: 'q-supplies-maizew-2',
    categoryId: 'SUPPLIES',
    commodity: 'MaizeW',
    en: 'Show me MaizeW supplies.',
    hi: 'मक्काW की आपूर्ति दिखाएं।',
    mr: 'MaizeW पुरवठा दाखवा.',
  },
  {
    id: 'q-bids-maizew-1',
    categoryId: 'BIDS',
    commodity: 'MaizeW',
    en: 'What is the highest bid for MaizeW?',
    hi: 'मक्काW के लिए उच्चतम बोली क्या है?',
    mr: 'MaizeW साठी सर्वाधिक बोली कोणती आहे?',
  },
];

export const LOCALIZED_SUGGESTED_QUESTIONS = {
  en: SUGGESTED_QUESTIONS_DATA.map((q) => q.en),
  hi: SUGGESTED_QUESTIONS_DATA.map((q) => q.hi),
  mr: SUGGESTED_QUESTIONS_DATA.map((q) => q.mr),
};

export const PROMPTS_SECTION_TITLES = {
  en: 'Suggested Natural Language Queries',
  hi: 'सुझाए गए प्रश्न:',
  mr: 'सुचवलेले प्रश्न:',
};

export const PROMPTS_SECTION_SUBTITLES = {
  en: '7 categories · 55 marketplace queries',
  hi: '7 श्रेणियां · 55 बाजारपेठ प्रश्न',
  mr: '7 वर्ग · 55 बाजारपेठेतील प्रश्न',
};

export const DEFAULT_SUGGESTED_PROMPTS = LOCALIZED_SUGGESTED_QUESTIONS.en;

/**
 * Translates a user-submitted question if it matches a known suggested question.
 */
export function translateQuestion(text, targetLang = 'en') {
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();
  const match = SUGGESTED_QUESTIONS_DATA.find((q) => {
    return q.en === trimmed || q.hi === trimmed || q.mr === trimmed;
  });
  if (match && match[targetLang]) {
    return match[targetLang];
  }
  return text;
}

/**
 * Detects the associated commodity for a question, or returns null if general/unassociated.
 */
export function getQuestionCommodity(question) {
  if (!question) return null;
  if (question.commodity) {
    const c = String(question.commodity).trim().toLowerCase();
    if (c === 'soybean') return 'Soybean';
    if (c === 'maizew') return 'MaizeW';
    if (c === 'maize') return 'Maize';
    if (c === 'wheat') return 'Wheat';
    return question.commodity;
  }
  const en = (question.en || '').toLowerCase();
  const hi = (question.hi || '').toLowerCase();
  const mr = (question.mr || '').toLowerCase();
  const combined = `${en} ${hi} ${mr}`;

  if (combined.includes('soybean') || combined.includes('सोयाबीन')) return 'Soybean';
  if (combined.includes('maizew')) return 'MaizeW';
  if (combined.includes('maize') || combined.includes('मका') || combined.includes('मक्का')) return 'Maize';
  if (combined.includes('wheat') || combined.includes('गेहूं') || combined.includes('गहू')) return 'Wheat';
  return null;
}

/**
 * Checks if question matches the targeted commodity filter (case-insensitive).
 */
export function matchesCommodity(item, targetCommodity) {
  if (!targetCommodity || targetCommodity === 'ALL') return true;
  const comm = getQuestionCommodity(item);
  return Boolean(comm && comm.toLowerCase() === targetCommodity.toLowerCase());
}

/**
 * Checks if question is a general admin question not tied to a single commodity.
 */
export function isGeneralQuestion(item) {
  return getQuestionCommodity(item) === null;
}

/**
 * Resolves questions for a category under the selected commodity:
 * returns commodity-specific questions if available, falling back to general admin questions.
 */
export function getQuestionsForCategory(catId, commodity) {
  const catQuestions = SUGGESTED_QUESTIONS_DATA.filter((q) => q.categoryId === catId);
  if (!commodity || commodity === 'ALL') {
    return catQuestions;
  }
  const specific = catQuestions.filter((q) => matchesCommodity(q, commodity));
  if (specific.length > 0) {
    return specific;
  }
  // Fallback to general admin questions in this category when no commodity-specific questions exist
  return catQuestions.filter(isGeneralQuestion);
}

export default function SuggestedPrompts({
  onSelectPrompt,
  disabled = false,
  language = 'en',
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const title = PROMPTS_SECTION_TITLES[language] || PROMPTS_SECTION_TITLES.en;
  const subtitle = PROMPTS_SECTION_SUBTITLES[language] || PROMPTS_SECTION_SUBTITLES.en;

  const allCategoryLabel = useMemo(() => {
    if (language === 'hi') return 'सभी';
    if (language === 'mr') return 'सर्व';
    return 'All';
  }, [language]);

  const searchPlaceholder = useMemo(() => {
    if (language === 'hi') return 'सुझाए गए प्रश्न खोजें...';
    if (language === 'mr') return 'सुचवलेले प्रश्न शोधा...';
    return 'Search suggested questions...';
  }, [language]);

  const noMatchesText = useMemo(() => {
    if (language === 'hi') return 'कोई मेल खाता प्रश्न नहीं मिला';
    if (language === 'mr') return 'कोणताही जुळणारा प्रश्न आढळला नाही';
    return 'No matching questions found';
  }, [language]);

  const clearFilterText = useMemo(() => {
    if (language === 'hi') return 'खोज हटाएं';
    if (language === 'mr') return 'शोध साफ करा';
    return 'Clear search';
  }, [language]);

  // Questions scoped by commodity (shows commodity-specific when available, general admin questions as fallback)
  const scopedByCommodity = useMemo(() => {
    if (selectedCommodity === 'ALL') {
      return SUGGESTED_QUESTIONS_DATA;
    }
    const list = [];
    SUGGESTED_CATEGORIES.forEach((cat) => {
      list.push(...getQuestionsForCategory(cat.id, selectedCommodity));
    });
    return list;
  }, [selectedCommodity]);

  // Filter questions based on category and search query within scopedByCommodity
  const filteredQuestions = useMemo(() => {
    const qLower = searchQuery.trim().toLowerCase();
    const base = selectedCategory === 'ALL'
      ? scopedByCommodity
      : scopedByCommodity.filter((item) => item.categoryId === selectedCategory);

    if (!qLower) {
      return base;
    }
    return base.filter((item) => {
      const text = (item[language] || item.en).toLowerCase();
      return text.includes(qLower);
    });
  }, [scopedByCommodity, selectedCategory, searchQuery, language]);

  // Group filtered questions by category when 'ALL' is selected
  const groupedByCategory = useMemo(() => {
    if (selectedCategory !== 'ALL') {
      const cat = SUGGESTED_CATEGORIES.find((c) => c.id === selectedCategory);
      return filteredQuestions.length > 0
        ? [
            {
              category: cat,
              questions: filteredQuestions,
            },
          ]
        : [];
    }

    const groups = [];
    SUGGESTED_CATEGORIES.forEach((cat) => {
      const items = filteredQuestions.filter((q) => q.categoryId === cat.id);
      if (items.length > 0) {
        groups.push({
          category: cat,
          questions: items,
        });
      }
    });
    return groups;
  }, [selectedCategory, filteredQuestions]);

  const handleSelect = (questionText) => {
    if (disabled) return;
    onSelectPrompt(questionText);
  };

  return (
    <div className={`suggested-prompts-container ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}>
      {/* 1. Compact Header Bar (Always visible directly above input) */}
      <button
        type="button"
        className="suggested-prompts-bar-btn"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        aria-label={`${title} (${isExpanded ? 'Collapse' : 'Expand'})`}
      >
        <div className="prompts-bar-left">
          <span className="prompts-bar-icon">
            <LightbulbIcon size={16} />
          </span>
          <div className="prompts-bar-titles">
            <span className="prompts-bar-title">{title}</span>
            <span className="prompts-bar-subtitle">{subtitle}</span>
          </div>
        </div>

        <div className="prompts-bar-right">
          <span className="prompts-toggle-pill">
            {isExpanded ? (
              <>
                <span>{language === 'hi' ? 'छिपाएं' : language === 'mr' ? 'बंद करा' : 'Collapse'}</span>
                <ChevronUpIcon size={14} />
              </>
            ) : (
              <>
                <span>{language === 'hi' ? 'देखें' : language === 'mr' ? 'पहा' : 'Explore'}</span>
                <ChevronDownIcon size={14} />
              </>
            )}
          </span>
        </div>
      </button>

      {/* 2. Expanded Panel (Vertically scrollable, limits max height so chat input stays visible) */}
      {isExpanded && (
        <div className="suggested-prompts-panel" data-testid="suggested-prompts-expanded">
          {/* Search bar inside panel */}
          <div className="prompts-search-wrapper">
            <div className="modern-search-box">
              <SearchIcon size={15} className="search-icon" />
              <input
                type="text"
                className="modern-search-input"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={searchPlaceholder}
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label={clearFilterText}
                >
                  <CloseIcon size={13} />
                </button>
              )}
            </div>

            <div className="prompts-commodity-filter">
              <label
                htmlFor="prompts-commodity-select"
                className="prompts-commodity-label"
              >
                Commodity
              </label>
              <select
                id="prompts-commodity-select"
                className="prompts-commodity-select"
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                aria-label="Commodity"
              >
                <option value="ALL">All Commodities</option>
                <option value="Soybean">Soybean</option>
                <option value="MAIZE">MAIZE</option>
                <option value="MAIZEW">MAIZEW</option>
                <option value="Wheat">Wheat</option>
              </select>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="prompts-category-chips" role="tablist" aria-label="Query Categories">
            <button
              type="button"
              className={`category-chip ${selectedCategory === 'ALL' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('ALL')}
            >
              <span>{allCategoryLabel}</span>
              <span className="category-chip-count">{scopedByCommodity.length}</span>
            </button>

            {SUGGESTED_CATEGORIES.map((cat) => {
              const catTitle = cat.title[language] || cat.title.en;
              const count = scopedByCommodity.filter((q) => q.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className="cat-chip-icon">{cat.icon}</span>
                  <span>{catTitle}</span>
                  <span className="category-chip-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Vertically scrollable questions list */}
          <div className="prompts-scroll-area">
            {groupedByCategory.length === 0 ? (
              <div className="prompts-empty-state">
                <span className="empty-state-icon">🔍</span>
                <span className="empty-state-text">{noMatchesText}</span>
                {searchQuery && (
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    onClick={() => setSearchQuery('')}
                  >
                    {clearFilterText}
                  </button>
                )}
                {selectedCommodity !== 'ALL' && (
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    onClick={() => setSelectedCommodity('ALL')}
                    style={{ marginLeft: searchQuery ? '6px' : '0' }}
                  >
                    All Commodities
                  </button>
                )}
              </div>
            ) : (
              groupedByCategory.map((grp) => {
                const catTitle = grp.category?.title[language] || grp.category?.title.en;
                return (
                  <div key={grp.category?.id || 'group'} className="prompt-category-group">
                    {selectedCategory === 'ALL' && (
                      <div className="prompt-group-header">
                        <span className="prompt-group-icon">{grp.category?.icon}</span>
                        <span className="prompt-group-title">{catTitle}</span>
                        <span className="prompt-group-badge">{grp.questions.length}</span>
                      </div>
                    )}
                    <div className="prompt-chips-grid">
                      {grp.questions.map((item) => {
                        const questionText = item[language] || item.en;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className="prompt-chip expanded-chip"
                            onClick={() => handleSelect(questionText)}
                            disabled={disabled}
                            title={questionText}
                          >
                            <span className="prompt-chip-bullet">💬</span>
                            <span className="prompt-chip-text">{questionText}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
