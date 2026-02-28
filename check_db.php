<?php
require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$items = \App\Models\Item::all();
echo "Total distinct items in database: " . $items->count() . "\n\n";

echo str_pad("ITEM NAME", 40) . " | " . str_pad("QTY", 10) . " | " . "DATE\n";
echo str_repeat("-", 70) . "\n";

foreach($items as $item) {
    echo str_pad(substr($item->name, 0, 38), 40) . " | " . str_pad($item->quantity . ' ' . $item->unit, 10) . " | " . $item->date_time . "\n";
}

echo "\n--- ITEM HISTORY LOGS ---\n";
$histories = \App\Models\ItemHistory::with('item')->latest()->take(10)->get();
foreach ($histories as $history) {
    $itemName = $history->item ? $history->item->name : 'Unknown';
    echo "Action: {$history->action} | Item: {$itemName} | User: {$history->user_id} | Desc: {$history->description}\n";
}
