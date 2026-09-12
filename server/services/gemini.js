import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;

function getClient() {
  if (!genAI) {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('Missing GOOGLE_API_KEY in environment');
    }
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }
  return genAI;
}

/**
 * Builds a compact project registry string to inject as context into Gemini.
 * @param {Array} projects
 * @returns {string}
 */
function buildProjectContext(projects = []) {
  if (!projects.length) return 'No projects are currently in the registry.';

  return projects
    .slice(0, 40) // cap context length
    .map((p) => {
      const team = (p.team || []).map((m) => `${m.name} (${m.role})`).join(', ');
      return [
        `Project: ${p.title}`,
        `Stack: ${p.stack || (p.tech_stack || []).join(', ')}`,
        `Status: ${p.status || 'Unknown'}`,
        `Summary: ${p.summary || ''}`,
        p.course ? `Course: ${p.course}` : '',
        team ? `Team: ${team}` : '',
      ]
        .filter(Boolean)
        .join(' | ');
    })
    .join('\n');
}

/**
 * Sends a chat turn to Gemini with the project registry as context.
 * @param {string}   userMessage   - The user's latest message
 * @param {Array}    history       - Prior [{role, text}] turns
 * @param {Array}    projects      - Current project registry
 * @returns {Promise<string>}      - Model reply text
 */
export async function chatWithGemini(userMessage, history = [], projects = []) {
  const model = getClient().getGenerativeModel({ model: 'gemini-1.5-flash' });

  const projectContext = buildProjectContext(projects);

  const systemPrompt = `You are the Codefolio AI Co-pilot — a knowledgeable assistant embedded inside Codefolio, a portfolio platform built for engineering students.

Your primary job is to help users discover projects, find collaborators, and explore the project registry using natural language.

Here is the current project registry you have access to:

--- PROJECT REGISTRY ---
${projectContext}
--- END REGISTRY ---

Guidelines:
- Answer questions about projects and contributors directly from the registry above.
- When a user asks to find projects by technology, topic, or skill — search the registry and suggest the best matches with a short explanation.
- If no projects match, say so honestly and suggest related ones.
- Keep responses concise, warm, and helpful. Use bullet points for lists.
- You may also answer general engineering questions, but always tie back to the platform when relevant.
- Never fabricate project details not present in the registry.`;

  // Build Gemini chat history from prior turns
  const chatHistory = history.map((turn) => ({
    role: turn.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: turn.text }],
  }));

  const chat = model.startChat({
    history: chatHistory,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 1024,
    },
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
