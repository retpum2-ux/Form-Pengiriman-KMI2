import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const MASTER_FILE = path.join(DATA_DIR, 'master_data.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Default master data
const defaultMaster = {
  items: [
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
    'Pita Pengikat Steel Strapping'
  ],
  units: [
    'pcs',
    'roll',
    'box',
    'meter',
    'drum',
    'kg',
    'lembar',
    'pack',
    'set',
    'batang'
  ]
};

function readJsonFile(filePath: string, defaultValue: any) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultValue;
}

function writeJsonFile(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // 1. Master Data API (Get & Update Barang & Kuantitas)
  app.get('/api/master-data', (req: Request, res: Response) => {
    const data = readJsonFile(MASTER_FILE, defaultMaster);
    res.json(data);
  });

  app.post('/api/master-data', (req: Request, res: Response) => {
    const { items, units } = req.body;
    const current = readJsonFile(MASTER_FILE, defaultMaster);
    const updated = {
      items: Array.isArray(items) ? items : current.items,
      units: Array.isArray(units) ? units : current.units
    };
    writeJsonFile(MASTER_FILE, updated);
    res.json({ success: true, data: updated });
  });

  // 2. Settings API (Spreadsheet Webhook URL)
  app.get('/api/config', (req: Request, res: Response) => {
    const config = readJsonFile(CONFIG_FILE, {
      googleSheetWebhookUrl: process.env.GOOGLE_SHEET_WEBHOOK_URL || ''
    });
    res.json(config);
  });

  app.post('/api/config', (req: Request, res: Response) => {
    const { googleSheetWebhookUrl } = req.body;
    const config = { googleSheetWebhookUrl: (googleSheetWebhookUrl || '').trim() };
    writeJsonFile(CONFIG_FILE, config);
    res.json({ success: true, config });
  });

  // 3. History API (Stored submissions)
  app.get('/api/history', (req: Request, res: Response) => {
    const history = readJsonFile(HISTORY_FILE, []);
    res.json(history);
  });

  // 4. Submit to Google Spreadsheet API
  // Strict fields: (Tanggal, Nama Barang, Qty, Kuantitas, Keterangan)
  app.post('/api/submit-sheet', async (req: Request, res: Response) => {
    try {
      const { items, customWebhookUrl } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Tidak ada data barang yang dikirim.' });
      }

      // Format rows strictly with only the 5 required columns
      const formattedRows = items.map((item: any) => ({
        Tanggal: String(item.tanggal || '').trim(),
        'Nama Barang': String(item.nama_barang || '').trim(),
        Qty: Number(item.qty) || 0,
        Kuantitas: String(item.kuantitas || '').trim(),
        Keterangan: String(item.keterangan || '').trim()
      }));

      // Validate that mandatory fields are present
      for (const row of formattedRows) {
        if (!row.Tanggal || !row['Nama Barang']) {
          return res.status(400).json({
            error: 'Tanggal dan Nama Barang wajib diisi untuk setiap baris.'
          });
        }
      }

      // Check configured webhook URL
      const config = readJsonFile(CONFIG_FILE, {
        googleSheetWebhookUrl: process.env.GOOGLE_SHEET_WEBHOOK_URL || ''
      });
      const webhookUrl = (customWebhookUrl || config.googleSheetWebhookUrl || '').trim();

      let sheetSyncStatus = 'skipped_no_webhook';
      let sheetSyncMessage = 'Data disimpan secara lokal di backend. Webhook Google Spreadsheet belum dikonfigurasi.';

      if (webhookUrl) {
        try {
          // Send payload to Google Sheets Webhook (Apps Script)
          // We send both array of objects and 2D row array for maximum compatibility
          const payload = {
            action: 'appendRows',
            columns: ['Tanggal', 'Nama Barang', 'Qty', 'Kuantitas', 'Keterangan'],
            rows: formattedRows
          };

          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            sheetSyncStatus = 'synced';
            sheetSyncMessage = 'Berhasil terkirim dan disinkronkan ke Google Spreadsheet!';
          } else {
            const respText = await response.text();
            sheetSyncStatus = 'failed';
            sheetSyncMessage = `Google Spreadsheet webhook mengembalikan status ${response.status}: ${respText.slice(0, 100)}`;
          }
        } catch (fetchErr: any) {
          console.error('Spreadsheet webhook fetch error:', fetchErr);
          sheetSyncStatus = 'error';
          sheetSyncMessage = `Gagal menghubungi Google Spreadsheet: ${fetchErr?.message || 'Network error'}`;
        }
      }

      // Save to local history
      const historyRecord = {
        id: 'KMI-' + Date.now(),
        submittedAt: new Date().toISOString(),
        rows: formattedRows,
        sheetSyncStatus,
        sheetSyncMessage
      };

      const history = readJsonFile(HISTORY_FILE, []);
      history.unshift(historyRecord);
      // Keep latest 100 records
      if (history.length > 100) history.pop();
      writeJsonFile(HISTORY_FILE, history);

      res.json({
        success: true,
        message: sheetSyncStatus === 'synced'
          ? 'Data berhasil disimpan dan masuk ke Google Spreadsheet!'
          : 'Data berhasil disimpan di sistem! ' + sheetSyncMessage,
        sheetSyncStatus,
        sheetSyncMessage,
        recordId: historyRecord.id,
        savedRows: formattedRows
      });
    } catch (err: any) {
      console.error('Submit sheet error:', err);
      res.status(500).json({ error: err?.message || 'Internal server error' });
    }
  });

  // Setup Vite in Dev or serve static in Prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
