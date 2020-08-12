let tdid;
let tcl;

class UpdateButton {
    btn;
    parent;

    constructor(btn, parent) {
        this.btn = btn;
        this.parent = parent;

        btn.onclick = (() => {
            this.disabled = true;
            this.sendRequestUpdateTestCase();
        }).bind(this);
    }

    get disabled() { return this.btn.disabled; }
    set disabled(value) { this.btn.disabled = value; }

    sendRequestUpdateTestCase() {
        $.ajax({
            type: "POST",
            url: "update_dependent_test_case",
            datatype: "json",
            data: { 
                test_dialplan_id: tdid,
                id: this.parent.id.innerHTML,
                priority: this.parent.priority.value,
                status: this.parent.status.value,
                result: this.parent.result.value
            },
            success: (response) => { alert("Cập nhật thành công"); console.log(response) },
            failure: (response) => { alert("Cập nhật thất bại"); },
        });
    }
}


class SelectCheckbox {
    cbx;
    parent;

    constructor(cbx, parent) {
        this.cbx = cbx;
        this.parent = parent;

        this.cbx.onclick = (() => { this.changeData(); }).bind(this);
    }

    changeData() {
        if (this.cbx.checked) {
            this.sendRequestAddTestCase();
            this.parent.status.disabled = false;
            this.parent.result.disabled = false;
            this.parent.priority.disabled = false;
            this.parent.status.setColor();
        } else {
            this.sendRequestRemoveTestCase();
            this.parent.status.disabled = true;
            this.parent.result.disabled = true;
            this.parent.priority.disabled = true;
            this.parent.update.disabled = true;
            this.parent.status.removeColor();
        }
    }

    get checked() { return this.cbx.checked; }
    set checked(checked) { this.cbx.checked = checked; }

    sendRequestAddTestCase() {
        $.ajax({
            type: "POST",
            url: "add_dependent_test_case",
            datatype: "json",
            data: { 
                test_dialplan_id: tdid, 
                id: this.parent.id.innerHTML,
                status: this.parent.status.value,
                result: this.parent.result.value
            },
        });
    }

    sendRequestRemoveTestCase() {
        $.ajax({
            type: "POST",
            url: "remove_dependent_test_case",
            datatype: "json",
            data: { 
                test_dialplan_id: tdid, 
                id: this.parent.id.innerHTML,
            },
        });
    }
}

class Status {
    select;
    parent;

    constructor(select, parent) {
        this.select = select;
        this.parent = parent;

        this.select.onchange = (() => {
            this.setColor();
            parent.update.disabled = false;
        }).bind(this);
    }

    get selectedIndex() { return this.select.selectedIndex; }
    set selectedIndex(index) { this.select.selectedIndex = index; }
    set disabled(disable) { this.select.disabled = disable; }
    get value() { return this.select.value; }

    setColor() {
        this.select.style.color = this.select.selectedIndex == Status.FAILED ? "red" : "green";
    }

    removeColor() {
        this.select.style.color = "";
    }
}

Status.FAILED = 0;
Status.PASSED = 1;

Status.dict = {
    "failed": Status.FAILED,
    "passed": Status.PASSED,
};


class TestCase {
    tr;
    update;
    select;
    status;
    
    get id() { return this.tr.getElementsByClassName('id')[0]; }
    get name() { return this.tr.getElementsByClassName('name')[0]; }
    get result() { return this.tr.getElementsByClassName('result')[0]; }
    get info() { return this.tr.getElementsByClassName('info')[0]; }
    get priority() { return this.tr.getElementsByClassName('priority')[0]; }

    constructor() {
        this.tr = document.createElement('tr');
        this.tr.classList.add('gradeX');

        this.setHTML();
        this.update = new UpdateButton(this.tr.getElementsByClassName('update')[0], this);
        this.select = new SelectCheckbox(this.tr.getElementsByClassName('select')[0], this);

        this.status = new Status(this.tr.getElementsByClassName('status')[0], this);
        this.result.onchange = (() => { this.update.disabled = false; }).bind(this);
        this.priority.onchange = (() => { this.update.disabled = false; }).bind(this);

        this.info.onclick = (() => { 
            location.href = "/info_test_case?test_case_id=" + this.id.innerHTML + "&active=" + this.select.checked + "&test_dialplan_id=" + tdid; 
        }).bind(this);
    }

