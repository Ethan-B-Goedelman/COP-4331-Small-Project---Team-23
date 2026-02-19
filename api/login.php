<?php

include_once 'cors.php';
header("Content-Type: application/json; charset=UTF-8");

$inData = getRequestInfo();

// Accept either "email" or "login" as the username field
$login = "";
if (isset($inData["email"])) $login = trim($inData["email"]);
if ($login === "" && isset($inData["login"])) $login = trim($inData["login"]);

$pass = isset($inData["password"]) ? $inData["password"] : "";

// Basic validation
if ($login === "" || $pass === "")
{
    http_response_code(400);
    returnWithError("Missing fields");
    exit();
}

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "Manager");
if ($conn->connect_error)
{
    http_response_code(500);
    returnWithError($conn->connect_error);
    exit();
}

// NOTE: DB columns are FirstName, LastName, Login, Password (Password is bcrypt hash)
$stmt = $conn->prepare("SELECT ID, FirstName, LastName, Password FROM Users WHERE Login=? LIMIT 1");
$stmt->bind_param("s", $login);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc())
{
    $hash = $row["Password"];

    // Verify bcrypt hash
    if (password_verify($pass, $hash))
    {
        // Start session (cookie-based auth)
        session_start();
        $_SESSION["userId"] = (int)$row["ID"];
        $_SESSION["firstName"] = $row["FirstName"];
        $_SESSION["lastName"]  = $row["LastName"];
        $_SESSION["login"]     = $login;

        http_response_code(200);
        returnWithInfo($row["FirstName"], $row["LastName"], (int)$row["ID"]);
    }
    else
    {
        http_response_code(401);
        returnWithError("Invalid login");
    }
}
else
{
    http_response_code(401);
    returnWithError("Invalid login");
}

$stmt->close();
$conn->close();

function getRequestInfo()
{
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function sendResultInfoAsJson($obj)
{
    echo $obj;
}

function returnWithError($err)
{
    $retValue = '{"id":0,"firstName":"","lastName":"","error":"' . escapeJson($err) . '"}';
    sendResultInfoAsJson($retValue);
}

function returnWithInfo($firstName, $lastName, $id)
{
    $retValue = '{"id":' . $id . ',"firstName":"' . escapeJson($firstName) .
                '","lastName":"' . escapeJson($lastName) . '","error":""}';
    sendResultInfoAsJson($retValue);
}

function escapeJson($str)
{
    return str_replace(
        ['\\', '"', "\n", "\r", "\t"],
        ['\\\\','\"','\\n','\\r','\\t'],
        $str
    );
}

