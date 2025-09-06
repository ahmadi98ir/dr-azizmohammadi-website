// Pluggable SMS provider integration. Defaults to mock unless SMS_PROVIDER=smsir

type SendResult = { ok: boolean; providerId?: string; error?: string };

export async function sendSMSViaProvider(to: string, message: string): Promise<SendResult> {
  const provider = process.env.SMS_PROVIDER || 'mock';
  if (provider === 'smsir') {
    return await sendViaSmsIr(to, message);
  }
  return { ok: true, providerId: 'mock' };
}

async function sendViaSmsIr(to: string, message: string): Promise<SendResult> {
  // NOTE: Please set these in your .env.local according to sms.ir docs
  // Example vars:
  // SMSIR_SEND_URL=https://api.sms.ir/vX/your/send/endpoint
  // SMSIR_API_KEY=... (used as x-api-key or Authorization depending on product plan)
  // SMSIR_LINE_NUMBER=3000xxxx
  const url = process.env.SMSIR_SEND_URL;
  const apiKey = process.env.SMSIR_API_KEY;
  const lineNumber = process.env.SMSIR_LINE_NUMBER;
  if (!url || !apiKey) return { ok: false, error: 'smsir_env_missing' };

  try {
    // The exact body/headers depend on sms.ir API method (ultra-fast, bulk, etc.)
    // Adjust keys to match your account’s endpoint.
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        lineNumber,
        mobileNumbers: [to],
        messageText: message,
      }),
    } as RequestInit);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, error: `smsir_http_${res.status}:${text}` };
    }
    const data = await res.json().catch(() => ({}));
    const providerId = (data?.messageId || data?.id || data?.data?.messageId || '').toString() || undefined;
    return { ok: true, providerId };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'smsir_request_failed' };
  }
}

