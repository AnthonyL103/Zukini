import Authentication from '../authentication/Authentication';
import { useUser } from '../authentication/UserContext';

const AccountPage = () => {
    const { userId, email, totalScans, totalFlashcards, totalMockTests } = useUser();

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-6xl mx-auto pt-[9dvh] px-4">
                {/* Header Section */}
                    <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-[#67d7cc] to-[#2c5d63] bg-clip-text text-transparent">
                        Account Information
                    </h1>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {[
                            { label: "Total Scans", value: totalScans },
                            { label: "Total Flashcards", value: totalFlashcards },
                            { label: "Total Mock Tests", value: totalMockTests }
                        ].map((stat, index) => (
                            <div key={index} 
                                className="bg-gradient-to-br from-[#67d7cc] to-[#2c5d63] p-6 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] text-center transform transition-all hover:-translate-y-2"
                            >
                                <p className="text-white text-3xl font-bold mb-2">
                                    {stat.value || 0}
                                </p>
                                <p className="text-white/80 text-sm uppercase tracking-wider">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* User Info */}
                    <div className="bg-white p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all duration-300">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <span className="text-primary font-semibold">Account ID:</span>
                                <span className="text-gray-700">
                                    {userId && !userId.startsWith("guest-") ? userId : "Guest"}
                                </span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-primary font-semibold">Email:</span>
                                <span className="text-gray-700">{email || "None"}</span>
                            </div>
                        </div>
                    </div>

            </div>
        </div>
    );
};

export default AccountPage;
