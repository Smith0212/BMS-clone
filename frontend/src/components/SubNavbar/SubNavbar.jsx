'use client';
import Link from 'next/link';
import { FaAngleRight } from "react-icons/fa";

export default function SubNavbar({ pathData, title }) {
  const defaultPathData = [{ name: 'Dashboard', path: '/' }, ...pathData];

  return (
    <div className="bg-white rounded-4 border shadow-sm px-4 py-3 mb-4">
      
      {/* Title */}
      <h5 className="mb-2" style={{ color: '#6c757d' }}>
        {title}
      </h5>

      {/* Breadcrumb below title */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb m-0 p-0 d-flex align-items-center">
          {defaultPathData.map((item, index) => (
            <div key={index} className="d-flex align-items-center">
              <li
                className={`breadcrumb-item ${
                  defaultPathData.length === index + 1 ? 'active active-color' : ''
                }`}
                aria-current={defaultPathData.length === index + 1 ? 'page' : undefined}
              >
                {defaultPathData.length === index + 1 ? (
                  <span className="text-muted">{item.name}</span>
                ) : (
                  <Link
                    className="text-muted text-decoration-none"
                    href={item.path}
                  >
                    {item.name}
                  </Link>
                )}
              </li>

              {/* Separator */}
              {index < defaultPathData.length - 1 && (
                <span
                  className="mx-2 d-flex align-items-center"
                  style={{ fontSize: '0.9rem', color: '#6c757d' }}
                >
                  <FaAngleRight />
                </span>
              )}
            </div>
          ))}
        </ol>
      </nav>
    </div>
  );
}
