import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'View Assignment', href: '/coach-assignments' },
];

export default function View({
    assignment,
    allTeams,
}: {
    assignment: {
        id: number;
        coach: { name: string };
        sport?: { name: string } | null;
        sport_team?: { id: number; name: string; sport: { name: string } } | null;
    };
    allTeams: { id: number; name: string; sport?: { name: string } | null }[];
}) {
    const isTeamAssignment = assignment.sport_team != null;
    const assignedTeamId = isTeamAssignment ? assignment.sport_team!.id : null;
    const otherTeams = isTeamAssignment
        ? allTeams.filter((t) => t.id !== assignedTeamId)
        : allTeams;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View Assignment" />
            <div className="flex items-center justify-center p-6">
                <div className="w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                    <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Coach Assignment Details</h1>

                    <div className="space-y-4 text-sm text-gray-700">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Coach:</span>
                            <span>{assignment.coach?.name ?? '—'}</span>
                        </div>

                        {isTeamAssignment ? (
                            <>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-600">Assigned Team:</span>
                                    <span>{assignment.sport_team?.name ?? '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-600">Sport:</span>
                                    <span>{assignment.sport_team?.sport?.name ?? '—'}</span>
                                </div>
                                {otherTeams.length > 0 && (
                                    <div className="pt-4">
                                        <span className="block text-sm font-semibold text-gray-600 mb-2">Other Teams Assigned:</span>
                                        <ul className="list-disc pl-5 text-sm text-gray-700">
                                            {otherTeams.map((t) => (
                                                <li key={t.id}>
                                                    {t.name} ({t.sport?.name ?? '—'})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-600">Sport:</span>
                                    <span>{assignment.sport?.name ?? '—'}</span>
                                </div>
                                {otherTeams.length > 0 && (
                                    <div className="pt-4">
                                        <span className="block text-sm font-semibold text-gray-600 mb-2">Teams Under This Sport:</span>
                                        <ul className="list-disc pl-5 text-sm text-gray-700">
                                            {otherTeams.map((t) => (
                                                <li key={t.id}>{t.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href={route('coach-assignments.index')}
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