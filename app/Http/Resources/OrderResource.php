<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'user'             => new UserResource($this->whenLoaded('user')),
            'total_price'      => $this->total_price,
            'status'           => $this->status,
            'shipping_address' => $this->shipping_address,
            'payment_method'   => $this->payment_method,
            'notes'            => $this->notes,
            'items'            => OrderItemResource::collection($this->whenLoaded('items')),
            'created_at'       => $this->created_at,
            'updated_at'       => $this->updated_at,
        ];
    }
}
