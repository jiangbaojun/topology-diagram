$(function () {
    // sample：简单的拓扑图
    var sampleData = [{
        id: '1',
        src: 'images/counter.png',
        text: '顶级节点1-超过了8个字符的节点',
        children: [{
            id: '1-1',
            src: 'images/counter.png',
            text: '二级节点1-1',
            children: []
        },
        {
            id: '1-2',
            src: 'images/counter.png',
            text: '二级节点1-2',
            children: []
        },
        {
            id: '1-3',
            src: 'images/counter.png',
            text: '二级节点1-3',
            children: []
        }
        ]
    }];

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

    $('#topology-sample').topology(sampleData);
    $('#topology-multiRoot').topology(multiRootData);
});
