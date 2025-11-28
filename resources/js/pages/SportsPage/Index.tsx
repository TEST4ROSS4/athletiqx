import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
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
    const [deleteId, setDeleteId] = useState<number | null>(null);

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
                            <Link
                                href={route('sports.create')}
                                className="rounded-lg bg-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            >
                                Add Sport
                            </Link>
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
                                {sports.map((sport) => (
                                    <tr key={sport.id} className="transition hover:bg-gray-50">
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
        </AppLayout>
    );
}