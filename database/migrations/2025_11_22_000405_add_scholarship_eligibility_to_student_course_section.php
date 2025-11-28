<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddScholarshipEligibilityToStudentCourseSection extends Migration
{
    public function up()
    {
        Schema::table('student_course_section', function (Blueprint $table) {
            $table->boolean('is_eligible_for_scholarship')->default(false); 
        });
    }

    public function down()
    {
        Schema::table('student_course_section', function (Blueprint $table) {
            $table->dropColumn('is_eligible_for_scholarship');
        });
    }
}