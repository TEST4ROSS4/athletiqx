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
            
            <div className="p-6">
                <div className="max-w-lg mx-auto space-y-6">
                    {/* Heading */}
                    <h1 className="text-2xl font-heading font-semibold text-[#102d4e]">
                        School Admin Details
                    </h1>

                    {/* Back Button */}
                    <Link
                        href={route('school-admins.index')}
                        className="inline-block rounded-lg bg-[#102d4e] px-4 py-2 text-sm font-heading font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Back
                    </Link>

                    {/* User Info Card */}
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 space-y-4">
                        <div>
                            <p className="text-sm font-heading text-[#102d4e]">Name</p>
                            <p className="text-base font-sans text-gray-800">{user.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-heading text-[#102d4e]">Email</p>
                            <p className="text-base font-sans text-gray-800">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-heading text-[#102d4e]">School:</p>
                            <p className="text-base font-sans text-gray-800">{user.school?.name ?? '—'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}