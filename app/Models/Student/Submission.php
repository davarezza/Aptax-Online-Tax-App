<?php

namespace App\Models\Student;

use Illuminate\Database\Eloquent\Model;
use App\Models\Teacher\Task;
use App\Models\User;
use App\Models\Shared\SubmissionFeedback;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = ['task_id', 'student_id', 'student_answer', 'ai_score', 'ai_feedback', 'status'];

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function feedbacks()
    {
        return $this->hasMany(SubmissionFeedback::class, 'submission_id');
    }
}
