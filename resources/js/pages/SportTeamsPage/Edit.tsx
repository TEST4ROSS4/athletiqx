import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Edit Team', href: '/sport-teams' },
];

export default function Edit({
    team,
    sports,
}: {
    team: {
        id: number;
        name: string;
        season: string;
        is_official: boolean;
        sport_id: number;
    };
    sports: { id: number; name: string }[];
}) {
    const { data, setData, errors, put } = useForm({
        name: team.name,
        season: team.season,
        is_official: team.is_official,
        sport_id: team.sport_id,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('sport-teams.update', team.id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Team" />
            <div className="p-3">
                <h1 className="mb-4 text-2xl font-bold">Edit Sport Team</h1>

                <Link
                    href={route('sport-teams.index')}
                    className="mb-4 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                >
                    Back
                </Link>

                <form onSubmit={submit} className="mx-auto mt-4 max-w-md space-y-6">
                    {/* Team Name */}
                    <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium">Team Name:</label>
                        <input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="block w-full rounded-md border px-3 py-2"
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    {/* Season */}
                    <div className="grid gap-2">
                        <label htmlFor="season" className="text-sm font-medium">Season:</label>
                        <input
                            id="season"
                            value={data.season}
                            onChange={(e) => setData('season', e.target.value)}
                            className="block w-full rounded-md border px-3 py-2"
                        />
                        {errors.season && <p className="text-sm text-red-500">{errors.season}</p>}
                    </div>

                    {/* Sport Dropdown */}
                    <div className="grid gap-2">
                        <label htmlFor="sport_id" className="text-sm font-medium">Sport:</label>
                        <select
                            id="sport_id"
                            value={data.sport_id}
                            onChange={(e) => setData('sport_id', Number(e.target.value))}
                            className="block w-full rounded-md border px-3 py-2"
                        >
                            <option value="">Select sport</option>
                            {sports.map((sport) => (
                                <option key={sport.id} value={sport.id}>
                                    {sport.name}
                                </option>
                            ))}
                        </select>
                        {errors.sport_id && <p className="text-sm text-red-500">{errors.sport_id}</p>}
                    </div>

                    {/* Is Official */}
                    <div className="grid gap-2">
                        <label htmlFor="is_official" className="text-sm font-medium">Official:</label>
                        <input
                            type="checkbox"
                            id="is_official"
                            checked={data.is_official}
                            onChange={(e) => setData('is_official', e.target.checked)}
                            className="h-4 w-4 accent-green-600"
                        />
                        {errors.is_official && <p className="text-sm text-red-500">{errors.is_official}</p>}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                    >
                        Update
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}