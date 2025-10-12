import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown } from 'lucide-react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can'; // assuming you already use this

const breadcrumbs = [{ title: 'Courses', href: '/courses' }];

export default function Index({
    courses,
    sort,
}: {
    courses: any[];
    sort: string;
}) {
    function handleSortToggle() {
        const nextSort = sort === 'alpha' ? 'created' : 'alpha';
        router.get(route('courses.index'), { sort: nextSort }, { preserveState: true });
    }

    function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this course?')) {
            router.delete(route('courses.destroy', id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Courses" />
            <div className="p-3">
                <h1 className="mb-4 text-2xl font-bold">Course Management</h1>

                <div className="mb-4 flex items-center gap-2">
                    {can('courses.create') && (
                        <Link
                            href={route('courses.create')}
                            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                        >
                            Add Course
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
                                        <span>Course Code</span>
                                        <button
                                            onClick={handleSortToggle}
                                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                            title={`Sort by ${sort === 'alpha' ? 'Order' : 'Alphabetical'}`}
                                        >
                                            <ArrowUpDown className="h-4 w-4" />
                                        </button>
                                    </div>
                                </th>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course) => (
                                <tr key={course.id} className="border-b odd:bg-white even:bg-gray-50">
                                    <td className="px-6 py-2 font-medium">{course.id}</td>
                                    <td className="px-6 py-2">{course.code}</td>
                                    <td className="px-6 py-2">{course.title}</td>
                                    <td className="space-x-1 px-6 py-2">
                                        {can('courses.edit') && (
                                            <Link
                                                href={route('courses.edit', course.id)}
                                                className="rounded bg-blue-700 px-3 py-2 text-xs text-white hover:bg-blue-800"
                                            >
                                                Edit
                                            </Link>
                                        )}
                                        {can('courses.view') && (
                                            <Link
                                                href={route('courses.show', course.id)}
                                                className="rounded bg-green-700 px-3 py-2 text-xs text-white hover:bg-green-800"
                                            >
                                                View
                                            </Link>
                                        )}
                                        {can('courses.delete') && (
                                            <button
                                                onClick={() => handleDelete(course.id)}
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