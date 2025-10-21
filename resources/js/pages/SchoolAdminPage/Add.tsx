import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, School } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Add School Admin',
        href: '/school-admins',
    },
];

export default function Create({ schools }: { schools: School[] }) {
    const { data, setData, errors, post } = useForm<{
        name: string;
        email: string;
        password: string;
        school_id: number | '';
    }>({
        name: '',
        email: '',
        password: '',
        school_id: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('school-admins.store'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add School Admin" />
            <div className="p-3">
                <div className="p-3">
                    <h1 className="mb-4 text-2xl font-bold">Add School Admin</h1>

                    <Link
                        href={route('school-admins.index')}
                        className="mb-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                    >
                        Back
                    </Link>

                    <form onSubmit={submit} className="mx-auto mt-4 max-w-md space-y-6">
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-medium">
                                Name:
                            </label>
                            <input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                name="name"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Enter name"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email:
                            </label>
                            <input
                                id="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                name="email"
                                type="email"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Enter email"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password:
                            </label>
                            <input
                                id="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                name="password"
                                type="password"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Enter password"
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="school_id" className="text-sm font-medium">
                                Select School:
                            </label>
                            <select
                                id="school_id"
                                value={data.school_id}
                                onChange={(e) => setData('school_id', Number(e.target.value))}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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