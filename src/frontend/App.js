import { useState } from 'react';
import { nanoid } from 'nanoid';
import ScanList from './ScanList';

const App = () => {
    const [scans, setScans] = useState([
        {
            id: nanoid(),
            text: "This is my first scan",
            date: "15/04/2021"
        },
        {
            id: nanoid(),
            text: "This is my first scan",
            date: "15/04/2021"
        },
        {
            id: nanoid(),
            text: "This is my first scan",
            date: "15/04/2021"
        }
    ]);
    return (<div className = "container">
        <ScanList scans={scans}/>
    </div>
    );
}


export default App;