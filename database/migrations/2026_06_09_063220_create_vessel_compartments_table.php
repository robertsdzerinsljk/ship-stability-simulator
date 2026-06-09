<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vessel_compartments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vessel_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');
            $table->string('code')->nullable();
            $table->string('type')->default('cargo');

            $table->decimal('capacity_tonnes', 12, 2)->default(0);
            $table->decimal('capacity_m3', 12, 2)->default(0);

            $table->decimal('lcg', 10, 3)->default(0);
            $table->decimal('vcg', 10, 3)->default(0);
            $table->decimal('tcg', 10, 3)->default(0);

            $table->decimal('max_load_percent', 6, 2)->default(100);
            $table->string('allowed_cargo_type')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->string('status')->default('available');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vessel_compartments');
    }
};