package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"offermatrix/internal/config"
	"offermatrix/internal/handler"
	"offermatrix/internal/middleware"
	"offermatrix/pkg/database"
)

func main() {
	// Load config
	if err := config.Load("config.yaml"); err != nil {
		log.Printf("Failed to load config file, using defaults: %v", err)
		config.LoadDefault()
	}

	// Initialize database
	if err := database.Init(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Setup Gin
	r := gin.Default()

	// CORS configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// API routes
	api := r.Group("/api")
	{
		// Auth routes (public)
		authHandler := handler.NewAuthHandler()
		authHandler.RegisterRoutes(api)

		appHandler := handler.NewApplicationHandler()
		appHandler.RegisterRoutes(api)

		interviewHandler := handler.NewInterviewHandler()
		interviewHandler.RegisterRoutes(api)
	}

	// Protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		authHandler := handler.NewAuthHandler()
		authHandler.RegisterProtectedRoutes(protected)
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Start server
	port := config.AppConfig.Server.Port
	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
