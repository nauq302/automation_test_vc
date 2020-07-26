class BaseData {
    div;
    parent;

    get phone() { return this.div.getElementsByClassName('phone')[0]; }

    constructor(parent, div) {
        this.div = div;
        this.parent = parent;
    }
}


class Action {
    row;

    get id() { return this.row.getElementsByClassName('aid')[0]; }
    get name() { return this.row.getElementsByClassName('name')[0]; }
    get value() { return this.row.getElementsByClassName('value')[0]; }
    
    get note() { return this.row.getElementsByClassName('note')[0]; }
    get delete() { return this.row.getElementsByClassName('delete')[0]; }

    constructor(parent) {
        this.row = document.createElement('tr');
        this.setHTML();

        
        this.name.onclick = (() => { 
            let opt = this.name.options[this.name.selectedIndex];
            this.changeActionType(opt.value); 
        }).bind(this);

        this.delete.onclick = (() => { parent.removeAction(this); }).bind(this);
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
        <input type="hidden" class="aid"/>
            <td class="col-sm-2">
                <select class="name form-control">
                    <option value="press" selected>Press (Phím bấm sẽ thực hiện)</option>
                    <option value="wait">Wait (Thời gian chờ đợi)</option>
                    <option value="play">Play (Phát một file ghi âm khi vào hội thoại)</option>
                    <option value="delay">Delay (Thời gian chờ trước khi thực hiện cuộc gọi)</option>
                </select>
            </td>
            <td class="col-sm-2"><input type="text" class="value form-control"/></td>
            <td class="col-sm-3"><textarea class="note form-control"></textarea></td>
            <td class="col-sm-1">
                <button type="button" class="delete form-control">
                    <i class="fa fa-minus"></i>
                </button>
            </td>
        `;
    }

    setDataName(widgetCount, actionCount) {
        this.id.name = 'id_' + widgetCount + '_' + actionCount;
        this.name.name = 'name_' + widgetCount + '_' + actionCount;
        this.value.name = 'value_' + widgetCount + '_' + actionCount;
        this.note.name = 'note_' + widgetCount + '_' + actionCount;
    }
}


class ScriptTypeRadios {
    parent;
    div;

    get radios() { return this.div.getElementsByClassName('type'); }


    constructor(parent, div, tempName) {
        this.parent = parent;
        this.div = div;

        this.setHTML();

        for (let r of this.radios) {
            r.name = 't' + tempName;
        }

        this.radios[0].onchange = () => {
            parent.data = new CallScriptData(parent, parent.div.getElementsByClassName('data')[0]);
        };

        this.radios[1].onchange = () => {
            parent.data = new ListenScriptData(parent, parent.div.getElementsByClassName('data')[0]);
        };
    }

    setHTML() {
        this.div.innerHTML = /*html*/`
            <label class="col-sm-3 control-label">Chọn loại Kịch bản</label>

            <label class="col-sm-3 control-label">
                <input type="radio" value="call" class="type" checked/>
                Kịch bản Gọi
            </label>

            <label class="col-sm-3 control-label">
                <input type="radio" value="listen" class="type"/>
                Kịch bản Nghe
            </label>
        `;
    }

    setDataName(count) {
        for (let r of this.radios) {
            r.name = 'scriptType_' + count;
        }
    }
}

ScriptTypeRadios.CALL = 0;
ScriptTypeRadios.LISTEN = 0;


let callees = [];