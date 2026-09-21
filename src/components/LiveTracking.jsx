import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, CheckCircle2, Clock, Truck, ShieldCheck, AlertCircle, FileText, Barcode, Navigation, ArrowRight } from 'lucide-react';
import { apiFetch } from '../utils/api.js';

export default function LiveTracking({ onSelectLabel, onSelectReceipt }) {
  const [searchParams] = useSearchParams();
  const initialNumber = searchParams.get('number') || 'SL-9842104-US';
  
  const [trackingNumber, setTrackingNumber] = useState(initialNumber);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = async (numberToFetch) => {
    if (!numberToFetch) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/api/shipments/track/${encodeURIComponent(numberToFetch)}`);
      const data = await res.json();
      if (res.ok) {
        setShipment(data);
      } else {
        setError(data.error || 'Tracking number not found');
        setShipment(null);
      }
    } catch (err) {
      setError('Failed to connect to Swift Line tracking server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialNumber) {
      fetchTracking(initialNumber);
    }
  }, [initialNumber]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTracking(trackingNumber.trim());
  };

  const steps = [
    { key: 'ORDER_CREATED', label: 'Order Created' },
    { key: 'PICKED_UP', label: 'Picked Up' },
    { key: 'IN_TRANSIT', label: 'In Transit' },
    { key: 'CUSTOMS_HOLD', label: 'Customs Clearance' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'ORDER_CREATED': return 0;
      case 'PICKED_UP': return 1;
      case 'IN_TRANSIT': return 2;
      case 'CUSTOMS_HOLD': return 3;
      case 'OUT_FOR_DELIVERY': return 4;
      case 'DELIVERED': return 5;
      default: return 2;
    }
  };

  const currentStepIdx = shipment ? getStepIndex(shipment.status) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Search Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200/80 dark:border-slate-800">
        <h2 className="text-2xl font-extrabold text-[#0F2C59] dark:text-white font-display mb-2">
          Global Live Package Tracking
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Track your international express parcel in real-time via satellite telemetry.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter Tracking Number (e.g. SL-9842104-US)"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05D00] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Scanning Server...' : 'Track Now'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border-l-4 border-red-500 p-4 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-300 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {shipment && (
        <div className="space-y-8 animate-slide">
          
          {/* Main Status & Courier Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tracking Number</span>
              <h3 className="text-2xl font-extrabold text-[#0F2C59] dark:text-[#FF6B00] font-mono mt-1">
                {shipment.tracking_number}
              </h3>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 text-[#FF6B00] text-xs font-bold">
                <Truck className="w-3.5 h-3.5" />
                <span>{shipment.courier_partner} ({shipment.service_type})</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Location</span>
              <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>{shipment.current_location}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Route: {shipment.origin} ➔ {shipment.destination}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Delivery</span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 shrink-0" />
                <span>{new Date(shipment.estimated_delivery).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </p>
              
              {/* Quick Actions */}
              <div className="mt-3 flex items-center gap-2">
                {onSelectLabel && (
                  <button
                    onClick={() => onSelectLabel(shipment)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1"
                  >
                    <Barcode className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Print Label</span>
                  </button>
                )}
                {onSelectReceipt && (
                  <button
                    onClick={() => onSelectReceipt(shipment)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Receipt PDF</span>
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Progress Timeline Stepper */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-lg font-bold text-[#0F2C59] dark:text-white mb-6">Delivery Progress</h4>
            
            <div className="relative">
              <div className="overflow-x-auto pb-4">
                <div className="flex items-center justify-between min-w-[650px] relative">
                  
                  {/* Background Track Line */}
                  <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 -z-0" />
                  
                  {/* Active Track Line */}
                  <div
                    className="absolute top-5 left-8 h-1 bg-[#FF6B00] transition-all duration-700 -z-0"
                    style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                  />

                  {steps.map((st, idx) => {
                    const isPassed = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div key={st.key} className="flex flex-col items-center relative z-10 text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                          isPassed 
                            ? 'bg-[#FF6B00] text-white shadow-lg shadow-orange-500/30' 
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                        <span className={`text-xs font-bold mt-2.5 max-w-[90px] ${
                          isCurrent 
                            ? 'text-[#FF6B00]' 
                            : isPassed ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'
                        }`}>
                          {st.label}
                        </span>
                      </div>
                    );
                  })}

                </div>
              </div>
            </div>
          </div>

          {/* VISUAL MAP TRANSIT SIMULATOR */}
          <div className="bg-[#0F2C59] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#FF6B00]" />
                <h4 className="text-base font-bold">Interactive Cargo Route Radar</h4>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-bold">
                Live GPS Telemetry
              </span>
            </div>

            {/* Custom SVG Flight/Shipment Map Visualization */}
            <div className="relative h-48 bg-slate-900/80 rounded-2xl border border-slate-700 p-4 flex items-center justify-between">
              
              {/* Origin Marker */}
              <div className="flex flex-col items-center z-10">
                <div className="w-8 h-8 rounded-full bg-white text-[#0F2C59] font-extrabold flex items-center justify-center text-xs shadow-md">
                  {shipment.origin.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-bold mt-1 text-slate-300">{shipment.origin}</span>
                <span className="text-[10px] text-slate-400">Departure</span>
              </div>

              {/* Animated Cargo Jet Path */}
              <div className="flex-1 relative mx-6">
                <div className="border-b-2 border-dashed border-slate-600 w-full" />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 transform -translate-x-1/2 transition-all duration-1000 flex flex-col items-center"
                  style={{ left: `${Math.min(Math.max((currentStepIdx + 1) * 18, 15), 85)}%` }}
                >
                  <div className="w-9 h-9 rounded-full bg-[#FF6B00] text-white flex items-center justify-center shadow-lg shadow-orange-500/50 animate-bounce">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded mt-1 whitespace-nowrap border border-slate-700">
                    {shipment.current_location}
                  </span>
                </div>
              </div>

              {/* Destination Marker */}
              <div className="flex flex-col items-center z-10">
                <div className="w-8 h-8 rounded-full bg-[#FF6B00] text-white font-extrabold flex items-center justify-center text-xs shadow-md">
                  {shipment.destination.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-bold mt-1 text-slate-300">{shipment.destination}</span>
                <span className="text-[10px] text-slate-400">Destination</span>
              </div>

            </div>
          </div>

          {/* Checkpoints History Log */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-lg font-bold text-[#0F2C59] dark:text-white mb-4">Detailed Audit History</h4>
            <div className="space-y-4">
              {shipment.tracking_events.map((evt, index) => (
                <div key={evt.id || index} className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="p-2 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{evt.description}</span>
                      <span className="text-xs font-semibold text-slate-400">{new Date(evt.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Location: <strong className="text-slate-700 dark:text-slate-300">{evt.location}</strong> | Performed by: {evt.performed_by || 'System Scan'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
