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
            <div className="p-3">
                <div className="p-3">
                    <h1 className="mb-4 text-2xl font-bold">CRUD App</h1>

                    <Link
                        href={route('schools.index')}
                        className="mb-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                    >
                        Back
                    </Link>

                    <div className="mx-auto mt-4 max-w-md space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">School Name:</label>
                            <p className="mt-1 text-base text-gray-900">{school.name}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">School Code:</label>
                            <p className="mt-1 text-base text-gray-900">{school.code}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address:</label>
                            <p className="mt-1 text-base text-gray-900">{school.address ?? '-'}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status:</label>
                            <span
                                className={`mt-1 inline-block rounded-full px-2 py-1 text-sm font-semibold ${
                                    school.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {school.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}