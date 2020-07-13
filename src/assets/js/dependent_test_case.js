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
    set disabled(value) {
        if (value == this.disabled) { return; }

        if (value) {
            this.btn.disabled = true;
        } else {
            this.btn.disabled = false;
        }
    }

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


class SelectChechbox {
    cbx;
    parent;

    constructor(cbx, parent) {
        this.cbx = cbx;
        this.parent = parent;

        this.cbx.onclick = function() {
            if (cbx.checked) {
                this.sendRequestAddTestCase();
                parent.status.disabled = false;
                parent.result.disabled = false;
            } else {
                this.sendRequestRemoveTestCase();
                parent.status.disabled = true;
                parent.result.disabled = true;
                parent.update.disabled = true;
            }
        }.bind(this);
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
    static get PASSED() { return 0; }
    static get FAILED() { return 1; }

    static dict = {
        "passed": Status.PASSED,
        "failed": Status.FAILED
    };
}

class TestCase {
    tr;
    update;
    select;
    
    get form() { return this.tr.getElementsByTagName('form')[0]; }
    get id() { return this.tr.getElementsByClassName('id')[0]; }
    get name() { return this.tr.getElementsByClassName('name')[0]; }
    get status() { return this.tr.getElementsByClassName('status')[0]; }
    get result() { return this.tr.getElementsByClassName('result')[0]; }

    constructor() {
        this.tr = document.createElement('tr');
        this.tr.classList.add('gradeX');

        this.setHTML();
        this.update = new UpdateButton(this.tr.getElementsByClassName('update')[0], this);
        this.select = new SelectChechbox(this.tr.getElementsByClassName('select')[0], this);

        this.status.onchange = function() { this.update.disabled = false; }.bind(this);
        this.result.onchange = function() { this.update.disabled = false; }.bind(this);
    }


    setHTML() {

        let html = /*html*/`
            <td><span class="id" name="id"></span></td>
            <td><span class="name"></span></td>
            <td>
                <select name="status" class="status form-control">
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                </select>
            </td>
            <td>
                <input type="checkbox" class="select">
                <label>Select</label>
            </td>

            <td><input type="text" name="result" class="result form-control"></td>
            <td><button type="button" class="update btn btn-primary">Update</button></td>
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

        tc.select.checked = select;
        
        tc.result.value = result;
        tc.result.disabled = !select;

        tc.update.disabled = true;
        this.tbody.appendChild(tc.tr);
    }
}