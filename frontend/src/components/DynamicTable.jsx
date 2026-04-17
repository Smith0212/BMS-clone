"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { SWIT_CONFIRM } from "../config/common";
import { FaAngleUp, FaAngleDown } from "react-icons/fa";
import React from "react";
import Image from "next/image";

const DynamicTable = ({
  columns,
  rows,
  perms,
  is_status,
  deleteRow,
  editRow,
  viewRow,
  changeStatus,
  is_action = true,
  is_action_permit,
  is_view_permit,
  is_edit_permit,
  sortConfig,
  handleSort
}) => {

  const renderSortIcon = (colName) => {
    if (sortConfig.key !== colName) {
      return (
        <div className="d-flex flex-column">
          <FaAngleUp size={11} color="#c4c4c4" />
          <FaAngleDown size={11} color="#c4c4c4" />
        </div>
      );
    }
    return sortConfig.direction === "asc" ? (
      <div className="d-flex flex-column">
        <FaAngleUp size={11} />
        <FaAngleDown size={11} color="#c4c4c4" />
      </div>
    ) : (
      <div className="d-flex flex-column">
        <FaAngleUp size={11} color="#c4c4c4" />
        <FaAngleDown size={11} />
      </div>
    );
  };

  const renderCondition = (cond) => {
    const label = cond.label?.toLowerCase();

    // YES / NO (Subscription status)
    if (label === "yes") {
      return (
        <span className="badge rounded-pill bg-success-subtle text-success px-3 py-1">
          {cond.label}
        </span>
      );
    }

    if (label === "no") {
      return (
        <span className="badge rounded-pill bg-danger-subtle text-danger px-3 py-1">
          {cond.label}
        </span>
      );
    }

    // Active / Offline (Login status)
    if (label === "active" || label === "offline") {
      return (
        <div className="d-flex align-items-center gap-2">
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              display: "inline-block",
              backgroundColor: label === "active" ? "#198754" : "#dc3545"
            }}
          />
          <span className="text-muted">{cond.label}</span>
        </div>
      );
    }

    // Fallback
    return (
      <span className={cond.className || "text-muted"}>
        {cond.label}
      </span>
    );
  };

  return (
    <div className="mb-3">
<div className="table-responsive border rounded-4 shadow-sm bg-white overflow-x-auto">
        <table className="table align-middle text-nowrap mb-0 text-center">

          {/* ================= THEAD ================= */}
          <thead className="bg-light sticky-top" style={{ zIndex: 100 }}>
            <tr>
              {columns?.map((col, index) => (
                <th
                  key={index}
                  onClick={() => { !col?.is_image && handleSort(col.name) }}
                  className="px-3 py-3 text-start"
                  style={{ cursor: !col?.is_image ? "pointer" : "default" }}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <span className="text-muted">{col.title}</span>
                    {!col?.is_image && renderSortIcon(col.name)}
                  </div>
                </th>
              ))}

              <th
                onClick={() => handleSort("created_at")}
                className="px-3 py-3 text-start"
                style={{cursor:'pointer'}}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <span className="text-muted">Created At</span>
                  {renderSortIcon("created_at")}
                </div>
              </th>

              {is_status && (
                <th className="px-3 py-3">
                  <span className="text-muted">Status</span>
                </th>
              )}

              {(is_action && (is_action_permit || is_edit_permit || is_view_permit)) && (
                <th className="px-3 py-3">
                  <span className="text-muted">Action</span>
                </th>
              )}
            </tr>
          </thead>

          {/* ================= TBODY ================= */}
          <tbody>
            {rows?.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-top table-row-hover"
              >
                {columns?.map((col, colIndex) => (
                  <td key={colIndex} className="px-3 py-3 text-start">

                    {col.is_image ? (
                      <img
                        src={row[col.name]}
                        alt="Profile"
                        className="rounded-circle border"
                        width={42}
                        height={42}
                        style={{ objectFit: "cover" }}
                      />
                    ) : col.condition ? (
                      col.condition.map(
                        cond =>
                          cond.value === String(row[col.name]) && (
                            <React.Fragment key={cond.value}>
                              {renderCondition(cond)}
                            </React.Fragment>
                          )
                      )
                    ) : col.name === "login_status" ? (
                      <div className="d-flex align-items-center gap-2">
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            display: "inline-block",
                            backgroundColor:
                              String(row[col.name]).toLowerCase() === "active"
                                ? "#198754"
                                : "#dc3545"
                          }}
                        />
                        <span className="text-muted">
                          {row[col.name]}
                        </span>
                      </div>
                    ) : (
                      <p className="mb-0 fw-normal text-dark text-wrap">
                        {col?.render ? col?.render(row) : row[col.name]}
                      </p>
                    )
                    }
                  </td>
                ))}

                <td className="px-3 py-3 text-start">
                  <span className="text-muted">
                    {dayjs(row?.created_at).format("DD MMM YYYY")}
                  </span>
                </td>

                {is_status && (
                  <td className="px-3 py-3">
                    <div className="form-check form-switch d-flex justify-content-center">
                      <input
                        style={{cursor:'pointer'}}
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        checked={row.is_active === true}
                        onChange={() => {
                          SWIT_CONFIRM("Can you change status?", "Yes, change it").then(
                            (r) => r?.isConfirmed && changeStatus(row)
                          );
                        }}
                        disabled={!is_action_permit}
                      />
                    </div>
                  </td>
                )}

                {(is_action && (is_action_permit || is_edit_permit || is_view_permit)) && (
                  <td className="px-3 py-3">
                    <div className="dropdown dropstart">
                      <button
                        className="btn btn-sm btn-light rounded-circle"
                        data-bs-toggle="dropdown"
                        type="button"
                      >
                        <i className="ti ti-dots-vertical"></i>
                      </button>

                      <ul className="dropdown-menu shadow-sm border-0">
                        {(perms?.is_view && is_view_permit) && (
                          <li>
                            <button className="dropdown-item" onClick={() => viewRow(row)}>
                              <i className="ti ti-eye me-2"></i> View
                            </button>
                          </li>
                        )}
                        {(perms?.is_edit && is_edit_permit) && (
                          <li>
                            <button className="dropdown-item" onClick={() => editRow(row)}>
                              <i className="ti ti-edit me-2"></i> Edit
                            </button>
                          </li>
                        )}
                        {(perms?.is_delete && is_action_permit) && (
                          <li>
                            <button className="dropdown-item text-danger" onClick={() => deleteRow(row)}>
                              <i className="ti ti-trash me-2"></i> Delete
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .table-row-hover:hover {
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
};

export default DynamicTable;