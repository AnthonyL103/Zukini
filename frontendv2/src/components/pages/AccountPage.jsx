import { useUser } from "../authentication/UserContext";
import { useState, useEffect } from "react";
import { useLocation, useNavigate} from "react-router-dom";

const AccountPage = () => {
    
  const { userId, name, email, totalScans, totalFlashcards, totalMockTests, isforgot, setisforgot} = useUser();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  console.log("AccountPage Rendered", { userId, name, email, isforgot });
  
  useEffect(() => {
    if (isforgot) {
      console.log("isforgot changed:", isforgot);

      setShowChangePasswordModal(true);
    }
  }, [isforgot]);
    
 
  
  const handleClose = () => {
    setisforgot(false);
    setShowChangePasswordModal(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setErrorMessage("");
  };

  const handleConfirmChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setErrorMessage("New passwords do not match");
      return;
    }
    if (newPassword === oldPassword) {
      setErrorMessage("New password cannot be the same as the old password");
      return;
    }

    try {
      const response = await fetch("https://api.zukini.com/account/changepassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          oldPassword,
          newPassword,
          isforgot,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Password changed successfully!");
        handleClose();
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.log("Error changing password:", error);
      setErrorMessage("An error occurred while changing your password.");
    }
  };
  
const [isGuestUser, setIsGuestUser] = useState(false);

useEffect(() => {
  setIsGuestUser(userId && typeof userId === "string" && userId.startsWith("guest-"));
}, [userId]); // Only update when `userId` changes


  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto pt-[9dvh] px-4">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-[#67d7cc] to-[#2c5d63] bg-clip-text text-transparent">
          Account Information
        </h1>

        {/* User Info */}
        <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-primary font-semibold">Account ID:</span>
              <span className="text-gray-700">{userId && !userId.startsWith("guest-") ? userId : "Guest"}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-primary font-semibold">Email:</span>
              <span className="text-gray-700">{email || "None"}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-primary font-semibold">Name:</span>
              <span className="text-gray-700">{name || "None"}</span>
            </div>
          </div>
        </div>

        {/* Change Password Button */}
        {!isGuestUser && (
             <button
             onClick={() => setShowChangePasswordModal(true)}
             className="mt-6 flex items-center gap-2 px-6 py-3 text-white bg-black rounded-lg transition hover:bg-purple-400 hover:text-black"
           >
             Change Password
             <div className="flex items-center justify-center">
               <div className="relative w-3 h-0.5 bg-white transition group-hover:bg-black">
                 <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-b-2 border-white -rotate-45 transition group-hover:border-black"></div>
               </div>
             </div>
           </button>
        )}

      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
            <form className="space-y-6" onSubmit={handleConfirmChangePassword}>
              <h2 className="text-2xl font-semibold text-center text-gray-900">
                Change Password
              </h2>
              
              <div className="space-y-4">
                {!isforgot && (
                
                    <input
                    type="password"
                    placeholder="Enter old password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    />
                )}
                
                <input
                  type="password"
                  placeholder="Enter new password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />

                <input
                  type="password"
                  placeholder="Confirm new password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />
              </div>

              {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-500 transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-500 transition"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
