import Scan from './Scan';
import AddScan from './AddScan';

const ScanList = ({ scans }) => {
  return (
    <div className="scan-list">
      {scans.map((scan, index) => (
        <Scan
          key={index}
          scanname={scan.scanname}
          text={scan.text}
          date={scan.date}
        />
      ))}
      <AddScan />
    </div>
  );
};

export default ScanList;
