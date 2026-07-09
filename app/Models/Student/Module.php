<?php

namespace App\Models\Student;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $table = 'modules';

    protected $fillable = [
        'title',
        'content',
        'pdf_file',
        'order_position',
    ];

    protected $appends = [
        'pdf_url',
    ];

    protected function pdfUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->pdf_file ? asset('assets/pdf/' . $this->pdf_file) : null,
        );
    }
}
