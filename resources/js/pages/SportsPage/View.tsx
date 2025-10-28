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
            <div className="flex items-center justify-center p-6">
                <div className="w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                    <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Sport Details</h1>

                    <div className="space-y-4 text-sm text-gray-700">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Sport Name:</span>
                            <span>{sport.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Category:</span>
                            <span>{sport.category.charAt(0).toUpperCase() + sport.category.slice(1)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Gender:</span>
                            <span>{sport.gender.charAt(0).toUpperCase() + sport.gender.slice(1)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Division:</span>
                            <span>{sport.division === 'junior' ? 'Junior (High School)' : 'Senior (College)'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Active:</span>
                            <span>{sport.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href={route('sports.index')}
                            className="inline-block rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
                        >
                            Back
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}