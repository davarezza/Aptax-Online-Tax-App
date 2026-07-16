<?php

namespace App\Services\Student;

use App\Models\Student\SptSubmission;
use App\Models\Teacher\SptAssignment;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * SptWizardService
 *
 * "Otak" dari simulasi SPT siswa. Wizard ini SENGAJA tidak memakai LLM untuk
 * menilai jawaban — penilaian harus deterministik & adil, jadi setiap
 * langkah divalidasi langsung terhadap angka yang sudah dihitung pasti oleh
 * SptCaseGeneratorService (tersimpan di case_json soal). Nada "asisten pajak
 * cerdas" (Tax Wizard) didapat dari teks template per langkah, bukan dari
 * model bahasa yang bisa halusinasi angka pajak.
 */
class SptWizardService
{
    /**
     * Urutan langkah wizard. `langkah` = nomor besar (1-7) sesuai instruksi
     * guru; satu langkah besar bisa berisi beberapa micro-step.
     */
    public function steps(array $ringkasan): array
    {
        return [
            [
                'id' => 'welcome', 'langkah' => 1, 'judul' => 'Arsip & Data',
                'type' => 'info',
                'system' => "Halo {$ringkasan['nama_wp']}! Aku Tax Wizard, asisten pajakmu di ApTax. "
                    . "Sistem sudah mendeteksi data Bukti Potong (1721-A1) kamu secara otomatis, jadi kamu "
                    . "tidak perlu unggah file apa pun. Yuk kita cek datanya dulu.",
                'action_label' => 'Data Sudah Benar, Lanjut',
            ],
            [
                'id' => 'a1', 'langkah' => 2, 'judul' => 'Bagian A - Profil (A.1)',
                'type' => 'confirm', 'expected' => 'tidak',
                'system' => 'Bagian A.1: Apakah kamu punya penghasilan dari usaha sampingan atau pekerjaan bebas (freelance, dagang, dll)?',
            ],
            [
                'id' => 'a2', 'langkah' => 2, 'judul' => 'Bagian A - Profil (A.2)',
                'type' => 'confirm', 'expected' => 'tidak',
                'system' => 'Bagian A.2: Apakah kamu punya penghasilan dalam negeri lainnya, seperti sewa atau hadiah?',
            ],
            [
                'id' => 'a3', 'langkah' => 2, 'judul' => 'Bagian A - Profil (A.3)',
                'type' => 'confirm', 'expected' => 'tidak',
                'system' => 'Bagian A.3: Apakah kamu punya penghasilan dari luar negeri?',
            ],
            [
                'id' => 'a4', 'langkah' => 2, 'judul' => 'Bagian A - Profil (A.4)',
                'type' => 'confirm', 'expected' => 'tidak',
                'system' => 'Bagian A.4: Apakah kamu punya kewajiban membayar angsuran PPh Pasal 25 sendiri?',
            ],
            [
                'id' => 'ptkp_status', 'langkah' => 3, 'judul' => 'Bagian B - PTKP',
                'type' => 'choice', 'expected' => $ringkasan['status_ptkp'],
                'options' => ['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3'],
                'system' => 'Sekarang mari hitung Penghasilan Kena Pajak. Berdasarkan status pernikahan & tanggungan yang tertulis di data kasus, status PTKP mana yang berlaku untukmu?',
            ],
            [
                'id' => 'pkp', 'langkah' => 3, 'judul' => 'Bagian B - PKP',
                'type' => 'number', 'expected' => $ringkasan['pkp'],
                'system' => "Penghasilan Neto kamu setahun: Rp" . number_format($ringkasan['penghasilan_neto'], 0, ',', '.')
                    . ". Hitung Penghasilan Kena Pajak (PKP) = Penghasilan Neto − PTKP. Masukkan hasilnya (angka saja).",
            ],
            [
                'id' => 'pph_terutang', 'langkah' => 3, 'judul' => 'Bagian B - PPh Terutang',
                'type' => 'number', 'expected' => $ringkasan['pph_terutang'],
                'system' => 'Mantap! Sekarang hitung PPh Terutang setahun dari PKP tadi menggunakan tarif progresif Pasal 17 (5%/15%/25%/30%/35%). Masukkan hasilnya (angka saja).',
            ],
            [
                'id' => 'kredit_info', 'langkah' => 4, 'judul' => 'Bagian C, D, H - Kredit Pajak',
                'type' => 'info',
                'system' => "Sistem mendeteksi Kredit Pajak (dipotong pihak lain) sebesar Rp"
                    . number_format($ringkasan['kredit_pajak'], 0, ',', '.') . " dari Bukti Potong kamu.",
                'action_label' => 'Lanjut',
            ],
            [
                'id' => 'status_akhir', 'langkah' => 4, 'judul' => 'Bagian C, D, H - Status SPT',
                'type' => 'choice', 'expected' => $ringkasan['status_akhir'],
                'options' => ['Nihil', 'Kurang Bayar', 'Lebih Bayar'],
                'system' => 'Bandingkan PPh Terutang dengan Kredit Pajak tadi. Menurutmu, status SPT kamu tahun ini apa?',
            ],
            [
                'id' => 'info_final', 'langkah' => 5, 'judul' => 'Bagian F & G',
                'type' => 'info',
                'system' => $this->pesanInfoFinal($ringkasan),
                'action_label' => 'Data Sudah Sesuai, Lanjut',
            ],
            [
                'id' => 'info_harta', 'langkah' => 6, 'judul' => 'Bagian L-1 - Harta Bergerak',
                'type' => 'info',
                'system' => $this->pesanInfoHarta($ringkasan),
                'action_label' => 'Tambahkan ke Laporan',
            ],
            [
                'id' => 'verifikasi', 'langkah' => 7, 'judul' => 'Bagian I, J, K - Verifikasi',
                'type' => 'verify_token',
                'system' => 'Langkah terakhir! Aku sudah membuatkan kode verifikasi acak sebagai simulasi kata sandi digital. Ketik ulang kode di bawah ini untuk melanjutkan.',
            ],
            [
                'id' => 'kirim', 'langkah' => 7, 'judul' => 'Kirim SPT',
                'type' => 'submit',
                'system' => 'Semua langkah sudah lengkap. Tekan tombol di bawah untuk mengirim SPT kamu.',
                'action_label' => 'Kirim SPT',
            ],
        ];
    }

