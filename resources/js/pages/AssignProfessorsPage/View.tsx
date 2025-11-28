import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'View Assignment', href: '/professor-course-sections' },
];

export default function Show({
    assignment,
}: {
    assignment: {
        id: number;
        professor: { name: string; email: string };
        course_section: {
            term: string;
            status: string;
            course: { title: string };
            section: { code: string };
        };
    };
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View Assignment" />
            <div className="p-6">
                <div className="max-w-lg mx-auto space-y-6">
                    {/* Heading */}
                    <h1 className="text-2xl font-heading font-semibold text-[#102d4e]">
                        Professor Assignment Details
                    </h1>

                    {/* Back Button */}
                    <Link
                        href={route('professor-course-sections.index')}
                        className="inline-block rounded-lg bg-[#102d4e] px-4 py-2 text-sm font-heading font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Back
                    </Link>

                    {/* Professor Info Card */}
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-4">
                        <div className="flex justify-between">
                            <p className="text-sm font-heading text-[#102d4e]">Professor:</p>
                            <p className="text-base font-sans text-gray-800">{assignment.professor?.name}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-sm font-heading text-[#102d4e]">Email:</p>
                            <p className="text-base font-sans text-gray-800">{assignment.professor?.email}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-sm font-heading text-[#102d4e]">Course:</p>
                            <p className="text-base font-sans text-gray-800">{assignment.course_section?.course?.title}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-sm font-heading text-[#102d4e]">Section:</p>
                            <p className="text-base font-sans text-gray-800">{assignment.course_section?.section?.code}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-sm font-heading text-[#102d4e]">Term:</p>
                            <p className="text-base font-sans text-gray-800">{assignment.course_section?.term}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-sm font-heading text-[#102d4e]">Status:</p>
                            <p className="text-base font-sans text-gray-800 capitalize">{assignment.course_section?.status}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}