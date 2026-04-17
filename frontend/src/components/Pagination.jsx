'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const Pagination = ({
    totalPages,
    currentPage,
    onPageChange,
    totalEntries,
    entriesPerPage,
    pageRange = 2,
}) => {
    const pathname = usePathname();
    const MODULE_PATH = pathname;

    useEffect(() => {
        const storedModule = localStorage.getItem('modulePath');
        if (storedModule !== MODULE_PATH) { 
            onPageChange(1); 
            localStorage.setItem('modulePath', MODULE_PATH);
        } else {
            const storedPage = parseInt(localStorage.getItem('currentPage'), 10);
            if (storedPage) onPageChange(storedPage);
        }
    }, [MODULE_PATH, onPageChange]);

    // Update local storage when currentPage changes
    useEffect(() => {
        localStorage.setItem('currentPage', currentPage);
    }, [currentPage]);

    const [page, setPage] = useState(currentPage || 1);

    useEffect(() => {
        setPage(currentPage);
    }, [currentPage]);

    // Navigate to the previous page
    const handlePrevious = () => {
        if (page > 1) {
            const newPage = page - 1;
            setPage(newPage);
            onPageChange(newPage);
        }
    };

    // Navigate to the next page
    const handleNext = () => {
        if (page < totalPages) {
            const newPage = page + 1;
            setPage(newPage);
            onPageChange(newPage);
        }
    };

    // Set page when clicked directly
    const handlePageChange = (pageNum) => {
        setPage(pageNum);
        onPageChange(pageNum);
    };

    // Generate the array of page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const totalNumbers = pageRange * 2 + 3;
        const totalBlocks = totalNumbers + 2;

        if (totalPages > totalBlocks) {
            const startPage = Math.max(2, page - pageRange);
            const endPage = Math.min(totalPages - 1, page + pageRange);

            pages.push(1);

            if (startPage > 2) {
                pages.push('...');
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            if (endPage < totalPages - 1) {
                pages.push('...');
            }

            pages.push(totalPages);
        } else {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    // Calculate the range of visible entries
    const getShowingRange = () => {
        const start = (page - 1) * entriesPerPage + 1;
        const end = Math.min(page * entriesPerPage, totalEntries);
        return `Showing ${start} to ${end} of ${totalEntries} entries`;
    };

    return (
        <div className="row">
            {/* Left side: showing range */}
            <div className="col-md-6 d-flex">
                <p className="mb-0">{getShowingRange()}</p>
            </div>

            {/* Right side: pagination */}
            <div className="col-md-6 d-flex justify-content-end">
                <nav aria-label="Page navigation example">
                    <ul className="pagination">
                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                            <span 
                                className="page-link" 
                                style={{ cursor: page === 1 ? 'not-allowed' : 'pointer' }} 
                                onClick={handlePrevious}
                            >
                                Previous
                            </span>
                        </li>

                        {getPageNumbers().map((pageNumber, index) => (
                            <li
                                key={index}
                                className={`page-item ${page === pageNumber ? 'active' : ''} ${pageNumber === '...' ? 'disabled' : ''}`}
                            >
                                {pageNumber === '...' ? (
                                    <span className="page-link">...</span>
                                ) : (
                                    <span 
                                        className="page-link" 
                                        style={{ cursor: 'pointer' }} 
                                        onClick={() => handlePageChange(pageNumber)}
                                    >
                                        {pageNumber}
                                    </span>
                                )}
                            </li>
                        ))}

                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                            <span 
                                className="page-link" 
                                style={{ cursor: page === totalPages ? 'not-allowed' : 'pointer' }} 
                                onClick={handleNext}
                            >
                                Next
                            </span>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default Pagination;