    /** Step yang dinilai benar/salah (dipakai untuk skor akhir). */
    public function gradedStepIds(): array
    {
        return ['a1', 'a2', 'a3', 'a4', 'ptkp_status', 'pkp', 'pph_terutang', 'status_akhir'];
    }

    private function pesanInfoFinal(array $r): string
    {
        $lines = [];
        if (! empty($r['penghasilan_final'])) {
            $pf = $r['penghasilan_final'];
            $lines[] = "Kamu tercatat memiliki penghasilan final dari {$pf['sumber']} sebesar Rp"
                . number_format($pf['bruto'], 0, ',', '.') . ", sudah dipotong PPh Final Rp"
                . number_format($pf['pph'], 0, ',', '.') . '. Ini dilaporkan terpisah, tidak memengaruhi PPh Terutang di atas.';
        } else {
            $lines[] = 'Kamu tidak memiliki penghasilan final yang perlu dilaporkan tahun ini.';
        }

        if (count($r['utang'] ?? []) > 0) {
            foreach ($r['utang'] as $u) {
                $lines[] = "Utang tercatat: {$u['nama_pemberi']} sebesar Rp" . number_format($u['jumlah'], 0, ',', '.') . '.';
            }
        } else {
            $lines[] = 'Tidak ada utang yang perlu dilaporkan.';
        }

        $lines[] = 'Karena kamu berstatus karyawan, laporan keuanganmu tidak perlu diaudit akuntan publik.';

        return implode("\n", $lines);
    }

