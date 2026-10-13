<?php
/**
 * Rayan Group — Production Server Live Assistance & Chat Desk API
 * Endpoint: /api/chat.php (or /api/chat via rewrite)
 */

require_once __DIR__ . '/db.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$pdo = getDbConnection();
$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?: $_POST;
$action = $_GET['action'] ?? $body['action'] ?? 'poll';

// Fallback JSON file storage when database is momentarily unreachable
$storageFile = __DIR__ . '/chat_store.json';

function getFallbackStore($file) {
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true);
        if (is_array($data)) return $data;
    }
    return ['sessions' => [], 'messages' => []];
}

function saveFallbackStore($file, $data) {
    @file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

function normalizeSessionRow($row) {
    if (!$row) return null;
    $lastAct = !empty($row['last_activity']) 
        ? (is_numeric($row['last_activity']) ? (int)$row['last_activity'] : strtotime($row['last_activity']) * 1000)
        : round(microtime(true) * 1000);
    $created = !empty($row['created_at']) 
        ? (is_numeric($row['created_at']) ? (int)$row['created_at'] : strtotime($row['created_at']) * 1000)
        : $lastAct;

    return [
        'id' => $row['session_id'] ?? $row['id'] ?? '',
        'session_id' => $row['session_id'] ?? $row['id'] ?? '',
        'visitorName' => $row['visitor_name'] ?? $row['visitorName'] ?? 'Website Visitor',
        'visitor_name' => $row['visitor_name'] ?? $row['visitorName'] ?? 'Website Visitor',
        'page' => $row['page'] ?? '/',
        'status' => $row['status'] ?? 'active',
        'createdAt' => $created,
        'created_at' => $row['created_at'] ?? date('Y-m-d H:i:s', (int)($created / 1000)),
        'lastActivity' => $lastAct,
        'last_activity' => $row['last_activity'] ?? date('Y-m-d H:i:s', (int)($lastAct / 1000)),
        'lastMessage' => $row['last_message'] ?? $row['lastMessage'] ?? 'Active conversation',
        'last_message' => $row['last_message'] ?? $row['lastMessage'] ?? 'Active conversation',
        'unreadForAdmin' => (int)($row['unread_for_admin'] ?? $row['unreadForAdmin'] ?? 0),
        'unread_for_admin' => (int)($row['unread_for_admin'] ?? $row['unreadForAdmin'] ?? 0),
        'unreadForVisitor' => (int)($row['unread_for_visitor'] ?? $row['unreadForVisitor'] ?? 0),
        'unread_for_visitor' => (int)($row['unread_for_visitor'] ?? $row['unreadForVisitor'] ?? 0)
    ];
}

function normalizeMessageRow($row) {
    if (!$row) return null;
    $ts = (int)($row['timestamp'] ?? round(microtime(true) * 1000));
    $msgId = $row['msg_id'] ?? $row['id'] ?? ('msg_' . $ts);
    return [
        'id' => (string)$msgId,
        'msg_id' => (string)$msgId,
        'sessionId' => $row['session_id'] ?? $row['sessionId'] ?? '',
        'session_id' => $row['session_id'] ?? $row['sessionId'] ?? '',
        'sender' => $row['sender'] ?? 'visitor',
        'senderName' => $row['sender_name'] ?? $row['senderName'] ?? ($row['sender'] === 'admin' ? '🏛️ Executive Desk' : 'Visitor'),
        'sender_name' => $row['sender_name'] ?? $row['senderName'] ?? ($row['sender'] === 'admin' ? '🏛️ Executive Desk' : 'Visitor'),
        'text' => $row['message_text'] ?? $row['text'] ?? '',
        'message_text' => $row['message_text'] ?? $row['text'] ?? '',
        'timestamp' => $ts,
        'read' => !empty($row['read_status']) || !empty($row['read'])
    ];
}

// ============================================================================
// 1. GET REQUESTS
// ============================================================================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // Action: list_sessions (Admin Panel)
    if ($action === 'list_sessions') {
        $sessionList = [];

        if ($pdo) {
            try {
                $stmt = $pdo->query("SELECT * FROM chat_sessions ORDER BY last_activity DESC LIMIT 100");
                $rawRows = $stmt->fetchAll();
                foreach ($rawRows as $r) {
                    $norm = normalizeSessionRow($r);
                    if ($norm && !empty($norm['id'])) {
                        // If lastMessage is empty, attempt to fetch latest from chat_messages
                        if (empty($norm['lastMessage']) || $norm['lastMessage'] === 'Active conversation') {
                            $mStmt = $pdo->prepare("SELECT message_text FROM chat_messages WHERE session_id = ? ORDER BY timestamp DESC LIMIT 1");
                            $mStmt->execute([$norm['id']]);
                            $latestText = $mStmt->fetchColumn();
                            if ($latestText) {
                                $norm['lastMessage'] = $latestText;
                                $norm['last_message'] = $latestText;
                            }
                        }
                        $sessionList[] = $norm;
                    }
                }
            } catch (Exception $e) {
                // fall through to file fallback
            }
        }

        // Merge with file fallback if database had none or failed
        if (empty($sessionList)) {
            $fallback = getFallbackStore($storageFile);
            foreach ($fallback['sessions'] as $s) {
                $sessionList[] = normalizeSessionRow($s);
            }
            usort($sessionList, fn($a, $b) => ($b['lastActivity'] ?? 0) - ($a['lastActivity'] ?? 0));
        }

        echo json_encode(['success' => true, 'sessions' => $sessionList], JSON_UNESCAPED_SLASHES);
        exit;
    }

    // Action: get_messages (Admin Panel selects session)
    if ($action === 'get_messages') {
        $sessionId = $_GET['sessionId'] ?? $_GET['session_id'] ?? '';
        if (!$sessionId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing sessionId']);
            exit;
        }

        $sessionData = null;
        $messages = [];

        if ($pdo) {
            try {
                $sStmt = $pdo->prepare("SELECT * FROM chat_sessions WHERE session_id = ?");
                $sStmt->execute([$sessionId]);
                $sRow = $sStmt->fetch();
                if ($sRow) {
                    $sessionData = normalizeSessionRow($sRow);
                }

                $mStmt = $pdo->prepare("SELECT * FROM chat_messages WHERE session_id = ? ORDER BY timestamp ASC");
                $mStmt->execute([$sessionId]);
                $mRows = $mStmt->fetchAll();
                foreach ($mRows as $m) {
                    $messages[] = normalizeMessageRow($m);
                }
            } catch (Exception $e) {}
        }

        // Check fallback store if empty
        if (empty($messages)) {
            $fallback = getFallbackStore($storageFile);
            if (isset($fallback['sessions'][$sessionId])) {
                $sessionData = normalizeSessionRow($fallback['sessions'][$sessionId]);
            }
            if (isset($fallback['messages'][$sessionId])) {
                foreach ($fallback['messages'][$sessionId] as $m) {
                    $messages[] = normalizeMessageRow($m);
                }
            }
        }

        echo json_encode([
            'success' => true,
            'session' => $sessionData,
            'messages' => $messages
        ], JSON_UNESCAPED_SLASHES);
        exit;
    }

    // Action: poll (Visitor widget or admin polling)
    if ($action === 'poll') {
        $sessionId = $_GET['sessionId'] ?? $_GET['session_id'] ?? '';
        $since = (int)($_GET['since'] ?? 0);
        $newMsgs = [];
        $sessionData = null;

        if ($pdo && $sessionId) {
            try {
                $sStmt = $pdo->prepare("SELECT * FROM chat_sessions WHERE session_id = ?");
                $sStmt->execute([$sessionId]);
                $sRow = $sStmt->fetch();
                if ($sRow) {
                    $sessionData = normalizeSessionRow($sRow);
                }

                $mStmt = $pdo->prepare("SELECT * FROM chat_messages WHERE session_id = ? AND timestamp > ? ORDER BY timestamp ASC");
                $mStmt->execute([$sessionId, $since]);
                foreach ($mStmt->fetchAll() as $m) {
                    $newMsgs[] = normalizeMessageRow($m);
                }
            } catch (Exception $e) {}
        }

        if ($sessionId && empty($newMsgs)) {
            $fallback = getFallbackStore($storageFile);
            if (isset($fallback['sessions'][$sessionId])) {
                $sessionData = normalizeSessionRow($fallback['sessions'][$sessionId]);
            }
            if (isset($fallback['messages'][$sessionId])) {
                foreach ($fallback['messages'][$sessionId] as $m) {
                    if (($m['timestamp'] ?? 0) > $since) {
                        $newMsgs[] = normalizeMessageRow($m);
                    }
                }
            }
        }

        echo json_encode([
            'success' => true,
            'session' => $sessionData,
            'messages' => $newMsgs,
            'serverTime' => round(microtime(true) * 1000)
        ], JSON_UNESCAPED_SLASHES);
        exit;
    }

    echo json_encode(['success' => true, 'status' => 'Live Assistance API Online']);
    exit;
}

