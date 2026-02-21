# Move "Add Borrowing Record" Button to Header Section

## Summary
Move the "Add Borrowing Record" button from its current position inside the page content to the header section, similar to how buttons are positioned in the "Incoming Items" page.

## Current State
- The button is currently located in the page content within a flex container alongside the title and description (lines 106-120 in Borrowed/Index.jsx)
- The header prop only contains the page title (lines 93-98)

## Proposed Changes
1. Update the header prop in Borrowed/Index.jsx to include the "Add Borrowing Record" button positioned next to the title, similar to the layout in Purchases/Index.jsx and Items/Index.jsx
2. Remove the button from its current location in the page content
3. Ensure the button styling matches the header button style used in other pages

## Files to Modify
- `/opt/lampp/htdocs/Deka Sales Inventory/resources/js/Pages/Borrowed/Index.jsx`

## Implementation Steps
1. Modify the header prop to include a flex container with title and button
2. Remove the button element from the page content section
3. Test that the layout and functionality work correctly
