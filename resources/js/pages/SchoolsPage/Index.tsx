import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can'; // assuming this is your permission helper

const breadcrumbs = [{ title: 'Schools', href: '/schools' }];

export default function Index({ schools }: { schools: any[] }) {
    function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this school?')) {
            router.delete(route('schools.destroy', id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Schools" />
            <div className="p-3">
                <h1 className="mb-4 text-2xl font-bold">School Management</h1>

                <div className="mb-4 flex items-center gap-2">
                    {can('schools.create') && (
                        <Link
                            href={route('schools.create')}
                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                        >
                            Add School
                        </Link>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-700">
                        <thead className="bg-gray-50 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Code</th>
                                <th className="px-6 py-3">Address</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schools.map((school) => (
                                <tr key={school.id} className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2 font-medium">{school.id}</td>
                                    <td className="px-6 py-2">{school.name}</td>
                                    <td className="px-6 py-2">{school.code}</td>
                                    <td className="px-6 py-2">{school.address ?? '-'}</td>
                                    <td className="px-6 py-2">
                                        <span
                                            className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                                                school.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {school.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="space-x-1 px-6 py-2">
                                        {can('schools.edit') && (
                                            <Link
                                                href={route('schools.edit', school.id)}
                                                className="rounded bg-blue-700 px-3 py-2 text-xs text-white hover:bg-blue-800"
                                            >
                                                Edit
                                            </Link>
                                        )}
                                        {can('schools.view') && (
                                            <Link
                                                href={route('schools.show', school.id)}
                                                className="rounded bg-green-700 px-3 py-2 text-xs text-white hover:bg-green-800"
                                            >
                                                View
                                            </Link>
                                        )}
                                        {can('schools.delete') && (
                                            <button
                                                onClick={() => handleDelete(school.id)}
                                                className="rounded bg-red-700 px-3 py-2 text-xs text-white hover:bg-red-800 focus:ring-4 focus:ring-red-300 focus:outline-none"
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
        </AppLayout>
    );
}