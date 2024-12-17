import Scan from './Scan';
import AddScan from './AddScan';

const ScanList = ({ scans }) => {
    return(
    <div className = "scan-list">
        {scans.map((scan)=> (
        <Scan 
            id = {scan.id} 
            text = {scan.text} 
            date = {scan.date}
            />
        ))}
        <AddScan />
    </div>
    );
};
export default ScanList;