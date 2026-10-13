<?php
require_once __DIR__ . '/db.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$pdo = getDbConnection();
$action = $_GET['action'] ?? $_POST['action'] ?? 'poll';

// 1. GET requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'list_sessions') {
        if ($pdo) {
            $stmt = $pdo->query("SELECT * FROM chat_sessions ORDER BY last_activity DESC LIMIT 50");
            echo json_encode(['success' => true, 'sessions' => $stmt->fetchAll()]);
        } else {
            echo json_encode(['success' => true, 'sessions' => []]);
        }
        exit;
    }

    if ($action === 'get_messages') {
        $sessionId = $_GET['sessionId'] ?? '';
        if (!$sessionId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing sessionId']);
            exit;
        }

        if ($pdo) {
            $sStmt = $pdo->prepare("SELECT * FROM chat_sessions WHERE session_id = ?");
            $sStmt->execute([$sessionId]);
            $session = $sStmt->fetch() ?: null;

            $mStmt = $pdo->prepare("SELECT sender, sender_name, message_text as text, timestamp FROM chat_messages WHERE session_id = ? ORDER BY timestamp ASC");
            $mStmt->execute([$sessionId]);
            $messages = $mStmt->fetchAll();

            echo json_encode(['success' => true, 'session' => $session, 'messages' => $messages]);
        } else {
            echo json_encode(['success' => true, 'session' => null, 'messages' => []]);
        }
        exit;
    }

    if ($action === 'poll') {
        $sessionId = $_GET['sessionId'] ?? '';
        $since = (int)($_GET['since'] ?? 0);

        if ($pdo && $sessionId) {
            $mStmt = $pdo->prepare("SELECT sender, sender_name, message_text as text, timestamp FROM chat_messages WHERE session_id = ? AND timestamp > ? ORDER BY timestamp ASC");
            $mStmt->execute([$sessionId, $since]);
            $newMsgs = $mStmt->fetchAll();

            echo json_encode(['success' => true, 'messages' => $newMsgs, 'serverTime' => round(microtime(true) * 1000)]);
        } else {
            echo json_encode(['success' => true, 'messages' => [], 'serverTime' => round(microtime(true) * 1000)]);
        }
        exit;
    }
}

// 2. POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true) ?: $_POST;
    $postAction = $body['action'] ?? $action;

    if ($postAction === 'init_session') {
        $sessionId = $body['sessionId'] ?? ('sess_' . bin2hex(random_bytes(8)));
        $visitorName = $body['visitorName'] ?? 'Website Visitor';

        if ($pdo) {
            $stmt = $pdo->prepare("INSERT INTO chat_sessions (session_id, visitor_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE visitor_name = VALUES(visitor_name), last_activity = CURRENT_TIMESTAMP");
            $stmt->execute([$sessionId, $visitorName]);
        }

        echo json_encode(['success' => true, 'sessionId' => $sessionId, 'visitorName' => $visitorName]);
        exit;
    }

    if ($postAction === 'send_message') {
        $sessionId = $body['sessionId'] ?? '';
        $sender = $body['sender'] ?? 'visitor';
        $senderName = $body['senderName'] ?? ($sender === 'admin' ? '🏛️ Executive Desk' : 'Visitor');
        $text = trim($body['text'] ?? '');
        $ts = (int)($body['timestamp'] ?? round(microtime(true) * 1000));

        if (!$sessionId || !$text) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing sessionId or text']);
            exit;
        }

        if ($pdo) {
            // Upsert session
            $sStmt = $pdo->prepare("INSERT INTO chat_sessions (session_id, visitor_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE last_activity = CURRENT_TIMESTAMP");
            $sStmt->execute([$sessionId, $senderName]);

            // Insert message
            $mStmt = $pdo->prepare("INSERT INTO chat_messages (session_id, sender, sender_name, message_text, timestamp) VALUES (?, ?, ?, ?, ?)");
            $mStmt->execute([$sessionId, $sender, $senderName, $text, $ts]);
        }

        echo json_encode(['success' => true, 'message' => ['sender' => $sender, 'sender_name' => $senderName, 'text' => $text, 'timestamp' => $ts]]);
        exit;
    }
}

echo json_encode(['success' => false, 'error' => 'Unknown action']);
