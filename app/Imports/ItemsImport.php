<?php

namespace App\Imports;

use App\Models\Item;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Carbon\Carbon;

class ItemsImport implements ToModel, WithValidation, WithHeadingRow
{
    public function prepareForValidation($data, $index)
    {
        return [
            // Excel's "DESCRIPTION" -> System's "name"
            'name' => $data['description'] ?? ($data['name'] ?? null),
            
            // Because Excel's DESCRIPTION is used for Name, we leave system description empty
            'description' => null,
            
            // Assume category is "material" if not present in Excel
            'category' => $data['category'] ?? 'material',
            
            // Excel's "IN" -> System's "quantity"
            'quantity' => $data['in'] ?? ($data['quantity'] ?? 0),
            
            // Assume unit is "pcs" if not present in Excel
            'unit' => $data['unit'] ?? 'pcs',
            
            // Excel's "DATE" -> System's "date_time"
            'date_time' => $data['date'] ?? ($data['date_time'] ?? null),
        ];
    }

    public function model(array $row)
    {
        $date = now();
        if (!empty($row['date_time'])) {
            try {
                // Handle raw Excel numerical dates
                if (is_numeric($row['date_time'])) {
                    $date = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($row['date_time']);
                } else {
                    $date = Carbon::parse($row['date_time']);
                }
            } catch (\Exception $e) {
                $date = now();
            }
        }

        return new Item([
            'name' => $row['name'],
            'description' => $row['description'],
            'category' => $row['category'],
            'quantity' => $row['quantity'],
            'unit' => $row['unit'],
            'date_time' => $date,
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:items,name',
            'description' => 'nullable|string',
            'category' => 'required|in:tool,material',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|in:Quantity,Kg,pcs',
            'date_time' => 'nullable',
        ];
    }
}
