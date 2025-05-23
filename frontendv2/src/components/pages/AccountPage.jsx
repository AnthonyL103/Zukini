import { useUser } from "../authentication/UserContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from 'uuid';
import UpgradeButton from "../utils/upgradebutton";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";


const AccountPage = () => {
  const { userId, setUserId, name, email, setEmail, totalScans, setTotalScans, totalFlashcards, setTotalFlashcards, totalMockTests, setTotalMockTests, setName, isforgot, setisforgot, setIsPremium, setSubscriptionStatus} = useUser();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deleteModal, setshowDeleteModal] = useState(false);
  const [deletePassword, setdeletePassword] = useState("");
  
  useEffect(() => {
    if (isforgot) {
      setShowChangePasswordModal(true);
    }
  }, [isforgot]);
  
  const [isGuestUser, setIsGuestUser] = useState(false);

  useEffect(() => {
    setIsGuestUser(userId && typeof userId === "string" && userId.startsWith("guest-"));
  }, [userId]);

  const handleClose = () => {
    setisforgot(false);
    setShowChangePasswordModal(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setErrorMessage("");
  };

  const handleLogout = () => {

    localStorage.removeItem("currentScan");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    if (userId) {
        const keysToRemove = Object.keys(localStorage).filter(
            (key) =>
                key.startsWith(`flashcards_${userId}_`) ||
                key.startsWith(`mocktests_${userId}_`) ||
                key.startsWith(`summary_${userId}_`)
        );

        keysToRemove.forEach((key) => localStorage.removeItem(key));
    }
    sessionStorage.clear();

    const newGuestId = `guest-${uuidv4()}`;
    sessionStorage.setItem("guestUserId", newGuestId);

    setUserId(newGuestId);
    setEmail(null);
    setName(null);
    setTotalScans(0);
    setTotalFlashcards(0);
    setTotalMockTests(0);
    setisforgot(false);
    setIsPremium(false);
    setSubscriptionStatus('free');

    setTimeout(() => {
        window.location.reload();
    }, 100); //delay to allow state updates to apply before reload for user context
};


  const passwordValidations = {
    hasLength: newPassword.length >= 8,
    hasCapital: /[A-Z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecial: /[!@#$%^&*]/.test(newPassword),
};

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("https://api.zukini.com/display/deleteAccount", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          password: deletePassword 
        })
      });
    
      const data = await response.json();
    
      if (data.message) {  
        alert("Account deleted successfully");
        setshowDeleteModal(false);
        setdeletePassword("");
        setErrorMessage("");
        handleLogout();
      } else {
        setErrorMessage(data.error);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      setErrorMessage("An error occurred while deleting your account.");
    }
  };

  const handleConfirmChangePassword = async (e) => {
    e.preventDefault();
    e.preventDefault();

  if (newPassword !== confirmNewPassword) {
    setErrorMessage("New passwords do not match");
    return;
  }

  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=.*[A-Z]).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    setErrorMessage("New password must be at least 8 characters long and include at least one number, one uppercase letter, and one special character.");
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
      console.error("Error changing password:", error);
      setErrorMessage("An error occurred while changing your password.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen mt-[7dvh] bg-gradient-to-br from-gray-50 to-gray-200 py-10 px-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-[#0f0647]">Account</h1>
          <p className="text-lg text-gray-600 mt-3">
            Manage your account settings and preferences
          </p>
        </div>

        {/* User Info Card */}
        <div className="rounded-xl p-1 bg-gradient-to-r from-[#0f0647] to-[#67d7cc] shadow-lg mb-8">
          <div className="bg-white rounded-xl p-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <span className="text-[#0f0647] font-semibold">Account ID:</span>
                <span className="text-gray-700">{userId && !userId.startsWith("guest-") ? userId : "Guest"}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-[#0f0647] font-semibold">Email:</span>
                <span className="text-gray-700">{email || "None"}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-[#0f0647] font-semibold">Name:</span>
                <span className="text-gray-700">{name || "None"}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-[#0f0647] font-semibold">Total Scans:</span>
                <span className="text-gray-700">{totalScans}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-[#0f0647] font-semibold">Total Flashcards:</span>
                <span className="text-gray-700">{totalFlashcards}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-[#0f0647] font-semibold">Total Mock Tests:</span>
                <span className="text-gray-700">{totalMockTests}</span>
              </div>
              
                <UpgradeButton />

              
            </div>

            {!isGuestUser && (
              <div className="flex flex-row gap-5"> 
              <button
              onClick={() => setshowDeleteModal(true)}
              className="hover:cursor-pointer  hover:bg-red-700 mt-8 w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold transition-all hover:bg-opacity-90"
            >
              Delete Account
            </button>
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="hover:cursor-pointer hover:bg-[#2c2099] mt-8 w-full px-6 py-3 bg-[#0f0647] text-white rounded-lg font-semibold transition-all hover:bg-opacity-90"
              >
                Change Password
              </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-8 w-full max-w-md m-4">
      <form className="space-y-6" onSubmit={handleConfirmChangePassword}>
        <h2 className="text-2xl font-semibold text-center text-[#0f0647]">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#67d7cc] focus:outline-none"
            />
          )}
          
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password" 
              required 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex items-center">
              {passwordValidations.hasLength ? (
                <CheckCircle className="text-green-500 mr-2" size={16} />
              ) : (
                <XCircle className="text-red-500 mr-2" size={16} />
              )}
              <span>At least 8 characters</span>
            </div>
            <div className="flex items-center">
              {passwordValidations.hasCapital ? (
                <CheckCircle className="text-green-500 mr-2" size={16} />
              ) : (
                <XCircle className="text-red-500 mr-2" size={16} />
              )}
              <span>One uppercase letter</span>
            </div>
            <div className="flex items-center">
              {passwordValidations.hasNumber ? (
                <CheckCircle className="text-green-500 mr-2" size={16} />
              ) : (
                <XCircle className="text-red-500 mr-2" size={16} />
              )}
              <span>One number</span>
            </div>
            <div className="flex items-center">
              {passwordValidations.hasSpecial ? (
                <CheckCircle className="text-green-500 mr-2" size={16} />
              ) : (
                <XCircle className="text-red-500 mr-2" size={16} />
              )}
              <span>One special character (!@#$...)</span>
            </div>
          </div>

          <input
            type="password"
            placeholder="Confirm new password"
            required
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#67d7cc] focus:outline-none"
          />
        </div>

        {errorMessage && (
          <p className="text-red-500 text-sm text-center">{errorMessage}</p>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-2 bg-[#0f0647] text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all"
          >
            Confirm
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    {deleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md m-4">
          <h2 className="text-2xl font-semibold text-center text-[#0f0647]">
                Delete Account
              </h2>
              <input
                  type="password"
                  placeholder="type password to confirm"
                  required
                  value={deletePassword}
                  onChange={(e) => setdeletePassword(e.target.value)}
                  className="w-full mt-6 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#67d7cc] focus:outline-none"
                />
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setshowDeleteModal(false)}
                  className="flex-1 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAccount()}
                  className="flex-1 px-6 py-2 hover:cursor-pointer  hover:bg-red-700 bg-red-600 text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all"
                >
                  Confirm
                </button>
              </div>

            {errorMessage && (
                <p className="text-red-500 text-sm text-center">{errorMessage}</p>
              )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AccountPage;