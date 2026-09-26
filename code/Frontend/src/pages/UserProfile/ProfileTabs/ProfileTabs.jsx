import React from 'react';
import './ProfileTabs.css';

const TAB_LABELS = {
  POSTS: 'Posts',
  PRODUCTS: 'Products',
  FOOTPRINT: 'My Purchases',
  SAVED: 'Saved',
};

function ProfileTabs({
  activeTab = 'POSTS',
  onTabChange,
  tabs = ['POSTS', 'PRODUCTS', 'FOOTPRINT'],
}) {
  const handleClick = (tab) => {
    if (typeof onTabChange === 'function') {
      onTabChange(tab);
    }
  };

  return (
    <div className="lum-tabs" role="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        const displayLabel = TAB_LABELS[tab] || tab;

        return (
          <span
            key={tab}
            className={`lum-tab ${isActive ? 'active' : ''}`}
            onClick={() => handleClick(tab)}
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick(tab);
              }
            }}
          >
            {displayLabel}
          </span>
        );
      })}
    </div>
  );
}

export default ProfileTabs;