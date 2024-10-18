import React from "react";
import { Chip, Box } from "@mui/material";
import { Star, StarHalf } from "@mui/icons-material";

const RatingChip = ({ rating, review }: any) => {
  return (
    <Box display="flex" alignItems="center">
      <Chip
        icon={rating % 1 === 0 ? <Star /> : <StarHalf />}
        label={rating ?? 0}
        color="primary"
        sx={{
          backgroundColor: "#1e8c46e8",
          fontWeight: "bold",
          paddingLeft: "4px",
          paddingRight: "4px",
        }}
      />

      <span className="ml-2 text-gray-600 text-sm font-semibold whitespace-nowrap">
        {review ?? 0} Rview
      </span>
    </Box>
  );
};

export default RatingChip;
