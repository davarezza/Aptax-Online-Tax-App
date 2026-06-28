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
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('class_students')->truncate();
        DB::table('admin_access_tokens')->truncate();
        DB::table('classes')->truncate();
        DB::table('users')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

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

        $students = [
            [
                'name' => 'Muhammad Dava Al Rezza',
                'email' => 'dava@gmail.com',
                'exp' => 120,
            ],
            [
                'name' => 'Ilham Ambon',
                'email' => 'ilham@gmail.com',
                'exp' => 80,
            ],
            [
                'name' => 'Rizky Pratama',
                'email' => 'rizky@gmail.com',
                'exp' => 65,
            ],
            [
                'name' => 'Fajar Ramadhan',
                'email' => 'fajar@gmail.com',
                'exp' => 40,
            ],
        ];

        $class1Id = DB::table('classes')->insertGetId([
            'teacher_id' => $teacherId,
            'class_name' => 'XI Akuntansi dan Keuangan 1',
            'class_code' => 'AKL-XI-01',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $class2Id = DB::table('classes')->insertGetId([
            'teacher_id' => null,
            'class_name' => 'XI Akuntansi dan Keuangan 2',
            'class_code' => 'AKL-XI-02',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $classStudents = [];

        foreach ($students as $student) {

            $studentId = DB::table('users')->insertGetId([
                'name'              => $student['name'],
                'email'             => $student['email'],
                'password'          => Hash::make('password'),
                'role'              => 'siswa',
                'total_exp'         => $student['exp'],
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);

            $classStudents[] = [
                'class_id'   => $class1Id,
                'student_id' => $studentId,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('class_students')->insert($classStudents);

        DB::table('admin_access_tokens')->insert([
            [
                'token_code' => 'TEACH-AKL2-ABC',
                'class_id'   => $class2Id,
                'is_used'    => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $this->call([
            TaskSeeder::class,
            ModuleSeeder::class,
        ]);

        $this->command->info('Database seeding sukses tanpa error constraint!');
    }
}
