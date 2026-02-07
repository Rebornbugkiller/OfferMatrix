package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"offermatrix/internal/model"
	"offermatrix/internal/repository"
)

type ApplicationHandler struct {
	repo *repository.ApplicationRepository
}

func NewApplicationHandler() *ApplicationHandler {
	return &ApplicationHandler{repo: repository.NewApplicationRepository()}
}

func (h *ApplicationHandler) RegisterRoutes(r *gin.RouterGroup) {
	apps := r.Group("/applications")
	{
		apps.GET("", h.List)
		apps.GET("/:id", h.Get)
		apps.POST("", h.Create)
		apps.PUT("/:id", h.Update)
		apps.DELETE("/:id", h.Delete)
	}
}

// List godoc
// @Summary List all applications
// @Param keyword query string false "Search keyword"
// @Param status query string false "Status filter (comma-separated: IN_PROCESS,OFFER,REJECTED)"
func (h *ApplicationHandler) List(c *gin.Context) {
	keyword := c.Query("keyword")
	statusParam := c.Query("status")

	var statuses []string
	if statusParam != "" {
		statuses = strings.Split(statusParam, ",")
	}

	apps, err := h.repo.SearchWithFilters(keyword, statuses)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, apps)
}

// Get godoc
// @Summary Get application by ID with interviews
func (h *ApplicationHandler) Get(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	app, err := h.repo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "application not found"})
		return
	}

	c.JSON(http.StatusOK, app)
}

// Create godoc
// @Summary Create a new application
func (h *ApplicationHandler) Create(c *gin.Context) {
	var req model.CreateApplicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	app := &model.Application{
		CompanyName:   req.CompanyName,
		JobTitle:      req.JobTitle,
		CurrentStatus: req.CurrentStatus,
	}

	if app.CurrentStatus == "" {
		app.CurrentStatus = "IN_PROCESS"
	}

	if err := h.repo.Create(app); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, app)
}

// Update godoc
// @Summary Update an application
func (h *ApplicationHandler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	app, err := h.repo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "application not found"})
		return
	}

	var req model.UpdateApplicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.CompanyName != "" {
		app.CompanyName = req.CompanyName
	}
	if req.JobTitle != "" {
		app.JobTitle = req.JobTitle
	}
	if req.CurrentStatus != "" {
		app.CurrentStatus = req.CurrentStatus
	}
	if req.Salary != "" {
		app.Salary = req.Salary
	}
	if req.JobDescription != "" {
		app.JobDescription = req.JobDescription
	}
	if req.JDAnalysis != "" {
		app.JDAnalysis = req.JDAnalysis
	}

	if err := h.repo.Update(app); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, app)
}

// Delete godoc
// @Summary Delete an application
func (h *ApplicationHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.repo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
