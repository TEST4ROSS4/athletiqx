import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Role } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/roles',
    },
];

export default function Index({ roles }: { roles: Role[] }) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    function confirmDelete(id: number) {
        setDeleteId(id);
    }

    function handleDelete() {
        if (deleteId) {
            router.delete(route('roles.destroy', deleteId));
            setDeleteId(null);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
            <div className="p-6">
                <div className="space-y-6">
                    {/* Heading */}
                    <h1 className="font-heading text-2xl font-semibold text-[#102d4e]">
                        Roles Management
                    </h1>
                    {/* Top Controls */}
                    <div className="flex items-center justify-between gap-4">
                        {can('roles.create') && (
                            <Link
                                href={route('roles.create')}
                                className="rounded-lg bg-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            >
                                Add Role
                            </Link>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                        <table className="w-full font-sans text-sm text-gray-700">
                            <thead className="bg-[#f5f7fa] font-heading text-xs text-[#102d4e] uppercase">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left">ID</th>
                                    <th scope="col" className="px-6 py-4 text-left">Name</th>
                                    <th scope="col" className="px-6 py-4 text-left">Permissions</th>
                                    <th scope="col" className="w-70 px-6 py-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {roles.map(({ id, name, permissions }) => (
                                    <tr
                                        key={id}
                                        className="border-b border-gray-200 odd:bg-white even:bg-gray-50"
                                    >
                                        <td className="px-6 py-2 font-medium text-gray-900">{id}</td>
                                        <td className="px-6 py-2 text-gray-700">{name}</td>
                                        <td className="ppx-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {permissions.slice(0, 3).map((permission) =>
                                                    permission ? (
                                                        <span
                                                            key={permission.id}
                                                            className="inline-block rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300"
                                                        >
                                                            {permission.name}
                                                        </span>
                                                    ) : null
                                                )}
                                                {permissions.length > 3 && (
                                                    <span className="inline-block text-xs text-gray-500">
                                                        +{permissions.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="space-x-1 px-6 py-2">
                                            {can('roles.edit') && (
                                                <Link
                                                    href={route('roles.edit', id)}
                                                    className="inline-flex items-center rounded-md bg-[#102d4e] px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                                >
                                                    Edit
                                                </Link>
                                            )}
                                            {can('roles.view') && (
                                                <Link
                                                    href={route('roles.show', id)}
                                                    className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none"
                                                >
                                                    View
                                                </Link>
                                            )}
                                            {can('roles.delete') && (
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
            {
                deleteId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
                            <h2 className="font-heading text-lg font-semibold text-[#102d4e] mb-2">
                                Confirm Deletion
                            </h2>
                            <p className="font-sans text-sm text-gray-700 mb-4">
                                Are you sure you want to delete this role? This action cannot be undone.
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
                )
            }
        </AppLayout >
    );
}