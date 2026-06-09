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
        $teacher = User::query()
            ->where('email', 'teacher@example.test')
            ->first();

        $this->createScenario(
            imo: '9811000',
            teacherId: $teacher?->id,
            title: 'Konteinerkuģa kravas sadalījuma un GM pārbaude',
            shortDescription: 'Studentam jāizvērtē konteineru kravas sadalījums uz liela konteinerkuģa un jāpārbauda GM, trims un GZ līkne.',
            taskText: 'Izmantojot EVER GIVEN tipa konteinerkuģa mācību modeli, pārbaudi konteineru kravas sadalījumu pa bay grupām. Analizē kopējo kravas svaru, GM, KG, KM, trimu, sasvērumu un GZ līkni. Ja kāds kritērijs tuvojas robežai, koriģē kravas vai balasta sadalījumu un pārbaudi rezultātu atkārtoti.',
            finalRequirements: 'Gala risinājumā GM jābūt virs minimālās robežas, trims un sasvērums nedrīkst pārsniegt noteiktās robežas, bay grupas nedrīkst būt pārslogotas, un studentam jāspēj paskaidrot, kā kravas izvietojums ietekmē KG un GM.',
            hints: 'Konteinerkuģim īpaši uzmanīgi skaties uz vertikālo masas centru. Ja krava atrodas augstāk, KG palielinās un GM samazinās. Pārbaudi arī, vai priekšgals un pakaļgals nav pārāk atšķirīgi noslogoti.',
            difficulty: 'medium',
            mode: 'training',
            estimatedMinutes: 45,
        );

        $this->createScenario(
            imo: '8420804',
            teacherId: $teacher?->id,
            title: 'Beramkravas izvietojuma un balasta korekcijas uzdevums',
            shortDescription: 'Studentam jāizvērtē beramkravas izvietojums uz bulk/ore carrier tipa kuģa, jāpārbauda stabilitāte un jāveic balasta korekcija.',
            taskText: 'Izmantojot GEOSTAHL / ex BERGE STAHL bulk/ore carrier mācību modeli, pārbaudi dzelzsrūdas izvietojumu pa tilpnēm. Analizē tilpņu noslodzi, GM, trimu, sasvērumu un brīvās virsmas risku. Ja nepieciešams, koriģē balasta tankus tā, lai kuģa stāvoklis atbilstu stabilitātes kritērijiem.',
            finalRequirements: 'Gala risinājumā jābūt izpildītam minimālajam GM, trima robežai, sasvēruma robežai un tilpņu noslodzes prasībām. Studentam jāģenerē PDF pārskats.',
            hints: 'Bulk carrier gadījumā lielākā uzmanība jāpievērš gareniskajam kravas sadalījumam. Ja pārāk daudz kravas ir priekšgalā vai pakaļgalā, trims pasliktināsies.',
            difficulty: 'medium',
            mode: 'training',
            estimatedMinutes: 45,
        );

        $this->createScenario(
            imo: '9235268',
            teacherId: $teacher?->id,
            title: 'Tankkuģa šķidrās kravas un brīvās virsmas efekta analīze',
            shortDescription: 'Studentam jāanalizē tankkuģa šķidrās kravas izvietojums, balasts un brīvās virsmas ietekme uz GM.',
            taskText: 'Izmantojot SA EUROPE / ex TI EUROPE tankkuģa mācību modeli, pārbaudi šķidrās kravas un segregētā balasta izvietojumu. Pievērs uzmanību daļēji piepildītiem tankiem, jo tie var radīt brīvās virsmas efektu un samazināt GM. Novērtē, vai kuģis saglabā pietiekamu stabilitātes rezervi.',
            finalRequirements: 'Gala risinājumā GM jābūt virs minimālās robežas, brīvās virsmas risks jāsamazina, port/starboard balansam jābūt pieņemamam, trims nedrīkst pārsniegt robežu, un jābūt sagatavotam PDF pārskatam.',
            hints: 'Tankkuģim brīvās virsmas efekts ir ļoti būtisks. Daļēji piepildīti tanki var samazināt efektīvo GM, tāpēc mēģini tankus turēt vai nu tukšākus, vai pilnākus, nevis daudzus daļēji piepildītus.',
            difficulty: 'hard',
            mode: 'training',
            estimatedMinutes: 60,
        );

        $this->createScenario(
            imo: '9443255',
            teacherId: $teacher?->id,
            title: 'Ro-Ro pasažieru kuģa klāju noslodzes un sasvēruma pārbaude',
            shortDescription: 'Studentam jāizvērtē Ro-Ro/pasažieru kuģa transportlīdzekļu izvietojums, sasvērums un stabilitātes rezerve.',
            taskText: 'Izmantojot BALTIC QUEEN Ro-Ro/pasažieru kuģa mācību modeli, pārbaudi transportlīdzekļu un servisa kravas izvietojumu pa klājiem. Novērtē, kā augstāk izvietota krava ietekmē KG un GM. Pārbaudi arī sasvērumu, jo pasažieru kuģim pieļaujamās robežas ir stingrākas.',
            finalRequirements: 'Gala risinājumā sasvērums nedrīkst pārsniegt pasažieru kuģim noteikto robežu, GM jābūt pietiekamam, klāju noslodze nedrīkst būt pārsniegta, un studentam jāspēj paskaidrot, kā augsta klāja krava ietekmē stabilitāti.',
            hints: 'Ro-Ro kuģim svarīgi skatīties ne tikai kravas svaru, bet arī to, cik augstu tā atrodas. Augstāks VCG nozīmē lielāku KG un mazāku GM.',
            difficulty: 'medium',
            mode: 'training',
            estimatedMinutes: 45,
        );

        $this->createScenario(
            imo: '9443255',
            teacherId: $teacher?->id,
            title: 'Eksāmens: Ro-Ro kuģa stabilitātes izvērtēšana bez hintiem',
            shortDescription: 'Eksāmena scenārijs, kur studentam patstāvīgi jāizvērtē Ro-Ro kuģa stabilitātes stāvoklis.',
            taskText: 'Patstāvīgi pārbaudi Ro-Ro/pasažieru kuģa kravas un balasta stāvokli. Nosaki, vai kuģis atbilst stabilitātes prasībām, un sagatavo gala risinājumu ar PDF pārskatu.',
            finalRequirements: 'Jābūt pārbaudītam GM, trimam, sasvērumam, tilpņu/klāju noslodzei un balasta stāvoklim. Gala darbā jāiesniedz komentārs ar pamatojumu.',
            hints: null,
            difficulty: 'hard',
            mode: 'exam',
            estimatedMinutes: 40,
            showHints: false,
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
        bool $showHints = true,
    ): void {
        $vessel = Vessel::query()
            ->where('imo_number', $imo)
            ->first();

        if (! $vessel) {
            return;
        }

        $cargoPlan = CargoPlan::query()
            ->where('vessel_id', $vessel->id)
            ->where('status', 'active')
            ->latest()
            ->first();

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
                'teacher_notes' => 'Scenārijs izveidots reāla publiska kuģa pamatdatiem ar mācību aproksimācijām.',
                'student_hints' => $hints,
                'show_hints' => $showHints,
                'allow_solution_comparison' => $mode !== 'exam',
            ],
        );
    }
}