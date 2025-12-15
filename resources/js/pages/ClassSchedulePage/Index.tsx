import AppLayout from '@/layouts/app-layout';
import { FormModal } from '@/components/form-modal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowUpDown, PlusCircle } from 'lucide-react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can';
import { useState } from 'react';

const breadcrumbs = [{ title: 'Class Schedules', href: '/class-schedules' }];
const dayOptions = [
    { label: 'Monday', value: 'M' },
    { label: 'Tuesday', value: 'T' },
    { label: 'Wednesday', value: 'W' },
    { label: 'Thursday', value: 'TH' },
    { label: 'Friday', value: 'F' },
    { label: 'Saturday', value: 'S' },
    { label: 'Sunday', value: 'SU' },
];

export default function Index({
    schedules,
    sort,
    courseSections = [],
}: {
    schedules: any[];
    sort: string;
    courseSections?: {
        id: number;
        course: { title: string };
        section: { code: string };
    }[];
}) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [schedulesForm, setSchedulesForm] = useState<
        { day: string; start: string; end: string; room: string; isOnline: boolean }[]
    >([{ day: '', start: '', end: '', room: '', isOnline: false }]);
    const { data, setData, post, reset, processing, errors } = useForm({
        course_section_id: 0,
        days: '',
        time: '',
        room: '',
    });

    function handleSortToggle() {
        const nextSort = sort === 'alpha' ? 'created' : 'alpha';
        router.get(route('class-schedules.index'), { sort: nextSort }, { preserveState: true });
    }

    function confirmDelete(id: number) {
        setDeleteId(id);
    }

    function handleDelete() {
        if (deleteId) {
            router.delete(route('class-schedules.destroy', deleteId));
            setDeleteId(null);
        }
    }

    function addScheduleBlock() {
        setSchedulesForm([...schedulesForm, { day: '', start: '', end: '', room: '', isOnline: false }]);
    }

    function removeScheduleBlock(index: number) {
        const updated = schedulesForm.filter((_, i) => i !== index);
        setSchedulesForm(updated.length ? updated : [{ day: '', start: '', end: '', room: '', isOnline: false }]);
        syncDerivedFields(updated.length ? updated : [{ day: '', start: '', end: '', room: '', isOnline: false }]);
    }

    function updateSchedule(
        index: number,
        field: keyof (typeof schedulesForm)[number],
        value: string | boolean,
    ) {
        const updated = [...schedulesForm];

        if (field === 'isOnline') {
            updated[index].isOnline = value as boolean;
            updated[index].room = value ? 'ONLINE' : '';
        } else {
            updated[index][field] = value as string;
        }

        setSchedulesForm(updated);
        syncDerivedFields(updated);
    }

    function syncDerivedFields(list: typeof schedulesForm) {
        const days = list.map((s) => s.day).filter(Boolean).join('/');
        const time = list.map((s) => (s.start && s.end ? `${s.start}-${s.end}` : '')).filter(Boolean).join('/');
        const room = list.map((s) => s.room).filter(Boolean).join('/');

        setData('days', days);
        setData('time', time);
        setData('room', room);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        const validation: string[] = [];
        if (!data.course_section_id || data.course_section_id === 0) {
            validation.push('Course section is required.');
        }

        schedulesForm.forEach((s, i) => {
            if (!s.day) validation.push(`Schedule ${i + 1}: Day is required.`);
            if (!s.start || !s.end) validation.push(`Schedule ${i + 1}: Start and end time are required.`);
            if (!s.isOnline && !s.room.trim())
                validation.push(`Schedule ${i + 1}: Room is required for in-person classes.`);
        });

        if (validation.length) {
            setFormErrors(validation);
            return;
        }

        setFormErrors([]);
        post(route('class-schedules.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSchedulesForm([{ day: '', start: '', end: '', room: '', isOnline: false }]);
                setShowModal(false);
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Class Schedules" />
            <div className="p-6">
                <div className="space-y-6">
                    {/* Heading */}
                    <h1 className="font-heading text-2xl font-semibold text-[#102d4e]">
                        Class Schedule Management
                    </h1>

                    {/* Top Controls */}
                    <div className="flex items-center justify-between gap-4">
                        {can('class-schedules.create') && (
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="rounded-lg bg-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            >
                                Add Schedule
                            </button>
                        )}

                        {/* Search Bar */}
                        {/* <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1); // reset to first page when searching
                            }}
                            placeholder="Search users..."
                            className="w-64 rounded-md border border-gray-300 px-3 py-2 font-sans text-sm shadow-sm focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                        /> */}
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                        <table className="w-full font-sans text-sm text-gray-700">
                            <thead className="bg-[#f5f7fa] font-heading text-xs text-[#102d4e] uppercase">
                                <tr>
                                    <th className="px-6 py-4 text-left">ID</th>
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-1">
                                            <span>Course</span>
                                            <button
                                                onClick={handleSortToggle}
                                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                                title={`Sort by ${sort === 'alpha' ? 'Order' : 'Alphabetical'}`}
                                            >
                                                <ArrowUpDown className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">Section</th>
                                    <th className="px-6 py-4 text-left">Days</th>
                                    <th className="px-6 py-4 text-left">Time</th>
                                    <th className="px-6 py-4 text-left">Room</th>
                                    <th className="px-6 py-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {schedules.map((s) => (
                                    <tr key={s.id} className="transition hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{s.id}</td>
                                        <td className="px-6 py-4">{s.course_section?.course?.title}</td>
                                        <td className="px-6 py-4">{s.course_section?.section?.code}</td>
                                        <td className="px-6 py-4">{s.days}</td>
                                        <td className="px-6 py-4">{s.time}</td>
                                        <td className="px-6 py-4">{s.room}</td>
                                        <td className="space-x-2 px-6 py-4">
                                            {can('class-schedules.edit') && (
                                                <Link
                                                    href={route('class-schedules.edit', s.id)}
                                                    className="inline-flex items-center rounded-md bg-[#102d4e] px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                                >
                                                    Edit
                                                </Link>
                                            )}
                                            {can('class-schedules.view') && (
                                                <Link
                                                    href={route('class-schedules.show', s.id)}
                                                    className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none"
                                                >
                                                    View
                                                </Link>
                                            )}
                                            {can('class-schedules.delete') && (
                                                <button
                                                    onClick={() => confirmDelete(s.id)}
                                                    className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:outline-none"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
                        <h2 className="font-heading text-lg font-semibold text-[#102d4e] mb-2">
                            Confirm Deletion
                        </h2>
                        <p className="font-sans text-sm text-gray-700 mb-4">
                            Are you sure you want to delete this class schedule? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="rounded-md border border-gray-300 px-4 py-2 font-heading text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="rounded-md bg-red-600 px-4 py-2 font-heading text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-3 py-6 backdrop-blur-sm">
                    <FormModal
                        title="Add Class Schedule"
                        backHref={route('class-schedules.index')}
                        backLabel="Close"
                        onBack={() => {
                            reset();
                            setShowModal(false);
                            setFormErrors([]);
                        }}
                    >
                        <form onSubmit={submit} className="space-y-5 font-sans">
                            <div className="grid gap-2">
                                <label htmlFor="course_section_id" className="font-heading text-sm text-[#102d4e]">
                                    Course Section:
                                </label>
                                <select
                                    id="course_section_id"
                                    value={data.course_section_id}
                                    onChange={(e) =>
                                        setData('course_section_id', e.target.value ? Number(e.target.value) : 0)
                                    }
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                >
                                    <option value={0}>Select course section</option>
                                    {courseSections.map((cs) => (
                                        <option key={cs.id} value={cs.id}>
                                            {cs.course?.title} - {cs.section?.code}
                                        </option>
                                    ))}
                                </select>
                                {errors.course_section_id && (
                                    <p className="mt-1 text-sm text-red-500">{errors.course_section_id}</p>
                                )}
                            </div>

                            <div className="space-y-4">
                                {schedulesForm.map((s, i) => (
                                    <div key={i} className="grid gap-3 rounded-md border border-gray-200 p-3 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <label className="font-heading text-sm text-[#102d4e]">
                                                Schedule {i + 1}
                                            </label>
                                            {schedulesForm.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeScheduleBlock(i)}
                                                    className="text-xs text-red-600 hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <select
                                            value={s.day}
                                            onChange={(e) => updateSchedule(i, 'day', e.target.value)}
                                            className="rounded border px-3 py-2 text-sm text-gray-900 bg-white"
                                        >
                                            <option value="">Select day</option>
                                            {dayOptions.map((d) => (
                                                <option key={d.value} value={d.value}>
                                                    {d.label}
                                                </option>
                                            ))}
                                        </select>

                                        <div className="flex flex-col gap-2 sm:flex-row">
                                            <input
                                                type="time"
                                                value={s.start}
                                                onChange={(e) => updateSchedule(i, 'start', e.target.value)}
                                                className="w-full rounded border px-3 py-2 text-sm"
                                            />
                                            <input
                                                type="time"
                                                value={s.end}
                                                onChange={(e) => updateSchedule(i, 'end', e.target.value)}
                                                className="w-full rounded border px-3 py-2 text-sm"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`is_online_${i}`}
                                                checked={s.isOnline}
                                                onChange={(e) => updateSchedule(i, 'isOnline', e.target.checked)}
                                                className="h-4 w-4 accent-green-600"
                                            />
                                            <label htmlFor={`is_online_${i}`} className="text-sm text-gray-700">
                                                Online class
                                            </label>
                                        </div>

                                        {!s.isOnline && (
                                            <input
                                                type="text"
                                                value={s.room}
                                                onChange={(e) => updateSchedule(i, 'room', e.target.value)}
                                                className="rounded border px-3 py-2 text-sm"
                                                placeholder="Room (e.g. 201)"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addScheduleBlock}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-[#102d4e] hover:underline"
                            >
                                <PlusCircle className="h-4 w-4" />
                                Add another schedule
                            </button>

                            {formErrors.length > 0 && (
                                <div className="space-y-1 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                                    {formErrors.map((err, idx) => (
                                        <p key={idx}>{err}</p>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        reset();
                                        setShowModal(false);
                                        setFormErrors([]);
                                        setSchedulesForm([{ day: '', start: '', end: '', room: '', isOnline: false }]);
                                    }}
                                    className="rounded-md border border-gray-300 px-4 py-2 font-heading text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-[#102d4e] px-4 py-2 font-heading font-semibold text-white transition hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none disabled:opacity-70"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </FormModal>
                </div>
            )}
        </AppLayout>
    );
}