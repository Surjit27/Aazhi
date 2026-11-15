export const PAGE_WINDOW_SIZE = 9

/**
 * Sliding window of page numbers (max 9) with the current page centered when possible.
 * Near the start: pages 1..9; near the end: last 9; otherwise current sits in the middle.
 */
export function computePageWindow(currentPage, totalPages, windowSize = PAGE_WINDOW_SIZE) {
  if (totalPages <= 0) {
    return { pages: [], start: 0, end: 0, showLeadingEllipsis: false, showTrailingEllipsis: false }
  }
  if (totalPages <= windowSize) {
    const pages = []
    for (let p = 1; p <= totalPages; p++) pages.push(p)
    return {
      pages,
      start: 1,
      end: totalPages,
      showLeadingEllipsis: false,
      showTrailingEllipsis: false,
    }
  }

  const half = Math.floor(windowSize / 2)
  let start = currentPage - half
  let end = currentPage + (windowSize - half - 1)

  if (start < 1) {
    start = 1
    end = windowSize
  }
  if (end > totalPages) {
    end = totalPages
    start = totalPages - windowSize + 1
  }

  const pages = []
  for (let p = start; p <= end; p++) pages.push(p)

  return {
    pages,
    start,
    end,
    showLeadingEllipsis: start > 1,
    showTrailingEllipsis: end < totalPages,
  }
}