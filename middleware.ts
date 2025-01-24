import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/api/barbers",
    "/api/appointments/getByDate",
    "/api/appointments/getUserAppointments",
    "/api/appointments/cancel"
  ],
  apiRoutes: [
    "/api/appointments",
    "/api/appointments/getUserAppointments"
  ]
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 