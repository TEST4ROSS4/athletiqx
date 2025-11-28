import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AsyncSelect from 'react-select/async';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Edit Course Section', href: '/course-sections' },
];

export default function Edit({
    courseSection,
    courses,
    sections,
}: {
    courseSection: {
        id: number;
        course_id: number;
        section_id: number;
        term: string;
        status: string;
        units: number;
    };
    courses: { id: number; title: string }[];
    sections: { id: number; code: string }[];
}) {
    const { data, setData, errors, put } = useForm<{
        course_id: number | null;
        section_id: number | null;
        term: string;
        status: string;
        units: number | '';
    }>({
        course_id: courseSection.course_id,
        section_id: courseSection.section_id,
        term: courseSection.term,
        status: courseSection.status,
        units: courseSection.units,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(route('course-sections.update', courseSection.id));
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
            <Head title="Edit Course Section" />
            <div className="p-3">
                <div className="p-3">
                    <h1 className="text-2xl font-heading font-semibold text-[#102d4e] mb-4">
                        Edit Course Section
                    </h1>

                    <Link
                        href={route('course-sections.index')}
                        className="mb-4 inline-block rounded-lg bg-[#102d4e] px-4 py-2 text-sm font-heading font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Back
                    </Link>

                    <form onSubmit={submit} className="space-y-6 mt-4 max-w-md mx-auto font-sans">
                        {/* Course Select */}
                        <div className="grid gap-2">
                            <label htmlFor="course_id" className="text-sm font-heading text-[#102d4e]">Course:</label>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                loadOptions={loadCourseOptions}
                                defaultValue={{
                                    label: courses.find(c => c.id === courseSection.course_id)?.title || '',
                                    value: courseSection.course_id,
                                }}
                                onChange={(option) => setData('course_id', option?.value ?? null)}
                                placeholder="Search and select course"
                            />
                            {errors.course_id && <p className="mt-1 text-sm text-red-500">{errors.course_id}</p>}
                        </div>

                        {/* Section Select */}
                        <div className="grid gap-2">
                            <label htmlFor="section_id" className="text-sm font-heading text-[#102d4e]">Section:</label>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                loadOptions={loadSectionOptions}
                                defaultValue={{
                                    label: sections.find(s => s.id === courseSection.section_id)?.code || '',
                                    value: courseSection.section_id,
                                }}
                                onChange={(option) => setData('section_id', option?.value ?? null)}
                                placeholder="Search and select section"
                            />
                            {errors.section_id && <p className="mt-1 text-sm text-red-500">{errors.section_id}</p>}
                        </div>

                        {/* Term Input */}
                        <div className="grid gap-2">
                            <label htmlFor="term" className="text-sm font-heading text-[#102d4e]">Term:</label>
                            <input
                                id="term"
                                value={data.term}
                                onChange={(e) => setData('term', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#102d4e] focus:border-[#102d4e]"
                                placeholder="e.g. 1st Sem 2025–2026"
                            />
                            {errors.term && <p className="mt-1 text-sm text-red-500">{errors.term}</p>}
                        </div>

                        {/* Units Input */}
                        <div className="grid gap-2">
                            <label htmlFor="units" className="text-sm font-heading text-[#102d4e]">Units:</label>
                            <input
                                id="units"
                                type="number"
                                min={0}
                                max={10}
                                value={data.units}
                                onChange={(e) => setData('units', e.target.value === '' ? '' : parseInt(e.target.value))}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#102d4e] focus:border-[#102d4e]"
                                placeholder="e.g. 3"
                            />
                            {errors.units && <p className="mt-1 text-sm text-red-500">{errors.units}</p>}
                        </div>

                        {/* Status Radio Buttons */}
                        <div className="grid gap-2">
                            <label className="text-sm font-heading text-[#102d4e]">Status:</label>
                            <div className="flex gap-4">
                                {['upcoming', 'ongoing', 'completed', 'cancelled'].map((status) => (
                                    <label key={status} className="flex items-center gap-2 text-sm">
                                        <input
                                            type="radio"
                                            name="status"
                                            value={status}
                                            checked={data.status === status}
                                            onChange={() => setData('status', status)}
                                            className="accent-blue-600"
                                        />
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </label>
                                ))}
                            </div>
                            {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
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