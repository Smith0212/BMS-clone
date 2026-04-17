// src/config/common.js
'use client';
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useContext } from "react";
import { UserContext } from "@/context/UserData";
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { setModalStatus } from "@/store/slices/MasterSlice";

export const closeModel = (dispatch) => {
    dispatch(setModalStatus({ modalType: '', isOpen: false }));
};

export const openModel = (dispatch, type) => {
    dispatch(setModalStatus({ modalType: type, isOpen: true }));
};

// This function uses useContext, so it can only be called from React components
export const CHECK_PERMIT = (module, permit) => {
    const { role, rights } = useContext(UserContext);
    
    if (role === 'super_admin' || (role === 'sub_admin' && rights?.[module]?.includes(permit))) {
        return true;
    }
    return false;
};

export const SWIT_SUCCESS = (message) => {
    return Swal.fire({
        position: 'top-center',
        icon: 'success',
        title: message,
        showConfirmButton: false,
        timer: 1800
    });
};

export const SWIT_DELETE = (message) => {
    return Swal.fire({
        title: 'Are you sure?',
        text: message ? message : "",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1072BE',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    });
};

export const SWIT_CONFIRM = (message, button) => {
    return Swal.fire({
        title: 'Are you sure?',
        text: message ? message : "",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1072BE',
        cancelButtonColor: '#d33',
        confirmButtonText: button || 'yes'
    });
};

export const SWIT_DELETE_SUCCESS = (message) => {
    return Swal.fire({
        position: 'top-center',
        icon: 'success',
        title: message ? message : 'Your data has been deleted.',
        showConfirmButton: false,
        timer: 1500
    });
};

export const SWIT_LOGOUT = (message) => {
    return Swal.fire({
        title: 'Are you sure logout?',
        text: message ? message : "",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1072BE',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, logout it!'
    });
};

export const TOAST_SUCCESS = (message) => {
    return toast.success(message);
};

export const TOAST_INFO = (message) => {
    return toast.info(message);
};

export const TOAST_ERROR = (message) => {
    return toast.error(message);
};

export const TOAST_WARNING = (message) => {
    return toast.warning(message);
};

export const WARNING_MODEL = () => {
    return (
        <div className="modal fade" id="al-danger-alert" tabIndex={-1} aria-labelledby="vertical-center-modal" aria-hidden="true">
            <div className="modal-dialog modal-sm">
                <div className="modal-content modal-filled bg-light-danger">
                    <div className="modal-body p-4">
                        <div className="text-center text-danger">
                            <i className="ti ti-hexagon-letter-x fs-7" />
                            <h4 className="mt-2">Oh snap!</h4>
                            <p className="mt-3">
                                Cras mattis consectetur purus sit amet
                                fermentum.Cras justo odio, dapibus ac
                                facilisis in, egestas eget quam.
                            </p>
                            <button type="button" className="btn btn-light my-2" data-bs-dismiss="modal">
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ExportToCSV = (data, fileName) => {
    try {
        let csvContent = '';
        if (Array.isArray(data) && data.length > 0) {
            if (Array.isArray(data[0])) {
                csvContent = data.map(row => row.join(",")).join("\n");
            } else if (typeof data[0] === 'object') {
                const headers = Object.keys(data[0]);
                csvContent += headers.join(",") + "\n";
                csvContent += data.map(row =>
                    headers.map(header => row[header]).join(",")
                ).join("\n");
            }
        }
        const blob = new Blob([csvContent], { type: 'text/csv' });

        if (window.navigator.msSaveBlob) {
            window.navigator.msSaveBlob(blob, `${fileName}.csv`);
        } else {
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `${fileName}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                TOAST_ERROR('Your browser does not support downloading files');
            }
        }
    } catch (error) {
        TOAST_ERROR(error);
    }
};

export const ExportToExcel = (data, fileName) => {
    try {
        const columns = Object.keys(data[0])?.map(item => item?.replace('_', ' ')?.toUpperCase());
        const columns1 = Object.keys(data[0]);

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Sheet 1');

        ws.addRow(columns);

        data.forEach(item => {
            const row = [];
            columns1.forEach(column => {
                row.push(item[column]);
            });
            ws.addRow(row);
        });

        wb.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', `${fileName}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    } catch (error) {
        TOAST_ERROR(error);
    }
};

export const ExportToPdf = (data, fileName, header) => {
    try {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(header, 14, 10);
        doc.setLineWidth(0.5);
        doc.line(14, 12, 196, 12);
        doc.setFontSize(18);

        const columns = Object.keys(data[0])?.map(item => item?.replace('_', ' ')?.toUpperCase());
        const tableData = data.map(item => Object.values(item));
        doc.autoTable(columns, tableData);
        doc.save(`${fileName}.pdf`);
    } catch (error) {
        TOAST_ERROR(error);
    }
};