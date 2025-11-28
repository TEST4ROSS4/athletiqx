import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Role } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Edit Role',
        href: '/roles',
    },
];

export default function Edit({
    role,
    permissions,
    rolePermissions,
}: {
    role: Role;
    permissions: { name: string; module: string }[];
    rolePermissions: string[];
}) {
    const { data, setData, errors, put } = useForm<{
        name: string;
        permissions: string[];
    }>({
        name: role.name || '',
        permissions: rolePermissions || [],
    });

    function handleCheckboxSelect(permissionName: string, checked: boolean) {
        if (checked) {
            setData('permissions', [...data.permissions, permissionName]);
        } else {
            setData(
                'permissions',
                data.permissions.filter((name) => name !== permissionName),
            );
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('roles.update', role.id));
    }

    // ✅ Group permissions by prefix (e.g., users, roles, courses)
    const grouped = permissions.reduce((acc, perm) => {
        const [group] = perm.name.split('.');
        acc[group] = acc[group] || [];
        acc[group].push(perm);
        return acc;
    }, {} as Record<string, { name: string; module: string }[]>);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Role" />
            <div className="p-3">
                <div className="p-3">
                    {/* Heading */}
                    <h1 className="mb-4 font-heading text-2xl font-semibold text-[#102d4e]">
                        Edit Role
                    </h1>

                    <Link
                        href={route('roles.index')}
                        className="mb-4 inline-block rounded-lg bg-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Back
                    </Link>

                    <form
                        onSubmit={submit}
                        className="mx-auto mt-4 max-w-md space-y-6 font-sans"
                    >
                        <div className="grid gap-2">
                            <label htmlFor="name" className="font-heading text-sm text-[#102d4e]">
                                Role Name:
                            </label>
                            <input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                name="name"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                placeholder="Enter role name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        <div className="grid gap-4">
                            <label htmlFor="permissions" className="font-heading text-sm text-[#102d4e]">
                                Permissions:
                            </label>

                            {Object.entries(grouped).map(([group, perms]) => (
                                <div key={group}>
                                    <h3 className="mb-2 text-sm font-semibold capitalize text-gray-600">
                                        {group} permissions
                                    </h3>
                                    <div className="space-y-2">
                                        {perms.map((permission) => (
                                            <label
                                                key={`permission-${permission.name}`}
                                                className="flex items-center space-x-2"
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={permission.name}
                                                    id={permission.name}
                                                    checked={data.permissions.includes(permission.name)}
                                                    onChange={(e) =>
                                                        handleCheckboxSelect(
                                                            permission.name,
                                                            e.target.checked,
                                                        )
                                                    }
                                                    className="form-checkbox h-5 w-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                                                />
                                                <span className="text-gray-800 capitalize">
                                                    {permission.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {errors.permissions && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.permissions}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="rounded-md bg-[#102d4e] px-4 py-2 font-heading font-semibold text-white transition hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}