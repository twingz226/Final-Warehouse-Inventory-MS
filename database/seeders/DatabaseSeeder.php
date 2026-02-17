<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Using updateOrCreate ensures the user is added even in 'production' 
        // without crashing if the command is run multiple times.
        User::updateOrCreate(
            ['email' => 'admin@example.com'], // The unique identifier
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // If you have other seeders, you can call them here:
        // $this->call([
        //     ProductSeeder::class,
        // ]);
    }
}