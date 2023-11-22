$(document).ready(function () {


    function init_navAndLoad() {
        $('body').prepend('<div id="nav-container"></div>');

        $.get({ url: '../global_res/global_sidebar_EN.html' }, function (htmlContent) {
            $('#nav-container').html(htmlContent);
            $.get({ url: '../style/global_sidebar.css' }, function (cssContent) {
                $('<style>').attr('type', 'text/css').html(cssContent).appendTo('head');

                let $els = $('.menu a, .menu header');
                let count = $els.length;
                let grouplength = Math.ceil(count / 3);
                let groupNumber = 0;
                let i = 1;
                $('.menu').css('--count', count + '');
                $els.each(function (j) {
                    if (i > grouplength) {
                        groupNumber++;
                        i = 1;
                    }
                    $(this).attr('data-group', groupNumber);
                    i++;
                });

                $('#nav-container').on('click', '.menu footer button', function (e) {
                    e.preventDefault();
                    $els.each(function (j) {
                        $(this).css('--top', $(this)[0].getBoundingClientRect().top + ($(this).attr('data-group') * -15) - 20);
                        $(this).css('--delay-in', j * .1 + 's');
                        $(this).css('--delay-out', (count - j) * .1 + 's');
                    });
                    $('.menu').toggleClass('closed');
                    e.stopPropagation();
                });

                // run animation once at beginning for demo



            });
        });

        function addLoadingCSS() {
            // Define your custom CSS rules
            $body = $("body");
            var customCSS = `
                .modal {
                    display: none;
                    position: fixed;
                    z-index: 1000;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 100%;
                    background: rgba(114, 114, 114, 0.8) url('https://i.stack.imgur.com/FhHRx.gif') 50% 50% no-repeat;
                }
        
                body.loading .modal {
                    overflow: hidden;
                }
        
                body.loading .modal {
                    display: block;
                }
            `;
            // Create a <style> element and append the CSS rules
            $('<style>')
                .attr('type', 'text/css')
                .html(customCSS)
                .appendTo('head');
            $body.append('<div class="modal"><!-- Place at bottom of page --></div>')
        }
        addLoadingCSS();
        $(document).on({
            ajaxStart: function () { $('body').addClass("loading"); },
            ajaxStop: function () { $('body').removeClass("loading"); }
        });

    }
    init_navAndLoad();


    async function loadGoogleCharts() {
        return new Promise((resolve, reject) => {
            google.charts.load('current', {
                'packages': ['corechart'],
                'callback': resolve // Resolve the promise when the callback is invoked
            });
        });
    }

    async function chartLoad() {
        try {
            await loadGoogleCharts();
            // Now you can work with Google Charts after they have been loaded
        } catch (error) {
            console.error('Error loading Google Charts:', error);
        }
    }

    chartLoad();



    function formatDateToThai(inputDate) {
        const parts = inputDate.split('-');
        if (parts.length !== 3) {
            return 'Invalid Date';
        }

        const year = parts[0];
        const month = parts[1];
        const day = parts[2];

        return `${day}/${month}/${year}`;
    }
    function formatTimeToThai(inputTime) {
        const parts = inputTime.split(':');
        if (parts.length !== 3) {
            return 'Invalid Time';
        }

        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);

        return `${hours} ชั่วโมง ${minutes} นาที`;
    }
    function goToJobManagementPage(jobid) {
        // Get the job object based on the jobNo
        // Create a form dynamically to submit the job data via POST method
        var form = document.createElement('form');
        form.method = 'POST';
        form.action = 'done_job_details.php' // Replace with the actual URL of the job management page

        // Create hidden input fields to pass the job data
        var jobIDInput = document.createElement('input');
        jobIDInput.type = 'hidden';
        jobIDInput.name = 'job_id';
        jobIDInput.value = jobid;
        form.appendChild(jobIDInput);
        // Append the form to the body and submit it
        document.body.appendChild(form);
        form.submit();
    }

    function generate_chart_element(safety_stock, part_data, figure_element) {
        let chart_element = new google.visualization.LineChart(figure_element[0]);

        chart_element.clearChart();
        // Create a data table
        let dataTable = new google.visualization.DataTable();
        dataTable.addColumn('date', 'Date', 'm-col');
        dataTable.addColumn('string', 'วันที่', 'formatDate');
        dataTable.addColumn('number', 'จำนวนคงเหลือในคลัง', 'count');
        dataTable.addColumn('number', 'Safety stock', 'ss_stock')

        let dataTableArray = [];

        // Iterate through your data and format the date
        part_data.forEach(function (item) {
            let datelabel = new Date(item.t_time);
            let formattedDate = datelabel.toLocaleDateString('en-GB'); // 'en-GB' for dd/mm/yyyy format

            let new_quan = item.new_quan;

            // Add the data point to the Google DataTable with the formatted date
            dataTableArray.push([datelabel, formattedDate, new_quan, safety_stock]);
        });

        dataTable.addRows(dataTableArray);

        let FilterData = new google.visualization.DataView(dataTable);


        FilterData.setColumns([FilterData.getColumnIndex('m-col'), FilterData.getColumnIndex('ss_stock'), FilterData.getColumnIndex('count')]);

        let option = {
            title: 'ระดับอะไหล่คงคลัง',
            legend: { position: 'bottom' },
            curveType: 'none',
            hAxis: {
                format: 'MMM d, y',
                slantedText: true,
                slantedTextAngle: 30,  // Enable slanted text to fit more dates
                maxAlternation: 1,  // Limit the number of alternate slanted labels
            },
            vAxis: {
                viewWindow: {
                    min: 0,
                }
            },
            pointSize: 3,
            explorer: {
                axis: 'horizontal',
                keepInBounds: true,
                maxZoomIn: 1,
                maxZoomOut: 1
            }, series: {
                0: {
                    pointSize: 0,
                    color: 'red',
                    visibleInLegend: true
                },
                1: {
                    color: 'blue',
                    visibleInLegend: true
                }

            }
        };





        chart_element.draw(FilterData, option);
        window.addEventListener('resize', () => {
            chart_element.draw(FilterData, option);
        });
    }


    


    // Function to populate select options based on the selected radio button
    function populateSelectOptions(type) {
        $('#filter_type_val').val(type);
        $.ajax({
            url: 'fetch_report_option.php', // Change this URL to your PHP file
            type: 'POST',
            data: {
                type: type,
                mode: "option_query"
            },
            success: function (response) {
                $('#selectOptions').html(response);
            }
        });
        $('#detail-container').html('');
        $('#after-option-selected-container').css('display', 'none');
    }
    function dateInput_init() {
        // Hide date range inputs initially
        $('#dateRangeInputs').hide();
        $('#startDate').attr('max', new Date().toISOString().split('T')[0]);
        $('#endDate').attr('max', new Date().toISOString().split('T')[0]);
        $('#endDate').val(new Date().toISOString().split('T')[0]);

        // Calculate one month ago
        var oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        // Set initial value of startDate to one month ago
        $('#startDate').val(oneMonthAgo.toISOString().split('T')[0]);
    }
    // Initial population of select options based on default radio button value
    populateSelectOptions($('input[name="filterType"]:checked').val());
    dateInput_init();

    flatpickr(".flatpickr", {
        altInput: true,
        altFormat: "j F Y",
        dateFormat: 'Y-m-d', // Date format (YYYY-MM-DD)
        maxDate: 'today',
        disableMobile: "true",
        onOpen: function (selectedDates, dateStr, instance) {
            // Get the IDs of the start and end date inputs
            const startDateInputId = "startDate";
            const endDateInputId = "endDate";

            // Get the selected dates from both inputs
            const startDate = $("#" + startDateInputId)[0].value;
            const endDate = $("#" + endDateInputId)[0].value;
            // Calculate the minimum and maximum dates for the current input
            let minDate = null;
            let maxDate = null;

            if (instance.input.id === startDateInputId) {
                // If the current input is the start date, set the minimum date for the end date
                minDate = null;
                maxDate = endDate; // Limit end date to today
            } else if (instance.input.id === endDateInputId) {
                // If the current input is the end date, set the minimum date for the start date
                minDate = startDate; // No minimum date for start date
                maxDate = 'today' // Maximum date is the selected end date
            }

            // Update the minDate and maxDate options for the current input
            instance.set("minDate", minDate);
            instance.set("maxDate", maxDate);
        }
    });

    $('.filterdate-input').on('change', function () {
        const dateRangeLabel = $('#between-date-text');
        let selected_mode = $('#filter_type_val').val();
        let selectedOptionValue = $('#selectOptions').val();
        let start_time = new Date($('#startDate').val());
        let end_time = new Date($('#endDate').val());
        let formattedStartDate = start_time.toISOString().split('T')[0]; // Converts to 'YYYY-MM-DD'
        let formattedEndDate = end_time.toISOString().split('T')[0]; // Converts to 'YYYY-MM-DD' 
        // $("#startDate")[0].max = formattedEndDate;
        // $("#endDate")[0].min = formattedStartDate;

        if (selected_mode == "machine") {
            dateRangeLabel.html(`ระหว่างวันที่ ${formatDateToThai(formattedStartDate)} ถึง ${formatDateToThai(formattedEndDate)}`);
            $.ajax({
                url: 'fetch_report_option.php',
                type: 'POST',
                data: {
                    mode: "job_query",
                    mc_id: selectedOptionValue,
                    d_mode: "BetweenTime",
                    start_time: formattedStartDate,
                    end_time: formattedEndDate,
                    type: $('#filter_type_val').val()
                },
                success: function (response) {
                    // Update the detail-container with the received data
                    $('#fix-statistic-container').html('');
                    $('#fix-statistic-container').html(response);
                    // Show the detail-container if it's hidden 
                }
            });

            machineCalInfo(selectedOptionValue, formattedStartDate, formattedEndDate);
        } else if (selected_mode == "part") {
            show_part_detail(formattedStartDate, formattedEndDate);

        } else {
            // Expect notthing here
        }

    });
    function nullOrUndefinedCheck(text) {
        return text == null ? 'ไม่มีข้อมูล' : text;
    }

    function isTimeFormat(stra) {

        let partscheck = stra.split(":");
        return partscheck.length === 3;
    }

    // Function to convert times in the object to Thai format
    function convertTimesInObject(obj) {
        return Object.keys(obj).reduce((result, key) => {
            if (isTimeFormat(obj[key])) {
                result[key] = convertTimeToThai(obj[key]);
            } else {
                result[key] = obj[key];
            }
            return result;
        }, {});
    }
    function convertTimeToThai(hhmmss) {

        let parts = hhmmss.split(":");

        if (parts.length === 3) {
            // Time Value
            let hours = parseInt(parts[0], 10);
            let minutes = parseInt(parts[1], 10);

            let timetext = hours + ' ชั่วโมง ' + minutes + ' นาที';

            return timetext;
        } else {
            let timetext = hhmmss;
            return timetext;
        }
    }


    function displayStatisticInformation(information) {

        const fix_count = $("#fixCount-span");
        const fix_downtime = $("#fixDownTime-span");
        const mtbf = $("#MTBF-span");
        const mttresponse = $("#MTTResponse-span");
        const mttreapir = $("#MTTRepair-span");
        const mttrecovery = $("#MTTRecovery-span");
        const pm_count = $("#pmCount-span");
        const pm_downtime = $("#pmDownTime-span");
        const total_downtime = $("#totalDownTime-span");

        if (information) {
            Object.keys(information).forEach(key => {
                information[key] = String(information[key]);
            });

            information = convertTimesInObject(information);

            fix_count.html(nullOrUndefinedCheck(information.fix_count));
            fix_downtime.html(nullOrUndefinedCheck(information.fix_totalDown));
            mtbf.html(nullOrUndefinedCheck(information.fix_MTBF));
            mttresponse.html(nullOrUndefinedCheck(information.fix_meanTimeInspect));
            mttreapir.html(nullOrUndefinedCheck(information.fix_meanTimeFix));
            mttrecovery.html(nullOrUndefinedCheck(information.fix_meanDownTime));
            pm_count.html(nullOrUndefinedCheck(information.pm_count));
            pm_downtime.html(nullOrUndefinedCheck(information.pm_meanPmTime));
            total_downtime.html(nullOrUndefinedCheck(information.total_downTime));
        }
        else {
            fix_count.html("ไม่มีข้อมูล");
            fix_downtime.html("ไม่มีข้อมูล");
            mtbf.html("ไม่มีข้อมูล");
            mttresponse.html("ไม่มีข้อมูล");
            mttreapir.html("ไม่มีข้อมูล");
            mttrecovery.html("ไม่มีข้อมูล");
            pm_count.html("ไม่มีข้อมูล");
            pm_downtime.html("ไม่มีข้อมูล");
            total_downtime.html("ไม่มีข้อมูล");
        }

    }


    function show_part_detail(start_time = null, end_time = null) {

        let selectedOptionValue = $('#selectOptions').val();
        let selected_type = $('#filter_type_val').val();

        const container = $('#after-option-selected-container');

        container.css('display', 'none');

        container.empty();

        const report_detail_cont = $('<div>').attr('id', 'report-detail-container');
        const detail_cont = $('<div>').attr('id', 'detail-container');
        const log_cont = $('<div>').attr('id', 'report-container');

        const part_figure_cont = $('<div>').attr('id', 'part_usage_figure_cont');
        const part_figure = $('<div>').attr('id', 'part_usage_figure');

        const log_table_cont = $('<div>').addClass('log-table-cont');
        const log_table = $('<table>').addClass('log-table').html(`
        <thead>
        <tr>
        <th>เวลา</th>
        <th>ประเภท</th>
        <th>จำนวน</th>
        <th>จำนวนเดิม</th>
        <th>จำนวนใหม่</th>
        <th>code.</th>
        </tr>
        </thead>
        `);
        const log_table_tbody = $('<tbody>');


        log_table.append(log_table_tbody);
        log_table_cont.append(log_table);
        log_cont.append($('<label>').addClass('report-label').text('Transaction Logs'));
        log_cont.append(log_table_cont);

        part_figure_cont.append(part_figure);

        report_detail_cont.append(detail_cont, log_cont);

        container.append(report_detail_cont, part_figure_cont);


        $.ajax({
            url: 'fetch_report_option.php',
            type: 'POST',
            data: {
                mode: "detail_query",
                part_id: selectedOptionValue,
                type: selected_type,
                start_time: start_time,
                end_time: end_time
            },
            success: function (response) {

                response = JSON.parse(response);
                let part_basic_detail = response.part_basic;
                let part_log_detail = response.part_log ?? [];
                let ss_stock = part_basic_detail.ss_stock ?? 0;
                let part_time_log_detail = response.part_time_log ?? [];
                // Display detail of the part
                detail_cont.html(`
                <label style='margin-bottom:25px;'><h3>รายละเอียดอะไหล่</h3></label>
                <label for='part_id_span'>Part ID:</label>
                <span id='part_id_span'>${part_basic_detail.partid}</span>
                <label for='part_name_span'>ชื่อ:</label>
                <span id='part_name_span'>${part_basic_detail.part_name}</span>
                <label for='part_spec_span'>สเปค:</label>
                <span id='part_spec_span'>${part_basic_detail.part_spec}</span>
                <label for='part_unit_span'>หน่วยเก็บ:</label>
                <span id='part_unit_span'>${part_basic_detail.unit}</span>
                <label for='location'>ที่ตั้ง:</label>
                <span id='location'>${part_basic_detail.part_loc}</span>
                <label for='part_safety_span'>Safety stock:</label>
                <span id='part_safety_span'>${part_basic_detail.ss_stock} ${part_basic_detail.unit}</span>
                <label for='part_lt_span'>LeadTime (วัน):</label>
                <span id='part_lt_span'>${part_basic_detail.part_lt} วัน</span>`);

                // Display log_table

                if (part_log_detail.length > 0) {
                    log_table_tbody.empty();
                    part_log_detail.forEach(logItm => {

                        let bg_col;
                        if (logItm.t_type.toLowerCase() === "issue") {
                            bg_col = "#ffe3be";

                        } else if (logItm.t_type.toLowerCase() === "return") {
                            bg_col = "#d3eff8";
                        } else if (logItm.t_type.toLowerCase() === "receive") {
                            bg_col = "#d3ffc4";
                        } else if (logItm.t_type.toLowerCase() === "gr") {
                            bg_col = "#e9ffce";
                        } else if (logItm.t_type.toLowerCase() === "gr_canceled") {
                            bg_col = "#ffd1d1";
                        } else if (logItm.t_type.toLowerCase().indexOf("count") >= 0) {
                            bg_col = "#f2f2f2";
                        } else {
                            bg_col = "inherit";
                        }


                        let newRow = `
                        <tr style="background-color:${bg_col}">
                        <td>${formatDateToThai(logItm.t_time.split(" ")[0])}</td>
                        <td>${logItm.t_type}</td>
                        <td>${logItm.t_quan}</td>
                        <td>${logItm.old_quan}</td>
                        <td>${logItm.new_quan}</td>
                        <td>${logItm.event_code}</td>
                        </tr>`;

                        log_table_tbody.append(newRow);

                    });
                } else {
                    log_table_tbody.empty();
                    log_table_tbody.append(`<tr style="text-align:center;"><td colspan="6"><b><u>-- ไม่มีรายการย้อนหลังในช่วงนี้ --</u></b></td></tr>`)
                }




                container.css('display', 'flex');
                if (part_log_detail.length > 0) {
                    generate_chart_element(ss_stock, part_time_log_detail, part_figure);

                } else {
                    part_figure_cont.remove();
                }


            },
            error: function (xhr, status, error) {

                console.log('Error:', error);
            }

        });

    }



    function displayPmJobTable(jobInfo) {
        let pmJobCont = $("#pm-statistic-container");
        let pmJobInfo = [];
        if (jobInfo) {
            pmJobInfo = jobInfo.filter((data) => {
                return data.jobType == 'PM';
            })
        }

        if (pmJobInfo.length > 0) {
            // Construct a table row
            let header_construct = `
            <div class='header-label-cont'><label>รายการงาน PM ที่เกี่ยวข้อง</label></div>
            <div class='table-container'>
        <table class='table job-table'>
        <thead>
            <tr>
                <th>Job No.</th>
                <th colspan="2">ชื่อแผน</th>
                <th>วันที่ดำเนินการ</th>
                <th>เวลาหยุดเครื่อง</th>
                <th>ช่างผู้ดำเนินงาน</th>
                <th>รายละเอียดเพิ่มเติม</th>
            </tr>
        </thead>
        <tbody>
        
        </tbody>
        </table>
            `;

            pmJobCont.html(header_construct);


            pmJobInfo.forEach(pmJob => {
                let newJobRow = `
                <tr>
                <td>${pmJob.job_jobNo}</td>
                <td colspan="2">${pmJob.job_informReason}</td>
                <td>${formatDateToThai(pmJob.job_doneDT.split(" ")[0])}</td>
                <td>${formatTimeToThai(pmJob.timeTotalDownTime)}</td>
                <td>${pmJob.job_engReason}</td>
                <td><button type="button" class="pm-job-detail-but goto-table-but" data-pmJobCode="${pmJob.job_jobNo}">รายละเอียดงาน</button></td>
                </tr>
                `;

                pmJobCont.find(".job-table tbody").append(newJobRow);
            });


        } else {
            // No job to be shown
            pmJobCont.html("<span style='color:#ff4141;'>ไม่มีงาน PM ในช่วงเวลานี้</span>");
        }

        $("#pm-statistic-container").on("click", ".pm-job-detail-but", function () {
            location.href = `pm_show_done_job.php?pmJobCode=${$(this).attr("data-pmJobCode")}`;
        });
    }




    function machineCalInfo(mcId = null, startTime = null, endTime = null) {
        // Selected Machine Type with statistic information
        if (!mcId) { return false; }
        let selectedOptionValue = $('#selectOptions').val();
        $.ajax({
            url: 'fetch_report_option.php',
            type: 'POST',
            data: {
                mode: "mc_cal",
                mcId: selectedOptionValue,
                startTime: startTime,
                endTime: endTime
            },
            success: function (response) {
                let information = JSON.parse(response);
                displayStatisticInformation(information.jobStatistic);
                displayPmJobTable(information.jobInfo);

            }
        });


    }

    $('input[name="dateRangeOption"]').change(function () {
        let optionValue = $(this).val();
        let selected_mode = $('#filter_type_val').val();
        if (selected_mode == "machine") {


            if (optionValue === 'allTime') {
                const dateRangeLabel = $('#between-date-text');
                dateRangeLabel.html(`ช่วงเวลาทั้งหมด`);
                $('#dateRangeInputs').hide();
                // Ajax call to retrive all job related to machine 
                let selectedOptionValue = $('#selectOptions').val();
                $.ajax({
                    url: 'fetch_report_option.php',
                    type: 'POST',
                    data: {
                        mode: "job_query",
                        mc_id: selectedOptionValue,
                        d_mode: "AllTime",
                        type: $('#filter_type_val').val()
                    },
                    success: function (response) {
                        // Update the detail-container with the received data
                        $('#fix-statistic-container').html('');
                        $('#fix-statistic-container').html(response);
                        // Show the detail-container if it's hidden 
                    }
                });
                machineCalInfo(selectedOptionValue);

            } else if (optionValue === 'betweenRange') {

                $('#dateRangeInputs').show();
                const dateRangeLabel = $('#between-date-text');

                let selectedOptionValue = $('#selectOptions').val();
                var start_time = new Date($('#startDate').val());
                var end_time = new Date($('#endDate').val());


                var formattedStartDate = start_time.toISOString().split('T')[0]; // Converts to 'YYYY-MM-DD'
                var formattedEndDate = end_time.toISOString().split('T')[0]; // Converts to 'YYYY-MM-DD' 
                dateRangeLabel.html(`ระหว่างวันที่ ${formatDateToThai(formattedStartDate)} ถึง ${formatDateToThai(formattedEndDate)}`);
                machineCalInfo(selectedOptionValue, formattedStartDate, formattedEndDate);

                $.ajax({
                    url: 'fetch_report_option.php',
                    type: 'POST',
                    data: {
                        mode: "job_query",
                        mc_id: selectedOptionValue,
                        d_mode: "BetweenTime",
                        start_time: formattedStartDate,
                        end_time: formattedEndDate,
                        type: $('#filter_type_val').val()
                    },
                    success: function (response) {
                        // Update the detail-container with the received data
                        $('#fix-statistic-container').html('');
                        $('#fix-statistic-container').html(response);
                        // Show the detail-container if it's hidden 
                    }
                });
            }
        } else if (selected_mode == "part") {

            if (optionValue === 'allTime') {
                $('#dateRangeInputs').hide();
                show_part_detail();

            } else if (optionValue === 'betweenRange') {

                $('#dateRangeInputs').show();


                let selectedOptionValue = $('#selectOptions').val();
                var start_time = new Date($('#startDate').val());
                var end_time = new Date($('#endDate').val());


                var formattedStartDate = start_time.toISOString().split('T')[0]; // Converts to 'YYYY-MM-DD'
                var formattedEndDate = end_time.toISOString().split('T')[0]; // Converts to 'YYYY-MM-DD' 

                show_part_detail(formattedStartDate, formattedEndDate);
            }

        } else {
            // Expect nothing here
        }
    });

    // Handle radio button change event
    $('input[name="filterType"]').change(function () {
        populateSelectOptions($(this).val());
        $("#allTimeRadio").prop("checked", true);
        $("input[type='radio'][name='dateRangeOption']").prop("disabled", true);

    });


    $('#selectOptions').change(function () {
        let selectedOptionValue = $(this).val();
        let selected_type = $('#filter_type_val').val();
        if (selectedOptionValue !== "") {
            if (selected_type == "machine") {
                $('#after-option-selected-container').css('display', 'none');

                $('#after-option-selected-container').html(`<div id="report-detail-container">
                <div id="detail-container">
                    <!-- Ajax is called to retrive information -->

                </div>
                <div id="report-container">
                    <label>
                        <h3>ข้อมูลทางสถิติ</h3>
                    </label><br>
                    <div id="date-range-label-text"><label id="between-date-text"></label></div>

                    <div class="report-item">
                        <div class="topic">จำนวนงานซ่อม</div>
                        <div class="value" id="fixCount-span"><span></span></div>
                    </div>
                    <div class="report-item">
                        <div class="topic">รวมเวลา Down time งานซ่อม</div>
                        <div class="value" id="fixDownTime-span"><span></span></div>
                    </div>
                    <div class="report-item">
                        <div class="topic">เวลาห่างเฉลี่ยของการแจ้งซ่อม<br>(MTBF)</div>
                        <div class="value" id="MTBF-span"><span></span></div>
                    </div>
                    <div class="report-item">
                        <div class="topic">เวลาเฉลี่ยระหว่างการแจ้งและการเข้าตรวจสอบ<br>(Mean Time to Response)</div>
                        <div class="value" id="MTTResponse-span"><span></span></div>
                    </div>
                    <div class="report-item">
                        <div class="topic">เวลาเฉลี่ยที่ใช้ซ่อม<br>(Mean Time to Repair)</div>
                        <div class="value" id="MTTRepair-span"><span></span></div>
                    </div>
                    <div class="report-item">
                        <div class="topic">เวลา Down Time เฉลี่ย<br>(Mean Time to Recovery)</div>
                        <div class="value" id="MTTRecovery-span"><span></span></div>
                    </div>

                    <br>

                    <div class="report-item">
                        <div class="topic">จำนวนงาน PM ในช่วง</div>
                        <div class="value" id="pmCount-span"><span></span></div>
                    </div>
                    <div class="report-item">
                        <div class="topic">รวมเวลา Down time งาน PM</div>
                        <div class="value" id="pmDownTime-span"><span></span></div>
                    </div>
                    <br>

                    <div class="report-item">
                        <div class="topic">รวมเวลา Down time ทั้งหมด</div>
                        <div class="value" id="totalDownTime-span"><span></span></div>
                    </div>
                </div>


            </div>

            <div class="container mt-4" id="job-detail-container">


                <div id="fix-statistic-container" class="done-job-cont">
                    <!-- Actually this is job data container -->
                    <!-- Ajax is called to retrive information based on machine/part-->

                </div>

                <div id="pm-statistic-container" class="done-job-cont">
                    <!-- Actually this is job data container -->
                    <!-- Ajax is called to retrive information based on machine/part-->

                </div>

            </div>`);


                $.ajax({
                    url: 'fetch_report_option.php',
                    type: 'POST',
                    data: {
                        mode: "detail_query",
                        mc_id: selectedOptionValue,
                        type: selected_type
                    },
                    success: function (response) {
                        // Update the detail-container with the received data
                        $('#detail-container').html(response);

                        $.ajax({
                            url: 'fetch_report_option.php',
                            type: 'POST',
                            data: {
                                mode: "job_query",
                                mc_id: selectedOptionValue,
                                d_mode: "AllTime",
                                type: selected_type
                            },
                            success: function (response) {
                                // Update the detail-container with the received data
                                $('#fix-statistic-container').html('');
                                $('#fix-statistic-container').html(response);
                                $('#fix-statistic-container').on('click', 'button', function () {
                                    var jobid = $(this).closest('tr').find('.detail-button').data('jobid');
                                    goToJobManagementPage(jobid);
                                });
                                $("input[type='radio'][name='dateRangeOption']").prop("disabled", false);
                                $("#allTimeRadio").prop("checked", true).trigger("change");
                                // Show the detail-container if it's hidden 

                                $('#after-option-selected-container').css('display', 'flex');
                            }
                        });

                        // Show the detail-container if it's hidden 
                    }
                });
            } else if (selected_type == "part") {

                show_part_detail();

                $("input[type='radio'][name='dateRangeOption']").prop("disabled", false);
                $("#allTimeRadio").prop("checked", true).trigger("change");

            } else {
                // If weird is selected, hide the detail-container
                $('#after-option-selected-container').css('display', 'none');
            }
        } else {
            // If no option is selected, hide the detail-container
            $('#after-option-selected-container').css('display', 'none');

        }
    });
    $("input[type='radio'][name='dateRangeOption']").prop("disabled", true);
});