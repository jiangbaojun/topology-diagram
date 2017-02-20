$(function () {
    // mergeData：支持节点合并的拓扑图
    var mergeData = [{
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
            text: '1-2',
            children: [{
                    id: '1-2-1',
                    src: 'images/counter.png',
                    text: '三级节点1-2-1',
                    children: [{
                        id: '1-2-1-1',
                        src: 'images/counter.png',
                        text: '1-2-1-1',
                        children: []
                    }, {
                            id: '1-2-1-2',
                            src: 'images/counter.png',
                            text: '1-2-1-2',
                            children: []
                        },
                    {
                        id: '1-2-1-3',
                        src: 'images/counter.png',
                        text: '1-2-1-3',
                        children: []
                    }
                    ]
                }]
        },
        {
            id: '1-3',
            src: 'images/counter.png',
            text: '二级节点1-3',
            children: [{
                    id: '1-2-1',
                    src: 'images/counter.png',
                    text: '三级节点1-2-1',
                    children: []
                }]
        },
            // {
            //     id: '1-3-t1',
            //     src: 'images/counter.png',
            //     text: '1-3-t1',
            //     children: [{
            //             id: '1-2-1',
            //             src: 'images/counter.png',
            //             text: '三级节点1-2-1',
            //             children: []
            //         }]
            // },
        {
            id: '1-3-t2',
            src: 'images/counter.png',
            text: '1-3-t2',
            children: [{
                    id: '1-2-1',
                    src: 'images/counter.png',
                    text: '三级节点1-2-1',
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
                    children: [{
                        id: '1-4-1-1',
                        src: 'images/counter.png',
                        text: '1-4-1-1',
                        children: []
                    },
                    {
                        id: '1-4-1-2',
                        src: 'images/counter.png',
                        text: '1-4-1-2',
                        children: []
                    }
                    ]
                }]
        },
        {
            id: '1-5',
            src: 'images/counter.png',
            text: '二级节点1-5',
            children: [{
                    id: '1-4-1',
                    src: 'images/counter.png',
                    text: '1-4-1',
                    children: []
                }]
        }

        ]
    }];

    mergeData[0].children[1].children[0].children[2].children = [{
        id: '1-2-1-3-1',
        src: 'images/counter.png',
        text: '1-2-1-3-1',
        children: []
    },
    {
        id: '1-2-1-3-2',
        src: 'images/counter.png',
        text: '1-2-1-3-2',
        children: []
    },
    {
        id: '1-2-1-3-3',
        src: 'images/counter.png',
        text: '1-2-1-3-3',
        children: []
    }
    ];

    $('#topology-merge').topology({
        data: mergeData
    });
});
