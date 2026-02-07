package model

import "time"

type Application struct {
	ID             int64       `json:"id" gorm:"primaryKey;autoIncrement"`
	CompanyName    string      `json:"company_name" gorm:"type:varchar(100);not null"`
	JobTitle       string      `json:"job_title" gorm:"type:varchar(100)"`
	CurrentStatus  string      `json:"current_status" gorm:"type:varchar(20);default:IN_PROCESS"`
	Salary         string      `json:"salary" gorm:"type:varchar(100)"`
	JobDescription string      `json:"job_description" gorm:"type:text"`
	JDAnalysis     string      `json:"jd_analysis" gorm:"type:text"`
	CreatedAt      time.Time   `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time   `json:"updated_at" gorm:"autoUpdateTime"`
	Interviews     []Interview `json:"interviews,omitempty" gorm:"foreignKey:ApplicationID"`
}

func (Application) TableName() string {
	return "applications"
}

type CreateApplicationRequest struct {
	CompanyName   string `json:"company_name" binding:"required"`
	JobTitle      string `json:"job_title"`
	CurrentStatus string `json:"current_status"`
}

type UpdateApplicationRequest struct {
	CompanyName    string `json:"company_name"`
	JobTitle       string `json:"job_title"`
	CurrentStatus  string `json:"current_status"`
	Salary         string `json:"salary"`
	JobDescription string `json:"job_description"`
	JDAnalysis     string `json:"jd_analysis"`
}
