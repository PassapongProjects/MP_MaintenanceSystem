<?php
require '../connection.php';
// Check last execution -> IF this month's task has been executed, go to welcome. If not proceed the execution. (Check for 30 days interval)

$check_query = "SELECT
IFNULL(DATEDIFF(NOW(), (
            SELECT
                exe_time FROM stock_execution_log
            ORDER BY
                exe_time DESC
            LIMIT 1)), 999) AS daydiff;";

try {
    $check_result = $conn->query($check_query);

    $last_time_diff = ($check_result->fetch_assoc())['daydiff'];

    if ($last_time_diff > 30) {
        // New Interval

        $conn->query("
        DROP FUNCTION IF EXISTS CalculateSSForPart;");
        
        $conn->query("
        CREATE FUNCTION CalculateSSForPart (part_id INT)
	RETURNS INT
BEGIN
DECLARE
	current_part_id INT;
DECLARE
	recomm_ss INT;
	-- Set the @current_part_id variable to the provided part_id
	SET current_part_id = part_id;
	SET @current_part_id = current_part_id;
	-- Calculate the result for the specific part_id
	-- You can perform your calculations and return or store the result here
	-- For example, SELECT ... INTO result_variable FROM ...;
	SET @history_year := 3;
	-- set past yearts
	SET @minLT := 3;
	-- set estimated min l/t (if too many It might not generate approprite data (the less the number is, the slower query might get))
	WITH RECURSIVE part_lt AS (
		SELECT
			pr_items.fk_part_id AS part_id,
			CEIL(AVG(DATEDIFF(pr_items.gr_done_date,
						pr_form.approved_date))) AS avg_lt
		FROM
			prequest_form AS pr_form
		LEFT JOIN prequest_items AS pr_items ON pr_form.pr_code = pr_items.fk_pr_code
	WHERE
		pr_items.status = 4
		AND pr_form.approved_date BETWEEN DATE_SUB(NOW(),
			INTERVAL @history_year YEAR)
		AND NOW()
	GROUP BY
		pr_items.fk_part_id
	ORDER BY
		pr_items.fk_part_id ASC
),
num_intervals AS (
	SELECT
		1 AS n
	UNION ALL
	SELECT
		n + 1
	FROM
		num_intervals
	WHERE
		n < CEIL((365 * 3) / @minLT) -- Minimum LT Approximated at 3 days
),
part_demand AS (
SELECT
	all_part_demand.part_id AS part_id,
	all_part_demand.demanded_date AS demanded_date,
	IFNULL(all_part_demand.demanded_volumne, 0) AS demanded_volumne,
	all_part_demand.issue_status
FROM (
	SELECT
		part.id AS part_id,
		IFNULL(DATE_FORMAT(iv_cart.req_time, '%Y-%m-%d'),DATE_FORMAT(NOW(),'%Y-%m-%d')) AS 					demanded_date,
		iv_cart.returnable_quan AS demanded_volumne,
		IFNULL(iv_cart.status,'Issued') AS issue_status
	FROM
		inven_requisted_cart AS iv_cart
	RIGHT JOIN part ON part.id = iv_cart.fk_part_id
	) AS all_part_demand
	WHERE all_part_demand.issue_status = 'Issued' AND all_part_demand.demanded_date BETWEEN DATE_SUB(NOW(), INTERVAL @history_year YEAR)
	AND DATE_ADD(NOW(),INTERVAL 1 DAY)
	ORDER BY all_part_demand.part_id ASC, demanded_date DESC
	
),
date_range AS (
	SELECT
		DATE_FORMAT(DATE_SUB(NOW(),
				INTERVAL @history_year YEAR),
			'%Y-%m-%d') AS start_date,
		DATE_FORMAT(NOW(),
			'%Y-%m-%d') AS end_date
	GROUP BY
		end_date
),
part_lt_demand AS (
	SELECT
		part_lt.part_id AS part_id,
		part_lt.avg_lt AS avg_lt,
		part_demand.demanded_date AS demanded_date,
		part_demand.demanded_volumne AS demanded_volumne
	FROM
		part_lt
		INNER JOIN part_demand ON part_lt.part_id = part_demand.part_id
	ORDER BY
		part_lt.part_id
),
interval_query AS (
	SELECT
		sub_interval_query.interval_start AS interval_start,
		sub_interval_query.interval_end AS interval_end
	FROM (
		SELECT
			@wow := @wow + 1 AS interval_number,
			DATE_ADD(date_range.start_date,
				INTERVAL(@wow - 1) * @duration DAY) AS interval_start,
			DATE_ADD(date_range.start_date,
				INTERVAL @wow * @duration DAY) AS interval_end,
			@duration AS avg_lt
		FROM (
			SELECT
				@wow := 0) AS init,
			(
				SELECT
					@duration := (
						SELECT
							part_lt.avg_lt
						FROM
							part_lt
						WHERE
							part_lt.part_id = @current_part_id)) AS duration_init,
					date_range AS date_range,
					num_intervals AS num_intervals
				WHERE
					DATE_ADD(date_range.start_date,
						INTERVAL(@wow - 1) * @duration DAY) <= date_range.end_date
						) AS sub_interval_query
						WHERE sub_interval_query.interval_end <= NOW()
),
ss_ready_table AS (
	SELECT
    @current_part_id AS part_id,
    IFNULL(
        CASE 
            WHEN prepare_for_ss_cal.n > 0 THEN
                CEIL(
                    prepare_for_ss_cal.avg_demand +
                    (
                        SELECT t_score_table.ci90
                        FROM t_score_table
                        ORDER BY ABS(t_score_table.df - prepare_for_ss_cal.n)
                        LIMIT 1
                    ) * 
                    (
                        CASE 
                            WHEN prepare_for_ss_cal.stddev_demand = 0 OR prepare_for_ss_cal.n = 0 THEN 0
                            ELSE prepare_for_ss_cal.stddev_demand / SQRT(prepare_for_ss_cal.n)
                        END
                    )
                )
            ELSE 0 
        END,
        0
    ) AS recommended_ss
	FROM (
		SELECT
			IFNULL(AVG(sum_interval_query.sum_demand_in_interval),
				0) AS avg_demand,
			IFNULL(STDDEV_POP(sum_interval_query.sum_demand_in_interval),
				0) AS stddev_demand,
			COUNT(sum_interval_query.sum_demand_in_interval) AS n
		FROM (
			SELECT
				@current_part_id AS part_id,
				itv_q.interval_start AS interval_start,
				itv_q.interval_end AS interval_end,
				IFNULL(SUM(part_demand.demanded_volumne),
					0) AS sum_demand_in_interval,
				IFNULL(COUNT(part_demand.demanded_volumne),
					0) AS count_demand_in_interval
			FROM
				interval_query AS itv_q
			LEFT JOIN part_demand ON part_demand.demanded_date >= itv_q.interval_start
				AND part_demand.demanded_date <= itv_q.interval_end
				AND part_demand.part_id = @current_part_id
				
				GROUP BY
					itv_q.interval_start,
					itv_q.interval_end) AS sum_interval_query
		WHERE
			sum_interval_query.sum_demand_in_interval != 0) AS prepare_for_ss_cal
)
SELECT
	ss_ready_table.recommended_ss INTO recomm_ss
FROM
	ss_ready_table;
	RETURN recomm_ss;
END;");

        // $conn->query($delimer_init);

        $conn->query("SET @history_year := 3;");
        $conn->query("SET @minLT := 3;");

        $update_ss_query = "WITH part_lt AS (
            SELECT
                pr_items.fk_part_id AS part_id,
                CEIL(AVG(DATEDIFF(pr_items.gr_done_date,
                            pr_form.approved_date))) AS avg_lt
            FROM
                prequest_form AS pr_form
            LEFT JOIN prequest_items AS pr_items ON pr_form.pr_code = pr_items.fk_pr_code
        WHERE
            pr_items.status = 4
            AND pr_form.approved_date BETWEEN DATE_SUB(NOW(),
                INTERVAL @history_year YEAR)
            AND NOW()
        GROUP BY
            pr_items.fk_part_id
        ORDER BY
            pr_items.fk_part_id ASC
    )
    UPDATE part JOIN (SELECT part.id AS part_id, CalculateSSForPart(part.id) AS recommended_safety_stock, IFNULL(part_lt.avg_lt,0) AS avg_lt FROM part LEFT JOIN part_lt ON part_lt.part_id = part.id WHERE part.auto_update_ss = 1) AS temp_prepare_part_ss ON temp_prepare_part_ss.part_id = part.id SET part.safety_stock = temp_prepare_part_ss.recommended_safety_stock;";


        $conn->query($update_ss_query);

        $conn->query("INSERT INTO stock_execution_log (exe_time) VALUES (NOW());");

        



        $response['status'] = true;
        $response['err'] = "";


    }else {
        throw new Exception("Less than 30 days");
    }
    // Do nothing


} catch (Exception $e) {
    // Do nothing
    $response['err'] = $e->getMessage();
    $response['status'] = false;
}


echo json_encode($response);
$conn->close();
exit;
