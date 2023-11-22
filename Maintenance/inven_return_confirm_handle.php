<?php
require '../connection.php';
session_start();
if(!isset($_SESSION['usid'])) {header("refresh:0; url=../logout.php"); exit;}
if(!isset($_POST['mrcode']) || !isset($_POST['partid']) || !isset($_POST['returnQuantity'])){return;}


$mrcode = mysqli_real_escape_string($conn,$_POST['mrcode']);
$partid = mysqli_real_escape_string($conn,$_POST['partid']);
$return_quan = $_POST['returnQuantity'];
$return_eng = $_SESSION['usid'];



$query ="INSERT INTO inven_transactions (fk_mrcode,fk_partid,t_type,t_quan,t_dt,t_actor,old_quantity,new_quantity) VALUES (?,?,'return',?,NOW(),?,(SELECT `real_instock` FROM `part` WHERE `id` = ?),(SELECT `real_instock` + ? FROM `part` WHERE `id` = ?));";
$stmt = $conn->prepare($query);
$stmt->bind_param("sidiidi", $mrcode,$partid,$return_quan,$return_eng,$partid,$return_quan,$partid);

if ($stmt->execute() === true){
    //UPDATE RETURNABLE
    $stmt1 = $conn->prepare("UPDATE inven_requisted_cart SET `returnable_quan` = `returnable_quan` - ? WHERE fk_requisted_code = ? AND fk_part_id = ?;");
    $stmt1->bind_param("dsi", $return_quan,$mrcode,$partid);
    $stmt1->execute();


    // UPDATE AVAILABILITY AND REAL
    $updatepart = "UPDATE part SET `real_instock` = `real_instock` + ?, `instock` = `instock` + ? WHERE `id` = ?;";
    $stmt2 = $conn->prepare($updatepart);
    $stmt2->bind_param("ddi", $return_quan,$return_quan,$partid);
    $stmt2->execute();

    echo "success";
}else {echo "fail";}

$stmt->close();
$stmt1->close();
$stmt2->close();
$conn->close();
?>