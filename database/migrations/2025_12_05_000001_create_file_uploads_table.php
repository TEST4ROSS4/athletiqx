<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('file_uploads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('training_id')->nullable();
            $table->unsignedBigInteger('student_id');
            $table->string('file_url', 500);
            $table->enum('file_type', ['image', 'video', 'document']);
            $table->integer('file_size');
            $table->string('file_name', 255);
            $table->timestamp('uploaded_at')->useCurrent();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('student_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            
            $table->index('training_id');
            $table->index('student_id');
            $table->index('approval_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('file_uploads');
    }
};
