<?php
require '../connection.php';
// Check if the form is submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if all required form fields have values
    if (isset($_POST['machine_id']) && isset($_POST['informing_operator']) && isset($_POST['informed_reason'])) {
        // Get the form data
        $machineId = $_POST['machine_id'];
        //$informDate = $_POST['downtime'];
        $issuedBy = $_POST['informing_operator'];
        $informReason = $_POST['informed_reason'];


        $currentMonth = date('m');


// Prepare the SQL statement to fetch the latest Job_no for the current month
    $sql = "SELECT job_no FROM fix_job WHERE SUBSTRING(Job_no, 4, 2) = ? ORDER BY job_no DESC LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $currentMonth);
    $stmt->execute();
    $result = $stmt->get_result();

// Initialize the new job number counter
$newJobNumber = 1;

// Check if there is a previous Job_no for the current month
if ($result->num_rows > 0) {
    // Fetch the latest Job_no for the current month
    $latestJobNo = $result->fetch_assoc()['job_no'];

    // Extract the job number (last 3 digits) from the latest Job_no
    $latestJobNumber = intval(substr($latestJobNo, 6));

    // Increment the job number by 1 to get the new job number
    $newJobNumber = $latestJobNumber + 1;
}

// Generate the new Job_no based on the rules (e.g., 06/031)
        $newJobNo = "BD-". sprintf("%02d", $currentMonth) . "/" . sprintf("%03d", $newJobNumber);

        $stmt = $conn->prepare("INSERT INTO fix_job (job_no, mc_id, inform_date, issued_by, inform_reason) VALUES (?, ?,NOW(), ?, ?)");

        // Bind parameters and execute the statement
        $stmt->bind_param("ssss", $newJobNo,$machineId,$issuedBy, $informReason);

        // Execute the query
        $result = $stmt->execute();

        // Check if the insertion was successful
        if ($result === TRUE) {
            // Insertion successful, do further processing or display success message
            // You can also redirect the user to a success page
            header('Location: ../welcome.php?informstatus=แจ้งซ่อมสำเร็จ'); // Replace 'success.php' with your desired success page
            
        } else {
            // Insertion failed, display error message or handle the error accordingly
            header("Location: ../welcome.php?informstatus={$stmt->error}");
        }


        $stmt = $conn->prepare("INSERT INTO job_all (fk_fix_no,job_type ) VALUES (?, 'BD');");

        // Bind parameters and execute the statement
        $stmt->bind_param("s", $newJobNo);

        // Execute the query
        $result = $stmt->execute();
        // Close the statement and connection
        $stmt->close();

        // Insert new assign AS null
        $conn->query("INSERT INTO job_assigned_eng_junc (fk_job_code) VALUES ('{$newJobNo}');");

        $conn->close();
    } else {
        // If any required form field is missing, display an error message or handle the error accordingly
        header("refresh:0; url=PD_down_inform.php?informstatus=กรอกข้อมูลไม่ครบ");
    }
}

?>
