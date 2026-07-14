<?php

namespace App\Services;

/**
 * SptCaseGeneratorService
 *
 * Helper untuk SPT Maker (fitur guru). Tugasnya cuma satu: menerima input
 * "krusial" dari guru (penghasilan neto, status PTKP, kredit pajak, harta,
 * utang) lalu menyusunnya jadi struktur case_json lengkap A-K, siap disimpan
 * ke kolom `spt_assignments.case_json` dan siap dibaca oleh sistem submission
 * siswa (SptSubmission / halaman pengerjaan siswa).
 *
 * Locked: form ini SELALU jenis 1770 S/SS (SPT Tahunan Orang Pribadi).
 * Guru tidak bisa mengubah jenis form dari wizard.
 */
class SptCaseGeneratorService
{
    /** PTKP tahunan sesuai status perkawinan & jumlah tanggungan (maks. 3). */
    private const PTKP_RATES = [
        'TK/0' => 54_000_000,
        'TK/1' => 58_500_000,
        'TK/2' => 63_000_000,
        'TK/3' => 67_500_000,
        'K/0'  => 58_500_000,
        'K/1'  => 63_000_000,
        'K/2'  => 67_500_000,
        'K/3'  => 72_000_000,
    ];

    /** Lapisan tarif Pasal 17 UU HPP (progresif atas Penghasilan Kena Pajak). */
    private const TAX_BRACKETS = [
        ['limit' => 60_000_000,         'rate' => 0.05],
        ['limit' => 250_000_000,        'rate' => 0.15],
        ['limit' => 500_000_000,        'rate' => 0.25],
        ['limit' => 5_000_000_000,      'rate' => 0.30],
        ['limit' => PHP_INT_MAX,        'rate' => 0.35],
    ];

    /**
     * Bangun case_json lengkap (A-K) dari input wizard guru.
     *
     * @param  array{
     *     nama_wp: string,
     *     tahun_pajak: int,
     *     penghasilan_neto: float,
     *     status_ptkp: string,
     *     kredit_pajak: float,
     *     harta?: array<int, array{nama: string, tahun_perolehan?: int, harga_perolehan: float, keterangan?: string}>,
     *     utang?: array<int, array{nama_pemberi: string, tahun_pinjaman?: int, jumlah: float}>,
     * } $input
     * @return array<string, mixed>
     */
    public function generate(array $input): array
    {
        $penghasilanNeto = (float) ($input['penghasilan_neto'] ?? 0);
        $statusPtkp      = $this->normalizePtkpStatus($input['status_ptkp'] ?? 'TK/0');
        $ptkpAmount      = self::PTKP_RATES[$statusPtkp];
        $kreditPajak     = (float) ($input['kredit_pajak'] ?? 0);

        $pkp          = $this->hitungPkp($penghasilanNeto, $ptkpAmount);
        $pphTerutang  = $this->hitungPphTerutang($pkp);
        $selisih      = round($pphTerutang - $kreditPajak);
        $statusAkhir  = $this->tentukanStatusAkhir($selisih);

        $harta = collect($input['harta'] ?? [])->map(function ($item, $i) {
            return [
                'kode'             => 'H' . str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT),
                'nama_harta'       => $item['nama'] ?? '-',
                'tahun_perolehan'  => $item['tahun_perolehan'] ?? null,
                'harga_perolehan'  => (float) ($item['harga_perolehan'] ?? 0),
                'keterangan'       => $item['keterangan'] ?? null,
            ];
        })->values()->all();

