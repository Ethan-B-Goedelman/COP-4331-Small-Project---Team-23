<?php
include_once "cors.php";

require_once __DIR__ . "/../includes/db.php";
require_once __DIR__ . "/../includes/helpers.php";

$data = read_json();

$fullName = trim($data["fullName"] ?? "");
$email    = trim($data["email"] ?? "");
$pass     = (string)($data["password"] ?? "");
$confirm  = (string)($data["confirmPassword"] ?? "");

if ($fullName === "" || $email === "" || $pass === "" || $confirm === "")
    send_json(["error" => "Missing fields"], 400);

if ($pass !== $confirm)
    send_json(["error" => "Passwords do not match"], 400);

$parts = preg_split('/\s+/', $fullName);
$first = $parts[0] ?? "";
$last  = count($parts) > 1 ? implode(" ", array_slice($parts, 1)) : "";

$hash = password_hash($pass, PASSWORD_BCRYPT);

$conn = get_db();

// duplicate check
$stmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0)
{
    $stmt->close();
    $conn->close();
    send_json(["error" => "Email already exists"], 409);
}
$stmt->close();

// insert
$stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?,?,?,?)");
$stmt->bind_param("ssss", $first, $last, $email, $hash);

if (!$stmt->execute())
{
    $stmt->close();
    $conn->close();
    send_json(["error" => "Register failed"], 500);
}

$id = $stmt->insert_id;
$stmt->close();
$conn->close();

send_json(["id" => $id, "firstName" => $first, "lastName" => $last, "error" => ""], 200);
