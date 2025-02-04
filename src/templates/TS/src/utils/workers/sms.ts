import { Worker, Job } from "bullmq";
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, REDIS_HOST, REDIS_PORT } = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    throw new Error("Twilio credentials are missing in environment variables.");
}

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Create a BullMQ Worker for processing SMS jobs
const sms_worker = new Worker(
    "user-sms",
    async (job: Job<{ to: string; message: string }>) => {
        console.log(`SMS Job received | ID: ${job.id}`);
        console.log(`Sending SMS to ${job.data.to}`);

        try {
            const response = await twilioClient.messages.create({
                body: job.data.message,
                to: job.data.to,
                from: TWILIO_PHONE_NUMBER,
            });

            console.log(`SMS sent successfully to ${job.data.to} | Message SID: ${response.sid}`);
            return { status: "success", sid: response.sid };
        } catch (error: any) {
            console.error(`Failed to send SMS to ${job.data.to}: ${error.message || error}`);
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

export { sms_worker };
