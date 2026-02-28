<?php

namespace App\Imports;

use App\Models\Item;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Carbon\Carbon;

use Illuminate\Support\Facades\Auth;
use App\Models\ItemHistory;

class ItemsImport implements \Maatwebsite\Excel\Concerns\OnEachRow, WithValidation, WithHeadingRow, SkipsEmptyRows
{
    protected $headingRow;

    public function __construct(int $headingRow = 1)
    {
        $this->headingRow = $headingRow;
    }

    public function headingRow(): int
    {
        return $this->headingRow;
    }

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

    public function onRow(\Maatwebsite\Excel\Row $rowObj)
    {
        $row = $rowObj->toArray();

        $name = $row['name'] ?? ($row['description'] ?? null);
        $category = $row['category'] ?? 'material';
        $quantity = $row['quantity'] ?? ($row['in'] ?? 0);
        $unit = $row['unit'] ?? 'pcs';
        $dateTimeValue = $row['date_time'] ?? ($row['date'] ?? null);

        $date = now();
        if (!empty($dateTimeValue)) {
            try {
                // Handle raw Excel numerical dates
                if (is_numeric($dateTimeValue)) {
                    $date = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($dateTimeValue);
                } else {
                    $date = Carbon::parse($dateTimeValue);
                }
            } catch (\Exception $e) {
                $date = now();
            }
        }

        if (empty($name)) {
            return;
        }

        $existingItem = Item::where('name', $name)->first();
        $user_id = Auth::id() ?? 1; // Fallback to 1 if console import

        if ($existingItem) {
            $oldQuantity = $existingItem->quantity;
            $newQuantity = $oldQuantity + (float) $quantity;
            
            // If the item exists, just add the imported quantity to the existing quantity
            $existingItem->quantity = $newQuantity;
            $existingItem->date_time = $date;
            $existingItem->save();
            
            // Log history
            ItemHistory::create([
                'item_id' => $existingItem->id,
                'user_id' => $user_id,
                'action' => 'stock_added',
                'old_values' => ['quantity' => $oldQuantity],
                'new_values' => ['quantity' => $newQuantity],
                'description' => "Added {$quantity} " . (in_array($existingItem->unit, ['Quantity', 'pcs']) ? 'pcs' : 'kg') . " to stock via Excel Import.",
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        } else {
            // Otherwise create a new item
            $newItem = Item::create([
                'name' => $name,
                'description' => null,
                'category' => $category,
                'quantity' => (float) $quantity,
                'unit' => $unit,
                'date_time' => $date,
                'created_at' => $date,
                'updated_at' => $date,
            ]);
            
            // Log history
            ItemHistory::create([
                'item_id' => $newItem->id,
                'user_id' => $user_id,
                'action' => 'created',
                'old_values' => null,
                'new_values' => $newItem->toArray(),
                'description' => "New item '{$newItem->name}' added — {$newItem->quantity} " . (in_array($newItem->unit, ['Quantity', 'pcs']) ? 'pcs' : 'kg') . " in stock via Excel Import.",
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => 'nullable|string|max:255', // Make it nullable to avoid throwing errors on empty trailing rows
            'description' => 'nullable|string',
            'category' => 'required|in:tool,material',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|in:Quantity,Kg,pcs',
            'date_time' => 'nullable',
        ];
    }
}
