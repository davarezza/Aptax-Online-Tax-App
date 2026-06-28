<?php

namespace App\Models\Shared;

use Illuminate\Database\Eloquent\Model;
use App\Models\Student\Submission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SubmissionFeedback extends Model
{
    use HasFactory;

    protected $table = 'submission_feedbacks';
    protected $fillable = ['submission_id', 'sender_id', 'message', 'is_read'];

    public function submission()
    {
        return $this->belongsTo(Submission::class, 'submission_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
