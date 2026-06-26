<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. BERSIHKAN DATA LAMA SECARA BERURUTAN
        DB::statement('SET FOREIGN_KEY_CHECKS = 0;');
        DB::table('class_students')->truncate();
        DB::table('admin_access_tokens')->truncate();
        DB::table('classes')->truncate();
        DB::table('users')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS = 1;');

        // 2. SEED AKUN DUMMY AWAL
        // Buat Akun Guru Dummy (Bu Wahyu)
        $teacherId = DB::table('users')->insertGetId([
            'name'              => 'Bu Wahyu, S.Pd.',
            'email'             => 'guru@gmail.com',
            'password'          => Hash::make('password'),
            'role'              => 'guru',
            'total_exp'         => 0,
            'email_verified_at' => now(),
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);

        // Buat Akun Siswa Dummy (Muhammad Dava Al Rezza)
        $studentId = DB::table('users')->insertGetId([
            'name'              => 'Muhammad Dava Al Rezza',
            'email'             => 'siswa@gmail.com',
            'password'          => Hash::make('password'),
            'role'              => 'siswa',
            'total_exp'         => 120,
            'email_verified_at' => now(),
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);

        // ── 3. SEED TABEL CLASSES (Data Kelas Master) ──
        // Kelas 1 otomatis langsung terikat ke ID Guru Bu Wahyu
        $class1Id = DB::table('classes')->insertGetId([
            'teacher_id' => $teacherId,
            'class_name' => 'XI Akuntansi dan Keuangan Lembaga 1',
            'class_code' => 'AKL-XI-01',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Kelas 2 kita set teacher_id bernilai null (kosong), sehingga lolos validasi DB
        $class2Id = DB::table('classes')->insertGetId([
            'teacher_id' => null, // NULL artinya kelas ini siap menunggu guru baru daftar
            'class_name' => 'XI Akuntansi dan Keuangan Lembaga 2',
            'class_code' => 'AKL-XI-02',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ── 4. SEED TABEL JEMBATAN CLASS_STUDENTS ──
        // Hubungkan Siswa Dummy langsung otomatis masuk ke Kelas 1 (XI AKL 1)
        DB::table('class_students')->insert([
            'class_id'   => $class1Id,
            'student_id' => $studentId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ── 5. SEED TABEL ADMIN_ACCESS_TOKENS ──
        DB::table('admin_access_tokens')->insert([
            [
                'token_code' => 'TEACH-AKL2-ABC', // Token untuk guru baru klaim Kelas 2
                'class_id'   => $class2Id,
                'is_used'    => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        $this->command->info('Database seeding sukses tanpa eror constraint!');
    }
}
