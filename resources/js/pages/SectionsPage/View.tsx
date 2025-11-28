import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'View Section',
        href: '/sections',
    },
];

export default function Show({
    section,
}: {
    section: {
        id: number;
        code: string;
        program: string;
    };
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View Section" />
            {/* <div className="flex items-center justify-center p-6">
                <div className="w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                    <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Section Details</h1>

                    <div className="space-y-4 text-sm text-gray-700">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Section Code:</span>
                            <span>{section.code}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Program:</span>
                            <span>{section.program}</span>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href={route('sections.index')}
                            className="inline-block rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
                        >
                            Back
                        </Link>
                    </div>
                </div>
            </div> */}
            <div className="p-6">
                <div className="max-w-lg mx-auto space-y-6">
                    {/* Heading */}
                    <h1 className="text-2xl font-heading font-semibold text-[#102d4e]">
                        Section Details
                    </h1>

                    {/* Back Button */}
                    <Link
                        href={route('sections.index')}
                        className="inline-block rounded-lg bg-[#102d4e] px-4 py-2 text-sm font-heading font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Back
                    </Link>

                    {/* User Info Card */}
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-4">
                        <div>
                            <p className="text-sm font-heading text-[#102d4e]">Section Code:</p>
                            <p className="text-base font-sans text-gray-800">{section.code}</p>
                        </div>
                        <div>
                            <p className="text-sm font-heading text-[#102d4e]">Program:</p>
                            <p className="text-base font-sans text-gray-800">{section.program}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}