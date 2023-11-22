<?php
require '../connection.php';
session_start();

if (!isset($_SESSION['usid'])) {
    header("refresh:0; url=../logout.php");
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the posted data
    // HANDLE JOB DONE FOR ANY BREAKDOWN JOB
    $reasonDescription = $_POST['reasonDescription'];
    $maintenanceDescription = $_POST['maintenanceDescription'];
    $selectedOption = $_POST['selectedOption'];
    $partData = isset($_POST['partData']) ? $_POST['partData'] : array();
    $jobId = mysqli_real_escape_string($conn, $_POST['jobId']); // You need to modify this based on your data --> This is fix_job id
    $AlljobId = mysqli_fetch_array(mysqli_query($conn, "SELECT job_all.id  As fix_all_id from job_all INNER JOIN fix_job ON job_all.fk_fix_no = fix_job.job_no WHERE fix_job.id = {$jobId};"))[0];
    // this is all job id
    $req_eng = $_SESSION['usid'];

    // Validate (Clear !Issued Mrcode Related To The Job)
    $Mrcodess = array();
    $getMrCodeSql = "SELECT mr_code FROM inven_requisted WHERE fk_job_id = ?;";
    $stmtmain = $conn->prepare($getMrCodeSql);
    $stmtmain->bind_param("i", $AlljobId);
    $stmtmain->execute();
    $stmtmain->bind_result($ReturnMrCode);
    while ($stmtmain->fetch()) {
        $Mrcodess[] = $ReturnMrCode;
    }
    $stmtmain->close();


    $engPersonConfirmed = $_SESSION['usid'];



    if ($selectedOption === '1') {
        // Check if any MR related to all_job is still on hold
        $Check_mr_result = mysqli_query($conn, "SELECT ir.mr_code As mr_code, irc.status As status FROM inven_requisted As ir ,inven_requisted_cart As irc WHERE irc.fk_requisted_code = ir.mr_code AND irc.`status` != 'Issued' AND ir.fk_job_id = {$AlljobId};");
        if (mysqli_num_rows($Check_mr_result) > 0) {

            while ($res = mysqli_fetch_assoc($Check_mr_result)) {
                if ($res['status'] != "Issued") {
                    $tmpMR[] = $res['mr_code'];
                }
            }
            $quotedMrCodes = array_map(function ($item) {
                return "'" . $item . "'";
            }, $tmpMR);
            $LeftOverMR = implode(', ', $quotedMrCodes);

            //Check if 
            $response["success"] = FALSE;
            $response["reason"] = "ยังมีรายการขอเบิกค้างอยู่:\n{$LeftOverMR}";
            echo json_encode($response);
            $conn->close();
            exit;
        } else {
            $deleteRequistedSql = "DELETE FROM inven_requisted WHERE fk_job_id = ? AND `status` = 'On hold';";
            $stmt = $conn->prepare($deleteRequistedSql);
            $stmt->bind_param("i", $AlljobId);
            $stmt->execute();
            $stmt->close();

            $updateSql = "UPDATE fix_job SET eng_reason = ?, eng_solution = ?, eng_person_confirmed = ?, eng_finished_time = NOW(),fk_fix_type =?, `status`='done' WHERE id = ?";
            $stmt2 = $conn->prepare($updateSql);
            $stmt2->bind_param("ssiii", $reasonDescription, $maintenanceDescription, $engPersonConfirmed, $selectedOption, $jobId);
            $stmt2->execute();
            $stmt2->close();
            mysqli_query($conn, "UPDATE fix_job
        SET
            time_total_down = IF(TIME_TO_SEC(TIMEDIFF(eng_finished_time, inform_date)) > TIME_TO_SEC('838:59:59'), '838:59:59', TIMEDIFF(eng_finished_time, inform_date)),
            time_fix_time = IF(TIME_TO_SEC(TIMEDIFF(eng_finished_time, eng_start_time)) > TIME_TO_SEC('838:59:59'), '838:59:59', TIMEDIFF(eng_finished_time, eng_start_time))
        WHERE id = {$jobId};");
            $response["success"] = True;
            $response["reason"] = '';
            echo json_encode($response);
            $conn->close();
            exit;
        }
    } elseif ($selectedOption === '2' || $selectedOption === '3') {

        if(count($Mrcodess)>0){


        $placeholders = implode(',', array_fill(0, count($Mrcodess), '?'));

        $deleteCartSql = "DELETE FROM inven_requisted_cart WHERE fk_requisted_code IN ({$placeholders}) AND `status` != 'Issued';";
        $stmt = $conn->prepare($deleteCartSql);

        // Bind parameters dynamically
        $bindParams = str_repeat('s', count($Mrcodess)); // Assuming $Mrcodess contains strings
        $stmt->bind_param($bindParams, ...$Mrcodess); // Using the splat operator to pass array values as arguments

        $stmt->execute();
        $stmt->close();

        $quotedMrCodes = array_map(function ($item) {
            return "'" . $item . "'";
        }, $Mrcodess);


        $Mrcodess_str = implode(',', $quotedMrCodes);

        $Result = mysqli_query($conn, "SELECT * FROM inven_requisted_cart WHERE fk_requisted_code IN ({$Mrcodess_str});");
        if (mysqli_num_rows($Result) > 0) {
            // Still have issued items in the cart after Validating -> set the main table to Issued
            //mysqli_query($conn,"UPDATE inven_requisted SET `status` = 'Issued' WHERE mr_code IN ({$Mrcodess_str});");
            mysqli_query($conn, "UPDATE inven_requisted
            LEFT JOIN inven_requisted_cart ON inven_requisted.mr_code = inven_requisted_cart.fk_requisted_code
            SET inven_requisted.status = 'Issued'
            WHERE inven_requisted.mr_code IN ({$Mrcodess_str})
            AND inven_requisted_cart.status IS NOT NULL;");
        }
    }

        // Delete records in inven_requisted related to jobId
        $deleteRequistedSql = "DELETE FROM inven_requisted WHERE fk_job_id = ? AND `status` != 'Issued';";
        $stmt = $conn->prepare($deleteRequistedSql);
        $stmt->bind_param("i", $AlljobId);
        $stmt->execute();
        $stmt->close();

        $updateSql = "UPDATE fix_job SET eng_reason = ?, eng_solution = ?, eng_person_confirmed = ?, eng_finished_time = NOW(),fk_fix_type =?, `status`='done' WHERE id = ?";
        $stmt3 = $conn->prepare($updateSql);
        $stmt3->bind_param("ssiii", $reasonDescription, $maintenanceDescription, $engPersonConfirmed, $selectedOption, $jobId);
        $stmt3->execute();
        $stmt3->close();
        mysqli_query($conn, "UPDATE fix_job
        SET
            time_total_down = IF(TIME_TO_SEC(TIMEDIFF(eng_finished_time, inform_date)) > TIME_TO_SEC('838:59:59'), '838:59:59', TIMEDIFF(eng_finished_time, inform_date)),
            time_fix_time = IF(TIME_TO_SEC(TIMEDIFF(eng_finished_time, eng_start_time)) > TIME_TO_SEC('838:59:59'), '838:59:59', TIMEDIFF(eng_finished_time, eng_start_time))
        WHERE id = {$jobId};");
        $response["success"] = True;
        $response["reason"] = '';
        echo json_encode($response);
        $conn->close();
        exit;
    }

    // Close the database connection
    $conn->close();
} else {
    // If the request method is not POST, return an error message
    $response["success"] = false;
    $response["reason"] = 'Invalid Request Method';
    echo json_encode($response);
    return;
}
