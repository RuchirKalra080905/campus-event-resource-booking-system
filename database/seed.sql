-- ================================================================
-- CAMPUS HUB - Sample Data (Seed)
-- Password for all demo accounts: Demo@123
-- bcrypt hash generated with 10 salt rounds
-- ================================================================

USE campus_hub;

-- ==========================================
-- USERS (1 admin + 5 faculty + 15 students = 21 users)
-- Password: Demo@123
-- ==========================================
INSERT INTO users (name, email, password_hash, phone, role, department) VALUES
('Admin User', 'admin@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000001', 'admin', 'Administration'),
('Dr. Rajesh Kumar', 'faculty@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000002', 'faculty', 'Computer Science'),
('Dr. Priya Sharma', 'priya.sharma@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000003', 'faculty', 'Electronics'),
('Prof. Amit Verma', 'amit.verma@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000004', 'faculty', 'Mechanical'),
('Dr. Sneha Patel', 'sneha.patel@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000005', 'faculty', 'Computer Science'),
('Prof. Vikram Singh', 'vikram.singh@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000006', 'faculty', 'Mathematics'),
('Rahul Mehta', 'student@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000007', 'student', 'Computer Science'),
('Ananya Gupta', 'ananya.gupta@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000008', 'student', 'Computer Science'),
('Karan Joshi', 'karan.joshi@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000009', 'student', 'Electronics'),
('Meera Reddy', 'meera.reddy@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000010', 'student', 'Mechanical'),
('Arjun Nair', 'arjun.nair@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000011', 'student', 'Computer Science'),
('Pooja Desai', 'pooja.desai@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000012', 'student', 'Electronics'),
('Rohan Kulkarni', 'rohan.kulkarni@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000013', 'student', 'Mathematics'),
('Divya Iyer', 'divya.iyer@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000014', 'student', 'Computer Science'),
('Siddharth Pandey', 'siddharth.pandey@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000015', 'student', 'Mechanical'),
('Nisha Agarwal', 'nisha.agarwal@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000016', 'student', 'Electronics'),
('Aditya Saxena', 'aditya.saxena@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000017', 'student', 'Computer Science'),
('Kavya Menon', 'kavya.menon@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000018', 'student', 'Mathematics'),
('Vivek Choudhary', 'vivek.choudhary@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000019', 'student', 'Mechanical'),
('Shreya Bhatt', 'shreya.bhatt@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000020', 'student', 'Computer Science'),
('Pranav Tiwari', 'pranav.tiwari@campushub.com', '$2a$10$jAEFxJWAcGwS0F4SkByHJePiXL8C4b5CeeQuOo3zxUiKyrwW1B8CG', '9000000021', 'student', 'Electronics');

-- ==========================================
-- EVENT CATEGORIES (8 categories)
-- ==========================================
INSERT INTO event_categories (category_name, description) VALUES
('Technical', 'Technical events including coding competitions, tech talks, and workshops'),
('Cultural', 'Cultural events including music, dance, drama, and art'),
('Sports', 'Sports events and tournaments'),
('Workshop', 'Hands-on workshops and training sessions'),
('Seminar', 'Academic seminars and lectures'),
('Hackathon', 'Coding marathons and innovation challenges'),
('Guest Lecture', 'Lectures by industry experts and guest speakers'),
('Social', 'Social gatherings, networking events, and celebrations');

-- ==========================================
-- VENUES (10 venues)
-- ==========================================
INSERT INTO venues (venue_name, building, floor, capacity, location, facilities, status) VALUES
('Main Auditorium', 'Central Block', 'Ground', 500, 'Central Campus', 'Projector, Sound System, AC, Stage, Green Room', 'available'),
('Seminar Hall A', 'Academic Block 1', '2nd Floor', 150, 'North Campus', 'Projector, Whiteboard, AC, Mic System', 'available'),
('Seminar Hall B', 'Academic Block 2', '1st Floor', 120, 'South Campus', 'Projector, AC, Podium, Whiteboard', 'available'),
('Computer Lab 1', 'IT Block', '3rd Floor', 60, 'West Campus', '60 PCs, Projector, AC, Internet', 'available'),
('Computer Lab 2', 'IT Block', '3rd Floor', 40, 'West Campus', '40 PCs, Projector, AC, Internet', 'available'),
('Conference Room', 'Admin Block', '4th Floor', 30, 'Central Campus', 'Conference Table, Projector, Video Conferencing, AC', 'available'),
('Sports Complex', 'Sports Block', 'Ground', 1000, 'East Campus', 'Indoor Courts, Seating Area, Changing Rooms', 'available'),
('Open Air Theatre', 'Cultural Block', 'Ground', 800, 'South Campus', 'Stage, Lighting, Sound System, Open Seating', 'available'),
('Library Hall', 'Library Block', '1st Floor', 100, 'Central Campus', 'Projector, AC, Bookshelves, Study Tables', 'available'),
('Board Room', 'Admin Block', '5th Floor', 20, 'Central Campus', 'Table, Chairs, Projector, Video Conferencing', 'available');

