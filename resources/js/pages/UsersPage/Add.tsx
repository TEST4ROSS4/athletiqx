import AppLayout from '@/layouts/app-layout';
import { FormModal } from '@/components/form-modal';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

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
        <AppLayout>
            <Head title="Add User" />
            <FormModal title="Add User" backHref={route('users.index')}>
                <form
                    onSubmit={submit}
                    className="space-y-6 font-sans"
                >
                    {/* Name */}
                    <div className="grid gap-2">
                        <label
                            htmlFor="name"
                            className="font-heading text-sm text-[#102d4e]"
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
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            placeholder="Enter your name"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="grid gap-2">
                        <label
                            htmlFor="email"
                            className="font-heading text-sm text-[#102d4e]"
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
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            placeholder="Enter your email"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="grid gap-2">
                        <label
                            htmlFor="password"
                            className="font-heading text-sm text-[#102d4e]"
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
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            placeholder="Enter your password"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Roles */}
                    <div className="grid gap-2">
                        <label
                            htmlFor="roles"
                            className="font-heading text-sm text-[#102d4e]"
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
                                    className="form-checkbox h-5 w-5 rounded text-[#102d4e] focus:ring-2 focus:ring-[#102d4e]"
                                />
                                <span className="font-sans text-gray-800 capitalize">
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

                    {/* Submit */}
                    <button
                        type="submit"
                        className="rounded-md bg-[#102d4e] px-4 py-2 font-heading font-semibold text-white transition hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Submit
                    </button>
                </form>
            </FormModal>
        </AppLayout>
    );
}
