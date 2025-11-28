import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'School Admins',
        href: '/school-admins',
    },
];

export default function Index({ users }: { users: User[] }) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    function confirmDelete(id: number) {
        setDeleteId(id);
    }

    function handleDelete() {
        if (deleteId) {
            router.delete(route('school-admins.destroy', deleteId));
            setDeleteId(null);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="School Admins" />
            <div className="p-6">
                <div className="space-y-6">
                    <h1 className="font-heading text-2xl font-semibold text-[#102d4e]">
                        School Admins
                    </h1>

                    <div className="flex items-center justify-between gap-4">

                        {can('school-admins.create') && (
                            <Link
                                href={route('school-admins.create')}
                                className="rounded-lg bg-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            >
                                Add School Admin
                            </Link>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                        <table className="w-full font-sans text-sm text-gray-700">
                            <thead className="bg-[#f5f7fa] font-heading text-xs text-[#102d4e] uppercase">
                                <tr>
                                    <th className="px-6 py-4 text-left">ID</th>
                                    <th className="px-6 py-4 text-left">Name</th>
                                    <th className="px-6 py-4 text-left">Email</th>
                                    <th className="px-6 py-4 text-left">School</th>
                                    <th className="w-70 px-6 py-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {users.map(({ id, name, email, school }) => (
                                    <tr key={id} className="transition hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{id}</td>
                                        <td className="px-6 py-4">{name}</td>
                                        <td className="px-6 py-4">{email}</td>
                                        <td className="px-6 py-4">{school?.name ?? '—'}</td>
                                        <td className="space-x-2 px-6 py-4">
                                            {can('school-admins.edit') && (
                                                <Link
                                                    href={route('school-admins.edit', id)}
                                                    className="inline-flex items-center rounded-md bg-[#102d4e] px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                                >
                                                    Edit
                                                </Link>
                                            )}
                                            {can('school-admins.view') && (
                                                <Link
                                                    href={route('school-admins.show', id)}
                                                    className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none"
                                                >
                                                    View
                                                </Link>
                                            )}
                                            {can('school-admins.delete') && (
                                                <button
                                                    onClick={() => confirmDelete(id)}
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
                            Are you sure you want to delete this school admin? This action cannot be undone.
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