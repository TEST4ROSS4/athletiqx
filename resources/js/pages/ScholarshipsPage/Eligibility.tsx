import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Scholarship Eligibility', href: '/scholarships' }];

interface StudentEligibility {
  id: number; // enrollment id
  student_id: number;
  name: string;
  final_grade: number | null;
  eligible: boolean;
}

interface CourseSection {
  id: number;
  course: { title: string };
  section: { code: string };
}

export default function Eligibility({
  students = [],
  courseSections = [],
  courseSection = null,
}: {
  students?: StudentEligibility[];
  courseSections?: CourseSection[];
  courseSection?: number | null;
}) {
  // Track grades locally in state
  const [grades, setGrades] = useState<Record<number, number | null>>({});

  // Initialize state when students change
  useEffect(() => {
    const initialGrades = Object.fromEntries(
      students.map((s) => [s.id, s.final_grade])
    );
    setGrades(initialGrades);
  }, [students]);

  function handleSectionChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const sectionId = e.target.value;
    if (sectionId) {
      router.get(route('scholarships.checkCourse', sectionId));
    }
  }

  function handleInputChange(id: number, value: string) {
    setGrades((prev) => ({
      ...prev,
      [id]: value === '' ? null : parseFloat(value),
    }));
  }

  function handleGradeUpdate(enrollmentId: number) {
    const grade = grades[enrollmentId];
    router.put(
      route('scholarships.updateGrade', enrollmentId),
      { final_grade: grade },
      {
        preserveScroll: true,
        onSuccess: () => {
          // reload the current course section list
          if (courseSection) {
            router.get(route('scholarships.checkCourse', courseSection), {}, { preserveScroll: true });
          }
        },
      }
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Scholarship Eligibility" />
      <div className="p-6 text-gray-900 dark:text-slate-100">
        <h1 className="mb-4 text-2xl font-bold text-[#102d4e] dark:text-slate-100">Scholarship Eligibility</h1>

        {/* Dropdown of professor’s taughtCourseSections */}
        <div className="mb-4">
          <label htmlFor="courseSection" className="mr-2 font-heading text-sm text-[#102d4e] dark:text-slate-100">Select Course Section:</label>
          <select
            id="courseSection"
            value={courseSection ?? ''}
            onChange={handleSectionChange}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 shadow-sm focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">-- Choose Section --</option>
            {courseSections.map((cs) => (
              <option key={cs.id} value={cs.id}>
                {cs.course.title} — {cs.section.code}
              </option>
            ))}
          </select>
        </div>

        {/* List of students with editable grade */}
        {students.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-sm text-gray-700 dark:text-slate-100">
              <thead className="bg-gray-50 text-xs uppercase dark:bg-slate-800 dark:text-slate-200">
                <tr>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Final Grade (%)</th>
                  <th className="px-6 py-3">Eligible?</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 odd:bg-white even:bg-gray-50 dark:border-slate-800 dark:odd:bg-slate-900 dark:even:bg-slate-950">
                    <td className="px-6 py-2 font-medium">{student.name}</td>
                    <td className="px-6 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={grades[student.id] ?? ''}
                        onChange={(e) => handleInputChange(student.id, e.target.value)}
                        className="w-24 rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 shadow-sm focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </td>
                    <td className="px-6 py-2">
                      {student.eligible ? (
                        <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-200">Yes</span>
                      ) : (
                        <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 dark:bg-red-900/40 dark:text-red-200">No</span>
                      )}
                    </td>
                    <td className="px-6 py-2">
                      <button
                        onClick={() => handleGradeUpdate(student.id)}
                        className="rounded bg-[#102d4e] px-3 py-2 text-xs font-heading text-white shadow-sm transition hover:bg-[#0d243d] focus:outline-none focus:ring-2 focus:ring-[#102d4e] dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}