// ============================================================================
// 2. POST REQUESTS
// ============================================================================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postAction = $body['action'] ?? $action;
    $sessionId = $body['sessionId'] ?? $body['session_id'] ?? '';

    if (!$sessionId) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing sessionId']);
        exit;
    }

    // Handle 'send' (visitor) OR 'reply' (admin) OR 'send_message'
    if (in_array($postAction, ['send', 'reply', 'send_message'])) {
        $text = trim($body['text'] ?? $body['message'] ?? '');
        if (!$text) {
            http_response_code(400);
            echo json_encode(['error' => 'Message text cannot be empty']);
            exit;
        }

        $sender = ($postAction === 'reply' || ($body['sender'] ?? '') === 'admin') ? 'admin' : 'visitor';
        $senderName = $body['senderName'] ?? $body['sender_name'] ?? ($body['visitorInfo']['name'] ?? ($sender === 'admin' ? '🏛️ Executive Desk' : 'Website Visitor'));
        $page = $body['page'] ?? '/';
        $ts = (int)($body['timestamp'] ?? round(microtime(true) * 1000));
        $msgId = $body['id'] ?? $body['msg_id'] ?? ('msg_' . $ts . '_' . substr(bin2hex(random_bytes(4)), 0, 6));

        $msgObj = [
            'id' => $msgId,
            'msg_id' => $msgId,
            'sessionId' => $sessionId,
            'session_id' => $sessionId,
            'sender' => $sender,
            'senderName' => $senderName,
            'sender_name' => $senderName,
            'text' => $text,
            'message_text' => $text,
            'timestamp' => $ts,
            'read' => false
        ];

        $sessionObj = null;

        if ($pdo) {
            try {
                // Upsert chat_sessions
                if ($sender === 'visitor') {
                    $sStmt = $pdo->prepare("
                        INSERT INTO chat_sessions (session_id, visitor_name, page, status, last_message, unread_for_admin, last_activity)
                        VALUES (?, ?, ?, 'active', ?, 1, CURRENT_TIMESTAMP)
                        ON DUPLICATE KEY UPDATE
                            visitor_name = IF(VALUES(visitor_name) != 'Website Visitor', VALUES(visitor_name), visitor_name),
                            page = VALUES(page),
                            status = 'active',
                            last_message = VALUES(last_message),
                            unread_for_admin = unread_for_admin + 1,
                            last_activity = CURRENT_TIMESTAMP
                    ");
                    $sStmt->execute([$sessionId, $senderName, $page, $text]);
                } else {
                    $sStmt = $pdo->prepare("
                        INSERT INTO chat_sessions (session_id, visitor_name, page, status, last_message, unread_for_visitor, last_activity)
                        VALUES (?, 'Website Visitor', ?, 'active', ?, 1, CURRENT_TIMESTAMP)
                        ON DUPLICATE KEY UPDATE
                            last_message = VALUES(last_message),
                            unread_for_visitor = unread_for_visitor + 1,
                            last_activity = CURRENT_TIMESTAMP
                    ");
                    $sStmt->execute([$sessionId, $page, $text]);
                }

                // Check for duplicate message insertion
                $checkStmt = $pdo->prepare("SELECT id FROM chat_messages WHERE session_id = ? AND (msg_id = ? OR (sender = ? AND message_text = ? AND ABS(timestamp - ?) < 4000)) LIMIT 1");
                $checkStmt->execute([$sessionId, $msgId, $sender, $text, $ts]);
                if (!$checkStmt->fetch()) {
                    $mStmt = $pdo->prepare("INSERT INTO chat_messages (msg_id, session_id, sender, sender_name, message_text, timestamp) VALUES (?, ?, ?, ?, ?, ?)");
                    $mStmt->execute([$msgId, $sessionId, $sender, $senderName, $text, $ts]);
                }

                // Fetch updated session
                $qStmt = $pdo->prepare("SELECT * FROM chat_sessions WHERE session_id = ?");
                $qStmt->execute([$sessionId]);
                $sessionObj = normalizeSessionRow($qStmt->fetch());
            } catch (Exception $e) {
                error_log("Chat DB error: " . $e->getMessage());
            }
        }

        // Always sync to file fallback as a durable snapshot
        $fallback = getFallbackStore($storageFile);
        if (!isset($fallback['sessions'][$sessionId])) {
            $fallback['sessions'][$sessionId] = [
                'session_id' => $sessionId,
                'visitor_name' => $senderName,
                'page' => $page,
                'status' => 'active',
                'last_message' => $text,
                'unread_for_admin' => ($sender === 'visitor' ? 1 : 0),
                'unread_for_visitor' => ($sender === 'admin' ? 1 : 0),
                'created_at' => date('Y-m-d H:i:s'),
                'last_activity' => date('Y-m-d H:i:s')
            ];
        } else {
            $fallback['sessions'][$sessionId]['last_message'] = $text;
            $fallback['sessions'][$sessionId]['last_activity'] = date('Y-m-d H:i:s');
            if ($sender === 'visitor') {
                $fallback['sessions'][$sessionId]['unread_for_admin'] = ($fallback['sessions'][$sessionId]['unread_for_admin'] ?? 0) + 1;
                if ($senderName !== 'Website Visitor') $fallback['sessions'][$sessionId]['visitor_name'] = $senderName;
            } else {
                $fallback['sessions'][$sessionId]['unread_for_visitor'] = ($fallback['sessions'][$sessionId]['unread_for_visitor'] ?? 0) + 1;
            }
        }
        if (!isset($fallback['messages'][$sessionId])) {
            $fallback['messages'][$sessionId] = [];
        }
        $fallback['messages'][$sessionId][] = $msgObj;
        saveFallbackStore($storageFile, $fallback);

        if (!$sessionObj) {
            $sessionObj = normalizeSessionRow($fallback['sessions'][$sessionId]);
        }

        echo json_encode([
            'success' => true,
            'message' => $msgObj,
            'session' => $sessionObj
        ], JSON_UNESCAPED_SLASHES);
        exit;
    }

    // Action: mark_read
    if ($postAction === 'mark_read') {
        $by = $body['by'] ?? 'admin';
        if ($pdo) {
            try {
                if ($by === 'admin') {
                    $stmt = $pdo->prepare("UPDATE chat_sessions SET unread_for_admin = 0 WHERE session_id = ?");
                    $stmt->execute([$sessionId]);
                    $mStmt = $pdo->prepare("UPDATE chat_messages SET read_status = 1 WHERE session_id = ? AND sender = 'visitor'");
                    $mStmt->execute([$sessionId]);
                } else {
                    $stmt = $pdo->prepare("UPDATE chat_sessions SET unread_for_visitor = 0 WHERE session_id = ?");
                    $stmt->execute([$sessionId]);
                    $mStmt = $pdo->prepare("UPDATE chat_messages SET read_status = 1 WHERE session_id = ? AND sender = 'admin'");
                    $mStmt->execute([$sessionId]);
                }
            } catch (Exception $e) {}
        }

        $fallback = getFallbackStore($storageFile);
        if (isset($fallback['sessions'][$sessionId])) {
            if ($by === 'admin') $fallback['sessions'][$sessionId]['unread_for_admin'] = 0;
            else $fallback['sessions'][$sessionId]['unread_for_visitor'] = 0;
            saveFallbackStore($storageFile, $fallback);
        }

        echo json_encode(['success' => true, 'sessionId' => $sessionId]);
        exit;
    }

    // Action: resolve
    if ($postAction === 'resolve') {
        if ($pdo) {
            try {
                $stmt = $pdo->prepare("UPDATE chat_sessions SET status = 'resolved' WHERE session_id = ?");
                $stmt->execute([$sessionId]);
            } catch (Exception $e) {}
        }

        $fallback = getFallbackStore($storageFile);
        if (isset($fallback['sessions'][$sessionId])) {
            $fallback['sessions'][$sessionId]['status'] = 'resolved';
            saveFallbackStore($storageFile, $fallback);
        }

        echo json_encode(['success' => true, 'sessionId' => $sessionId, 'status' => 'resolved']);
        exit;
    }

    // Action: clear
    if ($postAction === 'clear') {
        if ($pdo) {
            try {
                $mStmt = $pdo->prepare("DELETE FROM chat_messages WHERE session_id = ?");
                $mStmt->execute([$sessionId]);
                $sStmt = $pdo->prepare("DELETE FROM chat_sessions WHERE session_id = ?");
                $sStmt->execute([$sessionId]);
            } catch (Exception $e) {}
        }

        $fallback = getFallbackStore($storageFile);
        unset($fallback['sessions'][$sessionId]);
        unset($fallback['messages'][$sessionId]);
        saveFallbackStore($storageFile, $fallback);

        echo json_encode(['success' => true, 'cleared' => $sessionId]);
        exit;
    }

    // Action: init_session
    if ($postAction === 'init_session') {
        $visitorName = $body['visitorName'] ?? $body['visitor_name'] ?? 'Website Visitor';
        $page = $body['page'] ?? '/';

        if ($pdo) {
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO chat_sessions (session_id, visitor_name, page, status) 
                    VALUES (?, ?, ?, 'active') 
                    ON DUPLICATE KEY UPDATE visitor_name = VALUES(visitor_name), page = VALUES(page)
                ");
                $stmt->execute([$sessionId, $visitorName, $page]);
            } catch (Exception $e) {}
        }

        echo json_encode(['success' => true, 'sessionId' => $sessionId, 'visitorName' => $visitorName]);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Unknown action']);
