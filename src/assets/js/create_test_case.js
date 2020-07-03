
class Action {
    row;

    get action() { return this.row.getElementsByClassName('action')[0]; }
    get value() { return this.row.getElementsByClassName('value')[0]; }
    get result() { return this.row.getElementsByClassName('result')[0]; }
    get note() { return this.row.getElementsByClassName('note')[0]; }
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
            case 'wait':
            case 'delay':
                this.value.type = 'text';
                this.value.value = '';
                break;
            case 'play':
                this.value.type = 'file';
                this.value.value = '';
            break;
        }
    }


    setHTML() {
        this.row.innerHTML = /*html*/`
            <td class="col-sm-2">
                <select class="action form-control">
                    <option value="press" selected>Press (Phím bấm sẽ thực hiện)</option>
                    <option value="wait">Wait (Thời gian chờ đợi)</option>
                    <option value="play">Play (Phát một file ghi âm khi vào hội thoại)</option>
                    <option value="delay">Delay (Thời gian chờ trước khi thực hiện cuộc gọi)</option>
                </select>
            </td>
            <td class="col-sm-2"><input type="text" class="value form-control"/></td>
            <td class="col-sm-2"><input type="text" class="result form-control"/></td>
            <td class="col-sm-3"><textarea class="note form-control"></textarea></td>
            <td class="col-sm-1">
                <button type="button" class="delete form-control">
                    <i class="fa fa-minus"></i>
                </button>
            </td>
        `;
    }

    setDataName(widgetCount, actionCount) {
        this.action.name = 'action_' + widgetCount + '_' + actionCount;
        this.value.name = 'value_' + widgetCount + '_' + actionCount;
        this.result.name = 'result_' + widgetCount + '_' + actionCount;
        this.note.name = 'note_' + widgetCount + '_' + actionCount;
    }
}

/**
 * Widget
 */
class Widget {
    actionList = [];
    div;

    // Getter
    get tBody() { return this.div.getElementsByTagName('tbody')[0]; }
    get addButton() { return this.div.getElementsByClassName('add-button')[0]; }
    get deleteWidgetButton() { return this.div.getElementsByClassName('delete-widget')[0]; }

    // Constructor
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

    // Add action into action list
    addAction() {
        let action = new Action(this.tBody);
        this.actionList.push(action);
        this.tBody.appendChild(action.row);
    }

    // Remove a action from action list
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
                        <input type="radio" value="call" class="script-type" checked/>
                        Kịch bản Gọi
                    </label>

                    <label class="col-sm-3 control-label">
                        <input type="radio" value="listen" class="script-type"/>
                        Kịch bản Nghe
                    </label>
                </div>
                <div class="hr-line-dashed"></div>

                <div class="row">
                    <label class="col-sm-2 control-label">Chọn máy</label>
                    <div class="col-sm-5"><input type="text" class="phone form-control"></div>
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

    setDataName(count) {
        let scriptTypes = this.div.getElementsByClassName('script-type');
        for (let i = 0; i < scriptTypes.length; ++i) {
            scriptTypes[i].name = 'scriptType_' + count;
        }

        this.div.getElementsByClassName('phone')[0].name = 'phone_' + count;

        for (let i in this.actionList) {
            this.actionList[i].setDataName(count, i);
        }

        this.addSize(count);
    }

    addSize(count) {
        let input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'size_' + count;
        input.value = this.actionList.length;
        this.div.appendChild(input);
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

    setDataName() {
        for (let i in this.widgets) {
            this.widgets[i].setDataName(i);
        }

        this.addSize();
    }

    addSize() {
        let input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'size';
        input.value = this.widgets.length;
        this.div.appendChild(input);
    }
}


