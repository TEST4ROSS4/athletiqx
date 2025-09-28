import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Role } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'View Role',
        href: '/roles',
    },
];

export default function Edit({
    role,
    permissions,
}: {
    role: Role;
    permissions: string[];
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View Role" />
            <div className="p-3">
                <div className="p-3">
                    <h1 className="mb-4 text-2xl font-bold">CRUD App</h1>

                    <Link
                        href={route('roles.index')}
                        className="mb-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                    >
                        Back
                    </Link>

                    <div>
                        <p>
                            <strong>Name: </strong>
                            {role.name}
                        </p>
                        <p>
                            <strong>Permissions: </strong>
                        </p>
                        {permissions.map((permission) =>
                            permission ? (
                                <span
                                    key={permission}
                                    className="mr-1 rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300"
                                >
                                    {permission}
                                </span>
                            ) : null,
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
