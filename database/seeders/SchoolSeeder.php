<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\School;


class SchoolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
{
    School::firstOrCreate([
        'id' => 1,
    ], [
        'name' => 'FEU Institute of Technology',
        'code' => 'FIT',
        'address' => 'Padre Paredes St, Sampaloc, Manila',
    ]);
}
}
