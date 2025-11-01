import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { route } from 'ziggy-js';

type Member = {
  student_id: number | null;
  position: string;
  status: string;
};

const statusOptions = [
  'tryout',
  'active',
  'injured',
  'inactive',
  'redshirt',
  'suspended',
];

export default function Add({
  sportTeam,
  students,
}: {
  sportTeam: { id: number; name: string };
  students: { id: number; name: string }[];
}) {
  const { data, setData, post } = useForm({
    sport_team_id: sportTeam.id,
    members: [] as Member[],
  });

  const [formErrors, setFormErrors] = useState<string[]>([]);

  function addMemberBlock() {
    setData('members', [...data.members, { student_id: null, position: '', status: '' }]);
  }

  function removeMemberBlock(index: number) {
    const updated = [...data.members];
    updated.splice(index, 1);
    setData('members', updated);
  }

  function updateMember<K extends keyof Member>(index: number, field: K, value: Member[K]) {
    const updated = [...data.members];
    updated[index][field] = value;
    setData('members', updated);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const errors: string[] = [];

    data.members.forEach((m, i) => {
      if (!m.student_id) errors.push(`Member ${i + 1}: Student is required.`);
      if (!m.position.trim()) errors.push(`Member ${i + 1}: Position is required.`);
      if (!m.status.trim()) errors.push(`Member ${i + 1}: Status is required.`);
    });

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    post(route('student-sport-teams.store', sportTeam.id), {
      preserveScroll: true,
    });
  }

  const studentOptions = students.map((s) => ({
    label: s.name,
    value: s.id,
  }));

  function loadStudentOptions(inputValue: string, callback: (options: typeof studentOptions) => void) {
    const filtered = studentOptions.filter((s) =>
      s.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    callback(filtered);
  }

  return (
    <AppLayout>
      <Head title={`Add Team Members – ${sportTeam.name}`} />
      <div className="p-3">
        <h1 className="mb-4 text-2xl font-bold">Add Team Members to {sportTeam.name}</h1>

        <Link
          href={route('student-sport-teams.index', sportTeam.id)}
          className="mb-4 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          Back to Team
        </Link>

        <form onSubmit={submit} className="mx-auto mt-4 max-w-md space-y-6">
          <div className="space-y-4">
            {data.members.map((m, i) => (
              <div key={i} className="grid gap-2 border-b pb-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Member {i + 1}</label>
                  <button
                    type="button"
                    onClick={() => removeMemberBlock(i)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={loadStudentOptions}
                  onChange={(option) => updateMember(i, 'student_id', option?.value ?? null)}
                  value={studentOptions.find((o) => o.value === m.student_id) || null}
                  placeholder="Search and select student"
                />

                <input
                  type="text"
                  value={m.position}
                  onChange={(e) => updateMember(i, 'position', e.target.value)}
                  className="rounded border px-3 py-2 text-sm"
                  placeholder="Position"
                />

                <select
                  value={m.status}
                  onChange={(e) => updateMember(i, 'status', e.target.value)}
                  className="rounded border px-3 py-2 text-sm"
                >
                  <option value="">Select status</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <button
              type="button"
              onClick={addMemberBlock}
              className="flex items-center gap-2 text-sm text-blue-700 hover:underline"
            >
              <PlusCircle className="h-5 w-5 text-blue-700" />
              <span>Add Member</span>
            </button>
          </div>

          {formErrors.length > 0 && (
            <div className="space-y-1 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {formErrors.map((err, idx) => (
                <p key={idx}>{err}</p>
              ))}
            </div>
          )}

          <button
            type="submit"
            className="rounded-md bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700"
            disabled={data.members.length === 0}
          >
            Submit
          </button>
        </form>
      </div>
    </AppLayout>
  );
}