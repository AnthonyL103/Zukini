import { MdDeleteForever } from 'react-icons/md';

const Scan = ({ id, text, date }) => {
    return (
        <div className="scan">
        <span>{text}</span>
        <div className = "scan-footer"> 
            <small>{date}</small>
            <MdDeleteForever className ="delete-icon" size="1.3em" />

        </div>
    </div>
    );
};

export default Scan;