import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import AsyncSelect from 'react-select/async';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Edit Assignment', href: '/coach-assignments' },
];

export default function Edit({
    assignment,
    coaches,
    sports,
    sportTeams,
}: {
    assignment: {
        id: number;
        coach_id: number;
        sport_id: number | null;
        sport_team_id: number | null;
    };
    coaches: { id: number; name: string; email: string }[];
    sports: { id: number; name: string }[];
    sportTeams: { id: number; name: string; sport: { name: string } }[];
}) {
    const { data, setData, errors, put } = useForm<{
        coach_id: number | null;
        sport_id: number | null;
        sport_team_id: number | null;
    }>({
        coach_id: assignment.coach_id,
        sport_id: assignment.sport_id,
        sport_team_id: assignment.sport_team_id,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('coach-assignments.update', assignment.id));
    }

    function loadCoachOptions(inputValue: string, callback: (options: any[]) => void) {
        const filtered = coaches
            .filter((c) =>
                c.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                c.email.toLowerCase().includes(inputValue.toLowerCase())
            )
            .map((c) => ({
                label: `${c.name} (${c.email})`,
                value: c.id,
            }));
        callback(filtered);
    }

    function loadSportOptions(inputValue: string, callback: (options: any[]) => void) {
        const filtered = sports
            .filter((s) => s.name.toLowerCase().includes(inputValue.toLowerCase()))
            .map((s) => ({
                label: s.name,
                value: s.id,
            }));
        callback(filtered);
    }

    function loadSportTeamOptions(inputValue: string, callback: (options: any[]) => void) {
        const filtered = sportTeams
            .filter((t) =>
                t.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                t.sport.name.toLowerCase().includes(inputValue.toLowerCase())
            )
            .map((t) => ({
                label: `${t.name} (${t.sport.name})`,
                value: t.id,
            }));
        callback(filtered);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Assignment" />
            <div className="p-3">
                <h1 className="mb-4 text-2xl font-bold">Edit Coach Assignment</h1>

                <Link
                    href={route('coach-assignments.index')}
                    className="mb-4 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                >
                    Back
                </Link>

                <form onSubmit={submit} className="mx-auto mt-4 max-w-md space-y-6">
                    {/* Coach Select */}
                    <div className="grid gap-2">
                        <label htmlFor="coach_id" className="text-sm font-medium">Coach:</label>
                        <AsyncSelect
                            cacheOptions
                            defaultOptions
                            isClearable
                            loadOptions={loadCoachOptions}
                            defaultValue={{
                                label: coaches.find(c => c.id === assignment.coach_id)?.name || '',
                                value: assignment.coach_id,
                            }}
                            onChange={(option) => setData('coach_id', option?.value ?? null)}
                            placeholder="Search and select coach"
                        />
                        {errors.coach_id && (
                            <p className="mt-1 text-sm text-red-500">{errors.coach_id}</p>
                        )}
                    </div>

                    {/* Sport Select */}
                    <div className="grid gap-2">
                        <label htmlFor="sport_id" className="text-sm font-medium">Assign to All Teams in:</label>
                        <AsyncSelect
                            cacheOptions
                            defaultOptions
                            isClearable
                            loadOptions={loadSportOptions}
                            defaultValue={
                                assignment.sport_id
                                    ? {
                                        label: sports.find(s => s.id === assignment.sport_id)?.name || '',
                                        value: assignment.sport_id,
                                    }
                                    : null
                            }
                            onChange={(option) => {
                                setData('sport_id', option?.value ?? null);
                                if (!option) setData('sport_team_id', null);
                            }}
                            isDisabled={!!data.sport_team_id}
                            placeholder="Search and select sport"
                        />

                        {errors.sport_id && (
                            <p className="mt-1 text-sm text-red-500">{errors.sport_id}</p>
                        )}
                    </div>

                    {/* Sport Team Select */}
                    <div className="grid gap-2">
                        <label htmlFor="sport_team_id" className="text-sm font-medium">Assign to Specific Team:</label>
                        <AsyncSelect
                            cacheOptions
                            defaultOptions
                            isClearable
                            loadOptions={loadSportTeamOptions}
                            defaultValue={
                                assignment.sport_team_id
                                    ? {
                                        label: sportTeams.find(t => t.id === assignment.sport_team_id)
                                            ? `${sportTeams.find(t => t.id === assignment.sport_team_id)?.name} (${sportTeams.find(t => t.id === assignment.sport_team_id)?.sport.name})`
                                            : '',
                                        value: assignment.sport_team_id,
                                    }
                                    : null
                            }
                            onChange={(option) => {
                                setData('sport_team_id', option?.value ?? null);
                                if (!option) setData('sport_id', null);
                            }}
                            isDisabled={!!data.sport_id}
                            placeholder="Search and select team"
                        />

                        {errors.sport_team_id && (
                            <p className="mt-1 text-sm text-red-500">{errors.sport_team_id}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="rounded-md bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700"
                    >
                        Update
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}