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
                <div className="p-3">
                    {/* Heading */}
                    <h1 className="mb-4 font-heading text-2xl font-semibold text-[#102d4e]">
                        Assign Professor to Course Section
                    </h1>

                    <Link
                        href={route('professor-course-sections.index')}
                        className="mb-4 inline-block rounded-lg bg-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    >
                        Back
                    </Link>

                    <form
                        onSubmit={submit}
                        className="mx-auto mt-4 max-w-md space-y-6 font-sans"
                    >
                        {/* Professor Select */}
                        <div className="grid gap-2">
                            <label htmlFor="professor_id" className="font-heading text-sm text-[#102d4e]">Professor:</label>
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
                            <label htmlFor="course_section_id" className="font-heading text-sm text-[#102d4e]">Course Section:</label>
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