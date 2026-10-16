import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  family: 4,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("SMTP connection failed:", error);
  } else {
    console.log("SMTP server is ready.");
  }
});
export const sendActivationEmail = async ({
  to,
  firstName,
  activationToken,
}) => {
  const activationUrl =
    `${process.env.FRONTEND_URL}/activate?token=` +
    encodeURIComponent(activationToken);

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "DIGAF Help Desk - Activate Your Account",

    text: `
Hello ${firstName},

Your DIGAF Internal Help Desk account has been created.

Please use the following link to activate your account:

${activationUrl}

This activation link will expire in 24 hours.

If you did not expect this email, please contact the system administrator.

DIGAF MICROFINANCE S.C.
Access Beyond Limits
    `,

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>DIGAF MICROFINANCE S.C.</h2>

        <p>Hello ${firstName},</p>

        <p>
          Your DIGAF Internal Help Desk account has been created.
        </p>

        <p>
          Click the button below to activate your account:
        </p>

        <p>
          <a
            href="${activationUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #0066cc;
              color: white;
              text-decoration: none;
              border-radius: 5px;
            "
          >
            Activate Account
          </a>
        </p>

        <p>
          This activation link will expire in
          <strong>24 hours</strong>.
        </p>

        <p>
          If you did not expect this email, please contact the system administrator.
        </p>

        <p>
          DIGAF MICROFINANCE S.C.<br>
          Access Beyond Limits
        </p>
      </div>
    `,
  });

  console.log("Activation email sent:", info.messageId);

  return info;
};


export const sendPasswordResetEmail = async ({ to, firstName, resetToken }) => {
  const resetUrl =
    `${process.env.FRONTEND_URL}/reset-password?token=` +
    encodeURIComponent(resetToken);

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "DIGAF Help Desk - Reset Your Password",
    text: `Hello ${firstName},

We received a request to reset your DIGAF Help Desk password.

Use the following link to reset your password:
${resetUrl}

This link expires in 15 minutes and can only be used once.

If you did not request a password reset, you can ignore this email.

DIGAF Help Desk Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #1f4e79;">DIGAF Help Desk</h2>
        <p>Hello ${firstName},</p>
        <p>We received a request to reset your DIGAF Help Desk password.</p>
        <p>Click the button below to choose a new password. This link expires in 15 minutes and can only be used once.</p>
        <p style="margin: 28px 0;">
          <a href="${resetUrl}"
             style="background-color: #1f4e79; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>If the button doesn't work, copy this link into your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <p>If you did not request a password reset, you can ignore this email.</p>
        <p>DIGAF Help Desk Team</p>
      </div>
    `,
  });

  console.log("Password reset email sent:", info.messageId);
  return info;
};
