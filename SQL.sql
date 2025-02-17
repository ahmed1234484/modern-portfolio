CREATE DATABASE portfolio_db;
USE portfolio_db;
CREATE TABLE skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  text VARCHAR(255),
  image VARCHAR(255)
);
CREATE TABLE certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  pdf VARCHAR(255),
  link VARCHAR(255)
);

CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    photo_path VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    total_libraries INT DEFAULT 0,
    main_features INT DEFAULT 0,
    live_demo VARCHAR(255) NOT NULL,
    github_link VARCHAR(255) NOT NULL,
    technologies JSON NOT NULL,
    key_features TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  gender ENUM('male', 'female') NOT NULL,
  message TEXT NOT NULL,
  profile_picture VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


SELECT * FROM skills;
SELECT * FROM certificates;
SELECT * FROM projects;
SELECT * FROM comments;

DROP TABLE skills;
DROP TABLE certificates;
DROP TABLE projects;
DROP TABLE comments;

