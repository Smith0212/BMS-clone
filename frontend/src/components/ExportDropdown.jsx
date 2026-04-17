'use client';

import React from 'react';
import { FaFilePdf, FaFileExcel, FaFileCsv } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setLoader } from '@/store/slices/MasterSlice';
import { Codes } from '@/config/constant';
import { ExportToCSV, ExportToExcel, ExportToPdf, TOAST_ERROR } from '@/config/common';

const ExportDropdown = ({ globalFilterValue, apiCall, fileName }) => {
    const dispatch = useDispatch();

    const handleExportApiCall = async () => {
        dispatch(setLoader(true));
        const { code, data, message } = await apiCall(globalFilterValue); 
        return { code, data, message };
    };

    const handleExport = async (format) => {
        const { code, data, message } = await handleExportApiCall();
        
        if (code === Codes.SUCCESS) {
            switch (format) {
                case 'pdf':
                    ExportToPdf(data?.list, fileName, fileName);
                    break;
                case 'csv':
                    ExportToCSV(data?.list, fileName);
                    break;
                case 'excel':
                    ExportToExcel(data?.list, fileName);
                    break;
                default:
                    console.error('Unknown format:', format);
            }
        } else {
            TOAST_ERROR(message);
        }
        dispatch(setLoader(false));
    };

    return (
        <div className="dropdown">
            <button
                className="btn btn-primary px-4 dropdown-toggle"
                style={{ borderRadius: '5px' }}
                type="button"
                id="exportDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                Export
            </button>
            <ul className="dropdown-menu" aria-labelledby="exportDropdown">
                <li>
                    <button
                        className="dropdown-item d-flex align-items-center"
                        onClick={() => handleExport('pdf')}
                    >
                        <FaFilePdf className="me-2 text-danger" /> PDF
                    </button>
                </li>
                <li>
                    <button
                        className="dropdown-item d-flex align-items-center"
                        onClick={() => handleExport('excel')}
                    >
                        <FaFileExcel className="me-2 text-success" /> Excel
                    </button>
                </li>
                <li>
                    <button
                        className="dropdown-item d-flex align-items-center"
                        onClick={() => handleExport('csv')}
                    >
                        <FaFileCsv className="me-2 text-primary" /> CSV
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default ExportDropdown;