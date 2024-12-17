import { MdDeleteForever } from 'react-icons/md';

const Scan = () => {
    return (
        <div className="scan">
        <span>Hello this is our first scan</span>
        <div className = "scan-footer"> 
            <small>12/16/2024</small>
            <MdDeleteForever className ="deleteicon" size="1.3em" />

        </div>
    </div>
    );
};

export default Scan;