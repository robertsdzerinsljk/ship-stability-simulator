<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vessels', function (Blueprint $table) {
            $table->boolean('is_real_vessel')->default(false)->after('status');
            $table->string('data_source_name')->nullable()->after('is_real_vessel');
            $table->text('data_source_url')->nullable()->after('data_source_name');
            $table->string('data_confidence')->default('training')->after('data_source_url');
            $table->text('data_notes')->nullable()->after('data_confidence');
            $table->text('hydrostatic_notes')->nullable()->after('data_notes');
        });
    }

    public function down(): void
    {
        Schema::table('vessels', function (Blueprint $table) {
            $table->dropColumn([
                'is_real_vessel',
                'data_source_name',
                'data_source_url',
                'data_confidence',
                'data_notes',
                'hydrostatic_notes',
            ]);
        });
    }
};