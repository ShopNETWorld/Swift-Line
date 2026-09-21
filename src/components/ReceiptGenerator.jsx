import React from 'react';
import { Printer, Download, X, CheckCircle, ShieldCheck, DollarSign, FileText } from 'lucide-react';

export default function ReceiptGenerator({ shipment, onClose }) {
  if (!shipment) return null;

  const handlePrint = () => {
    window.print();
  };

  const baseCost = 25.00;
  const weightFee = Math.max(0, (shipment.weight_kg - 1) * 4.50);
  const insuranceFee = 15.00;
  const totalCost = shipment.shipping_cost_usd || (baseCost + weightFee + insuranceFee);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-700 my-8">
        
        {/* Header Bar */}
        <div className="bg-[#0F2C59] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="font-bold text-sm">Official Payment Receipt & Tax Invoice</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#FF6B00] hover:bg-[#E05D00] text-white text-xs font-bold flex items-center gap-1 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Document Box */}
        <div className="p-8 space-y-6 text-xs bg-white text-slate-900 font-sans print:p-0">
          
          {/* Top Brand Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-2xl font-black text-[#0F2C59] font-display">SWIFT LINE WORLDWIDE COURIER</h1>
              <p className="text-slate-500 font-medium">742 Fifth Avenue, Suite 12, New York, NY 10019</p>
              <p className="text-slate-500 font-medium">Tax ID: US-9948210-SL | https://myswiftline.com</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                PAID IN FULL
              </span>
              <p className="text-sm font-bold text-slate-800 mt-2">INVOICE #: INV-{shipment.tracking_number}</p>
              <p className="text-slate-500">{new Date(shipment.created_at || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Billed To vs Shipment Info */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Billed To (Sender):</span>
              <p className="font-bold text-slate-900 text-sm">{shipment.sender_name}</p>
              <p className="text-slate-600">{shipment.sender_email}</p>
              <p className="text-slate-600">{shipment.sender_address}, {shipment.sender_country}</p>
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Shipment Summary:</span>
              <p className="font-bold text-slate-900">Tracking: <span className="text-[#FF6B00]">{shipment.tracking_number}</span></p>
              <p className="text-slate-600">Carrier: {shipment.courier_partner} ({shipment.service_type})</p>
              <p className="text-slate-600">Weight: {shipment.weight_kg} kg | Destination: {shipment.recipient_country}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-600 text-[10px] uppercase">
                <th className="py-2">Description</th>
                <th className="py-2 text-center">Qty / Weight</th>
                <th className="py-2 text-right">Amount (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              <tr>
                <td className="py-3">Global Express Courier Base Rate ({shipment.origin} ➔ {shipment.destination})</td>
                <td className="py-3 text-center">1 Flat Fee</td>
                <td className="py-3 text-right">${baseCost.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-3">Weight Surcharge ({shipment.weight_kg} kg @ $4.50/kg)</td>
                <td className="py-3 text-center">{shipment.weight_kg} kg</td>
                <td className="py-3 text-right">${weightFee.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-3">Global Customs Clearance & Telemetry Guarantee</td>
                <td className="py-3 text-center">Included</td>
                <td className="py-3 text-right">${insuranceFee.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Total Summary Box */}
          <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center">
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>Payment Processed via USD Secure Gateway</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 block uppercase">Total Amount Paid</span>
              <span className="text-2xl font-black text-[#0F2C59]">${totalCost.toFixed(2)} USD</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-4 text-center text-slate-400 text-[10px] border-t border-slate-100">
            Thank you for shipping with Swift Line Worldwide Courier. For support inquiries, email support@myswiftline.com.
          </div>

        </div>

      </div>
    </div>
  );
}
