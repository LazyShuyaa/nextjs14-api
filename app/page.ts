import FormData from 'form-data';
import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filePath } = req.body; // The path to the local file you want to upload

  try {
    const form = new FormData();
    form.append('chat_id', '6857856691'); // Replace with your chat ID
    form.append('photo', fs.createReadStream(filePath)); // File from local system

    // Using fetch to send the request
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`,
      {
        method: 'POST',
        body: form as any, // Assert the type as 'any'
        headers: {
          ...form.getHeaders(), // Set the headers for the FormData
        },
      }
    );

    // Check if the response is ok
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.description || 'Failed to upload photo');
    }

    const data = await response.json();
    const fileId = data.result.photo[0].file_id; // Access the file_id from the response
    res.status(200).json({ fileId });
  } catch (error) {
    let errorMessage = 'An error occurred';

    if (error instanceof Error) {
      errorMessage = error.message; // Use the error message directly
    }

    console.error('Error uploading photo to Telegram:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
}

export default handler;
