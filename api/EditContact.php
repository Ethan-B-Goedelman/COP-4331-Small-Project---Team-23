<?php
include_once "cors.php";

    ini_set('display_errors', 1);
    error_reporting(E_ALL);

    $inData = getRequestInfo();

    $userId    = (int)($inData["userId"] ?? 0);
    $contactId = (int)($inData["contactId"] ?? 0);

    $firstName = trim($inData["firstName"] ?? "");
    $lastName  = trim($inData["lastName"] ?? "");
    $phone     = trim($inData["phone"] ?? "");
    $email     = trim($inData["email"] ?? "");

    if ($userId <= 0 || $contactId <= 0)
    {
        returnWithError("Missing userId or contactId");
        return;
    }

    // Basic validation (adjust to your rules)
    if ($firstName === "" || $lastName === "" || $email === "")
    {
        returnWithError("Missing required fields (firstName, lastName, email)");
        return;
    }

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "Manager");
    if ($conn->connect_error)
    {
        returnWithError($conn->connect_error);
        return;
    }

    // 1) Check if user exists
    $check = $conn->prepare("SELECT ID FROM Users WHERE ID = ?");
    $check->bind_param("i", $userId);
    $check->execute();
    $check->store_result();

    if ($check->num_rows == 0)
    {
        $check->close();
        $conn->close();
        returnWithError("User does not exist");
        return;
    }
    $check->close();

    // 2) Check if contact exists AND belongs to user
    $owns = $conn->prepare("SELECT ID FROM Contacts WHERE ID = ? AND UserID = ?");
    $owns->bind_param("ii", $contactId, $userId);
    $owns->execute();
    $owns->store_result();

    if ($owns->num_rows == 0)
    {
        $owns->close();
        $conn->close();
        returnWithError("Contact not found for this user");
        return;
    }
    $owns->close();

    // 3) Prevent duplicate email for same user (excluding this contact)
    $dup = $conn->prepare("SELECT ID FROM Contacts WHERE UserID = ? AND Email = ? AND ID <> ?");
    $dup->bind_param("isi", $userId, $email, $contactId);
    $dup->execute();
    $dup->store_result();

    if ($dup->num_rows > 0)
    {
        $dup->close();
        $conn->close();
        returnWithError("Another contact with this email already exists");
        return;
    }
    $dup->close();

    // 4) Update contact
    $stmt = $conn->prepare("
        UPDATE Contacts
        SET FirstName = ?, LastName = ?, Phone = ?, Email = ?
        WHERE ID = ? AND UserID = ?
    ");
    $stmt->bind_param("ssssii", $firstName, $lastName, $phone, $email, $contactId, $userId);
    $stmt->execute();

    if ($stmt->affected_rows >= 0) // 0 means no changes, still not an error
    {
        $stmt->close();
        $conn->close();
        returnWithError("Contact updated successfully");
        return;
    }
    else
    {
        $stmt->close();
        $conn->close();
        returnWithError("Update failed");
        return;
    }

    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson($obj)
    {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnWithError($err)
    {
        // Matching your current style (success also placed in "error")
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }
?>
