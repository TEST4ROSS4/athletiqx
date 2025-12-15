import AppLayout from '@/layouts/app-layout';
import { FormModal } from '@/components/form-modal';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AsyncSelect from 'react-select/async';

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
        <AppLayout>
            <Head title="Add Course Section" />
            <FormModal title="Add Course Section" backHref={route('course-sections.index')}>
                <form
                    onSubmit={submit}
                    className="space-y-6 font-sans"
                >
                    {/* Course Select */}
                    <div className="grid gap-2">
                        <label
                            htmlFor="course_id"
                            className="font-heading text-sm text-[#102d4e]"
                        >
                            Course:
                        </label>
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
                        <label
                            htmlFor="section_id"
                            className="font-heading text-sm text-[#102d4e]"
                        >
                            Section:
                        </label>
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
                        <label
                            htmlFor="term"
                            className="font-heading text-sm text-[#102d4e]"
                        >
                            Term:
                        </label>
                        <input
                            id="term"
                            value={data.term}
                            onChange={(e) => setData('term', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            placeholder="e.g. 1st Term 2025–2026"
                        />
                        {errors.term && <p className="mt-1 text-sm text-red-500">{errors.term}</p>}
                    </div>

                    {/* Units Input */}
                    <div className="grid gap-2">
                        <label
                            htmlFor="units"
                            className="font-heading text-sm text-[#102d4e]"
                        >
                            Units:
                        </label>
                        <input
                            id="units"
                            type="number"
                            min={0}
                            max={10}
                            value={data.units}
                            onChange={(e) => setData('units', e.target.value === '' ? '' : parseInt(e.target.value))}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                            placeholder="e.g. 3"
                        />
                        {errors.units && <p className="mt-1 text-sm text-red-500">{errors.units}</p>}
                    </div>

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