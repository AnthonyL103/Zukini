const express = require('express');
const cors = require('cors');
const { userinfos } = require('../Database/db');
const { logger } = require('./logging'); 
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
const { v4: uuidv4 } = require('uuid'); 
let verificationCodes = {}; 
sgMail.setApiKey(process.env.MAILERKEY);



async function sendVerificationEmail(email, verificationLink) {
    try {
        const msg = {
            to: email,
            from: process.env.EMAIL_FROM, 
            subject: "Verify Your Email - Zukini",
            text: `Click the link to verify your email: ${verificationLink}`,
            html: `<p>Click the link below to verify your email:</p>
                   <a href="${verificationLink}">Verify Email</a>`,
        };

        await sgMail.send(msg);
    } catch (error) {
        console.error("Error sending verification email:", error.response ? error.response.body : error);
    }
}


async function appendnewusertoDB(newEntry) {
    try {
        const existingUser = await userinfos.findOne({ where: { email: newEntry.email } });
        if (existingUser) {
            if (!existingUser.verified) {
                const verificationLink = `https://api.zukini.com/account/verify/${existingUser.verification_token}`;
                logger.info({
                    type: 'unverified_user_retry',
                    userId: existingUser.id,
                    email: newEntry.email,
                    verificationLink: verificationLink
                });
                await sendVerificationEmail(newEntry.email, verificationLink);
                return { success: false, message: "User already exists but is not verified. A new verification email has been sent." };
            }
            logger.warn({
                type: 'registration_duplicate',
                email: newEntry.email,
                existingUserId: existingUser.id
            });
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


        
        const verificationLink = `https://api.zukini.com/account/verify/${verificationToken}`;

        logger.info({
            type: 'user_created',
            userId: userId,
            email: newEntry.email,
            verified: false,
            verificationSent: true,
            timestamp: new Date().toISOString()
        });

        
        await sendVerificationEmail(newEntry.email, verificationLink);

        logger.info({
            type: 'verification_email_sent',
            userId: userId,
            email: newEntry.email
        });
        return { success: true, message: "User registered successfully Please check your email for verification", userId, email: newEntry.email};

    } catch (error) {
        logger.error({
            type: 'user_registration_error',
            email: newEntry.email,
            error: error.message,
            stack: error.stack
        });
        return { success: false, message: "Database error" };
    }
}


router.post('/signup', async (req, res) => {
    const { Email, Password, Name } = req.body;

    logger.info({
        type: 'signup_attempt',
        email: Email?.toLowerCase(),
        hasName: !!Name
    });

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
        logger.info({
            type: 'signup_success',
            userId: result.userId,
            email: result.email
        });
        return res.status(201).json(result);
    } else {
        logger.warn({
            type: 'signup_failure',
            reason: result.message,
            email: Email?.toLowerCase()
        });
        return res.status(400).json(result);
    }
});

