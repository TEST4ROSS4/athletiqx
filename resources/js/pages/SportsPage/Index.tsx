import AppLayout from '@/layouts/app-layout';
import { FormModal } from '@/components/form-modal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowUpDown } from 'lucide-react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can';
import { useState } from 'react';

const breadcrumbs = [{ title: 'Sports', href: '/sports' }];

export default function Index({
    sports,
    sort,
}: {
    sports: any[];
    sort: string;
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const { data, setData, post, reset, processing, errors } = useForm<{
        name: string;
        category: string;
        gender: string;
        division: string;
        is_active: boolean;
    }>({
        name: '',
        category: 'team',
        gender: 'mixed',
        division: 'senior',
        is_active: true,
    });

    const itemsPerPage = 9;
    const totalPages = Math.ceil(sports.length / itemsPerPage) || 1;
    const paginatedSports = sports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    function handleSortToggle() {
        const nextSort = sort === 'alpha' ? 'created' : 'alpha';
        router.get(route('sports.index'), { sort: nextSort }, { preserveState: true });
    }

    function confirmDelete(id: number) {
        setDeleteId(id);
    }

    function handleDelete() {
        if (deleteId) {
            router.delete(route('sports.destroy', deleteId));
            setDeleteId(null);
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('sports.store'), {
            onSuccess: () => {
                reset();
                setShowModal(false);
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sports" />
            <div className="p-6">
                <div className="space-y-6">
                    {/* Heading */}
                    <h1 className="font-heading text-2xl font-semibold text-[#102d4e]">
                        Sport Management
                    </h1>

                    {/* Top Controls */}
                    <div className="flex items-center justify-between gap-4">
                        {can('sports.create') && (
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="rounded-lg bg-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            >
                                Add Sport
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
                                            <span>Sport Name</span>
                                            <button
                                                onClick={handleSortToggle}
                                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                                title={`Sort by ${sort === 'alpha' ? 'Order' : 'Alphabetical'}`}
                                            >
                                                <ArrowUpDown className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">Category</th>
                                    <th className="px-6 py-4 text-left">Gender</th>
                                    <th className="px-6 py-4 text-left">Division</th>
                                    <th className="px-6 py-4 text-left">Active</th>
                                    <th className="px-6 py-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {paginatedSports.map((sport) => (
                                    <tr
                                        key={sport.id}
                                        className="transition hover:bg-[#0d243d] hover:text-white"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900">{sport.id}</td>
                                        <td className="px-6 py-4">{sport.name}</td>
                                        <td className="px-6 py-4 capitalize">{sport.category || '—'}</td>
                                        <td className="px-6 py-4 capitalize">{sport.gender}</td>
                                        <td className="px-6 py-4 capitalize">{sport.division}</td>
                                        <td className="px-6 py-4">{sport.is_active ? 'Yes' : 'No'}</td>
                                        <td className="space-x-2 px-6 py-4">
                                            {can('sports.edit') && (
                                                <Link
                                                    href={route('sports.edit', sport.id)}
                                                    className="inline-flex items-center rounded-md bg-[#102d4e] px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                                >
                                                    Edit
                                                </Link>
                                            )}
                                            {can('sports.view') && (
                                                <Link
                                                    href={route('sports.show', sport.id)}
                                                    className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none"
                                                >
                                                    View
                                                </Link>
                                            )}
                                            {can('sports.delete') && (
                                                <button
                                                    onClick={() => confirmDelete(sport.id)}
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
                    {sports.length > 0 && (
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
                            Are you sure you want to delete this sport? This action cannot be undone.
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
                        title="Add Sport"
                        backHref={route('sports.index')}
                        backLabel="Close"
                        onBack={() => {
                            reset();
                            setShowModal(false);
                        }}
                    >
                        <form onSubmit={submit} className="space-y-6 font-sans">
                            <div className="grid gap-2">
                                <label htmlFor="name" className="font-heading text-sm text-[#102d4e]">
                                    Sport Name:
                                </label>
                                <input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Enter sport name"
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label className="font-heading text-sm text-[#102d4e]">Category:</label>
                                <div className="flex gap-4">
                                    {['team', 'individual', 'hybrid'].map((option) => (
                                        <label key={option} className="flex items-center gap-1 text-sm capitalize">
                                            <input
                                                type="radio"
                                                name="category"
                                                value={option}
                                                checked={data.category === option}
                                                onChange={(e) => setData('category', e.target.value)}
                                                className="accent-blue-600"
                                            />
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </label>
                                    ))}
                                </div>
                                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label className="font-heading text-sm text-[#102d4e]">Gender:</label>
                                <div className="flex gap-4">
                                    {['male', 'female', 'mixed'].map((option) => (
                                        <label key={option} className="flex items-center gap-1 text-sm capitalize">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value={option}
                                                checked={data.gender === option}
                                                onChange={(e) => setData('gender', e.target.value)}
                                                className="accent-blue-600"
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                                {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label className="font-heading text-sm text-[#102d4e]">Division:</label>
                                <div className="flex gap-4">
                                    {['junior', 'senior'].map((option) => (
                                        <label key={option} className="flex items-center gap-1 text-sm capitalize">
                                            <input
                                                type="radio"
                                                name="division"
                                                value={option}
                                                checked={data.division === option}
                                                onChange={(e) => setData('division', e.target.value)}
                                                className="accent-blue-600"
                                            />
                                            {option === 'junior' ? 'Junior (High School)' : 'Senior (College)'}
                                        </label>
                                    ))}
                                </div>
                                {errors.division && <p className="text-sm text-red-500">{errors.division}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="is_active" className="font-heading text-sm text-[#102d4e]">
                                    Active:
                                </label>
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 accent-green-600"
                                />
                                {errors.is_active && <p className="text-sm text-red-500">{errors.is_active}</p>}
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