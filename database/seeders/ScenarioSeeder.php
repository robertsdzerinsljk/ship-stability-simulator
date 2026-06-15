<?php

namespace Database\Seeders;

use App\Models\CargoPlan;
use App\Models\Scenario;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use App\Models\Vessel;
use Illuminate\Database\Seeder;


class ScenarioSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = User::query()
            ->where('email', 'teacher@example.test')
            ->first();

        $this->createScenario(
            imo: '9811000',
            teacherId: $teacher?->id,
            title: 'Konteinerkuģis: augsta krava un GM samazinājuma risks',
            shortDescription: 'Sākuma situācijā konteineru krava ir izvietota tā, ka jāizvērtē KG, GM un sānu/gareniskā balansa ietekme.',
            taskText: 'EVER GIVEN tipa konteinerkuģim ir sagatavots sākuma kravas plāns ar potenciāli nelabvēlīgu kravas sadalījumu. Studentam jāpārbauda, vai kuģa GM, trims, sasvērums un tilpņu noslodze atbilst drošības prasībām. Ja kāds rādītājs tuvojas robežai vai to pārsniedz, jāveic kravas un/vai balasta korekcijas un atkārtoti jāpārbauda stabilitātes rezultāti.',
            finalRequirements: 'Gala risinājumā GM jābūt virs minimālās robežas, sasvērumam un trimam jābūt pieļaujamās robežās, kravas tilpnes nedrīkst būt pārslogotas, un PDF pārskatā jābūt redzamam gala stabilitātes stāvoklim.',
            hints: 'Sāc ar GM un KG pārbaudi. Ja KG ir pārāk augsts, GM samazinās. Pēc tam pārbaudi, vai krava nav radījusi nevajadzīgu sasvērumu vai trimu.',
            difficulty: 'medium',
            mode: 'training',
            estimatedMinutes: 45,
            problemPreset: 'container_high_gm_risk',
        );

        $this->createScenario(
            imo: '8420804',
            teacherId: $teacher?->id,
            title: 'Beramkravas kuģis: priekšgala/pakaļgala trima korekcija',
            shortDescription: 'Sākuma situācijā beramkravas sadalījums var radīt nelabvēlīgu trimu un tilpņu noslodzes problēmas.',
            taskText: 'GEOSTAHL / ex BERGE STAHL beramkravas kuģim dots sākuma kravas plāns. Studentam jāizvērtē, vai krava nav pārāk koncentrēta vienā kuģa daļā, kā tas ietekmē trimu, iegrimi un tilpņu noslodzi. Nepieciešamības gadījumā jāpielāgo kravas un balasta sadalījums, lai kuģis sasniegtu drošu ekspluatācijas stāvokli.',
            finalRequirements: 'Gala risinājumā trimam jābūt pieļaujamās robežās, GM jābūt virs minimālās robežas, tilpņu noslodze nedrīkst pārsniegt robežas un jābūt sagatavotam PDF pārskatam.',
            hints: 'Bulk carrier gadījumā īpaši svarīgs ir gareniskais kravas sadalījums. Salīdzini priekšgala un pakaļgala iegrimi.',
            difficulty: 'medium',
            mode: 'training',
            estimatedMinutes: 45,
            problemPreset: 'bulk_forward_trim',
            
        );

        $this->createScenario(
            imo: '9235268',
            teacherId: $teacher?->id,
            title: 'Tankkuģis: brīvās virsmas efekta un GM rezerves analīze',
            shortDescription: 'Studentam jāizvērtē šķidrās kravas un balasta ietekme uz efektīvo GM un stabilitātes rezervi.',
            taskText: 'SA EUROPE / ex TI EUROPE tankkuģim dots sākuma stāvoklis ar šķidrās kravas un balasta izvietojumu. Studentam jāizvērtē, vai daļēji piepildīti tanki un balasta sadalījums nerada pārāk lielu brīvās virsmas efektu. Jāpārbauda GM, corrected GM, trims, sasvērums un kopējā stabilitātes rezerve.',
            finalRequirements: 'Gala risinājumā corrected GM jābūt virs minimālās robežas, brīvās virsmas risks jāsamazina, trims un sasvērums nedrīkst pārsniegt robežas, un jābūt sagatavotam PDF pārskatam.',
            hints: 'Ja iespējams, izvairies no vairākiem daļēji piepildītiem tankiem. Brīvās virsmas korekcija samazina efektīvo GM.',
            difficulty: 'hard',
            mode: 'training',
            estimatedMinutes: 60,
            problemPreset: 'tanker_uneven_liquid_load',
        );

        $this->createScenario(
            imo: '9443255',
            teacherId: $teacher?->id,
            title: 'Ro-Ro kuģis: klāja kravas sasvēruma pārbaude',
            shortDescription: 'Sākuma situācijā transportlīdzekļu un servisa kravas izvietojums var radīt sasvēruma un GM risku.',
            taskText: 'BALTIC QUEEN Ro-Ro/pasažieru kuģim dots sākuma kravas izvietojums pa klājiem. Studentam jāizvērtē, kā augstāk izvietota un sāniski nevienmērīgi sadalīta krava ietekmē KG, GM un sasvērumu. Nepieciešamības gadījumā jāveic korekcijas, lai sasniegtu drošu stāvokli.',
            finalRequirements: 'Gala risinājumā sasvērumam jābūt pieļaujamā robežā, GM jābūt pietiekamam, klāju noslodze nedrīkst būt pārsniegta, un studentam jāspēj pamatot veiktās izmaiņas.',
            hints: 'Ro-Ro kuģim svarīgi skatīties ne tikai kravas svaru, bet arī to, cik augstu un uz kuru sānu tā atrodas.',
            difficulty: 'medium',
            mode: 'training',
            estimatedMinutes: 45,
            problemPreset: 'roro_heel_risk',
        );

        $this->createScenario(
            imo: '9443255',
            teacherId: $teacher?->id,
            title: 'Eksāmens: Ro-Ro kuģa stabilitātes izvērtēšana',
            shortDescription: 'Eksāmena scenārijs bez hintiem, kur studentam patstāvīgi jāizvērtē kuģa stabilitātes stāvoklis.',
            taskText: 'Patstāvīgi pārbaudi Ro-Ro/pasažieru kuģa kravas un balasta stāvokli. Nosaki, vai kuģis atbilst stabilitātes prasībām. Ja nepieciešams, veic korekcijas un sagatavo gala risinājumu ar PDF pārskatu.',
            finalRequirements: 'Jābūt pārbaudītam GM, corrected GM, trimam, sasvērumam, tilpņu/klāju noslodzei un balasta stāvoklim. Gala darbā jāiesniedz risinājums ar pamatojumu.',
            hints: null,
            difficulty: 'hard',
            mode: 'exam',
            estimatedMinutes: 40,
            showHints: false,
            problemPreset: 'roro_exam_mixed_problem',
        );
    }

    private function createScenario(
        string $imo,
        ?int $teacherId,
        string $title,
        string $shortDescription,
        string $taskText,
        string $finalRequirements,
        ?string $hints,
        string $difficulty,
        string $mode,
        int $estimatedMinutes,
        string $problemPreset,
        bool $showHints = true,
    ): void {
        $vessel = Vessel::query()
            ->where('imo_number', $imo)
            ->first();

        if (! $vessel) {
            return;
        }

        $cargoPlan = $this->createScenarioCargoPlan(
            vessel: $vessel,
            scenarioTitle: $title,
            problemPreset: $problemPreset,
        );

        Scenario::updateOrCreate(
            ['title' => $title],
            [
                'vessel_id' => $vessel->id,
                'cargo_plan_id' => $cargoPlan?->id,
                'created_by_user_id' => $teacherId,
                'short_description' => $shortDescription,
                'task_text' => $taskText,
                'course' => 'Kuģa stabilitāte',
                'difficulty' => $difficulty,
                'mode' => $mode,
                'status' => 'published',
                'due_at' => now()->addDays($mode === 'exam' ? 3 : 7),
                'estimated_minutes' => $estimatedMinutes,
                'final_requirements' => $finalRequirements,
                'teacher_notes' => 'Scenārijs paredzēts kā sākuma problēmsituācija. Students nedrīkst tikai atvērt pārskatu un iesniegt darbu bez analīzes/korekcijām.',
                'student_hints' => $hints,
                'show_hints' => $showHints,
                'allow_solution_comparison' => $mode !== 'exam',
            ],
        );
    }
    private function createScenarioCargoPlan(
    Vessel $vessel,
    string $scenarioTitle,
    string $problemPreset,
): ?CargoPlan {
    $baseCargoPlan = CargoPlan::query()
        ->where('vessel_id', $vessel->id)
        ->where('status', 'active')
        ->latest('id')
        ->first();

    if (! $baseCargoPlan) {
        $baseCargoPlan = CargoPlan::query()
            ->where('vessel_id', $vessel->id)
            ->whereNotIn('status', ['scenario_template', 'solution'])
            ->latest('id')
            ->first();
    }

    if (! $baseCargoPlan) {
        return null;
    }

    $existingScenario = Scenario::query()
        ->with('cargoPlan')
        ->where('title', $scenarioTitle)
        ->first();

    $cargoPlan = null;

    if (
        $existingScenario?->cargoPlan &&
        $existingScenario->cargoPlan->status === 'scenario_template'
    ) {
        $cargoPlan = $existingScenario->cargoPlan;
    }

    if (! $cargoPlan) {
        $cargoPlan = $baseCargoPlan->replicate();
        $cargoPlan->vessel_id = $vessel->id;
    }

    if (Schema::hasColumn($cargoPlan->getTable(), 'name')) {
        $cargoPlan->name = 'Scenario template: '.$scenarioTitle;
    }

    if (Schema::hasColumn($cargoPlan->getTable(), 'status')) {
        $cargoPlan->status = 'scenario_template';
    }

    if (Schema::hasColumn($cargoPlan->getTable(), 'notes')) {
        $cargoPlan->notes = 'Sākuma kravas plāna kopija scenārijam: '.$scenarioTitle;
    }

    $cargoPlan->save();

    $cargoPlan->items()->delete();

    $baseItems = $baseCargoPlan->items()
        ->orderBy('id')
        ->get();

    $itemCount = max($baseItems->count(), 1);

    foreach ($baseItems as $index => $baseItem) {
        $item = $baseItem->replicate();
        $item->cargo_plan_id = $cargoPlan->id;

        $this->applyProblemPresetToCargoItem(
            item: $item,
            problemPreset: $problemPreset,
            index: $index,
            itemCount: $itemCount,
        );

        $item->save();
    }

    return $cargoPlan->refresh();
}