    private function pesanInfoHarta(array $r): string
    {
        if (count($r['harta'] ?? []) === 0) {
            return 'Tidak ada harta bergerak baru yang perlu dilaporkan tahun ini.';
        }

        $lines = ['Berikut harta bergerak yang akan ditambahkan ke laporan:'];
        foreach ($r['harta'] as $h) {
            $lines[] = "- {$h['nama_harta']}, tahun {$h['tahun_perolehan']}, senilai Rp" . number_format($h['harga_perolehan'], 0, ',', '.') . '.';
        }

        return implode("\n", $lines);
    }

    /** Data "terdeteksi otomatis" untuk Langkah 1 (simulasi tanpa unggah file). */
    public function detectedData(SptAssignment $assignment, array $ringkasan): array
    {
        return [
            'nama_wp'       => $ringkasan['nama_wp'],
            'npwp_simulasi' => $this->npwpSimulasi($assignment->id),
            'tahun_pajak'   => $ringkasan['tahun_pajak'],
            'pemberi_kerja' => $ringkasan['pemberi_kerja'] ?? '-',
            'penghasilan_neto' => $ringkasan['penghasilan_neto'],
        ];
    }

    private function npwpSimulasi(int $assignmentId): string
    {
        $digits = str_pad((string) $assignmentId, 9, '0', STR_PAD_LEFT);
        return substr($digits, 0, 2) . '.' . substr($digits, 2, 3) . '.' . substr($digits, 5, 3) . '.0-000.000';
    }

    /**
     * Validasi satu jawaban terhadap step yang sedang berjalan.
     * Angka ditoleransi selisih kecil (pembulatan) supaya tidak terlalu kaku.
     */
    public function evaluate(array $step, mixed $value): bool
    {
        return match ($step['type']) {
            'confirm' => strtolower(trim((string) $value)) === $step['expected'],
            'choice'  => trim((string) $value) === (string) $step['expected'],
            'number'  => abs(((float) $value) - ((float) $step['expected'])) < 1,
            default   => true,
        };
    }

    /** Buat kode verifikasi acak 6 digit untuk simulasi Bagian I/J/K. */
    public function buatTokenVerifikasi(): string
    {
        return (string) random_int(100000, 999999);
    }

    /**
     * Finalisasi submission: hitung skor, tentukan XP (dipotong 50% kalau
     * telat), buat nomor BPE, tambahkan XP ke total_exp siswa.
     */
    public function finalize(SptSubmission $submission, SptAssignment $assignment, int $wrongAttemptsTotal): array
    {
        $isLate = now()->greaterThan($assignment->deadline);

        $score = max(0, 100 - ($wrongAttemptsTotal * 5));
        if ($isLate) {
            $score = max(0, $score - 20);
        }

        $xpAwarded = $isLate
            ? (int) floor($assignment->xp_reward * 0.5)
            : $assignment->xp_reward;

        $bpeNumber = 'BPE-' . $assignment->case_json['A_identitas']['tahun_pajak']
            . '-' . str_pad((string) $submission->id, 6, '0', STR_PAD_LEFT)
            . '-' . strtoupper(Str::random(4));

        $formData = $submission->form_data ?? [];
        $formData['xp_awarded'] = $xpAwarded;
        $formData['is_late'] = $isLate;

        $submission->update([
            'status'      => 'evaluation',
            'final_score' => $score,
            'bpe_number'  => $bpeNumber,
            'form_data'   => $formData,
        ]);

        User::where('id', $submission->student_id)->increment('total_exp', $xpAwarded);

        return [
            'score'      => $score,
            'xp_awarded' => $xpAwarded,
            'is_late'    => $isLate,
            'bpe_number' => $bpeNumber,
        ];
    }
}
