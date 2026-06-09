<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cargo_types', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('category')->default('bulk');
            $table->decimal('density', 10, 3)->nullable();
            $table->decimal('stowage_factor', 10, 3)->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('active');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cargo_types');
    }
};