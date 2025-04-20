// import React, { useEffect, useState, useRef } from "react";
// import logo from "../../assets/R.png";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import ROUTES from "../../routes";
// import { useAuth } from "../../providers/AuthContext";
// import {
//   FiMenu,
//   FiX,
//   FiUser,
//   FiLogOut,
//   FiMessageSquare,
//   FiFileText,
//   FiPhone,
//   FiChevronRight,
// } from "react-icons/fi";

// const Navbar: React.FC = () => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const mobileMenuRef = useRef<HTMLDivElement>(null);
//   const mobileButtonRef = useRef<HTMLButtonElement>(null);
//   const { logout, user } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   console.log(user);

//   useEffect(() => {
//     const userId = localStorage.getItem("user_id");
//     setIsLoggedIn(!!userId);

//     const handleStorageChange = () => {
//       const userId = localStorage.getItem("user_id");
//       setIsLoggedIn(!!userId);
//     };

//     window.addEventListener("storage", handleStorageChange);
//     return () => window.removeEventListener("storage", handleStorageChange);
//   }, []);

//   // Close mobile menu when changing routes
//   useEffect(() => {
//     setMobileMenuOpen(false);
//   }, [location.pathname]);

//   useEffect(() => {
//     // Close dropdown when clicking outside
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setDropdownOpen(false);
//       }

//       if (
//         mobileMenuRef.current &&
//         !mobileMenuRef.current.contains(event.target as Node) &&
//         mobileButtonRef.current &&
//         !mobileButtonRef.current.contains(event.target as Node)
//       ) {
//         setMobileMenuOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleLogout = () => {
//     logout();
//     setDropdownOpen(false);
//     setMobileMenuOpen(false);
//     navigate(ROUTES.default);
//   };

//   const toggleMobileMenu = () => {
//     setMobileMenuOpen((prevState) => !prevState);
//   };

//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center p-4">
//       <div className="bg-secondary rounded-full flex items-center justify-between px-4 py-2 shadow-md w-full max-w-2xl relative">
//         <Link
//           to={ROUTES.default}
//           className="bg-primary rounded-full w-12 h-12 flex items-center justify-center"
//         >
//           <img src={logo} alt="R Logo" className="w-6 h-6" />
//         </Link>

//         {isLoggedIn ? (
//           <>
//             {/* Desktop Menu for Logged In Users */}
//             <div className="hidden md:flex items-center justify-between flex-1 ml-6">
//               <div className="flex justify-end flex-1">
//                 <Link
//                   to={ROUTES.chat}
//                   className={`text-primary hover:text-primary-hover transition-colors font-medium mx-4 ${
//                     location.pathname.includes(ROUTES.chat)
//                       ? "text-indigo-700 font-bold"
//                       : ""
//                   }`}
//                 >
//                   Chat
//                 </Link>
//                 {user?.isAdmin && (
//                   <Link
//                     to={ROUTES.documentation}
//                     className={`text-primary hover:text-primary-hover transition-colors font-medium mx-4 ${
//                       location.pathname.includes(ROUTES.documentation)
//                         ? "text-indigo-700 font-bold"
//                         : ""
//                     }`}
//                   >
//                     Documentation
//                   </Link>
//                 )}
//                 <Link
//                   to={ROUTES.contact}
//                   className={`text-primary hover:text-primary-hover transition-colors font-medium mx-4 ${
//                     location.pathname.includes("/contact")
//                       ? "text-indigo-700 font-bold"
//                       : ""
//                   }`}
//                 >
//                   Contact
//                 </Link>
//               </div>

//               <div className="relative" ref={dropdownRef}>
//                 <button
//                   onClick={() => setDropdownOpen(!dropdownOpen)}
//                   className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center overflow-hidden focus:outline-none"
//                 >
//                   <FiUser className="w-6 h-6" />
//                 </button>

//                 {dropdownOpen && (
//                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
//                     <span
//                       className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                       onClick={() => setDropdownOpen(false)}
//                     >
//                       <FiUser className="mr-2" />
//                       {user?.username}
//                     </span>
//                     <button
//                       onClick={handleLogout}
//                       className="flex w-full text-left items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     >
//                       <FiLogOut className="mr-2" />
//                       Logout
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Mobile Menu Button */}
//             <button
//               ref={mobileButtonRef}
//               className="md:hidden ml-auto mr-2 focus:outline-none"
//               onClick={toggleMobileMenu}
//               aria-label="Toggle mobile menu"
//             >
//               {mobileMenuOpen ? (
//                 <FiX className="h-6 w-6" />
//               ) : (
//                 <FiMenu className="h-6 w-6" />
//               )}
//             </button>

