import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'View School Admin',
        href: '/school-admins',
    },
];

export default function Show({ user }: { user: User }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View School Admin" />
            <div className="flex items-center justify-center p-6">
                <div className="w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-md">
                    <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">School Admin Details</h1>

                    <div className="space-y-4 text-sm text-gray-700">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Name:</span>
                            <span>{user.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">Email:</span>
                            <span>{user.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-600">School:</span>
                            <span>{user.school?.name ?? '—'}</span>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href={route('school-admins.index')}
                            className="inline-block rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
                        >
                            Back
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}