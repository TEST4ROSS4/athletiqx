import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Edit Course', href: '/courses' },
];

export default function Edit({ course }: { course: { id: number; code: string; title: string } }) {
    const { data, setData, errors, put } = useForm({
        code: course.code,
        title: course.title,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('courses.update', course.id));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Course" />
            <div className="p-3">
                <div className="p-3">
                    {/* Heading */}
                    <h1 className="text-2xl font-heading font-semibold text-[#102d4e] mb-4">
                        Edit Course
                    </h1>

                    {/* Back Button */}
                    <Link
                        href={route('courses.index')}
                        className="mb-4 inline-block rounded-lg bg-[#102d4e] px-4 py-2 text-sm font-heading font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Back
                    </Link>

                    {/* Form */}
                    <form
                        onSubmit={submit}
                        className="space-y-6 mt-4 max-w-md mx-auto font-sans"
                    >
                        <div className="grid gap-2">
                            <label htmlFor="code" className="text-sm font-heading text-[#102d4e]">Course Code:</label>
                            <input
                                id="code"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#102d4e] focus:border-[#102d4e]"
                                placeholder="Enter your course code"
                            />
                            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                        </div>

                        <div className="grid gap-2">
                            <label
                                htmlFor="title"
                                className="text-sm font-heading text-[#102d4e]"
                            >
                                Course Title:
                            </label>
                            <input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#102d4e] focus:border-[#102d4e]"
                                placeholder="Enter your course title"

                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        <button
                            type="submit"
                            className="bg-[#102d4e] hover:bg-[#0d243d] text-white font-heading font-semibold py-2 px-4 rounded-md transition focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                        >
                            Update
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}