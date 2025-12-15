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
      <div className="p-3">
        <h1 className="mb-4 text-2xl font-bold">Scholarship Eligibility</h1>

        {/* Dropdown of professor’s taughtCourseSections */}
        <div className="mb-4">
          <label htmlFor="courseSection" className="mr-2 font-medium">Select Course Section:</label>
          <select
            id="courseSection"
            value={courseSection ?? ''}
            onChange={handleSectionChange}
            className="rounded border px-2 py-1 text-gray-900 bg-white"
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Final Grade (%)</th>
                  <th className="px-6 py-3">Eligible?</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b odd:bg-white even:bg-gray-50">
                    <td className="px-6 py-2 font-medium">{student.name}</td>
                    <td className="px-6 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={grades[student.id] ?? ''}
                        onChange={(e) => handleInputChange(student.id, e.target.value)}
                        className="w-20 rounded border px-2 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-6 py-2">
                      {student.eligible ? (
                        <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">Yes</span>
                      ) : (
                        <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">No</span>
                      )}
                    </td>
                    <td className="px-6 py-2">
                      <button
                        onClick={() => handleGradeUpdate(student.id)}
                        className="rounded bg-blue-700 px-3 py-2 text-xs text-white hover:bg-blue-800"
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