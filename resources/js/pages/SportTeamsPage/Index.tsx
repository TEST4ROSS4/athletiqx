import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown } from 'lucide-react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can';

const breadcrumbs = [{ title: 'Sport Teams', href: '/sport-teams' }];

export default function Index({
    teams,
    sort,
}: {
    teams: any[];
    sort: string;
}) {
    function handleSortToggle() {
        const nextSort = sort === 'alpha' ? 'created' : 'alpha';
        router.get(route('sport-teams.index'), { sort: nextSort }, { preserveState: true });
    }

    function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this team?')) {
            router.delete(route('sport-teams.destroy', id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sport Teams" />
            <div className="p-3">
                <h1 className="mb-4 text-2xl font-bold">Team Management</h1>

                <div className="mb-4 flex items-center gap-2">
                    {can('sport-teams.create') && (
                        <Link
                            href={route('sport-teams.create')}
                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                        >
                            Add Team
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
                                        <span>Team Name</span>
                                        <button
                                            onClick={handleSortToggle}
                                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                            title={`Sort by ${sort === 'alpha' ? 'Order' : 'Alphabetical'}`}
                                        >
                                            <ArrowUpDown className="h-4 w-4" />
                                        </button>
                                    </div>
                                </th>
                                <th className="px-6 py-3">Sport</th>
                                <th className="px-6 py-3">Season</th>
                                <th className="px-6 py-3">Official</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map((team) => (
                                <tr key={team.id} className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2 font-medium">{team.id}</td>
                                    <td className="px-6 py-2">{team.name}</td>
                                    <td className="px-6 py-2">{team.sport?.name || '—'}</td>
                                    <td className="px-6 py-2">{team.season}</td>
                                    <td className="px-6 py-2">{team.is_official ? 'Yes' : 'No'}</td>
                                    <td className="space-x-1 px-6 py-2">
                                        {can('sport-teams.edit') && (
                                            <Link
                                                href={route('sport-teams.edit', team.id)}
                                                className="rounded bg-blue-700 px-3 py-2 text-xs text-white hover:bg-blue-800"
                                            >
                                                Edit
                                            </Link>
                                        )}
                                        {can('sport-teams.view') && (
                                            <Link
                                                href={route('sport-teams.show', team.id)}
                                                className="rounded bg-green-700 px-3 py-2 text-xs text-white hover:bg-green-800"
                                            >
                                                View
                                            </Link>
                                        )}
                                        {can('sport-teams.delete') && (
                                            <button
                                                onClick={() => handleDelete(team.id)}
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