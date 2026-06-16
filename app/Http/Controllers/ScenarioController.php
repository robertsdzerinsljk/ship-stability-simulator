<?php

namespace App\Http\Controllers;

use App\Models\CargoPlan;
use App\Models\Scenario;
use App\Models\Vessel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScenarioController extends Controller
{
    public function index(Request $request): Response
    {
        $teacher = $request->user();

        $scenarios = Scenario::query()
            ->with(['vessel', 'cargoPlan', 'creator'])
            ->when(
                ! $teacher->hasRole('admin'),
                fn ($query) => $query->where('created_by_user_id', $teacher->id),
            )
            ->latest()
            ->get()
            ->map(fn (Scenario $scenario) => [
                'id' => $scenario->id,
                'title' => $scenario->title,
                'short_description' => $scenario->short_description,
                'course' => $scenario->course,
                'difficulty' => $scenario->difficulty,
                'mode' => $scenario->mode,
                'status' => $scenario->status,
                'due_at' => $scenario->due_at?->format('Y-m-d\TH:i'),
                'due_at_display' => $scenario->due_at?->format('d.m.Y H:i'),
                'estimated_minutes' => $scenario->estimated_minutes,
                'vessel_name' => $scenario->vessel?->name,
                'cargo_plan_name' => $scenario->cargoPlan?->name,
                'creator_name' => $scenario->creator?->name,
                'show_hints' => $scenario->show_hints,
                'allow_solution_comparison' => $scenario->allow_solution_comparison,
            ]);

        $vessels = Vessel::query()
            ->where('status', 'active')
            ->orderBy('name')
            ->get()
            ->map(fn (Vessel $vessel) => [
                'id' => $vessel->id,
                'name' => $vessel->name,
                'type' => $vessel->type,
                'imo_number' => $vessel->imo_number,
            ]);

        $cargoPlans = CargoPlan::query()
            ->with('vessel')
            ->where('status', 'active')
            ->latest()
            ->get()
            ->map(fn (CargoPlan $cargoPlan) => [
                'id' => $cargoPlan->id,
                'name' => $cargoPlan->name,
                'vessel_id' => $cargoPlan->vessel_id,
                'vessel_name' => $cargoPlan->vessel?->name,
            ]);

        return Inertia::render('Scenarios/Index', [
            'scenarios' => $scenarios,
            'vessels' => $vessels,
            'cargoPlans' => $cargoPlans,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'vessel_id' => ['required', 'exists:vessels,id'],
            'cargo_plan_id' => ['nullable', 'exists:cargo_plans,id'],
            'title' => ['required', 'string', 'max:255'],
            'short_description' => ['nullable', 'string', 'max:2000'],
            'task_text' => ['nullable', 'string'],
            'course' => ['nullable', 'string', 'max:255'],
            'difficulty' => ['required', 'in:easy,medium,hard'],
            'mode' => ['required', 'in:training,exam'],
            'due_at' => ['nullable', 'date'],
            'estimated_minutes' => ['nullable', 'integer', 'min:1', 'max:600'],
            'final_requirements' => ['nullable', 'string'],
            'student_hints' => ['nullable', 'string'],
            'show_hints' => ['boolean'],
            'allow_solution_comparison' => ['boolean'],
        ]);

        Scenario::create([
            ...$validated,
            'created_by_user_id' => $request->user()?->id,
            'status' => 'draft',
            'show_hints' => (bool) ($validated['show_hints'] ?? false),
            'allow_solution_comparison' => (bool) ($validated['allow_solution_comparison'] ?? false),
        ]);

        return back()->with('success', 'Scenārijs izveidots kā melnraksts.');
    }

    public function updateStatus(Request $request, Scenario $scenario): RedirectResponse
    {
        abort_unless(
            $request->user()->hasRole('admin')
                || $scenario->created_by_user_id === $request->user()->id,
            403,
        );

        $validated = $request->validate([
            'status' => ['required', 'in:draft,published,archived'],
        ]);

        $scenario->update([
            'status' => $validated['status'],
        ]);

        return back()->with('success', 'Scenārija statuss atjaunināts.');
    }
}
