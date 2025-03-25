import React, { useState } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import { IoHandRightOutline } from "react-icons/io5";

const Footer: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Submitted email:", email);
    // Reset form
    setEmail("");
  };

  return (
    <footer className="bg-gray-900 text-white py-16 px-4 md:px-8 relative">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Left column */}
          <div>
            <h2 className="text-4xl font-bold mb-6">Register Your Interest</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md">
              If you wish to be included in our early access program, please
              signup with a corporate email below.
            </p>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 mb-4"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your corporate email"
                className="flex-grow py-3 px-4 rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded font-medium transition-colors sm:flex-shrink-0"
              >
                Register
              </button>
            </form>
          </div>

          {/* Right column */}
          <div className="grid md:grid-cols-2 gap-10">
            {/* Event Updates */}
            <div>
              <div className="bg-gray-800 p-4 rounded-lg inline-flex items-center justify-center mb-4">
                <FaRegCalendarAlt className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Event Updates</h3>
              <p className="text-gray-400">
                We will notify the email provided only at key stages of the
                project, like when early access is available.
              </p>
            </div>

            {/* No spam */}
            <div>
              <div className="bg-gray-800 p-4 rounded-lg inline-flex items-center justify-center mb-4">
                <IoHandRightOutline className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No spam</h3>
              <p className="text-gray-400">
                Your email will only be used for the purpose described and never
                sold to a third-party. We take data security seriously.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
