import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Activity, Clock, CheckSquare, Dumbbell, TrendingUp, TrendingDown, Users, Trophy } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface SchoolKpiProps {
    school: {
        id: number;
        name: string;
    };
    kpi: {
        exercise: {
            week: {
                total_logs: number;
                completed_logs: number;
                completion_rate: number;
                proof_logs: number;
                proof_rate: number;
                active_athletes: number;
                session_density: number;
            };
            previous: { completion_rate: number; proof_rate: number; session_density: number };
            daily: { labels: string[]; completion_rate: number[] };
        };
        wellness: {
            week: {
                readiness_avg: number;
                energy_avg: number;
                mood_avg: number;
                soreness_avg: number;
                sleep_hours_avg: number;
                sleep_quality_avg: number;
                hydration_avg: number;
                injury_flags: number;
                active_athletes: number;
            };
            previous: { readiness_avg: number; energy_avg: number; soreness_avg: number };
            daily: { labels: string[]; readiness: number[]; energy: number[]; soreness: number[] };
        };
        recency: { last_log_at?: string | null; days_since_last: number | null };
        window: { current_start: string; current_end: string };
    };
    teamMetrics: Array<{
        team_id: number;
        name: string;
        sleepQuality: number;
        soreness: number;
        energy: number;
        mood: number;
        readiness: number;
        hydration: number;
    }>;
    schools?: Array<{ id: number; name: string }>;
    selectedSchoolId?: number | string | null;
    lastUpdated: string;
}

