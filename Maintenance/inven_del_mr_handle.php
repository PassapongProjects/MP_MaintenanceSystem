<?php
require '../connection.php';

if(isset($_POST['delete']) && $_POST['delete'] ){
    $response['status']="NG";
    if(!isset($_POST['mr_val']) || trim($_POST['mr_val']) ==""){// Handle MR_Val Not set
        $response['status']="NG";
        echo json_encode($response); 
        exit;
    }else{
        $del_mr_code = $_POST['mr_val'];
        $del_mr_code = mysqli_real_escape_string($conn,$del_mr_code);

        // Check if any issued part related to this mr-code

        $sql = "SELECT
	part.id AS part_id,
	part.name AS part_name,
	part.spec AS part_spec,
	part.instock AS instock,
	part.unit AS unit,
	inven_requisted_cart.req_quan AS req_quan,
	inven_requisted_cart.status AS req_status
FROM (inven_requisted
	INNER JOIN (inven_requisted_cart
		INNER JOIN part ON inven_requisted_cart.fk_part_id = part.id) ON inven_requisted.mr_code = inven_requisted_cart.fk_requisted_code)
    WHERE inven_requisted_cart.status = 'Issued' AND inven_requisted.mr_code = '{$del_mr_code}';";

$result = mysqli_query($conn, $sql);

// Check if the query was successful
if ($result) {
    // Initialize a variable to store the HTML representation of added parts
    if(mysqli_num_rows($result) > 0){ 
        $response['status']="NG";
        echo json_encode($response); 
        $conn->close();
        exit;

    }else{
        mysqli_query($conn,"DELETE FROM inven_requisted_cart WHERE fk_requisted_code = '{$del_mr_code}';");
        mysqli_query($conn,"DELETE FROM inven_requisted WHERE mr_code = '{$del_mr_code}';");
        $response['status']="GO";
        echo json_encode($response); 
        $conn->close();
        exit;
    }
}

    }
     

    







}


?>