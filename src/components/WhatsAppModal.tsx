import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Send, Phone, Share2 } from 'lucide-react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportText: string;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  reportText,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWA = () => {
    const encoded = encodeURIComponent(reportText);
    let cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    let url = `https://wa.me/?text=${encoded}`;
    if (cleanPhone) {
      url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    }

    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#FAF4DF] border-3 border-black rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#25D366] text-white px-5 py-4 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl border border-white/40">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wide">
                Laporan WhatsApp
              </h2>
              <p className="text-xs text-white/90 font-medium">
                Kirim langsung atau salin teks laporan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-black/20 hover:bg-black/30 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Format preview box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-black">
                Format Teks Laporan:
              </label>
              <span className="text-[10px] font-bold text-gray-500 uppercase">
                Standar KMI2
              </span>
            </div>
            <div className="relative bg-emerald-50 border-2 border-black rounded-xl p-3.5">
              <pre className="font-mono text-xs sm:text-sm text-gray-900 whitespace-pre-wrap leading-relaxed select-all">
                {reportText}
              </pre>
            </div>
          </div>

          {/* Optional phone number input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-black flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-700" />
              <span>Nomor WhatsApp Tujuan (Opsional):</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Contoh: 08123456789 atau kosongkan untuk pilih kontak"
              className="w-full bg-white border-2 border-black rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-black"
            />
            <p className="text-[11px] text-gray-500">
              *Jika dikosongkan, WhatsApp akan membuka daftar kontak/grup untuk Anda pilih.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={handleCopy}
              className="bg-white hover:bg-gray-100 text-black border-2 border-black font-extrabold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition text-xs sm:text-sm active:translate-y-0.5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 font-black">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Laporan</span>
                </>
              )}
            </button>

            <button
              onClick={handleSendWA}
              className="bg-[#25D366] hover:bg-[#20ba59] text-white border-2 border-black font-extrabold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition text-xs sm:text-sm active:translate-y-0.5 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Sekarang</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#fce59f] px-5 py-3 border-t-2 border-black flex items-center justify-between text-xs font-bold text-gray-800">
          <span>Format: Tgl = Barang = Qty = Ket</span>
          <button
            onClick={onClose}
            className="bg-[#8bc4fa] border-2 border-black px-4 py-1.5 rounded-xl font-black text-black hover:brightness-95 active:translate-y-0.5"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
