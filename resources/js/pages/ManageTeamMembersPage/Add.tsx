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
        <div className="p-3">
          {/* Heading */}
          <h1 className="mb-4 font-heading text-2xl font-semibold text-[#102d4e]">
            Add Team Members to {sportTeam.name}
          </h1>

          {/* Back Button */}
          <Link
            href={route('student-sport-teams.index', sportTeam.id)}
            className="mb-4 inline-block rounded-lg bg-[#102d4e] px-4 py-2 font-heading text-sm font-semibold text-white hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
          >
            Back to Team
          </Link>

          {/* Form */}
          <form onSubmit={submit} className="mx-auto mt-4 max-w-md space-y-6 font-sans">
            <div className="space-y-4">
              {data.members.map((m, i) => (
                <div key={i} className="grid gap-2 border-b pb-4">
                  <div className="flex items-center justify-between">
                    <label className="font-heading text-sm text-[#102d4e]">Member {i + 1}</label>
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
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
                    placeholder="Position"
                  />

                  <select
                    value={m.status}
                    onChange={(e) => updateMember(i, 'status', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm transition focus:border-[#102d4e] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
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
              className="rounded-md bg-[#102d4e] px-4 py-2 font-heading font-semibold text-white transition hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
              disabled={data.members.length === 0}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}