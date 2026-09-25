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