private function applyProblemPresetToCargoItem(
    Model $item,
    string $problemPreset,
    int $index,
    int $itemCount,
): void {
    $baseWeight = max((float) $item->weight_tonnes, 100.0);
    $baseVolume = max((float) $item->volume_m3, 100.0);

    $middleStart = (int) floor($itemCount / 3);
    $middleEnd = (int) ceil(($itemCount / 3) * 2);

    $factor = match ($problemPreset) {
        // Konteinerkuģim smagāka vidus/augstāka kravas zona, lai GM rezerve būtu jāpārbauda.
        'container_high_gm_risk' => ($index >= $middleStart && $index <= $middleEnd)
            ? 1.45
            : 0.75,

        // Bulk kuģim sākumā pārāk liels svars priekšējā daļā.
        'bulk_forward_trim' => $index < ($itemCount / 2)
            ? 1.65
            : 0.45,

        // Tankerim nevienmērīga šķidrās kravas slodze.
        'tanker_uneven_liquid_load' => $index % 2 === 0
            ? 1.35
            : 0.60,

        // Ro-Ro kuģim nevienmērīga slodze, kas rada sasvēruma/GM risku.
        'roro_heel_risk' => $index % 2 === 0
            ? 1.50
            : 0.55,

        // Eksāmenam kombinēta problēma.
        'roro_exam_mixed_problem' => match (true) {
            $index < ($itemCount / 3) => 1.35,
            $index < (($itemCount / 3) * 2) => 0.50,
            default => 1.25,
        },

        default => 1.0,
    };

    $item->weight_tonnes = round($baseWeight * $factor, 2);
    $item->volume_m3 = round($baseVolume * $factor, 2);

    if (Schema::hasColumn($item->getTable(), 'status')) {
        $item->status = 'planned';
    }

    if (Schema::hasColumn($item->getTable(), 'cargo_name')) {
        $item->cargo_name = $this->scenarioCargoName(
            originalName: (string) $item->cargo_name,
            problemPreset: $problemPreset,
        );
    }
}

private function scenarioCargoName(string $originalName, string $problemPreset): string
{
    $prefix = match ($problemPreset) {
        'container_high_gm_risk' => 'Scenario high stack',
        'bulk_forward_trim' => 'Scenario forward load',
        'tanker_uneven_liquid_load' => 'Scenario uneven liquid',
        'roro_heel_risk' => 'Scenario side load',
        'roro_exam_mixed_problem' => 'Exam mixed load',
        default => 'Scenario load',
    };

    return mb_substr($prefix.' - '.$originalName, 0, 255);
}
}