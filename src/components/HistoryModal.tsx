import React from 'react';
import { X, History, FileSpreadsheet, CheckCircle2, AlertCircle, Clock, Copy, Share2 } from 'lucide-react';
import { HistoryRecord } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryRecord[];
  onSelectForWhatsApp: (record: HistoryRecord) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectForWhatsApp,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-[#FAF4DF] border-3 border-black rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#9bd2a2] px-5 py-4 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white border-2 border-black rounded-xl">
              <History className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-lg font-black text-black uppercase tracking-wide">
                Riwayat Pengiriman KMI2
              </h2>
              <p className="text-xs text-gray-800 font-medium">
                Daftar pengiriman yang telah disimpan dan status sinkronisasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/80 border-2 border-black hover:bg-white text-black transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {history.length === 0 ? (
            <div className="bg-white border-2 border-black rounded-2xl p-8 text-center space-y-2">
              <Clock className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="font-bold text-gray-800">Belum ada riwayat pengiriman.</p>
              <p className="text-xs text-gray-500">
                Isi form dan klik tombol SIMPAN untuk mencatat pengiriman pertama Anda.
              </p>
            </div>
          ) : (
            history.map((record) => {
              const formattedDate = new Date(record.submittedAt).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              });

              return (
                <div
                  key={record.id}
                  className="bg-white border-2 border-black rounded-xl p-3.5 space-y-2.5 hover:shadow-md transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-black bg-gray-100 px-2 py-0.5 rounded border border-gray-300">
                        {record.id}
                      </span>
                      <span className="text-xs text-gray-500">{formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {record.sheetSyncStatus === 'synced' ? (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-400 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Tersimpan di Sheet
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-400 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          Tersimpan Lokal
                        </span>
                      )}

                      <button
                        onClick={() => onSelectForWhatsApp(record)}
                        className="bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-black flex items-center gap-1 transition"
                        title="Buka format WhatsApp"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>WA</span>
                      </button>
                    </div>
                  </div>

                  {/* Rows table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b text-gray-500">
                          <th className="py-1 pr-2">Tanggal</th>
                          <th className="py-1 px-2">Nama Barang</th>
                          <th className="py-1 px-2">Qty</th>
                          <th className="py-1 px-2">Kuantitas</th>
                          <th className="py-1 pl-2">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {record.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="py-1 pr-2 font-medium">{row.Tanggal}</td>
                            <td className="py-1 px-2 font-bold text-black">{row['Nama Barang']}</td>
                            <td className="py-1 px-2 font-mono">{row.Qty}</td>
                            <td className="py-1 px-2">{row.Kuantitas}</td>
                            <td className="py-1 pl-2 text-gray-700">{row.Keterangan || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#fce59f] px-5 py-3 border-t-2 border-black flex items-center justify-between">
          <span className="text-xs font-bold text-gray-800">
            Total Riwayat: {history.length} Laporan
          </span>
          <button
            onClick={onClose}
            className="bg-[#8bc4fa] border-2 border-black px-4 py-1.5 rounded-xl font-black text-black hover:brightness-95 active:translate-y-0.5 text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
