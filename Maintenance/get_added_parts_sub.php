<?php
// Include your database connection file (e.g., connection.php)
require '../connection.php';
// Assuming you have the job ID available from the client-side

//same things as main just changed the query from main to sub to specify this mr
if (isset($_GET['mr_code'])) {
    //$AlljobId = $_GET['jobId'];
    //$mrPrio = $_GET['mrprio'];
    // Sanitize the job ID to prevent SQL injection
    //$AlljobId = mysqli_real_escape_string($conn, $AlljobId);
    $mrcode = mysqli_real_escape_string($conn,$_GET['mr_code']);


    // SQL query to retrieve the added parts for the given job ID
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
    WHERE inven_requisted.mr_code = '{$mrcode}';";

    // Execute the query
    $result = mysqli_query($conn, $sql);

    // Check if the query was successful
    if ($result) {
        // Initialize a variable to store the HTML representation of added parts
        if(mysqli_num_rows($result) > 0){
        $addedPartsHTML = '<table class="table added-parts-table">
        <thead>
        <tr>
            <th>เลขอะไหล่</th>
            <th>ชื่ออะไหล่</th>
            <th>สเปคอะไหล่</th>
            <th>จำนวนใช้</th>
            <th>หน่วย</th>
            <th>Action</th>
        </tr>
    </thead>
        <tbody>';

        // Loop through the result set and generate the HTML
        while ($row = mysqli_fetch_assoc($result)) {
            // You can customize the HTML structure to match your needs
            $partId = $row['part_id'];
            $partName = $row['part_name'];
            $partSpec = $row['part_spec'];
            $partInstock = $row['instock'];
            $partUnit = $row['unit'];
            //$mrCODE = $row['mrCODE'];
            $requested_quan = $row['req_quan'];
            $status = $row['req_status'];
            // Add the HTML for the current added part to the $addedPartsHTML variable
            $addedPartsHTML .= "
            <tr class='added-part-item'>
            <input type='hidden' value='{$partInstock}' id='p{$partId}-instock'>
            <td>{$partId}</td>
            <td>{$partName}</td>
            <td>{$partSpec}</td>
            ";
            if($status != 'On hold'){
                $addedPartsHTML .= "<td style='width: 10%;'><input type='text' value ='{$requested_quan}' name='p{$partId}-requiredquan' id='p{$partId}-requiredquan' class='form-control form-control-sm added-p-req' data-instock='{$partInstock}' data-status='done' readonly></td>";
                $addedPartsHTML .="<td>{$partUnit}</td>
            <td>{$status}</td>
        </tr>
            ";
            }else{
            $addedPartsHTML .= "<td style='width: 10%;'><input type='text' value ='' name='p{$partId}-requiredquan' id='p{$partId}-requiredquan' class='form-control form-control-sm added-p-req' data-instock='{$partInstock}' data-status='hold' required></td>";
            $addedPartsHTML .="<td>{$partUnit}</td>
            <td><button type='button' class='btn btn-danger btn-sm remove-part-btn' data-partid='{$partId}' data-mrCode='{$mrcode}''>ลบ</button></td>
        </tr>
            ";}
            
            
        }
        $addedPartsHTML .= '  </tbody>
        </table>';

        // Return the HTML representation of added parts
        echo $addedPartsHTML;
    }
    else echo("<label id='no-req-label'>ไม่มีการเบิกอะไหล่</label>");
    } else {
        // Query error
        echo "Error retrieving added parts: " . mysqli_error($conn);
    }
} else {
    // If job ID is not provided
    echo "Invalid request: MR-CODE not provided.";
}

// Close the database connection
mysqli_close($conn);
?>
