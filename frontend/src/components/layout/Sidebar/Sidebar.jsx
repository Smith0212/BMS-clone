// // src/components/layout/sidebar/Sidebar.jsx
// 'use client';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import Constant from '@/config/constant';

// export default function Sidebar() {
//   const pathname = usePathname();

//   return (
//     <aside className="left-sidebar header-shadow">
//       <div>
//         <div className="brand-logo d-flex align-items-center justify-content-between">
//           <Link href="/" className="text-nowrap logo-img">
//             <img
//               src={Constant.APP_LOGO}
//               className="dark-logo"
//               width={200}
//               alt="Dark Logo"
//             />
//           </Link>
//           <div
//             className="close-btn d-lg-none d-block sidebartoggler cursor-pointer"
//             id="sidebarCollapse"
//           >
//             <i className="ti ti-x fs-8 text-muted" />
//           </div>
//         </div>
//         {/* Sidebar navigation */}
//         <nav className="sidebar-nav scroll-sidebar" data-simplebar="">
//           <ul id="sidebarnav">

//             {/* Dashboard  */}
//             {/* {(role === 'super_admin' || (role === 'sub_admin' && rights?.dashboard?.includes('listing'))) && ( */}
//             <li className={`sidebar-item ${pathname === '/' ? 'selected' : ''}`}>
//               <Link className={`sidebar-link ${pathname === '/' ? 'active' : ''}`} href="/" aria-expanded="false">
//                 <span>
//                   <i className="ti ti-dashboard" />
//                 </span>
//                 <span className="hide-menu">Dashboard</span>
//               </Link>
//             </li>
//             {/* )} */}

//             {/* Customer  */}
//             {/* {(role === 'super_admin' || (role === 'sub_admin' && rights?.customer?.includes('listing'))) && ( */}
//             <li className={`sidebar-item ${pathname.startsWith('/customer') ? 'selected' : ''}`}>
//               <Link className={`sidebar-link ${pathname.startsWith('/customer') ? 'active' : ''}`} href="/customer" aria-expanded="false">
//                 <span>
//                   <i className="ti ti-users" />
//                 </span>
//                 <span className="hide-menu">Customer</span>
//               </Link>
//             </li>
//             {/* )} */}

//             {/* Order  */}
//             {/* {(role === 'super_admin' || (role === 'sub_admin' && rights?.customer?.includes('listing'))) && ( */}
//             <li className={`sidebar-item ${pathname.startsWith('/order') ? 'selected' : ''}`}>
//               <Link className={`sidebar-link ${pathname.startsWith('/order') ? 'active' : ''}`} href="/order" aria-expanded="false">
//                 <span>
//                   <i className="ti ti-shopping-cart" />
//                 </span>
//                 <span className="hide-menu">Orders</span>
//               </Link>
//             </li>
//             {/* )} */}

//             {/* Exchange  */}
//             {/* {(role === 'super_admin' || (role === 'sub_admin' && rights?.customer?.includes('listing'))) && ( */}
//             <li className={`sidebar-item ${pathname.startsWith('/exchange') ? 'selected' : ''}`}>
//               <Link className={`sidebar-link ${pathname.startsWith('/exchange') ? 'active' : ''}`} href="/exchange" aria-expanded="false">
//                 <span>
//                   <i className="fa fa-exchange-alt" style={{ fontSize: '18px' }}></i>
//                 </span>
//                 <span className="hide-menu">Exchange</span>
//               </Link>
//             </li>
//             {/* )} */}

//             {/* Subscription  */}
//             {/* {(role === 'super_admin' || (role === 'sub_admin' && rights?.customer?.includes('listing'))) && ( */}
//             <li className={`sidebar-item ${pathname.startsWith('/subscription') ? 'selected' : ''}`}>
//               <Link className={`sidebar-link ${pathname.startsWith('/subscription') ? 'active' : ''}`} href="/subscription" aria-expanded="false">
//                 <span>
//                   <i className="ti ti-calendar"></i>
//                 </span>
//                 <span className="hide-menu">Subscription</span>
//               </Link>
//             </li>
//             {/* )} */}

//             {/* Earning  */}
//             {/* {(role === 'super_admin' || (role === 'sub_admin' && rights?.customer?.includes('listing'))) && ( */}
//             <li className={`sidebar-item ${pathname.startsWith('/earning') ? 'selected' : ''}`}>
//               <Link className={`sidebar-link ${pathname.startsWith('/earning') ? 'active' : ''}`} href="/earning" aria-expanded="false">
//                 <span>
//                   <i className="ti ti-cash"></i>
//                 </span>
//                 <span className="hide-menu">Earning</span>
//               </Link>
//             </li>
//             {/* )} */}

