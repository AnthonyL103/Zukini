import Scan from './Scan';
import AddScan from './AddScan';

const ScanList = ({ scans, onDelete, index, onAddScan }) => {
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
      <AddScan onAddScan={onAddScan}/>
    </div>
  );
};

export default ScanList;
