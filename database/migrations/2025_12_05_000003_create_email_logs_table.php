<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('recipient_id');
            $table->string('email_type', 50);
            $table->string('subject', 255);
            $table->timestamp('sent_at')->useCurrent();
            $table->enum('status', ['sent', 'failed', 'bounced', 'opened', 'clicked'])->default('sent');
            $table->text('error_message')->nullable();
            $table->integer('open_count')->default(0);
            $table->integer('click_count')->default(0);
            $table->timestamps();

            $table->foreign('recipient_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('recipient_id');
            $table->index('email_type');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_logs');
    }
};
