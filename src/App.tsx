/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Trash2,
  ChevronDown,
  Check,
  Plus,
  Loader2,
  Settings,
} from 'lucide-react';

import { DeliveryItem, HistoryRecord } from './types';
import { MasterItemModal } from './components/MasterItemModal';
import { MasterUnitModal } from './components/MasterUnitModal';
import { SheetSettingsModal } from './components/SheetSettingsModal';
import { WhatsAppModal } from './components/WhatsAppModal';

const DEFAULT_ITEMS = [
  'Isolasi Kertas',
  'Isolasi hijau',
  'Kabel NYM 2 x 1.5 mm²',
  'Kabel NYM 3 x 2.5 mm²',
  'Kabel NYY 4 x 16 mm²',
  'Kabel NYY 4 x 25 mm²',
  'Kabel NYA 1 x 2.5 mm²',
  'Kabel FRC 2 x 1.5 mm²',
  'Kabel BC (Bare Copper) 50 mm²',
  'Drum Kayu KMI Ø 120cm',
  'Palet Kayu KMI',
  'Segel Lead Seal KMI',
  'Klem Kabel KMI',
  'Pita Pengikat Steel Strapping',
];

const DEFAULT_UNITS = [
  'pcs',
  'roll',
  'box',
  'meter',
  'drum',
  'kg',
  'lembar',
  'pack',
  'set',
  'batang',
];

