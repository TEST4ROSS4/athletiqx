import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { TrendingUp, TrendingDown, Activity, Target, Clock, Award } from 'lucide-react';

interface KpiData {
    sleepQuality: number;
    soreness: number;
    energy: number;
    mood: number;
    readiness: number;
    hydration: number;
}

interface TrendData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
    }>;
}

interface LogSnapshot {
    wellnessLast7d: number;
    latestWellnessAt: string | null;
}

interface Props {
    student: {
        id: number;
        name: string;
    };
    kpis: KpiData;
    trends: TrendData;
    logSnapshot: LogSnapshot;
    lastUpdated: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'KPI Dashboard',
        href: '#',
    },
];

const KpiMetricCard = ({ 
    title, 
    value, 
    unit = '%', 
    icon: Icon, 
    trend = 0,
    description 
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

export default function KpiDashboardIndex({ student, kpis, trends, logSnapshot, lastUpdated }: Props) {
    if (!student) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="KPI Dashboard" />
                <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">KPI Dashboard</h1>
                        <p className="text-sm text-muted-foreground">
                            No students found in your school.
                        </p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`KPI Dashboard - ${student.name}`} />
            <div className="flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header + live snapshot */}
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight">{student.name}'s KPI Dashboard</h1>
                        <p className="text-sm text-muted-foreground">
                            Last updated: {new Date(lastUpdated).toLocaleString()}
                        </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Wellness logs (7d)</CardTitle>
                                <CardDescription>Daily check-ins</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-2xl font-bold">{logSnapshot.wellnessLast7d}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Latest: {logSnapshot.latestWellnessAt ? new Date(logSnapshot.latestWellnessAt).toLocaleString() : 'No log yet'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Wellness Metrics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <KpiMetricCard title="Sleep Quality" value={kpis.sleepQuality} unit="/10" icon={Target} description="Avg last 7d" />
                    <KpiMetricCard title="Soreness" value={kpis.soreness} unit="/10" icon={Activity} description="Avg last 7d" />
                    <KpiMetricCard title="Energy" value={kpis.energy} unit="/10" icon={TrendingUp} description="Avg last 7d" />
                    <KpiMetricCard title="Mood" value={kpis.mood} unit="/10" icon={TrendingDown} description="Avg last 7d" />
                    <KpiMetricCard title="Readiness" value={kpis.readiness} unit="/10" icon={Clock} description="Avg last 7d" />
                    <KpiMetricCard title="Hydration" value={kpis.hydration} unit="/10" icon={Award} description="Avg last 7d" />
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
            </div>
        </AppLayout>
    );
}
