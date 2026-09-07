/**
 * Standarisasi Penomoran Surat Resmi PT. NISKALA TECH ID
 * Format Baku: [NOMOR_URUT]/[KODE_KATEGORI]/NISKALA/[BULAN_ROMAWI]/[TAHUN]
 * 
 * Kode Kategori Surat:
 * - LPS : Laporan Bagi Hasil Venue Partner (Snapcala)
 * - LPI : Laporan Bagi Hasil Investor (Sukuk Projek)
 * - INV : Invoice / Tagihan Pembayaran
 * - QUO : Quotation / Surat Penawaran Price SOW
 * - LK  : Laporan Keuangan (Arus Kas / Profit Loss)
 * - KWT : Kwitansi Pembayaran
 */

export type DocCategoryCode = 'LPS' | 'LPI' | 'INV' | 'QUO' | 'LK' | 'KWT';

export function getRomanMonth(dateInput?: string | Date): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  const validDate = isNaN(d.getTime()) ? new Date() : d;
  const monthIndex = validDate.getMonth(); // 0 - 11
  const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romanMonths[monthIndex] || 'I';
}

export function getDocYear(dateInput?: string | Date): number {
  const d = dateInput ? new Date(dateInput) : new Date();
  const validDate = isNaN(d.getTime()) ? new Date() : d;
  return validDate.getFullYear();
}

/**
 * Menghasilkan Nomor Surat Terstandar Baku secara Otomatis
 * @param categoryCode Kode kategori dokumen
 * @param seqNumber Nomor urut (1-indexed)
 * @param dateInput Tanggal transaksi/pembuatan (opsional)
 * @param subIndex Index urut sub-investor (opsional)
 */
export function generateDocNumber(
  categoryCode: DocCategoryCode,
  seqNumber: number,
  dateInput?: string | Date,
  subIndex?: number
): string {
  const paddedSeq = String(Math.max(1, seqNumber)).padStart(3, '0');
  const romanMonth = getRomanMonth(dateInput);
  const year = getDocYear(dateInput);
  
  const subStr = subIndex !== undefined ? `.${subIndex}` : '';
  
  return `${paddedSeq}${subStr}/${categoryCode}/NISKALA/${romanMonth}/${year}`;
}
