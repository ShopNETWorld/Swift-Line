import React from 'react';
import LiveTracking from '../components/LiveTracking';

export default function TrackingPage({ onSelectLabel, onSelectReceipt }) {
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <LiveTracking onSelectLabel={onSelectLabel} onSelectReceipt={onSelectReceipt} />
    </div>
  );
}
