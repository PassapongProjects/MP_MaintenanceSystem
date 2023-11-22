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

    google.charts.load('current', { packages: ['corechart'] });
    const main_chart = $('#mainchart-element');
    const downtime_table = $('#dw-time-element-cont');
    const fix_count_table = $('#bd-count-element-cont');
    const mid_section_month_selector = $("#month-selector");
    const top_section_year_selector = $("#year-selector");
    const top_section_mode_selector = $("#main-chart-mode-selector");
    const download_btn_montly = $("#download-btn-monthly");
    const download_btn_yearly = $("#download-btn-yearly");

    function convertToCSV(data) {
        var csv = [];
        var keys = Object.keys(data[0]);

        // Add header row
        csv.push(keys.join(','));

        // Add data rows
        data.forEach(function (item) {
            var row = keys.map(function (key) {
                return item[key];
            });
            csv.push(row.join(','));
        });

        return csv.join('\n');
    }
    function formatDuration(duration) {
        let timeArray = duration.split(':');
        let hours = parseInt(timeArray[0]) ? parseInt(timeArray[0]) : 0;
        let minutes = parseInt(timeArray[1]) ? parseInt(timeArray[1]) : 0;

        if (!hours && !minutes) {
            return "-";
        }
        let formattedDuration = hours + ' ชั่วโมง ' + minutes + ' นาที';
        return formattedDuration;
    }


    function fetchData(name, arg) {
        // Name As string
        // Arg as array {}
        return new Promise(function (resolve, reject) {
            $.ajax({
                type: 'POST',
                url: 'fetch_main_chart_data.php',
                data: { "name": name, "arg": arg },
                success: function (response) {
                    // Resolve the Promise with the response data
                    response = JSON.parse(response);
                    if (response.status && response[name]) {
                        resolve(response);
                    }
                    else { resolve(false) };
                },
                error: function (xhr, status, error) {
                    // Reject the Promise with an error message
                    reject(error);
                }
            });
        });
    }

    function initialElements() {

        let cur_year = new Date().getFullYear();
        let cur_month = parseInt(new Date().getMonth()) + 1; // getMonth return (0-11)
        let cur_yer_option = top_section_year_selector.find(`option[value='${cur_year}']`);
        let main_mode = top_section_mode_selector.find(`option[value="count"]`);
        if (cur_yer_option.length == 0) {
            top_section_year_selector.append(`<option value='${cur_year}' selected>${cur_year}</option>`);
        }
        // Trigger Change of Year and month
        // Trigger change either to year / Mode -> it performs the same action.
        main_mode.prop("selected", true);
        cur_yer_option.prop("selected", true);
        mid_section_month_selector.find(`option[value='${cur_month}']`).prop("selected", true);
        top_section_year_selector.trigger("change");
    }

    function prepareMainData(rawData) {
        // Change The whole Div element
        // Prepare dataTable Table
        let dataTableArray = [];
        let year = top_section_year_selector.val();
        // Iterate through your raw dataTable and format it for Google DataTable
        rawData.forEach(function (item) {
            let month = item.month;
            let label = month + '/' + year; // Create the label (e.g., "1/2023")
            let mean_response_text = item.mean_response_HR
            let count_text = `${item.job_count} ครั้ง`;
            // Add dataTable for the Google DataTable
            dataTableArray.push([label, count_text, item.job_count, formatDuration(item.mean_response), parseFloat(mean_response_text), formatDuration(item.total_down), parseFloat(item.total_down_HR)]);
        });

        // Create the DataTable 
        let dataTable = new google.visualization.DataTable();
        dataTable.addColumn('string', 'Month/Year', 'm-col');
        dataTable.addColumn('string', 'จำนวนงานซ่อมข้อมูล', 'count_text')
        dataTable.addColumn('number', 'จำนวนงานซ่อม', 'count');
        dataTable.addColumn('string', 'เวลาเฉลี่ยในการตอบสนองข้อมูล', 'responseTime_text');
        dataTable.addColumn('number', 'เวลาเฉลี่ยในการตอบสนอง', 'responseTime');
        dataTable.addColumn('string', 'เวลารวมเครื่องจอดข้อมูล', 'totalDown_text');
        dataTable.addColumn('number', 'เวลารวมเครื่องจอด', 'totalDown');

        dataTable.addRows(dataTableArray);

        return dataTable;

    }

    function displayTopSection(mode) {
        // Other label / Information in the div
        displayMainChart();
    }

    function displayMainChart() {
        // mode -> count or responseTime
        main_chart_element = new google.visualization.ColumnChart(main_chart[0]);
        let mode = top_section_mode_selector.val();
        let FilterData = new google.visualization.DataView(main_chart_data_table);
        main_chart_element.clearChart();
        // Display Data on option differently for each mode.
        let option = {
            title: 'Information',
            legend: 'top',
            annotations: {
                alwaysOutside: true, // Display annotations outside the columns
                textStyle: {
                    fontSize: 12,
                    auraColor: 'white',
                    color: 'black',
                    bold: true
                }
            }
        };
        let annotation_col = {
            calc: 'stringify',
            sourceColumn: parseInt(FilterData.getColumnIndex(`${mode}_text`)),
            type: 'string',
            role: 'annotation',
        };

        if (mode == 'count') {
            option.title = "จำนวนงานซ่อมในช่วงปี (ครั้ง)";
            FilterData.setColumns([parseInt(FilterData.getColumnIndex('m-col')), parseInt(FilterData.getColumnIndex(mode)), annotation_col]); // [month-Year/count]

        } else if (mode == 'responseTime') {
            option.title = "Mean Time To Response (เวลา)";
            FilterData.setColumns([parseInt(FilterData.getColumnIndex('m-col')), parseInt(FilterData.getColumnIndex(mode)), annotation_col]);   //[month-Year/MTTResponse]
        } else if (mode == 'totalDown') {
            option.title = "รวมเวลาจอด (เวลา)";
            FilterData.setColumns([parseInt(FilterData.getColumnIndex('m-col')), parseInt(FilterData.getColumnIndex(mode)), annotation_col]);
        }
        else {
            return false;
        }

        main_chart_element.draw(FilterData, option);

    }

    function displayMidSection(unsorteddata) {
        // Other label / Information in the div

        displayDowntimeTable(unsorteddata);
        displayFixCountTable(unsorteddata);
    }

    function displayDowntimeTable(unsorteddata) {
        // Change The whole Div element
        downtime_table.html("");

        let label = $('#dw-time-element-label');
        label.html(`ลำดับรวมเวลาจอดเครื่อง\n${mid_section_month_selector.find('option:selected').text()}/${top_section_year_selector.find('option:selected').text()}`);
        downtime_table.append(`
        
        <table class="order-table" id="down-time-order-table">
        <thead>
            <tr>
                <th>No.</th>
                <th>เครื่องจักร</th>
                <th>รวมเวลาจอดในเดือน</th>
            </tr>
        </thead>
        <tbody>

        </tbody>

        </table>

        `);
        // Sort Data

        if (unsorteddata === true) {
            downtime_table.find("table tbody").append(`<tr><td colspan="3">--ไม่มีข้อมูลในเดือนนี้--</td></tr>`);
            return;
        }
        let down_time_filter = unsorteddata.slice().sort(function (a, b) {
            return parseFloat(b.totalDownTime_compare) - parseFloat(a.totalDownTime_compare); // Sort in descending order
        });
        // ->End Sorting

        down_time_filter.forEach(mc => {
            let newtableRow = `
          <tr>
            <td>${mc.mcId}</td>
            <td><div class='table-text-scroll'>${mc.machineName}</div></td>
            <td>${formatDuration(mc.totalDownTime)}</td>
          <tr>
          `;
            downtime_table.find("table tbody").append(newtableRow);
        });



    }

    function displayFixCountTable(unsorteddata) {
        // Change The whole Div element
        fix_count_table.html("");
        let label = $('#bd-count-element-label');
        label.html(`ลำดับจำนวนครั้งที่ถูกแจ้งซ่อม\n${mid_section_month_selector.find('option:selected').text()}/${top_section_year_selector.find('option:selected').text()}`);
        fix_count_table.append(`
        <table class="order-table" id="fix-count-order-table">
        <thead>
        <tr>
            <th>No.</th>
            <th>เครื่องจักร</th>
            <th>รวมการแจ้งซ่อมในเดือน (ครั้ง)</th>
        </tr>
    </thead>
    <tbody>

    </tbody>

        </table>
        `);

        if (unsorteddata === true) {
            fix_count_table.find("table tbody").append(`<tr><td colspan="3">--ไม่มีข้อมูลในเดือนนี้--</td></tr>`);
            return;
        }

        // Sort Data
        let fix_count_filter = unsorteddata.slice().sort(function (a, b) {
            return parseInt(b.downCount, 10) - parseInt(a.downCount, 10); // Sort in descending order
        });
        // ->End Sorting

        fix_count_filter.forEach(mc => {
            let newtableRow = `
          <tr>
            <td>${mc.mcId}</td>
            <td><div class='table-text-scroll'>${mc.machineName}</div></td>
            <td>${mc.downCount}</td>
          <tr>
          `;
            fix_count_table.find("table tbody").append(newtableRow);
        });


    }

    top_section_year_selector.on("change", function () {
        let mode = top_section_mode_selector.val();
        let year = top_section_year_selector.val();
        fetchData("fix_main_chart_by_year", { "year": year })
            .then(function (data) {
                if (data.status) {
                    main_chart_data_table = prepareMainData(data.fix_main_chart_by_year);
                    displayTopSection(mode);
                }
                else {
                    console.log("ERROR");
                }
            })
            .catch(function (error) {
                console.log(error);
            });

        mid_section_month_selector.trigger("change"); // Change to data of the new year;

    })

    top_section_mode_selector.on("change", function () {
        let mode = top_section_mode_selector.val();
        // Display without preparing new data
        displayTopSection(mode);
    })


    mid_section_month_selector.on("change", function () {
        // Mid section Filter
        let year = top_section_year_selector.val();
        let month = $(this).val();
        fetchData("mc_order_by_month", { "year": year, "month": month })
            .then(function (data) {
                if (data.status) {
                    displayMidSection(data.mc_order_by_month);
                } else {
                    console.log("ERROR");
                }

            })
            .catch(function (error) {
                console.log(error);
            });

    });

    download_btn_montly.on('click', function () {
        let year = top_section_year_selector.val();
        let month = mid_section_month_selector.val();
        fetchData("download_monthly_fix_job", { "year": year, "month": month })
            .then(function (data) {
                if (data.status) {

                    const prepared_data = (data.download_monthly_fix_job) ;
                    if (prepared_data === true) {
                        alert('ไม่มีข้อมูลในช่วงนี้');
                        return false;
                    }

                    const today = new Date().toISOString().split('T')[0];
                    let csvData = convertToCSV(prepared_data);

                    // Create a Blob
                    let blob = new Blob([csvData], { type: 'text/csv' });

                    // Create a download link
                    let url = URL.createObjectURL(blob);
                    let a = $('<a>', {
                        style: 'display:none',
                        href: url,
                        download: `Fixjob_data (${month}-${year}) ${today}.csv`
                    });

                    // Trigger a click event on the download link
                    a[0].click();

                    // Clean up by revoking the URL
                    URL.revokeObjectURL(url);


                } else {
                    throw new error("Query Error");
                }

            })
            .catch(function (error) {
                console.log(error);
                alert('เกิดข้อผิดพลาด');
                return false;
            });


    });

    download_btn_yearly.on('click',function(){

        let year = top_section_year_selector.val();
    
        fetchData("download_yearly_fix_job", { "year": year})
            .then(function (data) {
                if (data.status) {

                    const prepared_data = (data.download_yearly_fix_job) ;
                    if (prepared_data === true) {
                        alert('ไม่มีข้อมูลในช่วงนี้');
                        return false;
                    }

                    const today = new Date().toISOString().split('T')[0];
                    let csvData = convertToCSV(prepared_data);

                    // Create a Blob
                    let blob = new Blob([csvData], { type: 'text/csv' });

                    // Create a download link
                    let url = URL.createObjectURL(blob);
                    let a = $('<a>', {
                        style: 'display:none',
                        href: url,
                        download: `Fixjob_data (${year}) ${today}.csv`
                    });

                    // Trigger a click event on the download link
                    a[0].click();

                    // Clean up by revoking the URL
                    URL.revokeObjectURL(url);


                } else {
                    throw new error("Query Error");
                }

            })
            .catch(function (error) {
                console.log(error);
                alert('เกิดข้อผิดพลาด');
                return false;
            });
    });




    google.charts.setOnLoadCallback(initialElements);

    window.addEventListener('resize', displayMainChart);
});