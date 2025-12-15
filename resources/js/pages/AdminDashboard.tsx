import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Activity, Bell, Clock3, Users } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

type RoleDistribution = Record<string, number>;
type RecentNews = { id: number; title: string; created_at: string; is_global: boolean; author: string };

export default function AdminDashboard({
  schoolName,
  totalUsers,
  activeUsersToday,
  activeUsersWeek,
  roleDistribution,
  recentNews,
}: {
  schoolName: string;
  totalUsers: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  roleDistribution: RoleDistribution;
  recentNews: RecentNews[];
}) {
  const roleLabels = Object.keys(roleDistribution);
  const roleValues = Object.values(roleDistribution);
  const weeklyEngagement =
    totalUsers === 0 ? 0 : Math.round((activeUsersWeek / totalUsers) * 100);

  const palette = ['#0f1c3f', '#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ef4444'];

  const roleData = {
    labels: roleLabels,
    datasets: [
      {
        data: roleValues,
        backgroundColor: roleLabels.map((_, idx) => palette[idx % palette.length]),
      },
    ],
  };

  const summaryCards = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Users,
    },
    {
      label: 'Active Today',
      value: activeUsersToday,
      icon: Clock3,
    },
    {
      label: 'Active This Week',
      value: activeUsersWeek,
      icon: Activity,
    },
  ];

  return (
    <AppLayout>
      <Head title="Admin Dashboard" />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 text-foreground">
        <div className="w-full space-y-8 px-4 py-10 sm:px-6 lg:px-10">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                School Overview
              </p>
              <h1 className="text-3xl font-bold">{schoolName} — Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Monitor your school’s users, activity, and latest announcements.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-5 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary">
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Role Distribution</h2>
                  <p className="text-sm text-muted-foreground">
                    Current user mix by role within your school.
                  </p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                  {totalUsers} users
                </span>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="h-64">
                  <Pie data={roleData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
                <div className="space-y-3">
                  {roleLabels.length === 0 && (
                    <p className="text-sm text-muted-foreground">No roles available yet.</p>
                  )}
                  {roleLabels.map((role, idx) => (
                    <div
                      key={role}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-foreground"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: palette[idx % palette.length] }}
                        />
                        <span className="font-medium text-foreground">{role}</span>
                      </div>
                      <span className="text-muted-foreground">{roleDistribution[role]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Engagement This Week</h2>
                  <p className="text-sm text-muted-foreground">
                    Snapshot of overall user activity in your school.
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {weeklyEngagement}% active
                </span>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-foreground">
                  <span className="font-medium">Active today</span>
                  <span className="text-foreground">{activeUsersToday}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-foreground">
                  <span className="font-medium">Active this week</span>
                  <span className="text-foreground">{activeUsersWeek}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Activity is based on user updates within your school.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-primary">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Recent News</h2>
                  <p className="text-sm text-muted-foreground">
                    Latest announcements shared with your school.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Last 5 posts
              </span>
            </div>
            {recentNews.length === 0 ? (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-10 text-sm text-muted-foreground">
                No news posts yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border/60">
                <table className="w-full text-sm text-left text-foreground">
                  <thead className="bg-muted text-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Title</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Author</th>
                      <th className="px-4 py-3 font-semibold">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-card">
                    {recentNews.map((post) => (
                      <tr key={post.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium text-foreground">{post.title}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {post.is_global ? 'Global' : 'School'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{post.author}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(post.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
