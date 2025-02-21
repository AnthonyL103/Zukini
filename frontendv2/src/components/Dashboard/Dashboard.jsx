import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../authentication/UserContext";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();
  const { totalScans, totalFlashcards, totalMockTests, name } = useUser();

  // Redirect if not logged in
  /*
  useEffect(() => {
    if (!userId || userId.startsWith("guest-")) {
      navigate("/login");
    }
  }, [userId, navigate]);
  */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 py-10 px-4 mt-[7dvh]"
    >
      <div className="max-w-7xl mx-auto ">
        {/* Welcome Section */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold text-[#0f0647]">
            Welcome back, {name || "User"}!
          </h1>
          <p className="text-lg text-gray-600 mt-3">
            Here's an overview of your study materials and recent activity.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="rounded-xl p-1 bg-gradient-to-r from-[#0f0647] to-[#67d7cc] shadow-lg">
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Scans</h3>
              <p className="text-3xl font-bold text-[#0f0647]">{totalScans}</p>
            </div>
          </div>
          <div className="rounded-xl p-1 bg-gradient-to-r from-[#0f0647] to-[#67d7cc] shadow-lg">
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Flashcard Sets</h3>
              <p className="text-3xl font-bold text-[#0f0647]">{totalFlashcards}</p>
            </div>
          </div>
          <div className="rounded-xl p-1 bg-gradient-to-r from-[#0f0647] to-[#67d7cc] shadow-lg">
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Mock Tests</h3>
              <p className="text-3xl font-bold text-[#0f0647]">{totalMockTests}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-[#0f0647] mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => navigate("/library")}
              className="w-full text-left"
            >
              <div className="rounded-xl p-1 bg-gradient-to-r from-[#0f0647] to-[#67d7cc] shadow-lg transition hover:shadow-2xl">
                <div className="bg-white rounded-xl p-4">
                  <h3 className="font-semibold text-xl text-gray-800 mb-1">
                    View Library
                  </h3>
                  <p className="text-gray-600">
                    Access all your scans and study materials.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/create")}
              className="w-full text-left"
            >
              <div className="rounded-xl p-1 bg-gradient-to-r from-[#0f0647] to-[#67d7cc] shadow-lg transition hover:shadow-2xl">
                <div className="bg-white rounded-xl p-4">
                  <h3 className="font-semibold text-xl text-gray-800 mb-1">
                    New Scan
                  </h3>
                  <p className="text-gray-600">
                    Upload and process new study material.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/study")}
              className="w-full text-left"
            >
              <div className="rounded-xl p-1 bg-gradient-to-r from-[#0f0647] to-[#67d7cc] shadow-lg transition hover:shadow-2xl">
                <div className="bg-white rounded-xl p-4">
                  <h3 className="font-semibold text-xl text-gray-800 mb-1">
                    Study Session
                  </h3>
                  <p className="text-gray-600">
                    Start a new study session.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-3xl font-bold text-[#0f0647] mb-6">Recent Activity</h2>
          <div className="rounded-xl p-1 bg-gradient-to-r from-[#0f0647] to-[#67d7cc] shadow-lg">
            <div className="bg-white rounded-xl p-6">
              <p className="text-gray-600 text-center py-8">
                Your recent activity will appear here.
              </p>
            </div>
          </div>
        </div>

        
      </div>
    </motion.div>
  );
};

export default Dashboard;
