import AppLayout from '@/layouts/app-layout';
import { FormModal } from '@/components/form-modal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowUpDown } from 'lucide-react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can';
import { useMemo, useState } from 'react';

const breadcrumbs = [{ title: 'Enrollments', href: '/student-course-sections' }];

export default function Index({
  assignments,
  sort,
  students = [],
  courseSections = [],
}: {
  assignments: {
    id: number;
    student: { name: string };
    course_section: {
      course: { id: number; title: string };
      section: { code: string };
      term: string;
      status: string;
    };
  }[];
  sort: string;
  students?: { id: number; name: string }[];
  courseSections?: {
    id: number;
    term: string;
    course: { title: string };
    section: { code: string };
  }[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [courseFilter, setCourseFilter] = useState<string>('');
  const studentOptions = students.map((s) => ({ label: s.name, value: s.id }));
  const courseSectionOptions = courseSections.map((cs) => ({
    label: `${cs.course.title} - ${cs.section.code} (${cs.term})`,
    value: cs.id,
  }));

  const courseFilterOptions = useMemo(() => {
    const uniqueCourses = new Map<number, string>();
    courseSections.forEach((cs) => {
      if (cs.course?.id) {
        uniqueCourses.set(cs.course.id, cs.course.title);
      }
    });
    return Array.from(uniqueCourses.entries()).map(([id, title]) => ({
      label: title,
      value: id,
    }));
  }, [courseSections]);

  const { data, setData, post, reset, processing, errors } = useForm({
    student_id: null as number | null,
    course_section_id: null as number | null,
  });

  const filteredAssignments = useMemo(
    () =>
      assignments.filter((a) =>
        courseFilter ? a.course_section?.course?.id === Number(courseFilter) : true
      ),
    [assignments, courseFilter]
  );

  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage) || 1;
  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post(route('student-course-sections.store'), {
      onSuccess: () => {
        reset();
        setShowModal(false);
      },
    });
  }

  function handleSortToggle() {
    const nextSort = sort === 'alpha' ? 'created' : 'alpha';
    router.get(route('student-course-sections.index'), { sort: nextSort }, { preserveState: true });
  }

  function confirmDelete(id: number) {
    setDeleteId(id);
  }

  function handleDelete() {
    if (deleteId) {
      router.delete(route('student-course-sections.destroy', deleteId));
      setDeleteId(null);
    }
  }


  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Student Enrollment Management" />
      <div className="p-6">
        <div className="space-y-6">
          {/* Heading */}
          <h1 className="font-heading text-2xl font-semibold text-[#102d4e]">
            Student Enrollment Management
          </h1>

          {/* Top Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {can('student-course-sections.create') && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="rounded-lg bg-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                  >
                    Enroll Student
                  </button>
                  <Link
                    href={route('student-course-sections.create')}
                    className="rounded-lg border border-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-[#102d4e] transition hover:bg-[#102d4e] hover:text-white focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                  >
                    Add
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="courseFilter" className="font-heading text-sm text-[#102d4e]">
                Filter by course:
              </label>
              <select
                id="courseFilter"
                value={courseFilter}
                onChange={(e) => {
                  setCourseFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
              >
                <option value="">All courses</option>
                {courseFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full font-sans text-sm text-gray-700">
              <thead className="bg-[#f5f7fa] font-heading text-xs text-[#102d4e] uppercase">
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-1">
                      <span>Student</span>
                      <button
                        onClick={handleSortToggle}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        title={`Sort by ${sort === 'alpha' ? 'Order' : 'Alphabetical'}`}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">Course</th>
                  <th className="px-6 py-4 text-left">Section</th>
                  <th className="px-6 py-4 text-left">Term</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedAssignments.map((a) => (
                  <tr
                    key={a.id}
                    className="transition hover:bg-[#0d243d] hover:text-white"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{a.id}</td>
                    <td className="px-6 py-4">{a.student?.name}</td>
                    <td className="px-6 py-4">{a.course_section?.course?.title}</td>
                    <td className="px-6 py-4">{a.course_section?.section?.code}</td>
                    <td className="px-6 py-4">{a.course_section?.term}</td>
                    <td className="px-6 py-4 capitalize">{a.course_section?.status}</td>
                    <td className="space-x-2 px-6 py-4">
                      {can('student-course-sections.edit') && (
                        <Link
                          href={route('student-course-sections.edit', a.id)}
                          className="inline-flex items-center rounded-md bg-[#102d4e] px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                        >
                          Edit
                        </Link>
                      )}
                      {can('student-course-sections.view') && (
                        <Link
                          href={route('student-course-sections.show', a.id)}
                          className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-none"
                        >
                          View
                        </Link>
                      )}
                      {can('student-course-sections.delete') && (
                        <button
                          onClick={() => confirmDelete(a.id)}
                          className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 font-heading text-xs font-semibold text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:outline-none"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {assignments.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-sans text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <div className="space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm font-heading text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm font-heading text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h2 className="font-heading text-lg font-semibold text-[#102d4e] mb-2">
              Confirm Deletion
            </h2>
            <p className="font-sans text-sm text-gray-700 mb-4">
              Are you sure you want to delete this student? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-md border border-gray-300 px-4 py-2 font-heading text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-md bg-red-600 px-4 py-2 font-heading text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-2 py-6 backdrop-blur-sm">
          <FormModal
            title="Enroll Student in Course Section"
            backHref={route('student-course-sections.index')}
            backLabel="Close"
            onBack={() => {
              reset();
              setShowModal(false);
            }}
          >
            <form onSubmit={submit} className="space-y-6 font-sans">
              <div className="grid gap-2">
                <label htmlFor="student_id" className="font-heading text-sm text-[#102d4e]">
                  Student:
                </label>
                <select
                  id="student_id"
                  value={data.student_id ?? ''}
                  onChange={(e) => setData('student_id', e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                  required
                >
                  <option value="">Select student</option>
                  {studentOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.student_id && <p className="mt-1 text-sm text-red-500">{errors.student_id}</p>}
              </div>

              <div className="grid gap-2">
                <label htmlFor="course_section_id" className="font-heading text-sm text-[#102d4e]">
                  Course Section:
                </label>
                <select
                  id="course_section_id"
                  value={data.course_section_id ?? ''}
                  onChange={(e) => setData('course_section_id', e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                  required
                >
                  <option value="">Select course section</option>
                  {courseSectionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.course_section_id && (
                  <p className="mt-1 text-sm text-red-500">{errors.course_section_id}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="rounded-md bg-[#102d4e] px-4 py-2 font-heading font-semibold text-white transition hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none disabled:opacity-60"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setShowModal(false);
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2 font-heading text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </FormModal>
        </div>
      )}
    </AppLayout>
  );
}