<?php

namespace App\Models\Teacher;

use App\Models\Student\SptSubmission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class SptAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'teacher_id',
        'class_id',
        'title',
        'description',
        'case_json',
        'xp_reward',
        'deadline',
        'is_released'
    ];

    protected $casts = [
        'case_json' => 'array',
        'is_released' => 'boolean',
        'deadline' => 'datetime'
    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(SptSubmission::class, 'spt_assignment_id');
    }

    public function getRingkasanAttribute(): array
    {
        return [
            'nama_wp'         => data_get($this->case_json, 'A_identitas.nama_wajib_pajak'),
            'tahun_pajak'     => data_get($this->case_json, 'A_identitas.tahun_pajak'),
            'penghasilan_neto'=> data_get($this->case_json, 'B_penghasilan_neto.jumlah'),
            'status_ptkp'     => data_get($this->case_json, 'C_ptkp.status_ptkp'),
            'ptkp_jumlah'     => data_get($this->case_json, 'C_ptkp.jumlah'),
            'pkp'             => data_get($this->case_json, 'D_penghasilan_kena_pajak.jumlah'),
            'pph_terutang'    => data_get($this->case_json, 'E_pph_terutang.jumlah'),
            'kredit_pajak'    => data_get($this->case_json, 'F_kredit_pajak.jumlah'),
            'status_akhir'    => data_get($this->case_json, 'G_status_akhir.status'),
            'selisih'         => data_get($this->case_json, 'G_status_akhir.selisih'),
            'harta'           => data_get($this->case_json, 'I_harta', []),
            'utang'           => data_get($this->case_json, 'J_utang', []),
            'pemberi_kerja'   => data_get($this->case_json, 'informasi_tambahan.pemberi_kerja'),
            'penghasilan_final' => data_get($this->case_json, 'informasi_tambahan.penghasilan_final'),
        ];
    }
}
