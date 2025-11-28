import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Edit Sport', href: '/sports' },
];

export default function Edit({
    sport,
}: {
    sport: {
        id: number;
        name: string;
        category: string;
        gender: string;
        division: string;
        is_active: boolean;
    };
}) {
    const { data, setData, errors, put } = useForm({
        name: sport.name,
        category: sport.category,
        gender: sport.gender,
        division: sport.division,
        is_active: sport.is_active,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('sports.update', sport.id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Sport" />
            <div className="p-3">
                <div className="p-3">

                    {/* Heading */}
                    <h1 className="text-2xl font-heading font-semibold text-[#102d4e] mb-4">
                        Edit Sport
                    </h1>

                    {/* Back Button */}

                    <Link
                        href={route('sports.index')}
                        className="mb-4 inline-block rounded-lg bg-[#102d4e] px-4 py-2 text-sm font-heading font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Back
                    </Link>

                    <form onSubmit={submit} className="space-y-6 mt-4 max-w-md mx-auto font-sans">
                        {/* Name */}
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-heading text-[#102d4e]">Sport Name:</label>
                            <input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#102d4e] focus:border-[#102d4e]"
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        {/* Category */}
                        <div className="grid gap-2">
                            <label className="text-sm font-heading text-[#102d4e]">Category:</label>
                            <div className="flex gap-4">
                                {['team', 'individual', 'hybrid'].map((option) => (
                                    <label key={option} className="flex items-center gap-1 text-sm">
                                        <input
                                            type="radio"
                                            name="category"
                                            value={option}
                                            checked={data.category === option}
                                            onChange={(e) => setData('category', e.target.value)}
                                            className="accent-blue-600"
                                        />
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </label>
                                ))}
                            </div>
                            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                        </div>

                        {/* Gender */}
                        <div className="grid gap-2">
                            <label className="text-sm font-heading text-[#102d4e]">Gender:</label>
                            <div className="flex gap-4">
                                {['male', 'female', 'mixed'].map((option) => (
                                    <label key={option} className="flex items-center gap-1 text-sm">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={option}
                                            checked={data.gender === option}
                                            onChange={(e) => setData('gender', e.target.value)}
                                            className="accent-blue-600"
                                        />
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </label>
                                ))}
                            </div>
                            {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
                        </div>

                        {/* Division */}
                        <div className="grid gap-2">
                            <label className="text-sm font-heading text-[#102d4e]">Division:</label>
                            <div className="flex gap-4">
                                {['junior', 'senior'].map((option) => (
                                    <label key={option} className="flex items-center gap-1 text-sm">
                                        <input
                                            type="radio"
                                            name="division"
                                            value={option}
                                            checked={data.division === option}
                                            onChange={(e) => setData('division', e.target.value)}
                                            className="accent-blue-600"
                                        />
                                        {option === 'junior' ? 'Junior (High School)' : 'Senior (College)'}
                                    </label>
                                ))}
                            </div>
                            {errors.division && <p className="text-sm text-red-500">{errors.division}</p>}
                        </div>

                        {/* Active */}
                        <div className="grid gap-2">
                            <label htmlFor="is_active" className="text-sm font-heading text-[#102d4e]">Active:</label>
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="h-4 w-4 accent-green-600"
                            />
                            {errors.is_active && <p className="text-sm text-red-500">{errors.is_active}</p>}
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