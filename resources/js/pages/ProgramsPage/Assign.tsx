import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useCallback, useEffect, useState } from 'react';
import { route } from 'ziggy-js';

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

type TeamOption = { id: number; name: string; sport?: string };
type StudentOption = { id: number; name: string; team?: string };

interface Props {
  program: { id: number; name: string };
  teams: TeamOption[];
  assignedStudents: StudentOption[];
}

export default function Assign({ program, assignedStudents: initialAssigned }: Props) {
  const { auth } = usePage().props as {
    auth?: { user?: { roles?: string[] } };
  };

  const isCoach = Array.isArray(auth?.user?.roles) && auth.user.roles.includes('Coach');
  const defaultType: 'team' | 'individual' = isCoach ? 'individual' : 'team';

  const isEdit = initialAssigned.length > 0;

  const { data, setData, post, put, processing, errors } = useForm({
    type: defaultType,
    team_ids: [] as number[],
    student_ids: [] as number[],
    excluded_student_ids: [] as number[],
    notes: '',
    clear_all: false,
  });

  const [selectedTeams, setSelectedTeams] = useState<TeamOption[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<StudentOption[]>(initialAssigned);
  const [excludedStudentIds, setExcludedStudentIds] = useState<number[]>([]);

  const [teamQuery, setTeamQuery] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [teamResults, setTeamResults] = useState<TeamOption[]>([]);
  const [studentResults, setStudentResults] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedTeamQuery = useDebouncedValue(teamQuery, 300);
  const debouncedStudentQuery = useDebouncedValue(studentQuery, 300);

  useEffect(() => {
    setData('team_ids', selectedTeams.map((t) => t.id));
    setData('student_ids', selectedStudents.map((s) => s.id));
    setData('excluded_student_ids', excludedStudentIds);
  }, [selectedTeams, selectedStudents, excludedStudentIds]);

  const fetchTeams = useCallback(async (q: string) => {
    setLoading(true);
    const url = route('programs.assignments.searchTeams', program.id).toString() + `?q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { credentials: 'same-origin' });
    const json: TeamOption[] = await res.json();
    setTeamResults(json);
    setLoading(false);
  }, [program.id]);

  const fetchStudents = useCallback(async (q: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('q', q);

    selectedStudents.forEach((s) =>
      params.append('exclude_student_ids[]', s.id.toString())
    );

    if (data.type === 'team') {
      selectedTeams.forEach((t) =>
        params.append('exclude_team_ids[]', t.id.toString())
      );
    }

    const url = route('programs.assignments.searchStudents', program.id).toString() + '?' + params.toString();
    const res = await fetch(url, { credentials: 'same-origin' });
    const json: StudentOption[] = await res.json();
    setStudentResults(json);
    setLoading(false);
  }, [program.id, selectedStudents, selectedTeams, data.type]);

  useEffect(() => {
    if (data.type === 'team' && debouncedTeamQuery.trim()) fetchTeams(debouncedTeamQuery);
  }, [debouncedTeamQuery, data.type]);

  useEffect(() => {
    if (data.type === 'individual' && debouncedStudentQuery.trim()) fetchStudents(debouncedStudentQuery);
  }, [debouncedStudentQuery, data.type]);

  async function selectTeam(team: TeamOption) {
    if (selectedTeams.find((t) => t.id === team.id)) return;
    setSelectedTeams((prev) => [...prev, team]);

    const url = route('programs.assignments.searchStudents', program.id).toString() + `?team_id=${team.id}`;
    const res = await fetch(url, { credentials: 'same-origin' });
    const members: StudentOption[] = await res.json();

    setSelectedStudents((prev) => {
      const prevIds = new Set(prev.map((s) => s.id));
      const merged = [...prev];
      members.forEach((m) => {
        if (!prevIds.has(m.id) && !excludedStudentIds.includes(m.id)) {
          merged.push(m);
        }
      });
      return merged;
    });
  }

  function selectStudent(s: StudentOption) {
    if (selectedStudents.find((x) => x.id === s.id)) return;
    setSelectedStudents((prev) => [...prev, s]);
    setExcludedStudentIds((prev) => prev.filter((id) => id !== s.id));
  }

  function removeTeam(id: number) {
    const teamName = selectedTeams.find((t) => t.id === id)?.name?.toLowerCase();
    setSelectedTeams((prev) => prev.filter((t) => t.id !== id));
    setSelectedStudents((prev) => prev.filter((s) => s.team?.toLowerCase() !== teamName));
    setExcludedStudentIds((prev) =>
      prev.filter((id) => {
        const student = selectedStudents.find((s) => s.id === id);
        return student?.team?.toLowerCase() !== teamName;
      })
    );
  }

  function removeStudent(id: number) {
    setSelectedStudents((prev) => prev.filter((s) => s.id !== id));
    setExcludedStudentIds((prev) => [...new Set([...prev, id])]);
  }

  function clearAll() {
    setSelectedTeams([]);
    setSelectedStudents([]);
    setExcludedStudentIds([]);
    setData('clear_all', true);
  }

  function submitAssign(e: React.FormEvent) {
    e.preventDefault();
    setData('student_ids', selectedStudents.map((s) => s.id));
    setData('excluded_student_ids', excludedStudentIds);
    setData('clear_all', false);

    if (isEdit) put(route('programs.assignments.update', program.id));
    else post(route('programs.assignments.store', program.id));
  }

  return (
    <AppLayout
      breadcrumbs={[
        {
          title: 'Assign Program',
          href: `/programs/${program.id}/assignments/create`,
        },
      ]}
    >
      <Head title={`Assign Program - ${program.name}`} />
      <div className="mx-auto max-w-3xl p-4">
        <h1 className="mb-4 text-2xl font-bold">👥 Assign Program</h1>
        <form onSubmit={submitAssign} className="space-y-4">
          <div>
            <label className="font-heading text-sm text-[#102d4e]">Assigning:</label>
            <div className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none">
              <strong>{program.name}</strong>
            </div>
          </div>

          {!isCoach && (
            <div>
              <label className="font-heading text-sm text-[#102d4e]">Assign To:</label>
              <div className="mt-1 flex items-center gap-4">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="team"
                    checked={data.type === 'team'}
                    onChange={() => setData('type', 'team')}
                  />
                  Team
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="individual"
                    checked={data.type === 'individual'}
                    onChange={() => setData('type', 'individual')}
                  />
                  Individual
                </label>
              </div>
            </div>
          )}

          <div>
            <label className="font-heading text-sm text-[#102d4e]">
              Search {data.type === 'team' ? 'Teams' : 'Athletes'}:
            </label>
            <input
              value={data.type === 'team' ? teamQuery : studentQuery}
              onChange={(e) =>
                data.type === 'team' ? setTeamQuery(e.target.value) : setStudentQuery(e.target.value)
              }
              placeholder={`Search ${data.type === 'team' ? 'teams' : 'athletes'}...`}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
              autoComplete="off"
            />
            {loading && <div className="mt-1 text-sm text-gray-500">Searching…</div>}
            {!loading && (
              <>
                {data.type === 'team' &&
                  debouncedTeamQuery.trim() &&
                  teamResults.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {teamResults.map((t) => (
                        <div
                          key={t.id}
                          className="cursor-pointer px-3 py-1 text-sm hover:bg-blue-50"
                          onClick={() => selectTeam(t)}
                        >
                          {t.name}
                          {t.sport ? ` (${t.sport})` : ''}
                        </div>
                      ))}
                    </div>
                  )}
                {data.type === 'individual' &&
                  debouncedStudentQuery.trim() &&
                  studentResults.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {studentResults.map((s) => (
                        <div
                          key={s.id}
                          className="cursor-pointer px-3 py-1 text-sm hover:bg-blue-50"
                          onClick={() => selectStudent(s)}
                        >
                          {s.name}
                          {s.team ? ` — ${s.team}` : ''}
                        </div>
                      ))}
                    </div>
                  )}
              </>
            )}
          </div>

          <div>
            <label className="font-heading text-sm text-[#102d4e]">Selected:</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedTeams.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm"
                >
                  <span>{t.name}</span>
                  <button
                    type="button"
                    onClick={() => removeTeam(t.id)}
                    className="text-xs text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {selectedStudents.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm"
                >
                  <span>
                    {s.name}
                    {s.team ? ` — ${s.team}` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeStudent(s.id)}
                    className="text-xs text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {selectedTeams.length === 0 && selectedStudents.length === 0 && (
                <div className="text-sm text-gray-500 italic">No selections yet.</div>
              )}
            </div>
            <div className="mt-2">
              <button
                type="button"
                onClick={clearAll}
                className="text-sm text-red-600"
              >
                Clear all
              </button>
            </div>
          </div>

          <div>
            <label className="font-heading text-sm text-[#102d4e]">Notes (optional)</label>
            <textarea
              value={data.notes}
              onChange={(e) => setData('notes', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
              rows={3}
            />
            {errors.notes && (
              <div className="text-sm text-red-600">{errors.notes}</div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => window.history.back()} className="rounded-lg bg-gray-700 px-4 py-2 font-heading font-semibold text-white hover:bg-gray-800">
              Back
            </button>
            <button
              type="submit"
              disabled={processing}
              className="rounded-md bg-[#102d4e] px-4 py-2 font-heading font-semibold text-white transition hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
            >
              {isEdit ? 'Update Assignments' : 'Assign Program'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}