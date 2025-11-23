import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
    let transporter;

    if (process.env.SMTP_HOST) {
        // Use configured SMTP server
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // Use Ethereal for testing
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Who\'s That Pokémon?" <onboarding@resend.dev>',
        to,
        subject,
        html,
    });

    console.log('Message sent: %s', info.messageId);

    // If using Ethereal, log the preview URL
    if (!process.env.SMTP_HOST) {
        console.log('\n=================================================================');
        console.log('📧 [ETHEREAL EMAIL PREVIEW]');
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        console.log('=================================================================\n');
    }

    return info;
}

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
            <div style="background-color: #dc2626; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">Password Reset</h1>
            </div>
            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
                <p style="color: #475569; font-size: 16px;">Hello Trainer,</p>
                <p style="color: #475569; font-size: 16px;">We received a request to reset the password for your account associated with <strong>${email}</strong>.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Reset Password</a>
                </div>
                <p style="color: #475569; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
                <p style="color: #475569; font-size: 14px;">This link will expire in 1 hour.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
                &copy; ${new Date().getFullYear()} Who's That Pokémon?
            </div>
        </div>
    `;

    return sendEmail({
        to: email,
        subject: 'Reset Your Password - Who\'s That Pokémon?',
        html,
    });
}