-- ==========================================
-- RESOURCES (15 resources)
-- ==========================================
INSERT INTO resources (resource_name, resource_type, description, quantity, available_quantity, location, status) VALUES
('HD Projector', 'Electronics', 'Full HD multimedia projector with HDMI support', 10, 8, 'IT Store Room', 'available'),
('Laptop - Dell', 'Electronics', 'Dell Latitude business laptop', 15, 12, 'IT Store Room', 'available'),
('DSLR Camera', 'Photography', 'Canon EOS DSLR camera with 18-55mm lens', 5, 4, 'Media Room', 'available'),
('Wireless Microphone', 'Audio', 'Professional wireless microphone system', 8, 6, 'AV Room', 'available'),
('Portable Speakers', 'Audio', 'JBL portable Bluetooth speakers', 6, 5, 'AV Room', 'available'),
('Whiteboard (Portable)', 'Stationery', 'Large portable whiteboard with markers', 10, 9, 'General Store', 'available'),
('Extension Board', 'Electrical', '6-socket extension board with surge protector', 20, 18, 'Electrical Store', 'available'),
('Podium', 'Furniture', 'Wooden podium with microphone holder', 4, 3, 'AV Room', 'available'),
('Projector Screen', 'Electronics', 'Portable 100-inch projector screen', 8, 7, 'IT Store Room', 'available'),
('Video Camera', 'Photography', 'Sony video camera for recording events', 3, 2, 'Media Room', 'available'),
('PA System', 'Audio', 'Complete public address system with amplifier', 3, 2, 'AV Room', 'available'),
('Tent / Canopy', 'Infrastructure', 'Large outdoor tent for events', 5, 4, 'General Store', 'available'),
('LED Display Board', 'Electronics', '65-inch LED display for presentations', 4, 3, 'IT Store Room', 'available'),
('Conference Phone', 'Electronics', 'Polycom conference phone for meetings', 3, 3, 'Admin Office', 'available'),
('Tripod Stand', 'Photography', 'Professional camera tripod stand', 6, 5, 'Media Room', 'available');

-- ==========================================
-- EVENTS (18 events - various statuses)
-- ==========================================
INSERT INTO events (title, description, category_id, organizer_id, venue_id, event_date, start_time, end_time, max_participants, status) VALUES
('Tech Fest 2026', 'Annual technical festival featuring coding contests, robotics, and innovation showcases', 1, 2, 1, '2026-09-15', '09:00:00', '18:00:00', 400, 'approved'),
('Classical Music Night', 'An evening of classical music performances by students and guest artists', 2, 3, 8, '2026-09-10', '18:00:00', '21:00:00', 300, 'approved'),
('Inter-College Cricket Tournament', 'Annual inter-college T20 cricket tournament', 3, 4, 7, '2026-09-20', '08:00:00', '18:00:00', 200, 'approved'),
('Python Workshop for Beginners', 'Hands-on workshop covering Python fundamentals, data structures, and basic projects', 4, 2, 4, '2026-09-12', '10:00:00', '16:00:00', 50, 'approved'),
('AI & Machine Learning Seminar', 'Seminar on recent advances in AI and machine learning applications', 5, 5, 2, '2026-09-18', '14:00:00', '17:00:00', 120, 'approved'),
('36-Hour Hackathon', 'Non-stop coding marathon to build innovative solutions for real-world problems', 6, 2, 4, '2026-10-05', '09:00:00', '21:00:00', 60, 'approved'),
('Industry Expert Talk: Cloud Computing', 'Guest lecture by AWS Solutions Architect on cloud computing trends', 7, 5, 2, '2026-09-25', '11:00:00', '13:00:00', 100, 'approved'),
('Freshers Welcome Party', 'Welcome celebration for new batch students with performances and games', 8, 3, 8, '2026-09-08', '17:00:00', '21:00:00', 500, 'approved'),
('Web Development Bootcamp', 'Intensive bootcamp covering React, Node.js, and MongoDB', 4, 2, 4, '2026-10-10', '09:00:00', '17:00:00', 40, 'approved'),
('Annual Sports Day', 'College annual sports day with track and field events', 3, 4, 7, '2026-10-15', '07:00:00', '17:00:00', 800, 'approved'),
('Data Science Workshop', 'Workshop on data analysis, visualization, and predictive modeling', 4, 5, 5, '2026-10-08', '10:00:00', '16:00:00', 35, 'pending'),
('Robotics Competition', 'Build and program robots to complete challenges', 1, 4, 1, '2026-10-20', '09:00:00', '17:00:00', 100, 'pending'),
('Photography Workshop', 'Learn professional photography techniques and editing', 4, 3, 9, '2026-10-12', '14:00:00', '17:00:00', 30, 'pending'),
('Cultural Fest - Rang Tarang', 'Annual cultural festival with dance, drama, and music competitions', 2, 3, 8, '2026-11-01', '10:00:00', '20:00:00', 600, 'approved'),
('Cybersecurity Awareness Seminar', 'Learn about cybersecurity threats and protective measures', 5, 5, 2, '2026-10-25', '14:00:00', '16:00:00', 100, 'approved'),
('Mathematics Olympiad', 'Inter-department mathematics competition', 1, 6, 3, '2026-10-18', '10:00:00', '13:00:00', 80, 'approved'),
('Startup Pitch Day', 'Students pitch startup ideas to a panel of investors and mentors', 7, 2, 6, '2026-11-05', '10:00:00', '16:00:00', 25, 'approved'),
('Blood Donation Camp', 'Annual blood donation drive in association with Red Cross', 8, 1, 1, '2026-09-30', '09:00:00', '16:00:00', 200, 'approved');

