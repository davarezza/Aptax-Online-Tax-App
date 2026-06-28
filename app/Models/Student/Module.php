<?php

namespace App\Models\Student;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $table = 'modules';

    protected $fillable = [
        'title',
        'content',
        'order_position',
    ];
}
