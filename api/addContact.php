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

		$stmt = $conn->prepare("INSERT into Contacts (FirstName, LastName, Phone, Email, UserID) VALUES(?,?,?,?,?)");
		$stmt->bind_param("ssssi", $firstName, $lastName, $phone, $email, $userId);
		$stmt->execute();
		$stmt->close();
		$conn->close();
		returnWithError("User added successfully");
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