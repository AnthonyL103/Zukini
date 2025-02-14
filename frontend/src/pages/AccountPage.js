import Authentication from '../Authentication';
import { useUser } from '../UserContext';

const AccountPage = () => {
    const { userId, email, totalScans, totalFlashcards, totalMockTests } = useUser();
    
    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-4xl mx-auto bg-overlay rounded-2xl p-8">
                <p className="text-[clamp(1.5rem,3vw,2.5rem)] font-semibold text-white mb-6">
                    Account Information:
                </p>
                <p className="text-[clamp(1rem,2vw,2rem)] text-white mb-4">
                    Account id: {userId && !userId.startsWith("guest-") ? userId : "Guest"}
                </p>
                <p className="text-[clamp(1rem,2vw,2rem)] text-white mb-4">
                    Account email: {email ? email : "None"}
                </p>
                <p className="text-[clamp(1rem,2vw,2rem)] text-white mb-4">
                    Total scans: {totalScans}
                </p>
                <p className="text-[clamp(1rem,2vw,2rem)] text-white mb-4">
                    Total Flashcards: {totalFlashcards}
                </p>
                <p className="text-[clamp(1rem,2vw,2rem)] text-white mb-4">
                    Total Mocktests: {totalMockTests}
                </p>
                <Authentication />
            </div>
        </div>
    );
};