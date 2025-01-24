import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", 
    "/api/webhooks/clerk", 
    "/api/barbers", 
    "/api/appointments",
    "/api/appointments/getByDate",
    "/api/appointments/getUserAppointments",
    "/api/appointments/cancel"
  ]
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}; 