import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Users } from 'lucide-react';
import { route } from 'ziggy-js';

interface Program {
    id: number;
    name: string;
    exercises_count: number;
    assignments_count: number;
}

interface Props {
    programs: Program[];
    summary: {
        total: number;
        assigned: number;
        unassigned: number;
        latest_created: string | null;
        latest_created_at: string | null;
    };
}

export default function Landing({ programs, summary }: Props) {
    const hasPrograms = programs.length > 0;

    return (
        <AppLayout>
            <Head title="Training Programs Hub" />

            <div className="space-y-8 p-4">
                {/* Header */}
                <h1 className="flex items-center gap-2 text-3xl font-bold sm:text-4xl">
                    🏋️ Training Programs Hub
                </h1>

                <div className="flex flex-col gap-4 sm:flex-row">
                    <Link href={route('programs.create')}>
                        <Button className="flex items-center gap-2">
                            <PlusCircle size={18} />
                            Create New Program
                        </Button>
                    </Link>
                    <Link href={route('programs.index')}>
                        <Button
                            variant="secondary"
                            className="flex items-center gap-2"
                        >
                            <Users size={18} />
                            Assign Program
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <div className="rounded-lg border bg-muted/50 p-4 text-center shadow-sm">
                        <p className="text-lg font-semibold">{summary.total}</p>
                        <p className="text-sm text-muted-foreground">
                            Total Programs
                        </p>
                    </div>
                    <div className="rounded-lg border bg-green-50 p-4 text-center shadow-sm">
                        <p className="text-lg font-semibold">
                            {summary.assigned}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Assigned
                        </p>
                    </div>
                    <div className="rounded-lg border bg-red-50 p-4 text-center shadow-sm">
                        <p className="text-lg font-semibold">
                            {summary.unassigned}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Unassigned
                        </p>
                    </div>
                    {summary.latest_created && (
                        <div className="rounded-lg border bg-blue-50 p-4 text-center shadow-sm">
                            <p className="text-sm font-medium text-blue-700">
                                Last Created Program
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                                {summary.latest_created}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(
                                    summary.latest_created_at!,
                                ).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </p>
                            
                        </div>
                    )}
                </div>

                {/* Recently Updated Programs */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-xl font-semibold">
                            🕓 Recently Updated Programs
                        </h2>
                        {hasPrograms && (
                            <Link href={route('programs.index')}>
                                <Button variant="outline" size="sm">
                                    🔍 View All
                                </Button>
                            </Link>
                        )}
                    </div>

                    {!hasPrograms ? (
                        <p className="text-muted-foreground">
                            No recent programs found.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                            {programs.map((program) => (
                                <Link
                                    key={program.id}
                                    href={route('programs.show', program.id)}
                                >
                                    <Card className="cursor-pointer transition hover:shadow-lg hover:ring-2 hover:ring-primary">
                                        <CardHeader>
                                            <CardTitle className="truncate">
                                                {program.name}
                                            </CardTitle>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                • {program.exercises_count}{' '}
                                                {program.exercises_count === 1
                                                    ? 'Exercise'
                                                    : 'Exercises'}
                                                <br />•{' '}
                                                {program.assignments_count > 0
                                                    ? `Assigned to ${program.assignments_count} ${program.assignments_count === 1 ? 'Team/Individual' : 'Teams/Individuals'}`
                                                    : 'Unassigned'}
                                            </p>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {!hasPrograms && (
                    <div className="mt-6 text-center">
                        <Link href={route('programs.index')}>
                            <Button size="lg" className="text-lg">
                                🔍 View All Programs
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
