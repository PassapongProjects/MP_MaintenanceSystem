<?php
require '../connection.php';
// Check if the 'machine_id' parameter is present in the GET request
if (isset($_GET['machine_id'])) {
    // Get the machine_id from the GET request
    $machineId = $_GET['machine_id'];

    // Prepare the SQL statement to fetch machine details based on the provided machine_id
    $stmt = $conn->prepare("SELECT `name`, `location` FROM mc WHERE id = ?");
    $stmt->bind_param("s", $machineId);

    // Execute the query
    $stmt->execute();

    // Get the result
    $result = $stmt->get_result();

    // Check if the machine details were found
    if ($result->num_rows > 0) {
        // Fetch the machine details from the result
        $row = $result->fetch_assoc();

        // Create an associative array to hold the machine details
        $machineDetails = array(
            'machine_name' => $row['name'],
            'location' => $row['location']
        );

        // Close the statement and connection
        $stmt->close();
        $conn->close();

        // Convert the array to JSON format and send it back to the client
        header('Content-Type: application/json');
        echo json_encode($machineDetails);
    } else {
        // No machine details found for the provided machine_id
        http_response_code(404);
        echo json_encode(array('error' => 'Machine details not found.'));
    }
} else {
    // Invalid request, machine_id not provided
    http_response_code(400);
    echo json_encode(array('error' => 'Invalid request.'));
}

?>
