import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';

type NewsPost = {
  id: number;
  title: string;
  description: string;
  is_global: boolean;
  created_at: string;
  user?: { name: string; school?: { name: string } };
  school?: { name: string };
  canEdit?: boolean;
  canDelete?: boolean;
};

export default function Index({
  posts,
  canCreate,
}: {
  posts: NewsPost[];
  canCreate: boolean;
}) {
  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
      router.delete(`/news/${id}`);
    }
  };

  return (
    <AppLayout>
      <Head title="News Feed" />
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center px-4">
            <h1 className="text-3xl font-bold text-[#102d4e]">News Feed</h1>
            {canCreate && (
              <Link
                href="/news/create"
                className="bg-[#102d4e] text-white px-5 py-2 rounded-lg shadow hover:bg-[#0d243d] transition"
              >
                New Post
              </Link>
            )}
          </div>

          {/* Feed */}
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-3"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-[#102d4e]">
                    {post.user?.name ?? 'Unknown'}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    {post.is_global
                      ? `• ${post.school?.name ?? post.user?.school?.name ?? 'Unknown School'}`
                      : '• Shared within your school'}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleString()}
                </span>
              </div>

              {/* Content */}
              <div>
                <h2 className="text-lg font-medium text-[#102d4e] mb-1">
                  {post.title}
                </h2>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {post.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-4 text-sm pt-2 border-t border-gray-100">
                <Link
                  href={`/news/${post.id}`}
                  className="text-[#102d4e] font-medium hover:underline"
                >
                  View
                </Link>
                {post.canEdit && (
                  <Link
                    href={`/news/${post.id}/edit`}
                    className="text-[#102d4e] font-medium hover:underline"
                  >
                    Edit
                  </Link>
                )}
                {post.canDelete && (
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 font-medium hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}