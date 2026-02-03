SET NAMES utf8mb4;

INSERT INTO interviews (application_id, round_name, start_time, end_time, status, meeting_link, review_content, created_at, updated_at) VALUES
(2, '技术一面', '2026-02-03 10:00:00', '2026-02-03 11:00:00', 'SCHEDULED', 'https://meeting.tencent.com/abc', NULL, NOW(), NOW()),
(2, '技术二面', '2026-02-05 14:00:00', '2026-02-05 15:30:00', 'SCHEDULED', '', NULL, NOW(), NOW()),
(3, 'HR面试', '2026-02-04 09:00:00', '2026-02-04 09:30:00', 'SCHEDULED', 'https://zoom.us/j/123', NULL, NOW(), NOW()),
(3, '技术一面', '2026-02-02 14:00:00', '2026-02-02 15:00:00', 'FINISHED', '', '## 面试问题\n1. HashMap原理\n2. Spring IOC和AOP\n\n## 总结\n回答得不错', NOW(), NOW()),
(4, '终面', '2026-02-06 10:00:00', '2026-02-06 11:00:00', 'SCHEDULED', '', NULL, NOW(), NOW()),
(4, '技术面', '2026-02-01 16:00:00', '2026-02-01 17:00:00', 'FINISHED', '', '算法题做出来了', NOW(), NOW()),
(5, '笔试', '2026-02-07 19:00:00', '2026-02-07 21:00:00', 'SCHEDULED', '', NULL, NOW(), NOW()),
(6, '技术一面', '2026-01-28 10:00:00', '2026-01-28 11:00:00', 'FINISHED', '', 'Go基础不够扎实，被拒了', NOW(), NOW()),
(7, '综合面试', '2026-02-08 15:00:00', '2026-02-08 16:30:00', 'SCHEDULED', 'https://welink.huaweicloud.com/xxx', NULL, NOW(), NOW());
