# Add Incoming Stock Feature Plan

## Overview
Add a feature similar to "Add New Tool/Material" but for adding incoming stock to existing items. The user will input additional quantity, and the current date and time will be automatically recorded.

## Tasks
1. **Explore existing structure** - Understand controller, routes, and models for item management
2. **Create routes** - Add GET and POST routes for /items/add-stock
3. **Add controller methods** - Create addStock() and storeStock() methods in ItemController
4. **Create React page** - Create AddStock.jsx component with form to select item and input quantity
5. **Update index page** - Add "Add Incoming Stock" button to Items/Index.jsx
6. **Implement stock logic** - Update item quantity and create history record

## Implementation Details
- Form will have dropdown to select existing item
- Input field for additional quantity
- Date/time automatically set to current
- History logged as 'stock_added' action
- Redirect back to items index with success message
