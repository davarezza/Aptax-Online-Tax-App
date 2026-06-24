<?php

namespace App\Models\Teacher;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassAiAnalytic extends Model
{
    use HasFactory;

    protected $fillable = ['class_id', 'ai_executive_summary', 'struggle_points_json', 'action_plan', 'analyzed_at'];

    protected $casts = [
        'struggle_points_json' => 'array',
        'analyzed_at' => 'datetime',
    ];

    public function class()
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }
}
