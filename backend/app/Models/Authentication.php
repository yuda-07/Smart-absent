<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Authentication extends Model
{
    protected $table = 'authentications';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $primaryKey = 'token';

    protected $fillable = [
        'token',
        'user_id',
    ];
}
