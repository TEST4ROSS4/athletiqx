import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

type WellnessLog = {
  id: string;
  student_id: string;
  sleep_hours: number;
  sleep_quality: number;
  nutrition_status: string;
  hydration_level: number;
  injury_status: string;
  injury_severity: number;
  mood: number;
  energy_level: number;
  recovery_soreness: number;
  readiness_to_train: number;
  notes: string;
  logged_at: string;
  student?: {
    id: string;
    name: string;
    email: string;
    school?: {
      id: string;
      name: string;
    };
  };
};

type PaginationData = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
};

export default function WellnessLogs({
  logs,
  days,
}: {
  logs: {
    data: WellnessLog[];
    pagination: PaginationData;
  };
  days: number;
}) {
  const [selectedDays, setSelectedDays] = useState(days);

  const getQualityColor = (value: number) => {
    if (value >= 8) return 'text-green-600 bg-green-50';
    if (value >= 6) return 'text-blue-600 bg-blue-50';
    if (value >= 4) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800',
      none: 'bg-green-100 text-green-800',
      minor: 'bg-yellow-100 text-yellow-800',
      moderate: 'bg-orange-100 text-orange-800',
      severe: 'bg-red-100 text-red-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AppLayout>
      <Head title="Wellness Logs - Super Admin" />

      <div className="w-full p-8 space-y-6 bg-white min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#102d4e]">Wellness Logs</h1>
            <p className="text-gray-600 mt-1">Monitor all student wellness data across the platform</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg">
          <label className="text-sm font-medium text-gray-700">Filter by days:</label>
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#102d4e]"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-[#102d4e] text-white">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Student</th>
                <th className="px-6 py-3 text-left font-semibold">School</th>
                <th className="px-6 py-3 text-center font-semibold">Sleep Hours</th>
                <th className="px-6 py-3 text-center font-semibold">Sleep Quality</th>
                <th className="px-6 py-3 text-center font-semibold">Nutrition</th>
                <th className="px-6 py-3 text-center font-semibold">Hydration</th>
                <th className="px-6 py-3 text-center font-semibold">Mood</th>
                <th className="px-6 py-3 text-center font-semibold">Energy</th>
                <th className="px-6 py-3 text-center font-semibold">Soreness</th>
                <th className="px-6 py-3 text-center font-semibold">Readiness</th>
                <th className="px-6 py-3 text-center font-semibold">Injury</th>
                <th className="px-6 py-3 text-left font-semibold">Logged At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.data && logs.data.length > 0 ? (
                logs.data.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-[#102d4e]">
                      {log.student?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {log.student?.school?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                        {log.sleep_hours}h
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getQualityColor(log.sleep_quality)}`}>
                        {log.sleep_quality}/10
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(log.nutrition_status)}`}>
                        {log.nutrition_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getQualityColor(log.hydration_level)}`}>
                        {log.hydration_level}/10
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getQualityColor(log.mood)}`}>
                        {log.mood}/10
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getQualityColor(log.energy_level)}`}>
                        {log.energy_level}/10
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getQualityColor(11 - log.recovery_soreness)}`}>
                        {log.recovery_soreness}/10
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getQualityColor(log.readiness_to_train)}`}>
                        {log.readiness_to_train}/10
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(log.injury_status)}`}>
                        {log.injury_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      {new Date(log.logged_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="px-6 py-8 text-center text-gray-500">
                    No wellness logs found for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        {logs.pagination && (
          <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <span>
              Showing {logs.pagination.from} to {logs.pagination.to} of {logs.pagination.total} entries
            </span>
            <span>
              Page {logs.pagination.current_page} of {logs.pagination.last_page}
            </span>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
