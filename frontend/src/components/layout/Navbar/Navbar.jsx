// // src/components/layout/navbar/Navbar.jsx
// 'use client';
// import { useState, useEffect, useRef, useContext } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// // import * as API from '@/utils/api.services';
// import Constant, { Codes } from '@/config/constant';
// import { SWIT_LOGOUT, TOAST_SUCCESS } from '@/config/common';
// import { UserContext } from '@/context/UserData';
// import { formatTypeName } from '@/config/validation';
// // import ChangePassword from '@/components/ChangePassword';
// // import { DarkModeContext } from '@/context/DarkMode'; // adjust path as needed

// export default function Navbar() {
//   const [showDropdown, setShowDropdown] = useState(false);
//   const dropdownRef = useRef(null);
//   const router = useRouter();
//   const { user, role } = useContext(UserContext);
//   // const { darkMode, toggle } = useContext(DarkModeContext);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowDropdown(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   const handleDropdownToggle = () => {
//     setShowDropdown(!showDropdown);
//   };

//   const Logout = () => {
//     handleDropdownToggle();
//     SWIT_LOGOUT().then((result) => {
//       if (result.isConfirmed) {
//         // API.logout().then((r) => {
//         //   if (r?.code === Codes.SUCCESS) {
//         //     localStorage.removeItem(Constant.AUTH_KEY);
//         //     // Remove token cookie
//         //     document.cookie = 'token=; path=/; max-age=0';
//         //     TOAST_SUCCESS(r?.message);
//         //     router.push('/auth/login');
//         //   }
//         // });
//       }
//     });
//   };

//   return (
//     <>
//       <header className="app-header header-shadow">
//         <nav className="navbar navbar-expand-lg navbar-light justify-content-between">
//           <ul className="navbar-nav">
//             <li className="nav-item">
//               <div
//                 className="nav-link sidebartoggler nav-icon-hover ms-n3"
//                 id="headerCollapse"
//               >
//                 <i className="ti ti-menu-2" />
//               </div>
//             </li>
//           </ul>
//           <div className="justify-content-end" id="navbarNav">
//             <div className="d-flex align-items-center justify-content-between">
//               {/* <Link
//                 className="nav-link d-flex d-lg-none align-items-center justify-content-center"
//                 type="button"
//                 data-bs-toggle="offcanvas"
//                 data-bs-target="#mobilenavbar"
//                 aria-controls="offcanvasWithBothOptions"
//               >
//                 <i className="ti ti-align-justified fs-7" />
//               </Link> */}
//               <ul className="navbar-nav flex-row ms-auto align-items-center justify-content-center">
//                 <li className="nav-item dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
//                   <button
//                     className="nav-link pe-0"
//                     type="button"
//                     onClick={handleDropdownToggle}
//                     aria-expanded={showDropdown}
//                   >
//                     <div className="d-flex align-items-center">
//                       <div className="user-profile-img">
//                         <img
//                           src={`/dist/images/profile/user-5.jpg`}
//                           className="rounded-circle"
//                           width={35}
//                           height={35}
//                           alt=""
//                         />
//                       </div>
//                     </div>
//                   </button>
//                   <div
//                     className={`dropdown-menu content-dd dropdown-menu-end dropdown-menu-animate-up ${showDropdown ? 'show' : ''}`}
//                     aria-labelledby="drop1"
//                     style={{
//                       position: 'absolute',
//                       right: 0,
//                       top: '100%',
//                       transform: 'translateY(0)',
//                       zIndex: 1000,
//                       minWidth: '200px',
//                     }}
//                   >
//                     <div className="profile-dropdown position-relative">
//                       <div className="py-3 px-7 pb-0">
//                         <h5 className="mb-0 fs-5 fw-semibold">User Profile</h5>
//                       </div>
//                       <div className="d-flex align-items-center py-9 mx-7 border-bottom">
//                         <img
//                           src={`/dist/images/profile/user-5.jpg`}
//                           className="rounded-circle"
//                           width={80}
//                           height={80}
//                           alt=""
//                         />
//                         <div className="ms-3">
//                           <h5 className="mb-1 fs-3">{user?.full_name}</h5>
//                           <span className="mb-1 d-block text-dark">{formatTypeName(role)}</span>
//                           <p className="mb-0 d-flex text-dark align-items-center gap-2">
//                             <i className="ti ti-mail fs-4" /> {user?.email}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="message-body">
//                         <Link
//                           href="/profile"
//                           className="py-8 px-7 mt-8 d-flex align-items-center"
//                           onClick={handleDropdownToggle}
//                         >
//                           <span className="d-flex align-items-center justify-content-center bg-light rounded-1 p-6">
//                             <img
//                               src={`/dist/images/svgs/icon-account.svg`}
//                               alt=""
//                               width={24}
//                               height={24}
//                             />
//                           </span>
//                           <div className="w-75 d-inline-block v-middle ps-3">
//                             <h6 className="mb-1 bg-hover-primary fw-semibold">My Profile</h6>
//                             <span className="d-block text-dark">Account Settings</span>
//                           </div>
//                         </Link>
//                         <button
//                           className="py-8 px-7 mt-8 d-flex align-items-center w-100 border-0 bg-transparent"
//                           data-bs-toggle="modal"
//                           data-bs-target="#change-password"
//                           onClick={handleDropdownToggle}
//                         >
//                           <span className="d-flex align-items-center justify-content-center bg-light rounded-1 p-6">
//                             <img
//                               src={`/dist/images/svgs/icon-account.svg`}
//                               alt=""
//                               width={24}
//                               height={24}
//                             />
//                           </span>
//                           <div className="w-75 d-inline-block v-middle ps-3">
//                             <h6 className="mb-1 bg-hover-primary fw-semibold">Change Password</h6>
//                             <span className="d-block text-dark">Account Settings</span>
//                           </div>
//                         </button>
//                       </div>
//                       <div className="d-grid py-4 px-7 pt-8">
//                         <button className="btn btn-outline-primary" onClick={Logout}>
//                           Log Out
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </nav>
//       </header>
//       {/* <ChangePassword /> */}
//     </>
//   );
// }


