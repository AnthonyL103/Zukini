import Authentication from '../Authentication';
import { useUser } from '../UserContext';

const AccountPage = () => {
    const { userId, email, totalScans, totalFlashcards, totalMockTests } = useUser();

    return (
        <div className="max-w-[1200px] h-[80dvh] md:h-[75dvh] p-6 mt-[1dvh] mx-auto overflow-y-auto snap-y snap-mandatory">
            <div className="relative h-full flex flex-col p-5 bg-[rgba(15,6,71,0.4)] rounded-xl mb-4 snap-start">
                <p className="text-white text-[clamp(1.5rem,3vw,2.5rem)] font-semibold">Account Information:</p>
                <p className="text-white mt-5 text-lg">Account id: {userId && !userId.startsWith("guest-") ? userId : "Guest"}</p>
                <p className="text-white text-lg">Account email: {email || "None"}</p>
                <p className="text-white text-lg">Total scans: {totalScans}</p>
                <p className="text-white text-lg">Total Flashcards: {totalFlashcards}</p>
                <p className="text-white text-lg">Total Mock Tests: {totalMockTests}</p>
                <Authentication />
            </div>
        </div>
    );
};

export default AccountPage;
