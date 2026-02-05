<?php
require_once __DIR__ . "/config.php";

function get_db(): mysqli
{
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error)
    {
        http_response_code(500);
        header("Content-Type: application/json");
        echo json_encode(["error" => "DB connection failed"]);
        exit;
    }
    return $conn;
}
