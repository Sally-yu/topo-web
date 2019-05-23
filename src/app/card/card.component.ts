import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpClient, HttpHeaders, HttpRequest, HttpResponse} from '@angular/common/http';
import {NzMessageService, UploadFile, UploadFileStatus} from 'ng-zorro-antd';
import {UUID} from 'angular2-uuid';
import * as go from 'gojs';
import * as echarts from 'node_modules/echarts/echarts.simple';
import {ActivatedRoute, Router} from '@angular/router';
import {UrlService} from '../url.service';

declare var $: any; //jQuery
@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  currWork;
  currDevice = {};//选中图标的nodedata

  diagram;
  flag = 1000;
  id;
  timeOutId;

  //连线动效用参数
  opacity = 1;
  down = true;


  imgUrl = this.url.imgUrl;
  workUrl = this.url.workUrl;
  dataDevice: {};

  private defaultDevice = {
    'created': 0,
    'modified': 0,
    'origin': 0,
    'description': null,
    'id': null,
    'name': null,
    'adminState': 'UNLOCKED',
    'operatingState': 'ENABLED',
    'addressable': {
      'created': 0,
      'modified': 0,
      'origin': 0,
      'id': null,
      'name': null,
      'protocol': 'OTHER',
      'method': null,
      'address': null,
      'port': 0,
      'path': null,
      'publisher': null,
      'user': null,
      'password': null,
      'topic': null,
      'baseURL': null,
      'url': null
    },
    'lastConnected': 0,
    'lastReported': 0,
    'labels': [],
    'location': null,
    'service': {
      'created': 0,
      'modified': 0,
      'origin': 0,
      'description': null,
      'id': null,
      'name': null,
      'lastConnected': 0,
      'lastReported': 0,
      'operatingState': 'ENABLED',
      'labels': [],
      'addressable': {
        'created': 0,
        'modified': 0,
        'origin': 0,
        'id': null,
        'name': null,
        'protocol': 'HTTP',
        'method': 'POST',
        'address': null,
        'port': 0,
        'path': null,
        'publisher': null,
        'user': null,
        'password': null,
        'topic': null,
        'baseURL': null,
        'url': null
      },
      'adminState': 'UNLOCKED'
    },
    'profile': {
      'created': 0,
      'modified': 0,
      'origin': 0,
      'description': null,
      'id': null,
      'name': null,
      'manufacturer': null,
      'model': null,
      'labels': [],
      'objects': null,
      'deviceResources': [],
      'resources': [],
      'commands': []
    }
  };
  devices;

  constructor(private url: UrlService,
              private http: HttpClient,
              private message: NzMessageService,
              private routeinfo: ActivatedRoute,
              private router: Router) { }


  //初始化布局图和工具栏
  initDiagram() {
    var self = this;
    let $ = go.GraphObject.make;
    var imgUrl = this.imgUrl + '/';

    function showLinkLabel(e) {
      var label = e.subject.findObject('LABEL');
      if (label !== null) {
        label.visible = (e.subject.fromNode.data.category === 'Conditional');
      }
    }

    self.diagram = $(go.Diagram, 'myDiagramDiv',  // must name or refer to the DIV HTML element
      {
        'LinkDrawn': showLinkLabel,  // this DiagramEvent listener is defined below
        'LinkRelinked': showLinkLabel,
      });
    self.diagram.isReadOnly=true;

    var ToolTip = $(go.HTMLInfo, {
      show: showToolTip,
      hide: hideToolTip,
      // since hideToolTip is very simple,
      // we could have set mainElement instead of setting hide:
      // mainElement: document.getElementById('toolTipDIV')
    });


    function showToolTip(obj, diagram, tool) {
      var toolTipDIV = document.getElementById('toolTipDIV');
      var pt = diagram.lastInput.viewPoint;
      self.currDevice = obj.data;
      self.matchDevice();
      console.log(self.currDevice);
      var left = pt.x  + 10;//左侧菜单宽度  左侧图源栏款 10点向右偏移，在鼠标点击位置右侧
      var top = pt.y + 10;
      var r = self.getPos(pt.x, pt.y);
      switch (r) {
        case 1:
          break;
        case 2:
          left -= 240;
          break;
        case 3:
          left -= 240;
          top -= 300;
          break;
        case 4:
          top -= 300;
          break;
        default:
          break;
      }
      toolTipDIV.style.left = left + 'px'; //左边菜单和图源列表固定宽度大概530px，缩放不变
      toolTipDIV.style.top = top + 'px';
      toolTipDIV.style.display = 'block';
    }

    function hideToolTip(diagram, tool) {
      var toolTipDIV = document.getElementById('toolTipDIV');
      toolTipDIV.style.display = 'none';
    }

    function nodeStyle() {
      return [
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        {
          locationSpot: go.Spot.Center
        }
      ];
    }

    function makePort(name, align, spot, output, input) {
      var horizontal = align.equals(go.Spot.Top) || align.equals(go.Spot.Bottom);
      // the port is basically just a transparent rectangle that stretches along the side of the node,
      // and becomes colored when the mouse passes over it
      return $(go.Shape,
        {
          fill: 'transparent',  // changed to a color in the mouseEnter event handler
          strokeWidth: 0,  // no stroke
          width: horizontal ? NaN : 8,  // if not stretching horizontally, just 8 wide
          height: !horizontal ? NaN : 8,  // if not stretching vertically, just 8 tall
          alignment: align,  // align the port on the main Shape
          stretch: (horizontal ? go.GraphObject.Horizontal : go.GraphObject.Vertical),
          portId: name,  // declare this object to be a "port"
          fromSpot: align,  // declare where links may connect at this port
          fromLinkable: output,  // declare whether the user may draw links from here
          toSpot: spot,  // declare where links may connect at this port
          toLinkable: input,  // declare whether the user may draw links to here
          cursor: 'pointer',
          // show a different cursor to indicate potential link point
        },
        {
          mouseEnter: function (e, port) {  // the PORT argument will be this Shape
            if (!e.diagram.isReadOnly) {
              port.fill = 'rgba(65,191,236,0.5)';
            }
          }
          ,
          mouseLeave: function (e, port) {
            port.fill = 'transparent';
          }
        }
      );
    }


    self.diagram.nodeTemplateMap.add('picture',  // picture
      $(go.Node, 'Auto',
        nodeStyle(),
        {
          locationSpot: go.Spot.Center,  // the location is the center of the Shape
          locationObjectName: 'PIC',
          selectionAdorned: false,  // no selection handle when selected
          resizable: true, resizeObjectName: 'PIC',  // user can resize the Shape
          rotatable: true, rotateObjectName: 'PIC',  // rotate the Shape without rotating the label
          layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
        },
        $(go.Picture,
          {name: 'PIC', width: 80, height: 80, imageStretch: go.GraphObject.UniformToFill},
          new go.Binding('source', 'src'),
        ),
        // Shape.fill is bound to Node.data.color
        // four named ports, one on each side:
        makePort('T', go.Spot.Top, go.Spot.Top, true, true),
        makePort('L', go.Spot.Left, go.Spot.Left, true, true),
        makePort('R', go.Spot.Right, go.Spot.Right, true, true),
        makePort('B', go.Spot.Bottom, go.Spot.Bottom, true, true),
        {toolTip: ToolTip},
      ));

    self.diagram.nodeTemplateMap.add('Comment',
      $(go.Node, 'Auto', nodeStyle(),
        $(go.Shape, 'Rectangle',
          {fill: '#DEE0A3', strokeWidth: 0}),
        $(go.TextBlock,
          {
            margin: 5,
            maxSize: new go.Size(200, NaN),
            wrap: go.TextBlock.WrapFit,
            textAlign: 'center',
            editable: true,
            font: 'bold 12pt Helvetica, Arial, sans-serif',
            stroke: '#454545'
          },
          new go.Binding('text').makeTwoWay()),
      ));

    self.diagram.nodeTemplateMap.add('shape',
      $(go.Node, 'Auto',
        nodeStyle(),
        {
          locationSpot: go.Spot.Center,  // the location is the center of the Shape
          locationObjectName: 'SHAPE',
          selectionAdorned: false,  // no selection handle when selected
          resizable: true, resizeObjectName: 'SHAPE',  // user can resize the Shape
          rotatable: true, rotateObjectName: 'SHAPE',  // rotate the Shape without rotating the label
          // don't re-layout when node changes size
          layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
        },
        $(go.Shape,
          {
            name: 'SHAPE',
            strokeWidth: 2,
            stroke: 'black',
            fill: 'transparent',
            width: 80,
            height: 80
          },
          new go.Binding('figure', 'svg').makeTwoWay()
        ),
        // Shape.fill is bound to Node.data.color
        // four named ports, one on each side:
        makePort('T', go.Spot.Top, go.Spot.TopSide, true, true),
        makePort('L', go.Spot.Left, go.Spot.LeftSide, true, true),
        makePort('R', go.Spot.Right, go.Spot.RightSide, true, true),
        makePort('B', go.Spot.Bottom, go.Spot.BottomSide, true, true),
        {toolTip: ToolTip},
      ));

    self.diagram.nodeTemplateMap.add('',
      $(go.Node, 'Auto',
        nodeStyle(),
        {
          locationSpot: go.Spot.Center,  // the location is the center of the Shape
          locationObjectName: 'PICTURE',
          selectionAdorned: false,  // no selection handle when selected
          resizable: true, resizeObjectName: 'PICTURE',  // user can resize the Shape
          rotatable: true, rotateObjectName: 'PICTURE',  // rotate the Shape without rotating the label
          // don't re-layout when node changes size
          layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
        },
        $(go.Picture,
          {
            name: 'PICTURE',  // named so that the above properties can refer to this GraphObject
            width: 80, height: 80, imageStretch: go.GraphObject.Uniform
          },
          new go.Binding('source', 'svg', function (svg) {
            return imgUrl + svg + '.svg';
          }).makeTwoWay(),
        ),
        $(go.Shape, 'Circle',
          {
            name:'CIRCLE',
            alignment: go.Spot.TopRight, alignmentFocus: go.Spot.TopRight,
            width: 20, height: 20, strokeWidth: 0
          },
          new go.Binding('fill', 'status', function (s) {
            var color = '#9d9d9d';
            if (s == '1') {
              color = '#00cc00';
            } else if (s == '0') {
              color = '#ee0000';
            }
            return color;
          })
        ),
        makePort('T', go.Spot.Top, go.Spot.TopSide, true, true),
        makePort('L', go.Spot.Left, go.Spot.LeftSide, true, true),
        makePort('R', go.Spot.Right, go.Spot.RightSide, true, true),
        makePort('B', go.Spot.Bottom, go.Spot.BottomSide, true, true),
        {toolTip: ToolTip},
      )
    );

    self.diagram.toolManager.hoverDelay = 300;  // 300 milliseconds

    function spotConverter(dir) {
      if (dir === 'L') {
        return go.Spot.LeftSide;
      }
      if (dir === 'R') {
        return go.Spot.RightSide;
      }
      if (dir === 'T') {
        return go.Spot.TopSide;
      }
      if (dir === 'B') {
        return go.Spot.BottomSide;
      }
    }

    self.diagram.linkTemplate =
      $(go.Link, {
          toShortLength: -2,
          fromShortLength: -2,
          layerName: 'Background',
          routing: go.Link.Orthogonal, //直角
          corner: 15,
        },
        $(go.Shape, {isPanelMain: true, strokeWidth: 10},
          new go.Binding('stroke',function (c) {
            return    '#41BFEC';
          })
        ),
        $(go.Shape, {isPanelMain: true, stroke: 'white', strokeWidth: 3, name: 'PIPE', strokeDashArray: [20, 40]})
      );

    // temporary links used by LinkingTool and RelinkingTool are also orthogonal:

    self.diagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
    self.diagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;


  }

  //计算最接近的四角，弹出菜单时避免超边界
  getPos(w, h) {
    var backH = $('#myDiagramDiv').height();//去px绝对数值
    var backW = $('#myDiagramDiv').width();//去px绝对数值
    console.log(w, backW, h, backH);
    if (h < backH / 2) {
      if (w <= backW / 2) {
        return 1;//左上角
      } else if (w > backW / 2) {
        return 2;//右上角
      }
    }
    if (h > backH / 2) {
      if (w >= backW / 2) {
        return 3;//右下角
      } else if (w < backW / 2) {
        return 4;//左下角
      }
    }
  }

  //加载，重新加载，从列表传进来的布局图，未保存前可刷新加载
  load() {
    this.diagram.model = go.Model.fromJson(this.currWork);

    //绑定出入点字段，必需放在go.Model.fromJson之后，别问为什么，我也不清楚
    this.diagram.model.linkFromPortIdProperty = 'fromPortId';
    this.diagram.model.linkToPortIdProperty = 'toPortId';
  }

  //匹配当前选中的设备
  matchDevice() {
    try {
      this.dataDevice = this.currDevice['deviceid'] ? this.devices.filter(d => d.id === this.currDevice['deviceid'])[0] : this.defaultDevice;
    } catch (e) {

    }
  }


  //动画循环
  loop() {
    this.stopLoop();
    var self = this;
    var diagram = self.diagram;
    self.timeOutId = setTimeout(function () {
      var oldskips = diagram.skipsUndoManager;
      diagram.skipsUndoManager = true;
      diagram.links.each(function (link) {
        var shape = link.findObject('PIPE');
        var off = shape.strokeDashOffset - 3;
        // animate (move) the stroke dash
        shape.strokeDashOffset = (off <= 0) ? 60 : off;
        // animte (strobe) the opacity:
        if (self.down) {
          self.opacity = self.opacity - 0.005;
        } else {
          self.opacity = self.opacity + 0.003;
        }
        if (self.opacity <= 0.3) {
          self.down = !self.down;
          self.opacity = 0.3;
        }
        if (self.opacity > 1) {
          self.down = !self.down;
          self.opacity = 1;
        }
        shape.opacity = self.opacity;
      });
      diagram.nodes.each(function (node) {
        var circle = node.findObject('CIRCLE');
        if (self.down) {
          self.opacity = self.opacity - 0.005;
        } else {
          self.opacity = self.opacity + 0.003;
        }
        if (self.opacity <= 0.3) {
          self.down = !self.down;
          self.opacity = 0.3;
        }
        if (self.opacity > 1) {
          self.down = !self.down;
          self.opacity = 1;
        }
        circle.opacity = self.opacity;
      });
      diagram.skipsUndoManager = oldskips;
      self.loop();
    }, 60);
  }
  //停止动画循环
  stopLoop() {
    clearTimeout(this.timeOutId);
  }


  //初始化echarts
  initEchart() {
    var myChart = echarts.init(document.getElementById('echart1'));
    var myChart1 = echarts.init(document.getElementById('echart2'));
    var myChart2 = echarts.init(document.getElementById('echart3'));
    var myChart3 = echarts.init(document.getElementById('echart4'));

    // 指定图表的配置项和数据
    var option = {
      title: {
        text: 'Step Line'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['Step Start', 'Step Middle', 'Step End']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Step Start',
          type: 'line',
          step: 'start',
          data: [120, 132, 101, 134, 90, 230, 210]
        },
        {
          name: 'Step Middle',
          type: 'line',
          step: 'middle',
          data: [220, 282, 201, 234, 290, 430, 410]
        },
        {
          name: 'Step End',
          type: 'line',
          step: 'end',
          data: [450, 432, 401, 454, 590, 530, 510]
        }
      ]
    };

    var option1 = {
      legend: {},
      tooltip: {},
      dataset: {
        source: [
          ['product', '2015', '2016', '2017'],
          ['Matcha Latte', 43.3, 85.8, 93.7],
          ['Milk Tea', 83.1, 73.4, 55.1],
          ['Cheese Cocoa', 86.4, 65.2, 82.5],
          ['Walnut Brownie', 72.4, 53.9, 39.1]
        ]
      },
      xAxis: {type: 'category'},
      yAxis: {},
      // Declare several bar series, each will be mapped
      // to a column of dataset.source by default.
      series: [
        {type: 'bar'},
        {type: 'bar'},
        {type: 'bar'}
      ]
    };

    var option2 = {
      title: {
        text: '运输结构',
        x: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['卡车', '火车', '管道', '船舶', '空运']
      },
      series: [
        {
          name: '运输方式',
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: [
            {value: 335, name: '卡车'},
            {value: 310, name: '火车'},
            {value: 234, name: '管道'},
            {value: 135, name: '船舶'},
            {value: 1548, name: '空运'}
          ],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
    var labelRight = {
      normal: {
        position: 'right'
      }
    };
    var option3 = {
      title: {
        text: '交错正负轴标签',
        subtext: 'From ExcelHome',
        sublink: 'http://e.weibo.com/1341556070/AjwF2AgQm'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      grid: {
        top: 80,
        bottom: 30
      },
      xAxis: {
        type: 'value',
        position: 'top',
        splitLine: {lineStyle: {type: 'dashed'}},
      },
      yAxis: {
        type: 'category',
        axisLine: {show: false},
        axisLabel: {show: false},
        axisTick: {show: false},
        splitLine: {show: false},
        data: ['ten', 'nine', 'eight', 'seven', 'six', 'five', 'four', 'three', 'two', 'one']
      },
      series: [
        {
          name: '生活费',
          type: 'bar',
          stack: '总量',
          label: {
            normal: {
              show: true,
              formatter: '{b}'
            }
          },
          data: [
            {value: -0.07, label: labelRight},
            {value: -0.09, label: labelRight},
            0.2, 0.44,
            {value: -0.23, label: labelRight},
            0.08,
            {value: -0.17, label: labelRight},
            0.47,
            {value: -0.36, label: labelRight},
            0.18
          ]
        }
      ]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
    myChart1.setOption(option1);
    myChart2.setOption(option2);
    myChart3.setOption(option3);
  }

  //显示echart并可拖动
  drag() {
    let display = $('.echarts').css('display');
    if (display == 'none') {
      $('#dragbtn').toggleClass('activebtn');
      $('.echarts').css('display', 'block');
      $('.echarts').draggable({containment: '#content', scroll: false});
      this.initEchart();
      // $('.echarts').resizable();
    } else if (display == 'block') {
      $('.echarts').css('display', 'none');
      $('#dragbtn').toggleClass('activebtn');
    }
  }

  ngOnInit() {
    this.id = this.routeinfo.snapshot.params['id'];
    if (!this.id) {
      this.router.navigate(['/topo/detail' + UUID.UUID()]);
    }
    this.initDiagram();//初始化布局图表
    $('.ant-collapse-content-box').css('padding', '0');//去折叠面板padding，默认16px
    // this.diagram.model.linkFromPortIdProperty = 'fromPortId';
    // this.diagram.model.linkToPortIdProperty = 'toPortId';
    // this.makeMap();
    this.loop();
    this.http.post(this.workUrl, {opt: 'find', workspace: {key: this.id}}).subscribe(data => {
      if (data) {
        let res = JSON.parse(JSON.stringify(data));
        this.currWork = {
          'name': res.name,//布局名称
          'key': res.key,
          'class': res.class,
          'linkDataArray': res.linkDataArray,
          'nodeDataArray': res.nodeDataArray,
        };
      }
      this.load();
    });

  }

}