router.post('/changepassword', async (req, res) => {
    const { userId, oldPassword, newPassword, isforgot } = req.body;

    
    
    if (isforgot) {
        if (!userId || !newPassword) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        logger.info({
            type: 'changepasswordforgot_attempt',
            userId: userId?.toLowerCase(),
        });
        
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
            logger.info({
                type: 'changepasswordforgot_success',
                userId: userId,
            });
            return res.status(200).json({ success: true, message: "Password updated successfully" });
        } catch (error) {
            logger.warn({
                type: 'changepasswordforgot_failure',
                reason: "Internal server error",
                userId: userId,
            });
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    } 
    else {
        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        logger.info({
            type: 'changepassword_attempt',
            userId: userId?.toLowerCase(),
        });
    
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
            logger.info({
                type: 'changepassword_success',
                userId: userId,
            });
    
            return res.status(200).json({ success: true, message: "Password updated successfully" });
        } catch (error) {
            logger.warn({
                type: 'changepasswordforgot_failure',
                reason: "Internal server error",
                userId: userId,
            });
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

});


router.get("/verify/:token", async (req, res) => {
    const { token } = req.params;

    const user = await userinfos.findOne({ where: { verification_token: token } });

    try {

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

        logger.info( {
            type:"token_verified",
            userId: user.id,
            email: user.email
        });


        return res.send("<h2>Email verified successfully! You can now log in.</h2>");
    } catch (error) {
        logger.warn( {
            type:"token_verification_error",
            userId: user.id,
            email: user.email
        });
        return res.status(500).send("Database error.");
    }
});

async function sendEmail(to, subject, text) {

    

    try {
        const msg = {
            to: to,
            from: { email: process.env.EMAIL_FROM, name: "Zukini Support" }, // Proper format for SendGrid
            subject: subject,
            text: text,
            html: `<p>${text}</p>`, // Ensure HTML version also has the text
        };

        await sgMail.send(msg);
        logger.info({
            type: 'email_sent',
            to: to,
            subject: subject,
            text: text
        });
        
    } catch (error) {
        logger.warn({
            type: 'email_sent_failure',
            to: to,
            subject: subject,
            text: text
        });
    }
}

router.post('/sendCode', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const user = await userinfos.findOne({ where: { email: email } });
    if (!user) {
        return res.status(404).json({ success: false, message: "User doesn't exist" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString(); 
    const expiresAt = Date.now() + 5 * 60 * 1000; 
    
    verificationCodes[email] = { code, expiresAt };


    try {
        await sendEmail(email, "Your Verification Code", `Your verification code is: <strong>${code}</strong>. This code will expire in 5 minutes.`);

        logger.info({
            type: 'code_sent',
            email: email,
            code: code
        });
        res.json({ success: true, message: "Code sent successfully" });


        
        setTimeout(() => {
            if (verificationCodes[email] && verificationCodes[email].expiresAt <= Date.now()) {
                delete verificationCodes[email];
            }
        }, 5 * 60 * 1000); 


    } catch (error) {
        logger.warn({
            type: 'code_sent_failure',
            email: email,
            code: code
        });
        res.status(500).json({ success: false, message: "Failed to send verification code" });
    }
});

router.post('/verifyCode', (req, res) => {
    const { email, code } = req.body;
    const stored = verificationCodes[email];

    if (!stored || stored.code !== code || Date.now() > stored.expiresAt) {
        logger.info({
            type: 'code_verify_failed',
            email: email,
            code: code,
        });
        return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }

    delete verificationCodes[email]; 
    logger.info({
        type: 'code_verify_success',
        email: email,
        code: code,
    });
    res.json({ success: true, message: "Code verified successfully" });
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    logger.info({
        type: 'login_attempt',
        email: email?.toLowerCase()
    });

    if (!email || !password) {
        logger.warn({
            type: 'login_failure',
            reason: 'missing_credentials',
            email: email?.toLowerCase()
        });
        return res.status(400).json({ success: false, message: "Missing email or password" });
    }

    try {
        const user = await userinfos.findOne({ where: { email: email.toLowerCase() } });

        if (!user) {
            logger.warn({
                type: 'login_failure',
                reason: 'user_not_found',
                email: email?.toLowerCase()
            });
            return res.status(400).json({ success: false, message: "User not found" });
        }

        if (!user.verified) {
            logger.warn({
                type: 'login_failure',
                reason: 'not_verified',
                email: email?.toLowerCase(),
                userId: user.id
            });
            return res.status(400).json({ success: false, message: "Please verify your email before logging in." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.warn({
                type: 'login_failure',
                reason: 'incorrect_password',
                email: email?.toLowerCase(),
                userId: user.id
            });
            return res.status(400).json({ success: false, message: "Incorrect password" });
        }

        logger.info({
            type: 'login_success',
            userId: user.id,
            email: user.email
        });

        return res.status(200).json({ success: true, message: "Login successful", userId: user.id, email: user.email, name: user.name });
    } catch (error) {
        logger.error({
            type: 'login_error',
            error: error.message,
            stack: error.stack,
            email: email?.toLowerCase()
        });
        return res.status(500).json({ success: false, message: "Database error" });
    }
});




router.post('/loginforgotpass', async (req, res) => {
    const { email } = req.body;
    
    logger.info({
        type: 'loginforgotpass_attempt',
        email: email?.toLowerCase()
    })

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    try {
        const user = await userinfos.findOne({ where: { email: email } });

        if (!user) {
            logger.warn({
                type: 'loginforgotpass_user_not_found',
                email: email?.toLowerCase()
            })
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.verified) {
            logger.warn({
                type: 'loginforgotpass_user_not_verified',
                email: email?.toLowerCase()
            })
            return res.status(403).json({ success: false, message: "Please verify your email before logging in." });
        }

        logger.info({
            type: 'loginforgotpass_success',
            email: email?.toLowerCase()
        })


        return res.status(200).json({ 
            success: true, 
            message: "Login successful", 
            userId: user.id, 
            email: user.email, 
            name: user.name 
        });

    } catch (error) {
        logger.warn({
            type: 'loginforgotpass_internal_server_error',
            email: email?.toLowerCase()
        })
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

const rejectGuestUsers = async (req, res, next) => {
    const userId = req.body.userId || req.query.userId;
    
    if (!userId) {
        return res.status(401).json({ success: false, message: "User ID is required" });
    }
    
    //check if userId starts with "guest, so we can reject them from accessing premium features"
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

        logger.info({
            type: 'checkout_session_attempt',
            userId: userId
        });
        
        const user = await userinfos.findOne({ where: { id: userId } });
        
        if (!user) {
            logger.warn({
                type: 'checkout_session_failure',
                reason: 'user_not_found',
                userId: userId
            });
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

        logger.info({
            type: 'checkout_session_success',
            userId: user.id,
            email: user.email,
            customerId: customerId,
            sessionId: session.id
        });
        
        res.json({ success: true, url: session.url });
    } catch (error) {
        logger.error({
            type: 'checkout_session_error',
            error: error.message,
            stack: error.stack,
            userId: req.body.userId
        });
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create a customer portal session for managing subscription
router.post('/stripe/create-portal-session', rejectGuestUsers, async (req, res) => {
    try {
        const { userId } = req.body;

        logger.info({
            type: 'portal_session_attempt',
            userId: userId
        });
        
        const user = await userinfos.findOne({ where: { id: userId } });
        
        if (!user || !user.stripe_customer_id) {
            logger.warn({
                type: 'portal_session_failure',
                reason: 'user_or_customer_not_found',
                userId: userId
            });
            return res.status(404).json({ success: false, message: "User or Stripe customer not found" });
        }
        
        const session = await stripe.billingPortal.sessions.create({
            customer: user.stripe_customer_id,
            return_url: `${process.env.APP_URL}/account`,
        });

        logger.info({
            type: 'portal_session_created',
            userId: userId,
            customerId: user.stripe_customer_id,
            sessionId: session.id
        });
        
        res.json({ success: true, url: session.url });
    } catch (error) {
        logger.error({
            type: 'portal_session_error',
            error: error.message,
            stack: error.stack,
            userId: req.body.userId
        });
        res.status(500).json({ success: false, message: error.message });
    }
});

// Check subscription status
router.get('/stripe/subscription-status', rejectGuestUsers, async (req, res) => {
    try {
        const { userId } = req.query;

        logger.info({
            type: 'subscription_status_check',
            userId: userId
        });
        
        const user = await userinfos.findOne({ where: { id: userId } });
        
        if (!user) {
            logger.warn({
                type: 'subscription_status_failure',
                reason: 'user_not_found',
                userId: userId
            });
            return res.status(404).json({ success: false, message: "User not found" });
        }

        logger.info({
            type: 'subscription_status_success',
            userId: userId,
            status: user.subscription_status || 'free',
            isSubscribed: user.subscription_status === 'premium'
        });
        
        res.json({ 
            success: true,
            status: user.subscription_status || 'free',
            isSubscribed: user.subscription_status === 'premium'
        });
    } catch (error) {
        logger.error({
            type: 'subscription_status_error',
            error: error.message,
            stack: error.stack,
            userId: req.query.userId
        });
        res.status(500).json({ success: false, message: error.message });
    }
});

//webhook to handle Stripe events
router.post('/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
        logger.info({
            type: 'stripe_webhook_received',
            eventType: event.type,
            eventId: event.id
        });
    } catch (err) {

        logger.error({
            type: 'stripe_webhook_signature_error',
            error: err.message,
            headers: req.headers['stripe-signature'] ? 'present' : 'missing'
        });
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    

    switch (event.type) {
        case 'customer.subscription.created': {
            const subscription = event.data.object;
            const customerId = subscription.customer;
            
            logger.info({
                type: 'subscription_created',
                subscriptionId: subscription.id,
                customerId: customerId,
                status: subscription.status
            });

            const user = await userinfos.findOne({
                where: { stripe_customer_id: customerId }
            });
            
            if (user && (subscription.status === 'active' || subscription.status === 'trialing')) {
                await userinfos.update(
                    { subscription_status: 'premium' },
                    { where: { id: user.id } }
                );
                await sendEmail(user.email, "Subscription Activated", `Dear <strong>${user.name}</strong> Thank you for subscribing to Zukini Premium!`);
                logger.info({
                    type: 'user_upgraded_to_premium',
                    userId: user.id,
                    customerId: customerId,
                    subscriptionId: subscription.id
                });
            }
            
            else if (!user) {
                logger.warn({
                    type: 'subscription_user_not_found',
                    customerId: customerId,
                    subscriptionId: subscription.id
                });
            }
            break;
        }
        
        case 'customer.subscription.updated': {
            const subscription = event.data.object;
            const customerId = subscription.customer;
            const status = subscription.status;
            const canceledAtPeriodEnd = subscription.cancel_at_period_end;
            const eventId = event.id;

            logger.info({
                type: 'subscription_updated',
                subscriptionId: subscription.id,
                customerId: customerId,
                status: status,
                canceledAtPeriodEnd: canceledAtPeriodEnd,
                eventId: eventId
            });
            
            try {
                const user = await userinfos.findOne({
                    where: { stripe_customer_id: customerId }
                });
                
                if (user) {
                    if (user.subscription_last_event_id === eventId) {
                        logger.info({
                            type: 'duplicate_event_skipped',
                            eventId: eventId,
                            userId: user.id
                        });
                        break;
                    }
                    if ((status === 'active' || status === 'trialing') && !canceledAtPeriodEnd && user.subscription_status !== 'premium') {
                        logger.info({
                            type: 'user_upgraded_to_premium',
                            userId: user.id,
                            customerId: customerId,
                            subscriptionId: subscription.id,
                            previousStatus: user.subscription_status
                        });
                        await userinfos.update(
                            { subscription_status: 'premium' },
                            { where: { id: user.id } }
                        );
                        
                        await sendEmail(user.email, "Subscription Activated", `Dear <strong>${user.name}</strong>, Thank you for subscribing to Zukini Premium!`);
                        return res.send({ received: true });
                    } 
                    else if ((status === 'active' || status === 'trialing') && canceledAtPeriodEnd === true && user.subscription_status === 'premium') {
                        logger.info({
                            type: 'subscription_marked_for_cancellation',
                            userId: user.id,
                            customerId: customerId,
                            subscriptionId: subscription.id
                        });
                        await sendEmail(user.email, "Subscription Cancellation Confirmed", `Dear <strong>${user.name}</strong>, your Zukini premium subscription cancellation has been processed. You will continue to have premium access until the end of your current billing period.`);
                        return res.send({ received: true });
                    }
                    else if ((status == 'active' || status == 'trialing') && canceledAtPeriodEnd === false && user.subscription_status === 'premium') {
                        logger.info({
                            type: 'subscription_reactivated',
                            userId: user.id,
                            customerId: customerId,
                            subscriptionId: subscription.id
                        });
                        await sendEmail(user.email, "Subscription reactivated", `Dear <strong>${user.name}</strong>, your Zukini premium subscription has been successfully reactivated.`);
                        return res.send({ received: true });
                    }
                    else {
                        logger.info({
                            type: 'subscription_no_status_change',
                            userId: user.id,
                            currentStatus: user.subscription_status,
                            stripeStatus: status,
                            canceledAtPeriodEnd: canceledAtPeriodEnd
                        });
                    }

                    await userinfos.update(
                        { subscription_last_event_id: eventId },
                        { where: { id: user.id } }
                    );
                } else {
                    logger.warn({
                        type: 'subscription_user_not_found',
                        customerId: customerId,
                        subscriptionId: subscription.id
                    });
                }
            } catch (error) {
                logger.error({
                    type: 'subscription_update_processing_error',
                    error: error.message,
                    stack: error.stack,
                    customerId: customerId,
                    subscriptionId: subscription.id
                });
            }
            break;
        }
        
        case 'customer.subscription.deleted': {
            const subscription = event.data.object;
            const customerId = subscription.customer;

            logger.info({
                type: 'subscription_deleted',
                subscriptionId: subscription.id,
                customerId: customerId
            });
            
            const user = await userinfos.findOne({
                where: { stripe_customer_id: customerId }
            });
            
            if (user) {
                await userinfos.update(
                    { subscription_status: 'free' },
                    { where: { id: user.id } }
                );
                await sendEmail(user.email, "Subscription Canceled", `Dear <strong>${user.name}</strong> Your subscription has been canceled successfully.`);
                logger.info({
                    type: 'user_downgraded_to_free',
                    userId: user.id,
                    customerId: customerId,
                    subscriptionId: subscription.id
                });
            } else {
                logger.warn({
                    type: 'subscription_deleted_user_not_found',
                    customerId: customerId,
                    subscriptionId: subscription.id
                });
            }
            break;
        }

        default:
            logger.info({
                type: 'unhandled_stripe_event',
                eventType: event.type,
                eventId: event.id
            });
    }
    
    res.send({ received: true });
});



app.use('/account', router);


app.listen(port, '0.0.0.0', () => {
    logger.info({
        type: 'server_start',
        service: 'account_service',
        port: port,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
    console.log(`Server running on port ${port}`);
});