<?php
/**
 * Rayan Group — Hostinger Database Connection & Schema Setup
 * Database: u575992126_rayan_app
 * Host: localhost
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
                page VARCHAR(255) DEFAULT '/',
                status VARCHAR(32) DEFAULT 'active',
                last_message TEXT,
                unread_for_admin INT DEFAULT 0,
                unread_for_visitor INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

            CREATE TABLE IF NOT EXISTS chat_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                msg_id VARCHAR(64) DEFAULT NULL,
                session_id VARCHAR(64) NOT NULL,
                sender VARCHAR(32) NOT NULL,
                sender_name VARCHAR(255) NOT NULL,
                message_text TEXT NOT NULL,
                timestamp BIGINT NOT NULL,
                read_status TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_session (session_id),
                INDEX idx_timestamp (timestamp),
                INDEX idx_msg_id (msg_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Safe auto-migration for existing tables:
        $sessionCols = [
            'page' => "ALTER TABLE chat_sessions ADD COLUMN page VARCHAR(255) DEFAULT '/'",
            'last_message' => "ALTER TABLE chat_sessions ADD COLUMN last_message TEXT",
            'unread_for_admin' => "ALTER TABLE chat_sessions ADD COLUMN unread_for_admin INT DEFAULT 0",
            'unread_for_visitor' => "ALTER TABLE chat_sessions ADD COLUMN unread_for_visitor INT DEFAULT 0"
        ];
        foreach ($sessionCols as $col => $alterSql) {
            try {
                $check = $pdo->query("SHOW COLUMNS FROM chat_sessions LIKE '$col'")->fetch();
                if (!$check) {
                    $pdo->exec($alterSql);
                }
            } catch (Exception $e) {}
        }

        try {
            $checkMsgId = $pdo->query("SHOW COLUMNS FROM chat_messages LIKE 'msg_id'")->fetch();
            if (!$checkMsgId) {
                $pdo->exec("ALTER TABLE chat_messages ADD COLUMN msg_id VARCHAR(64) DEFAULT NULL, ADD INDEX idx_msg_id (msg_id)");
            }
        } catch (Exception $e) {}

        try {
            $checkRead = $pdo->query("SHOW COLUMNS FROM chat_messages LIKE 'read_status'")->fetch();
            if (!$checkRead) {
                $pdo->exec("ALTER TABLE chat_messages ADD COLUMN read_status TINYINT(1) DEFAULT 0");
            }
        } catch (Exception $e) {}

        return $pdo;
    } catch (PDOException $e) {
        error_log("Database connection error: " . $e->getMessage());
        return null;
    }
}
