<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vessel_limits', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vessel_id')
                ->unique()
                ->constrained()
                ->cascadeOnDelete();

            $table->decimal('min_gm', 10, 3)->default(0.15);
            $table->decimal('max_draft', 10, 3)->default(0);
            $table->decimal('max_trim', 10, 3)->default(0);
            $table->decimal('max_heel', 10, 3)->default(0);
            $table->decimal('max_compartment_load_percent', 6, 2)->default(100);
            $table->decimal('max_sf_percent', 6, 2)->default(100);
            $table->decimal('max_bm_percent', 6, 2)->default(100);
            $table->text('load_line_note')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vessel_limits');
    }
};