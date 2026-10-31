import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, Barcode, CheckCircle } from 'lucide-react';

export default function LabelGenerator({ shipment, onClose }) {
  const printRef = useRef(null);

  // Close on Escape key press and manage print-modal-open class on body
  useEffect(() => {
    document.body.classList.add('print-modal-open');
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('print-modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!shipment) return null;

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto print-modal-overlay"
    >
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 my-6 print-modal-card flex flex-col max-h-[92vh]">
        
        {/* Header with Title and Prominent Close Button */}
        <div className="flex-shrink-0 bg-[#0F2C59] text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-700 shadow-sm print-controls-bar">
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="font-bold text-sm">Shipping Label Preview</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 shadow transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Printable ISO Standard Shipping Label Container */}
        <div className="flex-1 p-6 overflow-y-auto overflow-x-auto flex justify-center bg-slate-100 dark:bg-slate-950/80 print:p-0 print:bg-white">
          
          <div
            ref={printRef}
            className="printable-area w-[400px] bg-white text-black p-5 border-2 border-black font-sans shadow-md text-xs space-y-3 print:w-full print:max-w-[400px] print:shadow-none print:m-0"
          >
            
            {/* Header: Carrier Name & Service Class */}
            <div className="flex justify-between items-center border-b-2 border-black pb-2">
              <div>
                <h2 className="font-black text-lg tracking-tight text-[#0F2C59]">SWIFT LINE EXPRESS</h2>
                <p className="text-[9px] font-bold tracking-widest text-slate-600">WORLDWIDE COURIER NETWORK</p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-black text-white font-bold text-sm px-2 py-0.5 uppercase rounded-sm">
                  {shipment.service_type || 'EXPRESS AIR'}
                </span>
                <p className="text-[9px] font-bold mt-0.5 text-slate-600">PRIORITY AWB</p>
              </div>
            </div>

            {/* Tracking Number Barcode Visual */}
            <div className="text-center py-2 border-b-2 border-black space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 block">
                AIRWAY BILL / TRACKING NO
              </span>
              
              {/* Crisp SVG Barcode for Guaranteed Print Output */}
              <div className="py-1 flex justify-center">
                <svg className="w-64 h-12" viewBox="0 0 200 40" preserveAspectRatio="none">
                  {Array.from({ length: 48 }).map((_, i) => {
                    const width = (i % 3 === 0 || i % 7 === 0) ? 3 : 1.5;
                    const x = i * 4.1;
                    return (
                      <rect
                        key={i}
                        x={x}
                        y="0"
                        width={width}
                        height="40"
                        fill="#000000"
                      />
                    );
                  })}
                </svg>
              </div>

              <p className="font-mono font-black text-base tracking-widest pt-0.5">
                {shipment.tracking_number}
              </p>
            </div>

            {/* Grid 2 Columns: FROM vs TO */}
            <div className="grid grid-cols-2 gap-3 border-b-2 border-black pb-3">
              {/* FROM / SENDER */}
              <div className="pr-2 border-r border-slate-300">
                <span className="font-bold uppercase text-[9px] text-slate-500 block mb-0.5">1. SHIP FROM:</span>
                <p className="font-bold text-xs leading-snug">{shipment.sender_name}</p>
                <p className="text-[10px] leading-snug text-slate-700">{shipment.sender_address}</p>
                <p className="font-bold text-xs mt-1 uppercase text-[#0F2C59]">{shipment.sender_country}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">Ph: {shipment.sender_phone || 'N/A'}</p>
              </div>

              {/* TO / RECIPIENT */}
              <div className="pl-1">
                <span className="font-bold uppercase text-[9px] text-[#FF6B00] block mb-0.5">2. DELIVER TO:</span>
                <p className="font-bold text-xs leading-snug">{shipment.recipient_name}</p>
                <p className="text-[10px] leading-snug text-slate-800">{shipment.recipient_address}</p>
                <p className="font-bold text-xs mt-1 uppercase text-black">{shipment.recipient_country}</p>
                <p className="text-[9px] text-slate-600 mt-0.5">Ph: {shipment.recipient_phone || 'N/A'}</p>
              </div>
            </div>

            {/* Logistics Info Bar */}
            <div className="grid grid-cols-4 gap-1 border-b-2 border-black pb-2 text-[9px] text-center font-bold">
              <div className="border-r border-slate-300">
                <span className="text-slate-500 block text-[8px]">WEIGHT</span>
                <span>{shipment.weight_kg} KG</span>
              </div>
              <div className="border-r border-slate-300">
                <span className="text-slate-500 block text-[8px]">DIMENSIONS</span>
                <span>{shipment.dimensions_cm || '30x20x15'}</span>
              </div>
              <div className="border-r border-slate-300">
                <span className="text-slate-500 block text-[8px]">CARRIER</span>
                <span className="text-[#0F2C59] font-bold">{shipment.courier_partner}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[8px]">VALUE</span>
                <span>${shipment.declared_value_usd || '100'} USD</span>
              </div>
            </div>

            {/* Bottom Customs Statement */}
            <div className="flex items-center justify-between pt-1">
              <div className="space-y-0.5 max-w-[270px]">
                <p className="text-[8px] font-bold text-slate-700">CUSTOMS DECLARATION & SAFETY STAMP:</p>
                <p className="text-[8px] text-slate-500 leading-tight">
                  Contents inspected & cleared for global air transport in accordance with IATA safety standards.
                </p>
                <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-700 pt-0.5">
                  <CheckCircle className="w-3 h-3" />
                  <span>PRE-PAID EXPORT DUTY</span>
                </div>
              </div>

              {/* QR Code Stamp Box */}
              <div className="w-14 h-14 border border-black p-1 flex flex-col items-center justify-center bg-slate-50 text-center">
                <span className="font-mono text-[7px] font-bold text-slate-800 leading-tight">
                  SWIFT<br />LINE<br />AWB
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Footer Bar with Prominent Print Button for Easy Access */}
        <div className="flex-shrink-0 bg-slate-50 dark:bg-slate-800 px-5 py-3.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 print-footer-bar">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel / Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05D00] active:scale-95 text-white text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Label</span>
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
