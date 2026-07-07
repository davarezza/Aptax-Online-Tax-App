<?php

namespace App\Models\Student;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Teacher\SptAssignment;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class SptSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'spt_assignment_id',
        'student_id',
        'uploaded_bukti_potong_path',
        'form_data',
        'status',
        'final_score',
        'bpe_number'
    ];

    protected $casts = [
        'form_data' => 'array',
        'final_score' => 'integer'
    ];

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(SptAssignment::class, 'spt_assignment_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
