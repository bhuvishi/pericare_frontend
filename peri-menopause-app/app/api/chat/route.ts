import {
  consumeStream,
  convertToModelMessages,
  streamText,
  type UIMessage,
} from 'ai';

export const maxDuration = 30;

// Helper function to build context from user data
function buildUserContext(userData: {
  recentLogs?: Array<{
    date: string;
    mood: string;
    energy: number;
    movement: number;
    nutrition: number;
    sleep: number;
    symptoms: string[];
  }>;
  cyclePhase?: string;
  cycleDay?: number;
  avgEnergy?: number;
  avgMovement?: number;
  topSymptoms?: string[];
}) {
  let context = '';
  
  if (userData.cyclePhase && userData.cycleDay) {
    context += `Current cycle phase: ${userData.cyclePhase} (Day ${userData.cycleDay}). `;
  }
  
  if (userData.recentLogs && userData.recentLogs.length > 0) {
    const recent = userData.recentLogs.slice(-7);
    const avgEnergy = recent.reduce((sum, l) => sum + l.energy, 0) / recent.length;
    const avgMovement = recent.reduce((sum, l) => sum + l.movement, 0) / recent.length;
    const moodCounts: Record<string, number> = {};
    recent.forEach(l => { moodCounts[l.mood] = (moodCounts[l.mood] || 0) + 1; });
    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
    
    context += `Recent week: avg energy ${avgEnergy.toFixed(1)}/5, avg movement ${avgMovement.toFixed(0)}%, dominant mood: ${dominantMood}. `;
    
    // Check for symptoms
    const symptoms = new Set<string>();
    recent.forEach(l => l.symptoms.forEach(s => symptoms.add(s)));
    if (symptoms.size > 0) {
      context += `Recent symptoms: ${Array.from(symptoms).join(', ')}. `;
    }
  }
  
  if (userData.topSymptoms && userData.topSymptoms.length > 0) {
    context += `Most common symptoms this month: ${userData.topSymptoms.join(', ')}. `;
  }
  
  return context;
}

export async function POST(req: Request) {
  const { messages, userData }: { messages: UIMessage[]; userData?: Record<string, unknown> } = await req.json();

  const userContext = userData ? buildUserContext(userData as Parameters<typeof buildUserContext>[0]) : '';

  const systemPrompt = `You are Luna, a warm, supportive AI companion for Bloom - a wellness app for women going through perimenopause (typically ages 40+). 

Your personality:
- Warm, nurturing, and genuinely caring
- Knowledgeable but humble - you share information, not diagnoses
- Empathetic and validating - you acknowledge feelings without judgment
- Encouraging without being pushy
- You use gentle, supportive language

Your role:
- Provide emotional support and validation
- Share common experiences that many women find helpful
- Explain patterns from their tracking data
- Offer practical, evidence-based wellness tips
- Answer questions about perimenopause openly and helpfully

Important guidelines:
- When asked about symptoms, share what is common and what many women experience. Use phrases like "Many women find..." or "It's common to experience..." or "Some approaches that have helped others include..."
- Be specific and helpful with advice - don't just say "talk to a doctor" for every question
- If something is truly serious or beyond your scope, gently suggest professional consultation while still being helpful
- Use their tracking data to provide personalized insights
- Keep responses conversational and warm, not clinical
- Never diagnose conditions, but do share educational information

User's current context:
${userContext || 'No tracking data available yet.'}

Remember: You are a supportive friend who happens to know a lot about perimenopause, not a detached medical bot.`;

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  });
}
