import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import dayjs from 'dayjs';
import { route } from 'ziggy-js';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';

interface Field {
    name: string;
    type: string;
}

interface SuggestedValue {
    value: string;
    unit?: string | null;
}

interface ExerciseSet {
    id: number;
    order: number;
    fields: Field[];
    suggested_values?: SuggestedValue[] | null;
}

interface Exercise {
    id: number;
    name: string;
    description?: string | null;
    order: number;
    sets: ExerciseSet[];
}

interface Program {
    id: number;
    name: string;
    note?: string | null;
    created_by?: string;
    school_id?: number;
    created_at?: string;
    updated_at?: string;
}

interface Props {
    program: Program;
    exercises: Exercise[];
}

export default function View({ program, exercises }: Props) {
    const [search, setSearch] = useState('');
    const [openExercise, setOpenExercise] = useState<number | null>(null);

    const sortedExercises = useMemo(
        () =>
            [...(exercises || [])]
                .sort((a, b) => a.order - b.order)
                .filter((ex) =>
                    ex.name.toLowerCase().includes(search.toLowerCase()),
                ),
        [exercises, search],
    );

    function toggleExercise(id: number) {
        setOpenExercise(openExercise === id ? null : id);
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Training Programs', href: route('programs.index') },
                { title: program.name, href: route('programs.show', program.id) },
            ]}
        >
            <Head title={`View Program - ${program.name}`} />

            <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 lg:px-8 py-6">

                <div className="mb-6">
                    <Link href={route('programs.index')}>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                        >
                            <span className="text-lg">←</span>
                            Back to Programs
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-8 space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        {program.name}
                    </h1>
                    {program.note && (
                        <p className="text-gray-600 text-sm max-w-2xl leading-relaxed">
                            {program.note}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 rounded-lg border bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
                    <div>
                        <p className="text-xs text-gray-500 uppercase">
                            Program ID
                        </p>
                        <p className="font-medium text-gray-800">{program.id}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase">
                            Created On
                        </p>
                        <p className="font-medium text-gray-800">
                            {program.created_at
                                ? dayjs(program.created_at).format('MMM D, YYYY')
                                : '—'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase">
                            Last Updated
                        </p>
                        <p className="font-medium text-gray-800">
                            {program.updated_at
                                ? dayjs(program.updated_at).format('MMM D, YYYY')
                                : '—'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase">
                            Created By
                        </p>
                        <p className="font-medium text-gray-800">
                            {program.created_by ?? 'System'}
                        </p>
                    </div>
                </div>

                <div className="relative mt-6">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search exercises..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                    />
                </div>

                <div className="space-y-6">
                    <h2 className="border-b pb-2 text-xl font-semibold text-gray-900">
                        Exercises
                    </h2>

                    {sortedExercises.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">
                            {search
                                ? 'No exercises match your search.'
                                : (
                                    <>
                                        This program has no exercises yet.{' '}
                                        <Link
                                            href={route('programs.edit', program.id)}
                                            className="text-blue-600 underline"
                                        >
                                            Add exercises
                                        </Link>
                                        .
                                    </>
                                )}
                        </p>
                    ) : (
                        sortedExercises.map((exercise, exIdx) => {
                            const isOpen = openExercise === exercise.id;

                            return (
                                <div
                                    key={exercise.id}
                                    className="transition-transform hover:scale-[1.01] rounded-lg border bg-white p-5 shadow-sm hover:shadow-md"
                                >

                                    <button
                                        onClick={() => toggleExercise(exercise.id)}
                                        aria-expanded={isOpen}
                                        className="flex w-full items-center justify-between text-left"
                                    >
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {exIdx + 1}. {exercise.name}
                                            </h3>
                                            {exercise.description && (
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {exercise.description}
                                                </p>
                                            )}
                                        </div>
                                        {isOpen ? (
                                            <ChevronDown className="h-5 w-5 text-gray-500" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5 text-gray-500" />
                                        )}
                                    </button>

                                    <div
                                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                            isOpen ? 'max-h-screen mt-4' : 'max-h-0'
                                        }`}
                                    >
                                        <div className="space-y-4">
                                            {exercise.sets.map((set, setIdx) => (
                                                <div
                                                    key={set.id}
                                                    className="rounded-md border bg-gray-50 p-4"
                                                >
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <h4 className="text-sm font-medium text-gray-800">
                                                            Set {setIdx + 1}
                                                        </h4>
                                                        <span className="text-xs text-gray-500">
                                                            Order {set.order}
                                                        </span>
                                                    </div>

                                                    <table className="w-full border-t border-gray-200 text-sm">
                                                        <thead>
                                                            <tr className="text-left text-gray-500">
                                                                <th className="py-2 pr-3 font-medium">
                                                                    Field
                                                                </th>
                                                                <th className="py-2 font-medium">
                                                                    Suggested Value
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {set.fields.map(
                                                                (field, fIdx) => {
                                                                    const suggested =
                                                                        set
                                                                            .suggested_values?.[
                                                                            fIdx
                                                                        ];
                                                                    return (
                                                                        <tr
                                                                            key={fIdx}
                                                                            className="border-t border-gray-100 hover:bg-gray-100/50"
                                                                        >
                                                                            <td className="py-2 pr-3 text-gray-800">
                                                                                {field.name}
                                                                            </td>
                                                                            <td className="py-2 text-gray-700">
                                                                                {suggested?.value
                                                                                    ? `${suggested.value}${
                                                                                          suggested.unit
                                                                                              ? ` ${suggested.unit}`
                                                                                              : ''
                                                                                      }`
                                                                                    : '—'}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                },
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
