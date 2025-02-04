// export const sendSMS = async (to: string, message: string): Promise<void> => {
//     try {
//       const response = await twilioClient.messages.create({
//         body: message,
//         to,
//         from: process.env.TWILIO_PHONE_NUMBER!,
//       });
//       logger.info(`SMS sent successfully to ${to}: ${response.sid}`);
//     } catch (error: any) {
//       logger.error(`Failed to send SMS to ${to}: ${error.message || error}`);
//     }
//   };