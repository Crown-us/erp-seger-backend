<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Http\Resources\UserResource;
use App\Http\Resources\OrderResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    /**
     * Manage Employees (Pembeli)
     */
    public function indexEmployees()
    {
        $employees = User::where('role', 'pembeli')->latest()->get();
        return UserResource::collection($employees);
    }

    public function storeEmployee(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nik'               => 'required|unique:users',
            'name'              => 'required',
            'email'             => 'required|email|unique:users',
            'password'          => 'required|min:6',
            'workplace'         => 'nullable|string',
            'workplace_address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
            'nik'               => $request->nik,
            'name'              => $request->name,
            'email'             => $request->email,
            'password'          => Hash::make($request->password),
            'role'              => 'pembeli',
            'workplace'         => $request->workplace,
            'workplace_address' => $request->workplace_address,
        ]);

        return new UserResource($user);
    }

    public function updateEmployee(Request $request, $id)
    {
        $user = User::where('role', 'pembeli')->findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'nik'               => 'required|unique:users,nik,' . $id,
            'name'              => 'required',
            'email'             => 'required|email|unique:users,email,' . $id,
            'workplace'         => 'nullable|string',
            'workplace_address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user->update($request->only(['nik', 'name', 'email', 'workplace', 'workplace_address']));

        return new UserResource($user);
    }

    public function destroyEmployee($id)
    {
        $user = User::where('role', 'pembeli')->findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'Employee deleted successfully']);
    }

    /**
     * Manage Shops (Pedagang)
     */
    public function indexShops()
    {
        $shops = User::where('role', 'pedagang')->latest()->get();
        return UserResource::collection($shops);
    }

    public function storeShop(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:6',
            'nik'      => 'nullable|unique:users',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'pedagang',
            'nik'      => $request->nik,
        ]);

        return new UserResource($user);
    }

    public function updateShop(Request $request, $id)
    {
        $user = User::where('role', 'pedagang')->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'  => 'required',
            'email' => 'required|email|unique:users,email,' . $id,
            'nik'   => 'nullable|unique:users,nik,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user->update($request->only(['name', 'email', 'nik']));

        return new UserResource($user);
    }
public function destroyShop($id)
{
    $user = User::where('role', 'pedagang')->findOrFail($id);
    $user->delete();

    return response()->json(['message' => 'Toko berhasil dihapus']);
}

/**
 * Business Partner (PT) Management
 */
public function indexPartners()
{
    $partners = \App\Models\BusinessPartner::all();
    return response()->json(['data' => $partners]);
}

public function storePartner(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255',
        'address' => 'required|string',
    ]);

    if ($validator->fails()) return response()->json($validator->errors(), 422);

    $partner = \App\Models\BusinessPartner::create($request->all());
    return response()->json(['message' => 'PT berhasil ditambahkan', 'data' => $partner]);
}

public function updatePartner(Request $request, $id)
{
    $partner = \App\Models\BusinessPartner::findOrFail($id);
    $partner->update($request->all());
    return response()->json(['message' => 'PT berhasil diperbarui', 'data' => $partner]);
}

public function destroyPartner($id)
{
    $partner = \App\Models\BusinessPartner::findOrFail($id);
    $partner->delete();
    return response()->json(['message' => 'PT berhasil dihapus']);
}

    /**
     * Order Management
     */
    public function indexOrders()
    {
        $orders = Order::with(['user', 'items.product'])->latest()->get();
        return OrderResource::collection($orders);
    }

    public function confirmOrder($id)
    {
        $order = Order::findOrFail($id);
        
        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Order is not in pending status'], 400);
        }

        $order->update(['status' => 'processing']);

        return new OrderResource($order->load(['user', 'items.product']));
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:processing,shipped,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        return new OrderResource($order->load(['user', 'items.product']));
    }
}
