export interface DeliveryItem {
  id: string;
  nama_barang: string;
  qty: number | '' | string;
  kuantitas: string;
  keterangan: string;
}

export interface MasterData {
  items: string[];
  units: string[];
}

export interface SheetRow {
  Tanggal: string;
  'Nama Barang': string;
  Qty: number;
  Kuantitas: string;
  Keterangan: string;
}

export interface HistoryRecord {
  id: string;
  submittedAt: string;
  rows: SheetRow[];
  sheetSyncStatus: 'synced' | 'failed' | 'skipped_no_webhook' | 'error';
  sheetSyncMessage: string;
}
