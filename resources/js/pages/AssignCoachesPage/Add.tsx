import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import AsyncSelect from 'react-select/async';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Assign Coach', href: '/coach-assignments' },
];

type Option = { label: string; value: number };

export default function Add({
    coaches,
    sports,
    sportTeams,
}: {
    coaches: { id: number; name: string; email: string }[];
    sports: { id: number; name: string }[];
    sportTeams: { id: number; name: string; sport: { name: string } }[];
}) {
    const { data, setData, errors, post } = useForm<{
        coach_id: number | null;
        sport_id: number | null;
        sport_team_id: number | null;
    }>({
        coach_id: null,
        sport_id: null,
        sport_team_id: null,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('coach-assignments.store'));
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

    function loadOptions(options: Option[], inputValue: string, callback: (filtered: Option[]) => void) {
        const filtered = options.filter((o) =>
            o.label.toLowerCase().includes(inputValue.toLowerCase())
        );
        callback(filtered);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assign Coach" />
            <div className="p-3">
                <div className="p-3">
                    {/* Heading */}
                    <h1 className="mb-4 font-heading text-2xl font-semibold text-[#102d4e]">
                        Assign Coach to Sport or Team
                    </h1>

                    {/* Back Button */}
                    <Link
                        href={route('coach-assignments.index')}
                        className="mb-4 inline-block rounded-lg bg-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Back
                    </Link>

                    <form onSubmit={submit} className="mx-auto mt-4 max-w-md space-y-6 font-sans">
                        {/* Coach Select */}
                        <div className="grid gap-2">
                            <label htmlFor="coach_id" className="font-heading text-sm text-[#102d4e]">
                                Team Manager (any user with team access permission):
                            </label>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
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
                            <label htmlFor="sport_id" className="font-heading text-sm text-[#102d4e]">
                                Sport (optional):
                            </label>
                            <AsyncSelect
                                isClearable
                                cacheOptions
                                defaultOptions
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
                            <label htmlFor="sport_team_id" className="font-heading text-sm text-[#102d4e]">
                                Sport Team (optional):
                            </label>
                            <AsyncSelect
                                isClearable
                                cacheOptions
                                defaultOptions
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
                            className="rounded-md bg-[#102d4e] px-4 py-2 font-heading font-semibold text-white transition hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}