import AppLayout from '@/layouts/app-layout';
import { FormModal } from '@/components/form-modal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

type NewsPost = {
  id: number;
  title: string;
  description: string;
  is_global: boolean;
  created_at: string;
  image_url?: string | null;
  user?: { name: string; school?: { name: string } };
  school?: { name: string };
  canEdit?: boolean;
  canDelete?: boolean;
};

export default function Index({
  posts,
  canCreate,
  schools = [],
  canSelectSchool = false,
  defaultSchoolId = null,
}: {
  posts: NewsPost[];
  canCreate: boolean;
  schools?: { id: number; name: string }[];
  canSelectSchool?: boolean;
  defaultSchoolId?: number | null;
}) {
  const [showModal, setShowModal] = useState(false);
  const { data, setData, post, reset, processing, errors } = useForm({
    title: '',
    description: '',
    image: null as File | null,
    school_id: defaultSchoolId,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/news', {
      forceFormData: true,
      onSuccess: () => {
        reset();
        setShowModal(false);
      },
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
      router.delete(`/news/${id}`);
    }
  };

  return (
    <AppLayout>
      <Head title="News Feed" />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 dark:from-background dark:to-muted/10 text-foreground py-8">
        <div className="w-full space-y-6 px-4 md:px-8">
          {/* Header */}
          <div className="flex justify-between items-center px-2 md:px-4">
            <h1 className="text-3xl font-semibold tracking-tight">News Feed</h1>
            {canCreate && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg shadow hover:bg-primary/90 transition"
              >
                New Post
              </button>
            )}
          </div>

          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-2 py-6 backdrop-blur-sm">
              <FormModal
                title="Create News Post"
                backHref="/news"
                backLabel="Close"
                onBack={() => setShowModal(false)}
              >
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
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setData('image', e.target.files?.[0] ?? null)}
                      className="w-full"
                    />
                    {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
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

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={processing}
                      className="bg-[#102d4e] text-white px-4 py-2 rounded hover:bg-[#0d243d] disabled:opacity-60"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        reset();
                        setShowModal(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </FormModal>
            </div>
          )}

          {/* Feed */}
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-card rounded-xl shadow-sm border border-border/60 p-6 space-y-4 transition hover:-translate-y-0.5"
              >
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-foreground">
                      {post.user?.name ?? 'Unknown'}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {post.is_global
                        ? `• ${post.school?.name ?? post.user?.school?.name ?? 'Unknown School'}`
                        : '• Shared within your school'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleString()}
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    {post.title}
                  </h2>
                  {post.image_url && (
                    <div className="rounded-lg overflow-hidden border border-border/60">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full max-h-64 object-cover"
                      />
                    </div>
                  )}
                  <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {post.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-4 text-sm pt-2 border-t border-border/60">
                  <Link
                    href={`/news/${post.id}`}
                    className="text-primary font-medium hover:underline"
                  >
                    View
                  </Link>
                  {post.canEdit && (
                    <Link
                      href={`/news/${post.id}/edit`}
                      className="text-primary font-medium hover:underline"
                    >
                      Edit
                    </Link>
                  )}
                  {post.canDelete && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-destructive font-medium hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card rounded-xl shadow-sm border border-border/60 p-8 text-center">
              <p className="text-foreground text-lg font-medium">No news posts yet.</p>
              <p className="text-muted-foreground text-sm mt-2">Check back later for updates!</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}