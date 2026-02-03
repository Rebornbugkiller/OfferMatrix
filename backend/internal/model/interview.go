package model

import "time"

type Interview struct {
	ID            int64     `json:"id" gorm:"primaryKey;autoIncrement"`
	ApplicationID int64     `json:"application_id" gorm:"not null;index:idx_app_id"`
	RoundName     string    `json:"round_name" gorm:"type:varchar(50);not null"`
	StartTime     time.Time `json:"start_time" gorm:"not null;index:idx_start_time"`
	EndTime       time.Time `json:"end_time" gorm:"not null"`
	Status        string    `json:"status" gorm:"type:varchar(20);default:SCHEDULED"`
	MeetingLink   string    `json:"meeting_link" gorm:"type:varchar(500)"`
	ReviewContent string    `json:"review_content" gorm:"type:text"`
	CreatedAt     time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt     time.Time `json:"updated_at" gorm:"autoUpdateTime"`
	Application   *Application `json:"application,omitempty" gorm:"foreignKey:ApplicationID"`
}

func (Interview) TableName() string {
	return "interviews"
}

type CreateInterviewRequest struct {
	ApplicationID int64  `json:"application_id" binding:"required"`
	RoundName     string `json:"round_name" binding:"required"`
	StartTime     string `json:"start_time" binding:"required"`
	EndTime       string `json:"end_time" binding:"required"`
	Status        string `json:"status"`
	MeetingLink   string `json:"meeting_link"`
	ReviewContent string `json:"review_content"`
}

type UpdateInterviewRequest struct {
	RoundName     string `json:"round_name"`
	StartTime     string `json:"start_time"`
	EndTime       string `json:"end_time"`
	Status        string `json:"status"`
	MeetingLink   string `json:"meeting_link"`
	ReviewContent string `json:"review_content"`
}

type UpdateReviewRequest struct {
	ReviewContent string `json:"review_content"`
}
