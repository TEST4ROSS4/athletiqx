import AppLayout from '@/layouts/app-layout';
import { FormModal } from '@/components/form-modal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowUpDown } from 'lucide-react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can';
import { useState } from 'react';

const breadcrumbs = [{ title: 'Coach Assignments', href: '/coach-assignments' }];

export default function Index({
    assignments,
    sort,
    coaches = [],
    sports = [],
    sportTeams = [],
}: {
    assignments: any[];
    sort: string;
    coaches?: { id: number; name: string; email: string }[];
    sports?: { id: number; name: string }[];
    sportTeams?: { id: number; name: string; sport: { name: string } }[];
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const coachOptions = coaches.map((coach) => ({
        label: `${coach.name} (${coach.email})`,
        value: coach.id,
    }));
    const sportOptions = sports.map((sport) => ({
        label: sport.name,
        value: sport.id,
    }));
    const teamOptions = sportTeams.map((team) => ({
        label: `${team.name} - ${team.sport.name}`,
        value: team.id,
    }));

    const { data, setData, errors, post, reset, processing } = useForm<{
        coach_id: number | null;
        sport_id: number | null;
        sport_team_id: number | null;
    }>({
        coach_id: null,
        sport_id: null,
        sport_team_id: null,
    });

    const itemsPerPage = 9;
    const totalPages = Math.ceil(assignments.length / itemsPerPage) || 1;
    const paginatedAssignments = assignments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('coach-assignments.store'), {
            onSuccess: () => {
                reset();
                setShowModal(false);
            },
        });
    }

    function handleSortToggle() {
        const nextSort = sort === 'alpha' ? 'created' : 'alpha';
        router.get(route('coach-assignments.index'), { sort: nextSort }, { preserveState: true });
    }

    function confirmDelete(id: number) {
        setDeleteId(id);
    }

    function handleDelete() {
        if (deleteId) {
            router.delete(route('coach-assignments.destroy', deleteId));
            setDeleteId(null);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Coach Assignments" />
            <div className="p-6">
                <div className="space-y-6">
                    {/* Heading */}
                    <h1 className="font-heading text-2xl font-semibold text-[#102d4e]">
                        Coach Assignment Management
                    </h1>

                    {/* Top Controls */}
                    <div className="flex items-center justify-between gap-4">
                        {can('coach-assignments.create') && (
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="rounded-lg bg-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            >
                                Assign Coach
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
                            placeholder="Search coaches..."
                            className="w-64 rounded-md border border-gray-300 px-3 py-2 font-sans text-sm shadow-sm focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                        /> */}
                    </div>

                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                        <table className="w-full font-sans text-sm text-gray-700">
                            <thead className="bg-[#f5f7fa] font-heading text-xs text-[#102d4e] uppercase">
                                <tr>
                                    <th className="px-6 py-4 text-left">ID</th>
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-1">
                                            <span>Coach</span>
                                            <button
                                                onClick={handleSortToggle}
                                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                                title={`Sort by ${sort === 'alpha' ? 'Order' : 'Alphabetical'}`}
                                            >
                                                <ArrowUpDown className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">Assigned To</th>
                                    <th className="px-6 py-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {paginatedAssignments.map((a) => (
                                    <tr
                                        key={a.id}
                                        className="transition hover:bg-[#0d243d] hover:text-white"
                                    >
                                        <td className="px-6 py-2 font-medium">{a.id}</td>
                                        <td className="px-6 py-2">{a.coach?.name}</td>
                                        <td className="px-6 py-2">
                                            {a.sport?.name
                                                ? `Sport: ${a.sport.name}`
                                                : a.sport_team?.name
                                                    ? `Team: ${a.sport_team.name}`
                                                    : '—'}
                                        </td>
                                        <td className="space-x-1 px-6 py-2">
                                            {can('coach-assignments.edit') && (
                                                <Link
                                                    href={route('coach-assignments.edit', a.id)}
                                                    className="inline-flex items-center rounded-md bg-[#102d4e] px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                                >
                                                    Edit
                                                </Link>
                                            )}
                                            {can('coach-assignments.view') && (
                                                <Link
                                                    href={route('coach-assignments.show', a.id)}
                                                    className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none"
                                                >
                                                    View
                                                </Link>
                                            )}
                                            {can('coach-assignments.delete') && (
                                                <button
                                                    onClick={() => confirmDelete(a.id)}
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

                    {/* Pagination */}
                    {assignments.length > 0 && (
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm font-sans text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <div className="space-x-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                    className="rounded-md border border-gray-300 px-3 py-1 text-sm font-heading text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    className="rounded-md border border-gray-300 px-3 py-1 text-sm font-heading text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
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
                            Are you sure you want to delete this coach assignment? This action cannot be undone.
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-2 py-6 backdrop-blur-sm">
                    <FormModal
                        title="Assign Coach to Sport or Team"
                        backHref={route('coach-assignments.index')}
                        backLabel="Close"
                        onBack={() => {
                            reset();
                            setShowModal(false);
                        }}
                    >
                        <form onSubmit={submit} className="space-y-6 font-sans">
                            <div className="grid gap-2">
                                <label htmlFor="coach_id" className="font-heading text-sm text-[#102d4e]">
                                    Team Manager (any user with team access permission):
                                </label>
                                <select
                                    id="coach_id"
                                    value={data.coach_id ?? ''}
                                    onChange={(e) => setData('coach_id', e.target.value ? Number(e.target.value) : null)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                    required
                                >
                                    <option value="">Select user</option>
                                    {coachOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.coach_id && <p className="mt-1 text-sm text-red-500">{errors.coach_id}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="sport_id" className="font-heading text-sm text-[#102d4e]">
                                    Sport (optional):
                                </label>
                                <select
                                    id="sport_id"
                                    value={data.sport_id ?? ''}
                                    onChange={(e) => {
                                        const value = e.target.value ? Number(e.target.value) : null;
                                        setData('sport_id', value);
                                        if (value) setData('sport_team_id', null);
                                    }}
                                    disabled={!!data.sport_team_id}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none disabled:bg-gray-100"
                                >
                                    <option value="">Select sport</option>
                                    {sportOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.sport_id && <p className="mt-1 text-sm text-red-500">{errors.sport_id}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="sport_team_id" className="font-heading text-sm text-[#102d4e]">
                                    Sport Team (optional):
                                </label>
                                <select
                                    id="sport_team_id"
                                    value={data.sport_team_id ?? ''}
                                    onChange={(e) => {
                                        const value = e.target.value ? Number(e.target.value) : null;
                                        setData('sport_team_id', value);
                                        if (value) setData('sport_id', null);
                                    }}
                                    disabled={!!data.sport_id}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none disabled:bg-gray-100"
                                >
                                    <option value="">Select team</option>
                                    {teamOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.sport_team_id && (
                                    <p className="mt-1 text-sm text-red-500">{errors.sport_team_id}</p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-md bg-[#102d4e] px-4 py-2 font-heading font-semibold text-white transition hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none disabled:opacity-60"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        reset();
                                        setShowModal(false);
                                    }}
                                    className="rounded-md border border-gray-300 px-4 py-2 font-heading text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </FormModal>
                </div>
            )}
        </AppLayout>
    );
}