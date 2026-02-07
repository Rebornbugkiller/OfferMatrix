package repository

import (
	"gorm.io/gorm"
	"offermatrix/internal/model"
	"offermatrix/pkg/database"
)

type ApplicationRepository struct {
	db *gorm.DB
}

func NewApplicationRepository() *ApplicationRepository {
	return &ApplicationRepository{db: database.GetDB()}
}

func (r *ApplicationRepository) Create(app *model.Application) error {
	return r.db.Create(app).Error
}

func (r *ApplicationRepository) FindAll() ([]model.Application, error) {
	var apps []model.Application
	err := r.db.Order("updated_at DESC").Find(&apps).Error
	return apps, err
}

func (r *ApplicationRepository) FindByID(id int64) (*model.Application, error) {
	var app model.Application
	err := r.db.Preload("Interviews", func(db *gorm.DB) *gorm.DB {
		return db.Order("start_time ASC")
	}).First(&app, id).Error
	if err != nil {
		return nil, err
	}
	return &app, nil
}

func (r *ApplicationRepository) Update(app *model.Application) error {
	return r.db.Model(app).Updates(map[string]interface{}{
		"company_name":   app.CompanyName,
		"job_title":      app.JobTitle,
		"current_status": app.CurrentStatus,
	}).Error
}

func (r *ApplicationRepository) Delete(id int64) error {
	// 先删除关联的面试
	if err := r.db.Where("application_id = ?", id).Delete(&model.Interview{}).Error; err != nil {
		return err
	}
	return r.db.Delete(&model.Application{}, id).Error
}

func (r *ApplicationRepository) Search(keyword string) ([]model.Application, error) {
	var apps []model.Application
	err := r.db.Where("company_name LIKE ? OR job_title LIKE ?",
		"%"+keyword+"%", "%"+keyword+"%").
		Order("updated_at DESC").
		Find(&apps).Error
	return apps, err
}

func (r *ApplicationRepository) SearchWithFilters(keyword string, statuses []string) ([]model.Application, error) {
	var apps []model.Application
	query := r.db.Model(&model.Application{})

	if keyword != "" {
		query = query.Where("company_name LIKE ? OR job_title LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%")
	}

	if len(statuses) > 0 {
		query = query.Where("current_status IN ?", statuses)
	}

	err := query.Order("updated_at DESC").Find(&apps).Error
	return apps, err
}
