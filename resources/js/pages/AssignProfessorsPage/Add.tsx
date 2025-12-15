import AppLayout from '@/layouts/app-layout';
import { FormModal } from '@/components/form-modal';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AsyncSelect from 'react-select/async';

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
        <AppLayout>
            <Head title="Assign Professor" />
            <FormModal
                title="Assign Professor to Course Section"
                backHref={route('professor-course-sections.index')}
            >
                <form
                    onSubmit={submit}
                    className="space-y-6 font-sans"
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
            </FormModal>
        </AppLayout>
    );
}