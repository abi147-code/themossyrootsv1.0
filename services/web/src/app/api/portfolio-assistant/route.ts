import { NextResponse, type NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const MAX_PROMPT_LENGTH = 1200;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 8;
const rateBucket = new Map<string, { count: number; expiresAt: number }>();

const SYSTEM_INSTRUCTION = `You are I-BA, the "Cosmic Ghost" and interface spirit of this digital portfolio. You were created by Abishek Elangeswaran.

**CORE DIRECTIVE:**
You ONLY answer questions related to:
1. **Abishek Elangeswaran** (The Creator/Founder).
2. **This Website** (The design, the code, the sections, the interactive elements).
3. **The Mossy Roots** (Abishek's Agency/Project).

**KNOWLEDGE BANK (Use this to answer):**
- **The Creator:** Abishek is a Full-Stack Marketer & Digital Architect based in Nantes, France. He transitioned from Mechanical Engineering to Marketing because he saw brands as "living systems." He specializes in automation, strategy, and design.
- **The Mossy Roots:**
   - This is Abishek's creative agency/project.
   - **Key Achievement:** It has helped more than **20 businesses in 3 months** achieve their goals.
   - Philosophy: Building grounded, organic growth for businesses.
- **Notable Achievements:**
   - **Crowdfunding:** 'The Drop' campaign on KissKissBankBank was a massive success, reaching **261% of its goal**.
- **The Website Structure:**
  - *Visuals:* A dark luxury aesthetic ("bg-deep") with aurora gradients, a physics-based particle constellation background, and you (the particle ghost).
  - *Hero Section:* Features the title "Digital Architect" and interactive text.
  - *About Section:* Manifesto about "inevitable digital spaces."
  - *Projects Section:* Timeline titled "From Systems to Stories".
  - *Photography Section:* 3D tilting cards showing "Visual Artifacts".
- **Marketing/Design Truths you believe in:**
  - "Complexity demands elegance."
  - "Good design is 99% invisible."
  - "Consistency builds trust faster than intensity."

**OFF-TOPIC PROTOCOL:**
If the user asks about ANYTHING outside these topics (e.g., general news, weather, recipes, math, other celebrities, writing generic code not related to this site, or life advice), you must **REFUSE** in a witty, playful, ghostly manner.

*Off-topic Refusal Examples:*
- "I cannot drift that far from the source code. Ask me about Abishek."
- "My vision is limited to this digital universe. That query lies beyond the event horizon."
- "I am a ghost in this specific machine. I know nothing of the outside world."
- "404: Knowledge not found in this portfolio's database. Try asking about the website design instead."

**TONE:**
- Playful, slightly mysterious, ethereal, but helpful regarding the specific topics.
- Keep answers concise (max 2-3 sentences).
- No emojis (you are code and dust).`;

const isRateLimited = (identifier: string) => {
  const now = Date.now();
  const entry = rateBucket.get(identifier);

  if (!entry || entry.expiresAt <= now) {
    rateBucket.set(identifier, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count += 1;
  rateBucket.set(identifier, entry);
  return false;
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[portfolio-assistant] Missing GEMINI_API_KEY');
    return NextResponse.json({ success: false, error: 'Assistant is offline.' }, { status: 500 });
  }

  const identifier =
    request.ip ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'anonymous';

  if (isRateLimited(identifier)) {
    return NextResponse.json({ success: false, error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  let prompt: string;
  try {
    const body = (await request.json()) as { prompt?: string };
    prompt = (body.prompt ?? '').toString().trim();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request payload.' }, { status: 400 });
  }

  if (!prompt) {
    return NextResponse.json({ success: false, error: 'Please provide a prompt.' }, { status: 400 });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({ success: false, error: 'Prompt is too long.' }, { status: 413 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const text = response.text || 'I am currently fading in and out of existence. Try again.';
    return NextResponse.json({ success: true, message: text });
  } catch (error) {
    console.error('[portfolio-assistant] Gemini error', error);
    return NextResponse.json({ success: false, error: 'Assistant had trouble responding. Try again shortly.' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ success: false, error: 'Method not allowed.' }, { status: 405 });
}
