<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            $table->timestamp('due_soon_notified_at')->nullable()->after('due_at');
            $table->timestamp('overdue_notified_at')->nullable()->after('due_soon_notified_at');
        });
    }

    public function down(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            $table->dropColumn([
                'due_soon_notified_at',
                'overdue_notified_at',
            ]);
        });
    }
};