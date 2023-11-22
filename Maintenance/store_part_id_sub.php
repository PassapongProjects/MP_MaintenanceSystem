<?php
require '../connection.php';
session_start();
if (!isset($_SESSION['user'])) {
    header("refresh:0; url=../logout.php");
}


if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the part ID from the POST data
    
    
    // jobId is now = all_job_id related to fix_job number
    $jobId = mysqli_real_escape_string($conn,$_POST['jobId']);
    
    if(isset($_POST['generate'])&& $_POST['generate']) {
        function generateUniqueID($lastUID) {
            // Get the current date in the format "d-m-y"
            $currentDate = date('d-m-y');
    
            if ($lastUID === null || $lastUID === '') {
                // If $lastUID is empty or not found, generate the first ID for the day with counter set to 001
                return "MR-" . $currentDate . "/001";
            }
        
            // Get the date part of the last UID
            $lastDate = substr($lastUID, 3, 8);
        
            // Check if the current date is the same as the last date
            if ($currentDate === $lastDate) {
                // Increment the counter by 1
                $counter = intval(substr($lastUID, -3)) + 1;
                $counter = str_pad($counter, 3, '0', STR_PAD_LEFT);
            } else {
                // Reset the counter to 001
                $counter = '001';
            }
        
            // Generate the unique ID
            return "MR-" . $currentDate . "/" . $counter;
    }

    //Create new MR code
    $result = mysqli_query($conn, "SELECT prio FROM inven_requisted WHERE fk_job_id = $jobId AND inven_requisted.prio != 0 ORDER BY inven_requisted.prio DESC LIMIT 1;");
    if ($result !== false && mysqli_num_rows($result) == 0) {
        // Create new MR table
        $lastUID = mysqli_fetch_assoc(mysqli_query($conn, "SELECT mr_code FROM inven_requisted ORDER BY id DESC LIMIT 1"))['mr_code'];
        $lastUID = ($lastUID !== null) ? $lastUID : '';

        // Call the generateUniqueID function and store the result in a variable
        $newUniqueID = generateUniqueID($lastUID);

        $stmt = $conn->prepare("INSERT INTO inven_requisted (fk_job_id, mr_code, fk_job, prio) VALUES (?, ?, 1, 1)");
        $stmt->bind_param("ss", $jobId, $newUniqueID);

        // Execute the query
        $result = $stmt->execute();
        if (!$result) {
            // Handle the error
            // For example: echo "Error creating new MR table: " . $stmt->error;
            exit;
        }
    }elseif($result !== false && mysqli_num_rows($result) != 0){
        $lastPrio = mysqli_fetch_array($result)[0];
        $codeAndPrio = mysqli_fetch_assoc(mysqli_query($conn, "SELECT mr_code,prio FROM inven_requisted ORDER BY id DESC LIMIT 1"));
        $lastUID = $codeAndPrio['mr_code'];
        $newPrio = intval($codeAndPrio['prio'])+1;
        $lastUID = ($lastUID !== null) ? $lastUID : '';
        
        // Call the generateUniqueID function and store the result in a variable
        $newUniqueID = generateUniqueID($lastUID);

        $stmt = $conn->prepare("INSERT INTO inven_requisted (fk_job_id, mr_code, fk_job, prio) VALUES (?, ?, 1, {$newPrio})");
        $stmt->bind_param("ss", $jobId, $newUniqueID);

        // Execute the query
        $result = $stmt->execute();
        if (!$result) {
            // Handle the error
            // For example: echo "Error creating new MR table: " . $stmt->error;
            exit;
        }  
    }
    echo $newUniqueID;
    exit;
    }else{ // This is just the storing part
        $partId = $_POST["partId"];
        $req_eng = $_SESSION["usid"];
        $MRCODE = mysqli_real_escape_string($conn,$_POST['mrcode']);

    // Fetch the mr_code from the database
    // $result = mysqli_query($conn, "SELECT mr_code FROM inven_requisted WHERE fk_job_id = $jobId AND inven_requisted.prio = {$mrPrio};");
    // if ($result !== false && mysqli_num_rows($result) > 0) {
    //     $MRCODE = mysqli_fetch_array($result)[0];
    // } else {
    //     // Handle the case where the mr_code could not be fetched
    //     // For example: echo "Error fetching mr_code from database.";
    //     exit;
    // }
    $result = mysqli_query($conn, "SELECT * FROM inven_requisted_cart WHERE fk_requisted_code = '{$MRCODE}' AND fk_part_id = {$partId}");
    if ($result !== false && mysqli_num_rows($result) == 0) {
    // Prepare and execute the SQL query to insert the part ID into the database table
    $stmt = $conn->prepare("INSERT INTO inven_requisted_cart (fk_requisted_code, fk_part_id, req_quan) VALUES (?, ?, 0)");
    $stmt->bind_param("si", $MRCODE, $partId);

    if ($stmt->execute()) {
        // The part ID was successfully stored in the database
        // echo "Part ID stored successfully.";
    } else {
        // Handle the error
        // For example: echo "Error storing part ID: " . $stmt->error;
    }
    }

    // Close the prepared statement
    $stmt->close();
    // Close the database connection
    $conn->close();
}
} else {
    // If the request method is not POST, return an error message
    // echo "Invalid request method.";
}

?>
