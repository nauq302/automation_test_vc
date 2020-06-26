
class Action {
    row;

    get action() { return this.row.getElementsByClassName('action')[0]; }
    get value() { return this.row.getElementsByClassName('value')[0]; }
    get result() { return this.row.getElementsByClassName('result')[0]; }
    get delete() { return this.row.getElementsByClassName('delete')[0]; }

    constructor(parent) {
        this.row = document.createElement('tr');
        this.setHTML();

        this.action.onclick = function() { 
            let opt = this.action.options[this.action.selectedIndex];
            this.changeActionType(opt.value); 
        }.bind(this);

        this.delete.onclick = function() {
            parent.removeChild(this.row);
        }.bind(this);
    }


    changeActionType(type) {
        switch (type) {
            case 'press':
                this.value.type = 'text';
                this.value.classList.add('form-control');
                this.value.value = '';
                break;
            case 'wait':
                this.value.type = 'text';
                this.value.classList.add('form-control');
                this.value.value = '';
                break;
            case 'play':
                this.value.type = 'button';
                this.value.classList.remove('form-control');
                this.value.value = '';
                break;
            case 'delay':
                this.value.type = 'text';
                this.value.classList.add('form-control');
                this.value.value = '';
                break;
        }
    }


    setHTML() {
        this.row.innerHTML = /*html*/`
            <td>
                <select class="action form-control">
                    <option value="press" selected>Press (Phím bấm sẽ thực hiện)</option>
                    <option value="wait">Wait (Thời gian chờ đợi)</option>
                    <option value="play">Play (Phát một file ghi âm khi vào hội thoại)</option>
                    <option value="delay">Delay (Thời gian chờ trước khi thực hiện cuộc gọi)</option>
                </select>
            </td>
            <td><input type="text" class="value form-control"/></td>
            <td><input type="text" class="result form-control"/></td>
            <td><textarea class="note form-control"></textarea></td>
            <td>
                <button type="button" class="delete form-control" >
                    <i class="fa fa-minus"></i>
                </button>
            </td>
        `;
    }
}


class Widget {
    actionList = [];
    div;

    get tBody() { return this.div.getElementsByTagName('tbody')[0]; }
    get addButton() { return this.div.getElementsByClassName('add-button')[0]; }
    get deleteWidgetButton() { return this.div.getElementsByClassName('delete-widget')[0]; }

    constructor(parent) {
        this.div = document.createElement('div');
        this.div.classList.add('row');
        this.setHTML();

        this.addButton.onclick = function() {
            this.addAction()
        }.bind(this);

        this.deleteWidgetButton.onclick = function() {
            parent.removeWidget(this);              
        }.bind(this);
    }

    addAction() {
        let action = new Action(this.tBody);
        this.actionList.push(action);
        this.tBody.appendChild(action.row);
    }

    removeAction(action) {
        this.actionList.remove(action);
        this.tBody.removeChild(action.row);
    }

    setHTML() {
        this.div.innerHTML = /*html*/`
            <div class="widget">
                <div class="row">
                    <div class="col-sm-1">
                        <button type="button" class="delete-widget form-control">
                            <i class="fa fa-minus"></i>
                        </button>
                    </div>
                </div>
                <div class="hr-line-dashed"></div>

                <div class="row">
                    <label class="col-sm-3 control-label">Chọn loại Kịch bản</label>

                    <label class="col-sm-3 control-label">
                        <input type="radio" name="script_type" checked/>
                        Kịch bản Gọi
                    </label>

                    <label class="col-sm-3 control-label">
                        <input type="radio" name="script_type"/>
                        Kịch bản Nghe
                    </label>
                </div>
                <div class="hr-line-dashed"></div>

                <div class="row">
                    <label class="col-sm-2 control-label">Chọn máy</label>
                    <div class="col-sm-5"><input type="text" class="form-control"></div>
                </div>
                <div class="hr-line-dashed"></div>

                <div class="row">
                    <label class="col-sm-3 control-label">Danh sách Hành động</label>
                    <button class="add-button col-sm-2 btn btn-primary" type="button">Thêm Hành động</button>
                </div>

                <div class="row">
                    <div class="table-responsive col-sm-11">
                        <table class="table table-striped table-bordered table-hover" >
                            <thead class="form-group">
                                <tr>
                                    <th>Hành động</th>
                                    <th>Giá trị</th>
                                    <th>Kết quả</th>
                                    <th>Note</th>
                                    <th>Xóa</th>
                                </tr>
                            </thead>
                            <tbody class="tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="hr-line-dashed"></div>
        `;
    }
}


class WidgetList {
    widgets = [];
    div;

    constructor(div) {
        this.div = div;
        this.addWidget();
        this.widgets[0].addAction();
    }


    addWidget() {
        let widget = new Widget(this);
        this.widgets.push(widget);
        this.div.appendChild(widget.div);
    }

    removeWidget(widget) {
        this.widgets.splice(this.widgets.indexOf(widget), 1);
        this.div.removeChild(widget.div);
    }
}