<?php
require '../connection.php';
            $stmt = "SELECT
            inven_requisted.mr_code AS mr_code,
            job_all.fk_pm_no AS pm_code,
            job_all.fk_fix_no AS fix_code,
            inven_requisted.status AS status,
            inven_requisted.submit_date AS submit_date,
            job_all.job_type AS job_type
        FROM inven_requisted
        INNER JOIN job_all ON fk_job_id = job_all.id WHERE inven_requisted.status != 'On hold'ORDER BY submit_date DESC, status DESC;";
        $result = mysqli_query($conn, $stmt);

        // Check if the query was successful
        if ($result) {
            $data = array();
            while ($row = mysqli_fetch_assoc($result)) {
                $data[] = $row;
            }
            echo json_encode($data); // Return the JSON-encoded data
        } else {
            echo json_encode(array('error' => 'Query failed')); // Return an error JSON
        }
        
        // Close the database connection
        
        mysqli_close($conn);

            // $result = mysqli_query($conn,$stmt);
            // if(mysqli_num_rows($result) > 0){
            //     $queryResult = json_encode($result);
            //     //Table
            //     echo '<table class="table">';
            //     echo '<thead>';
            //     echo '<tr>';
            //     echo '<th>รหัสรายการเบิก</th>';
            //     echo '<th>รหัสงาน</th>';
            //     echo '<th>ประเภท</th>';
            //     echo '<th>วันขอเบิก</th>';
            //     echo '<th>สถานะ</th>';
            //     echo '<th>ดำเนินการ</th>';
            //     echo '</tr>';
            //     echo '</thead>';
            //     echo '<tbody>';
                
            //     while ($row = $result->fetch_assoc()) {
            //         echo '<tr>';
            //         echo '<td>' . $row['mr_code'] . '</td>';
            //         echo '<td>' . $row['fix_code'] . '</td>';
            //         echo '<td>' . $row['job_type']. '</td>';
            //         echo '<td>' . $row['submit_date'] . '</td>';
            //         echo '<td>' . $row['status'] . '</td>';
            //         echo '<td><button class="operation-button" data-mrcode="' . $row['mr_code'] . '">Operation</button></td>';
            //         echo '</tr>';
            //     }
                
            //     echo '</tbody>';
            //     echo '</table>';
            // }else {
            //     echo("ไม่มีรายการเบิกอะไหล่");

            // }

            
?>