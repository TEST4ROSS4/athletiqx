import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown } from 'lucide-react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can';

const breadcrumbs = [{ title: 'Course Sections', href: '/course-sections' }];

export default function Index({
    courseSections,
    sort,
}: {
    courseSections: any[];
    sort: string;
}) {
    function handleSortToggle() {
        const nextSort = sort === 'alpha' ? 'created' : 'alpha';
        router.get(route('course-sections.index'), { sort: nextSort }, { preserveState: true });
    }

    function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this course section?')) {
            router.delete(route('course-sections.destroy', id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Course Sections" />
            <div className="p-3">
                <h1 className="mb-4 text-2xl font-bold">Course Section Management</h1>

                <div className="mb-4 flex items-center gap-2">
                    {can('course-sections.create') && (
                        <Link
                            href={route('course-sections.create')}
                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                        >
                            Add Course Section
                        </Link>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-700">
                        <thead className="bg-gray-50 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Course</th>
                                <th className="px-6 py-3">Section</th>
                                <th className="px-6 py-3">
                                    <div className="flex items-center gap-1">
                                        <span>Term</span>
                                        <button
                                            onClick={handleSortToggle}
                                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                            title={`Sort by ${sort === 'alpha' ? 'Order' : 'Alphabetical'}`}
                                        >
                                            <ArrowUpDown className="h-4 w-4" />
                                        </button>
                                    </div>
                                </th>
                                <th className="px-6 py-3">Units</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courseSections.map((cs) => (
                                <tr key={cs.id} className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2 font-medium">{cs.id}</td>
                                    <td className="px-6 py-2">{cs.course?.title}</td>
                                    <td className="px-6 py-2">{cs.section?.code}</td>
                                    <td className="px-6 py-2">{cs.term}</td>
                                    <td className="px-6 py-2">{cs.units}</td>
                                    <td className="px-6 py-2 capitalize">{cs.status}</td>
                                    <td className="space-x-1 px-6 py-2">
                                        {can('course-sections.edit') && (
                                            <Link
                                                href={route('course-sections.edit', cs.id)}
                                                className="rounded bg-blue-700 px-3 py-2 text-xs text-white hover:bg-blue-800"
                                            >
                                                Edit
                                            </Link>
                                        )}
                                        {can('course-sections.view') && (
                                            <Link
                                                href={route('course-sections.show', cs.id)}
                                                className="rounded bg-green-700 px-3 py-2 text-xs text-white hover:bg-green-800"
                                            >
                                                View
                                            </Link>
                                        )}
                                        {can('course-sections.delete') && (
                                            <button
                                                onClick={() => handleDelete(cs.id)}
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