<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
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

            $table->foreignId('cargo_plan_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('status')->default('submitted');
            $table->json('stability_snapshot')->nullable();

            $table->text('student_comment')->nullable();
            $table->text('teacher_comment')->nullable();
            $table->decimal('score', 5, 2)->nullable();

            $table->dateTime('submitted_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};