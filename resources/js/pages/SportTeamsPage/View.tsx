import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'View Team',
        href: '/sport-teams',
    },
];

export default function View({
    team,
}: {
    team: {
        id: number;
        name: string;
        season: string;
        is_official: boolean;
        sport: { name: string };
    };
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View Team" />
            <div className="flex items-center justify-center p-6">
                <div className="w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                    <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Team Details</h1>

                    <div className="space-y-4 text-sm text-gray-700">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Team Name:</span>
                            <span>{team.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Sport:</span>
                            <span>{team.sport?.name || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Season:</span>
                            <span>{team.season}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Official:</span>
                            <span>{team.is_official ? 'Yes' : 'No'}</span>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href={route('sport-teams.index')}
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