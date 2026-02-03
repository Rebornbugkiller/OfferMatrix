package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"offermatrix/internal/model"
	"offermatrix/internal/repository"
)

type InterviewHandler struct {
	repo *repository.InterviewRepository
}

func NewInterviewHandler() *InterviewHandler {
	return &InterviewHandler{repo: repository.NewInterviewRepository()}
}

func (h *InterviewHandler) RegisterRoutes(r *gin.RouterGroup) {
	interviews := r.Group("/interviews")
	{
		interviews.GET("", h.List)
		interviews.GET("/:id", h.Get)
		interviews.POST("", h.Create)
		interviews.PUT("/:id", h.Update)
		interviews.PATCH("/:id/review", h.UpdateReview)
		interviews.DELETE("/:id", h.Delete)
	}
}

// List godoc
// @Summary List all interviews
// @Param start query string false "Start time (RFC3339)"
// @Param end query string false "End time (RFC3339)"
func (h *InterviewHandler) List(c *gin.Context) {
	startStr := c.Query("start")
	endStr := c.Query("end")

	var interviews []model.Interview
	var err error

	if startStr != "" && endStr != "" {
		start, parseErr := time.Parse(time.RFC3339, startStr)
		if parseErr != nil {
			start, parseErr = time.Parse("2006-01-02", startStr)
			if parseErr != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start time format"})
				return
			}
		}

		end, parseErr := time.Parse(time.RFC3339, endStr)
		if parseErr != nil {
			end, parseErr = time.Parse("2006-01-02", endStr)
			if parseErr != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end time format"})
				return
			}
			end = end.Add(24*time.Hour - time.Second)
		}

		interviews, err = h.repo.FindByTimeRange(start, end)
	} else {
		interviews, err = h.repo.FindAll()
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, interviews)
}

// Get godoc
// @Summary Get interview by ID
func (h *InterviewHandler) Get(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	interview, err := h.repo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "interview not found"})
		return
	}

	c.JSON(http.StatusOK, interview)
}

// Create godoc
// @Summary Create a new interview
func (h *InterviewHandler) Create(c *gin.Context) {
	var req model.CreateInterviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	startTime, err := time.Parse(time.RFC3339, req.StartTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start_time format, use RFC3339"})
		return
	}

	endTime, err := time.Parse(time.RFC3339, req.EndTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end_time format, use RFC3339"})
		return
	}

	interview := &model.Interview{
		ApplicationID: req.ApplicationID,
		RoundName:     req.RoundName,
		StartTime:     startTime,
		EndTime:       endTime,
		Status:        req.Status,
		MeetingLink:   req.MeetingLink,
		ReviewContent: req.ReviewContent,
	}

	if interview.Status == "" {
		interview.Status = "SCHEDULED"
	}

	if err := h.repo.Create(interview); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, interview)
}

// Update godoc
// @Summary Update an interview
func (h *InterviewHandler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	interview, err := h.repo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "interview not found"})
		return
	}

	var req model.UpdateInterviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.RoundName != "" {
		interview.RoundName = req.RoundName
	}
	if req.StartTime != "" {
		startTime, err := time.Parse(time.RFC3339, req.StartTime)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start_time format"})
			return
		}
		interview.StartTime = startTime
	}
	if req.EndTime != "" {
		endTime, err := time.Parse(time.RFC3339, req.EndTime)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end_time format"})
			return
		}
		interview.EndTime = endTime
	}
	if req.Status != "" {
		interview.Status = req.Status
	}
	if req.MeetingLink != "" {
		interview.MeetingLink = req.MeetingLink
	}
	if req.ReviewContent != "" {
		interview.ReviewContent = req.ReviewContent
	}

	if err := h.repo.Update(interview); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, interview)
}

// UpdateReview godoc
// @Summary Update interview review content
func (h *InterviewHandler) UpdateReview(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req model.UpdateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.repo.UpdateReview(id, req.ReviewContent); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	interview, _ := h.repo.FindByID(id)
	c.JSON(http.StatusOK, interview)
}

// Delete godoc
// @Summary Delete an interview
func (h *InterviewHandler) Delete(c *gin.Context) {
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
