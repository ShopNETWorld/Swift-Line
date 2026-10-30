import React, { useEffect } from 'react';
import { Printer, X, CheckCircle, FileText } from 'lucide-react';

export default function ReceiptGenerator({ shipment, onClose }) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!shipment) return null;

  const handlePrint = () => {
    window.print();
  };

  const baseCost = 25.00;
  const weightFee = Math.max(0, (shipment.weight_kg - 1) * 4.50);
  const insuranceFee = 15.00;
  const totalCost = shipment.shipping_cost_usd || (baseCost + weightFee + insuranceFee);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto print-modal-overlay"
    >
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 my-6 print-modal-card">
        
        {/* Sticky Header with Prominent Close & Print Buttons */}
        <div className="sticky top-0 z-20 bg-[#0F2C59] text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-700 shadow-sm print-controls-bar">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="font-bold text-sm">Payment Receipt & Invoice</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#FF6B00] hover:bg-[#E05D00] text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 shadow transition-all"
              title="Close"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Invoice Printable Document Box */}
        <div className="p-6 bg-slate-100 dark:bg-slate-950/80 flex justify-center print:p-0 print:bg-white">
          <div className="printable-area w-full max-w-[500px] bg-white text-slate-900 p-6 rounded-xl border border-slate-200 shadow-sm text-xs space-y-5 print:border-none print:shadow-none print:p-0 print:m-0">
            
            {/* Top Brand Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-xl font-black text-[#0F2C59] font-display">SWIFT LINE EXPRESS</h1>
                <p className="text-slate-500 text-[10px]">742 Fifth Avenue, Suite 12, New York, NY 10019</p>
                <p className="text-slate-500 text-[10px]">Tax ID: US-9948210-SL | support@myswiftline.com</p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  PAID IN FULL
                </span>
                <p className="text-xs font-bold text-slate-800 mt-1.5">INV-{shipment.tracking_number}</p>
                <p className="text-[10px] text-slate-500">{new Date(shipment.created_at || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Billed To vs Shipment Info */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200/60 text-[11px]">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[9px] block mb-0.5">Billed To (Sender):</span>
                <p className="font-bold text-slate-900">{shipment.sender_name}</p>
                <p className="text-slate-600 truncate">{shipment.sender_email || 'N/A'}</p>
                <p className="text-slate-600">{shipment.sender_address}, {shipment.sender_country}</p>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[9px] block mb-0.5">Shipment Summary:</span>
                <p className="font-bold text-slate-900">Tracking: <span className="text-[#FF6B00]">{shipment.tracking_number}</span></p>
                <p className="text-slate-600">Carrier: {shipment.courier_partner}</p>
                <p className="text-slate-600">{shipment.weight_kg} kg ➔ {shipment.recipient_country}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 text-[9px] uppercase">
                  <th className="py-1.5">Description</th>
                  <th className="py-1.5 text-center">Qty / Weight</th>
                  <th className="py-1.5 text-right">Amount (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr>
                  <td className="py-2.5">Global Express Base Rate ({shipment.origin} ➔ {shipment.destination})</td>
                  <td className="py-2.5 text-center">1 Flat</td>
                  <td className="py-2.5 text-right font-semibold">${baseCost.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2.5">Weight Surcharge ({shipment.weight_kg} kg @ $4.50/kg)</td>
                  <td className="py-2.5 text-center">{shipment.weight_kg} kg</td>
                  <td className="py-2.5 text-right font-semibold">${weightFee.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-2.5">Customs Clearance & Telemetry Guarantee</td>
                  <td className="py-2.5 text-center">Included</td>
                  <td className="py-2.5 text-right font-semibold">${insuranceFee.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Total Summary Box */}
            <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Payment Confirmed via Secure Gateway</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Total Paid</span>
                <span className="text-xl font-black text-[#0F2C59]">${totalCost.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Footer note */}
            <div className="pt-3 text-center text-slate-400 text-[9px] border-t border-slate-100">
              Thank you for shipping with Swift Line Worldwide Courier. Support: support@myswiftline.com.
            </div>

          </div>
        </div>

        {/* Bottom Footer Bar with Explicit Cancel Button */}
        <div className="bg-slate-50 dark:bg-slate-800 px-5 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3 print-footer-bar">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
          >
            Cancel / Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E05D00] text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>
        </div>

      </div>
    </div>
  );
}
