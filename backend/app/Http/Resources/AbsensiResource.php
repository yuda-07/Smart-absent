<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class AbsensiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'mahasiswa_id' => $this->mahasiswa_id,
            'dosen_id' => $this->dosen_id,
            'status' => $this->status,
            'waktu' => $this->waktu,
            'jam_masuk' => $this->jam_masuk,
            'nama' => $this->when(isset($this->nama), $this->nama),
            'nim' => $this->when(isset($this->nim), $this->nim),
        ];

        // Compute keterlambatan inline
        if ($this->jam_masuk) {
            $jamWajib = config('attendance.jam_wajib', '07:30');
            $jamMasuk = Carbon::createFromFormat('H:i:s', $this->jam_masuk);
            $jamWajibCarbon = Carbon::createFromFormat('H:i', $jamWajib);

            if ($jamMasuk->greaterThan($jamWajibCarbon)) {
                $selisih = $jamWajibCarbon->diffInMinutes($jamMasuk);
                $jam = intdiv($selisih, 60);
                $menit = $selisih % 60;

                $data['terlambat_menit'] = $selisih;
                $data['terlambat_jam'] = $jam > 0
                    ? "{$jam} jam {$menit} menit"
                    : "{$menit} menit";
            } else {
                $data['terlambat_menit'] = 0;
                $data['terlambat_jam'] = '0 menit';
            }
        } else {
            $data['terlambat_menit'] = null;
            $data['terlambat_jam'] = null;
        }

        return $data;
    }
}
