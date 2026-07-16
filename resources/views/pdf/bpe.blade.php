<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #1F2937; padding: 40px; }
        .header { text-align: center; border-bottom: 3px solid #1A6B3C; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { color: #1A6B3C; font-size: 20px; margin: 0; }
        .header p { font-size: 11px; color: #6B7280; margin: 4px 0 0; }
        .badge { display: inline-block; background: #E7F3EC; color: #1A6B3C; font-size: 10px; font-weight: bold; padding: 4px 10px; border-radius: 12px; margin-top: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        td { padding: 10px 0; font-size: 12px; border-bottom: 1px solid #F3F4F6; }
        td.label { color: #6B7280; width: 40%; }
        td.value { font-weight: bold; text-align: right; }
        .bpe-number { text-align: center; margin-top: 28px; padding: 16px; background: #F4F6F9; border-radius: 8px; }
        .bpe-number p:first-child { font-size: 10px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; margin: 0; }
        .bpe-number p:last-child { font-size: 16px; font-weight: bold; color: #1A6B3C; margin: 4px 0 0; }
        .footer { margin-top: 40px; font-size: 9px; color: #9CA3AF; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Bukti Penerimaan Elektronik (BPE)</h1>
        <p>Simulasi SPT Tahunan PPh Orang Pribadi — Platform ApTax</p>
        <span class="badge">{{ $jenis_spt }}</span>
    </div>

    <table>
        <tr>
            <td class="label">Nama Wajib Pajak</td>
            <td class="value">{{ $nama_wp }}</td>
        </tr>
        <tr>
            <td class="label">NPWP (Simulasi)</td>
            <td class="value">{{ $npwp_simulasi }}</td>
        </tr>
        <tr>
            <td class="label">Tahun Pajak</td>
            <td class="value">{{ $tahun_pajak }}</td>
        </tr>
        <tr>
            <td class="label">Jenis SPT</td>
            <td class="value">{{ $jenis_spt }}</td>
        </tr>
        <tr>
            <td class="label">Status SPT</td>
            <td class="value">{{ $status_akhir }}{{ $status_akhir !== 'Nihil' ? ' — Rp' . number_format($selisih, 0, ',', '.') : '' }}</td>
        </tr>
        <tr>
            <td class="label">Tanggal Penerimaan</td>
            <td class="value">{{ $tanggal }}</td>
        </tr>
    </table>

    <div class="bpe-number">
        <p>Nomor Tanda Terima Elektronik</p>
        <p>{{ $bpe_number }}</p>
    </div>

    <div class="footer">
        Dokumen ini adalah hasil simulasi pembelajaran di platform ApTax dan bukan merupakan dokumen resmi
        Direktorat Jenderal Pajak (DJP). Digunakan semata-mata untuk tujuan edukasi.
    </div>
</body>
</html>
