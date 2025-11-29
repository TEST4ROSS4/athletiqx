import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function SuperAdminDashboard({
  totalSchools,
  recentSchools,
  roleDistribution,
  activeUsersToday,
  activeUsersWeek,
  topActiveSchools,
}: {
  totalSchools: number;
  recentSchools: { name: string; code: string; created_at: string }[];
  roleDistribution: Record<string, number>; // ✅ dynamic roles
  activeUsersToday: number;
  activeUsersWeek: number;
  topActiveSchools: { name: string; logins: number }[];
}) {
  const roleLabels = Object.keys(roleDistribution);
  const roleValues = Object.values(roleDistribution);

  const roleData = {
    labels: roleLabels,
    datasets: [
      {
        data: roleValues,
        backgroundColor: ['#102d4e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'], // extendable palette
      },
    ],
  };

  const topSchoolsData = {
    labels: topActiveSchools.map((s) => s.name),
    datasets: [
      {
        label: 'Logins',
        data: topActiveSchools.map((s) => s.logins),
        backgroundColor: '#102d4e',
      },
    ],
  };

  return (
    <AppLayout>
      <Head title="Super Admin Dashboard" />

      <div className="p-8 space-y-8 bg-white">
        {/* Top Summary */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'Total Schools', value: totalSchools },
            { label: 'Active Users Today', value: activeUsersToday },
            { label: 'Active Users This Week', value: activeUsersWeek },
          ].map((card, idx) => (
            <div
              key={idx}
              className="rounded-lg border-2 border-[#102d4e] bg-white p-6 shadow-md"
            >
              <h2 className="text-sm font-semibold text-[#102d4e]">{card.label}</h2>
              <p className="mt-2 text-3xl font-bold text-[#102d4e]">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Role Distribution */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-[#102d4e]">Role Distribution</h2>
          <div className="h-72">
            <Pie data={roleData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Top Active Schools */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-[#102d4e]">Top Active Schools</h2>
          <div className="h-72">
            <Bar
              data={topSchoolsData}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { beginAtZero: true },
                },
              }}
            />
          </div>
        </div>

        {/* Recently Added Schools */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-[#102d4e]">Recently Added Schools</h2>
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-[#102d4e] text-white">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {recentSchools.map((school, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-4 py-2">{school.name}</td>
                  <td className="px-4 py-2">{school.code}</td>
                  <td className="px-4 py-2">{school.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}