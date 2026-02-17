<?php
function read_json(): array
{
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function send_json(array $obj, int $status = 200): void
{
    http_response_code($status);
    header("Content-Type: application/json");
    echo json_encode($obj);
    exit;
}
