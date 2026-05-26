class SlotTakenError(Exception):
    """Raised when the requested appointment slot is already booked."""


class OutOfHoursError(Exception):
    """Raised when the requested time is outside business working hours."""


class ServiceInactiveError(Exception):
    """Raised when attempting to book a deactivated service."""
