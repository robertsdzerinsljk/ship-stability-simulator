<?php

namespace Database\Seeders;

use App\Models\CargoPlan;
use App\Models\Scenario;
use App\Models\User;
use App\Models\Vessel;
use Illuminate\Database\Seeder;

class ScenarioSeeder extends Seeder
{
    public function run(): void
    {
        $vessel = Vessel::query()
            ->where('imo_number', '8420804')
            ->first();

        if (! $vessel) {
            $vessel = Vessel::query()
                ->where('status', 'active')
                ->first();
        }

        if (! $vessel) {
            return;
        }

        $cargoPlan = CargoPlan::query()
            ->where('vessel_id', $vessel->id)
            ->where('status', 'active')
            ->latest()
            ->first();

        $teacher = User::query()
            ->where('email', 'teacher@example.test')
            ->first();

        Scenario::updateOrCreate(
            ['title' => 'Beramkravas izvietojuma un balasta korekcijas uzdevums'],
            [
                'vessel_id' => $vessel->id,
                'cargo_plan_id' => $cargoPlan?->id,
                'created_by_user_id' => $teacher?->id,
                'short_description' => 'Studentam jāizvērtē beramkravas izvietojums uz bulk/ore carrier tipa kuģa, jāpārbauda stabilitāte un jāveic balasta korekcija.',
                'task_text' => 'Izmantojot piešķirto bulk carrier tipa kuģi un sākotnējo kravas plānu, pārbaudi tilpņu noslodzi, GM, trimu, sasvērumu un brīvās virsmas risku. Ja nepieciešams, koriģē balasta tankus tā, lai kuģa stāvoklis atbilstu drošības kritērijiem.',
                'course' => 'Kuģa stabilitāte',
                'difficulty' => 'medium',
                'mode' => 'training',
                'status' => 'published',
                'due_at' => now()->addDays(7),
                'estimated_minutes' => 45,
                'final_requirements' => 'Gala risinājumā jābūt izpildītam minimālajam GM, trima robežai, sasvēruma robežai un tilpņu noslodzes prasībām. Studentam jāģenerē PDF pārskats.',
                'teacher_notes' => 'Demo scenārijs ar reāla kuģa publiskajiem pamatdatiem un mācību aproksimācijām.',
                'student_hints' => 'Sāc ar tilpņu noslodzes pārbaudi, pēc tam pārbaudi GM un tikai tad koriģē balastu.',
                'show_hints' => true,
                'allow_solution_comparison' => false,
            ],
        );
    }
}