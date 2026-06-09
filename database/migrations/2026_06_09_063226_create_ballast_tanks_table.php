<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ballast_tanks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vessel_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');
            $table->string('code')->nullable();
            $table->string('side')->default('center');

            $table->decimal('capacity_tonnes', 12, 2)->default(0);
            $table->decimal('capacity_m3', 12, 2)->default(0);

            $table->decimal('current_tonnes', 12, 2)->default(0);

            $table->decimal('lcg', 10, 3)->default(0);
            $table->decimal('vcg', 10, 3)->default(0);
            $table->decimal('tcg', 10, 3)->default(0);

            $table->decimal('max_fill_percent', 6, 2)->default(100);
            $table->decimal('free_surface_coefficient', 10, 4)->default(0);

            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->string('status')->default('available');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ballast_tanks');
    }
};