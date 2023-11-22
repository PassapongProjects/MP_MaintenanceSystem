// JavaScript code
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
    $(".issued_quantity").on("input", function() {
        var rawVal = $(this).val();
        var cleanedVal = rawVal.replace(/[^0-9.]/g, ''); // Remove non-numeric characters
    
        // Split the value by the decimal point
        var parts = cleanedVal.split('.');
        
        // Remove any additional decimal points beyond the first one
        if (parts.length > 2) {
            parts.pop(); // Remove the last element
            cleanedVal = parts.join('.');
        }
    
        $(this).val(cleanedVal);
    
        var max = parseFloat($(this).data("max"));
        var value = parseFloat(cleanedVal);
        
        // Check if the value is a number and within the limit
        if (isNaN(value) || value < 0 || value > max) {
            $(this).val(""); // Clear the input if not valid
        }
    });

    $(".return_quantity").on("input", function() {
        var rawVal = $(this).val();
        var cleanedVal = rawVal.replace(/[^0-9.]/g, ''); // Remove non-numeric characters
    
        // Split the value by the decimal point
        var parts = cleanedVal.split('.');
        
        // Remove any additional decimal points beyond the first one
        if (parts.length > 2) {
            parts.pop(); // Remove the last element
            cleanedVal = parts.join('.');
        }
    
        $(this).val(cleanedVal);
    
        var max = parseFloat($(this).data("max"));
        var value = parseFloat(cleanedVal);
        
        // Check if the value is a number and within the limit
        if (isNaN(value) || value < 0 || value > max) {
            $(this).val(""); // Clear the input if not valid
        }
    });
    

    // $(".unit_price").on("input", function() {
    //     var rawVal = $(this).val();
    //     var cleanedVal = rawVal.replace(/[^0-9.]/g, ''); // Remove non-numeric characters
    
    //     // Split the value by the decimal point
    //     var parts = cleanedVal.split('.');
        
    //     // Remove any additional decimal points beyond the first one
    //     if (parts.length > 2) {
    //         parts.pop(); // Remove the last element
    //         cleanedVal = parts.join('.');
    //     }
    
    //     $(this).val(cleanedVal);
    
    //     var value = parseFloat(cleanedVal);
        
    //     // Check if the value is a number and within the limit
    //     if (isNaN(value) || value < 0) {
    //         $(this).val(""); // Clear the input if not valid
    //     }
    // });
    



    $('#req-list-cont').on('click', '.confirm-issue-button', function() {
        var issuedQuantity = $(this).closest('tr').find('.issued_quantity').val();
        //var unitPrice = $(this).closest('tr').find('.unit_price').val();
        var partId = $(this).data('partid');
        var mrCode = $(this).data('mrcode');
        var req_quan = $(this).data('req_quan');

        if (issuedQuantity === '') {
            alert('กรุณาระบุจำนวนจ่าย');
            return;
        }

        //var unitPriceInfo = unitPrice === '' ? 'ไม่ระบุ' : unitPrice;

        var confirmation = confirm(`ยืนยันการเบิกจ่าย\nอะไหล่รหัส: ${partId}\nรหัสรายการเบิก:  ${mrCode}\nจำนวนจ่าย: ${issuedQuantity}`);

        if (confirmation) {
            // Ajax call here
            $.ajax({
                url: 'inven_issue_confirm_handle.php',
                type: 'POST',
                data: {
                    partid: partId,
                    mrcode: mrCode,
                    issuedQuantity: issuedQuantity,
                    req_quan: req_quan
                    // unitPrice: unitPrice
                },
                success: function(response) {
                    alert("ยืนบันการเบิกจ่ายสำเร็จ");
                    location.reload();
                },
                error: function(xhr, status, error) {
                    console.error('AJAX Error:', error);
                }
            });
        }
});


$('#req-list-cont').on('click', '.confirm-return-button', function() {
    var returnQuantity = $(this).closest('tr').find('.return_quantity').val();
    //var unitPrice = $(this).closest('tr').find('.unit_price').val();
    var partId = $(this).data('partid');
    var mrCode = $(this).data('mrcode');

    if (returnQuantity === '') {
        alert('กรุณาระบุจำนวนคืน');
        return;
    }

    //var unitPriceInfo = unitPrice === '' ? 'ไม่ระบุ' : unitPrice;

    var confirmation = confirm(`ยืนยันการรับคืน\nอะไหล่รหัส: ${partId}\nรหัสรายการเบิก:  ${mrCode}\nจำนวนคืน: ${returnQuantity}`);

    if (confirmation) {
        // Ajax call here
        $.ajax({
            url: 'inven_return_confirm_handle.php',
            type: 'POST',
            data: {
                partid: partId,
                mrcode: mrCode,
                returnQuantity: returnQuantity,
                // unitPrice: unitPrice
            },
            success: function(response) {
                if(response=="success"){
                alert("ยืนบันการรับคืน");
                location.reload();}
                else{ alert("ผิดพลาด"); location.reload();}
            },
            error: function(xhr, status, error) {
                console.error('AJAX Error:', error);
            }
        });
    }
});



});
