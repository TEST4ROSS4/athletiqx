import AppLayout from '@/layouts/app-layout';
import { FormModal } from '@/components/form-modal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowUpDown } from 'lucide-react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can';
import { useState } from 'react';

const breadcrumbs = [{ title: 'Sport Teams', href: '/sport-teams' }];

export default function Index({
    teams,
    sort,
    sports = [],
}: {
    teams: any[];
    sort: string;
    sports?: { id: number; name: string }[];
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, reset, processing, errors } = useForm<{
        name: string;
        season: string;
        is_official: boolean;
        sport_id: number | '';
    }>({
        name: '',
        season: '',
        is_official: true,
        sport_id: '',
    });

    const itemsPerPage = 9;
    const totalPages = Math.ceil(teams.length / itemsPerPage) || 1;
    const paginatedTeams = teams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    function handleSortToggle() {
        const nextSort = sort === 'alpha' ? 'created' : 'alpha';
        router.get(route('sport-teams.index'), { sort: nextSort }, { preserveState: true });
    }

    function confirmDelete(id: number) {
        setDeleteId(id);
    }

    function handleDelete() {
        if (deleteId) {
            router.delete(route('sport-teams.destroy', deleteId));
            setDeleteId(null);
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('sport-teams.store'), {
            onSuccess: () => {
                reset();
                setShowModal(false);
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sport Teams" />
            <div className="p-6">
                <div className="space-y-6">
                    {/* Heading */}
                    <h1 className="font-heading text-2xl font-semibold text-[#102d4e]">
                        Team Management
                    </h1>

                    {/* Top Controls */}
                    <div className="flex items-center justify-between gap-4">
                        {can('sport-teams.create') && (
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="rounded-lg bg-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            >
                                Add Team
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
                            placeholder="Search sports team..."
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
                                            <span>Team Name</span>
                                            <button
                                                onClick={handleSortToggle}
                                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                                title={`Sort by ${sort === 'alpha' ? 'Order' : 'Alphabetical'}`}
                                            >
                                                <ArrowUpDown className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">Sport</th>
                                    <th className="px-6 py-4 text-left">Season</th>
                                    <th className="px-6 py-4 text-left">Official</th>
                                    <th className="px-6 py-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {paginatedTeams.map((team) => (
                                    <tr
                                        key={team.id}
                                        className="transition hover:bg-[#0d243d] hover:text-white"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900">{team.id}</td>
                                        <td className="px-6 py-4">{team.name}</td>
                                        <td className="px-6 py-4">{team.sport?.name || '—'}</td>
                                        <td className="px-6 py-4">{team.season}</td>
                                        <td className="px-6 py-4">{team.is_official ? 'Yes' : 'No'}</td>
                                        <td className="space-x-2 px-6 py-4">
                                            {can('sport-teams.edit') && (
                                                <Link
                                                    href={route('sport-teams.edit', team.id)}
                                                    className="inline-flex items-center rounded-md bg-[#102d4e] px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                                >
                                                    Edit
                                                </Link>
                                            )}
                                            {can('sport-teams.view') && (
                                                <Link
                                                    href={route('sport-teams.show', team.id)}
                                                    className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none"
                                                >
                                                    View
                                                </Link>
                                            )}
                                            {can('sport-teams.delete') && (
                                                <button
                                                    onClick={() => confirmDelete(team.id)}
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
                    {teams.length > 0 && (
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
                            Are you sure you want to delete this user? This action cannot be undone.
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
                        title="Add Sport Team"
                        backHref={route('sport-teams.index')}
                        backLabel="Close"
                        onBack={() => {
                            reset();
                            setShowModal(false);
                        }}
                    >
                        <form onSubmit={submit} className="space-y-6 font-sans">
                            <div className="grid gap-2">
                                <label htmlFor="name" className="font-heading text-sm text-[#102d4e]">
                                    Team Name:
                                </label>
                                <input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                    placeholder="Enter team name"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="season" className="font-heading text-sm text-[#102d4e]">
                                    Season:
                                </label>
                                <input
                                    id="season"
                                    value={data.season}
                                    onChange={(e) => setData('season', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                    placeholder="e.g. Season 85"
                                />
                                {errors.season && <p className="mt-1 text-sm text-red-500">{errors.season}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="sport_id" className="font-heading text-sm text-[#102d4e]">
                                    Sport:
                                </label>
                                <select
                                    id="sport_id"
                                    value={data.sport_id}
                                    onChange={(e) => setData('sport_id', e.target.value ? Number(e.target.value) : '')}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                >
                                    <option value="">Select sport</option>
                                    {sports.map((sport) => (
                                        <option key={sport.id} value={sport.id}>
                                            {sport.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.sport_id && <p className="mt-1 text-sm text-red-500">{errors.sport_id}</p>}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_official"
                                    checked={data.is_official}
                                    onChange={(e) => setData('is_official', e.target.checked)}
                                    className="h-4 w-4 accent-green-600"
                                />
                                <label htmlFor="is_official" className="text-sm text-gray-700">
                                    Official
                                </label>
                                {errors.is_official && <p className="mt-1 text-sm text-red-500">{errors.is_official}</p>}
                            </div>

                            <div className="flex gap-3">
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