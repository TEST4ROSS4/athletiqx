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
            <div className="p-6">
                <div className="max-w-lg mx-auto space-y-6">
                    {/* Heading */}
                    <h1 className="text-2xl font-heading font-semibold text-[#102d4e]">
                        Team Details
                    </h1>

                    {/* Back Button */}
                    <Link
                        href={route('sport-teams.index')}
                        className="inline-block rounded-lg bg-[#102d4e] px-4 py-2 text-sm font-heading font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Back
                    </Link>

                    {/* Sports Team Info Card */}
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-4">
                        <div>
                            <p className="text-sm font-heading text-[#102d4e]">Team Name:</p>
                            <p className="text-base font-sans text-gray-800">{team.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-heading text-[#102d4e]">Sport:</p>
                            <p className="text-base font-sans text-gray-800">{team.sport?.name || '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-heading text-[#102d4e]">Season:</p>
                            <p className="text-base font-sans text-gray-800">{team.season}</p>
                        </div>
                        <div>
                            <p className="text-sm font-heading text-[#102d4e]">Official:</p>
                            <p className="text-base font-sans text-gray-800">{team.is_official ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}