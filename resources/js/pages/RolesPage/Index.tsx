import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Role } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/roles',
    },
];

export default function Index({ roles }: { roles: Role[] }) {
    function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this?')) {
            router.delete(route('roles.destroy', id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
            <div className="p-3">
                <div className="p-3">
                    <h1 className="mb-4 text-2xl font-bold">CRUD App</h1>

                    {can('roles.create') && (
                        <Link
                            href={route('roles.create')}
                            className="mb-4 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
                        >
                            Add Role
                        </Link>
                    )}

                    <div className="mt-4 overflow-x-auto">
                        <div className="min-w-full overflow-hidden rounded-lg border border-gray-200">
                            <table className="min-w-full table-auto text-left text-sm text-gray-700">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">ID</th>
                                        <th scope="col" className="px-6 py-3">Name</th>
                                        <th scope="col" className="px-6 py-3">Permissions</th>
                                        <th scope="col" className="w-70 px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.map(({ id, name, permissions }) => (
                                        <tr
                                            key={id}
                                            className="border-b border-gray-200 odd:bg-white even:bg-gray-50"
                                        >
                                            <td className="px-6 py-2 font-medium text-gray-900">{id}</td>
                                            <td className="px-6 py-2 text-gray-700">{name}</td>
                                            <td className="px-6 py-2 text-gray-700 max-w-xs overflow-hidden">
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
                                                        className="cursor-pointer rounded-lg bg-blue-700 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
                                                    >
                                                        Edit
                                                    </Link>
                                                )}
                                                {can('roles.view') && (
                                                    <Link
                                                        href={route('roles.show', id)}
                                                        className="cursor-pointer rounded-lg bg-green-700 px-3 py-2 text-xs font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
                                                    >
                                                        View
                                                    </Link>
                                                )}
                                                {can('roles.delete') && (
                                                    <button
                                                        onClick={() => handleDelete(id)}
                                                        className="cursor-pointer rounded-lg bg-red-700 px-3 py-2 text-xs font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300"
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
            </div>
        </AppLayout>
    );
}