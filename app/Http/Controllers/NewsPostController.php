<?php

namespace App\Http\Controllers;

use App\Models\NewsPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NewsPostController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // ✅ eager-load both school and user.school
        $query = NewsPost::with(['school', 'user.school'])->orderByDesc('created_at');

        // Non-super_admins: only see their school + global posts
        if ($user && !$user->hasRole('super_admin')) {
            $query->where(function ($q) use ($user) {
                $q->where('school_id', $user->school_id)
                    ->orWhere('is_global', true);
            });
        }

        $posts = $query->get();

        return Inertia::render('NewsFeed/Index', [
            'posts' => $posts,
            'canCreate' => $user->hasRole('Admin') && $user->can('news.create'),
        ]);
    }


    public function create()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasRole('Admin') || !$user->can('news.create')) {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('NewsFeed/Add');
    }

    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasRole('Admin') || !$user->can('news.create')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'is_global'   => 'required|boolean',
        ]);

        $isGlobal = filter_var($request->input('is_global'), FILTER_VALIDATE_BOOLEAN);

        NewsPost::create([
            'title'       => $validated['title'],
            'description' => $validated['description'],
            'is_global'   => $isGlobal,
            'school_id'   => $isGlobal ? null : $user->school_id,
            'user_id'     => $user->id,
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
        if (!$user->hasRole('Admin') || !$user->can('news.edit')) {
            abort(403, 'Unauthorized');
        }

        $this->authorizeSchoolAccess($newsPost, true);

        return Inertia::render('NewsFeed/Edit', [
            'post' => $newsPost,
        ]);
    }

    public function update(Request $request, NewsPost $newsPost)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasRole('Admin') || !$user->can('news.edit')) {
            abort(403, 'Unauthorized');
        }

        $this->authorizeSchoolAccess($newsPost, true);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'is_global'   => 'required|boolean',
        ]);

        $isGlobal = filter_var($request->input('is_global'), FILTER_VALIDATE_BOOLEAN);

        $newsPost->update([
            'title'       => $validated['title'],
            'description' => $validated['description'],
            'is_global'   => $isGlobal,
            'school_id'   => $isGlobal ? null : $user->school_id,
        ]);

        return redirect()->route('news.index')->with('success', 'News post updated successfully.');
    }

    public function destroy(NewsPost $newsPost)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->hasRole('Admin') || !$user->can('news.delete')) {
            abort(403, 'Unauthorized');
        }

        $this->authorizeSchoolAccess($newsPost, true);

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
}
