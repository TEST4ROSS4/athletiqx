import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Add Course',
        href: '/courses',
    },
];

export default function Create() {
    const { data, setData, errors, post } = useForm<{
        code: string;
        title: string;
    }>({
        code: '',
        title: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('courses.store'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Course" />
            <div className="p-3">
                <div className="p-3">
                    <h1 className="mb-4 text-2xl font-bold">CRUD App</h1>

                    <Link
                        href={route('courses.index')}
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
                                htmlFor="code"
                                className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                            >
                                Course Code:
                            </label>
                            <input
                                id="code"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                name="code"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Enter course code"
                            />
                            {errors.code && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.code}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <label
                                htmlFor="title"
                                className="text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                            >
                                Course Title:
                            </label>
                            <input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                name="title"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Enter course title"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.title}
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