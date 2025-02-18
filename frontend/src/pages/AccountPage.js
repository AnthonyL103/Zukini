import Authentication from '../authentication/Authentication';
import { useUser } from '../authentication/UserContext';

const AccountPage = () => {
    const { userId } = useUser();
    const { email } = useUser();
    const { totalScans } = useUser();
    const { totalFlashcards } = useUser();
    const { totalMockTests } = useUser();
    const { name } = useUser();
    return (
        <div className="Accountcontainer">
            <div className="Accountpagecont">
            <p className="homepagecont-title">Account Information: </p>
            <p className="account-body">User name: {name ? name : "Guest"}</p>
            <p className="account-body">Account id: {userId && !userId.startsWith("guest-") ? userId : "Guest"} </p>
            <p className="account-body">Account email: {email ? email : "None"}</p>
            <p className="account-body">Total scans: {totalScans} </p>
            <p className="account-body">Total Flashcards: {totalFlashcards} </p>
            <p className="account-body">Total Mocktests: {totalMockTests} </p>
            <Authentication/>
            </div>
        </div>
    )
};

export default AccountPage;