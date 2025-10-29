import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown } from 'lucide-react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can';

const breadcrumbs = [{ title: 'Coach Assignments', href: '/coach-assignments' }];

export default function Index({
    assignments,
    sort,
}: {
    assignments: any[];
    sort: string;
}) {
    function handleSortToggle() {
        const nextSort = sort === 'alpha' ? 'created' : 'alpha';
        router.get(route('coach-assignments.index'), { sort: nextSort }, { preserveState: true });
    }

    function handleDelete(id: number) {
        if (confirm('Are you sure you want to remove this assignment?')) {
            router.delete(route('coach-assignments.destroy', id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Coach Assignments" />
            <div className="p-3">
                <h1 className="mb-4 text-2xl font-bold">Coach Assignment Management</h1>

                <div className="mb-4 flex items-center gap-2">
                    {can('coach-assignments.create') && (
                        <Link
                            href={route('coach-assignments.create')}
                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                        >
                            Assign Coach
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
                                        <span>Coach</span>
                                        <button
                                            onClick={handleSortToggle}
                                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                            title={`Sort by ${sort === 'alpha' ? 'Order' : 'Alphabetical'}`}
                                        >
                                            <ArrowUpDown className="h-4 w-4" />
                                        </button>
                                    </div>
                                </th>
                                <th className="px-6 py-3">Assigned To</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map((a) => (
                                <tr key={a.id} className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2 font-medium">{a.id}</td>
                                    <td className="px-6 py-2">{a.coach?.name}</td>
                                    <td className="px-6 py-2">
                                        {a.sport?.name
                                            ? `Sport: ${a.sport.name}`
                                            : a.sport_team?.name
                                            ? `Team: ${a.sport_team.name}`
                                            : '—'}
                                    </td>
                                    <td className="space-x-1 px-6 py-2">
                                        {can('coach-assignments.edit') && (
                                            <Link
                                                href={route('coach-assignments.edit', a.id)}
                                                className="rounded bg-blue-700 px-3 py-2 text-xs text-white hover:bg-blue-800"
                                            >
                                                Edit
                                            </Link>
                                        )}
                                        {can('coach-assignments.view') && (
                                            <Link
                                                href={route('coach-assignments.show', a.id)}
                                                className="rounded bg-green-700 px-3 py-2 text-xs text-white hover:bg-green-800"
                                            >
                                                View
                                            </Link>
                                        )}
                                        {can('coach-assignments.delete') && (
                                            <button
                                                onClick={() => handleDelete(a.id)}
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