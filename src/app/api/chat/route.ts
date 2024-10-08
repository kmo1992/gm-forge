import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const INSTRUCTIONS_FILE = path.join(process.cwd(), 'instructions.md');
const ASSISTANT_MODEL = "gpt-4-0125-preview";
const AUDIO_MODEL = "tts-1";
const AUDIO_VOICE = "fable";
const IMAGE_MODEL = "dall-e-3";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const instructions = await fs.readFile(INSTRUCTIONS_FILE, 'utf-8');
    const fullMessages = [{ role: "system", content: instructions }, ...messages];

    const response = await openai.chat.completions.create({
      model: ASSISTANT_MODEL,
      messages: fullMessages,
    });

    const assistantResponse = response.choices[0].message.content;

    // Generate image if a file response is detected
    let imageUrl = null;
    if (assistantResponse.includes('[File:')) {
      const imagePrompt = `Create an image based on the following context: ${assistantResponse}`;
      const imageResponse = await openai.images.generate({
        model: IMAGE_MODEL,
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
      });
      imageUrl = imageResponse.data[0].url;
    }

    const audioResponse = await openai.audio.speech.create({
      model: AUDIO_MODEL,
      voice: AUDIO_VOICE,
      input: assistantResponse
        .replace(/\[File: .+?\.md\]\n?/g, '') // Remove file declarations from voice response  
        .replace(/```[\s\S]+?```/g, '') // Remove code blocks from voice response
    });

    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
    const audioBase64 = audioBuffer.toString('base64');

    console.log(assistantResponse);

    return NextResponse.json({
      text: assistantResponse,
      audio: `data:audio/mp3;base64,${audioBase64}`,
      image: imageUrl
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json({ error: 'Chat failed', details: error.message }, { status: 500 });
  }
}