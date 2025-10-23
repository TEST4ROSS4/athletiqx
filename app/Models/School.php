<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    protected $fillable = [
        'name',
        'code',
        'address',
        'active',
    ];
    

    public function users()
    {
        return $this->hasMany(User::class);
    }


}
