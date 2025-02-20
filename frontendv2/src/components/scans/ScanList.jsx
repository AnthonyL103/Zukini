import React, { useEffect, useState } from "react";
import Scan from "./Scan";

const ScanList = ({ scans, onDelete, scroll, slidesRef }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(window.innerWidth < 768 ? 1 : 2);
  const [scanName, setScanName] = useState("");
  const [VAscanName, setVAScanName] = useState("");
  const [viewAll, setShowViewAll] = useState(false);

  const scrollDelay = 7000; // Auto-scroll delay

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
      className="relative flex flex-col p-5 bg-blue-900/40 rounded-xl mb-4 scroll-snap-start"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => scanName.trim() === "" && setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => scanName.trim() === "" && setIsPaused(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-white text-2xl font-semibold">Scans:</p>
        <div className="flex items-center space-x-4">
          <input
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 outline-none"
            value={scanName}
            onChange={(e) => setScanName(e.target.value)}
            placeholder="Search scans..."
          />
          <button
            className="px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-purple-400 hover:text-black transition"
            onClick={viewall}
          >
            View All
          </button>
        </div>
      </div>

      {/* Scans List */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-500 ${isFading ? "opacity-0" : "opacity-100"}`}>
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
          <p className="text-white text-lg">No scans found.</p>
        )}
      </div>

      {/* Add Scan Button */}
      <div className="flex justify-center mt-4">
        <button
          className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-purple-400 hover:text-black transition"
          onClick={scrolltoNext}
        >
          Add A Scan
        </button>
      </div>

      {/* View All Modal */}
      {viewAll && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full">
            {/* View All Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xl font-semibold text-gray-900">Scans:</p>
              <input
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 outline-none"
                value={VAscanName}
                onChange={(e) => setVAScanName(e.target.value)}
                placeholder="Search scans..."
              />
            </div>

            {/* View All Scans List */}
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
                <p className="text-gray-700 text-lg text-center">No scans found.</p>
              )}
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-center">
              <button
                className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
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
