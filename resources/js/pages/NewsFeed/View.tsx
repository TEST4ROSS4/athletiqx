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
};

export default function View({
  post,
  canEdit,
  canDelete,
}: {
  post: NewsPost;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this post?')) {
      router.delete(`/news/${post.id}`);
    }
  };

  return (
    <AppLayout>
      <Head title="View News Post" />
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
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
              <h1 className="text-2xl font-bold text-[#102d4e] mb-2">
                {post.title}
              </h1>
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {post.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 text-sm pt-2 border-t border-gray-100">
              {canEdit && (
                <Link
                  href={`/news/${post.id}/edit`}
                  className="bg-[#102d4e] text-white px-4 py-2 rounded hover:bg-[#0d243d]"
                >
                  Edit
                </Link>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}