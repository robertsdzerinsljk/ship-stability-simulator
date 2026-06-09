<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cargo_plan_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('cargo_plan_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('vessel_compartment_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('cargo_type_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('cargo_name');
            $table->decimal('weight_tonnes', 12, 2)->default(0);
            $table->decimal('volume_m3', 12, 2)->default(0);
            $table->string('loading_port')->nullable();
            $table->string('discharge_port')->nullable();
            $table->unsignedSmallInteger('priority')->default(1);
            $table->string('status')->default('planned');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cargo_plan_items');
    }
};