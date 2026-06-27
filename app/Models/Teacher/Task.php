<?php

namespace App\Models\Teacher;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id', 'class_id', 'title', 'description', 'difficulty',
        'tax_topic', 'source_type', 'correct_answer', 'xp_reward', 'deadline', 'is_released'
    ];

    protected $casts = [
        'deadline' => 'datetime',
        'is_released' => 'boolean',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function class()
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }
}
