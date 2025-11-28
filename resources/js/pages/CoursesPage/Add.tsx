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
                    {/* Heading */}
                    <h1 className="mb-4 font-heading text-2xl font-semibold text-[#102d4e]">
                        Add Course
                    </h1>


                    <Link
                        href={route('courses.index')}
                        className="mb-4 inline-block rounded-lg bg-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Back
                    </Link>

                    <form
                        onSubmit={submit}
                        className="mx-auto mt-4 max-w-md space-y-6 font-sans"
                    >
                        <div className="grid gap-2">
                            <label
                                htmlFor="code"
                                className="font-heading text-sm text-[#102d4e]"
                            >
                                Course Code:
                            </label>
                            <input
                                id="code"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                name="code"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
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
                                className="font-heading text-sm text-[#102d4e]"
                            >
                                Course Title:
                            </label>
                            <input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                name="title"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
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