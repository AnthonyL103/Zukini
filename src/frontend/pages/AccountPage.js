import Authentication from '../Authentication';
import { useUser } from '../UserContext';

const AccountPage = () => {
    const { userId } = useUser();
    const { email } = useUser();
    const { totalScans } = useUser();
    const { totalFlashcards } = useUser();
    const { totalMockTests } = useUser();
    return (
        <div className="Accountcontainer">
            <div className="Accountpagecont">
            <p className="homepagecont-title">Account Information: </p>
            <p className="account-body">Account id: {userId} </p>
            <p className="account-body">Account email: {email}</p>
            <p className="account-body">Total scans: {totalScans} </p>
            <p className="account-body">Total Flashcards: {totalFlashcards} </p>
            <p className="account-body">Total Mocktests: {totalMockTests} </p>
            <Authentication/>
            </div>
        </div>
    )
};

export default AccountPage;