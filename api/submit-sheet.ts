export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Gunakan POST.' });
  }

  try {
    const { items, customWebhookUrl } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Data barang tidak boleh kosong.' });
    }

    // Format data strictly into 5 columns: Tanggal, Nama Barang, Qty, Kuantitas, Keterangan
    const formattedRows = items.map((item: any) => ({
      Tanggal: String(item.tanggal || '').trim(),
      'Nama Barang': String(item.nama_barang || '').trim(),
      Qty: Number(item.qty) || 0,
      Kuantitas: String(item.kuantitas || '').trim(),
      Keterangan: String(item.keterangan || '').trim(),
    }));

    // Ambil Webhook URL dari environment variable Vercel atau dari request
    const webhookUrl = (customWebhookUrl || process.env.GOOGLE_SHEET_WEBHOOK_URL || '').trim();

    if (!webhookUrl) {
      return res.status(200).json({
        success: true,
        sheetSyncStatus: 'skipped_no_webhook',
        message: 'Data diterima di backend Vercel, namun GOOGLE_SHEET_WEBHOOK_URL belum disetting di environment variables Vercel.',
        rows: formattedRows,
      });
    }

    const payload = {
      action: 'appendRows',
      columns: ['Tanggal', 'Nama Barang', 'Qty', 'Kuantitas', 'Keterangan'],
      rows: formattedRows,
    };

    const sheetResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (sheetResponse.ok) {
      return res.status(200).json({
        success: true,
        sheetSyncStatus: 'synced',
        message: 'Berhasil dikirim ke Google Spreadsheet!',
        rows: formattedRows,
      });
    } else {
      const errText = await sheetResponse.text();
      return res.status(502).json({
        success: false,
        sheetSyncStatus: 'failed',
        message: `Google Spreadsheet mengembalikan respon error: ${sheetResponse.status}`,
        details: errText.slice(0, 200),
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      error: 'Terjadi kesalahan pada backend Vercel.',
      details: error?.message || String(error),
    });
  }
}
