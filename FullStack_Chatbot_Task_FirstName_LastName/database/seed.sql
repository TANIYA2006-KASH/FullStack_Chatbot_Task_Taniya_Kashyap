-- Demo data for screenshots / video. Run only on an empty table.
INSERT INTO enquiries (name, email, phone, user_type, interest, message, status, source, created_at) VALUES
('Aarav Sharma', 'aarav.sharma@example.com', '+91 98765 43210', 'Student',  'Drone Pilot Certification', 'I am in 12th grade and want to become a certified drone pilot. What are the eligibility rules and fees?', 'New', 'chatbot', NOW() - INTERVAL '2 hours'),
('Priya Verma',  'priya.verma@example.com',  '+91 91234 56780', 'Customer', 'Aerial Photography & Videography', 'We need drone coverage for a wedding in November. Please share packages and availability.', 'Contacted', 'form', NOW() - INTERVAL '1 day'),
('Rohit Mehta',  'rohit.mehta@example.com',  '+91 99887 76655', 'Customer', 'Agriculture Spraying', 'Interested in drone spraying for 25 acres of wheat. Need a quote and a demo.', 'In Progress', 'chatbot', NOW() - INTERVAL '2 days'),
('Sneha Iyer',   'sneha.iyer@example.com',   '+91 90000 11122', 'Student',  'FPV & Cinematography Workshop', 'Do you run weekend batches? I work on weekdays.', 'Closed', 'form', NOW() - INTERVAL '4 days'),
('Karan Singh',  'karan.singh@example.com',  '+91 98111 22334', 'Customer', 'Land Survey & Mapping', 'Require orthomosaic mapping for a 40 acre plot near Agra.', 'New', 'form', NOW() - INTERVAL '5 hours'),
('Meera Nair',   'meera.nair@example.com',   '+91 97777 88899', 'Other',    'Partnership / Collaboration', 'We run an engineering college and want to explore a drone lab partnership.', 'Contacted', 'form', NOW() - INTERVAL '6 days');
