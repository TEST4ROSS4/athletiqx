import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Class Schedules', href: '/class-schedules' },
];

export default function View({
  classSchedule,
}: {
  classSchedule: {
    id: number;
    days: string;
    time: string;
    room: string;
    course_section: {
      term: string;
      status: string;
      course: { title: string };
      section: { code: string };
    };
  };
}) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="View Class Schedule" />
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-lg border border-gray-200 bg-white p-6 shadow-md">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
            Class Schedule Details
          </h1>

          <div className="space-y-4 text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Course:</span>
              <span>{classSchedule.course_section?.course?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Section:</span>
              <span>{classSchedule.course_section?.section?.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Term:</span>
              <span>{classSchedule.course_section?.term}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Status:</span>
              <span className="capitalize">{classSchedule.course_section?.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Days:</span>
              <span>{classSchedule.days}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Time:</span>
              <span>{classSchedule.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Room:</span>
              <span>{classSchedule.room}</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href={route('class-schedules.index')}
              className="inline-block rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Back
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}