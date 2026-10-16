import React from 'react';
import { X, BookOpen, Package, Scale, FileSpreadsheet, MessageSquare, CheckCircle, ArrowRight } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMasterItems: () => void;
  onOpenMasterUnits: () => void;
  onOpenSheetSettings: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  onOpenMasterItems,
  onOpenMasterUnits,
  onOpenSheetSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-[#FAF4DF] border-3 border-black rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#fce59f] px-5 py-4 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white border-2 border-black rounded-xl">
              <BookOpen className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-lg font-black text-black uppercase tracking-wide">
                Buku Panduan Penggunaan
              </h2>
              <p className="text-xs text-gray-800 font-medium">
                Cara update data, integrasi spreadsheet & kirim laporan WhatsApp
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm text-gray-800">
          {/* Question 1: How to update Goods & Quantity */}
          <section className="bg-white border-2 border-black rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-black">
              <Package className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-base">
                1. Cara Update Nama Barang dan Nama Kuantitas
              </h3>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-gray-700">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
                <span className="font-bold text-emerald-900 block">
                  A. Update Daftar Nama Barang (Kolom Cari / Pilih Barang):
                </span>
                <p>
                  1. Klik ikon <b>Gerigi / Tombol &quot;Kelola&quot;</b> di sebelah kolom input barang, atau klik tombol <b>&quot;Master Barang&quot;</b> di bagian atas.
                </p>
                <p>
                  2. Di modal yang muncul, Anda bisa:
                </p>
                <ul className="list-disc list-inside pl-3 space-y-0.5 text-xs">
                  <li><b>Menambah barang baru:</b> Ketik nama barang (misal: <i>Kabel NYY 4x25mm</i>) lalu klik <b>+ Tambah</b>.</li>
                  <li><b>Menambah banyak sekaligus:</b> Klik <i>Tambah Banyak Sekaligus</i> untuk paste daftar barang.</li>
                  <li><b>Mengedit nama barang:</b> Klik ikon pensil untuk mengubah nama barang yang sudah ada.</li>
                  <li><b>Menghapus barang:</b> Klik ikon tempat sampah merah.</li>
                </ul>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMasterItems();
                    }}
                    className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 underline hover:text-emerald-950"
                  >
                    Buka Kelola Barang Sekarang <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
                <span className="font-bold text-blue-900 block">
                  B. Update Daftar Kuantitas / Satuan:
                </span>
                <p>
                  1. Klik ikon <b>Gerigi</b> di sebelah kolom Kuantitas, atau tombol <b>&quot;Master Satuan&quot;</b> di atas.
                </p>
                <p>
                  2. Anda bisa menambah satuan baru (misal: <i>pcs, roll, box, meter, drum, kg, lembar, ikat</i>) atau mengedit &amp; menghapus satuan lama.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMasterUnits();
                    }}
                    className="inline-flex items-center gap-1 text-xs font-black text-blue-800 underline hover:text-blue-950"
                  >
                    Buka Kelola Satuan Sekarang <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Question 2: Spreadsheet connection with GitHub and Vercel */}
          <section className="bg-white border-2 border-black rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-black">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <h3 className="font-black text-base">
                2. Metode Penyambungan ke Spreadsheet di GitHub &amp; Vercel
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              Data dikirim ke Google Spreadsheet menggunakan <b>Backend Serverless</b> (file <code className="bg-gray-100 px-1 py-0.5 rounded font-mono font-bold">/api/submit-sheet.ts</code>) yang otomatis aktif saat di-deploy ke Vercel.
            </p>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <b>Langkah 1:</b> Siapkan Google Spreadsheet dengan 5 kolom di baris 1:
                  <div className="font-mono text-xs bg-gray-100 p-1.5 rounded mt-0.5 border">
                    Tanggal | Nama Barang | Qty | Kuantitas | Keterangan
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <b>Langkah 2:</b> Pasang kode Apps Script (tersedia di menu Pengaturan Google Sheets aplikasi ini) lalu klik <i>Deploy &gt; New Deployment &gt; Web app (Anyone)</i>. Salin URL Web App yang berakhiran <code className="font-bold">/exec</code>.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <b>Langkah 3 di Vercel:</b> Masukkan environment variable di Vercel:
                  <div className="font-mono text-xs bg-gray-100 p-1.5 rounded mt-0.5 border">
                    Key: GOOGLE_SHEET_WEBHOOK_URL<br />
                    Value: https://script.google.com/macros/s/.../exec
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenSheetSettings();
                }}
                className="bg-[#8bc4fa] hover:bg-[#72b5f7] text-black border-2 border-black font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition active:translate-y-0.5"
              >
                <span>Buka Pengaturan &amp; Salin Script Spreadsheet</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Question 3: WhatsApp Format */}
          <section className="bg-white border-2 border-black rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-black">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-base">
                3. Fitur Salin dan Kirim Laporan ke WhatsApp
              </h3>
            </div>
            <p className="text-xs text-gray-700">
              Format laporan otomatis dibuat sesuai standar yang Anda minta:
            </p>
            <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl font-mono text-xs text-gray-900 leading-relaxed">
              PENGIRIMAN KMI2<br />
              Tgl: 5 Oktober 2026<br />
              Isolasi Kertas = 20 pcs = Diterima dengann baik<br />
              Isolasi hijau = 10 pcs = Kurang dari jumlah
            </div>
            <p className="text-xs text-gray-600">
              Tersedia tombol <b>Salin Laporan</b> (langsung copy ke clipboard) dan <b>Kirim ke WhatsApp</b> (langsung membuka WhatsApp Web atau aplikasi WA di HP).
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-[#fce59f] px-5 py-3 border-t-2 border-black flex items-center justify-between text-xs font-bold text-gray-800">
          <span>PT KMI Wire and Cable Tbk</span>
          <button
            onClick={onClose}
            className="bg-[#8bc4fa] border-2 border-black px-4 py-1.5 rounded-xl font-black text-black hover:brightness-95 active:translate-y-0.5"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
