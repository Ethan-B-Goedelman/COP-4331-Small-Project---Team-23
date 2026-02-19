<?php
    include_once "cors.php";

    $inData = getRequestInfo();

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "Manager");
    if ($conn->connect_error)
    {
        returnWithError($conn->connect_error);
        exit();
    }

    $userId = (int)($inData["userId"] ?? 0);

    if ($userId <= 0)
    {
        returnWithError("Missing userId");
        $conn->close();
        exit();
    }

    $stmt = $conn->prepare("
        SELECT ID, FirstName, LastName, Email, Phone FROM Contacts WHERE UserID = ? AND CONCAT(FirstName, ' ', LastName) LIKE ?
    ");

    $search = trim($inData["search"] ?? "");
	$like = "%" . $search . "%";
	
    $stmt->bind_param("is", $userId, $like);
    $stmt->execute();

    $result = $stmt->get_result();

    $results = [];
    while ($row = $result->fetch_assoc())
    {
        $results[] = $row;
    }

    $stmt->close();
    $conn->close();

    if (count($results) == 0)
    {
        returnWithError("No Records Found");
    }
    else
    {
        sendResultInfoAsJson(json_encode(["results" => $results, "error" => ""]));
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
        sendResultInfoAsJson(json_encode(["results" => [], "error" => $err]));
    }

?>
