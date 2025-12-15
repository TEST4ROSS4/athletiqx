import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { CheckIcon } from '@heroicons/react/24/solid';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface FieldDef {
    name: string;
    type: string;
}

interface SetLog {
    id: number;
    order: number;
    fields: FieldDef[];
    values: Record<string, any> | null;
    marked_as_done: boolean;
}

interface Exercise {
    id: number;
    name: string;
    description: string | null;
    sets: SetLog[];
}

interface Program {
    name: string;
    note?: string | null;
    creator?: { name: string } | null;
    exercises: Exercise[];
}

interface Assignment {
    id: number;
    program: Program;
    assigned_at: string;
    status: string;
    can_log?: boolean;
}

interface Props {
    assignment: Assignment;
}

export default function View({ assignment }: Props) {
    const { program } = assignment;

    const parseValue = (value: string | null) => {
        if (!value) return { num: '-', unit: '' };

        const parts = value.split(' ');
        if (parts.length === 2) {
            return { num: parts[0], unit: parts[1] };
        }

        return { num: value, unit: '' };
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Exercise Logs', href: route('exercise-logs.index') },
                { title: 'View Log', href: '#' },
            ]}
        >
            <Head title="View Exercise Log" />


            <div className="space-y-6 p-4">
                {/* LOG EXERCISE BUTTON */}
                {assignment.can_log && (
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Link href={route('exercise-logs.form', assignment.id)}>
                            <Button className="flex items-center gap-2 rounded-md bg-[#102d4e] px-4 py-2 font-heading font-semibold text-white transition hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            >
                                Log Exercise
                            </Button>
                        </Link>
                    </div>
                )}
                {/* PROGRAM INFO CARD */}
                <div className="space-y-1 rounded-xl border border-slate-800 bg-[#0d1524] p-5 shadow-sm text-slate-100">
                    <p className="text-sm text-slate-300">
                        <strong className="text-slate-50">Program:</strong> {program.name}
                    </p>
                    <p className="text-sm text-slate-300">
                        <strong className="text-slate-50">Coach:</strong>{' '}
                        {program.creator?.name ?? 'System'}
                    </p>
                    <p className="text-sm text-slate-300">
                        <strong className="text-slate-50">Assigned:</strong>{' '}
                        {new Date(assignment.assigned_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-300">
                        <strong className="text-slate-50">Status:</strong>{' '}
                        <span className="inline-block rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-100">
                            {assignment.status}
                        </span>
                    </p>
                </div>

                {/* PROGRAM NOTES */}
                {program.note && (
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <p className="mb-1 font-semibold text-gray-700">
                            Program Notes:
                        </p>
                        <p className="leading-relaxed whitespace-pre-line text-gray-600">
                            {program.note}
                        </p>
                    </div>
                )}

                {/* EXERCISES */}
                {program.exercises.map((exercise) => (
                    <div
                        key={exercise.id}
                        className="space-y-4 rounded-xl border border-slate-800 bg-[#0b1120] p-5 shadow-sm"
                    >
                        {/* HEADER */}
                        <div>
                            <p className="text-xl font-semibold text-slate-50">
                                {exercise.name}
                            </p>
                            {exercise.description && (
                                <p className="mt-1 text-slate-300">
                                    {exercise.description}
                                </p>
                            )}
                        </div>

                        {/* TABLE */}
                        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-[#0d1524]">
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 bg-slate-900 text-slate-100">
                                    <tr>
                                        <th className="border border-slate-800 px-3 py-2 text-left text-sm font-semibold">
                                            Set
                                        </th>

                                        {exercise.sets[0]?.fields.map(
                                            (field) => (
                                                <th
                                                    key={field.name}
                                                    className="border border-slate-800 px-3 py-2 text-left text-sm font-semibold"
                                                >
                                                    {field.name}
                                                </th>
                                            ),
                                        )}

                                        <th className="border border-slate-800 px-3 py-2 text-center text-sm font-semibold">
                                            Done
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="bg-[#0b1120] text-slate-100">
                                    {exercise.sets.map((set) => (
                                        <tr
                                            key={set.id}
                                            className={`transition ${
                                                    set.marked_as_done
                                                        ? 'bg-emerald-900/30'
                                                        : 'hover:bg-slate-800'
                                                }`}
                                        >
                                            <td className="border border-slate-800 px-3 py-2 font-medium">
                                                {set.order + 1}
                                            </td>

                                            {set.fields.map((fieldObj) => {
                                                const raw =
                                                    set.values?.[
                                                    fieldObj.name
                                                    ] ?? '-';
                                                const { num, unit } =
                                                    parseValue(raw);

                                                return (
                                                    <td
                                                        key={fieldObj.name}
                                                        className="border border-slate-800 px-3 py-2"
                                                    >
                                                        <span className="font-medium text-slate-50">
                                                            {num}
                                                        </span>
                                                        {unit && (
                                                            <span className="ml-1 text-xs text-slate-300">
                                                                {unit}
                                                            </span>
                                                        )}
                                                    </td>
                                                );
                                            })}

                                            <td className="border border-slate-800 px-3 py-2 text-center">
                                                <span
                                                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${set.marked_as_done
                                                            ? 'bg-emerald-500'
                                                            : 'bg-slate-600'
                                                        }`}
                                                >
                                                    <CheckIcon className="h-4 w-4 text-white" />
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}

                {/* BACK BUTTON */}
                <button
                    type="button"
                    onClick={() => history.back()}
                    className="rounded-lg bg-slate-800 px-4 py-2 text-slate-100 shadow transition hover:bg-slate-700"
                >
                    Back
                </button>
            </div>
        </AppLayout>
    );
}
