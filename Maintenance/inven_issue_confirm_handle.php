<?php
require '../connection.php';
session_start();
if(!isset($_SESSION['usid'])) {return;}
if(!isset($_POST['mrcode']) || !isset($_POST['partid']) || !isset($_POST['issuedQuantity']) || !isset($_POST['req_quan'])){return;}

// Update status inven req cart // Decrease real quantity in stock -> Check if all items in the cart are issued or not --> update status of the mrcode

// Update status inven req cart

$mrcode = mysqli_real_escape_string($conn,$_POST['mrcode']);
$partid = mysqli_real_escape_string($conn,$_POST['partid']);
$issued_quan = $_POST['issuedQuantity'];
$issued_eng = $_SESSION['usid'];
$req_quan = $_POST['req_quan'];

// $unitPrice = $_POST['unitPrice'];
$unitPrice = mysqli_fetch_array(mysqli_query($conn,"SELECT avg_value FROM part WHERE id = {$partid};"))[0];
$query = "UPDATE inven_requisted_cart SET issued_quan = ?, value_per_qt = ?, issued_time = NOW(), issued_eng = ?, `status` = 'Issued', `returnable_quan` = ? WHERE fk_requisted_code = ? AND fk_part_id = ?;";
$stmt = $conn->prepare($query);
$stmt->bind_param("ddidsi", $issued_quan, $unitPrice, $issued_eng, $issued_quan, $mrcode, $partid);

if($stmt->execute() !== false){ // Executed
    //transaction history
    $query ="INSERT INTO inven_transactions (fk_mrcode,fk_partid,t_type,t_quan,t_dt,t_actor,old_quantity,new_quantity) VALUES (?,?,'issue',?,NOW(),?,(SELECT `real_instock` FROM `part` WHERE `id` = ?),(SELECT `real_instock` - ? FROM `part` WHERE `id` = ?));";
    $stmt3 = $conn->prepare($query);
    $stmt3->bind_param("sidiidi", $mrcode,$partid,$issued_quan,$issued_eng,$partid,$issued_quan,$partid);
    $stmt3->execute();


// Decrease real quantity in stock
// -> Real quantity -= issued quantity
// -> Avail += (req_quan - issued_quan)
    $updatepart = "UPDATE part SET `real_instock` = `real_instock` - ?, `instock` = `instock` + (? - ?) WHERE `id` = ?;";
    $stmt2 = $conn->prepare($updatepart);
    $stmt2->bind_param("dddi", $issued_quan, $req_quan,$issued_quan,$partid);
    $stmt2->execute();
}

// Check the cart items' status

if(mysqli_num_rows(mysqli_query($conn,"SELECT * FROM inven_requisted_cart WHERE fk_requisted_code = '{$mrcode}' AND `status` = 'Waiting for approval';")) > 0){
    // Still have waiting items
    return;
}else{
    // All items are issued.
    mysqli_query($conn,"UPDATE inven_requisted SET `status` = 'Issued' WHERE mr_code = '{$mrcode}';");
}

$stmt->close();
$stmt2->close();
$conn->close();
