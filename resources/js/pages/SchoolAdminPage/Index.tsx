import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'School Admins',
        href: '/school-admins',
    },
];

export default function Index({ users }: { users: User[] }) {
    function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this school admin?')) {
            router.delete(route('school-admins.destroy', id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="School Admins" />
            <div className="p-3">
                <div className="p-3">
                    <h1 className="mb-4 text-2xl font-bold">School Admins</h1>

                    {can('school-admins.create') && (
                        <Link
                            href={route('school-admins.create')}
                            className="mb-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                        >
                            Add School Admin
                        </Link>
                    )}

                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-700">
                            <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">School</th>
                                    <th className="w-70 px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(({ id, name, email, school }) => (
                                    <tr key={id} className="border-b border-gray-200 odd:bg-white even:bg-gray-50">
                                        <td className="px-6 py-2 font-medium text-gray-900">{id}</td>
                                        <td className="px-6 py-2 text-gray-700">{name}</td>
                                        <td className="px-6 py-2 text-gray-700">{email}</td>
                                        <td className="px-6 py-2 text-gray-700">{school?.name ?? '—'}</td>
                                        <td className="space-x-1 px-6 py-2">
                                            {can('school-admins.edit') && (
                                                <Link
                                                    href={route('school-admins.edit', id)}
                                                    className="cursor-pointer rounded-lg bg-blue-700 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                                                >
                                                    Edit
                                                </Link>
                                            )}
                                            {can('school-admins.view') && (
                                                <Link
                                                    href={route('school-admins.show', id)}
                                                    className="cursor-pointer rounded-lg bg-green-700 px-3 py-2 text-xs font-medium text-white hover:bg-green-800 focus:ring-4 focus:ring-green-300 focus:outline-none"
                                                >
                                                    View
                                                </Link>
                                            )}
                                            {can('school-admins.delete') && (
                                                <button
                                                    onClick={() => handleDelete(id)}
                                                    className="cursor-pointer rounded-lg bg-red-700 px-3 py-2 text-xs font-medium text-white hover:bg-red-800 focus:ring-4 focus:ring-red-300 focus:outline-none"
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
        </AppLayout>
    );
}