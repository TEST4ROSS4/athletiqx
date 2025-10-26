import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AsyncSelect from 'react-select/async';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Enroll Student', href: '/student-course-sections' },
];

export default function Add({
  students,
  courseSections,
}: {
  students: { id: number; name: string; email: string }[];
  courseSections: {
    id: number;
    term: string;
    course: { title: string };
    section: { code: string };
  }[];
}) {
  const { data, setData, errors, post } = useForm<{
    student_id: number | null;
    course_section_id: number | null;
  }>({
    student_id: null,
    course_section_id: null,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post(route('student-course-sections.store'));
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
      <Head title="Enroll Student" />
      <div className="p-3">
        <h1 className="mb-4 text-2xl font-bold">Enroll Student in Course Section</h1>

        <Link
          href={route('student-course-sections.index')}
          className="mb-4 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
        >
          Back
        </Link>

        <form onSubmit={submit} className="mx-auto mt-4 max-w-md space-y-6">
          {/* Student Select */}
          <div className="grid gap-2">
            <label htmlFor="student_id" className="text-sm font-medium">Student:</label>
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={loadStudentOptions}
              onChange={(option) => setData('student_id', option?.value ?? null)}
              placeholder="Search and select student"
            />
            {errors.student_id && (
              <p className="mt-1 text-sm text-red-500">{errors.student_id}</p>
            )}
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
            {errors.course_section_id && (
              <p className="mt-1 text-sm text-red-500">{errors.course_section_id}</p>
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
    </AppLayout>
  );
}