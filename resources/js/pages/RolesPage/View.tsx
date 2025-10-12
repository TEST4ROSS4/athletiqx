import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Role } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Roles', href: '/roles' },
    { title: 'View Role', href: '#' },
];

export default function Show({
    role,
    permissions,
}: {
    role: Role;
    permissions: string[];
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`View Role: ${role.name}`} />
            <div className="p-4">
                <h1 className="mb-4 text-2xl font-bold">Role Details</h1>

                <Link
                    href={route('roles.index')}
                    className="mb-4 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                    Back to Roles
                </Link>

                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-4">
                        <p className="text-sm text-gray-500">
                            <strong className="text-gray-700">Name:</strong> {role.name}
                        </p>
                    </div>

                    <div>
                        <p className="mb-2 text-sm text-gray-500">
                            <strong className="text-gray-700">Permissions:</strong>
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {permissions.map((permission) =>
                                permission ? (
                                    <span
                                        key={permission}
                                        className="inline-block rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300"
                                    >
                                        {permission}
                                    </span>
                                ) : null
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}