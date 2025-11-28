import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Add Team',
        href: '/sport-teams',
    },
];

export default function Add({
    sports,
}: {
    sports: { id: number; name: string }[];
}) {
    const { data, setData, errors, post } = useForm<{
        name: string;
        season: string;
        is_official: boolean;
        sport_id: number | '';
    }>({
        name: '',
        season: '',
        is_official: true,
        sport_id: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('sport-teams.store'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Team" />
            <div className="p-3">
                <div className="p-3">

                    {/* Heading */}
                    <h1 className="mb-4 font-heading text-2xl font-semibold text-[#102d4e]">
                        Add Sport Team
                    </h1>

                    <Link
                        href={route('sport-teams.index')}
                        className="mb-4 inline-block rounded-lg bg-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Back
                    </Link>

                    <form onSubmit={submit} className="mx-auto mt-4 max-w-md space-y-6 font-sans">
                        {/* Team Name */}
                        <div className="grid gap-2">
                            <label htmlFor="name" className="font-heading text-sm text-[#102d4e]">Team Name:</label>
                            <input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                placeholder="Enter team name"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                        </div>

                        {/* Season */}
                        <div className="grid gap-2">
                            <label htmlFor="season" className="font-heading text-sm text-[#102d4e]">Season:</label>
                            <input
                                id="season"
                                value={data.season}
                                onChange={(e) => setData('season', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                placeholder="e.g. Season 85"
                            />
                            {errors.season && <p className="mt-1 text-sm text-red-500">{errors.season}</p>}
                        </div>

                        {/* Sport Dropdown */}
                        <div className="grid gap-2">
                            <label htmlFor="sport_id" className="font-heading text-sm text-[#102d4e]">Sport:</label>
                            <select
                                id="sport_id"
                                value={data.sport_id}
                                onChange={(e) => setData('sport_id', Number(e.target.value))}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                            <label htmlFor="is_official" className="font-heading text-sm text-[#102d4e]">Official:</label>
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