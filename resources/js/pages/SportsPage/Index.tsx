import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown } from 'lucide-react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can';

const breadcrumbs = [{ title: 'Sports', href: '/sports' }];

export default function Index({
    sports,
    sort,
}: {
    sports: any[];
    sort: string;
}) {
    function handleSortToggle() {
        const nextSort = sort === 'alpha' ? 'created' : 'alpha';
        router.get(route('sports.index'), { sort: nextSort }, { preserveState: true });
    }

    function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this sport?')) {
            router.delete(route('sports.destroy', id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sports" />
            <div className="p-3">
                <h1 className="mb-4 text-2xl font-bold">Sport Management</h1>

                <div className="mb-4 flex items-center gap-2">
                    {can('sports.create') && (
                        <Link
                            href={route('sports.create')}
                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                        >
                            Add Sport
                        </Link>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-700">
                        <thead className="bg-gray-50 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">
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
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Gender</th>
                                <th className="px-6 py-3">Division</th>
                                <th className="px-6 py-3">Active</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sports.map((sport) => (
                                <tr key={sport.id} className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2 font-medium">{sport.id}</td>
                                    <td className="px-6 py-2">{sport.name}</td>
                                    <td className="px-6 py-2">{sport.category || '—'}</td>
                                    <td className="px-6 py-2 capitalize">{sport.gender}</td>
                                    <td className="px-6 py-2 capitalize">{sport.division}</td>
                                    <td className="px-6 py-2">{sport.is_active ? 'Yes' : 'No'}</td>
                                    <td className="space-x-1 px-6 py-2">
                                        {can('sports.edit') && (
                                            <Link
                                                href={route('sports.edit', sport.id)}
                                                className="rounded bg-blue-700 px-3 py-2 text-xs text-white hover:bg-blue-800"
                                            >
                                                Edit
                                            </Link>
                                        )}
                                        {can('sports.view') && (
                                            <Link
                                                href={route('sports.show', sport.id)}
                                                className="rounded bg-green-700 px-3 py-2 text-xs text-white hover:bg-green-800"
                                            >
                                                View
                                            </Link>
                                        )}
                                        {can('sports.delete') && (
                                            <button
                                                onClick={() => handleDelete(sport.id)}
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