import mysql from "mysql2";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();

// Creating MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Controller method to handle form submission
const submitContactForm = (req, res) => {
  const { firstName, lastName, email, subject } = req.body;

  // Insert the form data into the database
  pool.query(
    "INSERT INTO contacts (firstName, lastName, email, subject) VALUES (?, ?, ?, ?)",
    [firstName, lastName, email, subject],
    async (error, results) => {
      if (error) {
        return res.status(500).json({
          error: "An error occurred while saving the contact form data.",
        });
      }

      try {
        // Send email with the form data
        await transporter.sendMail({
          from: process.env.EMAIL_USERNAME, // Sender address
          to: process.env.EMAIL_RECEIVER, // Receiver address
          subject: "New Contact Form Submission",
          text: `
            First Name: ${firstName}
            Last Name: ${lastName}
            Email: ${email}
            Subject: ${subject}
          `,
        });

        res.status(201).json({
          message: "Contact form data saved and email sent successfully.",
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        res
          .status(500)
          .json({ error: "An error occurred while sending the email." });
      }
    }
  );
};

export { submitContactForm };
