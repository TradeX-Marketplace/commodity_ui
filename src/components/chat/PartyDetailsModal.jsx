import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon, RefreshIcon, AlertCircleIcon } from '../common/Icons';
import { fetchPartyById, fetchPartyByCode } from '../../services/api';

const MODAL_I18N = {
  en: {
    title: 'Party Details',
    close: 'Close',
    loading: 'Loading party details...',
    notFoundTitle: 'Party Not Found',
    notFoundDesc: (code) => `No registered party found for identifier "${code}".`,
    errorTitle: 'Error Loading Party',
    retry: 'Retry',
    tabs: {
      overview: 'Overview',
      contact: 'Contact',
      business: 'Business',
      activity: 'Activity',
      additional: 'Additional Info',
    },
    fields: {
      partyCode: 'Party ID',
      companyName: 'Company / Party Name',
      roles: 'Party Type / Roles',
      status: 'Status',
      activeStatus: 'Active Status',
      isDeleted: 'Soft Deleted',
      registrationDate: 'Registration Date',
      lastUpdated: 'Last Updated',
      city: 'City',
      state: 'State',
      country: 'Country',
      postalCode: 'Postal Code',
      address: 'Registered Address',
      plantLocation: 'Plant / Facility Location',
      taluka: 'Taluka',
      contactPerson: 'Contact Person',
      phone: 'Phone Number',
      alternatePhone: 'Alternate Phone',
      email: 'Email Address',
      gstin: 'GSTIN / Tax ID',
      pan: 'PAN Number',
      registrationType: 'Registration Type',
      website: 'Website',
      description: 'Business Description',
      relatedBids: 'Related Bids',
      relatedSupplies: 'Related Supplies',
      relatedDemands: 'Related Demands',
      relatedDeals: 'Related Deals',
    },
    activityNote:
      'Activity records (bids, supplies, demands, deals) are not directly linked to party profiles in the current TradeX API.',
    supportedNote: 'Counts and records come from existing marketplace APIs. Only supported data is displayed.',
    notAvailable: 'Not available',
    unassigned: 'Unassigned',
    active: 'Active',
    inactive: 'Inactive',
  },
  hi: {
    title: 'पार्टी विवरण',
    close: 'बंद करें',
    loading: 'पार्टी विवरण लोड हो रहा है...',
    notFoundTitle: 'पार्टी नहीं मिली',
    notFoundDesc: (code) => `पहचानकर्ता "${code}" के लिए कोई पंजीकृत पार्टी नहीं मिली।`,
    errorTitle: 'पार्टी लोड करने में त्रुटि',
    retry: 'पुनः प्रयास करें',
    tabs: {
      overview: 'अवलोकन',
      contact: 'संपर्क',
      business: 'व्यवसाय',
      activity: 'गतिविधि',
      additional: 'अतिरिक्त जानकारी',
    },
    fields: {
      partyCode: 'पार्टी ID',
      companyName: 'कंपनी / पार्टी का नाम',
      roles: 'पार्टी प्रकार / भूमिकाएँ',
      status: 'स्थिति',
      activeStatus: 'सक्रिय स्थिति',
      isDeleted: 'हटाया गया',
      registrationDate: 'पंजीकरण दिनांक',
      lastUpdated: 'अंतिम अद्यतन',
      city: 'शहर',
      state: 'राज्य',
      country: 'देश',
      postalCode: 'पिन कोड',
      address: 'पंजीकृत पता',
      plantLocation: 'संयंत्र / मिल स्थान',
      taluka: 'तालुका',
      contactPerson: 'संपर्क व्यक्ति',
      phone: 'फ़ोन नंबर',
      alternatePhone: 'वैकल्पिक फ़ोन',
      email: 'ईमेल पता',
      gstin: 'GSTIN / कर ID',
      pan: 'PAN नंबर',
      registrationType: 'पंजीकरण प्रकार',
      website: 'वेबसाइट',
      description: 'व्यावसायिक विवरण',
      relatedBids: 'संबंधित बोलियाँ (Bids)',
      relatedSupplies: 'संबंधित आपूर्ति (Supplies)',
      relatedDemands: 'संबंधित मांग (Demands)',
      relatedDeals: 'संबंधित सौदे (Deals)',
    },
    activityNote:
      'वर्तमान TradeX API में पार्टी प्रोफ़ाइल से गतिविधि रिकॉर्ड (बोलियां, आपूर्ति, मांग, सौदे) सीधे जुड़े नहीं हैं।',
    supportedNote: 'आंकड़े और रिकॉर्ड मौजूदा मार्केटप्लेस API से प्राप्त होते हैं। केवल समर्थित डेटा ही प्रदर्शित है।',
    notAvailable: 'उपलब्ध नहीं',
    unassigned: 'अवर्गीकृत (Unassigned)',
    active: 'सक्रिय (Active)',
    inactive: 'निष्क्रिय (Inactive)',
  },
  mr: {
    title: 'पार्टी तपशील',
    close: 'बंद करा',
    loading: 'पार्टी तपशील लोड होत आहेत...',
    notFoundTitle: 'पार्टी आढळली नाही',
    notFoundDesc: (code) => `"${code}" या ओळखकर्त्यासाठी कोणतीही नोंदणीकृत पार्टी आढळली नाही.`,
    errorTitle: 'पार्टी लोड करताना त्रुटी आली',
    retry: 'पुन्हा प्रयत्न करा',
    tabs: {
      overview: 'विहंगावलोकन',
      contact: 'संपर्क',
      business: 'व्यवसाय',
      activity: 'हालचाली / कार्य',
      additional: 'अतिरिक्त माहिती',
    },
    fields: {
      partyCode: 'पार्टी ID',
      companyName: 'कंपनी / पार्टीचे नाव',
      roles: 'पार्टी प्रकार / भूमिका',
      status: 'स्थिती',
      activeStatus: 'सक्रिय स्थिती',
      isDeleted: 'हटवलेली',
      registrationDate: 'नोंदणी तारीख',
      lastUpdated: 'शेवटचे अद्यतन',
      city: 'शहर',
      state: 'राज्य',
      country: 'देश',
      postalCode: 'पिन कोड',
      address: 'नोंदणीकृत पत्ता',
      plantLocation: 'प्रकल्प / कारखाना ठिकाण',
      taluka: 'तालुका',
      contactPerson: 'संपर्क व्यक्ती',
      phone: 'फोन नंबर',
      alternatePhone: 'पर्यायी फोन',
      email: 'ईमेल पत्ता',
      gstin: 'GSTIN / कर ID',
      pan: 'PAN क्रमांक',
      registrationType: 'नोंदणी प्रकार',
      website: 'वेबसाईट',
      description: 'व्यवसाय वर्णन',
      relatedBids: 'संबंधित निविदा (Bids)',
      relatedSupplies: 'संबंधित पुरवठा (Supplies)',
      relatedDemands: 'संबंधित मागणी (Demands)',
      relatedDeals: 'संबंधित सौदे (Deals)',
    },
    activityNote:
      'सध्याच्या TradeX API मध्ये पार्टी प्रोफाईलशी निविदा, पुरवठा, मागणी किंवा सौदे थेट जोडलेले नाहीत.',
    supportedNote: 'आकडे आणि नोंदी विद्यमान मार्केटप्लेस API कडून मिळतात. केवळ समर्थित माहिती दर्शविली आहे.',
    notAvailable: 'उपलब्ध नाही',
    unassigned: 'अवर्गीकृत (Unassigned)',
    active: 'सक्रिय (Active)',
    inactive: 'निष्क्रिय (Inactive)',
  },
};

