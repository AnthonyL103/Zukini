const express = require('express');
const cors = require('cors');
const { userinfos } = require('./db');
const app = express();
app.use(express.json());
const port = 5006;
const bcrypt = require('bcrypt');

app.use(cors());

const { v4: uuidv4 } = require('uuid'); // Import uuid

async function appendnewusertoDB(newEntry) {
    try {
        const existingUser = await userinfos.findOne({ where: { email: newEntry.email } });
        if (existingUser) {
            console.log('Error: User already exists');
            return { success: false, message: "User with this email already exists" };
        }

        const userId = uuidv4();

        const hashedPassword = await bcrypt.hash(newEntry.password, 10);

        await userinfos.create({
            id: userId,  
            email: newEntry.email,
            password: hashedPassword,
            createdat: new Date(),
        });

        console.log(`New user created with ID: ${userId}`);
        return { success: true, message: "User registered successfully", userId };

    } catch (error) {
        console.error('Error appending to the database:', error);
        return { success: false, message: "Database error" };
    }
}

async function checklogin(entry) {
    try {
        // Find user by email
        const user = await userinfos.findOne({ where: { email: entry.email } });

        if (!user) {
            return { success: false, message: "User not found" };
        }

        // Compare entered password with hashed password
        const isMatch = await bcrypt.compare(entry.password, user.password);

        if (!isMatch) {
            return { success: false, message: "Incorrect password" };
        }

        return { success: true, message: "Login successful", userId: user.id };
    } catch (error) {
        console.error('Error checking login:', error);
        return { success: false, message: "Database error" };
    }
}

app.post('/signup', async (req, res) => {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newEntry = {
        email: Email,
        password: Password,
    };

    const result = await appendnewusertoDB(newEntry);
    
    if (result.success) {
        return res.status(201).json(result);
    } else {
        return res.status(400).json(result);
    }
});

app.post('/login', async (req, res) => {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
        return res.status(400).json({ success: false, message: "Missing email or password" });
    }

    const result = await checklogin({ email: Email, password: Password });

    if (result.success) {
        return res.status(200).json(result);
    } else {
        return res.status(401).json(result);
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});