export default function SchoolKpi({
    school,
    kpi,
    teamMetrics,
    schools = [],
    selectedSchoolId,
    lastUpdated,
}: SchoolKpiProps) {
    const hasSchoolPicker = schools.length > 0;
    const allOption = { id: 'all', name: 'All Schools' };
    const options = hasSchoolPicker ? [allOption, ...schools.map((s) => ({ ...s, id: String(s.id) }))] : [];

    const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        router.get('/kpi-dashboard/school', value === 'all' ? {} : { school_id: value }, { preserveScroll: true });
    };

    // Calculate deltas
    const delta = (current: number, prev: number) =>
        prev === 0 ? (current === 0 ? 0 : 100) : Math.round(((current - prev) / prev) * 100);

    const performanceCards = [
        {
            label: 'Completion Rate',
            value: `${kpi.exercise.week.completion_rate}%`,
            delta: delta(kpi.exercise.week.completion_rate, kpi.exercise.previous.completion_rate),
        },
        {
            label: 'Proof Coverage',
            value: `${kpi.exercise.week.proof_rate}%`,
            delta: delta(kpi.exercise.week.proof_rate, kpi.exercise.previous.proof_rate),
        },
        {
            label: 'Session Density',
            value: `${kpi.exercise.week.session_density} sets/athlete`,
            delta: delta(kpi.exercise.week.session_density, kpi.exercise.previous.session_density),
        },
        {
            label: 'Readiness',
            value: kpi.wellness.week.readiness_avg.toFixed(1),
            delta: delta(kpi.wellness.week.readiness_avg, kpi.wellness.previous.readiness_avg),
        },
        {
            label: 'Energy',
            value: kpi.wellness.week.energy_avg.toFixed(1),
            delta: delta(kpi.wellness.week.energy_avg, kpi.wellness.previous.energy_avg),
        },
        {
            label: 'Soreness',
            value: kpi.wellness.week.soreness_avg.toFixed(1),
            delta: delta(kpi.wellness.week.soreness_avg, kpi.wellness.previous.soreness_avg),
        },
    ];

    const exerciseTrendData = {
        labels: kpi.exercise.daily.labels,
        datasets: [
            {
                label: 'Completion Rate %',
                data: kpi.exercise.daily.completion_rate,
                borderColor: '#3b82f6', // blue-500
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.35,
                fill: true,
                pointRadius: 3,
            },
        ],
    };

    const wellnessTrendData = {
        labels: kpi.wellness.daily.labels,
        datasets: [
            {
                label: 'Readiness',
                data: kpi.wellness.daily.readiness,
                borderColor: '#3b82f6', // blue-500
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                tension: 0.35,
                fill: false,
                pointRadius: 2,
            },
            {
                label: 'Energy',
                data: kpi.wellness.daily.energy,
                borderColor: '#10b981', // green-500
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                tension: 0.35,
                fill: false,
                pointRadius: 2,
            },
            {
                label: 'Soreness',
                data: kpi.wellness.daily.soreness,
                borderColor: '#ef4444', // red-500
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                tension: 0.35,
                fill: false,
                pointRadius: 2,
            },
        ],
    };

    return (
        <AppLayout>
            <Head title={`School KPI - ${school.name}`} />

            <div className="min-h-screen bg-background text-foreground">
                <div className="w-full space-y-8 px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header with Picker */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{school.name}</h1>
                            <p className="text-sm text-muted-foreground">
                                KPI Dashboard • Last updated {new Date(lastUpdated).toLocaleTimeString()}
                            </p>
                        </div>
                        {hasSchoolPicker && (
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-muted-foreground" htmlFor="school-picker">
                                    School:
                                </label>
                                <select
                                    id="school-picker"
                                    className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                                    onChange={handleSchoolChange}
                                    value={selectedSchoolId === null ? 'all' : String(selectedSchoolId ?? 'all')}
                                >
                                    {options.map((opt) => (
                                        <option key={opt.id} value={opt.id}>
                                            {opt.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Main Dashboard Card */}
                    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                        {/* Title Section */}
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                    Weekly School KPIs
                                </p>
                                <h2 className="text-2xl font-bold">Performance & Wellness</h2>
                                <p className="text-sm text-muted-foreground">
                                    Based on exercise logs and wellness logs, week of {kpi.window.current_start} to{' '}
                                    {kpi.window.current_end}
                                </p>
                            </div>
                            <div className="text-xs text-muted-foreground text-right">
                                <p>Last wellness log: {kpi.recency.last_log_at ? new Date(kpi.recency.last_log_at).toLocaleDateString() : '—'}</p>
                                <p>({kpi.recency.days_since_last ?? '—'} days ago)</p>
                            </div>
                        </div>

                        {/* Top Metrics Grid */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {performanceCards.map((card) => (
                                <div
                                    key={card.label}
                                    className="rounded-xl border border-border/40 bg-muted/20 px-5 py-4 transition-colors hover:bg-muted/30"
                                >
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        {card.label}
                                    </p>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-foreground">{card.value}</span>
                                        <span
                                            className={`text-xs font-bold ${
                                                card.delta > 0
                                                    ? 'text-green-500'
                                                    : card.delta < 0
                                                    ? 'text-red-500'
                                                    : 'text-muted-foreground'
                                            }`}
                                        >
                                            {card.delta > 0 ? '+' : ''}
                                            {card.delta}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Charts Section */}
                        <div className="mt-8 grid gap-6 lg:grid-cols-2">
                            {/* Exercise Chart */}
                            <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-semibold text-foreground">
                                            Exercise Completion Trend
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Daily completion rate (%) over the last 7 days
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                                        {kpi.exercise.week.completed_logs} done / {kpi.exercise.week.total_logs} logs
                                    </span>
                                </div>
                                <div className="h-64 w-full">
                                    <Line
                                        data={exerciseTrendData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                x: { grid: { display: false } },
                                                y: {
                                                    beginAtZero: true,
                                                    max: 100,
                                                    grid: { color: 'rgba(229, 231, 235, 0.1)' },
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Wellness Chart */}
                            <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-semibold text-foreground">Wellness Trend</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Readiness, Energy, Soreness (daily averages)
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                        Active Athletes: {kpi.wellness.week.active_athletes}
                                    </span>
                                </div>
                                <div className="h-64 w-full">
                                    <Line
                                        data={wellnessTrendData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            scales: {
                                                x: { grid: { display: false } },
                                                y: {
                                                    beginAtZero: true,
                                                    suggestedMax: 10,
                                                    grid: { color: 'rgba(229, 231, 235, 0.1)' },
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Stats Row */}
                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Sleep
                                    </p>
                                </div>
                                <div className="text-lg font-bold text-foreground">
                                    {kpi.wellness.week.sleep_hours_avg.toFixed(1)} hrs · Quality{' '}
                                    {kpi.wellness.week.sleep_quality_avg.toFixed(1)}/10
                                </div>
                            </div>
                            <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Hydration
                                    </p>
                                </div>
                                <div className="text-lg font-bold text-foreground">
                                    {kpi.wellness.week.hydration_avg.toFixed(1)}/10
                                </div>
                            </div>
                            <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Injury Flags
                                    </p>
                                </div>
                                <div className="text-lg font-bold text-foreground">{kpi.wellness.week.injury_flags}</div>
                            </div>
                        </div>
                    </div>

                    {/* Team Metrics Table */}
                    {teamMetrics.length > 0 && (
                        <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
                            <div className="border-b border-border/60 px-6 py-4">
                                <h3 className="text-lg font-semibold">Team Wellness Breakdown</h3>
                                <p className="text-sm text-muted-foreground">Average metrics per team (last 7d)</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                                        <tr>
                                            <th className="px-6 py-3">Team Name</th>
                                            <th className="px-6 py-3 text-center">Sleep</th>
                                            <th className="px-6 py-3 text-center">Soreness</th>
                                            <th className="px-6 py-3 text-center">Energy</th>
                                            <th className="px-6 py-3 text-center">Mood</th>
                                            <th className="px-6 py-3 text-center">Readiness</th>
                                            <th className="px-6 py-3 text-center">Hydration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {teamMetrics.map((team) => (
                                            <tr key={team.team_id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-3 font-medium text-foreground">{team.name}</td>
                                                <td className="px-6 py-3 text-center">{(team.sleepQuality || 0).toFixed(1)}</td>
                                                <td className="px-6 py-3 text-center">{(team.soreness || 0).toFixed(1)}</td>
                                                <td className="px-6 py-3 text-center">{(team.energy || 0).toFixed(1)}</td>
                                                <td className="px-6 py-3 text-center">{(team.mood || 0).toFixed(1)}</td>
                                                <td className="px-6 py-3 text-center">{(team.readiness || 0).toFixed(1)}</td>
                                                <td className="px-6 py-3 text-center">{(team.hydration || 0).toFixed(1)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
