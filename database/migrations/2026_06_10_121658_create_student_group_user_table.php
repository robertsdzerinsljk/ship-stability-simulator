<?php

use App\Models\StudentGroup;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_group_user', function (Blueprint $table) {
            $table->id();

            $table->foreignIdFor(StudentGroup::class)
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignIdFor(User::class)
                ->constrained()
                ->cascadeOnDelete();

            // Parasti student, bet atstāju elastību nākotnei
            $table->string('member_role')->default('student');

            // Piemēram: active, removed, archived
            $table->string('status')->default('active');

            // Ja dalība nāk no ārējas sistēmas
            $table->string('external_source')->default('local');
            $table->string('external_membership_id')->nullable();

            $table->timestamp('joined_at')->nullable();
            $table->timestamp('synced_at')->nullable();

            $table->timestamps();

            $table->unique(['student_group_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_group_user');
    }
};