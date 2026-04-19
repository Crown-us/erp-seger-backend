<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'name'             => $this->name,
            'description'      => $this->description,
            'price'            => $this->price,
            'original_price'   => $this->original_price,
            'discount_percent' => $this->discount_percent,
            'stock'            => $this->stock,
            'unit'             => $this->unit,
            'emoji'            => $this->emoji,
            'image_url'        => $this->image_url,
            'category'         => $this->category,
            'is_active'        => $this->is_active,
            'merchant'         => new UserResource($this->whenLoaded('user')),
            'created_at'       => $this->created_at,
            'updated_at'       => $this->updated_at,
        ];
    }
}