-- ==========================================
-- EVENT REGISTRATIONS (35+ registrations)
-- ==========================================
INSERT INTO event_registrations (event_id, user_id, attendance_status) VALUES
(1, 7, 'registered'), (1, 8, 'registered'), (1, 9, 'registered'), (1, 11, 'registered'), (1, 14, 'registered'),
(1, 17, 'registered'), (1, 20, 'registered'), (1, 21, 'registered'),
(2, 7, 'registered'), (2, 8, 'registered'), (2, 12, 'registered'), (2, 18, 'registered'), (2, 19, 'registered'),
(3, 9, 'registered'), (3, 10, 'registered'), (3, 15, 'registered'), (3, 19, 'registered'),
(4, 7, 'registered'), (4, 8, 'registered'), (4, 11, 'registered'), (4, 14, 'registered'), (4, 17, 'registered'),
(4, 20, 'registered'),
(5, 7, 'registered'), (5, 11, 'registered'), (5, 14, 'registered'), (5, 20, 'registered'),
(6, 7, 'registered'), (6, 8, 'registered'), (6, 11, 'registered'), (6, 17, 'registered'),
(7, 7, 'registered'), (7, 8, 'registered'), (7, 14, 'registered'),
(8, 7, 'registered'), (8, 8, 'registered'), (8, 9, 'registered'), (8, 10, 'registered'),
(8, 11, 'registered'), (8, 12, 'registered'), (8, 13, 'registered'),
(9, 7, 'registered'), (9, 11, 'registered'), (9, 17, 'registered'),
(10, 9, 'registered'), (10, 10, 'registered'), (10, 15, 'registered');

-- ==========================================
-- RESOURCE BOOKINGS (12 bookings)
-- ==========================================
INSERT INTO resource_bookings (resource_id, user_id, event_id, quantity, booking_date, start_datetime, end_datetime, purpose, status, approved_by, approved_at) VALUES
(1, 2, 1, 2, '2026-09-15', '2026-09-15 09:00:00', '2026-09-15 18:00:00', 'Tech Fest presentations', 'approved', 1, NOW()),
(4, 2, 1, 3, '2026-09-15', '2026-09-15 09:00:00', '2026-09-15 18:00:00', 'Tech Fest audio setup', 'approved', 1, NOW()),
(5, 3, 2, 2, '2026-09-10', '2026-09-10 17:00:00', '2026-09-10 21:00:00', 'Music Night sound', 'approved', 1, NOW()),
(3, 3, NULL, 1, '2026-09-10', '2026-09-10 17:00:00', '2026-09-10 21:00:00', 'Music Night photography', 'approved', 1, NOW()),
(2, 2, 4, 10, '2026-09-12', '2026-09-12 10:00:00', '2026-09-12 16:00:00', 'Python Workshop laptops', 'approved', 1, NOW()),
(1, 5, 5, 1, '2026-09-18', '2026-09-18 14:00:00', '2026-09-18 17:00:00', 'AI Seminar projector', 'approved', 1, NOW()),
(9, 5, 7, 1, '2026-09-25', '2026-09-25 11:00:00', '2026-09-25 13:00:00', 'Guest lecture screen', 'pending', NULL, NULL),
(11, 3, 14, 1, '2026-11-01', '2026-11-01 10:00:00', '2026-11-01 20:00:00', 'Cultural fest PA system', 'pending', NULL, NULL),
(12, 4, 10, 2, '2026-10-15', '2026-10-15 07:00:00', '2026-10-15 17:00:00', 'Sports day tents', 'pending', NULL, NULL),
(7, 7, NULL, 2, '2026-09-20', '2026-09-20 09:00:00', '2026-09-20 12:00:00', 'Project presentation', 'approved', 1, NOW()),
(10, 8, NULL, 1, '2026-09-22', '2026-09-22 14:00:00', '2026-09-22 16:00:00', 'Video recording for project', 'pending', NULL, NULL),
(13, 2, 6, 2, '2026-10-05', '2026-10-05 09:00:00', '2026-10-05 21:00:00', 'Hackathon display boards', 'approved', 1, NOW());

