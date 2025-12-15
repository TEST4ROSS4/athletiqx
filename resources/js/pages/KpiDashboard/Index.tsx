import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { TrendingUp, TrendingDown, Activity, Target, Clock, Award } from 'lucide-react';

interface KpiData {
    trainingCompletionRate: number;
    complianceScore: number;
    consistencyIndex: number;
    performanceTrend: number;
    attendanceRate: number;
    averageSessionDuration: number;
    personalRecords: {
        maxWeight: number;
        maxTime: number;
    };
    recoveryMetrics: {
        sleepQuality: number;
        soreness: number;
    };
}

interface TrendData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
    }>;
}

interface ComparisonData {
    current: {
        trainingCompletionRate: number;
        complianceScore: number;
    };
    target: {
        trainingCompletionRate: number;
        complianceScore: number;
    };
    variance: {
        trainingCompletionRate: number;
        complianceScore: number;
    };
}

interface Props {
    student: {
        id: number;
        name: string;
    };
    kpis: KpiData;
    trends: TrendData;
    comparison: ComparisonData;
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

export default function KpiDashboardIndex({ student, kpis, trends, comparison, lastUpdated }: Props) {
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
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">{student.name}'s KPI Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Last updated: {new Date(lastUpdated).toLocaleString()}
                    </p>
                </div>

                {/* Main KPI Metrics Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <KpiMetricCard
                        title="Training Completion Rate"
                        value={kpis.trainingCompletionRate}
                        icon={Target}
                        trend={comparison.variance.trainingCompletionRate}
                        description={`Target: ${comparison.target.trainingCompletionRate}%`}
                    />
                    <KpiMetricCard
                        title="Compliance Score"
                        value={kpis.complianceScore}
                        icon={Award}
                        trend={comparison.variance.complianceScore}
                        description={`Target: ${comparison.target.complianceScore}%`}
                    />
                    <KpiMetricCard
                        title="Consistency Index"
                        value={kpis.consistencyIndex}
                        icon={Activity}
                        description="Weekly consistency"
                    />
                    <KpiMetricCard
                        title="Attendance Rate"
                        value={kpis.attendanceRate}
                        icon={Activity}
                        description="Schedule adherence"
                    />
                    <KpiMetricCard
                        title="Avg Session Duration"
                        value={kpis.averageSessionDuration}
                        unit=" min"
                        icon={Clock}
                        description="Average per session"
                    />
                    <KpiMetricCard
                        title="Performance Trend"
                        value={kpis.performanceTrend}
                        unit="%"
                        icon={TrendingUp}
                        description="Week-over-week change"
                    />
                </div>

                {/* Personal Records & Recovery Metrics */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Records</CardTitle>
                            <CardDescription>Best performance metrics</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Max Weight Lifted</span>
                                <span className="text-2xl font-bold">{kpis.personalRecords.maxWeight} lbs</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Max Duration</span>
                                <span className="text-2xl font-bold">{kpis.personalRecords.maxTime} min</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recovery Metrics</CardTitle>
                            <CardDescription>Wellness indicators</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Sleep Quality</span>
                                <span className="text-2xl font-bold">{kpis.recoveryMetrics.sleepQuality.toFixed(1)}/10</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Soreness Level</span>
                                <span className="text-2xl font-bold">{kpis.recoveryMetrics.soreness.toFixed(1)}/10</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Trends Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>7-Day Trends</CardTitle>
                        <CardDescription>Performance over the last week</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {trends.datasets.map((dataset, idx) => (
                                <div key={idx} className="space-y-2">
                                    <h4 className="text-sm font-medium">{dataset.label}</h4>
                                    <div className="flex gap-2 items-end h-24">
                                        {dataset.data.map((value, i) => {
                                            const maxValue = Math.max(...dataset.data);
                                            const height = (value / maxValue) * 100;
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
