import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';

export default function Add() {
  const { data, setData, post, reset } = useForm({
    title: '',
    description: '',
    is_global: false,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/news', { onSuccess: () => reset() });
  };

  return (
    <AppLayout>
      <Head title="Create News Post" />
      <div className="p-8 bg-white">
        <h1 className="text-2xl font-bold text-[#102d4e] mb-6">Create News Post</h1>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={data.title}
            onChange={(e) => setData('title', e.target.value)}
            className="w-full border rounded p-2"
          />
          <textarea
            placeholder="Description"
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
            className="w-full border rounded p-2 h-24"
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={data.is_global}
              onChange={(e) => setData('is_global', e.target.checked)}
            />
            <span>Share to all schools</span>
          </label>
          <button
            type="submit"
            className="bg-[#102d4e] text-white px-4 py-2 rounded hover:bg-[#0d243d]"
          >
            Save
          </button>
        </form>
      </div>
    </AppLayout>
  );
}