    setHTML() {
        this.tr.innerHTML = /*html*/`
            <td>
                <input type="checkbox" class="select">
                <label>Select</label>
            </td>
            <td><input type="number" name="priority" class="priority form-control" min="1" step="1"></td>
            <td><span class="id" name="id"></span></td>
            <td><span class="name"></span></td>
            <td>
                <select name="status" class="status form-control">
                    <option value="failed" class="red">Failed</option>
                    <option value="passed" class="green">Passed</option>        
                </select>
            </td>
            <td><input type="text" name="result" class="result form-control"></td>
            <td><button type="button" class="update btn btn-primary">Update</button></td>
            <td><button type="button" class="info btn btn-primary">Xem</button></td>
        `;
    }


    setNewHTML(html) {
        html.getElementsByClassName('select')[0].checked = this.select.checked;

        html.getElementsByClassName('priority')[0].value = this.priority.value;


        html.getElementsByClassName('status')[0].value = this.status.value;
        

        html.getElementsByClassName('result')[0].value = this.result.value;

        
    }

    setNewEvent() {
        this.update = new UpdateButton(this.tr.getElementsByClassName('update')[0], this);
        this.select = new SelectCheckbox(this.tr.getElementsByClassName('select')[0], this);

        this.status = new Status(this.tr.getElementsByClassName('status')[0], this);
        this.result.onchange = (() => { this.update.disabled = false; }).bind(this);
        this.priority.onchange = (() => { this.update.disabled = false; }).bind(this);

        this.info.onclick = (() => { 
            location.href = "/info_test_case?test_case_id=" + this.id.innerHTML + "&active=" + this.select.checked + "&test_dialplan_id=" + tdid; 
        }).bind(this);
    }
}

class TestCaseList {

    tbody;
    testCaseList = [];

    constructor(tbody) {
        this.tbody = tbody;
    }

    addTestCase(id, name, priority, status, select, result) {
        let tc = new TestCase(tdid);

        tc.id.innerHTML = id;
        tc.name.innerHTML = name;

        tc.priority.value = priority;
        tc.priority.disabled = !select;

        tc.status.selectedIndex = Status.dict[status];
        tc.status.disabled = !select;
        if (select) {
            tc.status.setColor();
        }

        tc.select.checked = select;
        
        tc.result.value = result;
        tc.result.disabled = !select;

        tc.update.disabled = true;
        this.tbody.appendChild(tc.tr);
        this.testCaseList.push(tc);
    }

    sort() {
        this.testCaseList.sort((lhs, rhs) => {
            if (!lhs.select.checked) {
                return 1;
            } else if (!rhs.select.checked) {  
                return -1; 
            } else {
                return lhs.priority.value - rhs.priority.value;
            }
        });
    }

    refactor() {
        // for (let tc of this.testCaseList) {
        //     let newRow = document.createElement('tr');

        //     newRow.innerHTML = tc.tr.innerHTML;
        //     tc.setNewHTML(newRow);
        //     // newRow.getElementsByClassName('select')[0].checked = tc.select.checked;
        //     // newRow.getElementsByClassName('priority')[0].value = tc.priority.value;
        //     // newRow.getElementsByClassName('status')[0].value = tc.status.value;
        //     // newRow.getElementsByClassName('result')[0].value = tc.result.value;

        //     this.tbody.appendChild(newRow);
        //     this.tbody.removeChild(tc.tr);
        //     tc.tr = newRow;
        //     tc.setNewEvent();
        // }
    }
}

function runTestCase() {
    const NOT_RUN = 0;
    const SUSSESS = 1;
    const FAILED = 2;

    let status = [];
    let requests = [];
    let len = 0;
    let count = 0;

    tcl.sort();

    for (const tc of tcl.testCaseList) {
        if (tc.select.checked) {
            ++len;
            requests.push($.ajax({
                type: "POST",
                url: "run_test_case",
                datatype: "json",
                data: { 
                    test_dialplan_id: tdid, 
                    test_case_id: tc.id.innerHTML 
                },
                success: response => { status.push(SUSSESS); ++count; },
                failure: response => { status.push(FAILED); },
            }));
        } else {
            status.push(NOT_RUN);
        }
    }

    $.when.apply($, requests).done(() => {
        if (count == len) {
            alert("Chạy Test Case thành công");
        } else {
            alert("Chạy Test Case thất bại");
        }
    })

    
}


function test() {
    tcl.sort();
    tcl.refactor();
}