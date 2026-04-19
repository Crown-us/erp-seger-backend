<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessPartner extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'address'];

    public function users()
    {
        return $this->hasMany(User::class, 'workplace_id');
    }
}
