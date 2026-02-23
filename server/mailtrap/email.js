import { MailtrapClient } from "mailtrap";

import { client, sender } from "./mailtrap.config.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailtemplete.js";
// import { app } from "../server.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  if (!email) {
    throw new Error("Recipient email is missing!");
  }

  const recipient = [{ email }];

  try {
    const response = await client.send({
      from: sender,
      to: recipient,
      subject: "Verify Your Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });

    console.log("Email Sent Successfully", response);
    return response;
  } catch (error) {
    console.error(" Error sending verification email:", error.message);
    throw new Error(`Error sending verification email: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    // Capture the response from Mailtrap
    const response = await client.send({
      from: sender,
      to: [{ email }],
      template_uuid: "91a28711-d52b-4bc2-a18b-a513bcf28405".trim(),
      template_variables: {
        company_info_name: "Internet Billing System",
        name: name,
      },
    });

    console.log("Welcome email sent successfully", response);
    return response;
  } catch (error) {
    console.error("Error sending welcome email", error);
    throw new Error(`Error sending welcome email: ${error.message}`);
  }
};

export const sendPasswordRestEmail = async (email, restURL) => {
  const recipient = [{ email }];
  try {
    const response = await client.send({
      from: sender,
      to: [{ email }],
      subject: "Reset your passwpord",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL", restURL),
      category: "Password Reset",
    });
  } catch (error) {
    console.error(`Error sending password reset email`, error);
    throw new Error(`Error sending password reset email:${error}`);
  }
};
export const sendResetSuccessEmail = async (email) => {
  try {
    const response = await client.send({
      from: sender,
      to: [{ email }],
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "password Reset",
    });

    console.log("Password reset email sent successfully", response);
  } catch (error) {
    console.error(`Error sending password reset success email`, error);

    throw new Error(
      `Error sending password reset success email: ${error.message}`
    );
  }
};