export default function App() {
  const getTodayInputDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [tanggalInput, setTanggalInput] = useState<string>(getTodayInputDate());
  const [items, setItems] = useState<DeliveryItem[]>([
    {
      id: 'item-1',
      nama_barang: '',
      qty: '',
      kuantitas: 'pcs',
      keterangan: '',
    },
  ]);

  // Master Data (Barang & Satuan)
  const [masterItems, setMasterItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('kmi_master_items');
    return saved ? JSON.parse(saved) : DEFAULT_ITEMS;
  });

  const [masterUnits, setMasterUnits] = useState<string[]>(() => {
    const saved = localStorage.getItem('kmi_master_units');
    return saved ? JSON.parse(saved) : DEFAULT_UNITS;
  });

  // Settings & Webhook
  const [googleSheetWebhookUrl, setGoogleSheetWebhookUrl] = useState<string>(() => {
    return localStorage.getItem('kmi_sheet_webhook_url') || '';
  });

  // UI state for dropdowns & modals
  const [activeItemDropdown, setActiveItemDropdown] = useState<string | null>(null);
  const [activeUnitDropdown, setActiveUnitDropdown] = useState<string | null>(null);
  const [openMasterItemModal, setOpenMasterItemModal] = useState(false);
  const [openMasterUnitModal, setOpenMasterUnitModal] = useState(false);
  const [openSheetSettingsModal, setOpenSheetSettingsModal] = useState(false);
  const [openWhatsAppModal, setOpenWhatsAppModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with backend on mount
  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.googleSheetWebhookUrl) {
          setGoogleSheetWebhookUrl(data.googleSheetWebhookUrl);
          localStorage.setItem('kmi_sheet_webhook_url', data.googleSheetWebhookUrl);
        }
      })
      .catch(() => {});

    fetch('/api/master-data')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.items) && data.items.length > 0) {
          setMasterItems(data.items);
          localStorage.setItem('kmi_master_items', JSON.stringify(data.items));
        }
        if (Array.isArray(data.units) && data.units.length > 0) {
          setMasterUnits(data.units);
          localStorage.setItem('kmi_master_units', JSON.stringify(data.units));
        }
      })
      .catch(() => {});
  }, []);

  const updateMasterItems = async (newItems: string[]) => {
    setMasterItems(newItems);
    localStorage.setItem('kmi_master_items', JSON.stringify(newItems));
    try {
      await fetch('/api/master-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newItems, units: masterUnits }),
      });
    } catch (e) {
      console.warn('Backend sync error:', e);
    }
  };

  const updateMasterUnits = async (newUnits: string[]) => {
    setMasterUnits(newUnits);
    localStorage.setItem('kmi_master_units', JSON.stringify(newUnits));
    try {
      await fetch('/api/master-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: masterItems, units: newUnits }),
      });
    } catch (e) {
      console.warn('Backend sync error:', e);
    }
  };

  const saveWebhookUrl = async (url: string): Promise<boolean> => {
    setGoogleSheetWebhookUrl(url);
    localStorage.setItem('kmi_sheet_webhook_url', url);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleSheetWebhookUrl: url }),
      });
      return true;
    } catch (e) {
      return true;
    }
  };

  const formatIndonesianDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const dateObj = new Date(year, month, day);
        return dateObj.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const handleAddItem = () => {
    const newItem: DeliveryItem = {
      id: 'item-' + (items.length + 1) + '-' + Date.now(),
      nama_barang: '',
      qty: '',
      kuantitas: masterUnits[0] || 'pcs',
      keterangan: '',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof DeliveryItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const generateWhatsAppReport = () => {
    const formattedDate = formatIndonesianDate(tanggalInput);
    const lines: string[] = ['PENGIRIMAN KMI2', `Tgl: ${formattedDate}`];

    items.forEach((item) => {
      const name = item.nama_barang || '';
      const qty = item.qty !== '' ? item.qty : '0';
      const unit = item.kuantitas || 'pcs';
      const ket = item.keterangan ? item.keterangan.trim() : '';
      lines.push(`${name} = ${qty} ${unit} = ${ket}`);
    });

    return lines.join('\n');
  };

  const handleSaveForm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const dateFormatted = formatIndonesianDate(tanggalInput);
    if (!dateFormatted) {
      alert('Silakan pilih tanggal pengiriman terlebih dahulu.');
      return;
    }

    const invalidItems = items.filter((item) => !item.nama_barang.trim());
    if (invalidItems.length > 0) {
      alert('Mohon isi nama barang untuk semua daftar barang.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Exactly 5 columns: Tanggal, Nama Barang, Qty, Kuantitas, Keterangan
      const rowsToSend = items.map((item) => ({
        tanggal: dateFormatted,
        nama_barang: item.nama_barang.trim(),
        qty: Number(item.qty) || 0,
        kuantitas: (item.kuantitas || 'pcs').trim(),
        keterangan: (item.keterangan || '').trim(),
      }));

      await fetch('/api/submit-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: rowsToSend,
          customWebhookUrl: googleSheetWebhookUrl,
        }),
      });

      // Automatically open the WhatsApp modal with options to copy and send!
      setOpenWhatsAppModal(true);
    } catch (err: any) {
      console.error('Submit error:', err);
      // Still open WhatsApp modal so user doesn't lose their report
      setOpenWhatsAppModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF4DF] flex items-center justify-center p-3 sm:p-6 md:p-10">
      {/* Outer Card matching the exact shape, color, and layout of image.png */}
      <div className="w-full max-w-xl bg-[#FAF4DF] border-3 border-black rounded-3xl p-5 sm:p-8 shadow-2xl relative">
        {/* Top Header: PT KMI Wire and Cable Tbk + Subtle Setting icon */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm sm:text-base font-bold text-gray-600 tracking-wide">
            PT KMI Wire and Cable Tbk
          </p>
          <button
            type="button"
            onClick={() => setOpenSheetSettingsModal(true)}
            className="p-1.5 text-gray-400 hover:text-black transition rounded-lg"
            title="Pengaturan Google Spreadsheet"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Title: FORM PENGIRIMAN KMI2 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-none uppercase">
            FORM
          </h1>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase mt-1">
            PENGIRIMAN KMI2
          </h2>
        </div>

        <form onSubmit={handleSaveForm} className="space-y-6">
          {/* Tanggal : */}
          <div className="space-y-1.5">
            <label className="block text-base sm:text-lg font-bold text-black">
              Tanggal :
            </label>
            <input
              type="date"
              value={tanggalInput}
              onChange={(e) => setTanggalInput(e.target.value)}
              className="w-full bg-white border-2 border-black rounded-2xl px-4 py-3 text-base sm:text-lg font-semibold text-black focus:outline-hidden focus:ring-2 focus:ring-black cursor-pointer shadow-xs"
              required
            />
          </div>

          {/* List of Goods (Barang 1, Barang 2, ...) */}
          <div className="space-y-6">
            {items.map((item, index) => {
              const itemNumber = index + 1;
              const isItemDropdownOpen = activeItemDropdown === item.id;
              const isUnitDropdownOpen = activeUnitDropdown === item.id;

              const filteredSuggestions = masterItems.filter((m) =>
                m.toLowerCase().includes((item.nama_barang || '').toLowerCase())
              );

              const hasExactMatch = masterItems.some(
                (m) => m.toLowerCase() === (item.nama_barang || '').trim().toLowerCase()
              );

              return (
                <div key={item.id} className="space-y-2 relative">
                  {/* Badge: Barang 1 */}
                  <div className="flex items-center justify-between">
                    <div className="inline-block bg-[#9bd2a2] border-2 border-black rounded-2xl px-7 py-2 shadow-xs">
                      <span className="text-base sm:text-lg font-black text-black">
                        Barang {itemNumber}
                      </span>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 border border-red-300 rounded-xl px-3 py-1 flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>

                  {/* Inner White Box */}
                  <div className="bg-white border-2 border-black rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-sm">
                    {/* Cari / Pilih barang */}
                    <div className="relative">
                      <div className="relative">
                        <input
                          type="text"
                          value={item.nama_barang}
                          onChange={(e) => {
                            handleItemChange(item.id, 'nama_barang', e.target.value);
                            setActiveItemDropdown(item.id);
                          }}
                          onFocus={() => setActiveItemDropdown(item.id)}
                          placeholder="Cari / Pilih barang"
                          className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-sm sm:text-base font-semibold text-black placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-black pr-10"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setActiveItemDropdown(isItemDropdownOpen ? null : item.id)
                          }
                          className="absolute right-3 top-3.5 text-gray-500 hover:text-black"
                          tabIndex={-1}
                        >
                          <ChevronDown className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Dropdown with options to search, add, or manage goods */}
                      {isItemDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-20"
                            onClick={() => setActiveItemDropdown(null)}
                          />
                          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border-2 border-black rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-gray-100">
                            {/* Manage Goods Header Button */}
                            <div className="p-2 bg-yellow-50 border-b border-gray-200 flex items-center justify-between text-xs text-gray-700">
                              <span className="font-bold">Pilih Barang:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveItemDropdown(null);
                                  setOpenMasterItemModal(true);
                                }}
                                className="text-blue-700 font-bold hover:underline cursor-pointer"
                              >
                                ⚙ Update / Kelola Daftar
                              </button>
                            </div>

                            {/* Quick add custom item if not found */}
                            {item.nama_barang.trim() && !hasExactMatch && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newName = item.nama_barang.trim();
                                  updateMasterItems([...masterItems, newName]);
                                  setActiveItemDropdown(null);
                                }}
                                className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-2 transition"
                              >
                                <Plus className="w-4 h-4" />
                                <span>
                                  Tambahkan &quot;<b>{item.nama_barang.trim()}</b>&quot; ke Daftar
                                </span>
                              </button>
                            )}

                            {filteredSuggestions.length === 0 ? (
                              <div className="p-3 text-xs text-gray-500 text-center">
                                Tidak ada barang yang cocok.
                              </div>
                            ) : (
                              filteredSuggestions.map((suggestion) => (
                                <button
                                  key={suggestion}
                                  type="button"
                                  onClick={() => {
                                    handleItemChange(item.id, 'nama_barang', suggestion);
                                    setActiveItemDropdown(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs sm:text-sm font-semibold hover:bg-yellow-50 transition text-gray-800 flex items-center justify-between"
                                >
                                  <span>{suggestion}</span>
                                  {item.nama_barang === suggestion && (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Qty & Kuantitas */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.qty}
                          onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                          placeholder="Qty"
                          className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-sm sm:text-base font-semibold text-black placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-black"
                          required
                        />
                      </div>

                      <div className="relative">
                        <div className="relative">
                          <input
                            type="text"
                            value={item.kuantitas}
                            onChange={(e) => {
                              handleItemChange(item.id, 'kuantitas', e.target.value);
                              setActiveUnitDropdown(item.id);
                            }}
                            onFocus={() => setActiveUnitDropdown(item.id)}
                            placeholder="Kuantitas"
                            className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-sm sm:text-base font-semibold text-black placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-black pr-8"
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setActiveUnitDropdown(isUnitDropdownOpen ? null : item.id)
                            }
                            className="absolute right-2.5 top-3.5 text-gray-500 hover:text-black"
                            tabIndex={-1}
                          >
                            <ChevronDown className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Dropdown for Kuantitas with Manage button */}
                        {isUnitDropdownOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setActiveUnitDropdown(null)}
                            />
                            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border-2 border-black rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-gray-100">
                              <div className="p-2 bg-yellow-50 border-b border-gray-200 flex items-center justify-between text-xs text-gray-700">
                                <span className="font-bold">Pilih Satuan:</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveUnitDropdown(null);
                                    setOpenMasterUnitModal(true);
                                  }}
                                  className="text-blue-700 font-bold hover:underline cursor-pointer"
                                >
                                  ⚙ Update / Kelola
                                </button>
                              </div>

                              {masterUnits.map((u) => (
                                <button
                                  key={u}
                                  type="button"
                                  onClick={() => {
                                    handleItemChange(item.id, 'kuantitas', u);
                                    setActiveUnitDropdown(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs sm:text-sm font-semibold hover:bg-yellow-50 transition text-gray-800 flex items-center justify-between"
                                >
                                  <span>{u}</span>
                                  {item.kuantitas === u && (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Keterangan */}
                    <div>
                      <input
                        type="text"
                        value={item.keterangan}
                        onChange={(e) =>
                          handleItemChange(item.id, 'keterangan', e.target.value)
                        }
                        placeholder="Keterangan"
                        className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-sm sm:text-base font-semibold text-black placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Yellow Action Box matching image.png */}
          <div className="bg-[#fce59f] border-2 border-black rounded-2xl p-3.5 sm:p-4 flex flex-col gap-3 shadow-md">
            {/* + Tambah barang */}
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full sm:w-auto self-start bg-[#9bd2a2] hover:bg-[#85c48d] text-black border-2 border-black font-extrabold text-base sm:text-lg py-2.5 px-6 rounded-xl transition active:translate-y-0.5 shadow-xs cursor-pointer"
            >
              + Tambah barang
            </button>

            {/* SIMPAN */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#8bc4fa] hover:bg-[#72b5f7] text-black border-2 border-black font-black text-xl sm:text-2xl py-3.5 rounded-xl uppercase tracking-wider transition active:translate-y-0.5 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>MENYIMPAN...</span>
                </>
              ) : (
                <span>SIMPAN</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modals */}
      <MasterItemModal
        isOpen={openMasterItemModal}
        onClose={() => setOpenMasterItemModal(false)}
        items={masterItems}
        onUpdateItems={updateMasterItems}
      />

      <MasterUnitModal
        isOpen={openMasterUnitModal}
        onClose={() => setOpenMasterUnitModal(false)}
        units={masterUnits}
        onUpdateUnits={updateMasterUnits}
      />

      <SheetSettingsModal
        isOpen={openSheetSettingsModal}
        onClose={() => setOpenSheetSettingsModal(false)}
        webhookUrl={googleSheetWebhookUrl}
        onSaveWebhookUrl={saveWebhookUrl}
      />

      <WhatsAppModal
        isOpen={openWhatsAppModal}
        onClose={() => setOpenWhatsAppModal(false)}
        reportText={generateWhatsAppReport()}
      />
    </div>
  );
}
