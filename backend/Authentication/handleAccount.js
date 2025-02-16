const express = require('express');
const cors = require('cors');
const { userinfos } = require('../Database/db');
const app = express();
app.use(express.json());
const port = 5006;
const bcrypt = require('bcrypt');
const router = express.Router(); 
const sgMail = require('@sendgrid/mail');
require('dotenv').config();
app.use(cors());
const { v4: uuidv4 } = require('uuid'); // Import uuid

sgMail.setApiKey(process.env.MAILERKEY);

async function sendVerificationEmail(email, verificationLink) {
    try {
        console.log(process.env.MAILERKEY, process.env.EMAIL_FROM);
        const msg = {
            to: email,
            from: process.env.EMAIL_FROM, // Must be a verified sender in SendGrid
            subject: "Verify Your Email - Zukini",
            text: `Click the link to verify your email: ${verificationLink}`,
            html: `<p>Click the link below to verify your email:</p>
                   <a href="${verificationLink}">Verify Email</a>`,
        };

        await sgMail.send(msg);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error("Error sending verification email:", error.response ? error.response.body : error);
    }
}


async function appendnewusertoDB(newEntry) {
    try {
        const existingUser = await userinfos.findOne({ where: { email: newEntry.email } });
        if (existingUser) {
            if (!existingUser.verified) {
                console.log('User exists but is not verified. Sending verification email again.');
                const verificationLink = `https://api.zukini.com/account/verify/${existingUser.verification_token}`;
                await sendVerificationEmail(newEntry.email, verificationLink);
                return { success: false, message: "User already exists but is not verified. A new verification email has been sent." };
            }
            return { success: false, message: "User with this email already exists." };
        }
        

        const userId = uuidv4();
        const verificationToken = uuidv4(); 
        const hashedPassword = await bcrypt.hash(newEntry.password, 10);

        await userinfos.create({
            id: userId,  
            email: newEntry.email,
            password: hashedPassword,
            createdat: new Date(),
            verified: false,
            name: newEntry.name,
            verification_token: verificationToken,
        });

        console.log(`New user created with ID: ${userId}`);
        
        const verificationLink = `https://api.zukini.com/account/verify/${verificationToken}`;

        console.log(`Verification Link: ${verificationLink}`);
        
        await sendVerificationEmail(newEntry.email, verificationLink);
        return { success: true, message: "User registered successfully Please check your email for verification", userId, email: newEntry.email};

    } catch (error) {
        console.error('Error appending to the database:', error);
        return { success: false, message: "Database error" };
    }
}

async function checklogin(entry) {
    try {
        const user = await userinfos.findOne({ where: { email: entry.email } });

        if (!user) {
            return { success: false, message: "User not found" };
        }

        if (!user.verified) {
            return { success: false, message: "Please verify your email before logging in." };
        }

        const isMatch = await bcrypt.compare(entry.password, user.password);

        if (!isMatch) {
            return { success: false, message: "Incorrect password" };
        }

        return { success: true, message: "Login successful", userId: user.id, email: user.email, name: user.name };
    } catch (error) {
        console.error('Error checking login:', error);
        return { success: false, message: "Database error" };
    }
}


router.post('/signup', async (req, res) => {
    const { Email, Password, Name } = req.body;

    if (!Email || !Password || !Name) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newEntry = {
        email: Email,
        password: Password,
        name: Name,
    };

    const result = await appendnewusertoDB(newEntry);
    
    if (result.success) {
        return res.status(201).json(result);
    } else {
        return res.status(400).json(result);
    }
});

router.get("/verify/:token", async (req, res) => {
    const { token } = req.params;

    try {
        const user = await userinfos.findOne({ where: { verification_token: token } });

        if (!user) {
            return res.status(400).send("Invalid or expired verification link.");
        }

        await userinfos.update(
            { verified: true, verification_token: null },
            { where: { id: user.id } }
        );

        return res.send("<h2>Email verified successfully! You can now log in.</h2>");
    } catch (error) {
        console.error("Error verifying email:", error);
        return res.status(500).send("Database error.");
    }
});


router.post('/login', async (req, res) => {
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

app.use('/account', router);


app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});