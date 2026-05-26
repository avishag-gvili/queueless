from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24

    # Applied when a service is created without an explicit duration (legacy, keep for compat)
    default_service_duration_minutes: int = 30

    # Used by availability algorithm when service.duration_minutes is None (open-ended service)
    default_slot_resolution_minutes: int = 60

    # Email configuration.
    # EMAIL_SEND_REAL=false (default) → log what would be sent, no network call.
    # EMAIL_SEND_REAL=true → actually send via SMTP. Requires SMTP_* values.
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_from: str = "no-reply@queueless.local"
    email_send_real: bool = False


settings = Settings()  # type: ignore[call-arg]
