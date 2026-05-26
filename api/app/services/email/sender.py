import logging
from email.message import EmailMessage

import aiosmtplib

from app.core.config import settings
from app.models.appointment import Appointment

logger = logging.getLogger(__name__)


async def _send_via_smtp(message: EmailMessage) -> None:
    """Send a constructed EmailMessage via the configured SMTP server."""
    assert settings.smtp_host and settings.smtp_user and settings.smtp_password
    await aiosmtplib.send(
        message,
        hostname=settings.smtp_host,
        port=settings.smtp_port,
        username=settings.smtp_user,
        password=settings.smtp_password,
        start_tls=True,  # Gmail requires STARTTLS on port 587
        timeout=10,
    )


async def send_email(to: str, subject: str, html_body: str) -> None:
    # Safety: never crash the caller if email is mis-configured.
    if not settings.smtp_host or not settings.smtp_user or not settings.smtp_password:
        logger.warning(
            "EMAIL SKIPPED | smtp not configured | to=%s | subject=%s",
            to,
            subject,
        )
        return

    message = EmailMessage()
    message["From"] = settings.smtp_from or settings.smtp_user
    message["To"] = to
    message["Subject"] = subject
    message.set_content("Plain text fallback — please view in an HTML client.")
    message.add_alternative(html_body, subtype="html")

    if not settings.email_send_real:
        logger.info(
            "EMAIL STUB | to=%s | subject=%s | (EMAIL_SEND_REAL=false)",
            to,
            subject,
        )
        return

    try:
        await _send_via_smtp(message)
        logger.info("EMAIL SENT | to=%s | subject=%s", to, subject)
    except Exception as exc:
        # Never let a mail failure break the calling endpoint.
        logger.error(
            "EMAIL FAILED | to=%s | subject=%s | error=%s",
            to,
            subject,
            exc,
            exc_info=True,
        )


def _html_wrap(content: str) -> str:
    return (
        '<html dir="rtl" lang="he">'
        '<body style="font-family:Arial,sans-serif;color:#333;'
        'max-width:600px;margin:0 auto;padding:20px;">'
        f"{content}"
        '<p style="color:#888;font-size:12px;margin-top:32px;'
        'border-top:1px solid #eee;padding-top:12px;">'
        "מייל אוטומטי מ-QueueLess — אין להשיב למייל זה."
        "</p>"
        "</body></html>"
    )


async def send_booking_confirmation(appointment: Appointment) -> None:
    """Send (or stub) a booking confirmation email to the customer."""
    html = _html_wrap(
        f'<h2 style="color:#1F4E5F;">ההזמנה שלך אושרה!</h2>'
        f"<p>שלום {appointment.customer_name},</p>"
        f"<p>ההזמנה שלך נקלטה בהצלחה.</p>"
        f"<p>אם ברצונך לבטל, אנא צור קשר עם העסק.</p>"
    )
    await send_email(appointment.customer_email, "ההזמנה שלך אושרה", html)


async def send_booking_cancellation(appointment: Appointment) -> None:
    """Send (or stub) a booking cancellation email to the customer."""
    html = _html_wrap(
        f'<h2 style="color:#1F4E5F;">ההזמנה שלך בוטלה</h2>'
        f"<p>שלום {appointment.customer_name},</p>"
        f"<p>ההזמנה שלך בוטלה.</p>"
        f"<p>ניתן לקבוע תור חדש דרך האתר.</p>"
    )
    await send_email(appointment.customer_email, "ההזמנה שלך בוטלה", html)


async def send_booking_reminder(appointment: Appointment) -> None:
    """Send (or stub) a 24-hour reminder email to the customer."""
    html = _html_wrap(
        f'<h2 style="color:#1F4E5F;">תזכורת: תור מחר</h2>'
        f"<p>שלום {appointment.customer_name},</p>"
        f"<p>תזכורת — יש לך תור מחר. נשמח לראותך!</p>"
    )
    await send_email(appointment.customer_email, "תזכורת: תור מחר", html)


async def send_appointment_approved(appointment: Appointment) -> None:
    """Notify customer that the business owner approved their appointment."""
    html = _html_wrap(
        f'<h2 style="color:#1F4E5F;">התור שלך אושר</h2>'
        f"<p>שלום {appointment.customer_name},</p>"
        f"<p>בעל העסק אישר את התור שלך.</p>"
    )
    await send_email(appointment.customer_email, "התור שלך אושר", html)


async def send_appointment_rejected(appointment: Appointment, reason: str | None = None) -> None:
    """Notify customer that the business owner rejected/cancelled their appointment."""
    reason_block = f"<p>סיבה: {reason}</p>" if reason else ""
    html = _html_wrap(
        f'<h2 style="color:#c0392b;">התור שלך נדחה</h2>'
        f"<p>שלום {appointment.customer_name},</p>"
        f"<p>לצערנו, התור שלך נדחה על ידי העסק.</p>"
        f"{reason_block}"
        f"<p>ניתן לקבוע תור חדש דרך האתר.</p>"
    )
    await send_email(appointment.customer_email, "התור שלך נדחה", html)


async def send_appointment_completed(appointment: Appointment) -> None:
    """Notify customer that their appointment was marked as completed."""
    html = _html_wrap(
        f'<h2 style="color:#1F4E5F;">תודה שהגעת!</h2>'
        f"<p>שלום {appointment.customer_name},</p>"
        f"<p>תודה על ביקורך. נשמח לראותך שוב!</p>"
    )
    await send_email(appointment.customer_email, "תודה שהגעת!", html)


async def send_appointment_no_show(appointment: Appointment) -> None:
    """Notify customer that they were marked as a no-show."""
    html = _html_wrap(
        f'<h2 style="color:#e67e22;">נרשמת כאי-הגעה</h2>'
        f"<p>שלום {appointment.customer_name},</p>"
        f"<p>לא הגעת לתור שנקבע. ניתן לקבוע תור חדש דרך האתר.</p>"
    )
    await send_email(appointment.customer_email, "נרשמת כאי-הגעה", html)


async def send_appointment_status_changed(appointment: Appointment, new_status: str) -> None:
    """Generic fallback notification for any status change not covered by a specific function."""
    html = _html_wrap(
        f'<h2 style="color:#1F4E5F;">עדכון סטטוס תור</h2>'
        f"<p>שלום {appointment.customer_name},</p>"
        f"<p>סטטוס התור שלך עודכן ל: <strong>{new_status}</strong>.</p>"
    )
    await send_email(appointment.customer_email, f"עדכון סטטוס תור: {new_status}", html)
