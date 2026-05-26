# Import all models here so Alembic autogenerate can discover them.
from app.models.user import User
from app.models.business import Business
from app.models.service import Service
from app.models.working_hours import WorkingHours
from app.models.appointment import Appointment

__all__ = ["User", "Business", "Service", "WorkingHours", "Appointment"]
