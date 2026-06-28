<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('tasks')->insert([
            [
                'teacher_id' => 1, // ID Guru (Bu Wahyu, S.Pd.)
                'class_id' => 1,   // XI Akuntansi dan Keuangan Lembaga 1
                'title' => 'Perhitungan PPh Pasal 21 Dasar',
                'description' => 'Hitunglah berapa besarnya PPh Pasal 21 terutang per bulan untuk seorang karyawan dengan PKP (Penghasilan Kena Pajak) setahun sebesar Rp 60.000.000 jika lapis tarif yang dikenakan adalah 5%. Masukkan hasil akhir berupa nominal angka saja tanpa titik, koma, atau Rp (Contoh: 250000).',
                'difficulty' => 'beginner',
                'tax_topic' => 'PPh Pasal 21',
                'source_type' => 'manual',
                'correct_answer' => '250000', // Nilai angka (60jt * 5% / 12 bulan)
                'xp_reward' => 30,
                'deadline' => Carbon::now()->addDays(5), // Deadline 5 hari ke depan
                'is_released' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'teacher_id' => 1, // ID Guru (Bu Wahyu, S.Pd.)
                'class_id' => 1,   // XI Akuntansi dan Keuangan Lembaga 1
                'title' => 'Studi Kasus Tarif PPN Terbaru',
                'description' => 'Toko Komputer "Bintang Tax" menjual sebuah laptop seharga Rp 10.000.000 sebelum pajak. Jika penyerahan barang tersebut dikenakan Pajak Pertambahan Nilai (PPN) dengan tarif umum yang berlaku saat ini sebesar 12%, berapakah nilai PPN yang harus dibayar oleh pembeli? Tuliskan dalam bentuk angka saja.',
                'difficulty' => 'intermediate',
                'tax_topic' => 'PPN',
                'source_type' => 'manual',
                'correct_answer' => '1200000', // Nilai angka (10jt * 12%)
                'xp_reward' => 60,
                'deadline' => Carbon::now()->addDays(7), // Deadline 7 hari ke depan
                'is_released' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        ]);
    }
}
