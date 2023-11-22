<?php

use function PHPSTORM_META\type;

require '../connection.php';
session_start();
// if ( !isset($_SESSION['usid']) || !($_SESSION['departmentCode'] == 2 || $_SESSION['departmentCode'] == 6)){
//     header("Location: ../logout.php");
//     exit;
// }

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    function generate_itmCode($prefix, $maxLength)
    {
        // Max length should be set at 60 characters
        if (strlen($prefix) >= $maxLength) {
            throw new Exception("Prefix is longer than the maximum length.");
        }

        $uniquePart = substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, $maxLength - strlen($prefix));
        $uniqueString = $prefix . $uniquePart;

        return $uniqueString;
    }


 $prCode = $_POST['prCode']?? false;
 $itm_code = strtolower($_POST['itmCode']??"null") == "null"? null: $_POST['itmCode'];
 $part_id = $_POST['part_id']?? false;
 $req_quan = $_POST['req_quan'] ?? false;
 $info_field = $_POST['info_field'] ?? "-";
 $images = $_FILES;
 foreach ($_POST as $key => $value) {
    if (strpos($key, 'img_') === 0) {
        // If the key starts with 'img_', add it to the merged array
        $images[$key] = $value;
    }
}


 $pr_state_check_query = "SELECT `status` AS pr_status FROM prequest_form WHERE pr_code = ?";


 try {
     $conn->begin_transaction();
     $pr_state_check_stmt = $conn->prepare($pr_state_check_query);
     $pr_state_check_stmt->bind_param("s",$prCode);
 if($pr_state_check_stmt->execute()) {
     $pr_state_check_result = $pr_state_check_stmt->get_result();
     $status = mysqli_fetch_array($pr_state_check_result)[0];

     if ($status != 0 && $status != 1){
         throw new Exception("Invalid Pr Status");
     }
 }else {
     throw new Exception("Code Check Query Error");
 }

 // Valid Status

 if(is_null($itm_code)){
     // Insert
     $itm_code = generate_itmCode('itm',60);
     $query = "INSERT INTO prequest_items (`itm_code`,fk_part_id,fk_pr_code,req_quan,`status`,`note`) VALUES (?,?,?,?,?,?);";
     $stmt = $conn->prepare($query);
     $stmt->bind_param("sisdis",$itm_code,$part_id,$prCode,$req_quan,$status,$info_field); // Insert new item As the same status as the pr form


 }else {
     // Update
     $query = "UPDATE prequest_items SET `req_quan` = ?, `note` = ? WHERE `itm_code` = ? AND fk_pr_code = ?;"; // Part id is not changable
     $stmt = $conn->prepare($query);
     $stmt->bind_param("dsss",$req_quan,$info_field,$itm_code,$prCode); // Insert new item As the same status as the pr form
 }

 if($stmt->execute()){

     $stmt->close();
     // Check if any img sent
     if(count($images) !== 0) {

         $sent_img_uq_id = [];

         $img_order = 1;
         foreach ($images as $fileKey => $file) { 
             $sent_img_uq_id[] = $fileKey;
         }
         $img_uq_id_text = implode(",",array_map(function($item) {
            return "'" . $item . "'";
        },$sent_img_uq_id));
         
         $img_clear_query = "DELETE FROM prequest_img WHERE `fk_req_item_id` = ? AND `img_uq_id` NOT IN ({$img_uq_id_text});";
         $img_clear_stmt = $conn->prepare($img_clear_query);
         $img_clear_stmt->bind_param("s",$itm_code);
         
         if(!$img_clear_stmt->execute()){
             throw new Exception("Image Cleaning Error");
         }
         $img_clear_stmt->close();

         $img_remaining_query = "SELECT `img_uq_id` AS img_uq_id FROM prequest_img WHERE `fk_req_item_id` = ?;";
         $img_remaining_stmt = $conn->prepare($img_remaining_query);
         $img_remaining_stmt->bind_param("s",$itm_code);
         $remaining_img = [];
         if($img_remaining_stmt->execute()){
            $img_remaining_result = $img_remaining_stmt->get_result();
            if($img_remaining_result->num_rows >0) {
                while($res = $img_remaining_result->fetch_array()){
                    
                    $remaining_img[] = $res[0];
                }
            }
            $img_remaining_stmt->close();
         }else {
            throw new Exception("Image Remaining Check Error");
         }

         foreach ($sent_img_uq_id as $fileKey) {
            
             if(in_array($fileKey,$remaining_img)){
                
                continue;
             }
             
             $file = $images[$fileKey];
             $current_date = strval(date("ymd"));
             $fileName = $file['name'];
             $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
             $fileType = $file['type'];
             $fileData = file_get_contents($file['tmp_name']); // Assuming it's a valid file path
     
             // Generate a unique filename and hash it
             $uniqueFilename = "{$prCode}#{$img_order}-{$current_date}-". $fileExtension;
     
             // Prepare and execute SQL insert statement
             $insertQuery = "INSERT INTO prequest_img (`img_uq_id`,`name`, img_ext, img_type, fk_req_item_id,img_data) VALUES (?, ?, ?, ?, ?, ?)";
             $stmt = $conn->prepare($insertQuery);
             $null = null; // NULL value for img_data
     
             $stmt->bind_param('sssssb', $fileKey,$uniqueFilename, $fileExtension, $fileType,$itm_code, $null);
     
             if (!($stmt->send_long_data(5, $fileData) && $stmt->execute())) {
                 throw new Exception("Image Query Error");
             } 
     
             $stmt->close();
             $img_order ++;
         }
         

     }else {
         // No uploaded Image / All uploaded img has been deleted
         $img_clear_query = "DELETE FROM prequest_img WHERE `fk_req_item_id` = ?;";

         $img_clear_stmt = $conn->prepare($img_clear_query);
        $img_clear_stmt->bind_param("s",$itm_code);
         if(!$img_clear_stmt->execute()){
             throw new Exception("Image Cleaning Error");
         }
     }

     // This section means all checks and queries are passed/

     $conn->commit();
     $response['status'] = true;
     echo json_encode($response);


 }else {
     throw new Exception("Insert/Update Query Error");
 }


} catch (Exception $e) {
 $conn->rollback();
 $response['status'] = false;
 $response['err'] = $e->getMessage();
 echo json_encode($response);
}




}
