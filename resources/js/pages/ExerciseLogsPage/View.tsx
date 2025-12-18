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
    proof_url?: string | null;
    proof_name?: string | null;
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
                <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-slate-50">Program:</strong> {program.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-slate-50">Coach:</strong>{' '}
                        {program.creator?.name ?? 'System'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-slate-50">Assigned:</strong>{' '}
                        {new Date(assignment.assigned_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-slate-50">Status:</strong>{' '}
                        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-100">
                            {assignment.status}
                        </span>
                    </p>
                </div>

                {/* PROGRAM NOTES */}
                {program.note && (
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <p className="mb-1 font-semibold text-slate-800 dark:text-slate-100">
                            Program Notes:
                        </p>
                        <p className="leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-300">
                            {program.note}
                        </p>
                    </div>
                )}

                {/* EXERCISES */}
                {program.exercises.map((exercise) => (
                    <div
                        key={exercise.id}
                        className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                    >
                        {/* HEADER */}
                        <div>
                            <p className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                                {exercise.name}
                            </p>
                            {exercise.description && (
                                <p className="mt-1 text-slate-600 dark:text-slate-300">
                                    {exercise.description}
                                </p>
                            )}
                        </div>

                        {/* TABLE */}
                        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <table className="w-full border-collapse text-sm">
                                <thead className="sticky top-0 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                                    <tr>
                                        <th className="border border-slate-200 px-3 py-2 text-left font-semibold dark:border-slate-700">
                                            Set
                                        </th>

                                        {exercise.sets[0]?.fields.map(
                                            (field) => (
                                                <th
                                                    key={field.name}
                                                    className="border border-slate-200 px-3 py-2 text-left font-semibold dark:border-slate-700"
                                                >
                                                    {field.name}
                                                </th>
                                            ),
                                        )}

                                        <th className="border border-slate-200 px-3 py-2 text-center font-semibold dark:border-slate-700">
                                            Done
                                        </th>
                                        <th className="border border-slate-200 px-3 py-2 text-center font-semibold dark:border-slate-700">
                                            Proof
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                                    {exercise.sets.map((set) => (
                                        <tr
                                            key={set.id}
                                            className={`transition ${
                                                    set.marked_as_done
                                                        ? 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-50 dark:ring-emerald-500/60'
                                                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            <td className="border border-slate-200 px-3 py-2 font-medium dark:border-slate-700">
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
                                                        className="border border-slate-200 px-3 py-2 dark:border-slate-700"
                                                    >
                                                        <span className="font-medium text-slate-900 dark:text-slate-50">
                                                            {num}
                                                        </span>
                                                        {unit && (
                                                            <span className="ml-1 text-xs text-slate-500 dark:text-slate-300">
                                                                {unit}
                                                            </span>
                                                        )}
                                                    </td>
                                                );
                                            })}

                                            <td className="border border-slate-200 px-3 py-2 text-center dark:border-slate-700">
                                                <span
                                                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${set.marked_as_done
                                                            ? 'bg-emerald-500 shadow-[0_0_0_4px] shadow-emerald-500/20 dark:shadow-emerald-500/30'
                                                            : 'bg-slate-400 dark:bg-slate-600'
                                                        }`}
                                                >
                                                    <CheckIcon className="h-4 w-4 text-white" />
                                                </span>
                                            </td>
                                            <td className="border border-slate-200 px-3 py-2 text-center dark:border-slate-700">
                                                {set.proof_url ? (
                                                    <a
                                                        href={set.proof_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 transition hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-100 dark:hover:bg-blue-900/50"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                        {set.proof_name ? (
                                                            <span className="max-w-[120px] truncate">{set.proof_name}</span>
                                                        ) : (
                                                            'View'
                                                        )}
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                                                )}
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
                    className="rounded-lg bg-slate-800 px-4 py-2 text-slate-100 shadow transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                    Back
                </button>
            </div>
        </AppLayout>
    );
}
