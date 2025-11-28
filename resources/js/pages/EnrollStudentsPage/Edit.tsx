import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AsyncSelect from 'react-select/async';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Edit Enrollment', href: '/student-course-sections' },
];

export default function Edit({
  assignment,
  students,
  courseSections,
}: {
  assignment: {
    id: number;
    student_id: number;
    course_section_id: number;
  };
  students: { id: number; name: string; email: string }[];
  courseSections: {
    id: number;
    term: string;
    course: { title: string };
    section: { code: string };
  }[];
}) {
  const { data, setData, errors, put } = useForm<{
    student_id: number | null;
    course_section_id: number | null;
  }>({
    student_id: assignment.student_id,
    course_section_id: assignment.course_section_id,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    put(route('student-course-sections.update', assignment.id));
  }

  function loadStudentOptions(inputValue: string, callback: (options: any[]) => void) {
    const filtered = students
      .filter((s) =>
        s.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        s.email.toLowerCase().includes(inputValue.toLowerCase())
      )
      .map((s) => ({
        label: `${s.name} (${s.email})`,
        value: s.id,
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
      <Head title="Edit Enrollment" />
      <div className="p-3">
        <div className="p-3">
          {/* Heading */}
          <h1 className="text-2xl font-heading font-semibold text-[#102d4e] mb-4">
            Edit Student Enrollment
          </h1>

          {/* Back Button */}
          <Link
            href={route('student-course-sections.index')}
            className="mb-4 inline-block rounded-lg bg-[#102d4e] px-4 py-2 text-sm font-heading font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
          >
            Back
          </Link>

          <form onSubmit={submit} className="space-y-6 mt-4 max-w-md mx-auto font-sans">
            {/* Student Select */}
            <div className="grid gap-2">
              <label htmlFor="student_id" className="text-sm font-heading text-[#102d4e]">Student:</label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadStudentOptions}
                defaultValue={{
                  label: students.find(s => s.id === assignment.student_id)
                    ? `${students.find(s => s.id === assignment.student_id)?.name} (${students.find(s => s.id === assignment.student_id)?.email})`
                    : '',
                  value: assignment.student_id,
                }}
                onChange={(option) => setData('student_id', option?.value ?? null)}
                placeholder="Search and select student"
              />
              {errors.student_id && (
                <p className="mt-1 text-sm text-red-500">{errors.student_id}</p>
              )}
            </div>

            {/* Course Section Select */}
            <div className="grid gap-2">
              <label htmlFor="course_section_id" className="text-sm font-heading text-[#102d4e]">Course Section:</label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadCourseSectionOptions}
                defaultValue={{
                  label: courseSections.find(cs => cs.id === assignment.course_section_id)
                    ? `${courseSections.find(cs => cs.id === assignment.course_section_id)?.course.title} - ${courseSections.find(cs => cs.id === assignment.course_section_id)?.section.code} (${courseSections.find(cs => cs.id === assignment.course_section_id)?.term})`
                    : '',
                  value: assignment.course_section_id,
                }}
                onChange={(option) => setData('course_section_id', option?.value ?? null)}
                placeholder="Search and select course section"
              />
              {errors.course_section_id && (
                <p className="mt-1 text-sm text-red-500">{errors.course_section_id}</p>
              )}
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