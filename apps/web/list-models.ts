import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyBg7kq9tpqm3jGM6k3EiOSliw_7sbQPwOE');

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY || 'AIzaSyBg7kq9tpqm3jGM6k3EiOSliw_7sbQPwOE'}`);
    const data = await response.json();
    console.log('Available models:');
    if (data.models) {
      data.models.forEach((m: any) => console.log(m.name, m.supportedGenerationMethods));
    } else {
      console.log('Error fetching models:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();
