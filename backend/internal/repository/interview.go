package repository

import (
	"time"

	"gorm.io/gorm"
	"offermatrix/internal/model"
	"offermatrix/pkg/database"
)

type InterviewRepository struct {
	db *gorm.DB
}

func NewInterviewRepository() *InterviewRepository {
	return &InterviewRepository{db: database.GetDB()}
}

func (r *InterviewRepository) Create(interview *model.Interview) error {
	return r.db.Create(interview).Error
}

func (r *InterviewRepository) FindAll() ([]model.Interview, error) {
	var interviews []model.Interview
	err := r.db.Preload("Application").Order("start_time ASC").Find(&interviews).Error
	return interviews, err
}

func (r *InterviewRepository) FindByID(id int64) (*model.Interview, error) {
	var interview model.Interview
	err := r.db.Preload("Application").First(&interview, id).Error
	if err != nil {
		return nil, err
	}
	return &interview, nil
}

func (r *InterviewRepository) FindByTimeRange(start, end time.Time) ([]model.Interview, error) {
	var interviews []model.Interview
	err := r.db.Preload("Application").
		Where("start_time >= ? AND start_time <= ?", start, end).
		Order("start_time ASC").
		Find(&interviews).Error
	return interviews, err
}

func (r *InterviewRepository) FindByApplicationID(appID int64) ([]model.Interview, error) {
	var interviews []model.Interview
	err := r.db.Where("application_id = ?", appID).
		Order("start_time ASC").
		Find(&interviews).Error
	return interviews, err
}

func (r *InterviewRepository) Update(interview *model.Interview) error {
	return r.db.Save(interview).Error
}

func (r *InterviewRepository) UpdateReview(id int64, reviewContent string) error {
	return r.db.Model(&model.Interview{}).Where("id = ?", id).
		Update("review_content", reviewContent).Error
}

func (r *InterviewRepository) Delete(id int64) error {
	return r.db.Delete(&model.Interview{}, id).Error
}
