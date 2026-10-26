import React from 'react';
import { UsersIcon, SparklesIcon } from '../common/Icons';

const COUNT_I18N = {
  en: {
    assistant: 'Commodity AI Assistant',
    headerSub: 'ENGLISH · Marketplace data',
    title: 'Registered Parties',
    totalPartiesLabel: 'Total parties',
    activePartiesLabel: 'Active parties',
    caption: 'From marketplace records',
    actionPrompt: 'Choose an action to explore the registered parties.',
    notAvailable: 'Not available',
    footerNote: 'Counts and records come from existing marketplace APIs. Only supported data is displayed.',
    actions: [
      {
        id: 'list_all',
        title: 'List all parties',
        desc: 'View comprehensive registered parties directory with sorting & search',
        prompt: 'List all registered parties',
      },
      {
        id: 'buyers_sellers',
        title: 'Buyers vs sellers',
        desc: 'Inspect participant roles, manufacturers, and merchant distribution',
        prompt: 'How many buyers are registered?',
      },
      {
        id: 'by_location',
        title: 'Parties by location',
        desc: 'Explore parties registered in Sangli and other major trading clusters',
        prompt: 'Which parties are registered in Sangli?',
      },
      {
        id: 'party_details',
        title: 'Party details',
        desc: 'Examine complete profile, contact & business data for party PRT-0001',
        prompt: 'Show the details of party PRT-0001',
      },
    ],
  },
  hi: {
    assistant: 'कमोडिटी AI सहायक',
    headerSub: 'HINDI · मार्केटप्लेस डेटा',
    title: 'पंजीकृत पार्टियां (Registered Parties)',
    totalPartiesLabel: 'कुल पार्टियां',
    activePartiesLabel: 'सक्रिय पार्टियां',
    caption: 'मार्केटप्लेस रिकॉर्ड से',
    actionPrompt: 'पंजीकृत पार्टियों का पता लगाने के लिए एक क्रिया चुनें।',
    notAvailable: 'उपलब्ध नहीं',
    footerNote: 'आंकड़े और रिकॉर्ड मौजूदा मार्केटप्लेस API से प्राप्त होते हैं। केवल समर्थित डेटा ही प्रदर्शित है।',
    actions: [
      {
        id: 'list_all',
        title: 'सभी पार्टियों की सूची',
        desc: 'खोज और फ़िल्टर के साथ संपूर्ण पंजीकृत पार्टी निर्देशिका देखें',
        prompt: 'List all registered parties',
      },
      {
        id: 'buyers_sellers',
        title: 'खरीदार बनाम विक्रेता',
        desc: 'व्यापारी, उत्पादक और खरीदार भूमिकाओं का वितरण देखें',
        prompt: 'How many buyers are registered?',
      },
      {
        id: 'by_location',
        title: 'स्थान के अनुसार पार्टियां',
        desc: 'सांगली और अन्य प्रमुख व्यापारिक केंद्रों में पंजीकृत पार्टियां देखें',
        prompt: 'Which parties are registered in Sangli?',
      },
      {
        id: 'party_details',
        title: 'पार्टी विवरण',
        desc: 'पार्टी PRT-0001 की पूरी प्रोफ़ाइल, संपर्क और व्यावसायिक डेटा देखें',
        prompt: 'Show the details of party PRT-0001',
      },
    ],
  },
  mr: {
    assistant: 'कमोडिटी AI सहाय्यक',
    headerSub: 'MARATHI · मार्केटप्लेस डेटा',
    title: 'नोंदणीकृत पार्ट्या (Registered Parties)',
    totalPartiesLabel: 'एकूण पार्ट्या',
    activePartiesLabel: 'सक्रिय पार्ट्या',
    caption: 'मार्केटप्लेस नोंदींवरून',
    actionPrompt: 'नोंदणीकृत पार्ट्या पाहण्यासाठी एक क्रिया निवडा.',
    notAvailable: 'उपलब्ध नाही',
    footerNote: 'आकडे आणि नोंदी विद्यमान मार्केटप्लेस API कडून मिळतात. केवळ समर्थित माहिती दर्शविली आहे.',
    actions: [
      {
        id: 'list_all',
        title: 'सर्व पार्ट्यांची यादी',
        desc: 'शोध आणि क्रमवारीसह संपूर्ण नोंदणीकृत पार्ट्यांची डिरेक्टरी पहा',
        prompt: 'List all registered parties',
      },
      {
        id: 'buyers_sellers',
        title: 'खरेदीदार विरुद्ध विक्रेता',
        desc: 'व्यापारी, उत्पादक आणि सहभागी भूमिकांचे वर्गीकरण तपासा',
        prompt: 'How many buyers are registered?',
      },
      {
        id: 'by_location',
        title: 'ठिकाणानुसार पार्ट्या',
        desc: 'सांगली आणि इतर प्रमुख बाजारपेठांमध्ये नोंदणीकृत पार्ट्या शोधा',
        prompt: 'Which parties are registered in Sangli?',
      },
      {
        id: 'party_details',
        title: 'पार्टी तपशील',
        desc: 'PRT-0001 पार्टीची संपूर्ण माहिती, संपर्क आणि व्यवसाय तपशील तपासा',
        prompt: 'Show the details of party PRT-0001',
      },
    ],
  },
};

