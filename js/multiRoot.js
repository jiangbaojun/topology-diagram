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

    multiRootData[1].children = [{
        id: '1-1',
        src: 'images/counter.png',
        text: '1-1',
        children: []
    },
    {
        id: '1-2',
        src: 'images/counter.png',
        text: '1-2',
        children: []
    },
    {
        id: '1-3',
        src: 'images/counter.png',
        text: '1-3',
        children: []
    }
    ];

    //
    // topology-multiRoot
    //
    $('#topology-multiRoot').topology({
        data: multiRootData,
        align: 'center',
        'vertical-align': 'middle',
        ondblclick: function (data, nodeId) {

        }
    });
});
