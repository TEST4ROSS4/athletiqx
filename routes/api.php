<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\MobileAuthController;
use App\Http\Controllers\Mobile\MobileCalendarAssignmentController;
use App\Http\Controllers\Mobile\MobileCalendarScheduleController;
use App\Http\Controllers\Mobile\MobileCourseController;
use App\Http\Controllers\Mobile\MobileExerciseLogsController;
use App\Http\Controllers\Mobile\MobileHomeController;
use App\Http\Controllers\Mobile\MobileProgramAssignmentController;
use App\Http\Controllers\Mobile\MobileProgramsController;
use App\Http\Controllers\Mobile\MobileProgramStudentController;
use App\Http\Controllers\Mobile\MobileSportsController;
use App\Http\Controllers\Api\FileUploadController;
use App\Http\Controllers\Api\EmailController;
use App\Http\Controllers\Api\KpiController;
use App\Http\Controllers\Api\WellnessController;
use App\Http\Controllers\Api\TrainingComplianceController;

//AUTH AND USERS
Route::post('/mobile-login', [MobileAuthController::class, 'mobileLogin']);
Route::get('/users', [MobileAuthController::class, 'getAllUsers']);
Route::middleware('auth:sanctum')->get('/user/permissions', [MobileAuthController::class, 'getCurrentUserPermissions']);

//ACADEMICS MODULE
Route::middleware('auth:sanctum')->get('/my-courses', [MobileCourseController::class, 'getCoursesBySchool']);
Route::middleware('auth:sanctum')->get('/my-courses/students/{courseSection}', [MobileCourseController::class, 'getStudentsByCourse']);

//COACH:TEAM MODULE
Route::middleware('auth:sanctum')->get('/my-sports', [MobileSportsController::class, 'getAssignedSportsToCoach']);
Route::middleware('auth:sanctum')->get('/my-sports/players/{sportTeam}', [MobileSportsController::class, 'getPlayers']);
Route::middleware('auth:sanctum')->get('/my-sports/players/{sportTeam}/create', [MobileSportsController::class, 'fetchTeamMembersCreate']);
Route::middleware('auth:sanctum')->put('/my-sports/players/{studentSportTeam}/update', [MobileSportsController::class, 'update']);
Route::middleware('auth:sanctum')->post('/my-sports/players/{sportTeam}/store', [MobileSportsController::class, 'store']);
Route::middleware('auth:sanctum')->delete('/my-sports/players/{studentSportTeam}/delete', [MobileSportsController::class, 'destroy']);


//COACH:TRANING MODULE
Route::middleware('auth:sanctum')->get('/my-programs', [MobileProgramsController::class, 'index']);
Route::middleware('auth:sanctum')->get('/my-programs/{program}', [MobileProgramsController::class, 'show']);
Route::middleware('auth:sanctum')->post('/my-programs', [MobileProgramsController::class, 'store']);
Route::middleware('auth:sanctum')->delete('/my-programs/{program}', [MobileProgramsController::class, 'destroy']);
Route::middleware('auth:sanctum')->put('/my-programs/{id}', [MobileProgramsController::class, 'update']);

//COACH PROGRAM ASSIGNMENT
Route::middleware('auth:sanctum')->get('/program-assignments', [MobileProgramAssignmentController::class, 'allProgramAssignments']);
Route::middleware('auth:sanctum')->get('/program-assignments/students', [MobileProgramAssignmentController::class, 'getTeamsAssignedToCoach']);
Route::middleware('auth:sanctum')->post('/program-assignments/{program}/assignments', [MobileProgramAssignmentController::class, 'store']);
Route::middleware('auth:sanctum')->get('/program-assignments/{program}/assignments', [MobileProgramAssignmentController::class, 'fetchAssignments']);
Route::middleware('auth:sanctum')->put('/program-assignments/{program}/assignments', [MobileProgramAssignmentController::class, 'update']);

//STUDENT PROGRAM ASSIGNMENT
Route::middleware('auth:sanctum')->get('/my-assigned-programs', [MobileProgramStudentController::class, 'programsAssignedToMe']);

//SCHEUDLE MODULE
Route::middleware('auth:sanctum')->get('/schedules', [MobileCalendarScheduleController::class, 'index']);
Route::middleware('auth:sanctum')->get('/schedules/{id}', [MobileCalendarScheduleController::class, 'show']);
Route::middleware('auth:sanctum')->post('/schedules', [MobileCalendarScheduleController::class, 'store']);
Route::middleware('auth:sanctum')->put('/schedules/{id}', [MobileCalendarScheduleController::class, 'update']);
Route::middleware('auth:sanctum')->delete('/schedules/{id}', [MobileCalendarScheduleController::class, 'destroy']);
Route::middleware('auth:sanctum')->get('/coach-teams', [MobileCalendarScheduleController::class, 'coachTeams']);

Route::middleware('auth:sanctum')->get('/professor-sections', [MobileCalendarScheduleController::class, 'professorCourseSections']);

// Mobile News Feed (Student/Coach, school-scoped + global)
Route::middleware('auth:sanctum')->get('/news-feed', [\App\Http\Controllers\NewsPostController::class, 'mobileIndex']);

//EXERCISE LOGS
Route::middleware('auth:sanctum')->post('/exercise-logs/{assignment}', [MobileExerciseLogsController::class, 'store']);
Route::middleware('auth:sanctum')->get('/exercise-logs/{assignment}/student/{studentId?}/fetch', [MobileExerciseLogsController::class, 'show']);
Route::middleware('auth:sanctum')->post('/exercise-logs/{assignmentId}/complete', [MobileExerciseLogsController::class, 'markAsCompleted']);

