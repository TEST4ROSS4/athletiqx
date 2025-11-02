import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { route } from 'ziggy-js';

const statusOptions = [
    'tryout',
    'active',
    'injured',
    'inactive',
    'redshirt',
    'suspended',
];

export default function Edit({
    sportTeam,
    assignment,
    students,
}: {
    sportTeam: { id: number; name: string };
    assignment: {
        id: number;
        student_id: number;
        position: string;
        status: string;
    };
    students: { id: number; name: string }[];
}) {
    const { data, setData, put } = useForm<{
        members: {
            student_id: number | null;
            position: string;
            status: string;
        }[];
    }>({
        members: [
            {
                student_id: assignment.student_id,
                position: assignment.position,
                status: assignment.status,
            },
        ],
    });

    const [formErrors, setFormErrors] = useState<string[]>([]);

    function submit(e: React.FormEvent) {
        e.preventDefault();

        const m = data.members[0];
        const errors: string[] = [];

        if (!m.student_id) errors.push('Student is required.');
        if (!m.position.trim()) errors.push('Position is required.');
        if (!m.status.trim()) errors.push('Status is required.');

        if (errors.length > 0) {
            setFormErrors(errors);
            return;
        }

        put(route('student-sport-teams.update', assignment.id), {
            preserveScroll: true,
        });
    }

    const studentOptions = students.map((s) => ({
        label: s.name,
        value: s.id,
    }));

    function loadStudentOptions(
        inputValue: string,
        callback: (options: typeof studentOptions) => void,
    ) {
        const filtered = studentOptions.filter((s) =>
            s.label.toLowerCase().includes(inputValue.toLowerCase()),
        );
        callback(filtered);
    }

    return (
        <AppLayout>
            <Head title={`Edit Team Member – ${sportTeam.name}`} />
            <div className="p-3">
                <h1 className="mb-4 text-2xl font-bold">Edit Team Member</h1>

                <Link
                    href={route('student-sport-teams.index', sportTeam.id)}
                    className="mb-4 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                >
                    Back to Team
                </Link>

                <form
                    onSubmit={submit}
                    className="mx-auto mt-4 max-w-md space-y-6"
                >
                    <div className="grid gap-2 border-b pb-4">
                        <label className="text-sm font-medium">Student</label>
                        <AsyncSelect
                            cacheOptions
                            defaultOptions
                            loadOptions={loadStudentOptions}
                            onChange={(option) =>
                                setData('members', [
                                    {
                                        ...data.members[0],
                                        student_id: option?.value ?? null,
                                    },
                                ])
                            }
                            value={
                                studentOptions.find(
                                    (o) =>
                                        o.value === data.members[0].student_id,
                                ) || null
                            }
                            placeholder="Search and select student"
                        />

                        <label className="text-sm font-medium">Position</label>
                        <input
                            type="text"
                            value={data.members[0].position}
                            onChange={(e) =>
                                setData('members', [
                                    {
                                        ...data.members[0],
                                        position: e.target.value,
                                    },
                                ])
                            }
                            className="rounded border px-3 py-2 text-sm"
                            placeholder="Position"
                        />

                        <label className="text-sm font-medium">Status</label>
                        <select
                            value={data.members[0].status}
                            onChange={(e) =>
                                setData('members', [
                                    {
                                        ...data.members[0],
                                        status: e.target.value,
                                    },
                                ])
                            }
                            className="rounded border px-3 py-2 text-sm"
                        >
                            <option value="">Select status</option>
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() +
                                        status.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {formErrors.length > 0 && (
                        <div className="space-y-1 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                            {formErrors.map((err, idx) => (
                                <p key={idx}>{err}</p>
                            ))}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="rounded-md bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700"
                    >
                        Update
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
