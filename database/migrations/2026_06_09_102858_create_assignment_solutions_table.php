<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assignment_solutions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('assignment_id')
                ->unique()
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('scenario_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('vessel_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('source_cargo_plan_id')
                ->nullable()
                ->constrained('cargo_plans')
                ->nullOnDelete();

            $table->foreignId('solution_cargo_plan_id')
                ->nullable()
                ->constrained('cargo_plans')
                ->nullOnDelete();

            $table->string('status')->default('in_progress');
            $table->dateTime('started_at')->nullable();
            $table->dateTime('submitted_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignment_solutions');
    }
};