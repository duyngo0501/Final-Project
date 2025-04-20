import React from "react";
import { Pagination } from "antd";
import { PaginationProps } from "antd/es/pagination";

interface GamePaginationProps {
  currentPage: number;
  pageSize: number;
  totalResults: number;
  onPageChange: PaginationProps["onChange"];
}

/**
 * @description Pagination component for the games list.
 * @param {GamePaginationProps} props
 * @returns {React.FC<GamePaginationProps>}
 */
const GamePagination: React.FC<GamePaginationProps> = ({
  currentPage,
  pageSize,
  totalResults,
  onPageChange,
}) => {
  if (totalResults <= pageSize) {
    return null; // Don't show pagination if only one page
  }

  return (
    <Pagination
      aria-label="Game list pagination"
      current={currentPage}
      pageSize={pageSize}
      total={totalResults}
      onChange={onPageChange}
      showSizeChanger
      pageSizeOptions={["12", "24", "36", "48"]}
      style={{ textAlign: "center", marginTop: "20px" }}
    />
  );
};

export default GamePagination;
