import Scan from './Scan';
import AddScan from './AddScan';

const ScanList = ({ scans }) => {
  return (
    <div className="scan-list">
      {scans.map((scan, index) => (
        <Scan
          key={index} // Use index as key if no unique ID is present
          filename={scan.filename}
          text={scan.text}
          date={scan.date}
        />
      ))}
      <AddScan />
    </div>
  );
};

export default ScanList;
