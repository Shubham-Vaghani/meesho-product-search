# Shipping Filter Feature Documentation

## Overview

The shipping filter allows users to filter products based on shipping charges, providing an intuitive way to find products within specific shipping cost ranges.

## Features

### 1. **Default Filter Range**

- Set to ₹50-60 by default as requested
- Can be toggled on/off with a single click

### 2. **Advanced Filter Options**

- **Predefined Ranges**: Quick select buttons for common shipping ranges
  - Free Shipping (₹0)
  - ₹30-40
  - ₹50-60 (default)
  - ₹70-80
  - ₹100+

### 3. **Custom Range Input**

- Users can set custom min/max shipping cost ranges
- Input validation ensures min ≤ max and non-negative values
- Real-time range updates

### 4. **Smart Filtering Logic**

- **Free Shipping**: Correctly handles products with null, undefined, or 0 shipping charges
- **Paid Shipping**: Filters products within the specified range
- **Inclusive Range**: Products with shipping charges exactly equal to min/max are included

### 5. **User Experience Enhancements**

- **Results Counter**: Shows "X of Y products" when filter is active
- **Expandable Interface**: Compact by default, expandable for advanced options
- **Clear Filter**: Easy one-click filter reset
- **No Results Message**: Specific message when no products match the filter
- **Filter State Persistence**: Filter settings persist during the session

## How to Use

### Basic Usage

1. Search for products
2. Once results are loaded, the shipping filter appears below the search bar
3. Check the checkbox to enable the default ₹50-60 filter
4. View filtered results instantly

### Advanced Usage

1. Click the expand arrow (⌄) to access advanced options
2. Choose from predefined ranges or set custom ranges
3. Click "Apply" for custom ranges
4. Use "Clear" to reset all filters

## Technical Implementation

### Filter Logic

```typescript
// Smart shipping filter logic
const filteredProducts = products.filter((product) => {
  const shipping = product?.shipping_charges_adjustment;

  // Handle free shipping case
  if (minRange === 0 && maxRange === 0) {
    return shipping === null || shipping === undefined || shipping === 0;
  }

  // Handle paid shipping ranges
  if (shipping === null || shipping === undefined || shipping === 0) {
    return false;
  }

  return shipping >= minRange && shipping <= maxRange;
});
```

### State Management

- Uses React hooks for state management
- Memoized filtered products for performance
- Optimized re-renders with useCallback

## Benefits

1. **Performance**: Frontend filtering means instant results
2. **Flexibility**: Multiple ways to set shipping ranges
3. **User-Friendly**: Intuitive interface with helpful feedback
4. **Accurate**: Handles edge cases like free shipping correctly
5. **Responsive**: Works on all device sizes
