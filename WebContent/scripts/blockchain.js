global_config = {
    difficulty: 3,
    timeout: 1000,
    langugage: 1,
    url: "http://localhost:8080/Blockchain/MineBlockServlet"
}

var app = angular.module('BlockChain', []);

app.service("BlockChainService", ['$http', '$timeout', 'UIHelperService', function ($http, $timeout, UIHelperService) {
    var blocks = [],
        options = [{ value: 1, name: "Javascript Implementation" }, { value: 2, name: "Java Implementation" }];

    this.getOptions = function () { return options; }
    this.getBlocks = function () { return blocks; }

    var Block = function () {
        this.id = "";
        this.nonce = 0;
        this.data = "";
        this.mine_time = null;
        this.mine_action_perf = false;
        this.good_block = false;
        this.parentID = 0;
        this.parentMined = false;
        this.hash = null;
    }
    Block.prototype = {
        createBlock: function () {
            this.id = this.generateUUID();
            this.hash = this.generateHash();
        },

        generateHash: function () {
            return sha256(this.id + this.nonce + this.data + this.parentID);
        },

        generateUUID: function () {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        },

        mine: function (difficulty) {
            var start = new Date().getTime(), currtime;
            var str = "";
            for (var i = 0; i < difficulty; i++) str += "0";

            while (this.hash.substr(0, difficulty) !== str) {
                this.nonce++;
                this.hash = this.generateHash();
                currtime = new Date().getTime();
                if (currtime - start > global_config.timeout) {
                    this.mine_action_perf = true;
                    this.good_block = false;
                    this.mine_time = "Timeout. Mine for more time";
                    return;
                }
            }

            var end = new Date().getTime();
            this.mine_time = (end - start) + " ms";
            this.good_block = true;
            this.mine_action_perf = true;
        }
    }

    this.createBtnClickHandler = function (e) {
        var new_block = new Block();
        new_block.createBlock();
        if (blocks.length == 0) {
            blocks.push(new_block);
            return;
        }

        new_block.parentID = blocks[blocks.length - 1].hash;
        new_block.parentMined = blocks[blocks.length - 1].mine_action_perf && blocks[blocks.length - 1].good_block;
        blocks.push(new_block);
    }

    this.saveBtnClickHandler = function (elements) {
        var diff = elements[0],
            curr_diff = global_config.difficulty,
            timeout = elements[1],
            lang_val = elements[2],
            url = elements[3];

        global_config.difficulty = !isNaN(diff) ? diff : global_config.difficulty;
        global_config.timeout = !isNaN(timeout) ? timeout : global_config.timeout;
        global_config.langugage = !isNaN(lang_val) ? lang_val : global_config.langugage;
        global_config.url = url;

        if (curr_diff != global_config.difficulty)
            this.resetAllBlocks();
    }

    this.resetAllBlocks = function () {
        for (var i = 0; i < blocks.length; i++) {
            blocks[i].nonce = 0;
            blocks[i].mine_time = null;
            blocks[i].mine_action_perf = false;
            blocks[i].good_block = false;
            blocks[i].hash = blocks[i].generateHash();
            blocks[i].parentMined = false;

            if (i != blocks.length - 1)
                blocks[i + 1].parentID = blocks[i].hash;
        }
    }
    
    this.constructJsonData = function (index) {
        return {
            block: blocks[index].id,
            parent: blocks[index].parentID,
            data: blocks[index].data,
            hash: blocks[index].hash,
            nonce: blocks[index].nonce,
            difficulty: global_config.difficulty,
            timeout: global_config.timeout
        }
    }

    this.findHashUsingJS = function (index, elements, enableActions, callback) {
        $timeout(function () {
            blocks[index].mine(global_config.difficulty);
            if (index < blocks.length - 1) {
                if (blocks[index + 1])
                    blocks[index + 1].parentID = blocks[index].hash;

                if (blocks[index].good_block && blocks[index + 1])
                    blocks[index + 1].parentMined = true;
            }
            enableActions(elements);
            callback();
        }, 0);
    }

    this.findHashUsingExternalService = function (index, elements, enableActions, callback) {
        var data_json = this.constructJsonData(index);

        $http({
            method: 'POST',
            url: global_config.url,
            contentType: 'application/json',
            data: JSON.stringify(data_json)
        }).then(
        function (response) {
            blocks[index].mine_action_perf = true;
            if (response.data["status"]) {
                blocks[index].good_block = true;
                blocks[index].mine_time = response.data["time"] + " ms";
                blocks[index].hash = response.data["hash"];
                blocks[index].nonce = response.data["nonce"];

                if (blocks[index + 1])
                    blocks[index + 1].parentMined = true;
            }
            else {
                blocks[index].nonce = response.data["nonce"];
                blocks[index].good_block = false;
                blocks[index].mine_time = "Timeout. Mine for more time";
                if (blocks[index + 1])
                    blocks[index + 1].parentMined = false;
            }

            if (index < blocks.length - 1 && blocks[index + 1]) {
                blocks[index + 1].parentID = blocks[index].hash;
            }
            enableActions(elements);
            callback();
        },
        function (response) {
            blocks[index].good_block = false;
            blocks[index].mine_action_perf = true;
            blocks[index].mine_time = "Error connecting to server";

            if (blocks[index + 1])
                blocks[index + 1].parentMined = false;

            enableActions(elements);
            callback();
        });
    }

    this.mineBtnClickHandler = function (e, index, callback) {
        if (index > 0 && !blocks[index].parentMined) return;

        var elements = UIHelperService.getElements(e);
        UIHelperService.disableActions(elements);

        if (global_config.langugage == 1) {
            this.findHashUsingJS(index, elements, UIHelperService.enableActions, callback);
        }
        else if (global_config.langugage == 2) {
            this.findHashUsingExternalService(index, elements, UIHelperService.enableActions, callback);
        }
    }

    this.onKeyUpHandler = function (e, index) {
        blocks[index].data = e.target.value;
        this.propogateChange(index);
        blocks[index].good_block = false;
    }

    this.propogateChange = function (index) {
        for (var i = index; i < blocks.length - 1; i++) {
            blocks[i].hash = blocks[i].generateHash();
            blocks[i + 1].parentID = blocks[i].hash;
            blocks[i + 1].parentMined = false;
            blocks[i].good_block = false;
            blocks[i].mine_time = "bad";
        }

        blocks[blocks.length - 1].hash = blocks[blocks.length - 1].generateHash();
        blocks[blocks.length - 1].good_block = false;
        blocks[blocks.length - 1].parentMined = false;
        blocks[blocks.length - 1].mine_time = "bad";
    }

    this.isChainValid = function (index) {
        if (index == 0) index++;
        for (var i = index; i < blocks.length; i++) {
            if (blocks[i].generateHash() !== blocks[i].hash) {
                blocks[i].good_block = false;
                continue;
            }
            else blocks[i].good_block = true;

            if (blocks[i].parentID !== blocks[i - 1].hash) {
                blocks[i].good_block = false;
                continue;
            }
            else blocks[i].good_block = true;
        }
        return true;
    }
}]);

