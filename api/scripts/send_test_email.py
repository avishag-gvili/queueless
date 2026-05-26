"""CLI utility to verify SMTP is configured correctly.

Run inside the api container:
    docker compose exec api python -m scripts.send_test_email someone@example.com
"""
import asyncio
import sys

from app.services.email.sender import send_email


async def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python -m scripts.send_test_email <to-address>")
        sys.exit(1)
    to = sys.argv[1]
    await send_email(
        to=to,
        subject="בדיקת חיבור SMTP - QueueLess",
        html_body=(
            '<html dir="rtl" lang="he">'
            '<body style="font-family:Arial,sans-serif;">'
            '<h2 style="color:#1F4E5F;">QueueLess</h2>'
            "<p>אם אתה רואה את המייל הזה — שרת ה-SMTP מוגדר נכון.</p>"
            '<p style="color:#888;font-size:12px;">מייל אוטומטי לבדיקה</p>'
            "</body></html>"
        ),
    )
    print(f"Done. Check {to} inbox (and spam folder).")


if __name__ == "__main__":
    asyncio.run(main())
