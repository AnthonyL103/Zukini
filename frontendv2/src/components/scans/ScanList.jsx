import React, { useEffect, useState } from "react";
import Scan from "./Scan";

const ScanList = ({ scans, onDelete, scroll, slidesRef }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(
    window.innerWidth < 768 ? 1 : 2
  );
  const [scanName, setScanName] = useState("");
  const [VAscanName, setVAScanName] = useState("");
  const [viewAll, setShowViewAll] = useState(false);

  const scrollDelay = 7000;

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(window.innerWidth < 768 ? 1 : 2);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsPaused(scanName.trim() !== "");
  }, [scanName]);

  useEffect(() => {
    if (scans.length > 0 && startIndex >= scans.length) {
      setStartIndex(0);
    }
  }, [scans, startIndex]);

  useEffect(() => {
    if (isPaused || scans.length < 3) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setStartIndex((prevIndex) =>
          prevIndex + itemsPerView >= scans.length ? 0 : prevIndex + itemsPerView
        );
        setIsFading(false);
      }, 1000);
    }, scrollDelay);

    return () => clearInterval(interval);
  }, [scans, scrollDelay, isPaused, itemsPerView]);

  const filteredScans = scans.filter((scan) =>
    scan.scanname.toLowerCase().includes(scanName.toLowerCase())
  );

  const filteredVAScans = scans.filter((scan) =>
    scan.scanname.toLowerCase().includes(VAscanName.toLowerCase())
  );

  const displayedScans = scanName.trim()
    ? filteredScans.slice(0, itemsPerView)
    : scans.slice(startIndex, startIndex + itemsPerView);

  const scrolltoNext = () => scroll();
  const viewall = () => setShowViewAll(true);
  const closeviewall = () => setShowViewAll(false);

  return (
    <div
      ref={(el) => (slidesRef.current[0] = el)}
      className="p-5 rounded-xl mb-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-2xl font-semibold text-gray-800">Scans:</p>
        <div className="flex items-center space-x-4">
          <input
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={scanName}
            onChange={(e) => setScanName(e.target.value)}
            placeholder="Search scans..."
          />
          <button
            className="px-4 py-2 bg-gradient-to-r from-[#0f0647] to-[#67d7cc] text-white font-semibold rounded-lg hover:opacity-90 transition"
            onClick={viewall}
          >
            View All
          </button>
        </div>
      </div>

      {/* Scans List */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-500 ${
          isFading ? "opacity-0" : "opacity-100"
        }`}
      >
        {displayedScans.length > 0 ? (
          displayedScans.map((scan) => (
            <Scan
              key={scan.scankey}
              scankey={scan.scankey}
              filepath={scan.filepath}
              scanname={scan.scanname}
              text={scan.value}
              date={scan.date}
              onDelete={onDelete}
            />
          ))
        ) : (
          <p className="text-lg text-gray-600 col-span-full text-center">
            No scans found.
          </p>
        )}
      </div>

      {/* Add Scan Button */}
      <div className="flex justify-center mt-4">
        <button
          className="px-6 py-3 bg-gradient-to-r from-[#0f0647] to-[#67d7cc] text-white font-semibold rounded-lg hover:opacity-90 transition"
          onClick={scrolltoNext}
        >
          Add A Scan
        </button>
      </div>

      {/* View All Modal */}
      {viewAll && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xl font-semibold text-gray-800">Scans:</p>
              <input
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={VAscanName}
                onChange={(e) => setVAScanName(e.target.value)}
                placeholder="Search scans..."
              />
            </div>

            {/* Modal List */}
            <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto">
              {filteredVAScans.length > 0 ? (
                filteredVAScans.map((scan) => (
                  <Scan
                    key={scan.scankey}
                    scankey={scan.scankey}
                    filepath={scan.filepath}
                    scanname={scan.scanname}
                    text={scan.value}
                    date={scan.date}
                    onDelete={onDelete}
                  />
                ))
              ) : (
                <p className="text-lg text-gray-600 text-center">
                  No scans found.
                </p>
              )}
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-center">
              <button
                className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
                onClick={closeviewall}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanList;
