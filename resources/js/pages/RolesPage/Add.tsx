import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Add Role',
        href: '/roles',
    },
];

export default function Create({
    permissions,
}: {
    permissions: { name: string; module: string }[];
}) {
    const { data, setData, errors, post } = useForm<{
        name: string;
        permissions: string[];
    }>({
        name: '',
        permissions: [],
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
        post(route('roles.store'));
    }

    // ✅ Group permissions by module prefix (e.g., users, roles, courses)
    const grouped = permissions.reduce((acc, perm) => {
        const [group] = perm.name.split('.'); // e.g., 'users.create' → 'users'
        acc[group] = acc[group] || [];
        acc[group].push(perm);
        return acc;
    }, {} as Record<string, { name: string; module: string }[]>);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Role" />
            <div className="mx-auto max-w-5xl space-y-6 px-6 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="font-heading text-3xl font-semibold text-[#102d4e]">
                            Add Role
                        </h1>
                        <p className="text-sm text-gray-600">Create a role and assign its permissions.</p>
                    </div>
                    <Link
                        href={route('roles.index')}
                        className="rounded-lg bg-gray-100 px-4 py-2 font-heading text-sm font-semibold text-[#102d4e] shadow-sm transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#102d4e]"
                    >
                        Back
                    </Link>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <form
                        onSubmit={submit}
                        className="grid gap-6 p-6 font-sans"
                    >
                        <div className="grid gap-2">
                            <label htmlFor="name" className="font-heading text-sm text-[#102d4e]">
                                Role Name
                            </label>
                            <input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                name="name"
                                className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                placeholder="e.g. Coach, Admin"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        <div className="grid gap-3">
                            <div className="flex items-center justify-between">
                                <label className="font-heading text-sm text-[#102d4e]">
                                    Permissions
                                </label>
                                {errors.permissions && (
                                    <span className="text-sm text-red-500">{errors.permissions}</span>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {Object.entries(grouped).map(([group, perms]) => (
                                    <div key={group} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                                        <h3 className="mb-3 text-sm font-semibold capitalize text-gray-700">
                                            {group} permissions
                                        </h3>
                                        <div className="space-y-2">
                                            {perms.map((permission) => (
                                                <label
                                                    key={`permission-${permission.name}`}
                                                    className="flex items-start gap-2 rounded-md bg-white px-3 py-2 shadow-sm ring-1 ring-gray-100"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        value={permission.name}
                                                        id={permission.name}
                                                        onChange={(e) =>
                                                            handleCheckboxSelect(
                                                                permission.name,
                                                                e.target.checked,
                                                            )
                                                        }
                                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-[#102d4e] focus:ring-[#102d4e]"
                                                    />
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-800">
                                                            {permission.name}
                                                        </span>
                                                        <p className="text-xs text-gray-500">
                                                            Module: {permission.module}
                                                        </p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="rounded-lg bg-[#102d4e] px-6 py-2.5 font-heading text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d243d] focus:outline-none focus:ring-2 focus:ring-[#102d4e]"
                            >
                                Save Role
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}