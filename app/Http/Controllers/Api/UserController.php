<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

use App\Http\Resources\UserResource;

class UserController extends Controller
{
    /**
     * Update user profile (name & email).
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user()->load('workplace');
        
        $validator = Validator::make($request->all(), [
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user->update($request->only(['name', 'email']));

        return (new UserResource($user))->additional([
            'success' => true,
            'message' => 'Profile updated successfully',
        ]);
    }

    /**
     * Update workplace address (for employees/pembeli).
     */
    public function updateAddress(Request $request)
    {
        $user = $request->user()->load('workplace');

        if ($user->role !== 'pembeli') {
            return response()->json(['message' => 'Only employees can update workplace address'], 403);
        }

        $validator = Validator::make($request->all(), [
            'workplace_address' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user->update(['workplace_address' => $request->workplace_address]);

        return (new UserResource($user))->additional([
            'success' => true,
            'message' => 'Workplace address updated successfully',
        ]);
    }

    /**
     * Update user password.
     */
    public function updatePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password'     => 'required|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Password lama salah'], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['message' => 'Password berhasil diperbarui']);
    }
}
