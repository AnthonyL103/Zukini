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
let verificationCodes = {}; 
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

router.post('/changepassword', async (req, res) => {
    const { userId, oldPassword, newPassword, isforgot } = req.body;
    
    if (isforgot) {
        if (!userId || !newPassword) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        
        try {
            const user = await userinfos.findOne({ where: { id: userId } });
    
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
    
            // Check if old password is correct
    
            // Hash the new password and update it
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            await userinfos.update(
                { password: hashedNewPassword },
                { where: { id: userId } }
            );
    
            return res.status(200).json({ success: true, message: "Password updated successfully" });
        } catch (error) {
            console.error("Error changing password:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    } 
    else {
        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
    
        try {
            const user = await userinfos.findOne({ where: { id: userId } });
    
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
    
            // Check if old password is correct
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Incorrect old password" });
            }
    
            // Hash the new password and update it
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            await userinfos.update(
                { password: hashedNewPassword },
                { where: { id: userId } }
            );
    
            return res.status(200).json({ success: true, message: "Password updated successfully" });
        } catch (error) {
            console.error("Error changing password:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

});


router.get("/verify/:token", async (req, res) => {
    const { token } = req.params;

    try {
        const user = await userinfos.findOne({ where: { verification_token: token } });

        if (!user) {
            const alreadyVerifiedUser = await userinfos.findOne({ where: { verified: true } });
            if (alreadyVerifiedUser) {
                return res.send("<h2>Email is already verified! You can now log in.</h2>");
            }
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

async function sendCodeEmail(to, subject, text) {
    console.log(`Sending email to ${to} with subject: ${subject}`);
    try {
        const msg = {
            to: to,
            from: { email: process.env.EMAIL_FROM, name: "Zukini Support" }, // Proper format for SendGrid
            subject: subject,
            text: text,
            html: `<p>${text}</p>`, // Ensure HTML version also has the text
        };

        await sgMail.send(msg);
        console.log(`Email successfully sent to ${to}`);
    } catch (error) {
        console.error("Error sending email:", error.response ? error.response.body : error);
    }
}

router.post('/sendCode', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const user = await userinfos.findOne({ where: { email: email } });
    if (!user) {
        return res.status(404).json({ success: false, message: "User doesn't exist" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expiresAt = Date.now() + 5 * 60 * 1000; // Code expires in 5 minutes
    
    verificationCodes[email] = { code, expiresAt };

    console.log(`Generated Code for ${email}: ${code}`); // Debugging

    try {
        await sendCodeEmail(email, "Your Verification Code", `Your verification code is: <strong>${code}</strong>. This code will expire in 5 minutes.`);
        res.json({ success: true, message: "Code sent successfully" });
        
        setTimeout(() => {
            if (verificationCodes[email] && verificationCodes[email].expiresAt <= Date.now()) {
                delete verificationCodes[email];
                console.log(`Code for ${email} has expired and been deleted.`);
            }
        }, 5 * 60 * 1000); 
    } catch (error) {
        console.error("Error sending code:", error);
        res.status(500).json({ success: false, message: "Failed to send verification code" });
    }
});

// Verify Code API
router.post('/verifyCode', (req, res) => {
    const { email, code } = req.body;
    const stored = verificationCodes[email];

    if (!stored || stored.code !== code || Date.now() > stored.expiresAt) {
        return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }

    delete verificationCodes[email]; // Remove after successful verification
    res.json({ success: true, message: "Code verified successfully" });
});



router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Missing email or password" });
    }

    try {
        console.log("checking for ", email);
        const user = await userinfos.findOne({ where: { email: email } });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        if (!user.verified) {
            console.log('User not verified');
            return res.status(400).json({ success: false, message: "Please verify your email before logging in." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Incorrect password" });
        }

        return res.status(200).json({ success: true, message: "Login successful", userId: user.id, email: user.email, name: user.name });
    } catch (error) {
        console.error('Error checking login:', error);
        return res.status(500).json({ success: false, message: "Database error" });
    }
});




router.post('/loginforgotpass', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    try {
        const user = await userinfos.findOne({ where: { email: email } });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.verified) {
            return res.status(403).json({ success: false, message: "Please verify your email before logging in." });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Login successful", 
            userId: user.id, 
            email: user.email, 
            name: user.name 
        });

    } catch (error) {
        console.error("Error during login via email:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});



app.use('/account', router);


app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});