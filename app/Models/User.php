<?php

namespace App\Models;

use App\Models\Shared\ClassStudent;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Teacher\ClassModel;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'total_exp',
        'completed_modules',
    ];

    protected $casts = [
        'completed_modules' => 'array',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['level_stats'];

    protected function levelStats(): Attribute
    {
        return Attribute::make(
            get: function () {
                $totalXp = $this->total_exp;

                $currentLevel = 1;
                $xpRequiredForNext = 50;
                $accumulatedXpForCurrentLevel = 0;

                while (true) {
                    $nextLevelXpNeed = $currentLevel * 50;
                    if ($totalXp >= ($accumulatedXpForCurrentLevel + $nextLevelXpNeed)) {
                        $accumulatedXpForCurrentLevel += $nextLevelXpNeed;
                        $currentLevel++;
                    } else {
                        $xpRequiredForNext = $nextLevelXpNeed;
                        break;
                    }
                }

                $xpProgressInsideLevel = $totalXp - $accumulatedXpForCurrentLevel;

                return [
                    'total_xp' => $totalXp,
                    'current_level' => $currentLevel,
                    'xp_progress' => $xpProgressInsideLevel,
                    'xp_for_next' => $xpRequiredForNext,
                ];
            }
        );
    }

    public function classes()
    {
        return $this->hasMany(ClassModel::class, 'teacher_id');
    }

    public function joinedClasses()
    {
        return $this->belongsToMany(ClassModel::class, 'class_students', 'student_id', 'class_id');
    }

    public function studentClass(): HasOneThrough
    {
        return $this->hasOneThrough(
            ClassModel::class,
            ClassStudent::class,
            'student_id',
            'id',
            'id',
            'class_id'
        );
    }
}
