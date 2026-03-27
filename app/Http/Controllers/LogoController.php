<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class LogoController extends Controller
{
    /**
     * Show the logo management page.
     */
    public function index()
    {
        return inertia('Logo/Index');
    }

    /**
     * Update the logo.
     */
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        try {
            // Delete old logo if it exists
            if (Storage::disk('public')->exists('logo.png')) {
                Storage::disk('public')->delete('logo.png');
            }
            if (Storage::disk('public')->exists('logo.jpg')) {
                Storage::disk('public')->delete('logo.jpg');
            }
            if (Storage::disk('public')->exists('logo.svg')) {
                Storage::disk('public')->delete('logo.svg');
            }

            // Store new logo
            $file = $request->file('logo');
            $extension = $file->getClientOriginalExtension();
            $filename = 'logo.' . $extension;
            
            Storage::disk('public')->putFileAs('', $file, $filename);

            return back()->with('success', 'Logo updated successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update logo: ' . $e->getMessage());
        }
    }

    /**
     * Get the current logo URL.
     */
    public function getCurrentLogo()
    {
        $logoPath = null;
        
        if (Storage::disk('public')->exists('logo.png')) {
            $logoPath = Storage::url('logo.png');
        } elseif (Storage::disk('public')->exists('logo.jpg')) {
            $logoPath = Storage::url('logo.jpg');
        } elseif (Storage::disk('public')->exists('logo.svg')) {
            $logoPath = Storage::url('logo.svg');
        } else {
            // Default logo
            $logoPath = '/images/warlen.png';
        }

        return response()->json(['logo_url' => $logoPath]);
    }
}
