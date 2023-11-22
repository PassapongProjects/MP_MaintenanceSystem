<?php
require '../connection.php';
// Replace with your actual database connection details

// Prepare the SQL statement to fetch the latest job data from the database
$sql = "SELECT
id as id,
name as part_name,
spec as part_spec,
instock as instock,
unit as unit,
IFNULL(location, 'N/A') as part_loc
FROM part;
";
$result = $conn->query($sql);

// Check if there are any rows in the result
if ($result->num_rows > 0) {
    // Create an array to store the job data
    $jobs = array();

    // Fetch each row of data and add it to the jobs array
    while ($row = $result->fetch_assoc()) {
        $jobs[] = $row;
    }

    // Close the result set
    $result->close();

    // Close the connection
    $conn->close();

    // Return the job data as a JSON response
    header('Content-Type: application/json');
    echo json_encode($jobs);
} else {
    // Close the connection
    $conn->close();

    // Return an empty JSON response
    header('Content-Type: application/json');
    echo json_encode(array());
}
?>
