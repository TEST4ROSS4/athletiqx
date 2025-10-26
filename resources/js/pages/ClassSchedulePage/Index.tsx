import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown } from 'lucide-react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can';

const breadcrumbs = [{ title: 'Class Schedules', href: '/class-schedules' }];

export default function Index({
    schedules,
    sort,
}: {
    schedules: any[];
    sort: string;
}) {
    function handleSortToggle() {
        const nextSort = sort === 'alpha' ? 'created' : 'alpha';
        router.get(route('class-schedules.index'), { sort: nextSort }, { preserveState: true });
    }

    function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this schedule?')) {
            router.delete(route('class-schedules.destroy', id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Class Schedules" />
            <div className="p-3">
                <h1 className="mb-4 text-2xl font-bold">Class Schedule Management</h1>

                <div className="mb-4 flex items-center gap-2">
                    {can('class-schedules.create') && (
                        <Link
                            href={route('class-schedules.create')}
                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                        >
                            Add Schedule
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
                                        <span>Course</span>
                                        <button
                                            onClick={handleSortToggle}
                                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                            title={`Sort by ${sort === 'alpha' ? 'Order' : 'Alphabetical'}`}
                                        >
                                            <ArrowUpDown className="h-4 w-4" />
                                        </button>
                                    </div>
                                </th>
                                <th className="px-6 py-3">Section</th>
                                <th className="px-6 py-3">Days</th>
                                <th className="px-6 py-3">Time</th>
                                <th className="px-6 py-3">Room</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map((s) => (
                                <tr key={s.id} className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2 font-medium">{s.id}</td>
                                    <td className="px-6 py-2">{s.course_section?.course?.title}</td>
                                    <td className="px-6 py-2">{s.course_section?.section?.code}</td>
                                    <td className="px-6 py-2">{s.days}</td>
                                    <td className="px-6 py-2">{s.time}</td>
                                    <td className="px-6 py-2">{s.room}</td>
                                    <td className="space-x-1 px-6 py-2">
                                        {can('class-schedules.edit') && (
                                            <Link
                                                href={route('class-schedules.edit', s.id)}
                                                className="rounded bg-blue-700 px-3 py-2 text-xs text-white hover:bg-blue-800"
                                            >
                                                Edit
                                            </Link>
                                        )}
                                        {can('class-schedules.view') && (
                                            <Link
                                                href={route('class-schedules.show', s.id)}
                                                className="rounded bg-green-700 px-3 py-2 text-xs text-white hover:bg-green-800"
                                            >
                                                View
                                            </Link>
                                        )}
                                        {can('class-schedules.delete') && (
                                            <button
                                                onClick={() => handleDelete(s.id)}
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