<?php
include_once "cors.php";

	$inData = getRequestInfo();

	$userId = (int)($inData["userId"] ?? 0);
	$contactId = (int)($inData["contactId"] ?? 0);

	if ($userId <= 0 || $contactId <= 0)
	{
		returnWithError("Missing userId or contactId");
		return;
	}

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "Manager");

	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}
	else
	{
		// Check if user exists
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

		// Check if contact exists AND belongs to user
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

		// Delete contact
		$stmt = $conn->prepare("DELETE FROM Contacts WHERE ID = ? AND UserID = ?");
		$stmt->bind_param("ii", $contactId, $userId);
		$stmt->execute();

		if ($stmt->affected_rows > 0)
		{
			$stmt->close();
			$conn->close();
			returnWithError("Contact deleted successfully");
			return;
		}
		else
		{
			$stmt->close();
			$conn->close();
			returnWithError("Delete failed");
			return;
		}
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
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson($retValue);
	}
?>
