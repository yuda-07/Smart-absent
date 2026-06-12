<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MahasiswaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'nama' => $this->nama,
            'nim' => $this->nim,
            'kelas' => $this->kelas,
            'angkatan' => (int) $this->angkatan,
            'jurusan' => $this->jurusan,
            'prodi_id' => $this->prodi_id,
            'email' => $this->whenLoaded('user', fn () => $this->user->email),
            'prodi' => $this->whenLoaded('prodi', fn () => [
                'id' => $this->prodi->id,
                'jenjang' => $this->prodi->jenjang,
                'nama' => $this->prodi->nama,
            ]),
        ];
    }
}
