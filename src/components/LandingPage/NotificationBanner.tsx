const NotificationBanner = () => {
  return (
    <div className="flex justify-center mb-8 mt-16">
      <div className="bg-secondary rounded-full px-6 py-3 shadow-sm inline-flex items-center">
        <p className="text-secondary text-sm md:text-base !mb-0">
          Currently Accepting BCOs to Test BuildRFI.
        </p>
        <a
          href="#"
          className="text-indigo-500 font-medium ml-2 flex items-center text-sm md:text-base"
        >
          Register interest
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default NotificationBanner;
