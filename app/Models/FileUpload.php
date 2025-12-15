<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class FileUpload extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'training_id',
        'student_id',
        'file_url',
        'file_type',
        'file_size',
        'file_name',
        'uploaded_at',
        'approved_by',
        'approval_status',
        'rejection_reason',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
