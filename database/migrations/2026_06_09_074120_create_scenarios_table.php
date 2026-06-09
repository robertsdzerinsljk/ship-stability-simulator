<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scenarios', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vessel_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('cargo_plan_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('created_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('title');
            $table->text('short_description')->nullable();
            $table->longText('task_text')->nullable();

            $table->string('course')->nullable();
            $table->string('difficulty')->default('medium');
            $table->string('mode')->default('training');
            $table->string('status')->default('draft');

            $table->dateTime('due_at')->nullable();
            $table->unsignedSmallInteger('estimated_minutes')->nullable();

            $table->text('final_requirements')->nullable();
            $table->text('teacher_notes')->nullable();
            $table->text('student_hints')->nullable();

            $table->boolean('show_hints')->default(true);
            $table->boolean('allow_solution_comparison')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scenarios');
    }
};