-- ==========================================
-- NOTIFICATIONS
-- ==========================================
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(7, 'Welcome to Campus Hub!', 'Your account has been created successfully. Explore events and resources on campus.', 'success', TRUE),
(7, 'Registration Confirmed', 'You have been registered for "Tech Fest 2026".', 'success', TRUE),
(7, 'Registration Confirmed', 'You have been registered for "Python Workshop for Beginners".', 'success', FALSE),
(2, 'Event Approved', 'Your event "Tech Fest 2026" has been approved!', 'success', TRUE),
(2, 'Booking Approved', 'Your booking for HD Projector has been approved.', 'success', TRUE),
(3, 'Event Approved', 'Your event "Classical Music Night" has been approved!', 'success', FALSE),
(5, 'New Booking Request', 'New booking request for Projector Screen pending approval.', 'info', FALSE),
(1, 'New Event Proposal', 'Faculty proposed event: "Data Science Workshop"', 'info', FALSE),
(1, 'New Event Proposal', 'Faculty proposed event: "Robotics Competition"', 'info', FALSE),
(1, 'New Booking Request', 'Booking request for PA System (qty: 1) pending approval.', 'info', FALSE),
(8, 'Welcome to Campus Hub!', 'Your account has been created successfully.', 'success', TRUE),
(8, 'Registration Confirmed', 'You have been registered for "Tech Fest 2026".', 'success', FALSE);

-- ==========================================
-- EVENT FEEDBACK
-- ==========================================
INSERT INTO event_feedback (event_id, user_id, rating, comment) VALUES
(8, 7, 5, 'Amazing freshers party! Great performances and wonderful organization.'),
(8, 8, 4, 'Really enjoyed it! Could have been a bit longer though.'),
(8, 9, 5, 'Best welcome party ever! Loved every moment.'),
(8, 10, 4, 'Great event, well organized. The food was excellent.'),
(1, 7, 5, 'Incredible tech fest! The coding competition was challenging.'),
(1, 8, 4, 'Great variety of events. The robotics showcase was amazing.'),
(2, 7, 5, 'Beautiful performances. The classical music was mesmerizing.'),
(2, 12, 4, 'Lovely evening. Would love to see more such events.');

-- ==========================================
-- AUDIT LOGS
-- ==========================================
INSERT INTO audit_logs (user_id, action, table_name, record_id, description) VALUES
(1, 'CREATE', 'users', 1, 'Admin account created'),
(1, 'STATUS_CHANGE_APPROVED', 'events', 1, 'Event "Tech Fest 2026" status changed from pending to approved'),
(1, 'STATUS_CHANGE_APPROVED', 'events', 2, 'Event "Classical Music Night" status changed from pending to approved'),
(1, 'STATUS_CHANGE_APPROVED', 'events', 3, 'Event "Inter-College Cricket Tournament" status changed from pending to approved'),
(1, 'STATUS_CHANGE_APPROVED', 'events', 4, 'Event "Python Workshop for Beginners" status changed from pending to approved'),
(2, 'CREATE', 'events', 1, 'Event created: Tech Fest 2026'),
(3, 'CREATE', 'events', 2, 'Event created: Classical Music Night'),
(1, 'CREATE', 'resources', 1, 'Resource created: HD Projector'),
(1, 'CREATE', 'venues', 1, 'Venue created: Main Auditorium');
