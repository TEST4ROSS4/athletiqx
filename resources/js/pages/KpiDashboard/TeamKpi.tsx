import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
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

interface TeamKpiProps {
    team: {
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
    studentMetrics: Array<{
        student_id: number;
        name: string;
        sleepQuality: number;
        soreness: number;
        energy: number;
        mood: number;
        readiness: number;
        hydration: number;
    }>;
    lastUpdated: string;
}

export default function TeamKpi({
    team,
    kpi,
    studentMetrics,
    lastUpdated,
}: TeamKpiProps) {
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
    ];

    const wellnessCards = [
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

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                titleColor: '#f3f4f6',
                bodyColor: '#f3f4f6',
                padding: 10,
                cornerRadius: 8,
                displayColors: true,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(156, 163, 175, 0.1)',
                },
                ticks: {
                    color: '#6b7280',
                    font: { size: 10 },
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#6b7280',
                    font: { size: 10 },
                },
            },
        },
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
    };

    return (
        <AppLayout>
            <Head title={`Team KPI - ${team.name}`} />

            <div className="min-h-screen bg-background text-foreground">
                <div className="w-full space-y-8 px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
                            <p className="text-sm text-muted-foreground">
                                KPI Dashboard • Last updated {new Date(lastUpdated).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>

                    {/* Performance Section */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Metrics Column */}
                        <div className="flex flex-col gap-4 lg:col-span-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Trophy className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-semibold">Performance</h2>
                            </div>
                            
                            {performanceCards.map((card, i) => (
                                <div key={i} className="flex flex-col justify-between rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
                                        {card.delta !== 0 && (
                                            <div className={`flex items-center gap-1 text-xs font-medium ${card.delta > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {card.delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                {Math.abs(card.delta)}%
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-3 text-2xl font-bold tracking-tight">{card.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Chart Column */}
                        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm lg:col-span-2">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">Exercise Trends</h3>
                                    <p className="text-sm text-muted-foreground">Daily completion rate (last 7d)</p>
                                </div>
                            </div>
                            <div className="h-[280px] w-full">
                                <Line data={exerciseTrendData} options={commonOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Wellness Section */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Metrics Column */}
                        <div className="flex flex-col gap-4 lg:col-span-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-semibold">Wellness</h2>
                            </div>
                            
                            {wellnessCards.map((card, i) => (
                                <div key={i} className="flex flex-col justify-between rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
                                        {card.delta !== 0 && (
                                            <div className={`flex items-center gap-1 text-xs font-medium ${card.delta > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {card.delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                {Math.abs(card.delta)}%
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-3 text-2xl font-bold tracking-tight">{card.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Chart Column */}
                        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm lg:col-span-2">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">Wellness Trends</h3>
                                    <p className="text-sm text-muted-foreground">Daily averages (last 7d)</p>
                                </div>
                                <div className="flex gap-4 text-xs">
                                    <div className="flex items-center gap-1">
                                        <div className="h-2 w-2 rounded-full bg-blue-500"></div> Readiness
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div> Energy
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="h-2 w-2 rounded-full bg-red-500"></div> Soreness
                                    </div>
                                </div>
                            </div>
                            <div className="h-[280px] w-full">
                                <Line data={wellnessTrendData} options={commonOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Additional Metrics Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Sleep Quality
                                </p>
                            </div>
                            <div className="text-lg font-bold text-foreground">
                                {kpi.wellness.week.sleep_quality_avg.toFixed(1)}/10
                            </div>
                        </div>
                        <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Mood
                                </p>
                            </div>
                            <div className="text-lg font-bold text-foreground">
                                {kpi.wellness.week.mood_avg.toFixed(1)}/10
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

                    {/* Student Breakdown Table */}
                    {studentMetrics.length > 0 && (
                        <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
                            <div className="border-b border-border/60 px-6 py-4">
                                <h3 className="text-lg font-semibold">Student Wellness Breakdown</h3>
                                <p className="text-sm text-muted-foreground">Average metrics per student (last 7d)</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                                        <tr>
                                            <th className="px-6 py-3">Student Name</th>
                                            <th className="px-6 py-3 text-center">Sleep</th>
                                            <th className="px-6 py-3 text-center">Soreness</th>
                                            <th className="px-6 py-3 text-center">Energy</th>
                                            <th className="px-6 py-3 text-center">Mood</th>
                                            <th className="px-6 py-3 text-center">Readiness</th>
                                            <th className="px-6 py-3 text-center">Hydration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {studentMetrics.map((student) => (
                                            <tr key={student.student_id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-3 font-medium text-foreground">{student.name}</td>
                                                <td className="px-6 py-3 text-center">{(student.sleepQuality || 0).toFixed(1)}</td>
                                                <td className="px-6 py-3 text-center">{(student.soreness || 0).toFixed(1)}</td>
                                                <td className="px-6 py-3 text-center">{(student.energy || 0).toFixed(1)}</td>
                                                <td className="px-6 py-3 text-center">{(student.mood || 0).toFixed(1)}</td>
                                                <td className="px-6 py-3 text-center">{(student.readiness || 0).toFixed(1)}</td>
                                                <td className="px-6 py-3 text-center">{(student.hydration || 0).toFixed(1)}</td>
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
