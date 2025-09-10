// Pluggable SMS provider integration. Defaults to mock unless SMS_PROVIDER=smsir

type SendResult = { ok: boolean; providerId?: string; error?: string };

export async function sendSMSViaProvider(to: string, message: string): Promise<SendResult> {
  const provider = process.env.SMS_PROVIDER || 'mock';
  if (provider === 'smsir') {
    return await sendViaSmsIr(to, message);
  }
  return { ok: true, providerId: 'mock' };
}

// Specialized helper for OTP via template-based providers
export async function sendOtpViaProvider(to: string, code: string, ttlMinutes: number): Promise<SendResult> {
  const provider = process.env.SMS_PROVIDER || 'mock';
  if (provider === 'smsir_ultrafast') {
    const res = await sendViaSmsIrUltraFast(to, code, ttlMinutes);
    if (res.ok) return res;
    // Try plain sms.ir endpoint if configured, otherwise fall back to mock
    const message = `کد تأیید شما: ${code} (اعتبار: ${ttlMinutes} دقیقه) — drazizmohammadi.ir`;
    if (process.env.SMSIR_SEND_URL && process.env.SMSIR_API_KEY) {
      return await sendViaSmsIr(to, message);
    }
    return { ok: false, error: res.error || 'smsir_ultrafast_failed' };
  }
  // Fallback: plain text send via selected provider (or mock)
  const message = `کد تأیید شما: ${code} (اعتبار: ${ttlMinutes} دقیقه) — drazizmohammadi.ir`;
  return await sendSMSViaProvider(to, message);
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
    const useBearer = process.env.SMSIR_AUTH_BEARER === '1';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (useBearer) headers['Authorization'] = `Bearer ${apiKey}`; else headers['x-api-key'] = apiKey;
    const res = await fetch(url, {
      method: 'POST',
      headers,
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

async function sendViaSmsIrUltraFast(to: string, code: string, ttlMinutes: number): Promise<SendResult> {
  // Ultra Fast Verify API (template-based). Defaults to SMS.ir v1 verify endpoint.
  // Required envs:
  //   SMSIR_API_KEY
  //   SMSIR_TEMPLATE_ID (numeric)
  // Optional override:
  //   SMSIR_VERIFY_URL (default: https://api.sms.ir/v1/send/verify)
  const url = process.env.SMSIR_VERIFY_URL || 'https://api.sms.ir/v1/send/verify';
  const apiKey = process.env.SMSIR_API_KEY;
  const templateIdStr = process.env.SMSIR_TEMPLATE_ID;
  const templateId = templateIdStr ? Number(templateIdStr) : NaN;
  if (!apiKey || !templateIdStr || Number.isNaN(templateId)) {
    return { ok: false, error: 'smsir_ultrafast_env_missing' };
  }

  try {
    const codeParam = process.env.SMSIR_PARAM_CODE_NAME || 'CODE';
    const ttlParam = process.env.SMSIR_PARAM_TTL_NAME || 'TTL';
    const includeTtl = process.env.SMSIR_INCLUDE_TTL !== '0';
    const useBearer = process.env.SMSIR_AUTH_BEARER === '1';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (useBearer) headers['Authorization'] = `Bearer ${apiKey}`; else headers['x-api-key'] = apiKey;
    const parameters: Array<{ name: string; value: string }> = [
      { name: codeParam, value: String(code) },
    ];
    if (includeTtl) parameters.push({ name: ttlParam, value: String(ttlMinutes) });
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        mobile: to,
        templateId,
        parameters,
      }),
    } as RequestInit);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, error: `smsir_verify_http_${res.status}:${text}` };
    }
    const data = await res.json().catch(() => ({}));
    const providerId = (data?.messageId || data?.id || data?.data?.messageId || '').toString() || undefined;
    return { ok: true, providerId };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'smsir_verify_request_failed' };
  }
}
