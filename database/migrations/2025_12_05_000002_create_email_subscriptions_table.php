<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email', 255)->unique();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->timestamp('subscribed_at')->useCurrent();
            $table->enum('status', ['active', 'unsubscribed', 'bounced'])->default('active');
            $table->json('preferences')->default('{}');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->index('email');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_subscriptions');
    }
};
