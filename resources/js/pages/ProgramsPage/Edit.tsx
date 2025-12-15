import AppLayout from '@/layouts/app-layout';
import { FormModal } from '@/components/form-modal';
import { Head, useForm } from '@inertiajs/react';
import { PlusCircle, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { route } from 'ziggy-js';

type FieldMeta = {
    name: string;
    type: 'text' | 'number' | 'duration';
};

type SuggestedValue = {
    value: string;
    unit: string;
};

type Set = {
    id: number;
    order: number;
    fields: FieldMeta[];
    suggested_values?: SuggestedValue[];
};

type Exercise = {
    id: number;
    name: string;
    description?: string;
    order: number;
    sets: Set[];
};

type Team = { id: number; name: string };

type Props = {
    program: {
        id: number;
        name: string;
        note: string;
        sport_team_id?: number | null;
        exercises: Exercise[];
    };
    teams: Team[];
};

const predefinedFields: FieldMeta[] = [
    { name: 'Reps', type: 'number' },
    { name: 'Weight', type: 'number' },
    { name: 'Time', type: 'duration' },
    { name: 'Distance', type: 'number' },
    { name: 'Note', type: 'text' },
];

const fieldUnits: Record<string, string[]> = {
    Weight: ['kg', 'lb'],
    Distance: ['m', 'km', 'ft', 'yd'],
};

function validateFieldValue(
    type: 'text' | 'number' | 'duration',
    value: string | null | undefined,
): boolean {
    if (value == null) return false;
    const val = value.trim();
    if (!val) return false;

    switch (type) {
        case 'duration': {
            const parts = val.split(':').map((p) => Number(p.trim()));
            if (parts.some((n) => isNaN(n) || n < 0)) return false;
            if (parts.length > 4) return false;

            let [h, m, s, ms] = [0, 0, 0, 0];

            if (parts.length === 1) {
                s = parts[0];
            } else if (parts.length === 2) {
                [m, s] = parts;
                if (m > 59 || s > 59) return false;
            } else if (parts.length === 3) {
                [h, m, s] = parts;
                if (m > 59 || s > 59) return false;
            } else if (parts.length === 4) {
                [h, m, s, ms] = parts;
                if (m > 59 || s > 59) return false;
            }

            return true;
        }
        case 'number':
            return /^-?\d+(\.\d+)?(\s?[a-zA-Z]*)?$/.test(val);
        case 'text':
        default:
            return val.length > 0;
    }
}

function normalizeDuration(input: string): string {
    input = input.trim();
    if (!input) return '00:00:00';

    const parts = input.split(':').map((p) => Number(p.trim()));
    if (parts.some((n) => isNaN(n) || n < 0)) return input;

    let [h, m, s, ms] = [0, 0, 0, 0];

    if (parts.length === 1) s = parts[0];
    else if (parts.length === 2) [m, s] = parts;
    else if (parts.length === 3) [h, m, s] = parts;
    else if (parts.length === 4) [h, m, s, ms] = parts;

    m += Math.floor(s / 60);
    s = s % 60;
    h += Math.floor(m / 60);
    m = m % 60;

    const formatted = [h, m, s]
        .map((n) => n.toString().padStart(2, '0'))
        .join(':');
    if (parts.length === 4) return `${formatted}:${ms}`;
    return formatted;
}

export default function Edit({ program, teams }: Props) {
    const { data, setData, put } = useForm<{
        name: string;
        note: string;
        sport_team_id: number | null;
        exercises: Exercise[];
    }>({
        name: program.name,
        note: program.note,
        sport_team_id: program.sport_team_id ?? null,
        exercises: program.exercises.map((ex) => ({
            ...ex,
            sets: ex.sets.map((s) => ({
                ...s,
                suggested_values:
                    s.suggested_values ||
                    s.fields.map(() => ({ value: '', unit: '' })),
            })),
        })),
    });

    const [formErrors, setFormErrors] = useState<string[]>([]);
    const idCounter = useRef(1);

    function nextId() {
        return idCounter.current++;
    }

    function addExercise() {
        setData('exercises', [
            ...data.exercises,
            {
                id: nextId(),
                name: '',
                description: '',
                order: data.exercises.length,
                sets: [],
            },
        ]);
    }

    function removeExercise(index: number) {
        const updated = [...data.exercises];
        updated.splice(index, 1);
        setData(
            'exercises',
            updated.map((ex, i) => ({ ...ex, order: i })),
        );
    }

    function updateExercise<K extends keyof Exercise>(
        index: number,
        field: K,
        value: Exercise[K],
    ) {
        const updated = [...data.exercises];
        updated[index][field] = value;
        setData('exercises', updated);
    }

    function addSet(exIndex: number) {
        const updated = [...data.exercises];
        updated[exIndex].sets.push({
            id: nextId(),
            order: updated[exIndex].sets.length,
            fields: [{ name: '', type: 'text' }],
            suggested_values: [{ value: '', unit: '' }],
        });
        setData('exercises', updated);
    }

    function removeSet(exIndex: number, setIndex: number) {
        const updated = [...data.exercises];
        updated[exIndex].sets.splice(setIndex, 1);
        updated[exIndex].sets = updated[exIndex].sets.map((s, i) => ({
            ...s,
            order: i,
        }));
        setData('exercises', updated);
    }

    function updateFieldMeta(
        exIndex: number,
        setIndex: number,
        fieldIndex: number,
        key: keyof FieldMeta,
        value: string,
    ) {
        const updated = [...data.exercises];
        const set = updated[exIndex].sets[setIndex];

        set.fields[fieldIndex][key] = value as any;

        set.suggested_values = set.suggested_values || [];
        if (!set.suggested_values[fieldIndex])
            set.suggested_values[fieldIndex] = { value: '', unit: '' };
        const current = set.suggested_values[fieldIndex];

        if (key === 'name') {
            if (value === 'Weight' || value === 'Distance') {
                current.unit = fieldUnits[value][0];
            } else {
                current.unit = '';
            }
        }

        setData('exercises', updated);
    }

    function updateSuggestedValue(
        exIndex: number,
        setIndex: number,
        fieldIndex: number,
        value: string,
    ) {
        const updated = JSON.parse(JSON.stringify(data.exercises));
        const set = updated[exIndex].sets[setIndex];
        const field = set.fields[fieldIndex];

        set.suggested_values = set.suggested_values || [];
        if (!set.suggested_values[fieldIndex])
            set.suggested_values[fieldIndex] = { value: '', unit: '' };

        set.suggested_values[fieldIndex].value = value;

        if (field.name !== 'Weight' && field.name !== 'Distance') {
            set.suggested_values[fieldIndex].unit = '';
        }

        setData('exercises', updated);
    }

    function updateFieldUnit(
        exIndex: number,
        setIndex: number,
        fieldIndex: number,
        unit: string,
    ) {
        const updated = JSON.parse(JSON.stringify(data.exercises));
        const set = updated[exIndex].sets[setIndex];
        if (!set.suggested_values) set.suggested_values = [];
        if (!set.suggested_values[fieldIndex])
            set.suggested_values[fieldIndex] = { value: '', unit: '' };

        set.suggested_values[fieldIndex].unit = unit;
        setData('exercises', updated);
    }

    function removeFieldMeta(
        exIndex: number,
        setIndex: number,
        fieldIndex: number,
    ) {
        const updated = [...data.exercises];
        updated[exIndex].sets[setIndex].fields.splice(fieldIndex, 1);
        updated[exIndex].sets[setIndex].suggested_values?.splice(fieldIndex, 1);
        setData('exercises', updated);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        const errors: string[] = [];

        if (!data.name.trim()) errors.push('Program name is required.');
        if (data.exercises.length === 0)
            errors.push('At least one exercise is required.');

        data.exercises.forEach((ex, i) => {
            if (!ex.name.trim())
                errors.push(`Exercise ${i + 1}: Name is required.`);
            if (ex.sets.length === 0)
                errors.push(`Exercise ${i + 1}: At least one set is required.`);

            ex.sets.forEach((set, j) => {
                if (!set.fields || set.fields.length === 0)
                    errors.push(
                        `Exercise ${i + 1}, Set ${j + 1}: At least one field is required.`,
                    );

                set.fields.forEach((f, k) => {
                    if (!f.name.trim())
                        errors.push(
                            `Exercise ${i + 1}, Set ${j + 1}, Field ${k + 1}: Name is required.`,
                        );
                });

                set.suggested_values?.forEach((sv, k) => {
                    const type = set.fields[k]?.type;
                    if (!validateFieldValue(type, sv.value)) {
                        errors.push(
                            `Exercise ${i + 1}, Set ${j + 1}, Field ${k + 1}: Invalid value for type "${type}".`,
                        );
                    } else if (type === 'duration') {
                        sv.value = normalizeDuration(sv.value);
                    }
                });
            });
        });

        if (errors.length > 0) {
            setFormErrors(errors);
            return;
        }

        put(route('programs.update', program.id), { preserveScroll: true });
    }

    return (
        <AppLayout>
            <Head title={`Edit Program: ${program.name}`} />
            <div className="fixed inset-0 z-40 overflow-y-auto bg-black/40 px-4 py-10 backdrop-blur-sm">
                <FormModal
                    title="✏️ Edit Training Program"
                    description="Update program details, exercises, and sets without leaving the page."
                    backHref={route('programs.show', program.id)}
                    backLabel="Close"
                >
                    <form onSubmit={submit} className="mx-auto w-full max-w-5xl space-y-6 font-sans">
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/60 focus:outline-none"
                                placeholder="Program Name"
                            />
                            <textarea
                                value={data.note}
                                onChange={(e) => setData('note', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/60 focus:outline-none"
                                placeholder="Optional Note"
                            />
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-foreground">
                                    Limit to Team (optional)
                                </label>
                                <select
                                    value={data.sport_team_id ?? ''}
                                    onChange={(e) =>
                                        setData('sport_team_id', e.target.value ? Number(e.target.value) : null)
                                    }
                                    className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/60 focus:outline-none"
                                >
                                    <option value="">All teams (shared)</option>
                                    {teams.map((team) => (
                                        <option key={team.id} value={team.id}>
                                            {team.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted-foreground">
                                    Set a team to restrict visibility and assignment to that team.
                                    Leave empty to make the program available across your teams.
                                </p>
                            </div>
                        </div>

                        {/* Exercises */}
                        <ReactSortable
                            list={data.exercises}
                            setList={(newList) =>
                                setData(
                                    'exercises',
                                    newList.map((ex, i) => ({ ...ex, order: i })),
                                )
                            }
                            className="space-y-6"
                        >
                            {data.exercises.map((ex, i) => (
                                <div
                                    key={ex.id}
                                    className="space-y-2 border-b pb-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <label className="font-heading text-sm text-[#102d4e]">
                                            Exercise {i + 1}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => removeExercise(i)}
                                            className="text-xs text-red-600 hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        value={ex.name}
                                        onChange={(e) =>
                                            updateExercise(
                                                i,
                                                'name',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/60 focus:outline-none"
                                        placeholder="Exercise Name"
                                    />
                                    <textarea
                                        value={ex.description}
                                        onChange={(e) =>
                                            updateExercise(
                                                i,
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/60 focus:outline-none"
                                        placeholder="Optional Description"
                                    />

                                    {/* Sets */}
                                    <ReactSortable
                                        list={ex.sets}
                                        setList={(newList) =>
                                            updateExercise(
                                                i,
                                                'sets',
                                                newList.map((s, idx) => ({
                                                    ...s,
                                                    order: idx,
                                                })),
                                            )
                                        }
                                        className="space-y-2"
                                    >
                                        {ex.sets.map((set, j) => (
                                            <div
                                                key={set.id}
                                                className="space-y-2 rounded-md border border-border bg-muted/30 p-3 shadow-sm"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <label className="font-heading text-sm text-foreground">
                                                        Set {j + 1}
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeSet(i, j)
                                                        }
                                                        className="text-xs text-red-600 hover:underline"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                {/* Fields */}
                                                {set.fields.map((f, k) => {
                                                    const suggested = set
                                                        .suggested_values?.[k] || {
                                                        value: '',
                                                        unit: '',
                                                    };
                                                    const showUnitDropdown =
                                                        f.name === 'Weight' ||
                                                        f.name === 'Distance';
                                                    const units =
                                                        fieldUnits[f.name] || [];

                                                    return (
                                                        <div
                                                            key={k}
                                                            className="grid grid-cols-5 items-center gap-2"
                                                        >
                                                            <select
                                                                value={f.name}
                                                                onChange={(e) => {
                                                                    const field =
                                                                        predefinedFields.find(
                                                                            (pf) =>
                                                                                pf.name ===
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        );
                                                                    if (!field)
                                                                        return;
                                                                    updateFieldMeta(
                                                                        i,
                                                                        j,
                                                                        k,
                                                                        'name',
                                                                        field.name,
                                                                    );
                                                                    updateFieldMeta(
                                                                        i,
                                                                        j,
                                                                        k,
                                                                        'type',
                                                                        field.type,
                                                                    );
                                                                }}
                                                                className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
                                                            >
                                                                <option value="">
                                                                    Select Field
                                                                </option>
                                                                {predefinedFields.map(
                                                                    (pf) => (
                                                                        <option
                                                                            key={
                                                                                pf.name
                                                                            }
                                                                            value={
                                                                                pf.name
                                                                            }
                                                                        >
                                                                            {
                                                                                pf.name
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>

                                                            <input
                                                                type="text"
                                                                value={f.type}
                                                                readOnly
                                                                className="rounded border border-border bg-muted px-3 py-2 text-sm text-foreground"
                                                            />

                                                            <input
                                                                type={
                                                                    f.type ===
                                                                        'number'
                                                                        ? 'number'
                                                                        : 'text'
                                                                }
                                                                value={
                                                                    suggested.value
                                                                }
                                                                onChange={(e) =>
                                                                    updateSuggestedValue(
                                                                        i,
                                                                        j,
                                                                        k,
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
                                                                placeholder={
                                                                    f.type ===
                                                                        'duration'
                                                                        ? 'hh:mm:ss'
                                                                        : f.type ===
                                                                            'number'
                                                                            ? 'e.g., 10'
                                                                            : 'Enter text'
                                                                }
                                                            />

                                                            {showUnitDropdown && (
                                                                <select
                                                                    value={
                                                                        suggested.unit ||
                                                                        units[0]
                                                                    }
                                                                    onChange={(e) =>
                                                                        updateFieldUnit(
                                                                            i,
                                                                            j,
                                                                            k,
                                                                            e.target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="rounded border px-3 py-2 text-sm text-gray-900 bg-white"
                                                                >
                                                                    {units.map(
                                                                        (u) => (
                                                                            <option
                                                                                key={
                                                                                    u
                                                                                }
                                                                                value={
                                                                                    u
                                                                                }
                                                                            >
                                                                                {u}
                                                                            </option>
                                                                        ),
                                                                    )}
                                                                </select>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeFieldMeta(
                                                                        i,
                                                                        j,
                                                                        k,
                                                                    )
                                                                }
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    );
                                                })}

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = [
                                                            ...data.exercises,
                                                        ];
                                                        updated[i].sets[
                                                            j
                                                        ].fields.push({
                                                            name: '',
                                                            type: 'text',
                                                        });
                                                        updated[i].sets[
                                                            j
                                                        ].suggested_values?.push({
                                                            value: '',
                                                            unit: '',
                                                        });
                                                        setData(
                                                            'exercises',
                                                            updated,
                                                        );
                                                    }}
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    + Add Field
                                                </button>
                                            </div>
                                        ))}
                                    </ReactSortable>

                                    <div className="mt-2 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => addSet(i)}
                                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                            <PlusCircle className="h-5 w-5 text-primary" />
                                            <span>Add Set</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </ReactSortable>

                        <button
                            type="button"
                            onClick={addExercise}
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                            <PlusCircle className="h-5 w-5 text-primary" />
                            <span>Add Exercise</span>
                        </button>

                        {/* Error Messages */}
                        {formErrors.length > 0 && (
                            <div className="space-y-1 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                                {formErrors.map((err, idx) => (
                                    <p key={idx}>{err}</p>
                                ))}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex items-center justify-end">
                            <button
                                type="submit"
                                className="rounded-md bg-primary px-5 py-2.5 font-heading font-semibold text-primary-foreground transition hover:bg-primary/90 focus:ring-2 focus:ring-primary/60 focus:outline-none"
                                disabled={data.exercises.length === 0}
                            >
                                Update Program
                            </button>
                        </div>
                    </form>
                </FormModal>
            </div>
        </AppLayout>
    );
}
