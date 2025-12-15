import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Activity, Bell, Dumbbell, Users } from 'lucide-react';

type TeamItem = { id: number; name: string; athletes: number };
type NewsItem = { id: number; title: string; created_at: string; is_global: boolean; author: string };
type ProgramSummary = {
  total: number;
  assigned: number;
  unassigned: number;
  recent: { id: number; name: string; updated_at: string; assignments_count?: number }[];
};

export default function CoachDashboard({
  schoolName,
  totalTeams,
  totalAthletes,
  teamActivityWeek,
  teams,
  recentNews,
  programSummary,
}: {
  schoolName: string;
  totalTeams: number;
  totalAthletes: number;
  teamActivityWeek: number;
  teams: TeamItem[];
  recentNews: NewsItem[];
  programSummary: ProgramSummary;
}) {
  const summaryCards = [
    { label: 'Teams', value: totalTeams, icon: Dumbbell },
    { label: 'Athletes', value: totalAthletes, icon: Users },
    { label: 'Updates This Week', value: teamActivityWeek, icon: Activity },
  ];

  return (
    <AppLayout>
      <Head title="Coach Dashboard" />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 text-foreground">
        <div className="w-full space-y-8 px-4 py-10 sm:px-6 lg:px-10">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Team Oversight
              </p>
              <h1 className="text-3xl font-bold">{schoolName} — Coach Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Monitor your assigned teams, athlete counts, and recent announcements.
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
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Training Programs</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage plans you create and assign to athletes.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={route('programs.create')}
                    className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                  >
                    New Program
                  </Link>
                  <Link
                    href={route('programs.index')}
                    className="rounded-lg border border-border/60 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/60"
                  >
                    View All
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total', value: programSummary.total },
                  { label: 'Assigned', value: programSummary.assigned },
                  { label: 'Unassigned', value: programSummary.unassigned },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-center"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="text-xl font-bold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground">
                  <span>Recent updates</span>
                  <span className="text-xs uppercase tracking-wide">Last 3</span>
                </div>
                {programSummary.recent.length === 0 ? (
                  <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                    No programs yet. Create your first plan.
                  </div>
                ) : (
                  <div className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border/60">
                    {programSummary.recent.map((prog) => (
                      <Link
                        key={prog.id}
                        href={route('programs.show', prog.id)}
                        className="flex items-center justify-between bg-card px-4 py-3 text-sm hover:bg-muted/30"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{prog.name}</span>
                          <span className="text-xs text-muted-foreground">
                            Updated {new Date(prog.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {prog.assignments_count ?? 0} assigned
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">Assigned Teams</h2>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {totalTeams} total
                </span>
              </div>
              {teams.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-10 text-sm text-muted-foreground">
                  No teams assigned yet.
                </div>
              ) : (
                <div className="grid gap-3">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm text-foreground"
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {team.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="font-medium">{team.name}</span>
                      </div>
                      <span className="text-muted-foreground">{team.athletes} athletes</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-primary">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Recent News</h2>
                    <p className="text-sm text-muted-foreground">Latest posts relevant to your teams.</p>
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
      </div>
    </AppLayout>
  );
}
