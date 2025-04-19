import React, { Suspense, lazy, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
const UploadDocuments = lazy(
  () => import("../../components/documentationComponents/UploadDocuments")
);
const PreviousDocuments = lazy(
  () => import("../../components/documentationComponents/PreviousDocuments")
);

const Documentation: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleRefresh = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };
  return (
    <div className="min-h-screen md:!py-[10%] pt-[20%] md:pt-0 px-4 md:px-6 bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Document Management
        </h1>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Upload documents to get an AI-powered evaluation and analysis. The AI
          will assess structure, content quality, clarity, and provide
          recommendations.
        </p>

        <Suspense
          fallback={
            <div className="w-full py-12 flex justify-center">
              Loading upload section...
            </div>
          }
        >
          <UploadDocuments onUploadSuccess={handleRefresh} />
        </Suspense>

        <div className="my-16 border-t border-gray-200"></div>

        <Suspense
          fallback={
            <div className="w-full py-12 flex justify-center">
              Loading documents table...
            </div>
          }
        >
          <PreviousDocuments refreshKey={refreshKey} />
        </Suspense>
      </div>
    </div>
  );
};

export default Documentation;
