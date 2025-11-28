import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'View School',
        href: '/schools',
    },
];

export default function View({ school }: { school: any }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View School" />
            <div className="p-6">
                <div className="max-w-lg mx-auto space-y-6">
                    {/* Heading */}
                    <h1 className="text-2xl font-heading font-semibold text-[#102d4e]">
                        School Details
                    </h1>

                    {/* Back Button */}
                    <Link
                        href={route('schools.index')}
                        className="inline-block rounded-lg bg-[#102d4e] px-4 py-2 text-sm font-heading font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Back
                    </Link>

                    {/* User Info Card */}
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-4">
                        <div>
                            <label className="block font-medium text-sm font-heading text-[#102d4e]">School Name:</label>
                            <p className="text-base font-sans text-gray-800">{school.name}</p>
                        </div>

                        <div>
                            <label className="block font-medium text-sm font-heading text-[#102d4e]">School Code:</label>
                            <p className="text-base font-sans text-gray-800">{school.code}</p>
                        </div>

                        <div>
                            <label className="block font-medium text-sm font-heading text-[#102d4e]">Address:</label>
                            <p className="text-base font-sans text-gray-800">{school.address ?? '-'}</p>
                        </div>

                        <div>
                            <label className="block font-medium text-sm font-heading text-[#102d4e]">Status:</label>
                            <span
                                className={`mt-1 inline-block rounded-full px-2 py-1 text-sm font-semibold ${school.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}
                            >
                                {school.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        {/* <div>
                            <p className="text-sm font-heading text-[#102d4e]">Name</p>
                            <p className="text-base font-sans text-gray-800">{user.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-heading text-[#102d4e]">Email</p>
                            <p className="text-base font-sans text-gray-800">{user.email}</p>
                        </div> */}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}