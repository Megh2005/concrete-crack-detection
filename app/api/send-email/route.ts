import { NextResponse } from 'next/server';
import { sendMail, EmailPayload } from '@/lib/email';

export async function POST(request: Request) {
  try {
    let body: Partial<EmailPayload>;

    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Email sending failed: Invalid JSON payload', parseError);
      
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON payload received in request body.',
        },
        { status: 400 }
      );
    }

    const { to, from, subject, text, html } = body;

    if (!to || !from || !subject) {
      console.error('Email sending failed: Missing required fields (to, from, or subject)', { to, from, subject });

      return NextResponse.json(
        {
          success: false,
          error: 'Missing required payload fields: "to", "from", and "subject" must be provided.',
        },
        { status: 400 }
      );
    }

    const result = await sendMail({
      to,
      from,
      subject,
      text,
      html,
    });

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      console.error('Email sending route failure:', result.error);
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error: any) {
    console.error('Email sending route exception:', error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
