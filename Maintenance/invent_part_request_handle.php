<?php
require '../connection.php';
session_start();

if (!isset($_SESSION['usid'])) {
    header("refresh:0; url=../logout.php");
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the posted data
    $partData = isset($_POST['partData']) ? $_POST['partData'] : array();
    $jobId = mysqli_real_escape_string($conn,$_POST['jobId']); // You need to modify this based on your data --> This is fix_job id
    $job_type = mysqli_real_escape_string($conn,$_POST['jobType']);
    $req_eng = mysqli_real_escape_string($conn,$_SESSION['usid']);

    if($job_type=='PM') {
// AlljobId is sent.
        //$AlljobId = $jobId; 
    }else{$AlljobId = mysqli_fetch_array(mysqli_query($conn,"SELECT job_all.id  As fix_all_id from job_all INNER JOIN fix_job ON job_all.fk_fix_no = fix_job.job_no WHERE fix_job.id = {$jobId};"))[0];}

    $getMrCodeSql = "SELECT mr_code FROM inven_requisted WHERE fk_job_id = ? AND inven_requisted.prio = 0;";
    $stmt = $conn->prepare($getMrCodeSql);
    $stmt->bind_param("i", $AlljobId);
    $stmt->execute();
    $stmt->bind_result($mrCode);
    $stmt->fetch();
    $stmt->close();

    if(mysqli_num_rows(mysqli_query($conn,"SELECT * FROM inven_requisted_cart WHERE fk_requisted_code = '{$mrCode}';")) > 0){
        mysqli_query($conn,"UPDATE inven_requisted SET status = 'Wait for review', submit_date = NOW() WHERE mr_code = '{$mrCode}';");
        foreach ($partData as $partId => $requiredQuantity) {
            // Update inven_requisted_cart
            $updateCartSql = "UPDATE inven_requisted_cart 
                              SET req_quan = ?, status = 'Waiting for approval', req_eng = ?, req_time = NOW()
                              WHERE fk_requisted_code = ? AND fk_part_id = ? AND status = 'On hold';";
            $stmt = $conn->prepare($updateCartSql);
            $stmt->bind_param("disi", $requiredQuantity, $req_eng, $mrCode, $partId);
            $stmt->execute();
            $stmt->close();
            // This set available stock filed
            $updatePartStockSql = "UPDATE part 
                           SET instock = instock - ? 
                           WHERE id = ?";
            $stmt = $conn->prepare($updatePartStockSql);
            $stmt->bind_param("di", $requiredQuantity, $partId);
            $stmt->execute();
            $stmt->close();

        }}
}



?>