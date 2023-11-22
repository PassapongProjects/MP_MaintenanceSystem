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



    async function whoamina() {
        // if (funcArr == null) {
        //     return false;
        // }

        try {
            const response = await $.ajax({
                type: 'POST',
                url: 'fetch_global_ppss.php',
                data: { "functions": [{ "name": "whoamina", "arg": "" }] }
            });

            const parsedResponse = JSON.parse(response);

            if (parsedResponse.status) {
                return parsedResponse.whoamina;
            } else {
                return false;
            }
        } catch (error) {
            throw error;
        }
    }


    function fetchObjects(funcArr = null) {
        // Name As string
        // Arg as array {}
        if (funcArr == null) { return false };
        return new Promise(function (resolve, reject) {
            $.ajax({
                type: 'POST',
                url: 'fetch_prequest.php',
                data: { "functions": funcArr },
                success: function (response) {
                    // Resolve the Promise with the response data
                    response = JSON.parse(response);

                    if (response.status) {
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

    function allowOnlyIntegers(inputElement) {
        let rawVal = inputElement.val();
        let cleanedVal = rawVal.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        let value = parseInt(cleanedVal);
        if (isNaN(value) || value <= 0) {
            value = 0; // Clear the input if not valid
        }
        inputElement.val(value);
    }

    function allowFloatingPoint(inputElement) {
        let rawVal = inputElement.val();
        let cleanedVal = rawVal.replace(/^0+|[^0-9.]/g, '');
        let parts = cleanedVal.split('.');
        if (parts[0] == '') {
            parts[0] = '0';
        }
        if (parts.length > 2) {
            parts.pop();
        }
        cleanedVal = parts.join('.');
        inputElement.val(cleanedVal);

    }


    function isSafeInput(inputString) {
        // Check if the input string is empty or consists only of white spaces
        if (!inputString || inputString.trim() === "") {
            return false;
        }

        // Check for potentially harmful characters
        const harmfulChars = /[\'";`<>]/g; // Add more characters as needed
        if (harmfulChars.test(inputString)) {
            return false;
        }

        // If the input passes all checks, it is considered safe
        return inputString.trim();
    }

    function calculateDateDiff(targetDate) {

        try {

            const parts = targetDate.split("-");
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // Month is zero-based
            const day = parseInt(parts[2]);

            // Create Date objects for today and the target date
            const today = (new Date()).getTime();
            const target = (new Date(year, month, day)).getTime();

            // Calculate the time difference in milliseconds
            const timeDiff = target - today;

            // Calculate the number of days
            const daysDiff = Math.floor(Math.abs(timeDiff) / (1000 * 60 * 60 * 24));

            if (isNaN(daysDiff)) {
                throw new Error('Error Conversion');
            }

            if (timeDiff > 0) {
                return `<span style="color:#097d46;">(เหลืออีก ${daysDiff} วัน)</span>`;
            } else {

                return `<span style="color:#ff0000;">(ผ่านมาแล้ว ${daysDiff} วัน)</span>`;
            }


        } catch (error) {
            return "";
        }
    }
    function formatDate(inputDate) {
        try {
            const parts = inputDate.split('-');
            if (parts.length !== 3) {
                return '-';
            }

            const year = parts[0];
            const month = parts[1];
            const day = parts[2];

            return `${day}/${month}/${year}`;
        } catch (error) {
            return 'N/A'; // Return 'N/A' if an error occurs
        }
    }

    function formatTime(inputTime) {
        try {
            const parts = inputTime.split(':');
            if (parts.length !== 3) {
                return 'Invalid Time';
            }

            const hours = parseInt(parts[0]);
            const minutes = parseInt(parts[1]);

            return `${hours} ชั่วโมง ${minutes} นาที`;
        } catch (error) {
            return 'N/A'; // Return 'N/A' if an error occurs
        }
    }

    function formatDateTime(dateTime) {
        try {
            const dateParts = dateTime.split(' ');

            const date = dateParts[0];
            const time = dateParts[1];

            const [year, month, day] = date.split('-');
            const [hour, minute, second] = time.split(':');


            const formattedDate = `${day}/${month}/${year}`;
            const formattedTime = `${hour}.${minute} น.`;

            return `${formattedDate} ${formattedTime}`;
        } catch (error) {
            return 'N/A'; // Return 'N/A' if an error occurs
        }
    }

    function filterPrTableObject(searchString, inputObject) {
        // Create an empty result object to store the filtered data.
        let resultObject = {};

        searchString = searchString.toLowerCase();
        // Loop through the input object.
        $.each(inputObject, function (key, value) {
            if (
                value.itmlist &&
                Object.values(value.itmlist).some(function (item) {
                    return (
                        item.pr_itm_part_name.toLowerCase().includes(searchString) ||
                        item.pr_itm_part_id.toLowerCase().includes(searchString) ||
                        item.pr_itm_itm_code.toLowerCase().includes(searchString) ||
                        item.pr_itm_part_spec.toLowerCase().includes(searchString) ||
                        item.pr_itm_prCode.toLowerCase().includes(searchString)
                    );
                })
            ) {
                // If any item within the 'itmlist' property matches the search criteria,
                // include the whole object in the result.
                resultObject[key] = value;
            }
        });

        return resultObject;
    }


    function getObjectLength(obj) {
        let count = 0;
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                count++;
            }
        }
        return count;
    }

    function object_to_options(obj, selected_val = null, mode = "obj") {
        selected_val = selected_val ?? "";

        let option_html = `<option value="" ${selected_val === "" ? "selected" : ""} disabled>-- โปรดระบุ --</option>`;

        if (mode === "obj") {
            $.each(obj, function (id, name) {

                option_html += `<option value="${id}" ${selected_val == id ? "selected" : ""} >${name}</option>`;

            });
        } else if (mode === "arr") {
            obj.forEach(row => {
                option_html += `<option value="${row.id}" ${selected_val == row.id ? "selected" : ""} >${row.name}</option>`;
            });
        }


        return option_html;

    }

    function generate_requested_items_element(items_data) {
        const container = $('<div>').addClass('block-container');
        const table_cont = $('<div>').addClass('scroll-table-cont');
        const table_element = $('<table>').attr('id', 'requested-itm-table').addClass('fixed-header-table small-table');
        const thead = $('<thead>').html(`
        <tr>
        <th>ID.</th>
        <th class="part-detail-fixed-column">รายการ</th>
        <th>แจ้งแล้ว</th>
        <th>เปิด PR แล้ว</th>
        </tr>
        `);

        const tbody = $('<tbody>');


        if (items_data.length > 0) {


            items_data.forEach(itm_row => {

                let new_row = `
            <tr>
            <td>${itm_row.pr_itm_part_id}</td>
            <td>ID: ${itm_row.pr_itm_part_id} - ${itm_row.pr_itm_part_name}<br><div class="scroll-inline-text">${itm_row.pr_itm_part_spec}</div></td>
            <td>${itm_row.informed_count}</td>
            <td>${itm_row.pr_opened_count}</td>
            </tr>
            `;

                tbody.append(new_row);

            });

        } else {
            let newRow = `<tr><td colspan="4" style="text-align:center;"><b><u>-- ไม่มีรายการแจ้งซื้อ --</u></b></td></tr>`;
            tbody.append(newRow);
        }




        table_element.append(thead, tbody);

        table_cont.append(table_element);
        container.append(table_cont);


        return container;
    }

    function generate_below_ss_alert(ss_data) {

        function generate_below_ss_table(ss_data) {

            const table = $('<table>').addClass('small-table fixed-header-table').attr('id', 'ss-alert-table');
            const thead = $('<thead>').html(`
    <tr>
    <th>รหัส</th>
    <th>ชื่อ-สเปค</th>
    <th>Safety Stock</th>
    <th>จำนวนคงเหลือ</th>
    <th>เปิด PR แล้ว</th>
    <th>จำนวนต้องสั่งเพิ่ม</th>
    </tr>
    `);

            const tbody = $('<tbody>');


           if (ss_data.length > 0) {

            ss_data.forEach(ss_data_row => {
                
      
            let newRow = `<tr>
            <td>${ss_data_row.part_id}</td>
            <td>ID: ${ss_data_row.part_id} - ${ss_data_row.part_name}<br><div class="scroll-inline-text">${ss_data_row.part_spec}</div></td>
            <td>${ss_data_row.ss_stock}</td>
            <td>${ss_data_row.real_instock}</td>
            <td>${ss_data_row.onOrdered_stock}</td>
            <td style="color:#ff241c;">${ss_data_row.need_to_order}</td>
            </tr>`

            tbody.append(newRow);
        });

           }else {

            tbody.append(`<tr colspan="6"><b><u>-- ไม่มีรายการต่ำกว่า Safety Stock --</u></b></tr>`)

           }



            table.append(thead, tbody);


            return table;


        }

        const container = $('<div>').addClass('block-container');
        const table_cont = $('<div>').addClass('scroll-table-cont');
        const table_element = generate_below_ss_table(ss_data);


        table_cont.append(table_element);

        container.append(table_cont);

        return container;

    }


    function generate_requested_element(tableData) {
        const container = $('<div>').addClass('block-container');
        const filter_bar = $('<input>').attr('type', 'text').addClass('filter-bar-input').attr('placeholder', 'กรอกคำค้นหา');
        const table_cont = $('<div>').addClass('scroll-table-cont');
        const table_element = generated_requested_table(tableData);
        const bar_div = $('<div>').addClass('inline-element-div').attr('id', 'requested-inline-element-div');
        const newPR_btn = $('<button>').attr('type', 'button').addClass('oper-btn').attr('id', 'newPr-btn').text('แจ้งความต้องการใหม่');

        bar_div.append(filter_bar, newPR_btn);

        newPR_btn.on('click', () => {
            // Append delPR

            fetchObjects([{ "name": "insert_new_pr", "arg": "" }]).then(function (data) {
                if (data.insert_new_pr.status) {
                    let new_prCode = data.insert_new_pr.prCode;

                    appendFormField(page, new_prCode, false);



                } else {
                    throw new Error('Query Error');
                }


            })
                .catch((error) => {
                    console.log(error);
                    alert('เกิดข้อผิดพลาดกรุณารีเฟรช');
                    return false;
                });
        });

        filter_bar.on('input', function () {
            let searchString = $(this).val();
            let filter_obj = filterPrTableObject(searchString, tableData);

            let filtered_table = generated_requested_table(filter_obj);

            container.find('.scroll-table-cont #requested-table').remove();

            container.find('.scroll-table-cont').append(filtered_table);

        })


        table_cont.append(table_element);

        container.append(bar_div, table_cont);

        return container;
    }
    async function appendFormField(parentElement, prCode, access) {
        try {
            const formField = await generate_form_field(prCode, access);
            parentElement.append(formField);
        } catch (error) {
            console.error("An error occurred:", error);
        }
    }

    function generate_tooltip(element, contentText) {
        element.on('mouseenter', function (event) {

            $('body').find('.floating-text').remove();
            let tooltipContent = contentText
            // Create a new tooltip element
            let tooltip = $('<div>').addClass('floating-text').html(tooltipContent);


            // Calculate tooltip position based on mouse coordinates
            let x = event.clientX + window.scrollX + 10; // Adjust horizontal position
            let y = event.clientY + window.scrollY + 10; // Adjust vertical position

            // Set tooltip position
            tooltip.css({ left: x + 'px', top: y + 'px' });


            // Append the tooltip to the body
            $('body').append(tooltip);

            // Show the tooltip
            tooltip.css('display', 'block');


            element.on("mousemove", function (event) {

                let x = event.clientX + window.scrollX + 10; // Adjust horizontal position
                let y = event.clientY + window.scrollY + 10; // Adjust vertical position

                // Update tooltip position
                tooltip.css({ left: x + 'px', top: y + 'px' });
            });


            element.mouseleave(function () {
                tooltip.css('display', 'none');
                tooltip.remove(); // Remove the tooltip element from the DOM
            });
        });
    }

    function label_value_div(label_text, value_text) {
        const return_div = $('<div>').addClass('label-value-cont label-element-cont');

        const element_label = $('<label>').addClass('info-label').text(label_text + ": ");
        const element_value = $('<label>').addClass('info-value').html(`${value_text}`);

        return_div.append(element_label, element_value);

        return return_div;
    }


    function picture_to_li(pic_ul, pic_obj = {}, ref_itm_code = null) {
        // Direct picture display (used when just uploaded)
        function file_to_link(file, fileName) {

            const imageLink = $('<a>')
                .text(fileName)
                .attr('href', URL.createObjectURL(file))
                .attr('target', '_blank');

            return imageLink;

        }

        function key_to_link(img_uq_id, fileName) {

            const imageLink = $('<a>')
                .text(fileName)
                .attr('href', `global_show_images.php?image_id=${img_uq_id}&fk_itmCode=${ref_itm_code}`)
                .attr('target', '_blank');

            return imageLink;

        }

        // One dimensional array containing ID's of pictures
        let li_array = [];
        if (getObjectLength(pic_obj) >= 1) {
            let order = 1;
            $.each(pic_obj, function (key, file) {
                let new_link;

                if (file == 99) {
                    new_link = key_to_link(key, `รูปที่ #${order}`);
                } else {
                    new_link = file_to_link(file, `รูปที่ #${order}`);
                }

                const remove_btn = $('<button>').attr('type', 'button').addClass('pic-li-remove-btn').text('ลบ');
                const new_li = $('<li>').append(new_link, remove_btn);

                remove_btn.on('click', function () {
                    delete pic_obj[key];
                    picture_to_li(pic_ul, pic_obj, ref_itm_code);
                });

                li_array.push(new_li);
                order++;
            });
        } else {
            li_array.push($('<li>').text('-- ไม่มีรายการ --'));
        }


        pic_ul.empty();

        li_array.forEach(li => {
            pic_ul.append(li);
        });

    }

    function generate_popup_item_detail(container, info_obj, uploaded_img = {}, viewMode) {
        // Display_img_type -> file for first time uploaded / link for fetching later

        container.empty();

        viewMode = viewMode.toLowerCase();

        const left_div_cont = $('<div>').addClass('popup-item-detal-column-side-div');
        const right_div_cont = $('<div>').addClass('popup-item-detal-column-side-div');

        const info_itmCode = info_obj.itmCode ?? null;
        const info_id_val = info_obj.id;
        const info_name_val = info_obj.name;
        const info_spec_val = info_obj.spec;

        const info_req_val = info_obj.req_val ?? 0;
        const info_note_val = info_obj.note ?? "";
        const info_pic_obj = info_obj.pic_obj ?? {}; // Containing Li of each picture's link

        const element_id = label_value_div('รหัสอะไหล่', info_id_val);
        const element_name = label_value_div('ชื่อ', info_name_val);
        const element_spce = label_value_div('สเปค', info_spec_val);

        const req_quan_input = $('<input>').attr('type', 'text').addClass('req-quantity-input quantity-input').attr('placeholder', 'ระบุจำนวนที่ต้องการ').val(info_req_val);
        const text_area_input = $('<textarea>').css('resize', 'none').addClass('info-textarea-input').attr('placeholder', 'รายละเอียดเพิ่มเติม').val(info_note_val);

        const element_req_quan = $('<div>').addClass('label-element-cont').append($('<label>').addClass('info-label').text("จำนวนต้องการ: "), req_quan_input);
        const element_note_text_area = $('<div>').addClass('label-element-cont').append($('<label>').addClass('info-label').text("รายละเอียดเพิ่มเติม: "), text_area_input);
        const element_picture_list_cont = $('<div>').addClass('item-pic-div pic-div');

        const element_picture_list = $('<ul>').addClass('pic-ul');
        // appeend_li_value
        picture_to_li(element_picture_list, info_pic_obj, info_itmCode);



        const picture_input = $('<input>').attr('type', 'file').attr('accept', '.jpg, .jpeg, .png, .heic, .heif').attr('id', 'item-pic-input').prop('multiple', true).css('display', 'none');
        const picture_input_show = $('<label>').attr('for', 'item-pic-input').addClass('pic-input-label-btn').text('เลือกรูปภาพ');



        req_quan_input.on('input', function () {

            allowFloatingPoint($(this));
        });


        picture_input.on('change', function () {

            const files = $(this).prop('files');
            const maxSize = 16777215; // Medium blob size
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileSize = file.size;
                const fileName = file.name;

                // Check if the file size is within the acceptable range
                if (fileSize <= maxSize) {
                    // Check if the file extension is acceptable
                    const acceptableExtensions = [".jpg", ".jpeg", ".png", ".heic", ".heif"];
                    const fileExtension = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);

                    if (acceptableExtensions.includes(`.${fileExtension}`)) {
                        // Generate a random 6-digit key
                        const unique_key = "img_" + String(parseInt(getObjectLength(uploaded_img)) + 1) + String(Math.floor(10000000 + Math.random() * 90000000));
                        uploaded_img[unique_key] = file;
                    }
                }
            }

            // Refresh the uploaded img display

            picture_to_li(element_picture_list, uploaded_img, info_itmCode);

        });



        element_picture_list_cont.append(element_picture_list);

        left_div_cont.append(element_id, element_name, element_spce, element_req_quan);
        right_div_cont.append(element_note_text_area, element_picture_list_cont, picture_input, picture_input_show);


        if (viewMode === "view") {
            req_quan_input.prop('disabled', true);
            text_area_input.prop('disabled', true);
            picture_input.remove();
            picture_input_show.remove();
            element_picture_list.find('.pic-li-remove-btn').remove();

            if (info_obj.itm_status >= 3) {
                // Already approved
                const approved_req_quan_input = $('<input>').attr('type', 'text').addClass('approved-quantity-input quantity-input').attr('placeholder', 'ระบุจำนวนที่เปิด PR').val(info_obj.cf_val).prop('disabled', true);
                const element_approved_req_quan = $('<div>').addClass('label-element-cont').append($('<label>').addClass('info-label').text("จำนวนเปิด PR: "), approved_req_quan_input);
                element_req_quan.after(element_approved_req_quan);
            }

        } else if (viewMode === "approve") {
            req_quan_input.prop('disabled', true);
            text_area_input.prop('disabled', true);
            picture_input.remove();
            picture_input_show.remove();
            element_picture_list.find('.pic-li-remove-btn').remove();

            // Add approved req quan field
            const approved_req_quan_input = $('<input>').attr('type', 'text').addClass('approved-quantity-input quantity-input').attr('placeholder', 'ระบุจำนวนที่เปิด PR').val(info_obj.cf_val);
            const element_approved_req_quan = $('<div>').addClass('label-element-cont').append($('<label>').addClass('info-label').text("จำนวนเปิด PR: "), approved_req_quan_input);


            approved_req_quan_input.on('input', function () {

                allowFloatingPoint($(this));

                let current_input = parseFloat($(this).val());
                let max_val = parseFloat(req_quan_input.val());

                if (!isNaN(current_input) && !isNaN(max_val)) {
                    if (current_input > max_val) {
                        $(this).val('0'); // Reset input value to 0
                    }
                }

            });

            element_req_quan.after(element_approved_req_quan);
        }



        container.append(left_div_cont, right_div_cont);

    }

    function show_item_popup_content(prCode, itmObj = null, mode = "view") {

        const itmCode = itmObj === null ? false : itmObj.pr_itm_itm_code;

        function get_input_object(sending_part_id, uploaded_img, itmCode = null) {
            const req_quan_value = itm_detail_cont.find('.req-quantity-input').val();
            const info_textarea_value = itm_detail_cont.find('.info-textarea-input').val() == "" ? "-" : itm_detail_cont.find('.info-textarea-input').val();
            const sending_req_quan = (isNaN(parseFloat(req_quan_value)) || req_quan_value == 0) ? false : parseFloat(req_quan_value);
            const sending_info_field = isSafeInput(info_textarea_value);

            if (sending_req_quan !== false && sending_info_field !== false) {

                const sending_form_data = new FormData();

                const sending_obj = {
                    "itmCode": itmCode,
                    "prCode": prCode,
                    "part_id": sending_part_id,
                    "info_field": sending_info_field,
                    "req_quan": sending_req_quan,
                    "uploaded_img": uploaded_img
                }


                for (const key in sending_obj) {
                    // Check if the property is not "false"
                    if (sending_obj[key] !== false) {
                        // Append the property and its value to the FormData object
                        if (key === "uploaded_img") {
                            for (const img_key in sending_obj[key]) {
                                sending_form_data.append(img_key, sending_obj[key][img_key]);
                            }
                            continue;
                        }
                        sending_form_data.append(key, sending_obj[key]);
                    }
                }
                return sending_form_data;


            } else {
                alert('มีการกรอกข้อมูลไม่ถูกต้อง ห้ามการใช้อักขระพิเศษในการกรอกข้อมูลรายระเอียด และจำเป็นต้องระบุจำนวนต้องการ');
                return false;
            }
        }


        const btn_div = $('<div>').addClass('center-btn-cont');
        const record_btn = $('<button>').attr('type', 'button').addClass('oper-btn record_btn').text('บันทึก');
        const del_itm_btn = $('<button>').attr('type', 'button').addClass('oper-btn del_itm_btn').text('ลบรายการ');
        const itm_detail_cont = $('<div>').attr('id', 'popup-itm-detail-cont');



        del_itm_btn.on('click', function () {
            // Alert of confirmation then delete item

            if (!itmCode) {
                return false;
            }
            const confirm_deletion = `ยืนยันยกเลิกรายการสิ้นค้านี้?`;
            if (confirm(confirm_deletion)) {
                fetchObjects([{ "name": "remove_item", "arg": { "itmCode": itmCode } }]).then(function (data) {
                    if (data.remove_item.status) {
                        alert('ยกเลิกรายการสินค้าสำเร็จ');
                        appendFormField(page, prCode, false);
                        close_btn.trigger('click');
                        return true;

                    } else {
                        throw new Error('Query Error');
                    }


                })
                    .catch((error) => {
                        console.log(error);
                        alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                        return false;
                    });




            } else {
                return false;
            }

        });

        popupContent.empty();

        fetchObjects([{ "name": "fetch_part_list", "arg": "" }, { "name": "fetch_requested_pr_part_id", "arg": { "prCode": prCode } }]).then(function (data) {

            let requested_part_id = data.fetch_requested_pr_part_id.requested_part_id;


            if (mode === "view") {

                const uploaded_img = {};

                fetchObjects([{ "name": "fetch_uploaded_img_key", "arg": { "itmCode": itmCode } }]).then(function (data) {

                    if (data.fetch_uploaded_img_key.status) {

                        data.fetch_uploaded_img_key.uploaded_img_key.forEach(img_key => {
                            uploaded_img[img_key] = 99;
                        });

                        const info_struct = {
                            "itmCode": itmObj.pr_itm_itm_code,
                            "id": itmObj.pr_itm_part_id,
                            "name": itmObj.pr_itm_part_name,
                            "spec": itmObj.pr_itm_part_spec,
                            "req_val": itmObj.pr_itm_req_quan,
                            "note": itmObj.pr_itm_note,
                            "cf_val": itmObj.pr_itm_cf_quan,
                            "itm_status": itmObj.pr_itm_itm_status,
                            "pic_obj": uploaded_img,
                        }

                        generate_popup_item_detail(itm_detail_cont, info_struct, uploaded_img, mode);




                    } else {
                        throw new Error('Fetching img_key error');
                    }

                });

                record_btn.remove();


            } else if (mode === "edit") {

                // Fetch uploaded img (Just for the key -> Deisplaying will be handle in another PHP file)
                // Manipulate itmObj's keys
                // Call function to display data
                const uploaded_img = {};

                fetchObjects([{ "name": "fetch_uploaded_img_key", "arg": { "itmCode": itmCode } }]).then(function (data) {

                    if (data.fetch_uploaded_img_key.status) {

                        data.fetch_uploaded_img_key.uploaded_img_key.forEach(img_key => {
                            uploaded_img[img_key] = 99;
                        });

                        const info_struct = {
                            "itmCode": itmObj.pr_itm_itm_code,
                            "id": itmObj.pr_itm_part_id,
                            "name": itmObj.pr_itm_part_name,
                            "spec": itmObj.pr_itm_part_spec,
                            "req_val": itmObj.pr_itm_req_quan,
                            "note": itmObj.pr_itm_note,
                            "cf_val": itmObj.pr_itm_cf_quan,
                            "itm_status": itmObj.pr_itm_itm_status,
                            "pic_obj": uploaded_img,
                        }

                        generate_popup_item_detail(itm_detail_cont, info_struct, uploaded_img, mode);




                    } else {
                        throw new Error('Fetching img_key error');
                    }

                });
                record_btn.off();
                record_btn.on('click', function () {
                    // UPDATE
                    const part_id = itmObj.pr_itm_part_id;
                    const sending_img = uploaded_img;
                    const sending_obj = get_input_object(part_id, sending_img, itmCode);

                    if (sending_obj === false) {
                        return false;
                    }

                    // FetchObject
                    $.ajax({
                        url: 'fetch_prequest_file_upload.php',
                        type: 'POST',
                        data: sending_obj,
                        processData: false,  // Prevent jQuery from processing data
                        contentType: false,  // Set content type to false for FormData
                        success: function (data) {
                            data = JSON.parse(data);
                            if (data.status) {
                                alert('บันทึกสำเร็จ');
                                appendFormField(page, prCode, false);
                                close_btn.trigger('click');

                                return;
                            } else {
                                throw new Error('Query Erorr');
                            }
                        },
                        error: function (error) {

                            throw new Error(error);
                        }

                    });


                });
                btn_div.append(record_btn, del_itm_btn);

            } else if (mode === "approve") {
                const uploaded_img = {};

                fetchObjects([{ "name": "fetch_uploaded_img_key", "arg": { "itmCode": itmCode } }]).then(function (data) {

                    if (data.fetch_uploaded_img_key.status) {

                        data.fetch_uploaded_img_key.uploaded_img_key.forEach(img_key => {
                            uploaded_img[img_key] = 99;
                        });

                        const info_struct = {
                            "itmCode": itmObj.pr_itm_itm_code,
                            "id": itmObj.pr_itm_part_id,
                            "name": itmObj.pr_itm_part_name,
                            "spec": itmObj.pr_itm_part_spec,
                            "req_val": itmObj.pr_itm_req_quan,
                            "cf_val": itmObj.pr_itm_cf_quan,
                            "note": itmObj.pr_itm_note,
                            "itm_status": itmObj.pr_itm_itm_status,
                            "pic_obj": uploaded_img,
                        }

                        generate_popup_item_detail(itm_detail_cont, info_struct, uploaded_img, mode);




                    } else {
                        throw new Error('Fetching img_key error');
                    }

                });


                record_btn.off();
                record_btn.on('click', function () {
                    // UPDATE and further approval -> sub item approval
                    // Validate if approved_quan <= req_quan

                    const req_quan_value = itm_detail_cont.find('.req-quantity-input').val();
                    const approved_quan_value = itm_detail_cont.find('.approved-quantity-input').val();

                    const req_quan = (isNaN(parseFloat(req_quan_value))) ? false : parseFloat(req_quan_value)
                    const approved_quan = (isNaN(parseFloat(approved_quan_value))) ? false : parseFloat(approved_quan_value)

                    if ((req_quan === false || approved_quan === false) || (approved_quan > req_quan)) {
                        alert('จำนวนเปิด PR ไม่ถูกต้อง');
                        return false;
                    }


                    // Proceed

                    fetchObjects([{ "name": "sub_confirm_openPR_item", "arg": { "itmCode": itmCode, "req_quan": req_quan, "cf_quan": approved_quan } }]).then(function (data) {
                        if (data.sub_confirm_openPR_item.status) {
                            alert('ยืนยันสำเร็จ');
                            appendFormField(page, prCode, false);
                            close_btn.trigger('click');
                            return true;
                        }

                    })
                        .catch((error) => {
                            console.log(error);
                            return false;
                        });



                });
                btn_div.append(record_btn);

            } else if (mode === "new") {
                let partsArrays;
                if (!data.fetch_part_list.status) {
                    throw new Error('Query Error');
                } else {
                    partsArrays = data.fetch_part_list.part;
                }
                let select_options = `<option value="" selected disabled>-- โปรดระบุ --</option>`;
                partsArrays.forEach(part => {
                    select_options += `<option value="${part.id}" ${requested_part_id.includes(Number(part.id)) ? "disabled" : ""}>${part.id}: ${part.name} | ${part.spec}</option>`;
                });

                const part_select_element = $('<select>').attr('id', 'itm-select').html(select_options);

                popupContent.prepend(part_select_element);

                part_select_element.on('change', function () {
                    let selected = $(this).val();
                    let selected_itm = $.grep(partsArrays, function (obj) {
                        return obj.id == selected;
                    });

                    if (selected_itm.length != 1) {
                        throw new Error('Error of Itm array');
                    } else { selected_itm = selected_itm[0]; }


                    let uploaded_img = {};
                    generate_popup_item_detail(itm_detail_cont, selected_itm, uploaded_img, mode);

                    record_btn.off();
                    record_btn.on('click', function () {
                        // INSERT
                        const part_id = part_select_element.val();
                        const sending_img = uploaded_img;
                        const sending_obj = get_input_object(part_id, sending_img);

                        if (sending_obj === false) {
                            return false;
                        }

                        // FetchObject
                        $.ajax({
                            url: 'fetch_prequest_file_upload.php',
                            type: 'POST',
                            data: sending_obj,
                            processData: false,  // Prevent jQuery from processing data
                            contentType: false,  // Set content type to false for FormData
                            success: function (data) {
                                data = JSON.parse(data);
                                if (data.status) {
                                    alert('บันทึกสำเร็จ');
                                    appendFormField(page, prCode, false);
                                    close_btn.trigger('click');

                                    return;
                                } else {
                                    throw new Error('Query Erorr');
                                }
                            },
                            error: function (error) {

                                throw new Error(error);
                            }

                        });


                    });

                });




                btn_div.append(record_btn);

            } else {

                throw new Error('Invalid Mode');
            }



            popupContent.append(itm_detail_cont, btn_div);

            popupElement.css('display', 'block');
            overlayElement.css('display', 'block');


        })
            .catch((error) => {
                popupContent.empty();
                console.log(error);
                alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                return false;
            });


    }



    function generated_requested_table(tableData) {
        // Return table element

        const table = $('<table>').addClass('small-table fixed-header-table').attr('id', 'requested-table');
        const thead = $('<thead>').html(`
    <tr>
    <th>#</th>
    <th>Ref.</th>
    <th>วันที่แจ้ง</th>
    <th class="part-detail-fixed-column">รายการ</th>
    <th>ต้องการก่อนวันที่</th>
    <th>สถานะ</th>
    </tr>
    `);

        const tbody = $('<tbody>');


        if (getObjectLength(tableData) > 0) {


            let itmOrder = 1;

            $.each(tableData, function (key, value) {
                let dataRow = tableData[key];
                let itmlist = $("<div>").addClass('item-list-div');
                let itmUl = $('<ul>').addClass('item-list-tr-ul');
                itmlist.append(itmUl);

                $.each(dataRow.itmlist, function (itmId, itmVal) {
                    let itmRow = dataRow.itmlist[itmId];
                    itmUl.append($('<li>').text(`${itmRow.pr_itm_part_id}: ${itmRow.pr_itm_part_name}`));
                });

                let newRow = $('<tr>').attr('data-prCode', `${dataRow.prCode}`).addClass('pr-data-detail').html(`
            <td>${itmOrder}</td>
            <td>${dataRow.prCode}</td>
            <td>${formatDate(dataRow.informDate)}</td>
            <td>${itmlist.prop('outerHTML')}</td>
            <td>${formatDate(dataRow.reqByDate)}</td>
            <td>${dataRow.prStatus_name}</td>
        `);

                let content = `Ref. <span style="color:#28b974;">${dataRow.prCode}</span> คลิกเพื่อดูรายละเอียด`;
                generate_tooltip(newRow, content);



                newRow.on('click', () => {

                    appendFormField(page, dataRow.prCode, false);

                });
                itmOrder += 1;
                tbody.append(newRow);
            });




        } else {
            let newRow = `<tr><td colspan="6" style="text-align:center;"><b><u>-- ไม่มีรายการแจ้งซื้อ --</u></b></td></tr>`;
            tbody.append(newRow);
        }

        table.append(thead, tbody);


        return table;
    }



    function generate_form_field(prCode = null, access = false) {

        return new Promise((resolve, reject) => {
            if (page.find('#form-field').length !== 0) {
                page.find('#form-field').remove();
            }

            fetchObjects([{ "name": "fetch_group_type_selection", "arg": "" }, { "name": "fetch_requested_pr", "arg": { "prCode": prCode } }]).then(function (data) {
                if (data.fetch_group_type_selection.status && data.fetch_requested_pr.status) {

                    function get_validate_update_pr_info() {
                        try {
                            // Get value
                            const group_select_val = group_select_element.val();
                            const job_select_val = job_select_element.val();
                            let req_date_select_val = (new Date(req_date_select_element.val()));
                            let valid_flag = true;
                            // Validate
                            let todayDate = new Date().toISOString().split('T')[0];

                            if (isNaN(parseInt(group_select_val)) || isNaN(parseInt(job_select_val))) {
                                valid_flag = false;
                            }

                            if (req_date_select_val.getTime() < (new Date(todayDate)).getTime()) {
                                valid_flag = false;
                            } else {
                                req_date_select_val = req_date_select_val.toISOString().split('T')[0];
                            }

                            // Query

                            // Check if any items assosiate with the PR or not -> If not any yet/ Do not proceed.


                            if (valid_flag) {



                                fetchObjects([{ "name": "confirm_pr", "arg": { "prCode": prCode, "group": group_select_val, "job": job_select_val, "reqBy_date": req_date_select_val } }]).then(function (data) {

                                    if (data.confirm_pr.status) {

                                        const error_code = data.confirm_pr.err ?? false;
                                        if (error_code) {
                                            throw new Error(error_code);
                                        } else {
                                            alert('แจ้งความต้องการเสร็จสิ้น');
                                            location.reload();
                                            return true;
                                        }


                                    } else {
                                        throw new Error('400');
                                    }


                                })
                                    .catch((error) => {
                                        error = error.message;
                                        console.log(error);

                                        if (error === '100') {
                                            alert('กรอกข้อมูลไม่ครบถ้วน');
                                        } else if (error === '200') {
                                            alert('ไม่สามารถบันทึกรายการเปล่าได้');
                                        } else {
                                            alert('เกิดข้อผิดพลาดในระบบ กรุณารีเฟรช');
                                        }

                                    });


                            } else {
                                throw new Error("100");
                            }

                        } catch (error) {


                            if (error) {
                                error = error.message;
                                console.log(error);
                                if (error === '100') {
                                    alert('กรอกข้อมูลไม่ครบถ้วน');
                                } else if (error === '200') {
                                    alert('ไม่สามารถบันทึกรายการเปล่าได้');
                                } else {
                                    alert('เกิดข้อผิดพลาดในระบบ กรุณารีเฟรช');
                                }
                            }


                            return false;

                        }
                    }


                    const group_obj = data.fetch_group_type_selection.group;
                    const job_obj = data.fetch_group_type_selection.job;

                    let current_PR = data.fetch_requested_pr.tableData[prCode];
                    console.log(data.fetch_requested_pr);
                    const pr_Status = current_PR.prStatus;
                    // status: 0 -> Temporary: Editable and Removable items,
                    // status: 1 -> Wait for approval: display approval table

                    const operPR_btn_cont = $('<div>').addClass('operPR-div inline-element-div');
                    const confirm_openPR_btn = $('<button>').attr('type', 'button').addClass('oper-btn').attr('id', 'confirm-openPr-btn').text('เริ่มดำเนินการเปิด PR');
                    const done_openPR_btn = $('<button>').attr('type', 'button').addClass('oper-btn').attr('id', 'done-openPr-btn').text('ยืนยันการเปิด PR ครบถ้วน');
                    const confirmPR_btn = $('<button>').attr('type', 'button').addClass('oper-btn').attr('id', 'confirmPr-btn').text('ยืนยันแจ้งความต้องการ');
                    const delPR_btn = $('<button>').attr('type', 'button').addClass('oper-btn').attr('id', 'delPr-btn').text('ลบรายการแจ้ง');

                    operPR_btn_cont.append(confirm_openPR_btn, done_openPR_btn, confirmPR_btn, delPR_btn);


                    if (pr_Status == 1) {
                        confirmPR_btn.text('อัพเดทข้อมูล');
                    }

                    if (whoamiObj.role_rank < 3) {
                        // normal user

                        confirm_openPR_btn.remove();
                        done_openPR_btn.remove();

                        if (pr_Status >= 2) {
                            // PR opened already
                            operPR_btn_cont.remove();
                        }


                    } else {
                        // approve user

                        if (pr_Status == 0) {
                            confirm_openPR_btn.remove();
                            done_openPR_btn.remove();
                        } else if (pr_Status == 1) {
                            done_openPR_btn.remove();
                        }
                        else if (pr_Status == 2) {
                            confirm_openPR_btn.remove();
                            confirmPR_btn.remove();

                        } else if (pr_Status == 3) {
                            // Done opening PR
                            confirmPR_btn.remove();
                            delPR_btn.remove();
                            confirm_openPR_btn.remove();
                            done_openPR_btn.remove();
                        } else if (pr_Status > 3) {
                            // View Only
                            operPR_btn_cont.remove();
                        }

                    }

                    confirm_openPR_btn.on('click', () => {

                        // Call ajax function to Change PR and itmes' status to 2 -> This Allow The approve popup to be shown

                        if (!confirm("ยืนยันการดำเนินการ? หลังยืนยันจะไม่สามารถแก้ไขข้อมูลการแจ้งความต้องการได้")) {
                            return false;
                        }

                        fetchObjects([{ "name": "confirm_openPR", "arg": { "prCode": prCode } }]).then(function (data) {
                            if (data.confirm_openPR.status) {

                                appendFormField(page, prCode, access);
                                return;

                            } else {
                                throw new Error('Query Error');
                            }


                        })
                            .catch((error) => {
                                console.log(error);
                                alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                                return false;
                            });

                    });

                    done_openPR_btn.on('click', () => {
                        // Call ajax function to Change PR and items status to 3 -> 

                        popupContent.empty();

                        const detail_div = $('<div>').addClass('center-elements');
                        const real_prInput = $('<input>').attr('type', 'text').attr('id', 'real-pr-input').attr('placeholder', 'ระบุเลข PR (สามารถไม่ระบุได้)');
                        const confirm_done_btn = $('<button>').attr('type', 'button').addClass('oper-btn record_btn').text('ไม่ระบุ PR');

                        const element_real_pr_input = $('<div>').addClass('label-element-cont-center').append($('<label>').addClass('info-label').text("เลข PR: "), real_prInput);

                        const btn_div = $('<div>').addClass('center-btn-cont');

                        detail_div.append(element_real_pr_input);
                        btn_div.append(confirm_done_btn);

                        popupContent.append(detail_div, btn_div);


                        real_prInput.on('input', function () {
                            let input_val = $(this).val();
                            if (input_val == "") {
                                confirm_done_btn.text('ไม่ระบุ PR');
                            } else {
                                confirm_done_btn.text('ยืนยันเลข PR');
                            }

                        });

                        confirm_done_btn.on('click', function () {
                            let pr_input = (real_prInput.val() == "" ? "-" : real_prInput.val());

                            let real_pr = isSafeInput(pr_input);

                            if (real_pr === false) {
                                alert('ห้ามการใช้อักขระพิเศษในการกรอกข้อมูล');
                                return false;
                            } else if (real_pr == "-") {

                                real_pr = "null";
                            }


                            if (!confirm("ยืนยันการดำเนินการ? หลังยืนยันจะไม่สามารถแก้ไขข้อมูลได้")) {
                                return false;
                            }

                            fetchObjects([{ "name": "done_openPR", "arg": { "prCode": prCode, "real_pr": real_pr } }]).then(function (data) {
                                if (data.done_openPR.status) {
                                    alert('ยืนยันรายการสำเร็จ');
                                    location.reload();
                                    return;

                                } else {
                                    throw new Error('Query Error');
                                }


                            })
                                .catch((error) => {
                                    console.log(error);
                                    alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                                    return false;
                                });

                        });






                        popupElement.css('display', 'block');
                        overlayElement.css('display', 'block');











                    });


                    confirmPR_btn.on('click', () => {

                        // get and validate information of group/type/req_quan/...
                        // Update always set status to 1
                        get_validate_update_pr_info();

                        return false;

                    });

                    delPR_btn.on('click', () => {

                        if (!confirm('ยืนยันการลบรายการแจ้ง?')) {
                            return false;
                        }

                        fetchObjects([{ "name": "delete_pr", "arg": { "prCode": prCode } }]).then(function (data) {
                            if (data.delete_pr) {
                                alert('ลบรายการสำเร็จ');
                                location.reload();
                                return;

                            } else {
                                throw new Error('Query Error');
                            }


                        })
                            .catch((error) => {
                                console.log(error); row
                                alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                                return false;
                            });
                    });

                    const container = $('<div>').addClass('block-container').attr('id', 'form-field');

                    // group_job_block
                    const group_job_block = $('<div>').addClass('sub-form-field').attr('id', 'group-job-block');

                    const prCodeText = current_PR.prCode ? current_PR.prCode : "รายการใหม่";
                    const selected_group = current_PR.prGroup ? current_PR.prGroup : "";
                    const selected_type = current_PR.prType ? current_PR.prType : "";
                    const selected_reqBy_date = (new Date((Math.max(new Date(current_PR.reqByDate ? current_PR.reqByDate : null), (new Date()))))).toISOString().split('T')[0];
                    const prCode_label = $('<label>').attr('id', 'prCode-label').html(`Ref: <b>${prCodeText}<b>`);
                    const group_select_div = $('<div>').addClass('inline-label-select').append($('<label>').addClass('topic-label').text('หน่วยงาน: ').css('font-weight', 'bold'));
                    const job_select_div = $('<div>').addClass('inline-label-select').append($('<label>').addClass('topic-label').text('ประเภทงาน: ').css('font-weight', 'bold'));

                    const group_select_element = $('<select>').addClass('group-job-select-element').attr('id', 'group-select').html(object_to_options(group_obj, selected_group, "obj"));
                    const job_select_element = $('<select>').addClass('group-job-select-element').attr('id', 'job-select').html(object_to_options(job_obj, selected_type, "obj"));

                    if (selected_group !== "") {
                        group_select_element.val(selected_group);
                    }
                    if (selected_type !== "") {
                        job_select_element.val(selected_type);
                    }

                    const req_date_select_div = $('<div>').addClass('inline-label-select').append($('<label>').addClass('topic-label').text('ต้องการภายใน: ').css('font-weight', 'bold'));
                    const req_date_select_element = $('<input>').attr('type', 'text').addClass('flatpickr').attr('id', 'req-date-select');




                    req_date_select_div.append(req_date_select_element);

                    req_date_select_div.find('.flatpickr').flatpickr({
                        altInput: true,
                        altFormat: "j F Y",
                        dateFormat: 'Y-m-d', // Date format (YYYY-MM-DD)
                        minDate: 'today',
                        disableMobile: "true",
                        defaultDate: selected_reqBy_date,
                    });


                    if (parseInt(pr_Status) > 1) {
                        group_select_element.prop('disabled', true);
                        job_select_element.prop('disabled', true);
                        req_date_select_div.find('.flatpickr').remove();

                        req_date_select_div.append(` ${formatDate(current_PR.reqByDate)} ${calculateDateDiff(current_PR.reqByDate)}`);

                    }

                    group_select_div.append(group_select_element);
                    job_select_div.append(job_select_element);

                    group_job_block.append(prCode_label, group_select_div, job_select_div, req_date_select_div);



                    // End group_job_block

                    const detail_table_block = $('<div>').addClass('sub-form-field').attr('id', 'detail-table-block');

                    const detail_table_cont = $('<div>').addClass('scroll-table-cont').attr('id', 'pr-detail-table-cont');



                    const detail_table = $('<table>').addClass('small-table fixed-header-table').attr('id', 'pr-detail-table');

                    const detail_thead = $('<thead>').html(`
    <tr>
    <th>#</th>
    <th class="part-detail-fixed-column">รายการ</th>
    <th>จำนวนแจ้ง</th>
    <th>จำนวนเปิด PR</th>
    <th>สถานะ</th>
    <th></th>
    </tr>
    `);

                    const detail_tbody = $('<tbody>');
                    const newItem_button = $('<button>').attr('type', 'button').addClass('oper-btn').attr('id', 'new-item-btn').text("+");

                    newItem_button.on('click', function () {
                        // Display small popup just select/ Edit / Delete the information relate to itmes
                        show_item_popup_content(prCode, null, "new");


                    });

                    let order = 1;
                    $.each(current_PR.itmlist, function (itmCode, detail_obj) {

                        const itm_status = detail_obj.pr_itm_itm_status;
                        const itm_edit_btn = $('<button>').attr('type', 'button').addClass('bg-oper-btn bg-oper-btn-temp bg-edit-btn').attr('data-itmCode', detail_obj.pr_itm_itm_code);
                        const itm_del_btn = $('<button>').attr('type', 'button').addClass('bg-oper-btn bg-oper-btn-temp bg-del-btn').attr('data-itmCode', detail_obj.pr_itm_itm_code);
                        const itm_approve_btn = $('<button>').attr('type', 'button').addClass('bg-oper-btn bg-oper-btn-approve bg-approve-btn').attr('data-itmCode', detail_obj.pr_itm_itm_code);
                        const item_edit_approved_btn = $('<button>').attr('type', 'button').addClass('bg-oper-btn bg-oper-btn-edit-approve bg-edit-approve-btn').attr('data-itmCode', detail_obj.pr_itm_itm_code);
                        const item_view_btn = $('<button>').attr('type', 'button').addClass('bg-oper-btn bg-oper-btn-view-item bg-view-item-btn').attr('data-itmCode', detail_obj.pr_itm_itm_code);
                        let newRow = `
        <tr class="itm-detail-row">
        <td>${order}</td>
        <td>ID: ${detail_obj.pr_itm_part_id} - ${detail_obj.pr_itm_part_name}<br><div class="scroll-inline-text">${detail_obj.pr_itm_part_spec}</div></td>
        <td>${detail_obj.pr_itm_req_quan}</td>
        <td>${detail_obj.pr_itm_cf_quan}</td>
        <td>${detail_obj.pr_itm_itm_status_name}</td>
        <td>${itm_status <= 1 ? itm_edit_btn.prop('outerHTML') : ""} ${itm_status <= 1 ? itm_del_btn.prop('outerHTML') : ""} ${itm_status == 2 ? itm_approve_btn.prop('outerHTML') : ""} ${itm_status == 6 ? item_edit_approved_btn.prop('outerHTML') : ""} ${(itm_status >= 3 && itm_status != 6) ? item_view_btn.prop('outerHTML') : ""}</td>
        </tr>
        `;
                        order++;
                        detail_tbody.append(newRow);
                    });


                    detail_tbody.find(".itm-detail-row ").on('click', '.bg-del-btn', function () {
                        let itmCode = $(this).attr('data-itmCode');
                        const confirm_deletion = `ยืนยันยกเลิกรายการสิ้นค้านี้?`;
                        if (confirm(confirm_deletion)) {
                            fetchObjects([{ "name": "remove_item", "arg": { "itmCode": itmCode } }]).then(function (data) {
                                if (data.remove_item.status) {
                                    alert('ยกเลิกรายการสินค้าสำเร็จ');

                                    appendFormField(page, prCode, access);
                                    return true;

                                } else {
                                    throw new Error('Query Error');
                                }


                            })
                                .catch((error) => {
                                    console.log(error);
                                    alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                                    return false;
                                });




                        } else {
                            return false;
                        }

                    });

                    // detail_tbody.find(".itm-detail-row ").on('click', '.bg-view-item-btn', function () {
                    //     console.log('hi');
                    //     let itmCode = $(this).attr('data-itmCode');
                    //     let itmObj = current_PR.itmlist[itmCode];
                    //     show_item_popup_content(prCode, itmObj, "view");

                    // });


                    if (pr_Status == 0 || pr_Status == 1) {
                        // Temporary
                        container.prepend(operPR_btn_cont);
                        detail_tbody.append($('<tr>').addClass('new-item-row').append($('<td>').attr('colspan', 6).append(newItem_button)));


                        detail_tbody.find(".itm-detail-row ").on('click', '.bg-edit-btn', function () {
                            let itmCode = $(this).attr('data-itmCode');
                            let itmObj = current_PR.itmlist[itmCode];
                            show_item_popup_content(prCode, itmObj, "edit");

                        });



                    } else if (pr_Status == 2) {
                        // Uneditable -> Approving
                        // detail_tbody.find(".itm-detail-row .bg-oper-btn").remove();
                        container.prepend(operPR_btn_cont);
                        detail_tbody.find(".itm-detail-row ").on('click', '.bg-approve-btn, .bg-edit-approve-btn', function () {
                            let itmCode = $(this).attr('data-itmCode');
                            let itmObj = current_PR.itmlist[itmCode];
                            show_item_popup_content(prCode, itmObj, "approve");

                        });

                    } else {
                        // View Only (after approving)
                        detail_tbody.find(".itm-detail-row ").on('click', '.bg-view-item-btn', function () {
                            let itmCode = $(this).attr('data-itmCode');
                            let itmObj = current_PR.itmlist[itmCode];
                            show_item_popup_content(prCode, itmObj, "view");

                        });
                    }
                    detail_table.append(detail_thead, detail_tbody);

                    detail_table_cont.append(detail_table);
                    detail_table_block.append(detail_table_cont);
                    container.append(group_job_block, detail_table_block);
                    resolve(container);
                } else {
                    throw new Error('Query Error');
                }
            })
                .catch((error) => {
                    console.log(error);
                    alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                    resolve(false);
                });

        });
    }


    function init_elements() {
        let tableData;
        let requested_itmData;
        let ss_alert_Data;

        close_btn.on('click', () => {
            popupContent.empty();
            popupElement.css('display', 'none');
            overlayElement.css('display', 'none');
        });

        $("#small-popup-close").click(function () {
            small_popup_div.fadeOut();
            small_popup_content.empty();
        });


        whoamina().then(function (data) {

            whoamiObj = data;

            fetchObjects([{ "name": "clean_one_year_pr", "arg": "" }, { "name": "clean_old_tmp_pr", "arg": "" }, { "name": "fetch_requested_pr", "arg": "" }, { "name": "fetch_requested_items", "arg": "" }, { "name": "check_ss_alert", "arg": "" }]).then(function (data) {
                if (data.fetch_requested_pr.status && data.fetch_requested_items.status && data.check_ss_alert.status) {
                    tableData = data.fetch_requested_pr.tableData;
                    requested_itmData = data.fetch_requested_items.requested_item;
                    ss_alert_Data = data.check_ss_alert.ss_alert;

                    const below_safety_stock_alert_element = generate_below_ss_alert(ss_alert_Data);
                    const requested_itm_element = generate_requested_items_element(requested_itmData);
                    const requestedPR_element = generate_requested_element(tableData);
                    page.prepend(below_safety_stock_alert_element, requested_itm_element, requestedPR_element);
                } else {
                    throw new Error('Query Erorr');
                }

            });
        })
            .catch((error) => {
                console.log(error);
                alert('เกิดข้อผิดพลาด กรุณารีเฟรช');
                return false;

            });
    }


    init_navAndLoad();

    //Const Declaration

    const page = $('#pg-cont');
    var whoamiObj;
    const small_popup_div = $('#small-popup');
    const small_popup_content = $('.small-popup-content');
    const popupElement = $('#edit-popUpForm');
    const overlayElement = $('#dark-overlay');

    const popupContent = $('#form-context');
    const close_btn = $('#closepopUp');


    // ENd Const Declaration

    init_elements();


});
