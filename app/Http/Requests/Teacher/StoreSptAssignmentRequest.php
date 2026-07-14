<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class StoreSptAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Hanya guru yang login yang boleh membuat soal SPT.
        return $this->user()?->role === 'teacher';
    }

    public function rules(): array
    {
        return [
            'class_id'          => ['required', 'exists:classes,id'],
            'title'             => ['required', 'string', 'max:255'],
            'xp_reward'         => ['required', 'integer', 'min:10', 'max:1000'],
            'deadline'          => ['required', 'date', 'after:now'],
            'is_released'       => ['boolean'],

            // Data inti wizard
            'nama_wp'           => ['required', 'string', 'max:255'],
            'tahun_pajak'       => ['required', 'integer', 'digits:4', 'min:2020', 'max:' . (date('Y') + 1)],
            'penghasilan_neto'  => ['required', 'numeric', 'min:0'],
            'status_ptkp'       => ['required', 'string', 'in:TK/0,TK/1,TK/2,TK/3,K/0,K/1,K/2,K/3'],
            'kredit_pajak'      => ['nullable', 'numeric', 'min:0'],

            // Harta bergerak (opsional, banyak baris)
            'harta'                       => ['nullable', 'array'],
            'harta.*.nama'                => ['required_with:harta', 'string', 'max:255'],
            'harta.*.tahun_perolehan'     => ['nullable', 'integer', 'digits:4'],
            'harta.*.harga_perolehan'     => ['required_with:harta', 'numeric', 'min:0'],
            'harta.*.keterangan'          => ['nullable', 'string', 'max:255'],

            // Utang (opsional, banyak baris)
            'utang'                       => ['nullable', 'array'],
            'utang.*.nama_pemberi'        => ['required_with:utang', 'string', 'max:255'],
            'utang.*.tahun_pinjaman'      => ['nullable', 'integer', 'digits:4'],
            'utang.*.jumlah'              => ['required_with:utang', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'deadline.after'             => 'Deadline harus di masa depan.',
            'penghasilan_neto.required'  => 'Penghasilan neto wajib diisi.',
            'status_ptkp.in'             => 'Status PTKP tidak valid.',
        ];
    }
}
