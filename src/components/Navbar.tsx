// Navbar.js
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-gray-800 text-white p-4 pb-6 relative z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link to="/" className="hover:text-gray-300" reloadDocument>
            All
          </Link>
          <Link
            to="/?isFailed=true"
            className="hover:text-gray-300"
            reloadDocument
          >
            Failed
          </Link>
          <Link
            to="/?isProcessing=true"
            className="hover:text-gray-300"
            reloadDocument
          >
            Processing
          </Link>
          <Link
            to="/?isRefreshedToday=false"
            className="hover:text-gray-300"
            reloadDocument
          >
            Not processed today
          </Link>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="hover:text-gray-300"
            >
              Layer
            </button>
            {dropdownOpen && (
              <div className="absolute bg-gray-700 mt-2 py-2 rounded shadow-lg w-40 z-10">
                <Link
                  to="/?layer=bronze"
                  className="block px-4 py-2 hover:bg-gray-600"
                  reloadDocument
                >
                  Bronze
                </Link>
                <Link
                  to="/?layer=silver"
                  className="block px-4 py-2 hover:bg-gray-600"
                  reloadDocument
                >
                  Silver
                </Link>
                <Link
                  to="/?layer=gold"
                  className="block px-4 py-2 hover:bg-gray-600"
                  reloadDocument
                >
                  Gold
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