//             {/* Feedback  */}
//             {/* {(role === 'super_admin' || (role === 'sub_admin' && rights?.subscription?.includes('listing'))) && ( */}
//             <li className={`sidebar-item ${pathname.startsWith('/feedback') ? 'selected' : ''}`}>
//               <Link className={`sidebar-link ${pathname.startsWith('/feedback') ? 'active' : ''}`} href="/feedback" aria-expanded="false">
//                 <span>
//                   <i className="ti ti-message" />
//                 </span>
//                 <span className="hide-menu">Feedback</span>
//               </Link>
//             </li>
//             {/* )} */}

//             {/* Generate Reports */}
//             {/* {(role === 'super_admin' || (role === 'sub_admin' && rights?.earning?.includes('listing'))) && ( */}
//             <li className={`sidebar-item ${pathname.startsWith('/generate_reports') ? 'selected' : ''}`}>
//               <Link className={`sidebar-link ${pathname.startsWith('/generate_reports') ? 'active' : ''}`} href="/generate_reports" aria-expanded="false">
//                 <span>
//                   <i className="ti ti-report" />
//                 </span>
//                 <span className="hide-menu">Generate Reports</span>
//               </Link>
//             </li>
//             {/* )} */}

//             {/* Post  */}
//             {/* {(role === 'super_admin' || (role === 'sub_admin' && rights?.post?.includes('listing'))) && ( */}
//             {/* <li className={`sidebar-item ${pathname.startsWith('/post') ? 'selected' : ''}`}>
//               <Link className={`sidebar-link ${pathname.startsWith('/post') ? 'active' : ''}`} href="/post" aria-expanded="false">
//                 <span>
//                   <i className="ti ti-pencil" />
//                 </span>
//                 <span className="hide-menu">Post</span>
//               </Link>
//             </li> */}
//             {/* )} */}

//             {/* Sub Admin  */}
//             {/* {(role === 'super_admin') && ( */}
//             <li className={`sidebar-item ${pathname.startsWith('/setting') ? 'selected' : ''}`}>
//               <Link className={`sidebar-link ${pathname.startsWith('/setting') ? 'active' : ''}`} href="/setting" aria-expanded="false">
//                 <span>
//                   <i className="ti ti-settings" />
//                 </span>
//                 <span className="hide-menu">Setting</span>
//               </Link>
//             </li>
//             {/* )} */}

//             {/* Earning  */}
//             {/* {(role === 'super_admin' || (role === 'sub_admin' && rights?.earning?.includes('listing'))) && ( */}
//             {/* <li className={`sidebar-item ${pathname.startsWith('/earning') ? 'selected' : ''}`}>
//               <Link className={`sidebar-link ${pathname.startsWith('/earning') ? 'active' : ''}`} href="/earning" aria-expanded="false">
//                 <span>
//                   <i className="ti ti-wallet" />
//                 </span>
//                 <span className="hide-menu">Earning</span>
//               </Link>
//             </li> */}
//             {/* )} */}

//             {/* Notification  */}
//             {/* {(role === 'super_admin' || (role === 'sub_admin' && rights?.notification?.includes('listing'))) && ( */}
//             <li className={`sidebar-item ${pathname.startsWith('/notification') ? 'selected' : ''}`}>
//               <Link className={`sidebar-link ${pathname.startsWith('/notification') ? 'active' : ''}`} href="/notification" aria-expanded="false">
//                 <span>
//                   <i className="ti ti-bell" />
//                 </span>
//                 <span className="hide-menu">Notifications</span>
//               </Link>
//             </li>
//             {/* )} */}

