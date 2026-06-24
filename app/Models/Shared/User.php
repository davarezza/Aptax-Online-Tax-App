<?php

namespace App\Models\Shared;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Teacher\ClassModel;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'total_exp',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function classes()
    {
        return $this->hasMany(ClassModel::class, 'teacher_id');
    }

    public function joinedClasses()
    {
        return $this->belongsToMany(ClassModel::class, 'class_students', 'student_id', 'class_id');
    }
}
