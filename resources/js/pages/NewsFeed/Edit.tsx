import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';

type School = { id: number; name: string };
type Post = {
  id: number;
  title: string;
  description: string;
  image_url?: string | null;
  school_id?: number | null;
};

export default function Edit({
  post,
  schools = [],
  canSelectSchool = false,
  defaultSchoolId = null,
}: {
  post: Post;
  schools?: School[];
  canSelectSchool?: boolean;
  defaultSchoolId?: number | null;
}) {
  const initialSchoolId = canSelectSchool
    ? post.school_id ?? defaultSchoolId ?? (schools[0]?.id ?? null)
    : post.school_id ?? defaultSchoolId ?? null;

  const { data, setData, put, processing, errors } = useForm({
    title: post.title ?? '',
    description: post.description ?? '',
    image: null as File | null,
    school_id: initialSchoolId,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('school_id', data.school_id ? String(data.school_id) : '');
    if (data.image) {
      formData.append('image', data.image);
    }
    formData.append('_method', 'PUT');
    
    fetch(`/news/${post.id}`, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': csrfToken,
      },
    })
      .then((response) => {
        if (response.ok) {
          router.visit('/news');
        } else {
          return response.json().then((data) => {
            if (data.errors) {
              Object.keys(data.errors).forEach((key) => {
                // Errors will be displayed via the form state
              });
            }
          });
        }
      })
      .catch((error) => console.error('Error:', error));
  };

  return (
    <AppLayout>
      <Head title="Edit News Post" />
      <div className="p-8 bg-white">
        <h1 className="text-2xl font-bold text-[#102d4e] mb-6">Edit News Post</h1>
        <form onSubmit={submit} className="space-y-4" encType="multipart/form-data">
          <input
            type="text"
            placeholder="Title"
            value={data.title}
            onChange={(e) => setData('title', e.target.value)}
            className="w-full border rounded p-2"
            required
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}

          <textarea
            placeholder="Description"
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
            className="w-full border rounded p-2 h-24"
            required
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Image (optional, max 5MB)</label>
            {post.image_url && (
              <div className="border rounded p-2 bg-gray-50">
                <img src={post.image_url} alt="Current" className="max-h-48 object-cover rounded" />
              </div>
            )}
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
              {errors.school_id && <p className="text-sm text-red-500">{errors.school_id}</p>}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={processing}
              className="bg-[#102d4e] text-white px-4 py-2 rounded hover:bg-[#0d243d] disabled:opacity-60"
            >
              {processing ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => router.visit('/news')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}