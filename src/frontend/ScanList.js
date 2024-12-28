import Scan from './Scan';
import AddScan from './AddScan';

const ScanList = ({ scans, onDelete, index }) => {
  return (
    <div className="scan-list">
      {scans.map((scan) => (
        <Scan
          key = {index}
          filepath={scan.filepath}
          scanname={scan.scanname}
          text={scan.text}
          date={scan.date}
          onDelete={onDelete}
        />
      ))}
      <AddScan />
    </div>
  );
};

export default ScanList;
