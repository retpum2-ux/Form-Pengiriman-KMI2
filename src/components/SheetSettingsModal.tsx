import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Send,
  Loader2,
  AlertTriangle,
  Github,
  HelpCircle,
} from 'lucide-react';

interface SheetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhookUrl: string;
  onSaveWebhookUrl: (url: string) => Promise<boolean>;
}

export const SheetSettingsModal: React.FC<SheetSettingsModalProps> = ({
  isOpen,
  onClose,
  webhookUrl,
  onSaveWebhookUrl,
}) => {
  const [urlInput, setUrlInput] = useState(webhookUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'tutorial' | 'code'>('config');

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setTestResult(null);
    try {
      const ok = await onSaveWebhookUrl(urlInput.trim());
      if (ok) {
        setTestResult({
          success: true,
          message: 'URL Google Spreadsheet Webhook berhasil disimpan!',
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    const targetUrl = urlInput.trim();
    if (!targetUrl) {
      setTestResult({
        success: false,
        message: 'Masukkan URL Webhook Google Apps Script terlebih dahulu.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Test sending 1 sample row to test connection
      const testRow = {
        tanggal: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        nama_barang: 'KMI-TEST-CONNECTION',
        qty: 1,
        kuantitas: 'pcs',
        keterangan: 'Uji Coba Koneksi Sistem',
      };

      const res = await fetch('/api/submit-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [testRow],
          customWebhookUrl: targetUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.sheetSyncStatus === 'synced') {
        setTestResult({
          success: true,
          message: 'Koneksi Berhasil! 1 baris uji coba telah masuk ke Google Spreadsheet Anda.',
        });
      } else {
        setTestResult({
          success: false,
          message: data.sheetSyncMessage || 'Gagal mengirim ke spreadsheet. Periksa izin Web App (Anyone).',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Terjadi error jaringan: ${err.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const appsScriptCode = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var contents = JSON.parse(e.postData.contents);
    
    // Jika sheet masih baru dan kosong, buat baris header
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Tanggal", "Nama Barang", "Qty", "Kuantitas", "Keterangan"]);
      var headerRange = sheet.getRange(1, 1, 1, 5);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#9bd2a2");
    }
    
    var rows = contents.rows;
    if (rows && rows.length > 0) {
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        // Hanya 5 kolom sesuai spesifikasi persis
        sheet.appendRow([
          row["Tanggal"] || "",
          row["Nama Barang"] || "",
          row["Qty"] || 0,
          row["Kuantitas"] || "",
          row["Keterangan"] || ""
        ]);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data berhasil disimpan ke Google Spreadsheet",
      rowsCount: rows ? rows.length : 0
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    name: "Form Pengiriman KMI2 Webhook"
  })).setMimeType(ContentService.MimeType.JSON);
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-[#FAF4DF] border-3 border-black rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#8bc4fa] px-5 py-4 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white border-2 border-black rounded-xl">
              <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-lg font-black text-black uppercase tracking-wide">
                Integrasi Google Spreadsheet
              </h2>
              <p className="text-xs text-gray-800 font-medium">
                Penyambungan data otomatis via Backend & Panduan GitHub/Vercel
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

        {/* Tab navigation */}
        <div className="bg-[#fce59f] px-5 pt-3 border-b-2 border-black flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 text-xs font-black rounded-t-xl border-t-2 border-x-2 border-black transition ${
              activeTab === 'config'
                ? 'bg-[#FAF4DF] text-black -mb-[2px] pb-2.5'
                : 'bg-white/60 hover:bg-white text-gray-700'
            }`}
          >
            Pengaturan Webhook
          </button>
          <button
            onClick={() => setActiveTab('tutorial')}
            className={`px-4 py-2 text-xs font-black rounded-t-xl border-t-2 border-x-2 border-black transition ${
              activeTab === 'tutorial'
                ? 'bg-[#FAF4DF] text-black -mb-[2px] pb-2.5'
                : 'bg-white/60 hover:bg-white text-gray-700'
            }`}
          >
            Panduan GitHub & Vercel
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 text-xs font-black rounded-t-xl border-t-2 border-x-2 border-black transition ${
              activeTab === 'code'
                ? 'bg-[#FAF4DF] text-black -mb-[2px] pb-2.5'
                : 'bg-white/60 hover:bg-white text-gray-700'
            }`}
          >
            Kode Google Apps Script
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="bg-white border-2 border-black rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-black">
                      Google Apps Script Web App URL
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      URL endpoint dari deployment Google Apps Script di Spreadsheet Anda.
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-400 rounded-md">
                    Backend Proxy
                  </span>
                </div>

                <div className="space-y-1">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="w-full bg-[#FAF6E9] border-2 border-black rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-black"
                  />
                  <p className="text-[11px] text-gray-500 italic">
                    Format wajib berakhiran <code className="font-bold text-black">/exec</code>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#9bd2a2] hover:bg-[#85c48d] text-black border-2 border-black font-extrabold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition active:translate-y-0.5 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Simpan Pengaturan</span>
                  </button>

                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="bg-[#8bc4fa] hover:bg-[#72b5f7] text-black border-2 border-black font-extrabold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition active:translate-y-0.5 disabled:opacity-50"
                  >
                    {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Tes Koneksi Langsung</span>
                  </button>
                </div>

                {/* Status messages */}
                {testResult && (
                  <div
                    className={`p-3 rounded-xl border-2 text-xs font-semibold flex items-start gap-2 ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                        : 'bg-red-50 border-red-600 text-red-900'
                    }`}
                  >
                    {testResult.success ? (
                      <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* Information pill about strictly 5 columns */}
              <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-3.5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-1">
                  <p className="font-bold">
                    Spesifikasi Kolom Google Spreadsheet (Tepat 5 Kolom):
                  </p>
                  <p className="font-mono bg-white/80 p-1.5 rounded-lg border border-amber-300 font-semibold text-black">
                    Tanggal | Nama Barang | Qty | Kuantitas | Keterangan
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Sistem diprogram secara ketat agar tidak menambahkan kolom lain ke spreadsheet Anda.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tutorial' && (
            <div className="space-y-4 text-xs sm:text-sm text-gray-800">
              <div className="bg-white border-2 border-black rounded-xl p-4 space-y-3">
                <h3 className="font-black text-black text-sm uppercase flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  Metode Deploy GitHub & Vercel
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Aplikasi ini sudah dilengkapi dengan backend serverless Vercel di folder{' '}
                  <code className="bg-gray-100 px-1 py-0.5 rounded font-mono font-bold text-black">
                    /api/submit-sheet.ts
                  </code>
                  . Saat Anda mengupload ke GitHub dan mengimpor ke Vercel, begini cara menghubungkannya:
                </p>

                <ol className="list-decimal list-inside space-y-2.5 text-xs">
                  <li className="font-semibold text-black">
                    <span>Buat Google Spreadsheet & Pasang Apps Script:</span>
                    <p className="font-normal text-gray-600 pl-4 mt-0.5">
                      Buka Google Sheets &gt; Ekstensi &gt; Apps Script &gt; Tempel kode dari tab <b>Kode Apps Script</b> &gt; Deploy sebagai Web App (Akses: Anyone / Siapa Saja) &gt; Salin Web App URL.
                    </p>
                  </li>

                  <li className="font-semibold text-black">
                    <span>Push Project ke Akun GitHub Anda:</span>
                    <pre className="mt-1 bg-gray-900 text-green-300 font-mono text-[11px] p-2.5 rounded-lg overflow-x-auto">
{`git init
git add .
git commit -m "Form Pengiriman KMI2"
git branch -M main
git remote add origin https://github.com/USERNAME/form-pengiriman-kmi2.git
git push -u origin main`}
                    </pre>
                  </li>

                  <li className="font-semibold text-black">
                    <span>Hubungkan ke Vercel & Atur Environment Variable:</span>
                    <p className="font-normal text-gray-600 pl-4 mt-0.5">
                      Di dashboard Vercel, klik <b>Add New Project</b> &gt; pilih repositori GitHub Anda.
                    </p>
                    <p className="font-normal text-gray-600 pl-4 mt-1">
                      Sebelum klik Deploy, buka menu <b>Environment Variables</b> lalu tambahkan:
                    </p>
                    <div className="pl-4 mt-1 space-y-1">
                      <div className="bg-gray-100 border border-gray-300 p-2 rounded-lg font-mono text-xs">
                        <span className="font-bold text-blue-700">Key:</span> GOOGLE_SHEET_WEBHOOK_URL<br />
                        <span className="font-bold text-green-700">Value:</span> https://script.google.com/macros/s/AKfycb.../exec
                      </div>
                    </div>
                  </li>

                  <li className="font-semibold text-black">
                    <span>Klik Deploy di Vercel:</span>
                    <p className="font-normal text-gray-600 pl-4 mt-0.5">
                      Vercel akan secara otomatis membangun aplikasi web dan menjalankan backend serverless. Data pengiriman akan langsung tersambung ke Google Spreadsheet Anda secara realtime!
                    </p>
                  </li>
                </ol>
              </div>

              <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 shrink-0 text-blue-700 mt-0.5" />
                <p>
                  <b>Tips Fleksibilitas:</b> Selain melalui Environment Variable di Vercel, Anda juga bisa mengganti URL spreadsheet kapan saja langsung dari tombol <b>Pengaturan Google Sheets</b> di aplikasi tanpa perlu re-deploy ulang kode!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-black">
                    Kode Google Apps Script (doPost)
                  </h3>
                  <p className="text-[11px] text-gray-600">
                    Tempel kode ini di menu Ekstensi &gt; Apps Script pada spreadsheet Anda.
                  </p>
                </div>
                <button
                  onClick={copyCode}
                  className="bg-[#9bd2a2] hover:bg-[#85c48d] text-black border-2 border-black font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition active:translate-y-0.5"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 font-mono text-[11px] sm:text-xs p-3.5 rounded-xl border-2 border-black overflow-x-auto max-h-72">
                  {appsScriptCode}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#fce59f] px-5 py-3 border-t-2 border-black flex items-center justify-between">
          <span className="text-xs font-bold text-gray-800">PT KMI Wire and Cable Tbk</span>
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
