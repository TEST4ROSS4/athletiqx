<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FileUpload;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class FileUploadController extends Controller
{
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const ALLOWED_TYPES = ['image', 'video', 'document'];
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'pdf'];

    public function uploadProof(Request $request, $trainingId)
    {
        $request->validate([
            'file' => 'required|file|max:' . (self::MAX_FILE_SIZE / 1024),
            'file_type' => 'required|in:' . implode(',', self::ALLOWED_TYPES),
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());

        if (!in_array($extension, self::ALLOWED_EXTENSIONS)) {
            return response()->json([
                'success' => false,
                'message' => 'File type not allowed. Allowed types: ' . implode(', ', self::ALLOWED_EXTENSIONS),
            ], 400);
        }

        if ($file->getSize() > self::MAX_FILE_SIZE) {
            return response()->json([
                'success' => false,
                'message' => 'File size exceeds 50MB limit',
            ], 400);
        }

        try {
            $fileName = Str::uuid() . '.' . $extension;
            $path = Storage::disk('public')->putFileAs('proofs', $file, $fileName);
            $fileUrl = Storage::disk('public')->url($path);

            $fileUpload = FileUpload::create([
                'training_id' => $trainingId,
                'student_id' => auth()->id(),
                'file_url' => $fileUrl,
                'file_type' => $request->file_type,
                'file_size' => $file->getSize(),
                'file_name' => $file->getClientOriginalName(),
                'approval_status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $fileUpload->id,
                    'training_id' => $fileUpload->training_id,
                    'student_id' => $fileUpload->student_id,
                    'file_url' => $fileUpload->file_url,
                    'file_type' => $fileUpload->file_type,
                    'file_size' => $fileUpload->file_size,
                    'file_name' => $fileUpload->file_name,
                    'uploaded_at' => $fileUpload->uploaded_at->toIso8601String(),
                    'approval_status' => $fileUpload->approval_status,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'File upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getProofs(Request $request, $trainingId)
    {
        $query = FileUpload::where('training_id', $trainingId);

        if ($request->has('status')) {
            $query->where('approval_status', $request->status);
        }

        $perPage = $request->get('per_page', 10);
        $proofs = $query->with('student:id,name,email')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $proofs->map(fn($proof) => [
                'id' => $proof->id,
                'training_id' => $proof->training_id,
                'student_id' => $proof->student_id,
                'file_url' => $proof->file_url,
                'file_type' => $proof->file_type,
                'file_size' => $proof->file_size,
                'file_name' => $proof->file_name,
                'uploaded_at' => $proof->uploaded_at->toIso8601String(),
                'approval_status' => $proof->approval_status,
                'student' => [
                    'id' => $proof->student->id,
                    'name' => $proof->student->name,
                    'email' => $proof->student->email,
                ],
            ])->toArray(),
            'pagination' => [
                'total' => $proofs->total(),
                'per_page' => $proofs->perPage(),
                'current_page' => $proofs->currentPage(),
                'last_page' => $proofs->lastPage(),
            ],
        ]);
    }

    public function approveRejectProof(Request $request, $trainingId, $proofId)
    {
        $request->validate([
            'approval_status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:approval_status,rejected|nullable|string',
        ]);

        $proof = FileUpload::findOrFail($proofId);

        if ($proof->training_id !== $trainingId) {
            return response()->json([
                'success' => false,
                'message' => 'Proof not found for this training',
            ], 404);
        }

        $proof->update([
            'approval_status' => $request->approval_status,
            'rejection_reason' => $request->rejection_reason,
            'approved_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $proof->id,
                'approval_status' => $proof->approval_status,
                'approved_by' => $proof->approved_by,
                'approved_at' => now()->toIso8601String(),
            ],
        ]);
    }

    public function deleteProof($trainingId, $proofId)
    {
        $proof = FileUpload::findOrFail($proofId);

        if ($proof->training_id !== $trainingId) {
            return response()->json([
                'success' => false,
                'message' => 'Proof not found for this training',
            ], 404);
        }

        try {
            // Extract path from URL if needed
            $filePath = str_replace(Storage::disk('public')->url(''), '', $proof->file_url);
            if ($filePath !== $proof->file_url) {
                Storage::disk('public')->delete($filePath);
            }
            $proof->delete();

            return response()->json([
                'success' => true,
                'message' => 'Proof deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete proof: ' . $e->getMessage(),
            ], 500);
        }
    }
}
