import React from 'react';
import { Trip, UserProfile } from '../types';
import {
  Receipt,
  CheckCircle2,
  Printer,
  Download,
  Star,
  Car,
  MapPin,
  Clock,
  CreditCard,
  ShieldCheck,
  X,
  Heart,
  Share2,
  Building2,
  Play
} from 'lucide-react';

interface TripSummaryReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
  profile?: UserProfile;
  tipAmount?: number;
  rating?: number;
  reviewText?: string;
  onReplayTrip?: (trip: Trip) => void;
}

export const TripSummaryReceiptModal: React.FC<TripSummaryReceiptModalProps> = ({
  isOpen,
  onClose,
  trip,
  profile,
  rating = 5,
  reviewText = '',
  onReplayTrip
}) => {
  if (!isOpen || !trip) return null;

  const baseFare = Math.round(trip.price * 0.35);
  const distanceFee = Math.round(trip.distanceMiles * 140);
  const timeFee = Math.round(trip.durationMinutes * 25);
  const serviceFee = 150;
  const stateTax = Math.round(trip.price * 0.05);

  const subtotalFare = trip.price;
  const totalCharged = subtotalFare;
  const receiptRef = 'ZMF-REC-' + trip.id.toUpperCase();
  const dateFormatted = new Date(trip.timestamp || Date.now()).toLocaleDateString('en-NG', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const timeFormatted = new Date(trip.timestamp || Date.now()).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      const summaryText = `ZamTaxi Trip Receipt (${receiptRef})\nFrom: ${trip.origin.label}\nTo: ${trip.destination.label}\nFare: ₦${subtotalFare.toLocaleString()}\nTotal: ₦${totalCharged.toLocaleString()}\nStatus: COMPLETED`;
      navigator.clipboard.writeText(summaryText);
      alert('Trip receipt summary copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200 my-8 text-zinc-900">
        
        {/* Receipt Header */}
        <div className="bg-zinc-950 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <Receipt size={22} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-extrabold text-emerald-400 uppercase tracking-widest block">
                  Official Trip Receipt
                </span>
                <h3 className="text-base font-black text-white">ZamTaxi Ride Completion</h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
              title="Close Receipt"
              id="close-trip-receipt-modal-btn"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-3 border-t border-zinc-800 text-zinc-300">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase block font-mono">Receipt No</span>
              <span className="font-mono font-bold text-emerald-400">{receiptRef}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-400 uppercase block font-mono">Date & Time</span>
              <span className="font-bold">{dateFormatted} @ {timeFormatted}</span>
            </div>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Status Badge */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <span className="text-xs font-black text-emerald-950 block">Payment Completed</span>
                <span className="text-[10px] text-emerald-700 font-bold">Charged via Passenger Digital Wallet</span>
              </div>
            </div>
            <span className="text-xs font-black font-mono bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-xl">
              PAID
            </span>
          </div>

          {/* Route Overview */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DFD3] space-y-3 relative">
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-[#E5DFD3]" />

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] uppercase font-bold text-zinc-500 block">Pickup Landmark</span>
                <span className="text-xs font-black text-zinc-900 truncate block">{trip.origin.label}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] uppercase font-bold text-zinc-500 block">Drop-off Destination</span>
                <span className="text-xs font-black text-zinc-900 truncate block">{trip.destination.label}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5DFD3] text-center text-xs">
              <div className="bg-white p-2 rounded-xl border border-[#E5DFD3]">
                <span className="text-[9px] uppercase font-bold text-zinc-500 block">Distance</span>
                <span className="font-extrabold text-zinc-900">{trip.distanceMiles} km</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#E5DFD3]">
                <span className="text-[9px] uppercase font-bold text-zinc-500 block">Duration</span>
                <span className="font-extrabold text-zinc-900">{trip.durationMinutes} mins</span>
              </div>
            </div>
          </div>

          {/* Driver & Vehicle Details */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DFD3] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={trip.driver.avatar}
                alt={trip.driver.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="font-black text-xs text-zinc-900">{trip.driver.name}</h4>
                <div className="flex items-center gap-1 text-[11px] text-zinc-600 font-semibold">
                  <Star size={11} className="text-amber-500 fill-amber-500 shrink-0" />
                  <span>{trip.driver.rating.toFixed(2)} rating</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-black bg-zinc-900 text-white px-2 py-0.5 rounded uppercase">
                {trip.driver.plateNumber}
              </span>
              <p className="text-[11px] font-bold text-zinc-600 mt-1">{trip.driver.vehicleName}</p>
            </div>
          </div>

          {/* Fee Breakdown Table */}
          <div className="space-y-2.5 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5DFD3]">
            <h4 className="text-xs font-black uppercase text-zinc-700 tracking-wider flex items-center justify-between">
              <span>Itemized Fee Breakdown</span>
              <span className="text-[10px] text-zinc-500 font-mono font-normal">CBN / NIBSS Rates</span>
            </h4>

            <div className="space-y-1.5 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Base Fare</span>
                <span className="font-semibold text-zinc-900">₦{baseFare.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span>Distance Charge ({trip.distanceMiles} km × ₦140)</span>
                <span className="font-semibold text-zinc-900">₦{distanceFee.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span>Time Charge ({trip.durationMinutes} min × ₦25)</span>
                <span className="font-semibold text-zinc-900">₦{timeFee.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span>Platform Safety & Tech Fee</span>
                <span className="font-semibold text-zinc-900">₦{serviceFee.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span>Zamfara Transit Tax (5% VAT)</span>
                <span className="font-semibold text-zinc-900">₦{stateTax.toLocaleString()}</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-[#E5DFD3] font-bold text-zinc-900">
                <span>Total Trip Fare</span>
                <span className="font-extrabold text-zinc-900">₦{subtotalFare.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Total Fare Card */}
            <div className="mt-3 pt-3 border-t-2 border-zinc-900 flex items-center justify-between text-zinc-950">
              <div>
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider block">Total Amount Paid</span>
                <span className="text-[10px] text-zinc-500 font-medium">Includes Fare & Transit Taxes</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-emerald-700 font-mono">
                  ₦{totalCharged.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Rating Given & Feedback Review Section */}
          {(rating > 0 || reviewText) && (
            <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E5DFD3] space-y-1.5 text-xs">
              <span className="text-[10px] uppercase font-extrabold text-zinc-500 tracking-wider block">Your Review & Rating</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={s <= rating ? 'text-amber-500 fill-amber-500' : 'text-zinc-300'}
                  />
                ))}
                <span className="text-xs font-bold text-zinc-800 ml-1.5">{rating}.0 / 5.0</span>
              </div>
              {reviewText && (
                <p className="text-zinc-600 italic font-medium pt-0.5">"{reviewText}"</p>
              )}
            </div>
          )}

          {/* Replay Option */}
          {onReplayTrip && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onReplayTrip(trip);
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-xs cursor-pointer"
              id="modal-replay-trip-route-btn"
            >
              <Play size={15} className="fill-white" />
              <span>Replay Trip Route Animation on Map</span>
            </button>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full bg-white hover:bg-[#FAF7F2] text-zinc-800 border border-[#E5DFD3] font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer shadow-xs"
              id="print-receipt-btn"
            >
              <Printer size={15} /> Print / Save PDF
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="w-full bg-white hover:bg-[#FAF7F2] text-zinc-800 border border-[#E5DFD3] font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer shadow-xs"
              id="share-receipt-btn"
            >
              <Share2 size={15} /> Copy Summary
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-black py-3.5 rounded-2xl transition text-xs shadow-md cursor-pointer text-center"
            id="done-receipt-modal-btn"
          >
            Done & Return to Main Screen
          </button>
        </div>

        {/* Modal Footer Security Badge */}
        <div className="bg-[#FAF7F2] px-6 py-2.5 border-t border-[#E5DFD3] flex items-center justify-between text-[10px] text-zinc-500 font-mono font-semibold">
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-600" /> CBN Transit Compliant
          </span>
          <span>ZamTaxi Digital Fleet Treasury</span>
        </div>
      </div>
    </div>
  );
};

export default TripSummaryReceiptModal;
