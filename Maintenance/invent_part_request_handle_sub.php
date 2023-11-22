<?php
require '../connection.php';
session_start();

if (!isset($_SESSION['usid'])) {
    header("refresh:0; url=../logout.php");
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the posted data
    $partData = isset($_POST['partData']) ? $_POST['partData'] : array();
    $mrCode= mysqli_real_escape_string($conn,$_POST['mr_code']);
    $req_eng = $_SESSION['usid'];

    if(mysqli_num_rows(mysqli_query($conn,"SELECT * FROM inven_requisted_cart WHERE fk_requisted_code = '{$mrCode}';")) > 0){
        mysqli_query($conn,"UPDATE inven_requisted SET `status` = 'Wait for review', submit_date = NOW() WHERE mr_code = '{$mrCode}';");
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