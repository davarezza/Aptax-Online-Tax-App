<?php

namespace App\Models\Teacher;

use App\Models\Student\SptSubmission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class SptAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'class_id',
        'title',
        'description',
        'case_json',
        'xp_reward',
        'deadline',
        'is_released'
    ];

    protected $casts = [
        'case_json' => 'array',
        'is_released' => 'boolean',
        'deadline' => 'datetime'
    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(SptSubmission::class, 'spt_assignment_id');
    }
}
