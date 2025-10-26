import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AsyncSelect from 'react-select/async';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Assign Professor', href: '/professor-course-sections' },
];

export default function Create({
    professors,
    courseSections,
}: {
    professors: { id: number; name: string; email: string }[];
    courseSections: {
        id: number;
        term: string;
        course: { title: string };
        section: { code: string };
    }[];
}) {
    const { data, setData, errors, post } = useForm<{
        professor_id: number | null;
        course_section_id: number | null;
    }>({
        professor_id: null,
        course_section_id: null,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('professor-course-sections.store'));
    }

    function loadProfessorOptions(inputValue: string, callback: (options: any[]) => void) {
        const filtered = professors
            .filter((p) =>
                p.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                p.email.toLowerCase().includes(inputValue.toLowerCase())
            )
            .map((p) => ({
                label: `${p.name} (${p.email})`,
                value: p.id,
            }));
        callback(filtered);
    }

    function loadCourseSectionOptions(inputValue: string, callback: (options: any[]) => void) {
        const filtered = courseSections
            .filter((cs) =>
                cs.course.title.toLowerCase().includes(inputValue.toLowerCase()) ||
                cs.section.code.toLowerCase().includes(inputValue.toLowerCase()) ||
                cs.term.toLowerCase().includes(inputValue.toLowerCase())
            )
            .map((cs) => ({
                label: `${cs.course.title} - ${cs.section.code} (${cs.term})`,
                value: cs.id,
            }));
        callback(filtered);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assign Professor" />
            <div className="p-3">
                <h1 className="mb-4 text-2xl font-bold">Assign Professor to Course Section</h1>

                <Link
                    href={route('professor-course-sections.index')}
                    className="mb-4 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                >
                    Back
                </Link>

                <form onSubmit={submit} className="mx-auto mt-4 max-w-md space-y-6">
                    {/* Professor Select */}
                    <div className="grid gap-2">
                        <label htmlFor="professor_id" className="text-sm font-medium">Professor:</label>
                        <AsyncSelect
                            cacheOptions
                            defaultOptions
                            loadOptions={loadProfessorOptions}
                            onChange={(option) => setData('professor_id', option?.value ?? null)}
                            placeholder="Search and select professor"
                        />
                        {errors.professor_id && <p className="mt-1 text-sm text-red-500">{errors.professor_id}</p>}
                    </div>

                    {/* Course Section Select */}
                    <div className="grid gap-2">
                        <label htmlFor="course_section_id" className="text-sm font-medium">Course Section:</label>
                        <AsyncSelect
                            cacheOptions
                            defaultOptions
                            loadOptions={loadCourseSectionOptions}
                            onChange={(option) => setData('course_section_id', option?.value ?? null)}
                            placeholder="Search and select course section"
                        />
                        {errors.course_section_id && <p className="mt-1 text-sm text-red-500">{errors.course_section_id}</p>}
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