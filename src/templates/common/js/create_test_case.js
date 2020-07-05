
class ActionType {
    static PRESS    = 1;
    static WAIT     = 2;
    static PLAY     = 3;
    static DELAY    = 4;
}

class ActionIndex {
    static NAME     = 0;
    static VALUE    = 1;
    static RESULT   = 2;
    static NOTE     = 3;
}

class Action {
    row;
    id;

    constructor(parent, id) {
        this.row = document.createElement("tr");
        parent.appendChild(this.row);   
        this.row.id = id;
        this.row.innerHTML = this.html();
    }
    

    setActionType(type) {
        switch (type) {
            case PRESS:
            case WAIT:
            case PLAY:
            case DELAY:
        }
    }


    html() {
        return /*html*/`
            <td>
                <select name="` + this.id + `" class="form-control">
                    <option value="press" selected>Press (Phím bấm sẽ thực hiện)</option>
                    <option value="wait">Wait (Thời gian chờ đợi)</option>
                    <option value="play">Play (Phát một file ghi âm khi vào hội thoại)</option>
                    <option value="delay">Delay (Thời gian chờ trước khi thực hiện cuộc gọi)</option>
                </select>
            </td>
            <td><input type="text" class="form-control"/></td>
            <td><input type="text" class="form-control"/></td>
            <td><textarea class="form-control"></textarea></td>
            <td>
                <button onclick="remove()">
                    <i class="fa fa-minus"></i>
                </button>
            </td>
        `;
    }
}

class Widget {
    actionList = [];

    constructor() {
        
    }
}