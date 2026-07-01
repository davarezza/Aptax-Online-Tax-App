<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Teacher\Task;
use App\Models\Teacher\ClassModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MakerController extends Controller
{
    public function index()
    {
        $teacherId = Auth::id();

        $tasks = Task::where('teacher_id', $teacherId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($task) {
                $topicTags = [
                    'PPh 21 (Income Tax)' => 'PPh 21',
                    'PPh 23 (Withholding Tax)' => 'PPh 23',
                    'PPh 25 (Corporate Tax)' => 'PPh 25',
                    'PPN (Value Added Tax)' => 'PPN',
                    'PPnBM (Luxury Goods Tax)' => 'PPnBM',
                    'Bes Meterai (Stamp Duty)' => 'Meterai',
                ];

                $diffMap = [
                    'beginner' => 1,
                    'intermediate' => 2,
                    'advanced' => 3
                ];

                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'tag' => $topicTags[$task->tax_topic] ?? $task->tax_topic,
                    'diff' => $diffMap[$task->difficulty] ?? 2,
                    'source' => $task->source_type === 'ai' ? 'AI' : 'Manual',
                    'released' => (bool) $task->is_released,
                    'age' => $task->created_at ? $task->created_at->diffForHumans() : 'baru saja',

                    'description' => $task->description,
                    'correct_answer' => $task->correct_answer,
                    'deadline' => $task->deadline,
                ];
            });

        return Inertia::render('Teacher/Maker', [
            'tasksBank' => $tasks
        ]);
    }

    public function generateAiCase(Request $request)
    {
        $request->validate([
            'tax_topic' => 'required|string',
            'difficulty' => 'required|string|in:Beginner,Intermediate,Advanced',
            'deadline' => 'required|date|after:now',
        ]);

        $teacherId = Auth::id();

        $class = DB::table('classes')->where('teacher_id', $teacherId)->first();
        $classId = $class ? $class->id : 1;

        $xpRewards = [
            'Beginner' => 30,
            'Intermediate' => 60,
            'Advanced' => 90
        ];
        $xp = $xpRewards[$request->difficulty] ?? 30;

        $names = ['Martinus', 'Budi Santoso', 'Pratama', 'Hendra', 'Rian', 'Dewi Sartika', 'Anisa'];
        $companies = ['PT Cahaya Abadi', 'PT Sinar Makmur', 'PT Nusantara Jaya', 'PT Tekno Utama', 'PT Bintang Timur'];
        $shops = ['Toko Elektronik Sanjaya', 'CV Berkah Tech', 'Inti Komputer', 'Agung Jaya Abadi'];

        $fakerName = $names[array_rand($names)];
        $fakerCompany = $companies[array_rand($companies)];
        $fakerShop = $shops[array_rand($shops)];

        $generatedTitle = "";
        $generatedDesc = "";
        $correctAnswer = "";

        switch ($request->tax_topic) {
            case 'PPh 21 (Income Tax)':
                $gajiPokok = rand(10, 25) * 1000000;
                $premiJKK_Persen = collect([0.24, 0.54, 0.89, 1.27, 1.74, 1.80])->random();
                $premiJKM_Persen = collect([0.30, 1.60])->random();
                $iuranPensiun_Persen = rand(1, 3);
                $jumlahAnak = rand(0, 4);

                $premiJKK_Nominal = $gajiPokok * ($premiJKK_Persen / 100);
                $premiJKM_Nominal = $gajiPokok * ($premiJKM_Persen / 100);
                $brutoSebulan = $gajiPokok + $premiJKK_Nominal + $premiJKM_Nominal;

                if ($request->difficulty === 'Beginner') {
                    $generatedTitle = "Penghitungan Penghasilan Bruto PPh 21 - $fakerName";
                    $generatedDesc = "Tuan $fakerName bekerja pada $fakerCompany dengan memperoleh gaji pokok sebulan sebesar Rp " . number_format($gajiPokok, 0, ',', '.') . ". Perusahaan mengikuti program BPJS Ketenagakerjaan, di mana premi Jaminan Kecelakaan Kerja (JKK) ditanggung oleh pemberi kerja sebesar $premiJKK_Persen% dan premi Jaminan Kematian (JKM) sebesar $premiJKM_Persen% dari gaji pokok. Tuan $fakerName sendiri membayar iuran pensiun sebesar $iuranPensiun_Persen% dari gaji pokoknya. Berapakah jumlah **Penghasilan Bruto (Kotor) sebulan** yang diterima Tuan $fakerName untuk dasar awal perhitungan perpajakan? (Tulis jawaban berupa nominal angka saja tanpa Rp, titik, atau koma).";

                    $correctAnswer = (string) round($brutoSebulan);

                } else {
                    $kategoriTER = "A";
                    $tarifTER = 0;

                    if ($jumlahAnak === 0) {
                        $kategoriTER = "A";
                        if ($brutoSebulan <= 5400000) $tarifTER = 0;
                        elseif ($brutoSebulan <= 6200000) $tarifTER = 0.25;
                        elseif ($brutoSebulan <= 7500000) $tarifTER = 1;
                        elseif ($brutoSebulan <= 10000000) $tarifTER = 2;
                        elseif ($brutoSebulan <= 15000000) $tarifTER = 5;
                        elseif ($brutoSebulan <= 20000000) $tarifTER = 7;
                        else $tarifTER = 9;
                    } else {
                        $kategoriTER = "B";
                        if ($jumlahAnak === 3) $kategoriTER = "C";

                        if ($brutoSebulan <= 6500000) $tarifTER = 0.5;
                        elseif ($brutoSebulan <= 9500000) $tarifTER = 1.5;
                        elseif ($brutoSebulan <= 14000000) $tarifTER = 4;
                        elseif ($brutoSebulan <= 18000000) $tarifTER = 6;
                        elseif ($brutoSebulan <= 25000000) $tarifTER = 9;
                        else $tarifTER = 12;
                    }

                    $pph21TER_Sebulan = $brutoSebulan * ($tarifTER / 100);

                    if ($request->difficulty === 'Intermediate') {
                        $generatedTitle = "Analisis Pemotongan PPh 21 Metode TER - $fakerName";
                        $generatedDesc = "Tuan $fakerName memiliki status menikah dengan tanggangan sebanyak $jumlahAnak anak. Beliau bekerja di $fakerCompany dengan gaji pokok Rp " . number_format($gajiPokok, 0, ',', '.') . " per bulan. Perusahaan menanggung premi JKK sebesar $premiJKK_Persen% dan premi JKM sebesar $premiJKM_Persen%. Jika berdasarkan PMK terbaru, total bruto yang diterimanya tergolong ke dalam **TER Kategori $kategoriTER dengan tarif sebersar $tarifTER%**, hitunglah berapa besarnya **potongan Pajak PPh Pasal 21 atas Tuan $fakerName untuk bulan tersebut** sebelum perhitungan masa pajak akhir Desember! (Masukkan hasil akhir pembulatan berupa angka tanpa format Rp atau tanda baca).";

                        $correctAnswer = (string) round($pph21TER_Sebulan);
                    } else {
                        $bonusRamadhan = $gajiPokok * 1;
                        $brutoTahunanTanpaBonus = $brutoSebulan * 12;
                        $totalBrutoTahunan = $brutoTahunanTanpaBonus + $bonusRamadhan;

                        $generatedTitle = "Studi Kasus Rekonsiliasi Fiskal PPh 21 Akhir Tahun - $fakerName";
                        $generatedDesc = "Tuan $fakerName ($fakerCompany) berstatus menikah dengan $jumlahAnak anak memiliki total penghasilan bruto kumulatif (termasuk gaji pokok, premi JKK $premiJKK_Persen%, JKM $premiJKM_Persen%) sebesar Rp " . number_format($brutoTahunanTanpaBonus, 0, ',', '.') . " dalam setahun. Pada bulan Ramadhan, ia mendapatkan bonus tambahan sebesar 1 kali gaji pokoknya yaitu Rp " . number_format($bonusRamadhan, 0, ',', '.') . ". Berapakah akumulasi nilai **Total Penghasilan Bruto Tahunan** yang wajib dilaporkan oleh bendahara perusahaan pada Form 1721-A1 sebelum dikurangi dengan Biaya Jabatan dan iuran pensiun? (Masukkan jawaban berupa nominal angka bulat saja).";

                        $correctAnswer = (string) round($totalBrutoTahunan);
                    }
                }
                break;

            case 'PPN (Value Added Tax)':
                $hargaSatuan = collect([5000000, 7000000, 8500000, 10000000, 12000000])->random();
                $kuantitas = rand(2, 15);
                $diskonPersen = collect([0, 5, 10])->random();

                $totalHarga = $hargaSatuan * $kuantitas;
                $potonganDiskon = $totalHarga * ($diskonPersen / 100);
                $dpp = $totalHarga - $potonganDiskon;

                $tarifPpn = 12;
                $nilaiPpn = $dpp * ($tarifPpn / 100);
                $totalTagihan = $dpp + $nilaiPpn;

                if ($request->difficulty === 'Beginner') {
                    $generatedTitle = "Faktur Pajak PPN Standar - $fakerShop";
                    $generatedDesc = "$fakerShop merupakan Pengusaha Kena Pajak (PKP). Pada masa pajak berjalan, mereka melakukan penyerahan Barang Kena Pajak berupa $kuantitas unit AC Split kepada entitas korporasi dengan harga satuan Rp " . number_format($hargaSatuan, 0, ',', '.') . " per unit belum termasuk pajak. Berapakah **nilai PPN ($tarifPpn%) yang terutang** atas transaksi penyerahan barang tersebut? (Tuliskan jawaban dalam bentuk angka bulat saja).";

                    $correctAnswer = (string) round($nilaiPpn);

                } elseif ($request->difficulty === 'Intermediate') {
                    $generatedTitle = "Kasus PPN dengan Potongan Harga - $fakerShop";
                    $generatedDesc = "Entitas komersial membeli $kuantitas unit perangkat elektronik dari $fakerShop (Status PKP) dengan harga Rp " . number_format($hargaSatuan, 0, ',', '.') . " per unitnya. Atas pembelian partai besar ini, toko memberikan potongan harga dagang (diskon) sebesar $diskonPersen% yang dicantumkan langsung di dalam Faktur Pajak. Hitunglah nilai **Dasar Pengenaan Pajak (DPP)** yang menjadi acuan pengali tarif PPN penyerahan tersebut! (Tuliskan dalam bentuk nominal angka saja).";

                    $correctAnswer = (string) round($dpp);

                } else {
                    $generatedTitle = "Audit Nilai Invoice Berikat PPN - $fakerShop";
                    $generatedDesc = "Hitunglah **total keseluruhan uang yang harus dibayarkan (Nilai Transaksi + PPN $tarifPpn%)** oleh pihak pembeli kepada $fakerShop atas transaksi pengadaan $kuantitas unit alat kerja seharga Rp " . number_format($hargaSatuan, 0, ',', '.') . " per unit, apabila pembeli mendapatkan potongan komersial langsung sebesar $diskonPersen% sebelum pengenaan pajak daerah/pusat! (Tuliskan angka tanpa Rp dan tanda titik).";

                    $correctAnswer = (string) round($totalTagihan);
                }
                break;

            case 'PPh 23 (Withholding Tax)':
                $nilaiKontrak = collect([20000000, 35000000, 50000000, 75000000])->random();
                $hasNpwp = collect([true, false])->random();

                $tarifPph23 = $hasNpwp ? 2 : 4;
                $potonganPph23 = $nilaiKontrak * ($tarifPph23 / 100);
                $nettoDiterima = $nilaiKontrak - $potonganPph23;

                if ($request->difficulty === 'Beginner') {
                    $generatedTitle = "Potongan PPh Pasal 23 Atas Jasa";
                    $generatedDesc = "$fakerCompany menyewa jasa konsultan akuntansi dari CV Solusi Finansial dengan nilai kontrak penyerahan jasa sebesar Rp " . number_format($nilaiKontrak, 0, ',', '.') . ". Penyedia jasa merupakan wajib pajak badan badan resmi yang memiliki NPWP. Berapakah **nominal PPh Pasal 23 (Tarif 2%)** yang wajib dipotong dan disetorkan oleh $fakerCompany selaku pemotong pajak? (Tulis nominal angka saja).";

                    $correctAnswer = (string) round($potonganPph23);

                } else {
                    $npwpStatusText = $hasNpwp ? "memiliki NPWP aktif" : "**TIDAK memiliki NPWP**";

                    if ($request->difficulty === 'Intermediate') {
                        $generatedTitle = "Analisis Tarif Penalti Pajak PPh 23";
                        $generatedDesc = "$fakerCompany menggunakan jasa perawatan mesin produksi dari vendor eksternal dengan total tagihan bruto senilai Rp " . number_format($nilaiKontrak, 0, ',', '.') . ". Di dalam berkas administrasi, diketahui bahwa vendor penyedia jasa tersebut ternyata $npwpStatusText. Berapakah jumlah **PPh Pasal 23 yang wajib dipotong** oleh $fakerCompany? Ingat aturan sanksi tarif bagi yang tidak memiliki NPWP. (Jawab dalam bentuk nominal angka saja).";

                        $correctAnswer = (string) round($potonganPph23);
                    } else {
                        $generatedTitle = "Kasus Pencatatan Akuntansi Jurnal Kas Netto PPh 23";
                        $generatedDesc = "CV Kreatif Mandiri menyerahkan jasa desain sistem akuntansi kepada $fakerCompany senilai Rp " . number_format($nilaiKontrak, 0, ',', '.') . ". Pihak vendor penyedia jasa diketahui $npwpStatusText. Berapakah nilai **Kas Bersih (Netto)** yang akhirnya diterima oleh CV Kreatif Mandiri setelah dipotong pajak PPh Pasal 23 oleh pembayar penghasilan? (Tulis angka bulat saja).";

                        $correctAnswer = (string) round($nettoDiterima);
                    }
                }
                break;

            default:
                $nominalGeneric = rand(5, 12) * 500000;
                $generatedTitle = "Studi Kasus Konseptual Evaluasi - " . $request->tax_topic;
                $generatedDesc = "Dalam implementasi transaksi keuangan komersial bernilai pokok bruto Rp " . number_format($nominalGeneric, 0, ',', '.') . ", hitunglah batas atas pengenaan kewajiban perpajakan dari subjek hukum bersangkutan sesuai ketentuan undang-undang perpajakan yang valid! Tulis jawaban angka dasar ";
                $correctAnswer = (string) ($nominalGeneric * 0.1);
                break;
        }

        Task::create([
            'teacher_id' => $teacherId,
            'class_id' => $classId,
            'title' => $generatedTitle . " [" . $request->difficulty . " Mode]",
            'description' => $generatedDesc,
            'difficulty' => strtolower($request->difficulty),
            'tax_topic' => $request->tax_topic,
            'source_type' => 'ai',
            'correct_answer' => $correctAnswer,
            'xp_reward' => $xp,
            'deadline' => $request->deadline,
            'is_released' => 0,
        ]);

        return redirect()->back();
    }

    public function storeManualCase(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'tax_topic' => 'required|string',
            'description' => 'required|string',
            'correct_answer' => 'required|string',
            'difficulty' => 'required|string|in:beginner,intermediate,advanced',
            'deadline' => 'required|date',
        ]);

        $teacherId = Auth::id();
        $class = ClassModel::where('teacher_id', $teacherId)->first();
        $classId = $class ? $class->id : 1;

        $xpRewards = [
            'beginner' => 30,
            'intermediate' => 60,
            'advanced' => 90
        ];
        $xp = $xpRewards[$request->difficulty] ?? 30;

        Task::create([
            'teacher_id' => $teacherId,
            'class_id' => $classId,
            'title' => $request->title,
            'tax_topic' => $request->tax_topic,
            'description' => $request->description,
            'correct_answer' => $request->correct_answer,
            'difficulty' => $request->difficulty,
            'xp_reward' => $xp,
            'deadline' => $request->deadline,
            'source_type' => 'manual',
            'is_released' => 0,
        ]);

        return redirect()->route('teacher.maker');
    }

    public function toggleRelease(int $taskId)
    {
        $task = Task::where('id', $taskId)
                    ->where('teacher_id', Auth::id())
                    ->firstOrFail();

        $task->is_released = !$task->is_released;
        $task->save();

        return redirect()->back();
    }
}
