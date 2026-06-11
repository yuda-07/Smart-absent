<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Jurusan extends Model
{
    protected $table = 'jurusan';

    protected $fillable = [
        'kode',
        'nama',
    ];

    public function prodi(): HasMany
    {
        return $this->hasMany(Prodi::class, 'jurusan_id');
    }
}
