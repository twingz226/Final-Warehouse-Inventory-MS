# Separate Total Stock by Units (pcs and kg)

Modify the dashboard to display total stock separated by units: pcs for 'Quantity' items and kg for 'Kg' items.

- Update the dashboard route in web.php to calculate totalStockPcs (sum of quantities where unit='Quantity') and totalStockKg (sum where unit='Kg').
- Update Dashboard.jsx props to accept totalStockPcs and totalStockKg, and modify the Total Stock card to display both values in the format "X pcs, Y kg".
