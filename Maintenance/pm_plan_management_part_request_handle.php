<?php
require '../connection.php';
session_start();
if (!isset($_SESSION['usid'])) {
    header("refresh:0; url=../logout.php");
    exit;
}
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $jobId = isset($_POST['allJobId']) ? mysqli_real_escape_string($conn,$_POST['allJobId']) : '';
    $partData = isset($_POST['partData']) ? $_POST['partData'] : '';
    $req_eng = mysqli_real_escape_string($conn,$_SESSION["usid"]);

    if($jobId =='' || $partData =='') {
        // Should not happen in normal circumstance.
        header("refresh:0; url=../logout.php");
        exit;
    }

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

 // Check if MR related to Job exists if not create new, if exists update -> Should never exist before executing this code
 $result = mysqli_query($conn, "SELECT mr_code FROM inven_requisted WHERE fk_job_id = $jobId AND inven_requisted.prio = 0;");
 if ($result !== false && mysqli_num_rows($result) == 0) {
     // Create new MR table
     $lastUID = mysqli_fetch_array(mysqli_query($conn, "SELECT mr_code FROM inven_requisted ORDER BY id DESC LIMIT 1"))[0];
     $lastUID = ($lastUID !== null) ? $lastUID : '';

     // Call the generateUniqueID function and store the result in a variable
     $newUniqueID = generateUniqueID($lastUID);
     $stmt = $conn->prepare("INSERT INTO inven_requisted (fk_job_id, mr_code, fk_job, prio, `status`, submit_date) VALUES (?, ?, 2, 0,'Wait for review', NOW() )");
     $stmt->bind_param("ss", $jobId, $newUniqueID);

     // Execute the query
     $result = $stmt->execute();
     if (!$result) {
         // Handle the error
         // For example: echo "Error creating new MR table: " . $stmt->error;
         exit;
     }
     $stmt->close();
 }
    // Always Create New uniqueID based on the logic.
    $mrCode = $newUniqueID;

    // Now we have mrCode ready -> loop through each partData to store them in inven requisted cart as status of Waiting for approval

    foreach ($partData as $partItem) {
            if ($partItem['selected_value'] =="req") { // Only Add 'req' selected Part
            $insertCartSql = "INSERT INTO inven_requisted_cart (fk_requisted_code, fk_part_id, req_quan, `status`, req_eng, req_time) VALUES (?, ?, ?, 'Waiting for approval', ?, NOW());";
            $stmt = $conn->prepare($insertCartSql);
            $stmt->bind_param("sidi", $mrCode, $partItem['part_id'],$partItem['reqQuan'] ,$req_eng);
            $stmt->execute();

            if($stmt) {
                $updatePartStockSql = "UPDATE part 
                           SET instock = instock - ? 
                           WHERE id = ?";
            $stockStmt = $conn->prepare($updatePartStockSql);
            $stockStmt->bind_param("di", $partItem['reqQuan'], $partItem['part_id']);
            $stockStmt->execute();
            $stockStmt->close();
            }
            $stmt->close();
            
            }else {continue;}
        
    }
    $conn->close();
}

?>