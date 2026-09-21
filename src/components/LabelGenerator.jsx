import React, { useRef } from 'react';
import { Printer, Download, X, Barcode, ShieldCheck, CheckCircle } from 'lucide-react';

export default function LabelGenerator({ shipment, onClose }) {
  const printRef = useRef(null);

  if (!shipment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-700 my-8">
        
        {/* Modal Controls Bar */}
        <div className="bg-[#0F2C59] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="font-bold text-sm">Official Airway Bill & Shipping Label Generator</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#FF6B00] hover:bg-[#E05D00] text-white text-xs font-bold flex items-center gap-1 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print 4x6" Label</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable ISO 4x6 Standard Shipping Label Box */}
        <div className="p-6 overflow-x-auto flex justify-center bg-slate-100 dark:bg-slate-950">
          
          <div
            ref={printRef}
            className="w-[420px] bg-white text-black p-5 border-4 border-black font-sans shadow-xl text-xs space-y-3 print:w-full print:m-0 print:border-2"
          >
            
            {/* Header: Carrier Name & Service Class */}
            <div className="flex justify-between items-center border-b-4 border-black pb-2">
              <div>
                <h2 className="font-black text-xl tracking-tighter text-[#0F2C59]">SWIFT LINE EXPRESS</h2>
                <p className="text-[10px] font-bold tracking-widest text-slate-600">WORLDWIDE COURIER NETWORK</p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-black text-white font-black text-lg px-2 py-0.5 uppercase">
                  {shipment.service_type || 'EXPRESS AIR'}
                </span>
                <p className="text-[9px] font-bold mt-0.5">PRIORITY AWB</p>
              </div>
            </div>

            {/* Tracking Number Barcode Visual */}
            <div className="text-center py-2 border-b-2 border-black space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider block">AIRWAY BILL / TRACKING NO</span>
              
              {/* CSS Scannable Barcode Simulation */}
              <div className="h-16 barcode-lines w-full mx-auto rounded-sm border border-slate-300" />

              <p className="font-mono font-black text-lg tracking-widest pt-1">
                {shipment.tracking_number}
              </p>
            </div>

            {/* Grid 2 Columns: FROM vs TO */}
            <div className="grid grid-cols-2 gap-3 border-b-2 border-black pb-3">
              {/* FROM / SENDER */}
              <div className="pr-2 border-r border-slate-300">
                <span className="font-black uppercase text-[10px] text-slate-500 block">1. SHIP FROM:</span>
                <p className="font-bold text-sm leading-tight">{shipment.sender_name}</p>
                <p className="text-[11px] leading-tight text-slate-700">{shipment.sender_address}</p>
                <p className="font-bold text-xs mt-1 uppercase text-[#0F2C59]">{shipment.sender_country}</p>
                <p className="text-[10px] text-slate-500">Ph: {shipment.sender_phone}</p>
              </div>

              {/* TO / RECIPIENT */}
              <div className="pl-1">
                <span className="font-black uppercase text-[10px] text-[#FF6B00] block">2. DELIVER TO:</span>
                <p className="font-black text-sm leading-tight">{shipment.recipient_name}</p>
                <p className="text-[11px] font-semibold leading-tight text-slate-800">{shipment.recipient_address}</p>
                <p className="font-black text-sm mt-1 uppercase text-black">{shipment.recipient_country}</p>
                <p className="text-[10px] text-slate-600">Ph: {shipment.recipient_phone}</p>
              </div>
            </div>

            {/* Logistics Info Bar */}
            <div className="grid grid-cols-4 gap-1 border-b-2 border-black pb-2 text-[10px] text-center font-bold">
              <div className="border-r border-slate-300">
                <span className="text-slate-500 block text-[9px]">WEIGHT</span>
                <span>{shipment.weight_kg} KG</span>
              </div>
              <div className="border-r border-slate-300">
                <span className="text-slate-500 block text-[9px]">DIMENSIONS</span>
                <span>{shipment.dimensions_cm || '30x20x15'}</span>
              </div>
              <div className="border-r border-slate-300">
                <span className="text-slate-500 block text-[9px]">CARRIER</span>
                <span className="text-[#0F2C59] font-black">{shipment.courier_partner}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">VALUE</span>
                <span>${shipment.declared_value_usd || '100'} USD</span>
              </div>
            </div>

            {/* Bottom QR Code & Customs Declaration Statement */}
            <div className="flex items-center justify-between pt-1">
              <div className="space-y-0.5 max-w-[280px]">
                <p className="text-[9px] font-bold text-slate-600">CUSTOMS DECLARATION & SAFETY STAMP:</p>
                <p className="text-[8px] text-slate-500 leading-tight">
                  Contents inspected & cleared for global air transport in accordance with IATA safety standards.
                </p>
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 pt-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>PRE-PAID EXPORT DUTY</span>
                </div>
              </div>

              {/* QR Code Placeholder Graphic */}
              <div className="w-16 h-16 border-2 border-black p-1 flex flex-col items-center justify-center bg-slate-50">
                <div className="w-full h-full bg-slate-900 text-white font-mono text-[8px] flex items-center justify-center text-center leading-none p-0.5 font-bold">
                  SWIFT QR SCAN
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
