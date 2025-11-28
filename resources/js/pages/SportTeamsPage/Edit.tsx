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
                <div className="p-3">
                    {/* Heading */}
                    <h1 className="text-2xl font-heading font-semibold text-[#102d4e] mb-4">
                        Edit Sport Team
                    </h1>

                    {/* Back Button */}
                    <Link
                        href={route('sport-teams.index')}
                        className="mb-4 inline-block rounded-lg bg-[#102d4e] px-4 py-2 text-sm font-heading font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Back
                    </Link>

                    <form onSubmit={submit} className="space-y-6 mt-4 max-w-md mx-auto font-sans">
                        {/* Team Name */}
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-heading text-[#102d4e]">Team Name:</label>
                            <input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#102d4e] focus:border-[#102d4e]"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                        </div>

                        {/* Season */}
                        <div className="grid gap-2">
                            <label htmlFor="season" className="text-sm font-heading text-[#102d4e]">Season:</label>
                            <input
                                id="season"
                                value={data.season}
                                onChange={(e) => setData('season', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#102d4e] focus:border-[#102d4e]"
                            />
                            {errors.season && <p className="mt-1 text-sm text-red-500">{errors.season}</p>}
                        </div>

                        {/* Sport Dropdown */}
                        <div className="grid gap-2">
                            <label htmlFor="sport_id" className="text-sm font-heading text-[#102d4e]">Sport:</label>
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
                            {errors.sport_id && <p className="mt-1 text-sm text-red-500">{errors.sport_id}</p>}
                        </div>

                        {/* Is Official */}
                        <div className="grid gap-2">
                            <label htmlFor="is_official" className="text-sm font-heading text-[#102d4e]">Official:</label>
                            <input
                                type="checkbox"
                                id="is_official"
                                checked={data.is_official}
                                onChange={(e) => setData('is_official', e.target.checked)}
                                className="h-4 w-4 accent-green-600"
                            />
                            {errors.is_official && <p className="mt-1 text-sm text-red-500">{errors.is_official}</p>}
                        </div>

                        {/* Submit */}
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