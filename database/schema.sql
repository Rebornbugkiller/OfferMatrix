-- OfferMatrix Database Schema
-- 创建数据库
CREATE DATABASE IF NOT EXISTS offermatrix DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE offermatrix;

-- 公司申请表
CREATE TABLE applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    job_title VARCHAR(100),
    current_status VARCHAR(20) DEFAULT 'IN_PROCESS', -- IN_PROCESS, OFFER, REJECTED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 面试记录表
CREATE TABLE interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL, -- FK to applications
    round_name VARCHAR(50) NOT NULL, -- e.g., "Technical Round 1", "HR Round"
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status VARCHAR(20) DEFAULT 'SCHEDULED', -- SCHEDULED, FINISHED, CANCELLED
    meeting_link VARCHAR(500),
    notes TEXT, -- 备注信息（会议号、面试官等）
    review_content TEXT, -- Markdown content for post-interview review
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_app_id (application_id),
    INDEX idx_start_time (start_time),
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);