//             {/* Mobile Menu for Logged In Users */}
//             {mobileMenuOpen && (
//               <div
//                 ref={mobileMenuRef}
//                 className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
//               >
//                 <Link
//                   to={ROUTES.chat}
//                   className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 ${
//                     location.pathname.includes(ROUTES.chat)
//                       ? "text-indigo-700 font-bold"
//                       : "text-gray-700"
//                   }`}
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   <FiMessageSquare className="mr-2" />
//                   Chat
//                 </Link>
//                 <Link
//                   to={ROUTES.documentation}
//                   className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 ${
//                     location.pathname.includes(ROUTES.documentation)
//                       ? "text-indigo-700 font-bold"
//                       : "text-gray-700"
//                   }`}
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   <FiFileText className="mr-2" />
//                   Documentation
//                 </Link>
//                 <Link
//                   to={ROUTES.contact}
//                   className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 ${
//                     location.pathname.includes("/contact")
//                       ? "text-indigo-700 font-bold"
//                       : "text-gray-700"
//                   }`}
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   <FiPhone className="mr-2" />
//                   Contact
//                 </Link>
//                 <div className="border-t border-gray-200 my-1"></div>
//                 <span
//                   className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                   onClick={() => setDropdownOpen(false)}
//                 >
//                   <FiUser className="mr-2" />
//                   {user?.username}
//                 </span>
//                 <button
//                   onClick={handleLogout}
//                   className="flex w-full text-left items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                 >
//                   <FiLogOut className="mr-2" />
//                   Logout
//                 </button>
//               </div>
//             )}
//           </>
//         ) : (
//           <>
//             {/* Desktop Menu for Non-Logged In Users */}
//             <div className="hidden md:flex items-center ml-6 justify-between flex-1">
//               <div className="flex items-center">
//                 <a
//                   href="#"
//                   className="text-primary hover:text-primary-hover transition-colors font-medium mx-4"
//                 >
//                   Register Interest
//                 </a>
//                 <a
//                   href="#"
//                   className="text-primary hover:text-primary-hover transition-colors font-medium mx-4"
//                 >
//                   Product
//                 </a>
//                 <a
//                   href="#"
//                   className="text-primary hover:text-primary-hover transition-colors font-medium mx-4"
//                 >
//                   Contact
//                 </a>
//               </div>

//               <Link
//                 to={ROUTES.login}
//                 className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-full transition-colors font-medium"
//               >
//                 Go To App
//               </Link>
//             </div>

//             {/* Mobile Menu and Button for Non-Logged In Users */}
//             <div className="md:hidden flex items-center ml-auto space-x-4">
//               <Link
//                 to={ROUTES.login}
//                 className="bg-indigo-500 hover:bg-indigo-600 !text-white px-4 py-1.5 rounded-full transition-colors font-medium text-sm"
//               >
//                 Go To App
//               </Link>

//               <button
//                 ref={mobileButtonRef}
//                 className="focus:outline-none"
//                 onClick={toggleMobileMenu}
//                 aria-label="Toggle mobile menu"
//               >
//                 {mobileMenuOpen ? (
//                   <FiX className="h-6 w-6" />
//                 ) : (
//                   <FiMenu className="h-6 w-6" />
//                 )}
//               </button>
//             </div>

