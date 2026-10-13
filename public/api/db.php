<?php
/**
 * Rayan Group — Hostinger Database Connection & Schema Setup
 * Database: u575992126_jE5GI (or u575992126_B3eNV)
 * Host: localhost (or srv2094.hstgr.io)
 */

header('Content-Type: application/json; charset=utf-8');

$dbHost = getenv('DB_HOST') ?: 'localhost';
$dbName = getenv('DB_NAME') ?: 'u575992126_rayan_app';
$dbUser = getenv('DB_USER') ?: 'u575992126_rayan_app';
$dbPass = getenv('DB_PASS') ?: 'RayanGroup_DB_2026!Secure';

function getDbConnection() {
    global $dbHost, $dbName, $dbUser, $dbPass;
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    try {
        $dsn = "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4";
        $pdo = new PDO($dsn, $dbUser, $dbPass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);

        // Auto-create essential tables if they do not exist
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS contact_submissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reference VARCHAR(64) NOT NULL,
                form_id VARCHAR(64) DEFAULT 'general',
                form_title VARCHAR(255) DEFAULT '',
                target_email VARCHAR(255) DEFAULT 'rayan@rayan-group.com',
                sender_name VARCHAR(255) DEFAULT '',
                sender_email VARCHAR(255) DEFAULT '',
                sender_phone VARCHAR(64) DEFAULT '',
                fields_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS chat_sessions (
                session_id VARCHAR(64) PRIMARY KEY,
                visitor_name VARCHAR(255) DEFAULT 'Website Visitor',
                status VARCHAR(32) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS chat_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                session_id VARCHAR(64) NOT NULL,
                sender VARCHAR(32) NOT NULL,
                sender_name VARCHAR(255) NOT NULL,
                message_text TEXT NOT NULL,
                timestamp BIGINT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_session (session_id),
                INDEX idx_timestamp (timestamp)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection error: " . $e->getMessage());
        return null;
    }
}
