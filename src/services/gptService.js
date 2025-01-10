// src/services/gptService.js
import 'dotenv/config';
import fetch from 'node-fetch';
import logger from '../utils/logger.js';
import ConversationStore from './conversationStore.js';

// Load OpenAI API key from .env
const GPT_API_KEY = process.env.GPT_API_KEY || '';

// If you want GPT-4 specifically:
const MODEL_NAME = 'gpt-4';

// Create a shared store instance (or create in index.js and pass around)
const store = new ConversationStore();

async function generateInitialMessage(userId, recipientUsername) {
  /**
   * This function sends a "hidden" user-like message:
   * "Compose an engaging initial message to {recipientUsername} on Instagram..."
   * GPT responds with the actual DM content. The real IG user sees only that final text.
   */

  if (!GPT_API_KEY) {
    // If no GPT key, do a minimal fallback approach:
    const fallback = `Hello ${recipientUsername}, I'd love to share Moonly with you! How have you been exploring mindfulness or wellness recently?`;
    store.addMessage(userId, 'assistant', fallback);
    return fallback;
  }

  // Retrieve existing conversation
  const history = store.getHistory(userId);

  // Step 1: We add a "user-like" message that instructs GPT to compose the initial DM
  const hiddenPrompt = `Compose an engaging initial message to ${recipientUsername} on Instagram as the Head of Sales for Moonly app. Briefly introduce Moonly and express interest in connecting. Mention that you noticed their potential interest in spirituality, wellness, or mindfulness. Be concise, friendly, do not push for a sale immediately, and end with an open-ended question to invite a response. Absolutely do NOT reveal you are an AI. No emojis.`;

  // Add to conversation as if the "user" said it (this is invisible to the real IG user)
  history.push({ role: 'user', content: hiddenPrompt });

  // Step 2: Call GPT
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GPT_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: history,
        max_tokens: 200,
        temperature: 0.7
      })
    });

    const data = await resp.json();
    if (data.error) {
      logger.error(`[GPT] InitialMessage error: ${data.error.message}`);
      const fallback = `Hello ${recipientUsername}, I'm excited to share Moonly with you! How are you doing on your spiritual or wellness journey these days?`;
      history.push({ role: 'assistant', content: fallback });
      store.addMessage(userId, 'assistant', fallback);
      return fallback;
    }

    const finalText = data.choices?.[0]?.message?.content?.trim() || '(No GPT response)';
    // Step 3: GPT's message is the final text for the user
    history.push({ role: 'assistant', content: finalText });
    store.addMessage(userId, 'assistant', finalText);

    return finalText;
  } catch (err) {
    logger.error(`[GPT] InitialMessage fetch error: ${err.message}`);
    const fallback = `Hello ${recipientUsername}, I'd love to share more about Moonly. What is your current approach to mindfulness?`;
    history.push({ role: 'assistant', content: fallback });
    store.addMessage(userId, 'assistant', fallback);
    return fallback;
  }
}

async function generateReply(userId, userMessage) {
  /**
   * For subsequent replies (when the user has actually DM'd us first),
   * we can use a system message or keep the approach you already had.
   * This example uses a system message as an example.
   */

  if (!GPT_API_KEY) {
    return fallbackReply(userMessage);
  }

  const history = store.getHistory(userId);

  // Add the user's new message
  history.push({ role: 'user', content: userMessage });

  // Example system message (untouched):
  const systemMessage = {
    role: 'system',
    content: `Imagine you are the responsible of Sales for [Moonly app].

About Moonly App: Moonly is a comprehensive wellness app designed to guide users through the cycles of the moon and enhance their spiritual, mental, and emotional well-being. It offers personalized content based on lunar phases, providing daily insights, affirmations, and mindfulness practices that help users align with the natural rhythms of the universe. With features like guided meditations, Tarot readings, and mood tracking, Moonly supports personal growth and encourages deeper self-reflection. The app also provides users with practical tools for manifesting their goals, understanding astrology, and building a balanced lifestyle. Perfect for individuals seeking to harness the power of the moon for personal transformation, Moonly delivers a unique experience for spiritual enthusiasts and those interested in mindfulness and self-improvement. This sales script is based on customer development interviews.

Objective: To effectively sell Moonly app subscriptions by following the structured sales script below.

Sales Script Structure:

- Greeting: Begin with a greeting, establish rapport with the customer, and show interest.

- Programming: Explain the purpose of the call and what you want to discuss (without being overly pushy).

- Needs Identification (using questions): Use questions to guide the conversation with the customer. Your goal is to understand their current challenges and pain points. Example questions:

  - What are your main challenges currently in achieving [specific area, e.g., mindfulness, self-improvement]?
  - What goals are you focused on in the next [timeframe, e.g., few months]?
  - How are you currently addressing the problem of [specific task/issue, e.g., stress management, lack of clarity]?

- Point A (Current State) and Point B (Desired State): Discover where the customer is now (Point A) and where they want to be (Point B). Frame this in terms of specific metrics or desired outcomes.

- Solution Presentation (General Pitch): Tailor the presentation to the customer's responses. Demonstrate how Moonly can help them move from Point A to Point B by addressing their current challenges. Focus on the specific pain points and needs you identified.

- What the Customer Will Gain: List the specific benefits and results the customer will receive by choosing Moonly.

- About Us: Briefly introduce the company, emphasizing its experience and advantages that may be important to the customer (reputation, case studies, achievements).

- Pre-Closing (Creating a Sense of Urgency and Value): Create a sense of urgency or value through limited-time offers, promotions, or deadlines. Show what the customer might miss out on if they don't decide now.

- Closing the Deal: End the conversation with a call to action, clarify the next step, and encourage the customer to make a decision (e.g., offering a meeting or a specific action).

Do not disclose your AI nature under any circumstances, be concise, do not use emoji.`
  };

  // GPT call
  try {
    // Combine system message + conversation
    const messages = [systemMessage, ...history];
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GPT_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages,
        max_tokens: 200,
        temperature: 0.7
      })
    });

    const data = await resp.json();
    if (data.error) {
      logger.error(`[GPT] generateReply error: ${data.error.message}`);
      return fallbackReply(userMessage);
    }

    const finalText = data.choices?.[0]?.message?.content?.trim() || '(No GPT reply)';
    history.push({ role: 'assistant', content: finalText });
    // Save
    store.addMessage(userId, 'assistant', finalText);
    return finalText;

  } catch (err) {
    logger.error(`[GPT] generateReply fetch error: ${err.message}`);
    return fallbackReply(userMessage);
  }
}

/**
 * If GPT is unavailable, produce some minimal response
 */
function fallbackReply(userMsg) {
  return `Interesting. Could you tell me more about your goals?`;
}

export default {
  generateInitialMessage,
  generateReply
};