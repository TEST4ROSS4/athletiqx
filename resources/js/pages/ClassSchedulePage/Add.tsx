import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { route } from 'ziggy-js';

const dayOptions = [
    { label: 'Monday', value: 'M' },
    { label: 'Tuesday', value: 'T' },
    { label: 'Wednesday', value: 'W' },
    { label: 'Thursday', value: 'TH' },
    { label: 'Friday', value: 'F' },
    { label: 'Saturday', value: 'S' },
    { label: 'Sunday', value: 'SU' },
];

export default function Add({
    courseSections,
}: {
    courseSections: {
        id: number;
        course: { title: string };
        section: { code: string };
    }[];
}) {
    const { data, setData, post, errors } = useForm({
        course_section_id: 0,
        days: '',
        time: '',
        room: '',
    });

    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [schedules, setSchedules] = useState<
        {
            day: string;
            start: string;
            end: string;
            room: string;
            isOnline: boolean;
        }[]
    >([]);

    function addScheduleBlock() {
        setSchedules([
            ...schedules,
            { day: '', start: '', end: '', room: '', isOnline: false },
        ]);
    }

    function removeScheduleBlock(index: number) {
        const updated = [...schedules];
        updated.splice(index, 1);
        setSchedules(updated);
        // 🔄 Sync derived fields to form state
        const days = updated.map((s) => s.day).join('/');
        const time = updated.map((s) => `${s.start}-${s.end}`).join('/');
        const room = updated.map((s) => s.room).join('/');

        setData('days', days);
        setData('time', time);
        setData('room', room);
    }

    function updateSchedule(
        index: number,
        field: keyof (typeof schedules)[number],
        value: string | boolean,
    ) {
        const updated = [...schedules];

        if (field === 'isOnline') {
            updated[index].isOnline = value as boolean;
            updated[index].room = value ? 'ONLINE' : '';
        } else {
            updated[index][field] = value as string;
        }

        setSchedules(updated);

        // 🔄 Sync derived fields to form state
        const days = updated.map((s) => s.day).join('/');
        const time = updated.map((s) => `${s.start}-${s.end}`).join('/');
        const room = updated.map((s) => s.room).join('/');

        setData('days', days);
        setData('time', time);
        setData('room', room);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        const errors: string[] = [];

        if (!data.course_section_id || data.course_section_id === 0) {
            errors.push('Course section is required.');
        }

        schedules.forEach((s, i) => {
            if (!s.day) errors.push(`Schedule ${i + 1}: Day is required.`);
            if (!s.start || !s.end)
                errors.push(
                    `Schedule ${i + 1}: Start and end time are required.`,
                );
            if (!s.isOnline && !s.room.trim())
                errors.push(
                    `Schedule ${i + 1}: Room is required for in-person classes.`,
                );
        });

        if (errors.length > 0) {
            setFormErrors(errors);
            return;
        }

        post(route('class-schedules.store'), {
            preserveScroll: true,
        });
    }

    function loadCourseSectionOptions(
        inputValue: string,
        callback: (options: any[]) => void,
    ) {
        const filtered = courseSections
            .filter(
                (cs) =>
                    cs.course.title
                        .toLowerCase()
                        .includes(inputValue.toLowerCase()) ||
                    cs.section.code
                        .toLowerCase()
                        .includes(inputValue.toLowerCase()),
            )
            .map((cs) => ({
                label: `${cs.course.title} - ${cs.section.code}`,
                value: cs.id,
            }));
        callback(filtered);
    }

    return (
        <AppLayout>
            <Head title="Add Class Schedule" />
            <div className="p-3">
                <h1 className="mb-4 text-2xl font-bold">Add Class Schedule</h1>

                <Link
                    href={route('class-schedules.index')}
                    className="mb-4 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                >
                    Back
                </Link>

                <form
                    onSubmit={submit}
                    className="mx-auto mt-4 max-w-md space-y-6"
                >
                    {/* Course Section Select */}
                    <div className="grid gap-2">
                        <label
                            htmlFor="course_section_id"
                            className="text-sm font-medium"
                        >
                            Course Section:
                        </label>
                        <AsyncSelect
                            cacheOptions
                            defaultOptions
                            loadOptions={loadCourseSectionOptions}
                            onChange={(option) => {
                                if (option?.value != null) {
                                    setData('course_section_id', option.value);
                                }
                            }}
                            placeholder="Search and select course section"
                        />
                        {errors.course_section_id && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.course_section_id}
                            </p>
                        )}
                    </div>

                    {/* Schedule Blocks */}
                    <div className="space-y-4">
                        {schedules.map((s, i) => (
                            <div key={i} className="grid gap-2 border-b pb-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">
                                        Schedule {i + 1}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => removeScheduleBlock(i)}
                                        className="text-xs text-red-600 hover:underline"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <select
                                    value={s.day}
                                    onChange={(e) =>
                                        updateSchedule(i, 'day', e.target.value)
                                    }
                                    className="rounded border px-3 py-2 text-sm"
                                >
                                    <option value="">Select day</option>
                                    {dayOptions.map((d) => (
                                        <option key={d.value} value={d.value}>
                                            {d.label}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex gap-2">
                                    <input
                                        type="time"
                                        value={s.start}
                                        onChange={(e) =>
                                            updateSchedule(
                                                i,
                                                'start',
                                                e.target.value,
                                            )
                                        }
                                        className="w-1/2 rounded border px-3 py-2 text-sm"
                                    />
                                    <input
                                        type="time"
                                        value={s.end}
                                        onChange={(e) =>
                                            updateSchedule(
                                                i,
                                                'end',
                                                e.target.value,
                                            )
                                        }
                                        className="w-1/2 rounded border px-3 py-2 text-sm"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={s.isOnline}
                                        onChange={(e) =>
                                            updateSchedule(
                                                i,
                                                'isOnline',
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    <label className="text-sm">Online</label>
                                </div>

                                {!s.isOnline && (
                                    <input
                                        type="text"
                                        value={s.room}
                                        onChange={(e) =>
                                            updateSchedule(
                                                i,
                                                'room',
                                                e.target.value,
                                            )
                                        }
                                        className="rounded border px-3 py-2 text-sm"
                                        placeholder="Room"
                                    />
                                )}
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addScheduleBlock}
                            className="flex items-center gap-2 text-sm text-blue-700 hover:underline"
                        >
                            <PlusCircle className="h-5 w-5 text-blue-700" />
                            <span>Add Schedule</span>
                        </button>
                    </div>

                    {formErrors.length > 0 && (
                        <div className="space-y-1 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                            {formErrors.map((err, idx) => (
                                <p key={idx}>{err}</p>
                            ))}
                        </div>
                    )}

                    {errors.room && (
                        <p className="text-sm text-red-600">{errors.room}</p>
                    )}
                    {errors.time && (
                        <p className="text-sm text-red-600">{errors.time}</p>
                    )}

                    <button
                        type="submit"
                        className="rounded-md bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700"
                        disabled={schedules.length === 0}
                    >
                        Submit
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
