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
            children: [{
                id: '1-2-1',
                src: 'images/counter.png',
                text: '三级节点1-2-1',
                children: []
            }]
        },
        {
            id: '1-3',
            src: 'images/counter.png',
            text: '二级节点1-3',
            children: [{
                id: '1-3-1',
                src: 'images/counter.png',
                text: '三级节点1-3-1',
                children: []
            }]
        },
        {
            id: '1-4',
            src: 'images/counter.png',
            text: '二级节点1-4',
            children: [{
                id: '1-4-1',
                src: 'images/counter.png',
                text: '1-4-1',
                children: []
            },
            {
                id: '1-4-2',
                src: 'images/counter.png',
                text: '节点1-4-2',
                children: []
            },
            {
                id: '1-4-2',
                src: 'images/counter.png',
                text: '节点1-4-2',
                children: []
            }
            ]
        }
        ]
    }];

    // sample：简单的拓扑图 1->1-1->
    sampleData[0].children[0].children = [{
        id: '1-1-1',
        src: 'images/counter.png',
        text: '1-1-1',
        children: []
    },
    {
        id: '1-1-2',
        src: 'images/counter.png',
        text: '1-1-2',
        children: []
    },
    {
        id: '1-1-3',
        src: 'images/counter.png',
        text: '1-1-3',
        children: []
    }
    ];

    // sample：简单的拓扑图 1->1-2->
    sampleData[0].children[1].children = [{
        id: '1-2-1',
        src: 'images/counter.png',
        text: '1-2-1',
        children: []
    },
    {
        id: '1-2-2',
        src: 'images/counter.png',
        text: '1-2-2',
        children: []
    },
    {
        id: '1-2-3',
        src: 'images/counter.png',
        text: '1-2-3',
        children: []
    },
    {
        id: '1-2-4',
        src: 'images/counter.png',
        text: '1-2-4',
        children: []
    }
    ];

    // sample：简单的拓扑图 1->1-2->1-2-1
    sampleData[0].children[1].children[0].children = [{
        id: '1-2-1-1',
        src: 'images/counter.png',
        text: '1-2-1-1',
        children: []
    },
    {
        id: '1-2-1-2',
        src: 'images/counter.png',
        text: '1-2-1-2',
        children: []
    },
    {
        id: '1-2-1-3',
        src: 'images/counter.png',
        text: '1-2-1-2',
        children: []
    }
    ];

    // sample：简单的拓扑图 1->1-2->1-2-1->
    sampleData[0].children[1].children[0].children[0].children = [{
        id: '1-2-1-1-1',
        src: 'images/counter.png',
        text: '1-2-1-1-1',
        children: []
    },
    {
        id: '1-2-1-1-2',
        src: 'images/counter.png',
        text: '1-2-1-1-2',
        children: []
    },
    {
        id: '1-2-1-1-3',
        src: 'images/counter.png',
        text: '1-2-1-1-3',
        children: []
    },
    {
        id: '1-2-1-1-4',
        src: 'images/counter.png',
        text: '1-2-1-1-4',
        children: []
    }
    ];

    // sample：简单的拓扑图 1->1-1->1-1-2->
    sampleData[0].children[0].children[1].children = [{
        id: '1-1-2-1',
        src: 'images/counter.png',
        text: '1-1-2-1',
        children: []
    },
    {
        id: '1-1-2-2',
        src: 'images/counter.png',
        text: '1-1-2-2',
        children: []
    },
    {
        id: '1-1-2-3',
        src: 'images/counter.png',
        text: '1-1-2-3',
        children: []
    },
    {
        id: '1-1-2-4',
        src: 'images/counter.png',
        text: '1-1-2-4',
        children: []
    },
    {
        id: '1-1-2-5',
        src: 'images/counter.png',
        text: '1-1-2-5',
        children: []
    }
    ];

    //
    // topology-sample
    //
    $('#topology-loadData').topology({
        // ondblclick: function (data) {
        //     //console.dir(data);
        //     console.log('ondblclick !');
        // }
    });

    // 再次加载
    $('#topology-loadData').topology('loadNodes', sampleData);
});
