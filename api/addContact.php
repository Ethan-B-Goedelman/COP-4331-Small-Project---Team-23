<?php
	ini_set('display_errors', 1);
	error_reporting(E_ALL);


	$inData = getRequestInfo();
	
	$firstName = $inData["firstName"];
	$lastName = $inData["lastName"];
	$phone = $inData["phone"];
	$email = $inData["email"];
	$userId = $inData["userId"]; //userId has to exist

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "Manager");
	
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		//check if userId exists
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

		//check if contact is duplicate
		$dup = $conn->prepare(
		"SELECT ID FROM Contacts WHERE UserID = ? AND Email = ?"
		);
		$dup->bind_param("is", $userId, $email);
		$dup->execute();
		$dup->store_result();

		if ($dup->num_rows > 0)
		{
			$dup->close();
			$conn->close();
			returnWithError("Contact already exists");
			return;
		}

		$dup->close();

		//add contact
		$stmt = $conn->prepare("INSERT into Contacts (FirstName, LastName, Phone, Email, UserID) VALUES(?,?,?,?,?)");
		$stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $userId);
		$stmt->execute();
		$stmt->close();
		$conn->close();
		returnWithError("Contact added successfully");
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
?>