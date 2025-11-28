import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Scholarship Status', href: '/scholarships' }];

interface Enrollment {
  id: number;
  course: { title: string; code: string }; // include course code
  section: { code: string };
  final_grade: number | null;
  eligible: boolean;
}

export default function StudentView({
  minGrade,
  studentName,
  enrollments = [],
}: {
  minGrade: number;
  studentName: string;
  enrollments?: Enrollment[];
}) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Scholarship Status" />
      <div className="p-3">
        <h1 className="mb-4 text-2xl font-bold">Scholarship Status</h1>

        {/* Top Info */}
        <div className="mb-6 rounded-lg border bg-white p-6 shadow">
          <p className="mb-2 text-sm text-gray-600">
            Student: <span className="font-semibold">{studentName}</span>
          </p>
          <p className="mb-2 text-sm text-gray-600">
            Minimum Required Grade: <span className="font-semibold">{minGrade}%</span>
          </p>
        </div>

        {/* Enrolled Subjects */}
        <div className="overflow-x-auto rounded-lg border bg-white p-6 shadow">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <th className="px-6 py-3">Course Code</th>
                <th className="px-6 py-3">Subject</th>
                
                <th className="px-6 py-3">Section</th>
                <th className="px-6 py-3">Final Grade (%)</th>
                <th className="px-6 py-3">Eligible?</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment) => (
                <tr key={enrollment.id} className="border-b odd:bg-white even:bg-gray-50">
                  <td className="px-6 py-2">{enrollment.course.code}</td>
                  <td className="px-6 py-2 font-medium">{enrollment.course.title}</td>
                  
                  <td className="px-6 py-2">{enrollment.section.code}</td>
                  <td className="px-6 py-2">{enrollment.final_grade ?? '—'}</td>
                  <td className="px-6 py-2">
                    {enrollment.eligible ? (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">Yes</span>
                    ) : (
                      <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}