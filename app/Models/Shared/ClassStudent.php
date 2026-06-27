<?php

namespace App\Models\Shared;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ClassStudent extends Model
{
    use HasFactory;

    protected $fillable = ['class_id', 'student_id'];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'class_students', 'class_id', 'student_id');
    }
}
