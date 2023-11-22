<?php
require '../connection.php'; // Include your database connection

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the values from the POST data
    $partId = $_POST["partId"];
    $mrCode = $_POST["mrCode"];

    // Prepare and execute the SQL query to remove the part from inven_requisted_cart
    $sql = "DELETE FROM inven_requisted_cart WHERE fk_requisted_code = ? AND fk_part_id = ? AND status = 'On hold';";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $mrCode, $partId);

    if ($stmt->execute()) {
        // Part removed successfully
       // echo "Part removed successfully.";
    } else {
        // Error occurred while removing part
        //echo "Error removing part: " . $conn->error;
    }

    // Close the statement and the database connection
    $stmt->close();
    $conn->close();
} else {
    // If the request method is not POST, return an error message
    echo "Invalid request method.";
}
?>
