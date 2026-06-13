import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_type, event_data } = body;

    // MVP: Log to console — in production, insert into Supabase
    // const supabase = createAdminClient();
    // await supabase.from('analytics_events').insert({
    //   session_id: sessionId,
    //   event_type,
    //   event_data,
    // });

    console.log(`[Anti-Cheat Event] ${event_type}:`, event_data);

    return NextResponse.json({ logged: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 });
  }
}
