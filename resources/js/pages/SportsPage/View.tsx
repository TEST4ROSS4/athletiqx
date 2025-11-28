import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'View Sport',
        href: '/sports',
    },
];

export default function View({
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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View Sport" />
            <div className="p-6">
                <div className="max-w-lg mx-auto space-y-6">
                    {/* Heading */}
                    <h1 className="text-2xl font-heading font-semibold text-[#102d4e]">
                        Sport Details
                    </h1>

                    {/* Back Button */}
                    <Link
                        href={route('sports.index')}
                        className="inline-block rounded-lg bg-[#102d4e] px-4 py-2 text-sm font-heading font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Back
                    </Link>

                    {/* Sports Info Card */}
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-4">
                        <div>
                            <p className="text-sm font-heading text-[#102d4e]">Sport Name:</p>
                            <p className="text-base font-sans text-gray-800">{sport.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-heading text-[#102d4e]">Category:</p>
                            <p className="text-base font-sans text-gray-800">{sport.category.charAt(0).toUpperCase() + sport.category.slice(1)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-heading text-[#102d4e]">Gender:</p>
                            <p className="text-base font-sans text-gray-800">{sport.gender.charAt(0).toUpperCase() + sport.gender.slice(1)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-heading text-[#102d4e]">Division:</p>
                            <p className="text-base font-sans text-gray-800">{sport.division === 'junior' ? 'Junior (High School)' : 'Senior (College)'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-heading text-[#102d4e]">Active:</p>
                            <p className="text-base font-sans text-gray-800">{sport.is_active ? 'Active' : 'Inactive'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}