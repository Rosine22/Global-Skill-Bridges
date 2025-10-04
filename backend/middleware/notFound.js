const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);

  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: {
      auth: "/api/auth (POST /login, POST /register, POST /logout)",
      users: "/api/users (GET /, GET /:id, PUT /:id)",
      jobs: "/api/jobs (GET /, POST /, GET /:id, PUT /:id, DELETE /:id)",
      applications: "/api/applications (GET /, POST /, GET /:id, PUT /:id)",
      mentorship: "/api/mentorship (GET /, POST /, GET /:id, PUT /:id)",
      skills: "/api/skills (GET /, POST /verify)",
      messages: "/api/messages (GET /, POST /, GET /:id)",
      notifications: "/api/notifications (GET /, PUT /:id/read)",
      admin: "/api/admin (Admin only endpoints)",
      rtb: "/api/rtb (RTB Admin only endpoints)",
      analytics: "/api/analytics (GET /)",
      health: "/health (Server health check)",
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = notFound;
