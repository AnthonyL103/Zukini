import Scan from './Scan';
import AddScan from './AddScan';


const ScanList = ({ scans, onDelete, onAddScan}) => {
  return (
    
    <div className="scan-list">
      {scans.map((scan) => (
        
        <Scan
          scankey={scan.scankey}
          filepath={scan.filepath}
          scanname={scan.scanname}
          text={scan.value}
          date={scan.date}
          onDelete={onDelete}
        />
      ))}
      <AddScan onAddScan={onAddScan}/>
    </div>
  );
};

export default ScanList;
