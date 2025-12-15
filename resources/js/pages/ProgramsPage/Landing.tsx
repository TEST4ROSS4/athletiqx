import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { FormModal } from '@/components/form-modal';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PlusCircle, Users } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { route } from 'ziggy-js';

interface Program {
    id: number;
    name: string;
    exercises_count: number;
    assignments_count: number;
}

interface Props {
    programs: Program[];
    summary: {
        total: number;
        assigned: number;
        unassigned: number;
        latest_created: string | null;
        latest_created_at: string | null;
    };
    teams: { id: number; name: string }[];
    filters: {
        team_id: number | null;
    };
    schools: { id: number; name: string }[];
    isAdmin: boolean;
    current_school_id: number;
}

export default function Landing({ programs, summary }: Props) {
    const { props } = usePage<{
        filters: { team_id: number | null };
        teams: { id: number; name: string }[];
        schools: { id: number; name: string }[];
        isAdmin: boolean;
        current_school_id: number;
    }>();
    const hasPrograms = programs.length > 0;
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, processing, errors, reset, transform } = useForm<{
        name: string;
        note: string;
        school_id: number | null;
        sport_team_id: number | null;
    }>({
        name: '',
        note: '',
        school_id: props.isAdmin ? props.current_school_id : props.current_school_id,
        sport_team_id: null,
    });
    const idCounter = useRef(2);
    const [quickExercises, setQuickExercises] = useState<{ id: number; name: string }[]>([
        { id: 1, name: 'New Exercise' },
    ]);

    function addExercise() {
        const id = idCounter.current++;
        setQuickExercises([...quickExercises, { id, name: `Exercise ${quickExercises.length + 1}` }]);
    }

    function updateExercise(id: number, name: string) {
        setQuickExercises((prev) => prev.map((ex) => (ex.id === id ? { ...ex, name } : ex)));
    }

    function removeExercise(id: number) {
        setQuickExercises((prev) => {
            const next = prev.filter((ex) => ex.id !== id);
            return next.length === 0 ? [{ id: 1, name: 'New Exercise' }] : next;
        });
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        // Build minimal valid payload with each quick exercise
        transform((payload) => ({
            ...payload,
            exercises: quickExercises.map((ex, idx) => ({
                name: ex.name.trim() || `Exercise ${idx + 1}`,
                description: null,
                order: idx,
                sets: [
                    {
                        order: 0,
                        fields: [{ name: 'Reps', type: 'number' }],
                        suggested_values: [{ value: '', unit: '' }],
                    },
                ],
            })),
        }));

        post(route('programs.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                transform((payload) => payload);
                setQuickExercises([{ id: 1, name: 'New Exercise' }]);
                idCounter.current = 2;
                setShowModal(false);
            },
        });
    }

    const schoolOptions = useMemo(() => {
        if (!props.isAdmin) return [];
        return props.schools.map((s) => ({ label: s.name, value: s.id }));
    }, [props.isAdmin, props.schools]);

    const teamOptions = useMemo(() => {
        if (!props.teams?.length) return [];
        return props.teams.map((t) => ({ label: t.name, value: t.id }));
    }, [props.teams]);

    const teamFilterOptions = useMemo(() => {
        const base: { label: string; value: number | null }[] = [{ label: 'All teams', value: null }];
        if (!props.teams?.length) return base;
        return base.concat(
            props.teams.map((team) => ({
                label: team.name,
                value: team.id,
            })),
        );
    }, [props.teams]);

    function onTeamChange(value: string) {
        const teamId = value ? Number(value) : null;
        const url = new URL(route('programs.landing').toString(), window.location.origin);
        if (teamId) {
            url.searchParams.set('team_id', teamId.toString());
        } else {
            url.searchParams.delete('team_id');
        }
        window.location.href = url.toString();
    }

    return (
        <AppLayout>
            <Head title="Training Programs Hub" />
            <div className="p-6">
                <div className="space-y-6">
                    {/* Header */}
                    <h1 className="flex items-center gap-2 text-3xl font-bold sm:text-4xl font-heading text-foreground">
                        🏋️ Training Programs Hub
                    </h1>

                    {teamFilterOptions.length > 1 && (
                        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-heading text-sm text-foreground">Filter by team</p>
                                <p className="text-xs text-muted-foreground">Admins can view programs for a specific team or all teams.</p>
                            </div>
                            <select
                                defaultValue={props.filters?.team_id?.toString() ?? ''}
                                onChange={(e) => onTeamChange(e.target.value)}
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60 sm:w-56"
                            >
                                {teamFilterOptions.map((opt) => (
                                    <option key={opt.value ?? 'all'} value={opt.value?.toString() ?? ''}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary/60 focus:outline-none"
                        >
                            <PlusCircle size={18} />
                            Quick Create Program
                        </Button>
                        <Link href={route('programs.create')}>
                            <Button variant="outline" className="flex items-center gap-2 border-border text-foreground">
                                <Users size={18} />
                                Open Full Builder
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                        <div className="rounded-lg border border-border bg-card p-4 text-center shadow-sm">
                            <p className="text-lg font-semibold">{summary.total}</p>
                            <p className="text-sm text-muted-foreground">
                                Total Programs
                            </p>
                        </div>
                        <div className="rounded-lg border border-border bg-primary/10 p-4 text-center shadow-sm">
                            <p className="text-lg font-semibold">
                                {summary.assigned}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Assigned
                            </p>
                        </div>
                        <div className="rounded-lg border border-border bg-destructive/10 p-4 text-center shadow-sm">
                            <p className="text-lg font-semibold">
                                {summary.unassigned}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Unassigned
                            </p>
                        </div>
                        {summary.latest_created && (
                            <div className="rounded-lg border border-border bg-muted/60 p-4 text-center shadow-sm">
                                <p className="text-sm font-medium text-foreground">
                                    Last Created Program
                                </p>
                                <p className="mt-1 text-lg font-semibold">
                                    {summary.latest_created}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(
                                        summary.latest_created_at!,
                                    ).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </p>

                            </div>
                        )}
                    </div>

                    {/* Recently Updated Programs */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                                🕓 Recently Updated Programs
                            </h2>
                            {hasPrograms && (
                                <Link href={route('programs.index')}>
                                    <Button variant="outline" size="sm" className="border-border text-foreground">
                                        🔍 View All
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {!hasPrograms ? (
                            <p className="text-muted-foreground">
                                No recent programs found.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                {programs.map((program) => (
                                    <Link
                                        key={program.id}
                                        href={route('programs.show', program.id)}
                                    >
                                        <Card className="cursor-pointer transition hover:shadow-lg hover:ring-2 hover:ring-primary">
                                            <CardHeader>
                                                <CardTitle className="truncate">
                                                    {program.name}
                                                </CardTitle>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    • {program.exercises_count}{' '}
                                                    {program.exercises_count === 1
                                                        ? 'Exercise'
                                                        : 'Exercises'}
                                                    <br />•{' '}
                                                    {program.assignments_count > 0
                                                        ? `Assigned to ${program.assignments_count} ${program.assignments_count === 1 ? 'Team/Individual' : 'Teams/Individuals'}`
                                                        : 'Unassigned'}
                                                </p>
                                            </CardHeader>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {!hasPrograms && (
                        <div className="mt-6 text-center">
                            <Link href={route('programs.index')}>
                                <Button size="lg" className="text-lg bg-primary text-primary-foreground hover:bg-primary/90">
                                    🔍 View All Programs
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-6 backdrop-blur-sm">
                    <FormModal
                        title="Quick Create Program"
                        backHref={route('programs.landing')}
                        backLabel="Close"
                        onBack={() => {
                            reset();
                            transform((payload) => payload);
                            setShowModal(false);
                        }}
                    >
                        <form onSubmit={submit} className="space-y-5 font-sans">
                            <div className="grid gap-2">
                                <label htmlFor="name" className="font-heading text-sm text-foreground">
                                    Program Name:
                                </label>
                                <input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/60 focus:outline-none"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                            </div>

                            {teamOptions.length > 0 && (
                                <div className="grid gap-2">
                                    <label htmlFor="team" className="font-heading text-sm text-foreground">
                                        Team (optional):
                                    </label>
                                    <select
                                        id="team"
                                        value={data.sport_team_id ?? ''}
                                        onChange={(e) => setData('sport_team_id', e.target.value ? Number(e.target.value) : null)}
                                        className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/60 focus:outline-none"
                                    >
                                        <option value="">No team</option>
                                        {teamOptions.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {props.isAdmin && (
                                <div className="grid gap-2">
                                    <label htmlFor="school" className="font-heading text-sm text-foreground">
                                        School:
                                    </label>
                                    <select
                                        id="school"
                                        value={data.school_id ?? ''}
                                        onChange={(e) => setData('school_id', e.target.value ? Number(e.target.value) : null)}
                                        className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/60 focus:outline-none"
                                    >
                                        {schoolOptions.map((s) => (
                                            <option key={s.value} value={s.value}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <label htmlFor="note" className="font-heading text-sm text-foreground">
                                    Note (optional):
                                </label>
                                <textarea
                                    id="note"
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/60 focus:outline-none"
                                    placeholder="Brief note about this program"
                                    rows={3}
                                />
                                {errors.note && <p className="mt-1 text-sm text-red-500">{errors.note}</p>}
                            </div>

                            <div className="space-y-3 rounded-md border border-border bg-muted/30 p-3 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <p className="font-heading text-sm text-foreground">Exercises</p>
                                    <button
                                        type="button"
                                        onClick={addExercise}
                                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                        Add Exercise
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {quickExercises.map((ex, idx) => (
                                        <div key={ex.id} className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={ex.name}
                                                onChange={(e) => updateExercise(ex.id, e.target.value)}
                                                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/60 focus:outline-none"
                                                placeholder={`Exercise ${idx + 1}`}
                                            />
                                            {quickExercises.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeExercise(ex.id)}
                                                    className="text-xs text-destructive hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        reset();
                                        transform((payload) => payload);
                                        setQuickExercises([{ id: 1, name: 'New Exercise' }]);
                                        idCounter.current = 2;
                                        setShowModal(false);
                                    }}
                                    className="rounded-md border border-border px-4 py-2 font-heading text-sm text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-border"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-primary px-4 py-2 font-heading font-semibold text-primary-foreground transition hover:bg-primary/90 focus:ring-2 focus:ring-primary/60 focus:outline-none disabled:opacity-70"
                                >
                                    Create Program
                                </button>
                            </div>
                        </form>
                    </FormModal>
                </div>
            )}
        </AppLayout>
    );
}
