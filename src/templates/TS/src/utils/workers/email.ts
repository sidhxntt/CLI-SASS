import { Worker, Job } from "bullmq";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Ensure SMTP credentials are available
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM, REDIS_HOST, REDIS_PORT } = process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) {
    throw new Error("SMTP credentials are missing in environment variables.");
}

// Initialize Nodemailer Transporter
const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT),
    secure: true, // Use SSL
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
    },
});

// Create a BullMQ Worker for processing email jobs
const email_worker = new Worker(
    "user-emails",
    async (job: Job<{ email: string; message: string }>) => {
        console.log(`Email Job received | ID: ${job.id}`);
        console.log(`Sending email to ${job.data.email}`);

        try {
            await transporter.sendMail({
                from: SMTP_FROM,
                to: job.data.email,
                subject: "Your Email Subject",
                text: job.data.message,
                html: `<p>${job.data.message}</p>`,
            });

            console.log(`Email sent successfully to ${job.data.email}`);
            return { status: "success" };
        } catch (error: any) {
            console.error(`Failed to send email to ${job.data.email}: ${error.message || error}`);
            throw error; // Ensures BullMQ retries the job
        }
    },
    {
        connection: {
            host: REDIS_HOST || "127.0.0.1",
            port: parseInt(REDIS_PORT || "6379"),
        },
        autorun: true, // Automatically starts processing jobs
    }
);

export { email_worker };
