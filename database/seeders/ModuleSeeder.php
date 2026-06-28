<?php

namespace Database\Seeders;

use App\Models\Student\Module;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            [
                'title' => 'Modul 1: Pengantar dan Konsep Dasar Perpajakan',
                'order_position' => 1,
                'content' => '
                    <h3>Selamat Datang di Kelas Pajak!</h3>
                    <p>Pajak merupakan kontribusi wajib kepada negara yang terutang oleh orang pribadi atau badan yang bersifat memaksa berdasarkan Undang-Undang. Pada modul pertama ini, kita akan mempelajari mengapa pajak itu ada dan bagaimana ia dikelola di Indonesia.</p>

                    <br>

                    <h4>1. Fungsi Utama Pajak</h4>
                    <p>Secara umum, pajak memiliki dua fungsi paling krusial dalam perekonomian negara:</p>
                    <ul>
                        <li><strong>Fungsi Budgetair (Sumber Keuangan):</strong> Pajak digunakan sebagai alat untuk memasukkan dana secara optimal ke kas negara berdasarkan undang-undang. Dana ini dipakai untuk membiayai pengeluaran rutin negara.</li>
                        <li><strong>Fungsi Regulerend (Pengatur):</strong> Pajak digunakan sebagai alat untuk mengatur atau mencapai tujuan tertentu di bidang ekonomi, sosial, dan budaya. Contohnya: memberikan insentif pajak untuk menarik investasi luar negeri.</li>
                    </ul>

                    <br>

                    <h4>2. Asas Pemungutan Pajak</h4>
                    <p>Menurut Adam Smith dalam bukunya <em>The Wealth of Nations</em>, pemungutan pajak harus memenuhi asas <strong>"The Four Maxims"</strong>:</p>
                    <ol>
                        <li><strong>Equality:</strong> Pemungutan pajak harus adil dan merata.</li>
                        <li><strong>Certainty:</strong> Penetapan pajak tidak boleh sewenang-wenang (harus jelas kepastian hukumnya).</li>
                        <li><strong>Convenience of Payment:</strong> Pajak dipungut pada saat yang tepat (saat wajib pajak menerima penghasilan).</li>
                        <li><strong>Economy:</strong> Biaya pemungutan harus seefisien mungkin, jangan sampai lebih besar dari hasil pungutannya.</li>
                    </ol>

                    <br>
                    <p><em>Klik tombol di bawah jika kamu sudah memahami konsep dasar ini untuk membuka modul selanjutnya!</em></p>
                ',
            ],
            [
                'title' => 'Modul 2: Mengenal Sistem Pemungutan Pajak di Indonesia',
                'order_position' => 2,
                'content' => '
                    <h3>Sistem Pemungutan Pajak</h3>
                    <p>Setelah memahami fungsi pajak, sekarang kita akan membedah bagaimana cara negara menghitung dan memungut pajak dari rakyatnya. Di dunia akuntansi perpajakan, terdapat tiga sistem utama.</p>

                    <br>

                    <h4>Jenis-Jenis Sistem Pemungutan</h4>
                    <p>Mari kita pelajari perbedaan ketiganya melalui poin-poin di bawah ini:</p>

                    <h5>A. Official Assessment System</h5>
                    <p>Sistem ini memberikan wewenang kepada <strong>pemerintah (fiskus)</strong> untuk menentukan besarnya pajak yang terutang oleh Wajib Pajak. Ciri khasnya, Wajib Pajak bersifat pasif hingga surat ketetapan pajak keluar.</p>

                    <h5>B. Self Assessment System</h5>
                    <p>Sistem yang memberikan wewenang penuh kepada <strong>Wajib Pajak</strong> untuk menghitung, memperhitungkan, menyetor, dan melaporkan sendiri besarnya pajak yang terutang. <mark>Indonesia menerapkan sistem ini</mark> untuk pajak-pajak mayoritas seperti PPh dan PPN.</p>

                    <h5>C. Withholding System</h5>
                    <p>Sistem pemungutan di mana wewenang menentukan besarnya pajak diserahkan kepada <strong>pihak ketiga</strong> (bukan fiskus dan bukan wajib pajak yang bersangkutan). Contoh nyata adalah pemotongan gaji karyawan oleh bendahara perusahaan (PPh Pasal 21).</p>

                    <br>
                    <blockquote>
                        <strong>Catatan Penting:</strong> Keberhasilan <em>Self Assessment System</em> sangat bergantung pada tingkat kepatuhan (compliance) dan kejujuran dari Wajib Pajak itu sendiri.
                    </blockquote>
                ',
            ],
            [
                'title' => 'Modul 3: Struktur Kategori Pajak (Pusat vs Daerah)',
                'order_position' => 3,
                'content' => '
                    <h3>Pengelompokan Jenis Pajak</h3>
                    <p>Tidak semua uang pajak masuk ke satu kantong yang sama. Berdasarkan lembaga pemungutnya, pajak di Indonesia dibagi menjadi dua kategori besar: <strong>Pajak Pusat</strong> dan <strong>Pajak Daerah</strong>.</p>

                    <br>

                    <h4>1. Pajak Pusat</h4>
                    <p>Pajak yang dikelola oleh Pemerintah Pusat dalam hal ini dilakukan oleh <strong>Direktorat Jenderal Pajak (DJP)</strong> di bawah Kementerian Keuangan. Hasilnya digunakan untuk membiayai APBN.</p>
                    <ul>
                        <li><strong>PPh (Pajak Penghasilan):</strong> Dikenakan atas kemampuan ekonomis yang diterima Wajib Pajak.</li>
                        <li><strong>PPN (Pajak Pertambahan Nilai):</strong> Dikenakan atas konsumsi Barang Kena Pajak atau Jasa Kena Pajak.</li>
                        <li><strong>Bea Meterai:</strong> Pajak atas dokumen tertulis tertentu.</li>
                    </ul>

                    <br>

                    <h4>2. Pajak Daerah</h4>
                    <p>Pajak yang dipungut dan dikelola oleh <strong>Pemerintah Daerah</strong> (baik Pemprov maupun Pemkab/Pemkot) melalui Bapenda. Hasilnya masuk ke APBD untuk pembangunan daerah setempat.</p>
                    <ul>
                        <li><strong>Pajak Kendaraan Bermotor (PKB):</strong> Dikelola oleh provinsi.</li>
                        <li><strong>Pajak Restoran dan Hotel:</strong> Dikelola oleh kabupaten/kota.</li>
                        <li><strong>Pajak Reklame:</strong> Dikenakan atas pemasangan papan iklan komersial di area publik.</li>
                    </ul>

                    <br>
                    <p>Kini kamu telah menyelesaikan materi dasar perpajakan! Persiapkan dirimu untuk kuis evaluasi berikutnya.</p>
                ',
            ],
        ];

        foreach ($modules as $module) {
            Module::create($module);
        }
    }
}
