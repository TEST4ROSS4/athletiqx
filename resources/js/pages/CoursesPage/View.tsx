import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'View Course', href: '/courses' },
];

export default function View({ course }: { course: { id: number; code: string; title: string } }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View Course" />
            <div className="p-3">
                <div className="p-3 max-w-xl mx-auto bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">Course Details</h1>
                        <Link
                            href={route('courses.index')}
                            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Back
                        </Link>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h2 className="text-sm font-semibold text-gray-600 uppercase">Course Code</h2>
                            <p className="mt-1 text-lg font-medium text-gray-900">{course.code}</p>
                        </div>

                        <div>
                            <h2 className="text-sm font-semibold text-gray-600 uppercase">Course Title</h2>
                            <p className="mt-1 text-lg font-medium text-gray-900">{course.title}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}