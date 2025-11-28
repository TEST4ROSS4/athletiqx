import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import AsyncSelect from 'react-select/async';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Edit Assignment', href: '/coach-assignments' },
];

type Option = { label: string; value: number };

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

    const coachOptions: Option[] = coaches.map((c) => ({
        label: `${c.name} (${c.email})`,
        value: c.id,
    }));

    const sportOptions: Option[] = sports.map((s) => ({
        label: s.name,
        value: s.id,
    }));

    const teamOptions: Option[] = sportTeams.map((t) => ({
        label: `${t.name} (${t.sport.name})`,
        value: t.id,
    }));

    function loadOptions(
        options: Option[],
        inputValue: string,
        callback: (filtered: Option[]) => void
    ) {
        const filtered = options.filter((o) =>
            o.label.toLowerCase().includes(inputValue.toLowerCase())
        );
        callback(filtered);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Assignment" />
            <div className="p-3">
                <div className="p-3">
                    {/* Heading */}
                    <h1 className="text-2xl font-heading font-semibold text-[#102d4e] mb-4">
                        Edit Coach Assignment
                    </h1>

                    {/* Back Button */}
                    <Link
                        href={route('coach-assignments.index')}
                        className="mb-4 inline-block rounded-lg bg-[#102d4e] px-4 py-2 text-sm font-heading font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Back
                    </Link>

                    <form onSubmit={submit} className="space-y-6 mt-4 max-w-md mx-auto font-sans">
                        {/* Coach Select */}
                        <div className="grid gap-2">
                            <label htmlFor="coach_id" className="text-sm font-heading text-[#102d4e]">
                                Team Manager (any user with team access permission):
                            </label>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                isClearable
                                loadOptions={(input, cb) => loadOptions(coachOptions, input, cb)}
                                onChange={(option) => setData('coach_id', option?.value ?? null)}
                                value={coachOptions.find((o) => o.value === data.coach_id) || null}
                                placeholder="Search and select user"
                            />
                            {errors.coach_id && (
                                <p className="mt-1 text-sm text-red-500">{errors.coach_id}</p>
                            )}
                        </div>

                        {/* Sport Select */}
                        <div className="grid gap-2">
                            <label htmlFor="sport_id" className="text-sm font-heading text-[#102d4e]">
                                Assign to All Teams in:
                            </label>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                isClearable
                                loadOptions={(input, cb) => loadOptions(sportOptions, input, cb)}
                                onChange={(option) => {
                                    setData('sport_id', option?.value ?? null);
                                    if (!option) setData('sport_team_id', null);
                                }}
                                value={sportOptions.find((o) => o.value === data.sport_id) || null}
                                isDisabled={!!data.sport_team_id}
                                placeholder="Search and select sport"
                            />
                            {errors.sport_id && (
                                <p className="mt-1 text-sm text-red-500">{errors.sport_id}</p>
                            )}
                        </div>

                        {/* Sport Team Select */}
                        <div className="grid gap-2">
                            <label htmlFor="sport_team_id" className="text-sm font-heading text-[#102d4e]">
                                Assign to Specific Team:
                            </label>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                isClearable
                                loadOptions={(input, cb) => loadOptions(teamOptions, input, cb)}
                                onChange={(option) => {
                                    setData('sport_team_id', option?.value ?? null);
                                    if (!option) setData('sport_id', null);
                                }}
                                value={teamOptions.find((o) => o.value === data.sport_team_id) || null}
                                isDisabled={!!data.sport_id}
                                placeholder="Search and select team"
                            />
                            {errors.sport_team_id && (
                                <p className="mt-1 text-sm text-red-500">{errors.sport_team_id}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="bg-[#102d4e] hover:bg-[#0d243d] text-white font-heading font-semibold py-2 px-4 rounded-md transition focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                        >
                            Update
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}