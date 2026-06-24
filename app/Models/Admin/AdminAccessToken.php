<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminAccessToken extends Model
{
    use HasFactory;

    protected $table = 'admin_access_tokens';
    protected $fillable = ['token_code', 'is_used'];
}
