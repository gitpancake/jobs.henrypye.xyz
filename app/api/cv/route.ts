import { NextResponse } from 'next/server';
import { getUserCV, saveUserCV } from '@/lib/ai-service';

export async function GET() {
  try {
    const cv = await getUserCV();
    return NextResponse.json({ content: cv });
  } catch (error) {
    console.error('Failed to get CV:', error);
    return NextResponse.json({ error: 'Failed to get CV' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'CV content is required' }, { status: 400 });
    }
    
    await saveUserCV(content);
    return NextResponse.json({ message: 'CV saved successfully' });
  } catch (error) {
    console.error('Failed to save CV:', error);
    return NextResponse.json({ error: 'Failed to save CV' }, { status: 500 });
  }
}