import { transporter, sender } from "./nodemailer.config.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailtemplete.js";

// ✅ Send Verification Email
export const sendVerificationEmail = async (email, verificationToken) => {
  if (!email) {
    throw new Error("Recipient email is missing!");
  }

  try {
    const response = await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Verify Your Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken,
      ),
    });

    console.log("Verification email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    throw new Error(`Error sending verification email: ${error.message}`);
  }
};

// ✅ Send Welcome Email
export const sendWelcomeEmail = async (email, name) => {
  if (!email) {
    throw new Error("Recipient email is missing!");
  }

  try {
    const response = await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Welcome 🎉",
      html: `
        <h1>Welcome ${name} 🎉</h1>
        <p>We're glad to have you at <strong>Internet Billing System</strong>.</p>
        <p>Your account has been successfully created.</p>
      `,
    });

    console.log("Welcome email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending welcome email:", error.message);
    throw new Error(`Error sending welcome email: ${error.message}`);
  }
};

// ✅ Send Password Reset Email
export const sendPasswordRestEmail = async (email, resetURL) => {
  if (!email) {
    throw new Error("Recipient email is missing!");
  }

  try {
    const response = await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Reset Your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    });

    console.log("Password reset email sent:", response);
    return response;
  } catch (error) {
    console.error("Error sending password reset email:", error.message);
    throw new Error(`Error sending password reset email: ${error.message}`);
  }
};

// ✅ Send Reset Success Email
export const sendResetSuccessEmail = async (email) => {
  if (!email) {
    throw new Error("Recipient email is missing!");
  }

  try {
    const response = await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });

    console.log("Password reset success email sent:", response);
    return response;
  } catch (error) {
    console.error("Error sending password reset success email:", error.message);
    throw new Error(
      `Error sending password reset success email: ${error.message}`,
    );
  }
};
