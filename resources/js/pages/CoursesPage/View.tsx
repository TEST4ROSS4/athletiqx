import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'View Course', href: '/courses' },
];

export default function View({
    course,
}: {
    course: {
        id: number;
        code: string;
        title: string;
    };
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View Course" />
            <div className="p-6">
                <div className="max-w-lg mx-auto space-y-6">
                    {/* Heading */}
                    <h1 className="text-2xl font-heading font-semibold text-[#102d4e]">
                        Course Details
                    </h1>

                    {/* Back Button */}
                    <Link
                        href={route('courses.index')}
                        className="inline-block rounded-lg bg-[#102d4e] px-4 py-2 text-sm font-heading font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Back
                    </Link>

                    {/* Course Info Card */}
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-4">
                        <div>
                            <p className="text-sm font-heading text-[#102d4e]">Course Code:</p>
                            <p className="text-base font-sans text-gray-800">{course.code}</p>
                        </div>
                        <div>
                            <p className="text-sm font-heading text-[#102d4e]">Course Title:</p>
                            <p className="text-base font-sans text-gray-800">{course.title}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}