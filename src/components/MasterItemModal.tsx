import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, Search, Package, AlertCircle } from 'lucide-react';

interface MasterItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: string[];
  onUpdateItems: (newItems: string[]) => void;
}

export const MasterItemModal: React.FC<MasterItemModalProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateItems,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newItemText.trim();
    if (!trimmed) return;

    if (items.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      showToast('Barang tersebut sudah ada di daftar!');
      return;
    }

    const updated = [...items, trimmed];
    onUpdateItems(updated);
    setNewItemText('');
    showToast(`"${trimmed}" berhasil ditambahkan!`);
  };

  const handleBulkAdd = () => {
    const lines = bulkInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    const existingLower = new Set(items.map((i) => i.toLowerCase()));
    const toAdd: string[] = [];

    lines.forEach((line) => {
      if (!existingLower.has(line.toLowerCase())) {
        existingLower.add(line.toLowerCase());
        toAdd.push(line);
      }
    });

    if (toAdd.length === 0) {
      showToast('Semua barang yang diinput sudah ada di daftar.');
      return;
    }

    const updated = [...items, ...toAdd];
    onUpdateItems(updated);
    setBulkInput('');
    setShowBulkAdd(false);
    showToast(`${toAdd.length} barang baru berhasil ditambahkan!`);
  };

  const handleDeleteItem = (indexToDelete: number) => {
    const itemToDelete = items[indexToDelete];
    const updated = items.filter((_, idx) => idx !== indexToDelete);
    onUpdateItems(updated);
    showToast(`"${itemToDelete}" dihapus.`);
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(items[index]);
  };

  const handleSaveEdit = (index: number) => {
    const trimmed = editingValue.trim();
    if (!trimmed) return;

    const updated = [...items];
    updated[index] = trimmed;
    onUpdateItems(updated);
    setEditingIndex(null);
    showToast('Nama barang berhasil diperbarui!');
  };

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#FAF4DF] border-3 border-black rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#9bd2a2] px-5 py-4 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-black" />
            <div>
              <h2 className="text-lg font-black text-black uppercase tracking-wide">
                Kelola Daftar Barang
              </h2>
              <p className="text-xs text-gray-800 font-medium">
                Update dan atur barang untuk kolom Cari / Pilih Barang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/80 border-2 border-black hover:bg-white text-black transition"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification pill */}
        {notification && (
          <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 text-xs font-semibold text-amber-900 flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-amber-700" />
            <span>{notification}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Quick Add Form */}
          <form onSubmit={handleAddItem} className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-black">
              Tambah Barang Baru
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Contoh: Kabel NYM 3x2.5mm atau Isolasi Hitam"
                className="flex-1 bg-white border-2 border-black rounded-xl px-3.5 py-2 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-black"
              />
              <button
                type="submit"
                className="bg-[#9bd2a2] hover:bg-[#85c48d] text-black border-2 border-black font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition text-sm active:translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowBulkAdd(!showBulkAdd)}
                className="text-xs font-semibold text-blue-700 underline hover:text-blue-900 cursor-pointer"
              >
                {showBulkAdd ? 'Tutup Tambah Massal' : '+ Tambah Banyak Sekaligus (Bulk Add)'}
              </button>
            </div>
          </form>

          {/* Bulk Add Input Area */}
          {showBulkAdd && (
            <div className="bg-white border-2 border-black rounded-xl p-3 space-y-2">
              <label className="text-xs font-bold text-gray-700">
                Tempel daftar nama barang (1 nama per baris):
              </label>
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                rows={3}
                placeholder="Isolasi Kertas&#10;Kabel NYA 1x2.5mm&#10;Klem Pipa KMI"
                className="w-full text-xs font-mono border border-gray-400 rounded-lg p-2 focus:outline-hidden focus:border-black"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkAdd(false)}
                  className="px-3 py-1 text-xs border border-gray-400 rounded-lg hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleBulkAdd}
                  className="px-3 py-1 text-xs bg-[#8bc4fa] border-2 border-black font-bold rounded-lg hover:brightness-95"
                >
                  Simpan Semua
                </button>
              </div>
            </div>
          )}

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Cari dari total ${items.length} barang...`}
              className="w-full pl-9 pr-3 py-2 bg-white border-2 border-black rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Item List */}
          <div className="bg-white border-2 border-black rounded-xl overflow-hidden divide-y divide-gray-200 max-h-60 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                Tidak ada barang yang cocok dengan pencarian.
              </div>
            ) : (
              filteredItems.map((item) => {
                const actualIndex = items.indexOf(item);
                const isEditing = editingIndex === actualIndex;

                return (
                  <div
                    key={item + actualIndex}
                    className="p-2.5 flex items-center justify-between gap-2 hover:bg-yellow-50/50 transition group"
                  >
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border-2 border-black rounded-lg focus:outline-hidden"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(actualIndex);
                            if (e.key === 'Escape') setEditingIndex(null);
                          }}
                        />
                        <button
                          onClick={() => handleSaveEdit(actualIndex)}
                          className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 border border-black"
                          title="Simpan"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="p-1.5 bg-gray-300 text-black rounded-lg hover:bg-gray-400 border border-black"
                          title="Batal"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-semibold text-black truncate">
                          {item}
                        </span>
                        <div className="flex items-center gap-1 opacity-90 sm:opacity-70 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleStartEdit(actualIndex)}
                            className="p-1.5 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition"
                            title="Edit nama barang"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(actualIndex)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                            title="Hapus barang"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#fce59f] px-5 py-3 border-t-2 border-black flex items-center justify-between text-xs font-bold text-gray-800">
          <span>Total: {items.length} Jenis Barang</span>
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
