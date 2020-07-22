let tdid;


class UpdateButton {
    btn;
    parent;

    constructor(btn, parent) {
        this.btn = btn;
        this.parent = parent;

        btn.onclick = function() {
            this.disabled = true;
            this.sendRequestUpdateTestCase();
        }.bind(this);
    }

    get disabled() { return this.btn.disabled; }
    set disabled(value) { this.btn.disabled = value; }

    sendRequestUpdateTestCase() {
        let xhttp = new XMLHttpRequest();

        let form = new FormData();
        form.append("test_dialplan_id", tdid);
        form.append("id", this.parent.id.innerHTML);
        form.append("status", this.parent.status.value);
        form.append("result", this.parent.result.value);
        
        xhttp.open("POST", "update_dependent_test_case", true);
        xhttp.send(form);
    }
}


class SelectCheckbox {
    cbx;
    parent;

    constructor(cbx, parent) {
        this.cbx = cbx;
        this.parent = parent;

        this.cbx.onclick = function() {
            this.changeData();
        }.bind(this);
    }

    changeData() {
        if (this.cbx.checked) {
            this.sendRequestAddTestCase();
            this.parent.status.disabled = false;
            this.parent.result.disabled = false;
            this.parent.status.setColor();
        } else {
            this.sendRequestRemoveTestCase();
            this.parent.status.disabled = true;
            this.parent.result.disabled = true;
            this.parent.update.disabled = true;
            this.parent.status.removeColor();
        }
    }

    get checked() { return this.cbx.checked; }
    set checked(checked) { this.cbx.checked = checked; }

    sendRequestAddTestCase() {
        let xhttp = new XMLHttpRequest();

        let form = new FormData();
        form.append("test_dialplan_id", tdid);
        form.append("id", this.parent.id.innerHTML);
        form.append("status", this.parent.status.value);
        form.append("result", this.parent.result.value);
        
        xhttp.open("POST", "add_dependent_test_case", true);
        xhttp.send(form);
    }


    sendRequestRemoveTestCase() {
        let xhttp = new XMLHttpRequest();

        let form = new FormData();
        form.append("test_dialplan_id", tdid);
        form.append("id", this.parent.id.innerHTML);
        
        xhttp.open("POST", "remove_dependent_test_case", true);
        xhttp.send(form);
    }
}

class Status {
    static get FAILED() { return 0; }
    static get PASSED() { return 1; }

    select;
    parent;

    constructor(select, parent) {
        this.select = select;
        this.parent = parent;

        this.select.onchange = function() {
            this.setColor();
            parent.update.disabled = false;
        }.bind(this);
    }

    get selectedIndex() { return this.select.selectedIndex; }
    set selectedIndex(index) { this.select.selectedIndex = index; }
    set disabled(disabled) { this.select.disabled = disabled; }
    get value() { return this.select.value; }

    setColor() {
        this.select.style.color = this.select.selectedIndex == Status.FAILED ? "red" : "green";
    }

    removeColor() {
        this.select.style.color = "";
    }
}

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

    constructor() {
        this.tr = document.createElement('tr');
        this.tr.classList.add('gradeX');

        this.setHTML();
        this.update = new UpdateButton(this.tr.getElementsByClassName('update')[0], this);
        this.select = new SelectCheckbox(this.tr.getElementsByClassName('select')[0], this);

        this.status = new Status(this.tr.getElementsByClassName('status')[0], this);
        this.result.onchange = function() { this.update.disabled = false; }.bind(this);

        this.info.onclick = function() { 
            location.href = "/info_test_case?test_case_id=" + this.id.innerHTML + "&active=" + this.select.checked + "&test_dialplan_id=" + tdid; 
        }.bind(this);
    }

    setHTML() {
        let html = /*html*/`
            <td>
                <input type="checkbox" class="select">
                <label>Select</label>
            </td>
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

        this.tr.innerHTML = html;
    }
}

class TestCaseList {

    tbody;
    testCaseList = [];

    constructor(tbody) {
        this.tbody = tbody;
    }

    addTestCase(id, name, status, select, result) {
        let tc = new TestCase(tdid);

        tc.id.innerHTML = id;
        tc.name.innerHTML = name;

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
}

function runTestCase(test_dialplan_id) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("Success");
        } else {
            console.log(this.readyState + " " + this.status);
        }
    };
    xhttp.open("GET", "run_test_case", true);
    xhttp.send("test_dialplan_id=" + test_dialplan_id);
}