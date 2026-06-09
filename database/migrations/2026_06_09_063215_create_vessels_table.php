<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vessels', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('imo_number')->nullable()->index();
            $table->string('mmsi')->nullable()->index();
            $table->string('type')->nullable();
            $table->string('flag')->nullable();
            $table->string('class')->nullable();
            $table->string('operator')->nullable();

            $table->unsignedSmallInteger('built_year')->nullable();

            $table->decimal('length_overall', 10, 2)->nullable();
            $table->decimal('length_between_perpendiculars', 10, 2)->nullable();
            $table->decimal('breadth', 10, 2)->nullable();
            $table->decimal('depth', 10, 2)->nullable();
            $table->decimal('summer_draft', 10, 2)->nullable();

            $table->decimal('dwt', 12, 2)->nullable();
            $table->decimal('gt', 12, 2)->nullable();
            $table->decimal('lightship_weight', 12, 2)->nullable();
            $table->decimal('km_default', 10, 3)->nullable();

            $table->string('status')->default('active');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vessels');
    }
};