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
            <div className="p-6">
                <div className="max-w-lg mx-auto space-y-6">
                    {/* Heading */}
                    <h1 className="text-2xl font-heading font-semibold text-[#102d4e]">
                        Coach Assignment Details
                    </h1>

                    {/* Back Button */}
                    <Link
                        href={route('coach-assignments.index')}
                        className="inline-block rounded-lg bg-[#102d4e] px-4 py-2 text-sm font-heading font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Back
                    </Link>

                    {/* User Info Card */}
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-4">
                        <div className="">
                            <p className="text-sm font-heading text-[#102d4e]">Coach:</p>
                            <p className="text-base font-sans text-gray-800">{assignment.coach?.name ?? '—'}</p>
                        </div>

                        {isTeamAssignment ? (
                            <>
                                <div>
                                    <p className="text-sm font-heading text-[#102d4e]">Assigned Team:</p>
                                    <p className="text-base font-sans text-gray-800">{assignment.sport_team?.name ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-heading text-[#102d4e]">Sport:</p>
                                    <p className="text-base font-sans text-gray-800">{assignment.sport_team?.sport?.name ?? '—'}</p>
                                </div>
                                {otherTeams.length > 0 && (
                                    <div className="pt-4">
                                        <span className="block text-sm font-heading text-[#102d4e] mb-2">Other Teams Assigned:</span>
                                        <ul className="list-disc pl-5 text-base font-sans text-gray-800">
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
                                <div>
                                    <p className="text-sm font-heading text-[#102d4e]">Sport:</p>
                                    <p className="text-base font-sans text-gray-800">{assignment.sport?.name ?? '—'}</p>
                                </div>
                                {otherTeams.length > 0 && (
                                    <div>
                                        <span className="block text-sm font-heading text-[#102d4e] mb-2">Teams Under This Sport:</span>
                                        <ul className="list-disc pl-5 text-base font-sans text-gray-800">
                                            {otherTeams.map((t) => (
                                                <li key={t.id}>{t.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}