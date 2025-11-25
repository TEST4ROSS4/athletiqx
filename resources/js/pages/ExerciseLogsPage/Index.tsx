import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/can';
import { Head, Link, router } from '@inertiajs/react';

import { useState } from 'react';
import { route } from 'ziggy-js';

interface Student {
    id: number;
    name: string;
}

interface Assignment {
    id: number;
    program_name: string;
    coach_name: string;
    status: 'Assigned' | 'In-Progress' | 'Completed';
    assigned_at: string;
}

interface Props {
    assignments: Assignment[];
    students?: Student[];
    currentUserRole?: string;
    selectedStudentId?: number;
}

export default function Index({
    assignments = [],
    students = [],
    currentUserRole = '',
    selectedStudentId = undefined,
}: Props) {
    const [studentId, setStudentId] = useState<number | undefined>(selectedStudentId);

    function handleStudentChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const newStudentId = Number(e.target.value) || undefined;
        setStudentId(newStudentId);

        router.get(
            route('exercise-logs.index', newStudentId),
            {},
            { preserveState: true, replace: true }
        );
    }

    return (
        <AppLayout
            breadcrumbs={[{ title: 'Exercise Logs', href: route('exercise-logs.index') }]}
        >
            <Head title="Exercise Logs" />

            <div className="space-y-6 p-4">
                {/* Student Dropdown for Admin/Coach */}
                {(currentUserRole === 'Admin' || currentUserRole === 'Coach') && (
                    <div className="flex items-center gap-4">
                        <label htmlFor="student" className="font-semibold text-gray-700">Select Student:</label>
                        <select
                            id="student"
                            value={studentId}
                            onChange={handleStudentChange}
                            className="rounded-lg border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                        >
                            <option value="">-- Select Student --</option>
                            {students.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Assignments Grid */}
                {assignments.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        No programs assigned yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {assignments.map((a) => (
                            <Link
                                key={a.id}
                                href={route('exercise-logs.show', a.id)}
                                className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-transform duration-200 hover:shadow-xl hover:scale-105"
                            >
                                {/* Program Information */}
                                <div className="flex flex-col gap-3">
                                    <h2 className="truncate text-xl font-semibold text-gray-900">
                                        {a.program_name}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        Coach: {a.coach_name}
                                    </p>

                                    {/* Status Badge */}
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`text-xs font-semibold py-1 px-3 rounded-full ${
                                                a.status === 'Assigned'
                                                    ? 'bg-gray-200 text-gray-800'
                                                    : a.status === 'In-Progress'
                                                    ? 'bg-yellow-200 text-yellow-800'
                                                    : 'bg-green-200 text-green-800'
                                            }`}
                                        >
                                            {a.status}
                                        </span>
                                    </div>
                                </div>

                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
