<?php

namespace App\Http\Controllers;

use App\Models\NewsPost;
use App\Models\School;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class NewsPostController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$user || (!$user->hasRole('Admin') && !$user->hasRole('super_admin'))) {
            abort(403, 'Unauthorized');
        }

        // ✅ eager-load both school and user.school
        $query = NewsPost::with(['school', 'user.school'])->orderByDesc('created_at');

        // Non-super_admins: only see their school + global posts
        if ($user && !$user->hasRole('super_admin')) {
            $query->where(function ($q) use ($user) {
                $q->where('school_id', $user->school_id)
                    ->orWhere('is_global', true);
            });
        }

        $posts = $query->get()->map(function ($post) use ($user) {
            $canEdit = false;
            $canDelete = false;

            if ($user->hasRole('super_admin')) {
                $canEdit = true;
                $canDelete = true;
            } elseif ($user->hasRole('Admin')) {
                if ($user->can('news.edit') && $post->user_id === $user->id) {
                    $canEdit = true;
                }
                if ($user->can('news.delete') && $post->user_id === $user->id) {
                    $canDelete = true;
                }
            }

            return array_merge($post->toArray(), [
                'canEdit' => $canEdit,
                'canDelete' => $canDelete,
            ]);
        });

        return Inertia::render('NewsFeed/Index', [
            'posts' => $posts,
            'canCreate' => $user->hasRole('super_admin') || ($user->hasRole('Admin') && $user->can('news.create')),
            'schools' => $user->hasRole('super_admin') ? School::select('id', 'name')->get() : [],
            'canSelectSchool' => $user->hasRole('super_admin'),
            'defaultSchoolId' => $user->school_id,
        ]);
    }


    public function create()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasRole('Admin') && !$user->hasRole('super_admin')) {
            abort(403, 'Unauthorized');
        }
        if ($user->hasRole('Admin') && !$user->can('news.create')) {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('NewsFeed/Add', [
            'schools' => $user->hasRole('super_admin') ? School::select('id', 'name')->get() : [],
            'canSelectSchool' => $user->hasRole('super_admin'),
            'defaultSchoolId' => $user->school_id,
        ]);
    }

    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasRole('Admin') && !$user->hasRole('super_admin')) {
            abort(403, 'Unauthorized');
        }
        if ($user->hasRole('Admin') && !$user->can('news.create')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'image'       => 'nullable|image|max:5120',
            'school_id'   => 'nullable|exists:schools,id',
        ]);

        // Determine school (no global option)
        $schoolId = $user->hasRole('super_admin') ? $request->input('school_id') : $user->school_id;
        if ($user->hasRole('super_admin') && !$schoolId) {
            return back()->withErrors(['school_id' => 'School is required.']);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('news', 'public');
        }

        NewsPost::create([
            'title'       => $validated['title'],
            'description' => $validated['description'],
            'is_global'   => false,
            'school_id'   => $schoolId,
            'user_id'     => $user->id,
            'image_path'  => $imagePath,
        ]);

        return redirect()->route('news.index')->with('success', 'News post created successfully.');
    }

    public function show(NewsPost $newsPost)
{
    /** @var \App\Models\User $user */
    $user = Auth::user();

    $newsPost->load(['school', 'user.school']);

    $canEdit = false;
    $canDelete = false;

    if ($user->hasRole('super_admin')) {
        // Super admins can edit/delete everything
        $canEdit = true;
        $canDelete = true;
    } elseif ($user->hasRole('Admin')) {
        // Admins can edit/delete if they have permission
        if ($user->can('news.edit')) {
            // ✅ Allow editing if they are the author
            if ($newsPost->user_id === $user->id) {
                $canEdit = true;
            }
        }
        if ($user->can('news.delete')) {
            // ✅ Allow deleting if they are the author
            if ($newsPost->user_id === $user->id) {
                $canDelete = true;
            }
        }
    }

    return Inertia::render('NewsFeed/View', [
        'post'      => $newsPost,
        'canEdit'   => $canEdit,
        'canDelete' => $canDelete,
    ]);
}



    public function edit(NewsPost $newsPost)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasRole('Admin') && !$user->hasRole('super_admin')) {
            abort(403, 'Unauthorized');
        }
        if ($user->hasRole('Admin') && !$user->can('news.edit')) {
            abort(403, 'Unauthorized');
        }

        $this->authorizeSchoolAccess($newsPost, true);

        return Inertia::render('NewsFeed/Edit', [
            'post' => $newsPost,
            'schools' => $user->hasRole('super_admin') ? School::select('id', 'name')->get() : [],
            'canSelectSchool' => $user->hasRole('super_admin'),
            'defaultSchoolId' => $user->school_id,
        ]);
    }

    public function update(Request $request, NewsPost $newsPost)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasRole('Admin') && !$user->hasRole('super_admin')) {
            abort(403, 'Unauthorized');
        }
        if ($user->hasRole('Admin') && !$user->can('news.edit')) {
            abort(403, 'Unauthorized');
        }

        $this->authorizeSchoolAccess($newsPost, true);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'image'       => 'nullable|image|max:5120',
            'school_id'   => 'nullable|exists:schools,id',
        ]);

        $schoolId = $user->hasRole('super_admin') ? $request->input('school_id') : $user->school_id;
        if ($user->hasRole('super_admin') && !$schoolId) {
            return back()->withErrors(['school_id' => 'School is required.']);
        }

        if ($request->hasFile('image')) {
            if ($newsPost->image_path) {
                Storage::disk('public')->delete($newsPost->image_path);
            }
            $newsPost->image_path = $request->file('image')->store('news', 'public');
        }

        $newsPost->update([
            'title'       => $validated['title'],
            'description' => $validated['description'],
            'is_global'   => false,
            'school_id'   => $schoolId,
            'image_path'  => $newsPost->image_path,
        ]);

        return redirect()->route('news.index')->with('success', 'News post updated successfully.');
    }

    public function destroy(NewsPost $newsPost)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasRole('Admin') && !$user->hasRole('super_admin')) {
            abort(403, 'Unauthorized');
        }
        if ($user->hasRole('Admin') && !$user->can('news.delete')) {
            abort(403, 'Unauthorized');
        }

        $this->authorizeSchoolAccess($newsPost, true);

        if ($newsPost->image_path) {
            Storage::disk('public')->delete($newsPost->image_path);
        }

        $newsPost->delete();

        return redirect()->route('news.index')->with('success', 'News post deleted successfully.');
    }

    protected function authorizeSchoolAccess(NewsPost $post, $forEdit = false)
    {
        /** @var \App\Models\User $authUser */
        $authUser = Auth::user();

        if ($authUser->hasRole('super_admin')) {
            return;
        }

        if ($forEdit && $post->is_global) {
            abort(403, 'You cannot edit or delete global posts.');
        }

        if ($post->school_id !== $authUser->school_id) {
            abort(403, 'Unauthorized access to news post.');
        }
    }

    /**
     * Mobile feed for Student/Coach in their school (+ global)
     */
    public function mobileIndex(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user || (!$user->hasRole('Student') && !$user->hasRole('Coach'))) {
            abort(403, 'Unauthorized');
        }

        $posts = NewsPost::with(['user:id,name', 'school:id,name'])
            ->where(function ($q) use ($user) {
                $q->whereNull('school_id')->orWhere('school_id', $user->school_id);
            })
            ->latest()
            ->take(10)
            ->get(['id', 'title', 'description', 'is_global', 'image_path', 'school_id', 'user_id', 'created_at']);

        return response()->json([
            'data' => $posts->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'description' => $post->description,
                    'is_global' => $post->is_global,
                    'created_at' => $post->created_at,
                    'image_url' => $post->image_url,
                    'author' => $post->user?->name,
                    'school' => $post->school?->name,
                ];
            }),
        ]);
    }
}
