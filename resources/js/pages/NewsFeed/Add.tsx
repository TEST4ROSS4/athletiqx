import AppLayout from '@/layouts/app-layout';
import { FormModal } from '@/components/form-modal';
import { Head, useForm } from '@inertiajs/react';

type School = { id: number; name: string };

export default function Add({
  schools = [],
  canSelectSchool = false,
  defaultSchoolId = null,
}: {
  schools?: School[];
  canSelectSchool?: boolean;
  defaultSchoolId?: number | null;
}) {
  const { data, setData, post, reset } = useForm({
    title: '',
    description: '',
    image: null as File | null,
    school_id: defaultSchoolId,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/news', {
      forceFormData: true,
      onSuccess: () => reset(),
    });
  };

  return (
    <AppLayout>
      <Head title="Create News Post" />
      <FormModal title="Create News Post" backHref="/news">
        <form onSubmit={submit} className="space-y-4" encType="multipart/form-data">
          <input
            type="text"
            placeholder="Title"
            value={data.title}
            onChange={(e) => setData('title', e.target.value)}
            className="w-full border rounded p-2"
            required
          />

          <textarea
            placeholder="Description"
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
            className="w-full border rounded p-2 h-24"
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Image (optional, max 5MB)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setData('image', e.target.files?.[0] ?? null)}
              className="w-full"
            />
          </div>

          {canSelectSchool && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">School</label>
              <select
                value={data.school_id ?? ''}
                onChange={(e) => setData('school_id', e.target.value ? Number(e.target.value) : null)}
                className="w-full border rounded p-2"
                required
              >
                <option value="">Select a school</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="bg-[#102d4e] text-white px-4 py-2 rounded hover:bg-[#0d243d]"
          >
            Save
          </button>
        </form>
      </FormModal>
    </AppLayout>
  );
}