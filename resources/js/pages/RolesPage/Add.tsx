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
            <div className="p-3">
                <div className="p-3">
                    <h1 className="mb-4 text-2xl font-bold">Add Role</h1>

                    <Link
                        href={route('roles.index')}
                        className="mb-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                    >
                        Back
                    </Link>

                    <form
                        onSubmit={submit}
                        className="mx-auto mt-4 max-w-md space-y-6"
                    >
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Role Name:
                            </label>
                            <input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                name="name"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Enter role name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        <div className="grid gap-4">
                            <label htmlFor="permissions" className="text-sm font-medium">
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
                            className="rounded-md bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}