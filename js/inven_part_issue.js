$(document).ready(function() {
    function init_navAndLoad(){
        $('body').prepend('<div id="nav-container"></div>');
    
        $.get({url:'../global_res/global_sidebar_EN.html'}, function (htmlContent) {
            $('#nav-container').html(htmlContent);
            $.get({url:'../style/global_sidebar.css'}, function (cssContent) {
                $('<style>').attr('type','text/css').html(cssContent).appendTo('head');
    
                let $els = $('.menu a, .menu header');
                let count = $els.length;
                let grouplength = Math.ceil(count/3);
                let groupNumber = 0;
                let i = 1;
                $('.menu').css('--count',count+'');
                $els.each(function(j){
                    if ( i > grouplength ) {
                        groupNumber++;
                        i=1;
                    }
                    $(this).attr('data-group',groupNumber);
                    i++;
                });
            
                $('#nav-container').on('click','.menu footer button',function(e){
                    e.preventDefault();
                    $els.each(function(j){
                        $(this).css('--top',$(this)[0].getBoundingClientRect().top + ($(this).attr('data-group') * -15) - 20);
                        $(this).css('--delay-in',j*.1+'s');
                        $(this).css('--delay-out',(count-j)*.1+'s');
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
          ajaxStart: function() { $('body').addClass("loading"); },
         ajaxStop: function() { $('body').removeClass("loading"); }    
        });
    
    }
    init_navAndLoad();
    $(document).on({
      ajaxStart: function() { $('body').addClass("loading"); },
     ajaxStop: function() { $('body').removeClass("loading"); }    
    });



        $.ajax({
        url: 'fetch_inven_part_issue.php',
        type: 'POST',
        dataType: 'json',
        success: function(response) {
            // 'response' contains the JSON query results
            UpdateSelect(response);
            generateTable(response); // Call the function to generate the table
        },
        error: function(xhr, status, error) {
            console.error('AJAX Error:', error); // Display any AJAX errors in the browser console
        }

       });
    
        var jobTypeFilter = $('#filter-job-type');
        var statusFilter = $('#filter-status');
       


        function generateTable(data) {
        var tableHtml = '<table class="table">';
        tableHtml += '<thead>';
        tableHtml += '<tr>';
        tableHtml += '<th>รหัสรายการเบิก</th>';
        tableHtml += '<th>รหัสงาน</th>';
        tableHtml += '<th>ประเภท</th>';
        tableHtml += '<th>วันขอเบิก</th>';
        tableHtml += '<th>สถานะ</th>';
        tableHtml += '<th>ดำเนินการ</th>';
        tableHtml += '</tr>';
        tableHtml += '</thead>';
        tableHtml += '<tbody id="table-body">';

        for (var i = 0; i < data.length; i++) {
            var row = data[i];
            tableHtml += '<tr>';
            tableHtml += '<td>' + row.mr_code + '</td>';
            
            if(row.job_type == 'BD'){
            tableHtml += '<td>' + row.fix_code + '</td>';}
            else if(row.job_type =='PM'){
                tableHtml += '<td>' + row.pm_code + '</td>';}
            else{
                tableHtml += '<td>-----</td>';}
            
            tableHtml += '<td>' + row.job_type + '</td>';
            tableHtml += '<td>' + formatDateTime(row.submit_date) + '</td>';
            tableHtml += '<td>' + toThaiStatus(row.status) + '</td>';
            tableHtml += '<td><button class="operation-button" data-mrcode="' + row.mr_code + '">ดำเนินการ</button></td>';
            tableHtml += '</tr>';
        }

        tableHtml += '</tbody>';
        tableHtml += '</table>';
        $('#req-list-cont').html(''); // Clear the html
        $('#req-list-cont').html(tableHtml); // Append the table HTML to the 'req-list-cont' div
    }

     function UpdateSelect(jsonData){
      // Populate job types
    // var jobTypeFilter = $('#filter-job-type');
    // var statusFilter = $('#filter-status');

    var jobTypes = [...new Set(jsonData.map(item => item.job_type))];
    jobTypes.forEach(jobType => {
        var option = $('<option>', { value: jobType, text: jobType });
        jobTypeFilter.append(option);
    });

    var statuses = [...new Set(jsonData.map(item => item.status))];
    statuses.forEach(status => {
        var option = $('<option>', { value: status, text: toThaiStatus(status) });
        statusFilter.append(option);
    });
    }

    function toThaiStatus(engStatus) {
        const lowerCaseEngStatus = engStatus.toLowerCase();
        let thaiStatus = '';
        
        if (lowerCaseEngStatus === 'wait for review') {
            thaiStatus = 'รออนุมัติ';
        } else if (lowerCaseEngStatus === 'issued') {
            thaiStatus = 'อนุมัติครบแล้ว';
        } else {
            thaiStatus = engStatus;
        }
        
        return thaiStatus;
    }
    
    function formatDateTime(dateTimeStr) {
        const options = { year: 'numeric', month: 'numeric', day: 'numeric'};
        const formattedDateTime = new Date(dateTimeStr).toLocaleString('en-GB', options);
        return formattedDateTime;
    }
    function updateTableFilters() {
        

        var mrCodeFilter = $('#filter-mr-code').val().toLowerCase();
        var selectedJobType = jobTypeFilter.val();
        var selectedStatus = statusFilter.val();


        $.ajax({
            url: 'fetch_inven_part_issue.php',
            type: 'POST',
            dataType: 'json',
            success: function(response) {
                // 'response' contains the JSON query results
                var filteredData = response.filter(item => 
                    ((!mrCodeFilter || (item.mr_code && item.mr_code.toLowerCase().includes(mrCodeFilter.toLowerCase()))) ||
                    (!mrCodeFilter || (item.fix_code && item.fix_code.toLowerCase().includes(mrCodeFilter.toLowerCase()))) ||
                    (!mrCodeFilter || (item.pm_code && item.pm_code.toLowerCase().includes(mrCodeFilter.toLowerCase())))) &&
                    (!selectedJobType || item.job_type === selectedJobType) &&
                    (!selectedStatus || item.status === selectedStatus)
                );
        
                var tableBody = $('#req-list-cont').find('table tbody');
                tableBody.empty(); // Clear existing table rows
        
                filteredData.forEach(item => {
                    var row = $('<tr>');
                    var job_code;
                    if(item.job_type == 'BD'){
                        job_code = item.fix_code;}
                        else if(item.job_type =='PM'){
                            job_code = item.pm_code;}
                        else{
                            job_code = '-----';}
                    row.html(`
                        <td>${item.mr_code}</td>
                        <td>${job_code}</td>
                        <td>${item.job_type}</td>
                        <td>${formatDateTime(item.submit_date)}</td>
                        <td>${toThaiStatus(item.status)}</td>
                        <td><button class="operation-button" data-mrcode="${item.mr_code}">ดำเนินการ</button></td>
                    `);
                    
                    tableBody.append(row);
                });
            },
            error: function(xhr, status, error) {
                console.error('AJAX Error:', error); // Display any AJAX errors in the browser console
            }
    
           });

        
    }

    // Attach event listeners to filter fields
    $('#filter-mr-code').on('input', updateTableFilters);
    jobTypeFilter.on('change', updateTableFilters);
    statusFilter.on('change', updateTableFilters);
    $("#req-list-cont").on("click", ".operation-button", function() {
        var mrcode = $(this).data("mrcode"); // Get the 'data-mrcode' value from the button
        
        // Create a hidden form dynamically
        var form = $("<form>")
            .attr("method", "post")
            .attr("action", "inven_part_issue_detail.php")
            .appendTo("body");
    
        // Create an input element to hold the 'mrcode' value
        $("<input>")
            .attr("type", "hidden")
            .attr("name", "mrcode")
            .val(mrcode)
            .appendTo(form);
    
        // Submit the form
        form.submit();
    });
    
    

});

    
  

