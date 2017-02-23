$(function () {
    var multiRootData = [{
        id: '1',
        src: 'images/counter.png',
        text: '顶级节点1',
        children: []
    },
    {
        id: '2',
        src: 'images/counter.png',
        text: '顶级节点2',
        children: []
    },
    {
        id: '3',
        src: 'images/counter.png',
        text: '顶级节点3',
        children: []
    }
    ];

    multiRootData[0].children = [{
        id: '1-1',
        src: 'images/counter.png',
        text: '1-1',
        children: []
    }];

    multiRootData[1].children = [{
        id: '1-1',
        src: 'images/counter.png',
        text: '1-1',
        children: []
    }];

    multiRootData[2].children = [{
        id: '1-1',
        src: 'images/counter.png',
        text: '1-1',
        children: []
    }];

    //
    // topology-addChildren
    //
    $('#topology-addChildren').topology({
        data: multiRootData,
        ondblclick: function (e, data, nodeId) {
            console.dir([e, data, nodeId]);
        },
        ondblclickLoad: function (data) {
            return [{
                id: (new Date()).getTime() + '1',
                src: 'images/counter.png',
                text: '0-1-1-1',
                children: []
            },
            {
                id: (new Date()).getTime() + '2',
                src: 'images/counter.png',
                text: '0-1-1-2',
                children: []
            },
            {
                id: (new Date()).getTime() + '3',
                src: 'images/counter.png',
                text: '0-1-1-3',
                children: []
            }
            ];
        },
        onclick: function (e, data, nodeId) {
            console.dir([e, data, nodeId]);
        }
    });
});
