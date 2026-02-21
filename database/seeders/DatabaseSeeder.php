<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Log::info('Starting database seeding');
        // Using updateOrCreate ensures the user is added even in 'production' 
        // without crashing if the command is run multiple times.
        $user = User::updateOrCreate(
            ['email' => 'admin@example.com'], // The unique identifier
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        Log::info('Admin user seeded with ID: ' . $user->id);

        // If you have other seeders, you can call them here:
        // $this->call([
        //     ProductSeeder::class,
        // ]);
    }
}