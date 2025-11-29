import React, { useState, useCallback } from "react";
import {
  Box,
  Chip,
  Checkbox,
  FormControlLabel,
  TextField,
  Button,
  Collapse,
  IconButton,
  Typography,
  Divider,
  InputAdornment,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
  CurrencyRupee as RupeeIcon,
} from "@mui/icons-material";

interface ShippingFilterProps {
  shippingFilter: {
    enabled: boolean;
    minRange: number;
    maxRange: number;
  };
  onFilterChange: (filter: {
    enabled: boolean;
    minRange: number;
    maxRange: number;
  }) => void;
  totalProducts: number;
  filteredProducts: number;
}

const ShippingFilter: React.FC<ShippingFilterProps> = ({
  shippingFilter,
  onFilterChange,
  totalProducts,
  filteredProducts,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [tempMinRange, setTempMinRange] = useState(shippingFilter.minRange);
  const [tempMaxRange, setTempMaxRange] = useState(shippingFilter.maxRange);

  const handleToggleFilter = useCallback(() => {
    onFilterChange({
      ...shippingFilter,
      enabled: !shippingFilter.enabled,
    });
  }, [shippingFilter, onFilterChange]);

  const handleRangeUpdate = useCallback(() => {
    if (tempMinRange <= tempMaxRange && tempMinRange >= 0) {
      onFilterChange({
        enabled: true, // Auto-enable when applying custom range
        minRange: tempMinRange,
        maxRange: tempMaxRange,
      });
    }
  }, [tempMinRange, tempMaxRange, onFilterChange]);

  const handleDirectRangeChange = useCallback(
    (min: number, max: number) => {
      if (min <= max && min >= 0) {
        setTempMinRange(min);
        setTempMaxRange(max);
        onFilterChange({
          enabled: true,
          minRange: min,
          maxRange: max,
        });
      }
    },
    [onFilterChange]
  );

  const handleClearFilter = useCallback(() => {
    onFilterChange({
      enabled: false,
      minRange: 50,
      maxRange: 60,
    });
    setTempMinRange(50);
    setTempMaxRange(60);
  }, [onFilterChange]);

  const predefinedRanges = [
    { label: "Free Shipping", min: 0, max: 0 },
    { label: "₹30-40", min: 30, max: 40 },
    { label: "₹50-60", min: 50, max: 60 },
    { label: "₹70-80", min: 70, max: 80 },
    { label: "₹100+", min: 100, max: 999 },
  ];

  const handlePredefinedRange = (min: number, max: number) => {
    setTempMinRange(min);
    setTempMaxRange(max);
    onFilterChange({
      enabled: true,
      minRange: min,
      maxRange: max,
    });
    setExpanded(false);
  };

  return (
    <Box className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterIcon className="text-gray-600" fontSize="small" />
          <Typography variant="body2" className="font-medium text-gray-700">
            Shipping Filters
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          {shippingFilter.enabled && (
            <Button
              size="small"
              variant="text"
              onClick={handleClearFilter}
              startIcon={<ClearIcon />}
              sx={{ minWidth: "auto", fontSize: "0.75rem" }}
            >
              Clear
            </Button>
          )}

          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            className="text-gray-600"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </div>
      </div>

      {/* Dynamic Range Input - Always Visible */}
      <div className="flex items-center justify-between mt-3 gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={shippingFilter.enabled}
            onChange={handleToggleFilter}
            size="small"
          />
          <Typography variant="body2" className="text-gray-600 min-w-fit">
            Shipping:
          </Typography>

          <TextField
            label="Min"
            type="number"
            value={tempMinRange}
            onChange={(e) => {
              const value = Number(e.target.value);
              setTempMinRange(value);
              if (value <= tempMaxRange && value >= 0) {
                handleDirectRangeChange(value, tempMaxRange);
              }
            }}
            size="small"
            inputProps={{ min: 0 }}
            sx={{ width: 90 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₹</InputAdornment>
              ),
            }}
          />

          <Typography variant="body2" className="text-gray-400">
            to
          </Typography>

          <TextField
            label="Max"
            type="number"
            value={tempMaxRange}
            onChange={(e) => {
              const value = Number(e.target.value);
              setTempMaxRange(value);
              if (tempMinRange <= value && tempMinRange >= 0) {
                handleDirectRangeChange(tempMinRange, value);
              }
            }}
            size="small"
            inputProps={{ min: 0 }}
            sx={{ width: 90 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₹</InputAdornment>
              ),
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          {shippingFilter.enabled && (
            <>
              <Chip
                label={`${filteredProducts}/${totalProducts}`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Button
                size="small"
                variant="text"
                onClick={handleClearFilter}
                startIcon={<ClearIcon />}
                sx={{ minWidth: "auto", fontSize: "0.75rem" }}
              >
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Quick Presets - Toggleable */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex flex-wrap gap-1">
          {predefinedRanges.map((range, index) => (
            <Chip
              key={index}
              label={range.label}
              size="small"
              clickable
              variant={
                shippingFilter.minRange === range.min &&
                shippingFilter.maxRange === range.max &&
                shippingFilter.enabled
                  ? "filled"
                  : "outlined"
              }
              onClick={() => {
                setTempMinRange(range.min);
                setTempMaxRange(range.max);
                handlePredefinedRange(range.min, range.max);
              }}
              className="text-xs"
            />
          ))}
        </div>

        <IconButton
          size="small"
          onClick={() => setExpanded(!expanded)}
          className="text-gray-600"
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </div>

      {/* Advanced Options - Collapsible */}
      <Collapse in={expanded}>
        <Box className="mt-3 p-3 bg-gray-50 rounded-lg">
          <Typography variant="caption" className="text-gray-600 mb-2 block">
            Advanced Tips:
          </Typography>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Enter 0 to 0 for free shipping only</li>
            <li>• Use large max values (999) for "X and above"</li>
            <li>• Filter updates automatically as you type</li>
          </ul>
        </Box>
      </Collapse>
    </Box>
  );
};

export default ShippingFilter;