/**
 * Extracts total and active count from message object or text content.
 */
function extractPartyCounts(message) {
  let total = null;
  let active = null;

  if (Array.isArray(message?.parties) && message.parties.length > 0) {
    total = message.parties.length;
    const activeParties = message.parties.filter(
      (p) => p.active !== false && String(p.status || '').toUpperCase() !== 'INACTIVE'
    );
    active = activeParties.length;
    return { total, active };
  }

  // Parse from content if parties array is not directly attached
  const content = message?.content || '';
  const totalMatch =
    content.match(/\*\*(\d+)\s*(?:registered parties|नोंदणीकृत पार्ट्या|पंजीकृत पार्टियां)\*\*/i) ||
    content.match(/(?:एकूण|कुल|total of)\s*\*\*(\d+)\*\*/i) ||
    content.match(/\b(\d+)\s+(?:registered parties|parties registered)\b/i);

  if (totalMatch) {
    total = parseInt(totalMatch[1], 10);
  }

  const activeMatch =
    content.match(/\*\*(\d+)\s*(?:सक्रिय पार्ट्या|सक्रिय पार्टियां|active registered parties|active parties)\*\*/i) ||
    content.match(/(?:सक्रिय|active):\s*(\d+)/i);

  if (activeMatch) {
    active = parseInt(activeMatch[1], 10);
  } else if (total !== null && content.toLowerCase().includes('active')) {
    // Check if content indicates all parties are active
    if (
      content.includes('all') &&
      (content.includes('active') || content.includes('सक्रिय'))
    ) {
      active = total;
    }
  }

  return { total, active };
}

export default function PartyCountCard({
  message,
  lang = 'en',
  onSendMessage,
}) {
  const i18n = COUNT_I18N[lang] || COUNT_I18N.en;
  const { total, active } = extractPartyCounts(message);

  const displayTotal = total !== null && !isNaN(total) ? total : i18n.notAvailable;
  const displayActive = active !== null && !isNaN(active) ? active : i18n.notAvailable;

  const handleActionClick = (prompt) => {
    if (typeof onSendMessage === 'function') {
      onSendMessage(prompt);
    }
  };

  return (
    <div className="party-count-container">
      {/* 1. Header */}
      <div className="party-count-header">
        <div className="party-header-branding">
          <SparklesIcon size={16} className="text-primary" />
          <span className="party-header-title">{i18n.assistant}</span>
        </div>
        <div className="party-header-sub">{i18n.headerSub}</div>
      </div>

      {/* 2. Response Title */}
      <div className="party-response-title-wrap">
        <h4 className="party-response-title">
          <UsersIcon size={18} className="party-title-icon" />
          <span>{i18n.title}</span>
        </h4>
      </div>

      {/* 3. Responsive KPI Cards */}
      <div className="party-kpi-grid">
        <div className="party-kpi-card card-total">
          <div className="kpi-label">{i18n.totalPartiesLabel}</div>
          <div className="kpi-value">{displayTotal}</div>
          <div className="kpi-caption">{i18n.caption}</div>
        </div>

        <div className="party-kpi-card card-active">
          <div className="kpi-label">{i18n.activePartiesLabel}</div>
          <div className="kpi-value">{displayActive}</div>
          <div className="kpi-caption">{i18n.caption}</div>
        </div>
      </div>

      {/* 4. Action Prompts Prompt */}
      <div className="party-action-prompt-text">{i18n.actionPrompt}</div>

      {/* 5. Four Interactive Action Cards */}
      <div className="party-action-cards-grid">
        {i18n.actions.map((act) => (
          <button
            key={act.id}
            type="button"
            className="party-action-card-btn"
            onClick={() => handleActionClick(act.prompt)}
          >
            <div className="action-card-top">
              <span className="action-card-title">{act.title}</span>
              <span className="action-card-arrow">&rarr;</span>
            </div>
            <div className="action-card-desc">{act.desc}</div>
          </button>
        ))}
      </div>

      {/* 6. Footer Note */}
      <div className="party-card-footer-note">
        <span className="party-info-icon">&#9432;</span>
        <span>{i18n.footerNote}</span>
      </div>
    </div>
  );
}