// src/components/layout/navbar/Navbar.jsx
'use client';
import { useState, useEffect, useRef, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// import * as API from '@/utils/api.services';
import Constant, { Codes } from '@/config/constant';
import { SWIT_LOGOUT, TOAST_SUCCESS } from '@/config/common';
import { UserContext } from '@/context/UserData';
import { formatTypeName } from '@/config/validation';
// import ChangePassword from '@/components/ChangePassword';
// import { DarkModeContext } from '@/context/DarkMode'; // adjust path as needed

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { user, role } = useContext(UserContext);
  // const { darkMode, toggle } = useContext(DarkModeContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sidebar toggle functionality
  useEffect(() => {
    const handleSidebarToggle = () => {
      document.body.classList.toggle('show-sidebar');
    };

    const toggleBtn = document.getElementById('headerCollapse');
    const closeBtn = document.getElementById('sidebarCollapse');

    toggleBtn?.addEventListener('click', handleSidebarToggle);
    closeBtn?.addEventListener('click', handleSidebarToggle);

    return () => {
      toggleBtn?.removeEventListener('click', handleSidebarToggle);
      closeBtn?.removeEventListener('click', handleSidebarToggle);
    };
  }, []);


  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const Logout = () => {
    handleDropdownToggle();
    SWIT_LOGOUT().then((result) => {
      if (result.isConfirmed) {
        // API.logout().then((r) => {
        //   if (r?.code === Codes.SUCCESS) {
        //     localStorage.removeItem(Constant.AUTH_KEY);
        //     // Remove token cookie
        //     document.cookie = 'token=; path=/; max-age=0';
        //     TOAST_SUCCESS(r?.message);
        //     router.push('/auth/login');
        //   }
        // });
      }
    });
  };

  return (
    <>
      <header className="app-header header-shadow">
        <nav className="navbar navbar-expand-lg navbar-light justify-content-between">
          <ul className="navbar-nav">
            <li className="nav-item">
              <div
                className="nav-link sidebartoggler nav-icon-hover ms-n3"
                id="headerCollapse"
                style={{ cursor: 'pointer' }}
              >
                <i className="ti ti-menu-2" />
              </div>
            </li>
          </ul>
          <div className="justify-content-end" id="navbarNav">
            <div className="d-flex align-items-center justify-content-between">
              <ul className="navbar-nav flex-row ms-auto align-items-center justify-content-center">
                <li className="nav-item dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
                  <button
                    className="nav-link pe-0"
                    type="button"
                    onClick={handleDropdownToggle}
                    aria-expanded={showDropdown}
                  >
                    <div className="d-flex align-items-center">
                      <div className="user-profile-img">
                        <img
                          src={`/dist/images/profile/user-5.jpg`}
                          className="rounded-circle"
                          width={35}
                          height={35}
                          alt=""
                        />
                      </div>
                    </div>
                  </button>
                  <div
                    className={`dropdown-menu content-dd dropdown-menu-end dropdown-menu-animate-up ${showDropdown ? 'show' : ''}`}
                    aria-labelledby="drop1"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      transform: 'translateY(0)',
                      zIndex: 10000,
                      minWidth: '200px',
                    }}
                  >
                    <div className="profile-dropdown position-relative">
                      <div className="py-3 px-7 pb-0">
                        <h5 className="mb-0 fs-5 fw-semibold">User Profile</h5>
                      </div>
                      <div className="d-flex align-items-center py-9 mx-7 border-bottom">
                        <img
                          src={`/dist/images/profile/user-5.jpg`}
                          className="rounded-circle"
                          width={80}
                          height={80}
                          alt=""
                        />
                        <div className="ms-3">
                          <h5 className="mb-1 fs-3">{user?.full_name}</h5>
                          <span className="mb-1 d-block text-dark">{formatTypeName(role)}</span>
                          <p className="mb-0 d-flex text-dark align-items-center gap-2">
                            <i className="ti ti-mail fs-4" /> {user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="message-body">
                        <Link
                          href="/profile"
                          className="py-8 px-7 mt-8 d-flex align-items-center"
                          onClick={handleDropdownToggle}
                        >
                          <span className="d-flex align-items-center justify-content-center bg-light rounded-1 p-6">
                            <img
                              src={`/dist/images/svgs/icon-account.svg`}
                              alt=""
                              width={24}
                              height={24}
                            />
                          </span>
                          <div className="w-75 d-inline-block v-middle ps-3">
                            <h6 className="mb-1 bg-hover-primary fw-semibold">My Profile</h6>
                            <span className="d-block text-dark">Account Settings</span>
                          </div>
                        </Link>
                        <button
                          type="button"
                          className="py-8 px-7 mt-8 d-flex align-items-center w-100 border-0 bg-transparent text-start"
                          data-bs-toggle="modal"
                          data-bs-target="#change-password"
                          onClick={handleDropdownToggle}
                        >

                          <span className="d-flex align-items-center justify-content-center bg-light rounded-1 p-6">
                            <img
                              src={`/dist/images/svgs/icon-account.svg`}
                              alt=""
                              width={24}
                              height={24}
                            />
                          </span>
                          <div className="w-75 d-inline-block v-middle ps-3">
                            <h6 className="mb-1 bg-hover-primary fw-semibold">Change Password</h6>
                            <span className="d-block text-dark">Account Settings</span>
                          </div>
                        </button>
                      </div>
                      <div className="d-grid py-4 px-7 pt-8">
                        <button className="btn btn-outline-primary" onClick={Logout}>
                          Log Out
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
      {/* <ChangePassword /> */}
    </>
  );
}