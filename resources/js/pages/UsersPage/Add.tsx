import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Add User',
        href: '/users',
    },
];

export default function Create({ roles }: { roles: string[] }) {
    const { data, setData, errors, post } = useForm<{
        name: string;
        email: string;
        password: string;
        roles: string[];
    }>({
        name: '',
        email: '',
        password: '',
        roles: [],
    });

    function handleCheckboxSelect(roleName: string, checked: boolean) {
        if (checked) {
            setData('roles', [...data.roles, roleName]);
        } else {
            setData(
                'roles',
                data.roles.filter((name) => name !== roleName),
            );
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('users.store'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add User" />
            <div className="p-3">
                <div className="p-3">
                    <h1 className="mb-4 text-2xl font-bold">CRUD App</h1>

                    <Link
                        href={route('users.index')}
                        className="mb-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                    >
                        Back
                    </Link>

                    <form
                        onSubmit={submit}
                        className="mx-auto mt-4 max-w-md space-y-6"
                    >
                        <div className="grid gap-2">
                            <label
                                htmlFor="name"
                                className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                            >
                                Name:
                            </label>
                            <input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                name="name"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Enter your name"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <label
                                htmlFor="email"
                                className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                            >
                                Email:
                            </label>
                            <input
                                id="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                name="email"
                                type="email"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <label
                                htmlFor="password"
                                className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                            >
                                Password:
                            </label>
                            <input
                                id="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                name="password"
                                type="password"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Enter your password"
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <label
                                htmlFor="roles"
                                className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                            >
                                Roles:
                            </label>
                            {roles.map((role) => (
                                <label
                                    key={`role-${role}`}
                                    className="flex items-center space-x-2"
                                >
                                    <input
                                        type="checkbox"
                                        value={role}
                                        id={role}
                                        onChange={(e) =>
                                            handleCheckboxSelect(
                                                role,
                                                e.target.checked,
                                            )
                                        }
                                        className="form-checkbox h-5 w-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-800 capitalize">
                                        {role}
                                    </span>
                                </label>
                            ))}
                            {errors.roles && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.roles}
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
