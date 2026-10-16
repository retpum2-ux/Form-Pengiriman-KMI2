import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, Scale, AlertCircle } from 'lucide-react';

interface MasterUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: string[];
  onUpdateUnits: (newUnits: string[]) => void;
}

export const MasterUnitModal: React.FC<MasterUnitModalProps> = ({
  isOpen,
  onClose,
  units,
  onUpdateUnits,
}) => {
  const [newUnitText, setNewUnitText] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleAddUnit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newUnitText.trim().toLowerCase();
    if (!trimmed) return;

    if (units.some((u) => u.toLowerCase() === trimmed)) {
      showToast(`Satuan "${trimmed}" sudah ada!`);
      return;
    }

    const updated = [...units, trimmed];
    onUpdateUnits(updated);
    setNewUnitText('');
    showToast(`Satuan "${trimmed}" berhasil ditambahkan!`);
  };

  const handleDeleteUnit = (indexToDelete: number) => {
    const unitToDelete = units[indexToDelete];
    const updated = units.filter((_, idx) => idx !== indexToDelete);
    onUpdateUnits(updated);
    showToast(`Satuan "${unitToDelete}" dihapus.`);
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(units[index]);
  };

  const handleSaveEdit = (index: number) => {
    const trimmed = editingValue.trim().toLowerCase();
    if (!trimmed) return;

    const updated = [...units];
    updated[index] = trimmed;
    onUpdateUnits(updated);
    setEditingIndex(null);
    showToast('Satuan kuantitas berhasil diperbarui!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#FAF4DF] border-3 border-black rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#9bd2a2] px-5 py-4 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-black" />
            <div>
              <h2 className="text-lg font-black text-black uppercase tracking-wide">
                Kelola Satuan Kuantitas
              </h2>
              <p className="text-xs text-gray-800 font-medium">
                Daftar pilihan kuantitas (pcs, roll, box, meter, drum, dll)
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

        {/* Notification toast */}
        {notification && (
          <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 text-xs font-semibold text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700" />
            <span>{notification}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Quick Add Form */}
          <form onSubmit={handleAddUnit} className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-black">
              Tambah Satuan Baru
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newUnitText}
                onChange={(e) => setNewUnitText(e.target.value)}
                placeholder="Contoh: pcs, roll, drum, meter, box"
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
          </form>

          {/* Quick Unit Chips */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-600 uppercase">
              Rekomendasi Cepat:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['pcs', 'roll', 'box', 'meter', 'drum', 'kg', 'pack', 'set', 'batang', 'pail'].map(
                (quick) => {
                  const alreadyExists = units.some((u) => u.toLowerCase() === quick);
                  return (
                    <button
                      key={quick}
                      type="button"
                      disabled={alreadyExists}
                      onClick={() => {
                        onUpdateUnits([...units, quick]);
                        showToast(`Satuan "${quick}" ditambahkan!`);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition ${
                        alreadyExists
                          ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                          : 'bg-white hover:bg-yellow-100 text-black border-black cursor-pointer'
                      }`}
                    >
                      {alreadyExists ? `✓ ${quick}` : `+ ${quick}`}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Units List */}
          <div className="bg-white border-2 border-black rounded-xl overflow-hidden divide-y divide-gray-200 max-h-56 overflow-y-auto">
            {units.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                Belum ada satuan kuantitas.
              </div>
            ) : (
              units.map((unit, index) => {
                const isEditing = editingIndex === index;

                return (
                  <div
                    key={unit + index}
                    className="p-2.5 flex items-center justify-between gap-2 hover:bg-yellow-50/50 transition"
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
                            if (e.key === 'Enter') handleSaveEdit(index);
                            if (e.key === 'Escape') setEditingIndex(null);
                          }}
                        />
                        <button
                          onClick={() => handleSaveEdit(index)}
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
                        <span className="text-sm font-bold text-black tracking-wide">
                          {unit}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(index)}
                            className="p-1.5 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition"
                            title="Edit satuan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUnit(index)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                            title="Hapus satuan"
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
          <span>Total: {units.length} Satuan</span>
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
