import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Activity, Award, Clock, Target, Users, TrendingUp, TrendingDown } from 'lucide-react';

type KPIs = {
    sleepQuality: number;
    soreness: number;
    energy: number;
    mood: number;
    readiness: number;
    hydration: number;
    totalMembers: number;
};

type TrendData = {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
    }>;
};

type StudentMetric = {
    student_id: number;
    name: string;
    sleepQuality: number;
    soreness: number;
    energy: number;
    mood: number;
    readiness: number;
    hydration: number;
};

type LogSnapshot = {
    wellnessLast7d: number;
    latestWellnessAt: string | null;
};

type Props = {
    team: { id: number; name: string } | null;
    kpis: Partial<KPIs>;
    trends: TrendData;
    studentMetrics: StudentMetric[];
    logSnapshot?: LogSnapshot;
    lastUpdated: string;
    message?: string;
};

const formatPercent = (value: number | string | null | undefined, digits = 1) =>
    Number.parseFloat(String(value ?? 0)).toFixed(digits);

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'KPI Dashboard', href: '/kpi-dashboard' },
    { title: 'Team KPI', href: '#' },
];

const KpiMetricCard = ({
    title,
    value,
    unit = '%',
    icon: Icon,
    trend = 0,
    description,
}: {
    title: string;
    value: number | string;
    unit?: string;
    icon: React.ComponentType<any>;
    trend?: number | string;
    description?: string;
}) => {
    const numValue = Number(value) || 0;
    const numTrend = Number(trend) || 0;
    const isTrendingUp = numTrend > 0;
    const TrendIcon = isTrendingUp ? TrendingUp : TrendingDown;

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1">
                <div className="text-2xl font-bold">
                    {numValue.toFixed(2)}{unit}
                </div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {numTrend !== 0 && (
                    <div className={`flex items-center gap-1 mt-2 text-xs ${isTrendingUp ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendIcon className="h-3 w-3" />
                        <span>{Math.abs(numTrend).toFixed(2)}% vs last week</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default function TeamKpi({ team, kpis, trends, studentMetrics, logSnapshot, lastUpdated, message }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={team ? `Team KPI - ${team.name}` : 'Team KPI'} />
            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {team ? `${team.name} - Team KPI Dashboard` : 'Team KPI Dashboard'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {lastUpdated ? `Last updated: ${new Date(lastUpdated).toLocaleString()}` : 'No data available'}
                    </p>
                    {message && <p className="text-sm text-muted-foreground">{message}</p>}
                </div>

                {logSnapshot && (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="md:col-span-2 lg:col-span-3">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Wellness logs (7d)</CardTitle>
                                <CardDescription>From wellness check-ins</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-2xl font-bold">{logSnapshot.wellnessLast7d}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Latest: {logSnapshot.latestWellnessAt ? new Date(logSnapshot.latestWellnessAt).toLocaleString() : 'No log yet'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}
                {/* Wellness Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <KpiMetricCard title="Sleep Quality" value={kpis.sleepQuality ?? 0} unit="/10" icon={Target} description="Avg last 7d" />
                    <KpiMetricCard title="Soreness" value={kpis.soreness ?? 0} unit="/10" icon={Activity} description="Avg last 7d" />
                    <KpiMetricCard title="Energy" value={kpis.energy ?? 0} unit="/10" icon={TrendingUp} description="Avg last 7d" />
                    <KpiMetricCard title="Mood" value={kpis.mood ?? 0} unit="/10" icon={TrendingDown} description="Avg last 7d" />
                    <KpiMetricCard title="Readiness" value={kpis.readiness ?? 0} unit="/10" icon={Clock} description="Avg last 7d" />
                    <KpiMetricCard title="Hydration" value={kpis.hydration ?? 0} unit="/10" icon={Award} description="Avg last 7d" />
                </div>

                {/* Team Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpis.totalMembers ?? 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Athletes in this team</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Wellness Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sleep Quality Trend (7d)</CardTitle>
                        <CardDescription>Average per day</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {trends.datasets.map((dataset, idx) => (
                                <div key={idx} className="space-y-2">
                                    <h4 className="text-sm font-medium">{dataset.label}</h4>
                                    <div className="flex gap-2 items-end h-24">
                                        {dataset.data.map((value, i) => {
                                            const maxValue = Math.max(...dataset.data);
                                            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                                            return (
                                                <div
                                                    key={i}
                                                    className="flex-1 bg-primary rounded-t"
                                                    style={{ height: `${height}%`, minHeight: '4px' }}
                                                    title={`${trends.labels[i]}: ${value}`}
                                                />
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        {trends.labels.map((label, i) => (
                                            <span key={i}>{label}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Student Wellness Metrics */}
                {studentMetrics.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>Wellness per athlete (avg last 7d)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-4 font-medium">Name</th>
                                            <th className="text-center py-2 px-4 font-medium">Sleep</th>
                                            <th className="text-center py-2 px-4 font-medium">Soreness</th>
                                            <th className="text-center py-2 px-4 font-medium">Energy</th>
                                            <th className="text-center py-2 px-4 font-medium">Mood</th>
                                            <th className="text-center py-2 px-4 font-medium">Readiness</th>
                                            <th className="text-center py-2 px-4 font-medium">Hydration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentMetrics.map((student) => (
                                            <tr key={student.student_id} className="border-b hover:bg-muted/50">
                                                <td className="py-2 px-4 font-medium">{student.name}</td>
                                                <td className="text-center py-2 px-4">{formatPercent(student.sleepQuality, 2)}/10</td>
                                                <td className="text-center py-2 px-4">{formatPercent(student.soreness, 2)}/10</td>
                                                <td className="text-center py-2 px-4">{formatPercent(student.energy, 2)}/10</td>
                                                <td className="text-center py-2 px-4">{formatPercent(student.mood, 2)}/10</td>
                                                <td className="text-center py-2 px-4">{formatPercent(student.readiness, 2)}/10</td>
                                                <td className="text-center py-2 px-4">{formatPercent(student.hydration, 2)}/10</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
