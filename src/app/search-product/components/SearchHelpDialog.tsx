import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Box,
} from "@mui/material";
import {
  Close as CloseIcon,
  History as HistoryIcon,
  TrendingUp as TrendingIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

interface SearchHelpDialogProps {
  open: boolean;
  onClose: () => void;
  searchHistory: string[];
  onHistoryClick: (term: string) => void;
}

const searchTips = [
  "Use specific product names for better results",
  "Try searching by brand names",
  "Use category names like 'dress', 'shoes', 'bags'",
  "Search by color or material",
  "Check spelling for better matches",
];

const popularSearches = [
  "women dress",
  "men shirt",
  "shoes",
  "bags",
  "jewelry",
  "saree",
  "kurta",
  "jeans",
  "tops",
  "accessories",
];

const SearchHelpDialog: React.FC<SearchHelpDialogProps> = ({
  open,
  onClose,
  searchHistory,
  onHistoryClick,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="flex justify-between items-center">
        <span>Search Help</span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Search History */}
        {searchHistory.length > 0 && (
          <Box className="mb-4">
            <div className="flex items-center mb-2">
              <HistoryIcon className="text-gray-500 mr-2" fontSize="small" />
              <span className="font-medium text-sm">Recent Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((term, index) => (
                <Chip
                  key={index}
                  label={term}
                  size="small"
                  clickable
                  onClick={() => {
                    onHistoryClick(term);
                    onClose();
                  }}
                  className="hover:bg-indigo-50"
                />
              ))}
            </div>
          </Box>
        )}

        {/* Popular Searches */}
        <Box className="mb-4">
          <div className="flex items-center mb-2">
            <TrendingIcon className="text-gray-500 mr-2" fontSize="small" />
            <span className="font-medium text-sm">Popular Searches</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((term, index) => (
              <Chip
                key={index}
                label={term}
                size="small"
                variant="outlined"
                clickable
                onClick={() => {
                  onHistoryClick(term);
                  onClose();
                }}
                className="hover:bg-gray-50"
              />
            ))}
          </div>
        </Box>

        {/* Search Tips */}
        <Box>
          <div className="flex items-center mb-2">
            <SearchIcon className="text-gray-500 mr-2" fontSize="small" />
            <span className="font-medium text-sm">Search Tips</span>
          </div>
          <List dense>
            {searchTips.map((tip, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={tip}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    color: "text.secondary",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SearchHelpDialog;