app.service("UIHelperService", [function () {
    this.disableActions = function (elements) {
        var icon = elements[0],
            btn = elements[1],
            card = elements[2];

        btn.setAttribute("disabled", true);
        card.style.opacity = 0.3;
        icon.classList.remove("fa-search");
        icon.classList.add("fa-spinner");
    }

    this.enableActions = function (elements) {
        var icon = elements[0],
            btn = elements[1],
            card = elements[2];

        btn.removeAttribute("disabled");
        card.style.opacity = 1.0;
        icon.classList.remove("fa-spinner");
        icon.classList.add("fa-search");
    }

    this.getElements = function (e) {
        var element = e.target;
        while (element && !element.classList.contains("fa")) {
            element = element.firstElementChild;
        }
        var icon = element;

        while (element && !element.classList.contains("btn")) {
            element = element.parentElement;
        }
        var btn = element;

        while (element && !element.classList.contains("card-body")) {
            element = element.parentElement;
        }
        var card = element;
        return [icon, btn, card];
    }
}]);

app.controller("BlockChainController", ["$scope", 'BlockChainService', function ($scope, BlockChainService) {
    $scope.config = global_config;
    $scope.blocks = [];
    $scope.options = BlockChainService.getOptions();
    $scope.select_index = $scope.options[0];

    angular.element(document).ready(function () {
        $scope.blocks = [];

        $scope.saveBtnClickHandler = function (e) {
            var elements = [parseInt(document.getElementById("txt_difficulty").value),
                            parseInt(document.getElementById("txt_timeout").value),
                            $scope.select_index.value,
                            document.getElementById("txt_url").value];

            BlockChainService.saveBtnClickHandler(elements);
            $scope.blocks = BlockChainService.getBlocks();
            $scope.config = global_config;
        }

        $scope.createBtnClickHandler = function (e) {
            BlockChainService.createBtnClickHandler();
            $scope.blocks = BlockChainService.getBlocks();
        }

        $scope.mineBtnClickHandler = function (e, index) {
            var updateBlocks = function () {
                $scope.blocks = BlockChainService.getBlocks();
            }
            BlockChainService.mineBtnClickHandler(e, index, updateBlocks);
        }

        $scope.onKeyUpHandler = function (e, index) {
            BlockChainService.onKeyUpHandler(e, index);
            $scope.blocks = BlockChainService.getBlocks();
        }
    });
}]);
