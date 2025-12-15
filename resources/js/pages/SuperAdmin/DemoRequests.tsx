import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, XCircle, Clock3, Mail } from 'lucide-react';
import { useMemo, useState } from 'react';

type DemoRequest = {
  id: number;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  notes?: string | null;
  admin_user_id?: number | null;
  admin_user?: { id: number; name: string; email: string } | null;
  created_at: string;
};

export default function DemoRequests({ requests }: { requests: DemoRequest[] }) {
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === 'pending').length,
    [requests]
  );

  const handleAction = (id: number, action: 'accept' | 'decline') => {
    setSubmittingId(id);
    router.post(
      `/super-admin/demo-requests/${id}/${action}`,
      {},
      {
        preserveScroll: true,
        onFinish: () => setSubmittingId(null),
      }
    );
  };

  const statusBadge = (status: DemoRequest['status']) => {
    const map: Record<DemoRequest['status'], string> = {
      pending: 'bg-amber-100 text-amber-800 border border-amber-200',
      accepted: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      declined: 'bg-red-100 text-red-800 border border-red-200',
    };
    return map[status];
  };

  return (
    <AppLayout>
      <Head title="Demo Requests" />
      <div className="min-h-screen w-full space-y-6 bg-white p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-[#102d4e]">Demo Requests</h1>
          <p className="text-sm text-gray-600">Review and manage incoming demo requests.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#102d4e]" />
              <span className="text-2xl font-semibold text-[#102d4e]">{requests.length}</span>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-amber-600" />
              <span className="text-2xl font-semibold text-amber-700">{pendingCount}</span>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-2xl font-semibold text-emerald-700">
                {requests.length - pendingCount}
              </span>
            </CardContent>
          </Card>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-[#102d4e] text-white">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Email</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Admin User</th>
                <th className="px-6 py-3 text-left font-semibold">Requested At</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No demo requests yet.
                  </td>
                </tr>
              )}
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-[#102d4e]">{req.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className={`${statusBadge(req.status)} capitalize`}>
                      {req.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {req.admin_user ? `${req.admin_user.name} (${req.admin_user.email})` : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(req.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {req.status === 'pending' ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                          onClick={() => handleAction(req.id, 'accept')}
                          disabled={submittingId === req.id}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          {submittingId === req.id ? 'Accepting...' : 'Accept'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-700 hover:bg-red-50 hover:text-red-800"
                          onClick={() => handleAction(req.id, 'decline')}
                          disabled={submittingId === req.id}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          {submittingId === req.id ? 'Declining...' : 'Decline'}
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
