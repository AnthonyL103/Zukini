const express = require('express');
const cors = require('cors');
const { userinfos } = require('../Database/db');
const app = express();
app.use('/account/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
const port = 5006;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
        email: Email.toLowerCase(),
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

async function sendEmail(to, subject, text) {
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
        await sendEmail(email, "Your Verification Code", `Your verification code is: <strong>${code}</strong>. This code will expire in 5 minutes.`);
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


//random test
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Missing email or password" });
    }

    try {
        console.log("checking for ", email.toLowerCase());
        const user = await userinfos.findOne({ where: { email: email.toLowerCase() } });

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
    
    console.log(email);

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    try {
        const user = await userinfos.findOne({ where: { email: email } });
        console.log("made it here");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.verified) {
            return res.status(403).json({ success: false, message: "Please verify your email before logging in." });
        }
        console.log("made it here2");
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

const rejectGuestUsers = async (req, res, next) => {
    const userId = req.body.userId || req.query.userId;
    
    if (!userId) {
        return res.status(401).json({ success: false, message: "User ID is required" });
    }
    
    // Check if userId starts with "guest, so we can reject them from accessing premium features"
    if (userId.toString().startsWith('guest')) {
        return res.status(469).json({ 
            success: false, 
            message: "Guest users cannot access premium features. Please create an account."
        });
    }
    
    next();
};



router.post('/stripe/create-checkout-session', rejectGuestUsers, async (req, res) => {
    try {
        const { userId } = req.body;
        
        // Get the userID from database
        const user = await userinfos.findOne({ where: { id: userId } });
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        
        // If user doesn't have a Stripe customer yet, create one
        let customerId = user.stripe_customer_id;
        
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: {
                    userId: user.id
                }
            });
            
            customerId = customer.id;
            
            // Save the customer ID to the user record
            await userinfos.update(
                { stripe_customer_id: customerId },
                { where: { id: userId } }
            );
        }
        
        // Create the checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID, // Your price ID from Stripe
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            customer: customerId,
            // Add custom metadata to identify the user
            subscription_data: {
                metadata: {
                    userId: user.id
                }
            },
            // Redirect URLs
            success_url: `${process.env.APP_URL}/account?success=true`,
            cancel_url: `${process.env.APP_URL}/account?canceled=true`,
        });


        
        res.json({ success: true, url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create a customer portal session for managing subscription
router.post('/stripe/create-portal-session', rejectGuestUsers, async (req, res) => {
    try {
        const { userId } = req.body;
        
        // Get the user from database
        const user = await userinfos.findOne({ where: { id: userId } });
        
        if (!user || !user.stripe_customer_id) {
            return res.status(404).json({ success: false, message: "User or Stripe customer not found" });
        }
        
        // Create the portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripe_customer_id,
            return_url: `${process.env.APP_URL}/account`,
        });
        
        res.json({ success: true, url: session.url });
    } catch (error) {
        console.error('Error creating portal session:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Check subscription status
router.get('/stripe/subscription-status', rejectGuestUsers, async (req, res) => {
    try {
        const { userId } = req.query;
        
        // Get the user from database
        const user = await userinfos.findOne({ where: { id: userId } });
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        res.json({ 
            success: true,
            status: user.subscription_status || 'free',
            isSubscribed: user.subscription_status === 'premium'
        });
    } catch (error) {
        console.error('Error checking subscription status:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Webhook to handle Stripe events
router.post('/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    console.log(`Webhook received: ${event.type}`);
    
    switch (event.type) {
        case 'customer.subscription.created': {
            // Handle new subscription creation
            const subscription = event.data.object;
            const customerId = subscription.customer;
            
            const user = await userinfos.findOne({
                where: { stripe_customer_id: customerId }
            });
            
            if (user && (subscription.status === 'active' || subscription.status === 'trialing')) {
                await userinfos.update(
                    { subscription_status: 'premium' },
                    { where: { id: user.id } }
                );
                await sendEmail(user.email, "Subscription Activated", `Dear <strong>${user.name}</strong> Thank you for subscribing to Zukini Premium!`);
                console.log(`User ${user.id} set to premium subscription status`);
            }
            break;
        }
        
        case 'customer.subscription.updated': {
            const subscription = event.data.object;
            const customerId = subscription.customer;
            const status = subscription.status;
            const canceledAtPeriodEnd = subscription.cancel_at_period_end;
            
            console.log(`Subscription updated: Customer ID ${customerId}, Status: ${status}, Canceled at period end: ${canceledAtPeriodEnd}`);
            
            try {
                const user = await userinfos.findOne({
                    where: { stripe_customer_id: customerId }
                });
                
                if (user) {
                    // Handling new subscriptions
                    if ((status === 'active' || status === 'trialing') && !canceledAtPeriodEnd && user.subscription_status !== 'premium') {
                        console.log(`Upgrading user ${user.id} from free to premium status`);
                        await userinfos.update(
                            { subscription_status: 'premium' },
                            { where: { id: user.id } }
                        );
                        
                        await sendEmail(user.email, "Subscription Activated", `Dear <strong>${user.name}</strong>, Thank you for subscribing to Zukini Premium!`);
                    } 
                    // Handling cancellations (still active but marked for cancellation)
                    else if ((status === 'active' || status === 'trialing') && canceledAtPeriodEnd === true && user.subscription_status === 'premium') {
                        console.log(`User ${user.id} subscription has been marked for cancellation at period end`);
                        await sendEmail(user.email, "Subscription Cancellation Confirmed", `Dear <strong>${user.name}</strong>, your subscription cancellation has been processed. You will continue to have premium access until the end of your current billing period.`);
                    } 
                    else {
                        console.log(`No status change detected or no email needed. Current: ${user.subscription_status}, Stripe status: ${status}, Canceled at period end: ${canceledAtPeriodEnd}`);
                    }
                }
            } catch (error) {
                console.error(`Error processing subscription update: ${error.message}`);
            }
            break;
        }
        
        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            const customerId = subscription.customer;
            
            const user = await userinfos.findOne({
                where: { stripe_customer_id: customerId }
            });
            
            if (user) {
                await userinfos.update(
                    { subscription_status: 'free' },
                    { where: { id: user.id } }
                );
                await sendEmail(user.email, "Subscription Canceled", `Dear <strong>${user.name}</strong> Your subscription has been canceled successfully.`);
                console.log(`User ${user.id} downgraded to free subscription status`);
            }
            break;
        }
    }
    
    // Return a 200 response to acknowledge receipt of the event
    res.send({ received: true });
});



app.use('/account', router);


app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});