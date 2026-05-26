"""Unit tests for the email send_email function.

These tests never open a real network connection — _send_via_smtp is always mocked.
"""
from email.message import EmailMessage
from unittest.mock import AsyncMock, patch

import pytest

from app.core.config import settings
from app.services.email.sender import send_email


@pytest.mark.asyncio
async def test_email_stub_when_send_real_is_false(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(settings, "smtp_host", "smtp.example.com")
    monkeypatch.setattr(settings, "smtp_user", "user@example.com")
    monkeypatch.setattr(settings, "smtp_password", "secret")
    monkeypatch.setattr(settings, "email_send_real", False)

    with patch("app.services.email.sender._send_via_smtp", new_callable=AsyncMock) as mock_smtp:
        await send_email("a@b.com", "subject", "<p>hi</p>")
        mock_smtp.assert_not_called()


@pytest.mark.asyncio
async def test_email_sends_when_send_real_is_true(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(settings, "smtp_host", "smtp.example.com")
    monkeypatch.setattr(settings, "smtp_user", "user@example.com")
    monkeypatch.setattr(settings, "smtp_password", "secret")
    monkeypatch.setattr(settings, "smtp_from", "user@example.com")
    monkeypatch.setattr(settings, "email_send_real", True)

    with patch("app.services.email.sender._send_via_smtp", new_callable=AsyncMock) as mock_smtp:
        await send_email("recipient@example.com", "Hello", "<p>world</p>")
        mock_smtp.assert_awaited_once()
        msg: EmailMessage = mock_smtp.call_args[0][0]
        assert isinstance(msg, EmailMessage)
        assert msg["Subject"] == "Hello"
        assert msg["To"] == "recipient@example.com"


@pytest.mark.asyncio
async def test_email_failure_does_not_raise(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    monkeypatch.setattr(settings, "smtp_host", "smtp.example.com")
    monkeypatch.setattr(settings, "smtp_user", "user@example.com")
    monkeypatch.setattr(settings, "smtp_password", "secret")
    monkeypatch.setattr(settings, "smtp_from", "user@example.com")
    monkeypatch.setattr(settings, "email_send_real", True)

    with patch(
        "app.services.email.sender._send_via_smtp",
        new_callable=AsyncMock,
        side_effect=Exception("connection refused"),
    ):
        await send_email("a@b.com", "subject", "<p>body</p>")  # must not raise

    assert any("EMAIL FAILED" in record.message for record in caplog.records)
