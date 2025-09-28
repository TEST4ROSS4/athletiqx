import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Role } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';

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

                    <Link
                        href={route('roles.create')}
                        className="mb-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                    >
                        Add Role
                    </Link>

                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-700">
                            <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        ID
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Permissions
                                    </th>
                                    <th scope="col" className="w-70 px-6 py-3">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map(({ id, name, permissions }) => (
                                    <tr
                                        key={id}
                                        className="border-b border-gray-200 odd:bg-white even:bg-gray-50"
                                    >
                                        <td className="px-6 py-2 font-medium text-gray-900">
                                            {id}
                                        </td>
                                        <td className="px-6 py-2 text-gray-700">
                                            {name}
                                        </td>
                                        <td className="px-6 py-2 text-gray-700">
                                            {permissions.map((permission) =>
                                                permission ? (
                                                    <span
                                                        key={permission.id}
                                                        className="mr-1 rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300"
                                                    >
                                                        {permission.name}
                                                    </span>
                                                ) : null,
                                            )}
                                        </td>
                                        <td className="space-x-1 px-6 py-2">
                                            <Link
                                                href={route('roles.edit', id)}
                                                className="cursor-pointer rounded-lg bg-blue-700 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                                            >
                                                Edit
                                            </Link>
                                            <Link
                                                href={route('roles.show', id)}
                                                className="cursor-pointer rounded-lg bg-green-700 px-3 py-2 text-xs font-medium text-white hover:bg-green-800 focus:ring-4 focus:ring-green-300 focus:outline-none"
                                            >
                                                View
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(id)}
                                                className="cursor-pointer rounded-lg bg-red-700 px-3 py-2 text-xs font-medium text-white hover:bg-red-800 focus:ring-4 focus:ring-red-300 focus:outline-none"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
