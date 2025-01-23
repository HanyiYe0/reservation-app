import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", 
    "/api/webhooks/clerk", 
    "/api/barbers", 
    "/api/appointments",
    "/api/appointments/getByDate"
  ]
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}; 