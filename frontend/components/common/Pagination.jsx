import { Button } from "@/components/ui/button";

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  loading = false,
  visiblePages = 5,
  showInfo = true,
  className = "",
  translations = {
    previous: "Өмнөх",
    next: "Дараах",
    pageInfo: (page, totalPages, totalItems) =>
      `Хуудас ${page} / ${totalPages} (Нийт ${totalItems} өгөгдөл)`,
    noData: "дсонгүй",
    totalItems: (count) => `Нийт: ${count} өгөгдөл`,
  },
}) => {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pageNumbers = [];
    const showPages = visiblePages;

    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = startPage + showPages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || loading || page === currentPage)
      return;
    onPageChange(page);
  };

  return (
    <div className={`flex items-center justify-between mt-4 p-3 ${className}`}>
      {showInfo && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {totalItems > 0
            ? translations.pageInfo(currentPage, totalPages, totalItems)
            : translations.noData}
        </div>
      )}

      <div className="flex gap-1">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="text-sm h-8 px-3"
        >
          {translations.previous}
        </Button>

        {/* Page Numbers */}
        {getPageNumbers().map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={pageNumber === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(pageNumber)}
            disabled={loading}
            className={`text-sm h-8 w-8 ${
              pageNumber === currentPage
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : ""
            }`}
          >
            {pageNumber}
          </Button>
        ))}

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0 || loading}
          className="text-sm h-8 px-3"
        >
          {translations.next}
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
