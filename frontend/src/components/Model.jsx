'use client';

import { closeModel } from '@/config/common';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Model = ({ title = '', children }) => {
    const dispatch = useDispatch();
    const { customModel: { isOpen } } = useSelector((state) => state.masterSlice);

    return (
        <div
            className={`modal fade ${isOpen ? "show" : ""}`}
            id="scroll-long-outer-modal"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex="-1"
            aria-labelledby="scroll-long-outer-modal"
            aria-hidden={!isOpen}
            style={{ display: isOpen ? "block" : "none", overflow: "hidden" }}
        >
            <div className="modal-dialog modal-dialog-scrollable modal-lg modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header d-flex align-items-center">
                        <h4 className="modal-title">{title}</h4>
                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={() => closeModel(dispatch)}
                        ></button>
                    </div>
                    <div className="modal-body">
                        {children}
                    </div>
                    {/* <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-light-danger text-danger font-medium waves-effect text-start"
                            onClick={() => closeModel(dispatch)}
                        >
                            Close
                        </button>
                    </div> */}
                </div>
            </div>
            {isOpen && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default Model;