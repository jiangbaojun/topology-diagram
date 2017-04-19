# topology diagram 拓扑图

基于 raphael 的 jQuery 拓扑图插件。

[demo:huang-qing.github.io/topology-diagram/](https://huang-qing.github.io/topology-diagram/)

## 简介

拓扑图展示控件，支持ie8及以上、Chrome等现代浏览器。主要有以下功能：

1. 标准的拓扑图展示（发散拓扑图）

2. 相邻父节点具有相同子节点时，自动合并为一个子节点（聚合拓扑图）

3. 支持拓扑节点的正向及反向显示

4. 支持拓扑图箭头的正向及反向显示

5. 支持拓扑图相对容器的位置显示配置

6. 提供API方法接口及节点事件绑定

## 图示

1. 标准的拓扑图

![标准的拓扑图](https://github.com/huang-qing/topologyDiagram/raw/master/doc/standard.png)

2. 多根的拓扑图

![多根的拓扑图](https://github.com/huang-qing/topologyDiagram/raw/master/doc/multiRoot.png)

3. 自动合并节点的拓扑图

![自动合并节点的拓扑图](https://github.com/huang-qing/topologyDiagram/raw/master/doc/mergenode.png)

4. 节点反向展示的拓扑图

![节点反向展示的拓扑图](https://github.com/huang-qing/topologyDiagram/raw/master/doc/reversenode.png)

5. 箭头反向展示的拓扑图

![箭头反向展示的拓扑图](https://github.com/huang-qing/topologyDiagram/raw/master/doc/reversearrow.png)

## 使用示例

html：

```html

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>拓扑图</title>
    <link href="topology/topology.css" rel="stylesheet" />
</head>

<body>
    <div id='topology-sample'></div>
    <script src="topology/jquery-3.1.1.js"></script>
    <script src="topology/raphael.js"></script>
    <script src="topology/topology.js"></script>
    <script src="js/sample.js"></script>
    <script src="js/addReverseChildren.js"></script>
</body>

</html>

```

javascript：

```javascript
    var data = [{
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
            src: ['images/counter.png','images/counter.png'],
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

    $('#topology-sample').topology({
        data: data,
        align: 'center',      
        direction: {
            arrow: 'forward',
            node: 'reverse'
        },
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
        },
        onrightclick: function (e, data, nodeId) {
            console.dir([e, data, nodeId]);
        }  
    });

```

## 拓扑图结构数据格式

~~~javascript

{
    //节点id
    id: '1',
    //节点图片路径
    src: 'images/counter.png',
    //节点显示名称
    text: '顶级节点1-超过了8个字符的节点',
    //下级节点
    children: []
}

~~~

## 配置项

`data`:拓扑图结构数据。

`align`:拓扑图展示位置。居左`left` 居中`center` 居右`right` 

`vertical-align`:拓扑图展示位置。居上`top` 居中`middle` 居下`bottom` 

`direction`: 正向 `forward` 反向 `reverse`
    + `node`：拓扑图节点显示方向 
    + `arrow`：拓扑图箭头显示方向 

`onclick`:拓扑图节点单击事件。 回调函数参数： `event`, `data`, `nodeId` 

`ondblclick`:拓扑图节点双击事件。 回调函数参数： `event`, `data`, `nodeId` 

`ondblclickLoad`:拓扑图节点双击加载子节点事件。 回调函数参数： `data`，返回拓扑图结构数据。

`onrightclick`:拓扑图节点右键单击事件。 回调函数参数： `event`, `data`, `nodeId` 

`text`: 
    + `maxLength`:节点文字的最大长度，默认为8

## 方法

`init`:初始化

允许多次通过初始化方法调整配置参数，控件会与之前的配置自动合并调整。例如重新加载数据，重新绑定事件。

```javascript
$('#topologyElementId').topology(options);
```

```javascript
$('#topologyElementId').topology('init',options);
```

`destroy`:销毁

```javascript
$('#topologyElementId').topology('destroy');
```

`getSelected`:获取选中节点

```javascript
$('#topologyElementId').topology('getSelected');
```

`loadNodes`:加载数据

```javascript
$('#topologyElementId').topology('loadNodes',nodes);
```

`addNodes`:添加子节点

```javascript
$('#topologyElementId').topology('addNodes',nodes);
```

`bindEvent`:绑定事件 事件名称:`onclick` `ondblclick` `ondblclickLoad` `onrightclick`

```javascript
$('#topologyElementId').topology('bindEvent','onclick',function(e, data, nodeId){

});
```


## demo 演示
安装Node.js，cmd中初始化项目

```
npm install
```

启动Node.js测试网站

```
http-server
```