//HOME APIS
Route::middleware('auth:sanctum')->get('/students/{studentId}/logs', [MobileHomeController::class, 'getStudentLogs']);
Route::middleware('auth:sanctum')->get('/students/{studentId}/program', [MobileHomeController::class, 'getStudentProgramName']);
Route::middleware('auth:sanctum')->get('/coach/{coachId}/program', [MobileHomeController::class, 'getCoachProgramName']);

//FILE UPLOAD SYSTEM (Phase 1)
Route::middleware('auth:sanctum')->post('/trainings/{trainingId}/proof', [FileUploadController::class, 'uploadProof']);
Route::middleware('auth:sanctum')->get('/trainings/{trainingId}/proofs', [FileUploadController::class, 'getProofs']);
Route::middleware('auth:sanctum')->put('/trainings/{trainingId}/proof/{proofId}', [FileUploadController::class, 'approveRejectProof']);
Route::middleware('auth:sanctum')->delete('/trainings/{trainingId}/proof/{proofId}', [FileUploadController::class, 'deleteProof']);

//EMAIL NOTIFICATION SYSTEM (Phase 1)
Route::post('/newsletter/subscribe', [EmailController::class, 'subscribe']);
Route::middleware('auth:sanctum')->get('/newsletter/preferences', [EmailController::class, 'getPreferences']);
Route::middleware('auth:sanctum')->put('/newsletter/preferences', [EmailController::class, 'updatePreferences']);
Route::middleware('auth:sanctum')->get('/notifications/email-history', [EmailController::class, 'getEmailHistory']);

// Demo Requests
Route::post('/demo-requests', [\App\Http\Controllers\Api\DemoRequestController::class, 'store']);

//KPI DASHBOARD (Phase 2)
Route::middleware('auth:sanctum')->get('/students/{studentId}/kpis', [KpiController::class, 'getKpiSummary']);
Route::middleware('auth:sanctum')->get('/students/{studentId}/kpis/trends', [KpiController::class, 'getKpiTrends']);
Route::middleware('auth:sanctum')->get('/students/{studentId}/kpis/comparison', [KpiController::class, 'getKpiComparison']);
Route::middleware('auth:sanctum')->get('/teams/{teamId}/analytics', [KpiController::class, 'getTeamAnalytics']);
Route::middleware('auth:sanctum')->get('/school/kpis', [KpiController::class, 'getSchoolKpis']);
Route::middleware('auth:sanctum')->get('/school/kpis/trends', [KpiController::class, 'getSchoolKpiTrends']);
Route::middleware('auth:sanctum')->get('/kpi/schools', [KpiController::class, 'listSchools']);
Route::middleware('auth:sanctum')->get('/kpi/teams', [KpiController::class, 'listTeams']);
Route::middleware('auth:sanctum')->get('/teams/{teamId}/students', [KpiController::class, 'listTeamStudents']);

//WELLNESS TRACKING (Phase 2)
Route::middleware('auth:sanctum')->post('/wellness/log', [WellnessController::class, 'logWellness']);
Route::middleware('auth:sanctum')->get('/wellness/history', [WellnessController::class, 'getWellnessHistory']);
Route::middleware('auth:sanctum')->get('/wellness/trends', [WellnessController::class, 'getWellnessTrends']);
Route::middleware('auth:sanctum')->get('/wellness/recommendations', [WellnessController::class, 'getWellnessRecommendations']);
Route::middleware('auth:sanctum')->get('/wellness/check-today', [WellnessController::class, 'checkTodayWellness']);
Route::middleware('auth:sanctum')->put('/wellness/latest', [WellnessController::class, 'updateLatestWellness']);
Route::middleware('auth:sanctum')->get('/teams/{teamId}/wellness', [WellnessController::class, 'getTeamWellnessStatus']);

//TRAINING COMPLIANCE TRACKING (Phase 3)
Route::middleware('auth:sanctum')->post('/trainings/{trainingId}/log-completion', [TrainingComplianceController::class, 'logTrainingCompletion']);
Route::middleware('auth:sanctum')->get('/trainings/{trainingId}/compliance', [TrainingComplianceController::class, 'getTrainingCompliance']);
Route::middleware('auth:sanctum')->get('/students/{studentId}/compliance-report', [TrainingComplianceController::class, 'getStudentComplianceReport']);
Route::middleware('auth:sanctum')->get('/teams/{teamId}/compliance-analytics', [TrainingComplianceController::class, 'getTeamComplianceAnalytics']);
Route::middleware('auth:sanctum')->put('/trainings/{trainingId}/log/{logId}', [TrainingComplianceController::class, 'updateTrainingLog']);







Route::post('/mobile-logout', function (Request $request) {
    $user = $request->user();
    // Optional: Check if user has the correct role before allowing logout
    // if (!$user->hasRole('mobile-user')) {
    //     return response()->json(['message' => 'Unauthorized logout attempt.'], 403);
    // }

    // Delete current token
    $user->currentAccessToken()->delete();
    return response()->json(['message' => 'Logged out successfully']);
})->middleware('auth:sanctum');
// routes/api.php
Route::middleware('auth:sanctum')->get('/token', function (Request $request) {
    return response()->json([
        'token' => $request->bearerToken(),
        'user' => $request->user(),
    ]);
});