        $utang = collect($input['utang'] ?? [])->map(function ($item, $i) {
            return [
                'kode'             => 'U' . str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT),
                'nama_pemberi'     => $item['nama_pemberi'] ?? '-',
                'tahun_pinjaman'   => $item['tahun_pinjaman'] ?? null,
                'jumlah'           => (float) ($item['jumlah'] ?? 0),
            ];
        })->values()->all();

        return [
            // Konstanta - dikunci, tidak bisa diubah lewat wizard.
            'jenis_formulir' => '1770 S/SS',
            'kategori_wp'    => 'Orang Pribadi',

            'A_identitas' => [
                'nama_wajib_pajak' => $input['nama_wp'] ?? '-',
                'tahun_pajak'      => (int) ($input['tahun_pajak'] ?? now_year()),
            ],

            'B_penghasilan_neto' => [
                'jumlah' => round($penghasilanNeto),
            ],

            'C_ptkp' => [
                'status_ptkp' => $statusPtkp,
                'jumlah'      => $ptkpAmount,
            ],

            'D_penghasilan_kena_pajak' => [
                'jumlah'    => $pkp,
                'formula'   => 'Penghasilan Neto - PTKP, dibulatkan ke bawah ribuan penuh',
            ],

            'E_pph_terutang' => [
                'jumlah'  => $pphTerutang,
                'rincian' => $this->rincianTarif($pkp),
            ],

            'F_kredit_pajak' => [
                'jumlah'    => round($kreditPajak),
                'sumber'    => 'Bukti Potong / dipotong pihak lain (mis. 1721-A1)',
            ],

            'G_status_akhir' => [
                'selisih' => $selisih,
                'status'  => $statusAkhir, // Nihil | Kurang Bayar | Lebih Bayar
            ],

            'H_angsuran_pph_25' => [
                'jumlah' => 0, // disederhanakan untuk simulasi siswa
            ],

            'I_harta' => $harta,

            'J_utang' => $utang,

            'K_pernyataan' => [
                'catatan' => 'Data disusun otomatis oleh SPT Maker berdasarkan input guru. '
                    . 'Digunakan sebagai kasus simulasi bagi siswa, bukan dokumen resmi DJP.',
            ],
        ];
    }

    /**
     * Ringkasan angka penting untuk Live Preview Card di sisi guru,
     * tanpa perlu membangun ulang seluruh case_json.
     */
    public function preview(array $input): array
    {
        $case = $this->generate($input);

        return [
            'pkp'          => $case['D_penghasilan_kena_pajak']['jumlah'],
            'pph_terutang' => $case['E_pph_terutang']['jumlah'],
            'kredit_pajak' => $case['F_kredit_pajak']['jumlah'],
            'selisih'      => $case['G_status_akhir']['selisih'],
            'status'       => $case['G_status_akhir']['status'],
        ];
    }

    private function normalizePtkpStatus(string $status): string
    {
        $status = strtoupper(trim($status));
        return array_key_exists($status, self::PTKP_RATES) ? $status : 'TK/0';
    }

    private function hitungPkp(float $penghasilanNeto, int $ptkp): int
    {
        $pkp = max(0, $penghasilanNeto - $ptkp);
        // Pembulatan ke bawah ribuan penuh, sesuai ketentuan Pasal 17.
        return (int) (floor($pkp / 1000) * 1000);
    }

    private function hitungPphTerutang(int $pkp): int
    {
        $sisa = $pkp;
        $batasBawah = 0;
        $total = 0;

        foreach (self::TAX_BRACKETS as $bracket) {
            if ($sisa <= 0) {
                break;
            }
            $lebarLapisan = $bracket['limit'] - $batasBawah;
            $kenaDiLapisanIni = min($sisa, $lebarLapisan);
            $total += $kenaDiLapisanIni * $bracket['rate'];
            $sisa -= $kenaDiLapisanIni;
            $batasBawah = $bracket['limit'];
        }

        return (int) round($total);
    }

    private function rincianTarif(int $pkp): array
    {
        $sisa = $pkp;
        $batasBawah = 0;
        $rincian = [];

        foreach (self::TAX_BRACKETS as $bracket) {
            if ($sisa <= 0) {
                break;
            }
            $lebarLapisan = $bracket['limit'] - $batasBawah;
            $kenaDiLapisanIni = min($sisa, $lebarLapisan);

            if ($kenaDiLapisanIni > 0) {
                $rincian[] = [
                    'lapisan'    => $batasBawah,
                    'tarif'      => $bracket['rate'] * 100 . '%',
                    'dasar'      => (int) $kenaDiLapisanIni,
                    'pajak'      => (int) round($kenaDiLapisanIni * $bracket['rate']),
                ];
            }

            $sisa -= $kenaDiLapisanIni;
            $batasBawah = $bracket['limit'];
        }

        return $rincian;
    }

    private function tentukanStatusAkhir(float $selisih): string
    {
        if ($selisih === 0.0) {
            return 'Nihil';
        }
        return $selisih > 0 ? 'Kurang Bayar' : 'Lebih Bayar';
    }
}

if (!function_exists('now_year')) {
    function now_year(): int
    {
        return (int) date('Y');
    }
}
