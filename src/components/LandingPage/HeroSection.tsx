const HeroSection = () => {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 leading-tight">
        Empowering BCOs
        <br />
        with AI-Augmented
        <br />
        RFI Generation
      </h1>

      <p className="text-secondary text-lg md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
        Providing ongoing support for Building Control Officers through
        AI-enhanced, reliable RFI generation
      </p>

      <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8">
        <a
          href="#"
          className="bg-indigo-600 hover:bg-indigo-700 text-light px-8 py-3 rounded-full font-medium transition-colors"
        >
          Request Early Access
        </a>

        <a href="#" className="text-primary flex items-center font-medium">
          Discover How It Works
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

export default HeroSection;