//             {/* CMS Pages */}
//             {/* {(role === 'super_admin' || (role === 'sub_admin' && rights?.content_pages?.includes('listing'))) && ( */}
//             <>
//               <li className={`sidebar-item ${pathname === '/about_us' ? 'selected' : ''}`}>
//                 <Link href="/about_us" className={`sidebar-link ${pathname === '/about_us' ? 'active' : ''}`}>
//                   <div className="round-16 d-flex align-items-center justify-content-center">
//                     <i className="ti ti-info-circle"></i>
//                   </div>
//                   <span className="hide-menu">About Us</span>
//                 </Link>
//               </li>
//               <li className={`sidebar-item ${pathname === '/privacy_policy' ? 'selected' : ''}`}>
//                 <Link href="/privacy_policy" className={`sidebar-link ${pathname === '/privacy_policy' ? 'active' : ''}`}>
//                   <div className="round-16 d-flex align-items-center justify-content-center">
//                     <i className="ti ti-lock"></i>
//                   </div>
//                   <span className="hide-menu">Privacy Policy</span>
//                 </Link>
//               </li>
//               <li className={`sidebar-item ${pathname === '/terms_conditions' ? 'selected' : ''}`}>
//                 <Link href="/terms_conditions" className={`sidebar-link ${pathname === '/terms_conditions' ? 'active' : ''}`}>
//                   <div className="round-16 d-flex align-items-center justify-content-center">
//                     <i className="ti ti-file"></i>
//                   </div>
//                   <span className="hide-menu">Terms & Conditions</span>
//                 </Link>
//               </li>
//               <li className={`sidebar-item ${pathname.startsWith('/faq') ? 'selected' : ''}`}>
//                 <Link href="/faq" className={`sidebar-link ${pathname.startsWith('/faq') ? 'active' : ''}`}>
//                   <div className="round-16 d-flex align-items-center justify-content-center">
//                     <i className="ti ti-help"></i>
//                   </div>
//                   <span className="hide-menu">FAQ</span>
//                 </Link>
//               </li>
//               <li className={`sidebar-item ${pathname === '/contact_us' ? 'selected' : ''}`}>
//                 <Link href="/contact_us" className={`sidebar-link ${pathname === '/contact_us' ? 'active' : ''}`}>
//                   <div className="round-16 d-flex align-items-center justify-content-center">
//                     <i className="ti ti-mail"></i>
//                   </div>
//                   <span className="hide-menu">Contact Us</span>
//                 </Link>
//               </li>
//             </>
//             {/* )} */}

//           </ul>
//         </nav>
//       </div>
//     </aside>
//   );
// }


