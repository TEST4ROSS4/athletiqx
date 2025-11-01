import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { can } from '@/lib/can';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  groupedTeams: Record<
    string,
    {
      id: number;
      name: string;
      season: string;
      is_official: boolean;
      sport_id: number;
      school_id: number;
    }[]
  >;
}

export default function Landing({ groupedTeams }: Props) {
  return (
    <AppLayout>
      <Head title="Team Members" />

      <div className="p-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Team Members</h1>
          {can('student-sport-teams.view') && (
            <Link href={route('student-sport-teams.landing')}>
              <Button variant="outline">View All</Button>
            </Link>
          )}
        </div>

        <div className="space-y-8">
          {Object.entries(groupedTeams).map(([sportName, teams]) => (
            <div key={sportName}>
              <h2 className="mb-4 text-lg font-semibold">{sportName}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {teams.map((team) => (
                  <Link key={team.id} href={route('student-sport-teams.index', team.id)}>
                    <Card className="hover:shadow-md transition">
                      <CardHeader>
                        <CardTitle>{team.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{team.season}</p>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}