<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\DemoRequestReceived;
use App\Models\DemoRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class DemoRequestController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:demo_requests,email',
            'notes' => 'nullable|string',
        ]);

        $demoRequest = DemoRequest::create([
            'email' => $validated['email'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        Mail::to($demoRequest->email)->send(new DemoRequestReceived());

        return response()->json([
            'success' => true,
            'message' => 'Demo request submitted successfully.',
            'data' => [
                'id' => $demoRequest->id,
                'status' => $demoRequest->status,
                'email' => $demoRequest->email,
            ],
        ], 201);
    }
}