export default function PartyDetailsModal({
  party: initialParty = null,
  partyIdOrCode = null,
  isOpen = false,
  onClose,
  lang = 'en',
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [partyData, setPartyData] = useState(initialParty);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const i18n = MODAL_I18N[lang] || MODAL_I18N.en;

  const loadPartyDetails = useCallback(async () => {
    const target = partyIdOrCode || initialParty?.partyCode || initialParty?.id;
    if (!target) return;

    // If we already have full party details with business fields, use them directly
    if (initialParty && (initialParty.gstin || initialParty.address || initialParty.phone)) {
      setPartyData(initialParty);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let data = null;
      if (typeof target === 'number' || /^\d+$/.test(String(target))) {
        data = await fetchPartyById(Number(target));
      } else {
        data = await fetchPartyByCode(String(target));
      }

      // Handle ApiResponse wrapper if present { success: true, data: PartyDTO }
      const resolvedParty = data?.data || data?.party || data;
      if (resolvedParty && (resolvedParty.partyCode || resolvedParty.companyName || resolvedParty.id)) {
        setPartyData(resolvedParty);
      } else if (initialParty) {
        setPartyData(initialParty);
      } else {
        setError(i18n.notFoundDesc(target));
      }
    } catch (err) {
      // If direct API call fails, fall back to initialParty if provided
      if (initialParty) {
        setPartyData(initialParty);
      } else {
        setError(err.message || i18n.errorTitle);
      }
    } finally {
      setIsLoading(false);
    }
  }, [partyIdOrCode, initialParty, i18n]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
      loadPartyDetails();
    } else {
      setPartyData(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, loadPartyDetails]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const party = partyData || initialParty || {};
  const partyCodeDisplay = party.partyCode || (party.id ? `ID: ${party.id}` : '-');
  const companyNameDisplay = party.companyName || party.name || i18n.title;
  const statusDisplay = party.status || (party.active ? 'ACTIVE' : 'INACTIVE');
  const isActive = party.active !== false && String(statusDisplay).toUpperCase() === 'ACTIVE';

  const rolesArray = Array.isArray(party.roles)
    ? party.roles
    : typeof party.roles === 'string' && party.roles
    ? [party.roles]
    : [];

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return String(dateStr).replace('T', ' ');
  };

  return (
    <div
      className="order-modal-backdrop party-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="party-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="order-details-modal party-details-modal">
        {/* Modal Header */}
        <div className="modal-header party-modal-header">
          <div className="party-modal-header-info">
            <div className="party-modal-header-top">
              <span className="party-modal-code-pill font-mono">{partyCodeDisplay}</span>
              <span className={`party-status-badge ${isActive ? 'status-active' : 'status-inactive'}`}>
                {isActive ? i18n.active : i18n.inactive}
              </span>
              {rolesArray.map((r, i) => (
                <span key={i} className="party-role-tag">
                  {r}
                </span>
              ))}
            </div>
            <h3 id="party-modal-title" className="modal-title party-modal-company-title">
              {companyNameDisplay}
            </h3>
          </div>
          <button
            type="button"
            className="modal-close-icon"
            onClick={onClose}
            aria-label={i18n.close}
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="party-modal-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            className={`party-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            {i18n.tabs.overview}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'contact'}
            className={`party-tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            {i18n.tabs.contact}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'business'}
            className={`party-tab-btn ${activeTab === 'business' ? 'active' : ''}`}
            onClick={() => setActiveTab('business')}
          >
            {i18n.tabs.business}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'activity'}
            className={`party-tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            {i18n.tabs.activity}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'additional'}
            className={`party-tab-btn ${activeTab === 'additional' ? 'active' : ''}`}
            onClick={() => setActiveTab('additional')}
          >
            {i18n.tabs.additional}
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body party-modal-body">
          {isLoading && (
            <div className="order-loading-overlay">
              <div className="order-spinner" />
              <span>{i18n.loading}</span>
            </div>
          )}

          {!isLoading && error && !partyData && (
            <div className="party-modal-state error">
              <AlertCircleIcon size={28} className="text-red-500" />
              <div className="party-state-title">{i18n.errorTitle}</div>
              <div className="party-state-desc">{error}</div>
              <button
                type="button"
                className="btn btn-secondary party-retry-btn"
                onClick={loadPartyDetails}
              >
                <RefreshIcon size={14} />
                <span>{i18n.retry}</span>
              </button>
            </div>
          )}

          {!isLoading && (!error || partyData) && (
            <div className="party-tab-content">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="modal-details-grid">
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.partyCode}:</span>
                    <span className="field-value font-mono font-bold">{partyCodeDisplay}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.companyName}:</span>
                    <span className="field-value font-bold">{companyNameDisplay}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.roles}:</span>
                    <span className="field-value">
                      {rolesArray.length > 0 ? rolesArray.join(', ') : i18n.unassigned}
                    </span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.status}:</span>
                    <span className="field-value">
                      <span className={`party-status-badge ${isActive ? 'status-active' : 'status-inactive'}`}>
                        {isActive ? i18n.active : i18n.inactive}
                      </span>
                    </span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.registrationDate}:</span>
                    <span className="field-value font-mono">{formatDate(party.createdAt)}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.city}:</span>
                    <span className="field-value">{party.city || '-'}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.state}:</span>
                    <span className="field-value">{party.state || '-'}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.country}:</span>
                    <span className="field-value">{party.country || 'India'}</span>
                  </div>
                </div>
              )}

              {/* TAB 2: CONTACT */}
              {activeTab === 'contact' && (
                <div className="modal-details-grid">
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.contactPerson}:</span>
                    <span className="field-value font-bold">{party.contactPerson || '-'}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.phone}:</span>
                    <span className="field-value">{party.phone || '-'}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.alternatePhone}:</span>
                    <span className="field-value">{party.alternatePhone || '-'}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.email}:</span>
                    <span className="field-value">{party.email || '-'}</span>
                  </div>
                  <div className="modal-field-group col-span-2">
                    <span className="field-label">{i18n.fields.address}:</span>
                    <span className="field-value">{party.address || '-'}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.taluka}:</span>
                    <span className="field-value">{party.taluka || '-'}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.plantLocation}:</span>
                    <span className="field-value">{party.plantLocation || '-'}</span>
                  </div>
                </div>
              )}

              {/* TAB 3: BUSINESS */}
              {activeTab === 'business' && (
                <div className="modal-details-grid">
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.gstin}:</span>
                    <span className="field-value font-mono font-bold">{party.gstin || i18n.notAvailable}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.pan}:</span>
                    <span className="field-value font-mono font-bold">{party.pan || i18n.notAvailable}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.registrationType}:</span>
                    <span className="field-value">{party.registrationType || 'ADMIN_CREATED'}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.website}:</span>
                    <span className="field-value">
                      {party.website ? (
                        <a href={party.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          {party.website}
                        </a>
                      ) : (
                        '-'
                      )}
                    </span>
                  </div>
                  <div className="modal-field-group col-span-2">
                    <span className="field-label">{i18n.fields.description}:</span>
                    <span className="field-value">{party.description || '-'}</span>
                  </div>
                </div>
              )}

              {/* TAB 4: ACTIVITY */}
              {activeTab === 'activity' && (
                <div className="party-activity-tab-content">
                  <div className="modal-details-grid mb-4">
                    <div className="modal-field-group">
                      <span className="field-label">{i18n.fields.registrationDate}:</span>
                      <span className="field-value font-mono">{formatDate(party.createdAt)}</span>
                    </div>
                    <div className="modal-field-group">
                      <span className="field-label">{i18n.fields.lastUpdated}:</span>
                      <span className="field-value font-mono">{formatDate(party.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="party-activity-cards-grid">
                    <div className="party-activity-card">
                      <div className="activity-card-label">{i18n.fields.relatedBids}</div>
                      <div className="activity-card-status">{i18n.notAvailable}</div>
                      <div className="activity-card-caption">GET /api/v1/parties</div>
                    </div>
                    <div className="party-activity-card">
                      <div className="activity-card-label">{i18n.fields.relatedSupplies}</div>
                      <div className="activity-card-status">{i18n.notAvailable}</div>
                      <div className="activity-card-caption">GET /api/v1/parties</div>
                    </div>
                    <div className="party-activity-card">
                      <div className="activity-card-label">{i18n.fields.relatedDemands}</div>
                      <div className="activity-card-status">{i18n.notAvailable}</div>
                      <div className="activity-card-caption">GET /api/v1/parties</div>
                    </div>
                    <div className="party-activity-card">
                      <div className="activity-card-label">{i18n.fields.relatedDeals}</div>
                      <div className="activity-card-status">{i18n.notAvailable}</div>
                      <div className="activity-card-caption">GET /api/v1/parties</div>
                    </div>
                  </div>

                  <div className="party-activity-disclaimer">
                    <span className="activity-info-dot" />
                    <span>{i18n.activityNote}</span>
                  </div>
                </div>
              )}

              {/* TAB 5: ADDITIONAL INFO */}
              {activeTab === 'additional' && (
                <div className="modal-details-grid">
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.activeStatus}:</span>
                    <span className="field-value font-mono">
                      {party.active !== undefined ? String(party.active) : 'true'}
                    </span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.isDeleted}:</span>
                    <span className="field-value font-mono">
                      {party.isDeleted !== undefined ? String(party.isDeleted) : 'false'}
                    </span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.taluka}:</span>
                    <span className="field-value">{party.taluka || '-'}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.plantLocation}:</span>
                    <span className="field-value">{party.plantLocation || '-'}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.postalCode}:</span>
                    <span className="field-value font-mono">{party.postalCode || '-'}</span>
                  </div>
                  <div className="modal-field-group">
                    <span className="field-label">{i18n.fields.country}:</span>
                    <span className="field-value">{party.country || 'India'}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer party-modal-footer">
          <span className="party-modal-footer-note">{i18n.supportedNote}</span>
          <button
            type="button"
            className="modal-action-btn party-close-btn"
            onClick={onClose}
          >
            {i18n.close}
          </button>
        </div>
      </div>
    </div>
  );
}
