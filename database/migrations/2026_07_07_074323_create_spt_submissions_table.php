<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('spt_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('spt_assignment_id')->constrained('spt_assignments')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->string('uploaded_bukti_potong_path')->nullable();
            $table->json('form_data')->nullable(); // Menampung seluruh payload jawaban wizard step A sampai K
            $table->enum('status', ['active', 'evaluation'])->default('active');
            $table->integer('final_score')->nullable();
            $table->string('bpe_number')->nullable(); // Nomor Tanda Terima resmi DJP (20 digit)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spt_submissions');
    }
};
