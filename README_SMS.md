SMS Provider Setup (SMS.ir)

Environment variables:

- SMS_PROVIDER: one of
  - smsir: plain text send via SMSIR_SEND_URL
  - smsir_ultrafast: OTP via template (Ultra Fast Verify)
  - any other/empty: mock (no real send)
- When SMS_PROVIDER=smsir:
  - SMSIR_SEND_URL: API endpoint for sending
  - SMSIR_API_KEY: your API key (sent as x-api-key)
  - SMSIR_LINE_NUMBER: sender line (if required)
- When SMS_PROVIDER=smsir_ultrafast:
  - SMSIR_API_KEY
  - SMSIR_TEMPLATE_ID: e.g. 268536
  - SMSIR_VERIFY_URL (optional): defaults to https://api.sms.ir/v1/send/verify

Notes

- OTP request endpoint uses a provider-specific path; in mock/basic mode it falls back to a Persian text message: «کد تأیید شما: <CODE> (اعتبار: <TTL> دقیقه) — drazizmohammadi.ir».
- Configure `.env.local`, restart the app, and test `/api/auth/otp/request`.
