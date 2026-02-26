<?php

namespace App\Imports;

use App\Models\Item;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Carbon\Carbon;

class ItemsImport implements ToModel, WithValidation, WithHeadingRow
{
    /**
     * @param array $row
     */
    public function model(array $row)
    {
        return new Item([
            'name' => $row['name'],
            'description' => $row['description'] ?? null,
            'category' => $row['category'],
            'quantity' => $row['quantity'],
            'unit' => $row['unit'],
            'date_time' => isset($row['date_time']) && !empty($row['date_time']) 
                ? Carbon::parse($row['date_time']) 
                : now(),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:items,name',
            'description' => 'nullable|string',
            'category' => 'required|in:tool,material',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|in:Quantity,Kg',
            'date_time' => 'nullable|date',
        ];
    }
}