// src/components/layout/sidebar/Sidebar.jsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Constant from '@/config/constant';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [activePath, setActivePath] = useState(pathname);
  
  // Sync activePath with pathname whenever it changes
  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  const handleLinkClick = (href) => {
    setActivePath(href); 
    if (window.innerWidth < 992) {
      const sidebar = document.querySelector('.left-sidebar');
      const body = document.body;
      
      if (sidebar && body) {
        sidebar.classList.remove('show-sidebar');
        body.classList.remove('show-sidebar');
      }
    }
  };

  return (
    <aside className="left-sidebar header-shadow">
      <div>
        <div className="brand-logo d-flex align-items-center justify-content-between">
          <Link href="/" className="text-nowrap logo-img">
            <img
              src={Constant.APP_LOGO}
              className="dark-logo"
              width={200}
              alt="Dark Logo"
            />
          </Link>
          <div
            className="close-btn d-lg-none d-block sidebartoggler cursor-pointer"
            id="sidebarCollapse"
            style={{ cursor: 'pointer' }}
          >
            <i className="ti ti-x fs-8 text-muted" />
          </div>
        </div>
        {/* Sidebar navigation */}
        <nav className="sidebar-nav scroll-sidebar" data-simplebar="">
          <ul id="sidebarnav">

            {/* Dashboard  */}
            <li className={`sidebar-item ${activePath === '/' ? 'selected' : ''}`}>
              <Link 
                className={`sidebar-link ${activePath === '/' ? 'active' : ''}`} 
                href="/" 
                aria-expanded="false"
                onClick={()=>{handleLinkClick('/')}}
              >
                <span>
                  <i className="ti ti-dashboard" />
                </span>
                <span className="hide-menu">Dashboard</span>
              </Link>
            </li>

            {/* Customer  */}
            <li className={`sidebar-item ${activePath.startsWith('/customer') ? 'selected' : ''}`}>
              <Link 
                className={`sidebar-link ${activePath.startsWith('/customer') ? 'active' : ''}`} 
                href="/customer" 
                aria-expanded="false"
                onClick={()=>{handleLinkClick('/customer')}}
              >
                <span>
                  <i className="ti ti-users" />
                </span>
                <span className="hide-menu">Customer</span>
              </Link>
            </li>

            
            {/* Feedback  */}
            <li className={`sidebar-item ${activePath.startsWith('/feedback') ? 'selected' : ''}`}>
              <Link 
                className={`sidebar-link ${activePath.startsWith('/feedback') ? 'active' : ''}`} 
                href="/feedback" 
                aria-expanded="false"
                onClick={()=>{handleLinkClick('/feedback')}}
              >
                <span>
                  <i className="ti ti-message" />
                </span>
                <span className="hide-menu">Feedback</span>
              </Link>
            </li>

            {/* Generate Reports */}
            <li className={`sidebar-item ${activePath.startsWith('/generate_reports') ? 'selected' : ''}`}>
              <Link 
                className={`sidebar-link ${activePath.startsWith('/generate_reports') ? 'active' : ''}`} 
                href="/generate_reports" 
                aria-expanded="false"
                onClick={()=>{handleLinkClick('/generate_reports')}}
              >
                <span>
                  <i className="ti ti-report" />
                </span>
                <span className="hide-menu">Generate Reports</span>
              </Link>
            </li>

            {/* Setting  */}
            <li className={`sidebar-item ${activePath.startsWith('/setting') ? 'selected' : ''}`}>
              <Link 
                className={`sidebar-link ${activePath.startsWith('/setting') ? 'active' : ''}`} 
                href="/setting" 
                aria-expanded="false"
                onClick={()=>{handleLinkClick('/setting')}}
              >
                <span>
                  <i className="ti ti-settings" />
                </span>
                <span className="hide-menu">Setting</span>
              </Link>
            </li>

            {/* Notification  */}
            <li className={`sidebar-item ${activePath.startsWith('/notifications') ? 'selected' : ''}`}>
              <Link 
                className={`sidebar-link ${activePath.startsWith('/notifications') ? 'active' : ''}`} 
                href="/notifications" 
                aria-expanded="false"
                onClick={()=>{handleLinkClick('/notifications')}}
              >
                <span>
                  <i className="ti ti-bell" />
                </span>
                <span className="hide-menu">Notifications</span>
              </Link>
            </li>
            {/* CMS Pages */}
            <>
              <li className={`sidebar-item ${activePath === '/about_us' ? 'selected' : ''}`}>
                <Link 
                  href="/about_us" 
                  className={`sidebar-link ${activePath === '/about_us' ? 'active' : ''}`}
                  onClick={()=>{handleLinkClick('/about_us')}}
                >
                  <div className="round-16 d-flex align-items-center justify-content-center">
                    <i className="ti ti-info-circle"></i>
                  </div>
                  <span className="hide-menu">About Us</span>
                </Link>
              </li>
              <li className={`sidebar-item ${activePath === '/privacy_policy' ? 'selected' : ''}`}>
                <Link 
                  href="/privacy_policy" 
                  className={`sidebar-link ${activePath === '/privacy_policy' ? 'active' : ''}`}
                  onClick={()=>{handleLinkClick('/privacy_policy')}}
                >
                  <div className="round-16 d-flex align-items-center justify-content-center">
                    <i className="ti ti-lock"></i>
                  </div>
                  <span className="hide-menu">Privacy Policy</span>
                </Link>
              </li>
              <li className={`sidebar-item ${activePath === '/terms_conditions' ? 'selected' : ''}`}>
                <Link 
                  href="/terms_conditions" 
                  className={`sidebar-link ${activePath === '/terms_conditions' ? 'active' : ''}`}
                  onClick={()=>{handleLinkClick('/terms_conditions')}}
                >
                  <div className="round-16 d-flex align-items-center justify-content-center">
                    <i className="ti ti-file"></i>
                  </div>
                  <span className="hide-menu">Terms & Conditions</span>
                </Link>
              </li>
              <li className={`sidebar-item ${activePath.startsWith('/faq') ? 'selected' : ''}`}>
                <Link 
                  href="/faq" 
                  className={`sidebar-link ${activePath.startsWith('/faq') ? 'active' : ''}`}
                  onClick={()=>{handleLinkClick('/faq')}}
                >
                  <div className="round-16 d-flex align-items-center justify-content-center">
                    <i className="ti ti-help"></i>
                  </div>
                  <span className="hide-menu">FAQ</span>
                </Link>
              </li>
              <li className={`sidebar-item ${activePath === '/contact_us' ? 'selected' : ''}`}>
                <Link 
                  href="/contact_us" 
                  className={`sidebar-link ${activePath === '/contact_us' ? 'active' : ''}`}
                  onClick={()=>{handleLinkClick('/contact_us')}}
                >
                  <div className="round-16 d-flex align-items-center justify-content-center">
                    <i className="ti ti-mail"></i>
                  </div>
                  <span className="hide-menu">Contact Us</span>
                </Link>
              </li>
            </>

          </ul>
        </nav>
      </div>
    </aside>
  );
}

