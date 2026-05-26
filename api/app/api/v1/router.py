from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, businesses, services, working_hours, appointments, public

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(businesses.router)
api_router.include_router(services.router)
api_router.include_router(working_hours.router)
api_router.include_router(appointments.router)
api_router.include_router(public.router)
