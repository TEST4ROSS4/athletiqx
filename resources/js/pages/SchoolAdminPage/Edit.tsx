import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, School, User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Edit School Admin',
        href: '/school-admins',
    },
];

export default function Edit({ user, schools }: { user: User; schools: School[] }) {
    const { data, setData, errors, put } = useForm<{
        name: string;
        email: string;
        password: string;
        school_id: number | '';
    }>({
        name: user.name ?? '',
        email: user.email ?? '',
        password: '',
        school_id: user.school?.id ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('school-admins.update', user.id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit School Admin" />
            <div className="p-3">
                <div className="p-3">
                    {/* Heading */}
                    <h1 className="mb-4 font-heading text-2xl font-semibold text-[#102d4e]">
                        Edit School Admin
                    </h1>

                    <Link
                        href={route('school-admins.index')}
                        className="mb-4 inline-block rounded-lg bg-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Back
                    </Link>

                    <form onSubmit={submit} className="mx-auto mt-4 max-w-md space-y-6 font-sans">
                        <div className="grid gap-2">
                            <label htmlFor="name" className="font-heading text-sm text-[#102d4e]">
                                Name:
                            </label>
                            <input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                placeholder="Enter name"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="email" className="font-heading text-sm text-[#102d4e]">
                                Email:
                            </label>
                            <input
                                id="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                type="email"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                placeholder="Enter email"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="password" className="font-heading text-sm text-[#102d4e]">
                                Password (leave blank to keep current):
                            </label>
                            <input
                                id="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type="password"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                                placeholder="Enter new password"
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="school_id" className="font-heading text-sm text-[#102d4e]">
                                Select School:
                            </label>
                            <select
                                id="school_id"
                                value={data.school_id}
                                onChange={(e) => setData('school_id', Number(e.target.value))}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            >
                                <option value="">Select a school</option>
                                {schools.map((school) => (
                                    <option key={school.id} value={school.id}>
                                        {school.name}
                                    </option>
                                ))}
                            </select>
                            {errors.school_id && <p className="mt-1 text-sm text-red-500">{errors.school_id}</p>}
                        </div>

                        <button
                            type="submit"
                            className="rounded-md bg-[#102d4e] px-4 py-2 font-heading font-semibold text-white transition hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                        >
                            Update
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}