//             {/* Mobile Menu for Non-Logged In Users */}
//             {mobileMenuOpen && (
//               <div
//                 ref={mobileMenuRef}
//                 className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
//               >
//                 <a
//                   href="#"
//                   className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   <FiChevronRight className="mr-2" />
//                   Register Interest
//                 </a>
//                 <a
//                   href="#"
//                   className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   <FiChevronRight className="mr-2" />
//                   Product
//                 </a>
//                 <Link
//                   to={ROUTES.contact}
//                   className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   <FiChevronRight className="mr-2" />
//                   Contact
//                 </Link>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import React, { useEffect, useState, useRef } from "react";
import logo from "../../assets/R.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ROUTES from "../../routes";
import { useAuth } from "../../providers/AuthContext";
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiMessageSquare,
  FiFileText,
  FiPhone,
  FiChevronRight,
} from "react-icons/fi";

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [localUser, setLocalUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check both the user from useAuth and localStorage
  const activeUser = user || localUser;

  useEffect(() => {
    // Check for user in localStorage
    const userId = localStorage.getItem("user_id");
    const storedUser = localStorage.getItem("user");

    // Parse user data from localStorage if it exists
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setLocalUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }

    // User is logged in if either userId exists or we have a user object
    setIsLoggedIn(!!userId || !!user);

    const handleStorageChange = () => {
      const currentUserId = localStorage.getItem("user_id");
      const currentUserData = localStorage.getItem("user");

      setIsLoggedIn(!!currentUserId);

      if (currentUserData) {
        try {
          const parsedUser = JSON.parse(currentUserData);
          setLocalUser(parsedUser);
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
        }
      } else {
        setLocalUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user]);

  // Close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileButtonRef.current &&
        !mobileButtonRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("user");
    setLocalUser(null);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate(ROUTES.default);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prevState) => !prevState);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center p-4">
      <div className="bg-secondary rounded-full flex items-center justify-between px-4 py-2 shadow-md w-full max-w-2xl relative">
        <Link
          to={ROUTES.default}
          className="bg-primary rounded-full w-12 h-12 flex items-center justify-center"
        >
          <img src={logo} alt="R Logo" className="w-6 h-6" />
        </Link>

        {isLoggedIn ? (
          <>
            {/* Desktop Menu for Logged In Users */}
            <div className="hidden md:flex items-center justify-between flex-1 ml-6">
              <div className="flex justify-end flex-1">
                <Link
                  to={ROUTES.chat}
                  className={`text-primary hover:text-primary-hover transition-colors font-medium mx-4 ${
                    location.pathname.includes(ROUTES.chat)
                      ? "text-indigo-700 font-bold"
                      : ""
                  }`}
                >
                  Chat
                </Link>
                <Link
                  to={ROUTES.documentation}
                  className={`text-primary hover:text-primary-hover transition-colors font-medium mx-4 ${
                    location.pathname.includes(ROUTES.documentation)
                      ? "text-indigo-700 font-bold"
                      : ""
                  }`}
                >
                  Documentation
                </Link>
                <Link
                  to={ROUTES.contact}
                  className={`text-primary hover:text-primary-hover transition-colors font-medium mx-4 ${
                    location.pathname.includes("/contact")
                      ? "text-indigo-700 font-bold"
                      : ""
                  }`}
                >
                  Contact
                </Link>
              </div>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center overflow-hidden focus:outline-none"
                >
                  <FiUser className="w-6 h-6" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <span
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiUser className="mr-2" />
                      {activeUser?.username || "User"}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="flex w-full text-left items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiLogOut className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              ref={mobileButtonRef}
              className="md:hidden ml-auto mr-2 focus:outline-none"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>

            {/* Mobile Menu for Logged In Users */}
            {mobileMenuOpen && (
              <div
                ref={mobileMenuRef}
                className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
              >
                <Link
                  to={ROUTES.chat}
                  className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 ${
                    location.pathname.includes(ROUTES.chat)
                      ? "text-indigo-700 font-bold"
                      : "text-gray-700"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiMessageSquare className="mr-2" />
                  Chat
                </Link>

                <Link
                  to={ROUTES.documentation}
                  className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 ${
                    location.pathname.includes(ROUTES.documentation)
                      ? "text-indigo-700 font-bold"
                      : "text-gray-700"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiFileText className="mr-2" />
                  Documentation
                </Link>
                <Link
                  to={ROUTES.contact}
                  className={`flex items-center px-4 py-2 text-sm hover:bg-gray-100 ${
                    location.pathname.includes("/contact")
                      ? "text-indigo-700 font-bold"
                      : "text-gray-700"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiPhone className="mr-2" />
                  Contact
                </Link>
                <div className="border-t border-gray-200 my-1"></div>
                <span className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <FiUser className="mr-2" />
                  {activeUser?.username || "User"}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex w-full text-left items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Desktop Menu for Non-Logged In Users */}
            <div className="hidden md:flex items-center ml-6 justify-between flex-1">
              <div className="flex items-center">
                <a
                  href="#"
                  className="text-primary hover:text-primary-hover transition-colors font-medium mx-4"
                >
                  Register Interest
                </a>
                <a
                  href="#"
                  className="text-primary hover:text-primary-hover transition-colors font-medium mx-4"
                >
                  Product
                </a>
                <a
                  href="#"
                  className="text-primary hover:text-primary-hover transition-colors font-medium mx-4"
                >
                  Contact
                </a>
              </div>

              <Link
                to={ROUTES.login}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-full transition-colors font-medium"
              >
                Go To App
              </Link>
            </div>

            {/* Mobile Menu and Button for Non-Logged In Users */}
            <div className="md:hidden flex items-center ml-auto space-x-4">
              <Link
                to={ROUTES.login}
                className="bg-indigo-500 hover:bg-indigo-600 !text-white px-4 py-1.5 rounded-full transition-colors font-medium text-sm"
              >
                Go To App
              </Link>

              <button
                ref={mobileButtonRef}
                className="focus:outline-none"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <FiX className="h-6 w-6" />
                ) : (
                  <FiMenu className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Mobile Menu for Non-Logged In Users */}
            {mobileMenuOpen && (
              <div
                ref={mobileMenuRef}
                className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
              >
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiChevronRight className="mr-2" />
                  Register Interest
                </a>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiChevronRight className="mr-2" />
                  Product
                </a>
                <Link
                  to={ROUTES.contact}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiChevronRight className="mr-2" />
                  Contact
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
