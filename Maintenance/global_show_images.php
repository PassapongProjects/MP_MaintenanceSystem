<?php
require "../connection.php";
session_start();
if(!isset($_SESSION['user'])) {header("refresh:0; url=../logout.php"); exit;}

if (isset($_GET['image_id']) && isset($_GET['fk_itmCode'])) {
    $imageId = $_GET['image_id'];
    $fk_itmCode = $_GET['fk_itmCode'];
    // Retrieve the image data from the database
    $sql = "SELECT img_data AS img_data, img_type AS img_type, `fk_req_item_id` AS fk_itm_id FROM prequest_img WHERE img_uq_id = ? LIMIT 1;";

    try {

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s",$imageId);
    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows > 0) {

        $row = $result->fetch_assoc();

        $fetched_itm_code = $row['fk_itm_id'];

        if ($fetched_itm_code != $fk_itmCode) {
            throw new Exception("ItemCode not matched");
        }

        $imageData = $row['img_data'];
        $imageType = $row['img_type'];

        // Set appropriate headers for the image
        header("Content-type: $imageType");
        header("Content-disposition: inline; filename=image.$imageType");

        // Output the image data to the browser
        echo $imageData;
    } else {
        // Handle the case where the image is not found
        throw new Exception("Error.");
    }
} 
catch (Exception $e) {
    echo "Error";
    $conn->close();
    exit;
   
}

}else {
    // Handle the case where the image ID is not provided
    echo 'Please provide an image ID.';
}
// Close the database connection
?>
