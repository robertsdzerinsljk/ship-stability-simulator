<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_groups', function (Blueprint $table) {
            $table->id();

            $table->foreignIdFor(User::class, 'created_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('name');
            $table->string('code')->nullable();
            $table->string('academic_year')->nullable();

            // Piemēram: class, course, group
            $table->string('type')->default('class');

            // Piemēram: local, institution_db, google_workspace, auth0
            $table->string('external_source')->default('local');

            // Iestādes datubāzes/Google/Auth0 grupas ID, ja vēlāk sinhronizējam
            $table->string('external_id')->nullable();

            $table->text('description')->nullable();
            $table->string('status')->default('active');

            $table->timestamp('synced_at')->nullable();
            $table->timestamps();

            $table->unique(['name', 'academic_year']);
            $table->unique(['external_source', 'external_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_groups');
    }
};