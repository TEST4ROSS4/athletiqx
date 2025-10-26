import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AsyncSelect from 'react-select/async';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Add Course Section', href: '/course-sections' },
];

export default function Create({
    courses,
    sections,
}: {
    courses: { id: number; title: string }[];
    sections: { id: number; code: string }[];
}) {
    const { data, setData, errors, post } = useForm<{
        course_id: number | '';
        section_id: number | '';
        term: string;
        units: number | '';
    }>({
        course_id: '',
        section_id: '',
        term: '',
        units: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('course-sections.store'));
    }

    function loadCourseOptions(inputValue: string, callback: (options: any[]) => void) {
        const filtered = courses
            .filter((course) => course.title.toLowerCase().includes(inputValue.toLowerCase()))
            .map((course) => ({ label: course.title, value: course.id }));
        callback(filtered);
    }

    function loadSectionOptions(inputValue: string, callback: (options: any[]) => void) {
        const filtered = sections
            .filter((section) => section.code.toLowerCase().includes(inputValue.toLowerCase()))
            .map((section) => ({ label: section.code, value: section.id }));
        callback(filtered);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Course Section" />
            <div className="p-3">
                <h1 className="mb-4 text-2xl font-bold">Add Course Section</h1>

                <Link
                    href={route('course-sections.index')}
                    className="mb-4 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                >
                    Back
                </Link>

                <form onSubmit={submit} className="mx-auto mt-4 max-w-md space-y-6">
                    {/* Course Select */}
                    <div className="grid gap-2">
                        <label htmlFor="course_id" className="text-sm font-medium">Course:</label>
                        <AsyncSelect
                            cacheOptions
                            defaultOptions
                            loadOptions={loadCourseOptions}
                            onChange={(option) => setData('course_id', option?.value || '')}
                            placeholder="Select course"
                        />
                        {errors.course_id && <p className="mt-1 text-sm text-red-500">{errors.course_id}</p>}
                    </div>

                    {/* Section Select */}
                    <div className="grid gap-2">
                        <label htmlFor="section_id" className="text-sm font-medium">Section:</label>
                        <AsyncSelect
                            cacheOptions
                            defaultOptions
                            loadOptions={loadSectionOptions}
                            onChange={(option) => setData('section_id', option?.value || '')}
                            placeholder="Select section"
                        />
                        {errors.section_id && <p className="mt-1 text-sm text-red-500">{errors.section_id}</p>}
                    </div>

                    {/* Term Input */}
                    <div className="grid gap-2">
                        <label htmlFor="term" className="text-sm font-medium">Term:</label>
                        <input
                            id="term"
                            value={data.term}
                            onChange={(e) => setData('term', e.target.value)}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="e.g. 1st Term 2025–2026"
                        />
                        {errors.term && <p className="mt-1 text-sm text-red-500">{errors.term}</p>}
                    </div>

                    {/* Units Input */}
                    <div className="grid gap-2">
                        <label htmlFor="units" className="text-sm font-medium">Units:</label>
                        <input
                            id="units"
                            type="number"
                            min={0}
                            max={10}
                            value={data.units}
                            onChange={(e) => setData('units', e.target.value === '' ? '' : parseInt(e.target.value))}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="e.g. 3"
                        />
                        {errors.units && <p className="mt-1 text-sm text-red-500">{errors.units}</p>}
                    </div>

                    <button
                        type="submit"
                        className="rounded-md bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}