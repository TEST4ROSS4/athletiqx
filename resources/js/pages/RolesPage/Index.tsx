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
            <div className="space-y-6 px-6 py-6">
                <div className="flex flex-col gap-2">
                    <h1 className="font-heading text-3xl font-semibold text-[#102d4e]">Roles</h1>
                    <p className="text-sm text-gray-600">
                        Manage role definitions and their permissions.
                    </p>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-gray-500">
                        Total roles: <span className="font-semibold text-[#102d4e]">{roles.length}</span>
                    </div>
                    {can('roles.create') && (
                        <Link
                            href={route('roles.create')}
                            className="rounded-lg bg-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d243d] focus:outline-none focus:ring-2 focus:ring-[#102d4e]"
                        >
                            Add Role
                        </Link>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full table-auto font-sans text-sm text-gray-700">
                        <thead className="bg-[#f5f7fa] font-heading text-xs uppercase text-[#102d4e]">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left">ID</th>
                                <th scope="col" className="px-6 py-3 text-left">Name</th>
                                <th scope="col" className="px-6 py-3 text-left">Permissions</th>
                                <th scope="col" className="w-70 px-6 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {roles.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No roles yet. Create your first role to get started.
                                    </td>
                                </tr>
                            )}
                            {roles.map(({ id, name, permissions }) => (
                                <tr
                                    key={id}
                                    className="transition hover:bg-gray-50"
                                >
                                    <td className="px-6 py-3 font-medium text-gray-900">{id}</td>
                                    <td className="px-6 py-3 text-gray-800">{name}</td>
                                    <td className="px-6 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {permissions.slice(0, 4).map((permission) =>
                                                permission ? (
                                                    <span
                                                        key={permission.id}
                                                        className="inline-block rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700"
                                                    >
                                                        {permission.name}
                                                    </span>
                                                ) : null
                                            )}
                                            {permissions.length > 4 && (
                                                <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                                                    +{permissions.length - 4} more
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="space-x-2 px-6 py-3">
                                        {can('roles.edit') && (
                                            <Link
                                                href={route('roles.edit', id)}
                                                className="inline-flex items-center rounded-md bg-[#102d4e] px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm transition hover:bg-[#0d243d] focus:outline-none focus:ring-2 focus:ring-[#102d4e]"
                                            >
                                                Edit
                                            </Link>
                                        )}
                                        {can('roles.view') && (
                                            <Link
                                                href={route('roles.show', id)}
                                                className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                            >
                                                View
                                            </Link>
                                        )}
                                        {can('roles.delete') && (
                                            <button
                                                onClick={() => confirmDelete(id)}
                                                className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
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

            {/* Delete Confirmation Modal */}
            {
                deleteId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
                            <h2 className="mb-2 font-heading text-lg font-semibold text-[#102d4e]">
                                Confirm Deletion
                            </h2>
                            <p className="mb-4 font-sans text-sm text-gray-700">
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