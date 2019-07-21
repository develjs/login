CREATE SCHEMA myschema;
USE myschema;

CREATE TABLE users (
    userId INT UNSIGNED NOT NULL AUTO_INCREMENT,
    userName VARCHAR(100) NOT NULL,
    userPassword VARCHAR(100),
    userEmail VARCHAR(100),
    userEmail_verified ENUM('true', 'false'),
    userPhone VARCHAR(100),
    userRole ENUM('member', 'admin'),
    facebookId VARCHAR(100),
    facebookToken VARCHAR(100),
    
    PRIMARY KEY (userId),
    UNIQUE INDEX userName_UNIQUE (userName));

