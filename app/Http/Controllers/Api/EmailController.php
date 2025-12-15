<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailSubscription;
use App\Models\EmailLog;
use Illuminate\Http\Request;

class EmailController extends Controller
{
    public function subscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:email_subscriptions,email',
            'preferences' => 'nullable|array',
        ]);

        $subscription = EmailSubscription::create([
            'email' => $request->email,
            'user_id' => auth()->id(),
            'status' => 'active',
            'preferences' => $request->preferences ?? [
                'schedule_reminders' => true,
                'training_assignments' => true,
                'compliance_alerts' => true,
                'weekly_summary' => true,
                'wellness_reminders' => true,
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Successfully subscribed to newsletter',
            'data' => [
                'id' => $subscription->id,
                'email' => $subscription->email,
                'status' => $subscription->status,
            ],
        ], 201);
    }

    public function getPreferences(Request $request)
    {
        $subscription = EmailSubscription::where('user_id', auth()->id())->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $subscription->id,
                'email' => $subscription->email,
                'preferences' => $subscription->preferences,
            ],
        ]);
    }

    public function updatePreferences(Request $request)
    {
        $request->validate([
            'preferences' => 'required|array',
        ]);

        $subscription = EmailSubscription::where('user_id', auth()->id())->firstOrFail();
        $subscription->update(['preferences' => $request->preferences]);

        return response()->json([
            'success' => true,
            'message' => 'Preferences updated successfully',
        ]);
    }

    public function getEmailHistory(Request $request)
    {
        $query = EmailLog::where('recipient_id', auth()->id());

        if ($request->has('email_type')) {
            $query->where('email_type', $request->email_type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 20);
        $history = $query->orderByDesc('sent_at')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $history->map(fn($log) => [
                'id' => $log->id,
                'email_type' => $log->email_type,
                'subject' => $log->subject,
                'sent_at' => $log->sent_at->toIso8601String(),
                'status' => $log->status,
                'open_count' => $log->open_count,
                'click_count' => $log->click_count,
            ])->toArray(),
            'pagination' => [
                'total' => $history->total(),
                'per_page' => $history->perPage(),
                'current_page' => $history->currentPage(),
                'last_page' => $history->lastPage(),
            ],
        ]);
    }
}
