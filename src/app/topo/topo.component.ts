/***
 *                                         ,s555SB@@&
 *                                      :9H####@@@@@Xi
 *                                     1@@@@@@@@@@@@@@8
 *                                   ,8@@@@@@@@@B@@@@@@8
 *                                  :B@@@@X3hi8Bs;B@@@@@Ah,
 *             ,8i                  r@@@B:     1S ,M@@@@@@#8;
 *            1AB35.i:               X@@8 .   SGhr ,A@@@@@@@@S
 *            1@h31MX8                18Hhh3i .i3r ,A@@@@@@@@@5
 *            ;@&i,58r5                 rGSS:     :B@@@@@@@@@@A
 *             1#i  . 9i                 hX.  .: .5@@@@@@@@@@@1
 *              sG1,  ,G53s.              9#Xi;hS5 3B@@@@@@@B1
 *               .h8h.,A@@@MXSs,           #@H1:    3ssSSX@1
 *               s ,@@@@@@@@@@@@Xhi,       r#@@X1s9M8    .GA981
 *               ,. rS8H#@@@@@@@@@@#HG51;.  .h31i;9@r    .8@@@@BS;i;
 *                .19AXXXAB@@@@@@@@@@@@@@#MHXG893hrX#XGGXM@@@@@@@@@@MS
 *                s@@MM@@@hsX#@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&,
 *              :GB@#3G@@Brs ,1GM@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@B,
 *            .hM@@@#@@#MX 51  r;iSGAM@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@8
 *          :3B@@@@@@@@@@@&9@h :Gs   .;sSXH@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@:
 *      s&HA#@@@@@@@@@@@@@@M89A;.8S.       ,r3@@@@@@@@@@@@@@@@@@@@@@@@@@@r
 *   ,13B@@@@@@@@@@@@@@@@@@@5 5B3 ;.         ;@@@@@@@@@@@@@@@@@@@@@@@@@@@i
 *  5#@@#&@@@@@@@@@@@@@@@@@@9  .39:          ;@@@@@@@@@@@@@@@@@@@@@@@@@@@;
 *  9@@@X:MM@@@@@@@@@@@@@@@#;    ;31.         H@@@@@@@@@@@@@@@@@@@@@@@@@@:
 *   SH#@B9.rM@@@@@@@@@@@@@B       :.         3@@@@@@@@@@@@@@@@@@@@@@@@@@5
 *     ,:.   9@@@@@@@@@@@#HB5                 .M@@@@@@@@@@@@@@@@@@@@@@@@@B
 *           ,ssirhSM@&1;i19911i,.             s@@@@@@@@@@@@@@@@@@@@@@@@@@S
 *              ,,,rHAri1h1rh&@#353Sh:          8@@@@@@@@@@@@@@@@@@@@@@@@@#:
 *            .A3hH@#5S553&@@#h   i:i9S          #@@@@@@@@@@@@@@@@@@@@@@@@@A.
 *
 *
 *    又看源码，看你**呀！
 */

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HttpClient, HttpHeaders, HttpRequest, HttpResponse} from '@angular/common/http';
import {NzMessageService, UploadFile, UploadFileStatus} from 'ng-zorro-antd';
import {UUID} from 'angular2-uuid';
import {filter} from 'rxjs/operators';
import * as go from 'gojs';
import * as echarts from 'node_modules/echarts/echarts.simple';
import {ActivatedRoute, Router} from '@angular/router';
import {UrlService} from '../url.service';

declare var $: any; //jQuery

@Component({
  selector: 'app-topo',
  templateUrl: './topo.component.html',
  styleUrls: ['./topo.component.scss']
})
export class TopoComponent implements OnInit {

  private id;
  private note: any;
  private code: any;
  private sence: any;
  private released: any;

  constructor(
    private url: UrlService,
    private http: HttpClient,
    private message: NzMessageService,
    private routeinfo: ActivatedRoute,
    private router: Router
  ) {
  }

  currWork = {
    'name': null,//布局名称
    'key': null,
    'class': null,
    'linkDataArray': [],
    'nodeDataArray': [],
  };

  cusMenu = [
    {
      divid: 'cus0',
      dispaly: false,
      name: '自定义分组1',
      svg: []
    }, {
      divid: 'cus1',
      dispaly: false,
      name: '自定义分组2',
      svg: []
    }, {
      divid: 'cus2',
      dispaly: false,
      name: '自定义分组3',
      svg: []
    }, {
      divid: 'cus3',
      dispaly: false,
      name: '自定义分组4',
      svg: []
    }, {
      divid: 'cus4',
      dispaly: false,
      name: '自定义分组5',
      svg: []
    }, {
      divid: 'cus5',
      dispaly: false,
      name: '自定义分组6',
      svg: []
    }, {
      divid: 'cus6',
      dispaly: false,
      name: '自定义分组7',
      svg: []
    }, {
      divid: 'cus7',
      dispaly: false,
      name: '自定义分组8',
      svg: []
    }, {
      divid: 'cus8',
      dispaly: false,
      name: '自定义分组9',
      svg: []
    }, {
      divid: 'cus9',
      dispaly: false,
      name: '自定义分组10',
      svg: []
    },
  ]; //自定义分录默认名称
  cusUpload = {
    divid: 'cus0',
    display: true,
    name: '新建分组1',
    svg: []
  };
  cusAva = [];

  diagram;
  flag = 1000;
  DataArray = [
    {svg: '卡车', deviceid: '', status: ''},
    {svg: '卡车1', deviceid: '', status: ''},
    {svg: '卡车2', deviceid: '', status: '0'},
    {svg: '车厢', deviceid: '', status: '0'},
    {svg: '传送带', deviceid: '', status: '0'},
    {svg: '船舶', deviceid: '', status: '1'},
  ];
  DataArray1 = [
    {svg: '红白烟囱', deviceid: '', status: ''},
    {svg: '烟囱', deviceid: '', status: '0'},
    {svg: '加工厂', deviceid: '', status: '0'},
    {svg: '冷却塔', deviceid: '', status: '0'},
    {svg: '提炼塔', deviceid: '', status: '1'},
    {svg: '烘干塔', deviceid: '', status: '1'},
    {svg: '钻探工厂', deviceid: '', status: '1'},
    {svg: '干燥塔', deviceid: '', status: '1'},
    {svg: '抛光机', deviceid: '', status: ''},
    {svg: '烧结机', deviceid: '', status: ''},
    {svg: '均化器', deviceid: '', status: '0'},
    {svg: '冷却器', deviceid: '', status: '0'},
    {svg: '汽轮机', deviceid: '', status: '0'},

  ];
  DataArray2 = [
    {svg: '结晶器', deviceid: '', status: ''},
    {svg: '搅拌器', deviceid: '', status: ''},
    {svg: '漏斗', deviceid: '', status: '0'},
    {svg: '化学处理塔', deviceid: '', status: '0'},
    {svg: '锅炉', deviceid: '', status: '0'},
    {svg: '粉碎机', deviceid: '', status: '1'},
    {svg: '剪切机', deviceid: '', status: '1'},

  ];
  DataArray3 = [
    {svg: '抛光机', deviceid: '', status: ''},
    {svg: '烧结机', deviceid: '', status: ''},
    {svg: '均化器', deviceid: '', status: '0'},
    {svg: '冷却器', deviceid: '', status: '0'},
    {svg: '汽轮机', deviceid: '', status: '0'},
  ];
  DataArray4 = [
    {svg: '真空助力机', deviceid: '', status: ''},
    {svg: '热风加热器', deviceid: '', status: ''},
    {svg: '搅拌器', deviceid: '', status: '0'},
    {svg: '制氮机', deviceid: '', status: '0'},
    {svg: '结晶器', deviceid: '', status: '0'},
  ];
  DataArray5 = [
    {svg: '锅炉', deviceid: '', status: ''},
    {svg: '锅炉1', deviceid: '', status: ''},
    {svg: '机组', deviceid: '', status: '0'},
    {svg: '烘干塔', deviceid: '', status: '1'},
    {svg: '钻探工厂', deviceid: '', status: '1'}
  ];

  cusData;

  //内置标准几何图形
  builtIn = [
    {svg: 'Rectangle', category: 'shape'},
    {svg: 'RoundedRectangle', category: 'shape'},
    {svg: 'Ellipse', category: 'shape'},
    {svg: 'TriangleUp', category: 'shape'},
    {svg: 'Diamond', category: 'shape'},
    {svg: 'LineH', category: 'shape'},
    {svg: 'LineV', category: 'shape'},
    {svg: 'PlusLine', category: 'shape'},
  ];
  timeOutId;

  //连线动效用参数
  opacity = 1;
  down = true;


  //默认的空设备，防止html绑定不到字段报错
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

  dataDevice = {};//存放选中图标的deviceid对应的device
  currDevice = {};//选中图标的nodedata

  tempDeviceId = '';
  devices;
  zoom = 0;


  visible = false;//主布局右键菜单显示
  addSvgShow = false;//新增图源对话框
  modiShow = false;//修改图源对话框
  saveWork = false;//保存布局对话框显示

  workName = '';
  newGroup;

  //预定义url
  imgUrl = this.url.imgUrl;
  workUrl = this.url.workUrl;
  uploadUrl = this.url.uploadUrl;
  cusUrl = this.url.cusUrl;
  updateCus = this.url.updateCus;
  findNameUrl = this.url.findName;

  uploading = false;
  fileList: UploadFile[] = [];

  //初始化布局图和工具栏
  initDiagram() {
    var self = this;
    let $ = go.GraphObject.make;
    var DataArray = self.DataArray;  //new一个防止双向绑定更改DataArray后图源列表改变
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
        'undoManager.isEnabled': true  // enable undo & redo
      });
    var Palette = $(go.Palette, 'myPaletteDiv',
      {
        'undoManager.isEnabled': true,
        layout: $(go.GridLayout),
      });
    var Palette1 = $(go.Palette, 'myPaletteDiv1',
      {
        'undoManager.isEnabled': true,
        layout: $(go.GridLayout),
      });
    var Palette2 = $(go.Palette, 'myPaletteDiv2',
      {
        'undoManager.isEnabled': true,
        layout: $(go.GridLayout)
      });
    var Palette3 = $(go.Palette, 'myPaletteDiv3',
      {
        'undoManager.isEnabled': true,
        layout: $(go.GridLayout)
      });
    var Palette4 = $(go.Palette, 'myPaletteDiv4',
      {
        'undoManager.isEnabled': true,
        layout: $(go.GridLayout)
      });
    var Palette5 = $(go.Palette, 'myPaletteDiv5',
      {
        'undoManager.isEnabled': true,
        layout: $(go.GridLayout)
      });
    var Palette6 = $(go.Palette, 'myPaletteDiv6',
      {
        'undoManager.isEnabled': true,
        layout: $(go.GridLayout)
      });


    var ToolTip = $(go.HTMLInfo, {
      show: showToolTip,
      hide: hideToolTip,
      // since hideToolTip is very simple,
      // we could have set mainElement instead of setting hide:
      // mainElement: document.getElementById('toolTipDIV')
    });

    var cxElement = document.getElementById('contextMenu');
    // Since we have only one main element, we don't have to declare a hide method,
    // we can set mainElement and GoJS will hide it automatically
    var ContextMenu = $(go.HTMLInfo, {
      show: showContextMenu,
      mainElement: cxElement
    });

    function showToolTip(obj, diagram, tool) {
      var toolTipDIV = document.getElementById('toolTipDIV');
      var pt = diagram.lastInput.viewPoint;
      self.currDevice = obj.data;
      self.matchDevice();
      // console.log(self.currDevice);
      var fromLeft = document.getElementById('leftbar').offsetWidth;
      var left = pt.x + fromLeft + 10;//左侧菜单宽度  左侧图源栏款 10点向右偏移，在鼠标点击位置右侧
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

    function showContextMenu(obj, diagram, tool) {
      // console.log(obj, diagram, tool);
      // Show only the relevant buttons given the current state.
      var cmd = diagram.commandHandler;
      // Now show the whole context menu element
      cxElement.style.display = 'block';
      // we don't bother overriding positionContextMenu, we just do it here:
      self.currDevice = obj.data;
      self.matchDevice();
      // console.log(self.currDevice);
      var pt = diagram.lastInput.viewPoint;
      var fromLeft = document.getElementById('leftbar').offsetWidth;
      var left = pt.x + fromLeft + 10; //左侧菜单宽度  左侧图源栏款 10点向右偏移，在鼠标点击位置右侧
      var top = pt.y + 10;
      var r = self.getPos(pt.x, pt.y);//计算四角中最接近的，以此调整位置
      // console.log(r);
      switch (r) {
        case 1:
          break;
        case 2:
          left -= 100;
          break;
        case 3:
          left -= 100;
          top -= 150;
          break;
        case 4:
          top -= 150;
          break;
        default:
          break;
      }
      cxElement.style.left = left + 'px'; //左边菜单和图源列表固定宽度大概530px，缩放不变
      cxElement.style.top = top + 'px';
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


    //工具栏图形
    Palette.nodeTemplateMap.add('shape',  // the default category
      $(go.Node, 'Table',
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
            strokeWidth: 1,
            stroke: 'black',
            fill: 'transparent',
            width: 16,
            height: 16
          },
          new go.Binding('figure', 'svg')),
      ));

    Palette1.nodeTemplateMap.add('',  // the default category
      $(go.Node, 'Table',
        $(go.Panel, 'Vertical',
          $(go.Picture, {width: 40, height: 40, imageStretch: go.GraphObject.Uniform},
            new go.Binding('source', 'svg', function (svg) {
              return imgUrl + svg + '.svg';
            }),
          ),
          $(go.TextBlock,
            {margin: 2},
            new go.Binding('text', 'svg')
          )),
        // four named ports, one on each side:
      ));

    Palette2.nodeTemplateMap = Palette1.nodeTemplateMap;
    Palette3.nodeTemplateMap = Palette1.nodeTemplateMap;
    Palette4.nodeTemplateMap = Palette1.nodeTemplateMap;
    Palette5.nodeTemplateMap = Palette1.nodeTemplateMap;
    Palette6.nodeTemplateMap = Palette1.nodeTemplateMap;


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
        {contextMenu: ContextMenu}
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
        {contextMenu: ContextMenu}
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
        {contextMenu: ContextMenu}
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
        $(go.Shape, {isPanelMain: true, stroke: '#41BFEC'/* blue*/, strokeWidth: 10},
          new go.Binding('stroke', 'color')),
        $(go.Shape, {isPanelMain: true, stroke: 'white', strokeWidth: 3, name: 'PIPE', strokeDashArray: [20, 40]})
      );

    // temporary links used by LinkingTool and RelinkingTool are also orthogonal:

    self.diagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
    self.diagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;

    Palette.model = new go.GraphLinksModel(self.builtIn);
    Palette1.model = new go.GraphLinksModel(DataArray);
    Palette2.model = new go.GraphLinksModel(this.DataArray1);
    Palette3.model = new go.GraphLinksModel(this.DataArray2);
    Palette4.model = new go.GraphLinksModel(this.DataArray3);
    Palette5.model = new go.GraphLinksModel(this.DataArray4);
    Palette6.model = new go.GraphLinksModel(this.DataArray5);

  }

  //设备右键菜单选项
  click(val) {
    switch (val) {
      case 'addDevice':
        this.visible = true;
        // console.log(this.currDevice);
        break;
      case 'deviceInfo':
        alert(JSON.stringify(this.dataDevice));
        break;
      case 'copy':
        this.diagram.commandHandler.copySelection();
        this.diagram.commandHandler.pasteSelection(this.diagram.lastInput.documentPoint);
        break;
      case 'delete':
        this.diagram.commandHandler.deleteSelection();
        break;
    }
    this.diagram.currentTool.stopTool();
  }

  //添加分组，弹出对话框
  addSvg() {
    this.addSvgShow = true;
  }

  //修改现有分组，弹出对话框
  modiSvg() {
    this.modiShow = true;
  }

  //保存前，若非新增 直接保存
  beforeSave() {
    if (this.currWork.name) {//有名称，不是新增，直接保存
      this.save(false);
    } else {
      this.saveWork = true;//弹出保存对话框 认为是新增
    }
  }

  //保存对话框的确定事件 检查名称是否有重复
  modalSave() {
    this.http.post(this.findNameUrl, JSON.stringify(this.workName)).subscribe(res => {
      // console.log(res);
      if (res['Status'] == '0') {
        this.message.info('该名称已被使用！');
      } else {
        this.save(false);
      }
    });
  }

  //发布
  release(b: boolean) {
    this.save(b);
  }

  //保存布局
  save(r: boolean) {
    // let dataarray = this.diagram.model.toJson();
    // let datajson = JSON.parse(dataarray);
    let data = {
      'name': this.workName,//布局名称
      'key': this.currWork.key ? this.currWork.key : UUID.UUID(),
      'class': this.currWork.class,
      'linkDataArray': this.currWork.linkDataArray,
      'nodeDataArray': this.currWork.nodeDataArray,

      //gojs未预置的属性 直接绑定到图标模型会报错
      'note': this.note,
      'code': this.code,//未指定编号的交到后台处理
      'sence': this.sence, //关联场景
      'released': r ? true : this.released, //发布标记
    };
    // console.log(JSON.stringify(data));
    let post = {
      opt: 'save',
      workspace: data
    };
    // this.currWork.key = data.key; //保留key，先删后插，key不变
    //删除
    this.http.post(this.workUrl, {opt: 'delete', workspace: {key: this.currWork.key}}).subscribe(res => {
      }
      , error1 => {
        console.log('not found');
      });
    console.log(post);
    //新增
    this.http.post(this.workUrl, post).subscribe(res => {
      this.message.success('保存成功');
    }, error1 => {
      // console.log(error1);
      this.message.info('保存失败:' + error1);
    });
    this.saveWork = false;
  }

  //计算最接近的四角，弹出菜单时避免超边界
  getPos(w, h) {
    var backH = $('#myDiagramDiv').height();//去px绝对数值
    var backW = $('#myDiagramDiv').width();//去px绝对数值
    // console.log(w, backW, h, backH);
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

  //获取后台设备列表
  getDevice() {
    // let url = '/core-metadata/api/v1/device';
    // var head = new HttpHeaders({
    //   'X-Session-Token': '21232f297a57a5a743894a0e4a801fc3',
    //   'X-Requested-With': 'XMLHttpRequest'
    // });
    // this.http.get(url, {headers: head}).subscribe(response => {
    //     console.log('deviceresponse:' + response);
    //     this.devices = response;
    //     this.devices.forEach(function (e) {  // 处理标签数组 时间戳
    //       if (e.labels instanceof Array) {
    //         e.labels = e.labels.join(',');
    //       }
    //     });
    //   },
    //   error1 => {
    //     this.message.warning(error1);
    //     console.log(error1);
    //   });
  }

  //匹配当前选中的设备
  matchDevice() {
    try {
      this.dataDevice = this.currDevice['deviceid'] ? this.devices.filter(d => d.id === this.currDevice['deviceid'])[0] : this.defaultDevice;
    } catch (e) {

    }
  }

  //设备对话框取消
  handleCancel() {
    this.visible = false;
    this.addSvgShow = false;
    this.modiShow = false;
  }

  //设备对话框确认
  handleOk() {
    this.visible = false;
    this.currDevice['deviceid'] = this.tempDeviceId; //确认改变currdevice
    this.tempDeviceId = '';
    // console.log(this.currDevice);
    this.message.success('成功绑定设备');
  }

  //打开设备对话框
  handleOpen() {
    this.tempDeviceId = this.currDevice['deviceid'];//赋值给下拉框绑定数据，避免双向绑定改变currdevice
  }

  //关闭设备对话框，等同取消
  handleClose() {
    this.handleCancel();
  }

  //缩放
  zoomOut(n) {
    this.diagram.commandHandler.increaseZoom(n);
  }

  //添加备注
  addComm() {
    this.diagram.model.nodeDataArray = [...this.diagram.model.nodeDataArray, {category: 'Comment', text: '添加备注'}];
    // console.log(this.diagram.model.nodeDataArray);
    // console.log(typeof (this.diagram.model.nodeDataArray));
  }

  // 关闭
  close() {
    this.currWork = null;
    this.router.navigate(['/topo/list']);
  }

  //显示工具栏
  toggleTop() {
    this.diagram.currentTool.stopTool();
    var display = $('#topbar').css('display');
    if (display === 'none') {
      $('#topbar').css('display', 'flex');
      $('#droptop  i').toggleClass('icon-down');
      $('#droptop  i').toggleClass('icon-up');
      $('#toolcontent').css('top', '60px');
    } else {
      $('#topbar').css('display', 'none');
      $('#droptop  i').toggleClass('icon-up');
      $('#droptop  i').toggleClass('icon-down');
      $('#droptop').css('top', '0');
      $('#toolcontent').css('top', '0');
    }
    this.load();
  }

  //显示左侧图标栏
  toggleleft() {
    this.diagram.currentTool.stopTool();
    var display = $('#leftbar').css('display');
    if (display == 'none') {
      $('#leftbar').css('display', 'block');
      $('#leftbtn').toggleClass('icon-left');
      $('#leftbtn').toggleClass('icon-right');
      $('#dropleft').css('left', '260px');
      $('#myDiagramDiv').css('left', '260px');
    } else {
      $('#leftbar').css('display', 'none');
      $('#leftbtn').toggleClass('icon-left');
      $('#leftbtn').toggleClass('icon-right');
      $('#dropleft').css('left', '0');
      $('#myDiagramDiv').css('left', '0');
    }
    this.load();
  }

  //初始
  init() {
    // console.log(this.currWork);
    this.getDevice();//获取可用设备，来自edge
    this.initDiagram();//初始化布局图表
    this.getCus();//获取图表自定义分组
    $('.ant-collapse-content-box').css('padding', '0');//去折叠面板padding，默认16px
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
          self.opacity = self.opacity - 0.01;
        } else {
          self.opacity = self.opacity + 0.003;
        }
        if (self.opacity <= 0) {
          self.down = !self.down;
          self.opacity = 0;
        }
        if (self.opacity > 1) {
          self.down = !self.down;
          self.opacity = 1;
        }
        shape.opacity = self.opacity;
      });
      diagram.skipsUndoManager = oldskips;
      self.loop();
    }, 60);
  }

  //停止动画循环
  stopLoop() {
    clearTimeout(this.timeOutId);
  }

  //上传自定义图标前
  beforeUpload = (file: UploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    return false;
  };

  //上传自定义图标
  handleUpload() {
    if (this.fileList.length < 1) {
      this.message.info('请选择上传图源');
      return;
    }
    const formData = new FormData();
    // tslint:disable-next-line:no-any
    this.cusUpload = this.cusAva.filter(d => d.divid === this.cusUpload.divid)[0];
    // console.log(this.fileList);
    this.fileList.forEach((file: any) => {
      formData.append('file', file);
      this.cusUpload.svg = [...this.cusUpload.svg, {svg: file.name, deviceid: '', status: ''}];
    });
    // console.log(JSON.stringify(this.fileList));
    this.cusUpload.display = true;
    formData.append('cusMenu', JSON.stringify(this.cusUpload));//发送本次修改的自定义分组及其内容 后台更新
    this.uploading = true;
    // You can use any AJAX library you like
    const req = new HttpRequest('POST', this.uploadUrl, formData, {
      // reportProgress: true
    });
    this.http
      .request(req)
      .pipe(filter(e => e instanceof HttpResponse))
      .subscribe(
        () => {
          this.uploading = false;
          this.fileList = [];
        },
        () => {
          this.uploading = false;
          this.message.error('upload failed.');
          return;
        }
      );
    this.http.post(this.updateCus, this.cusUpload).subscribe(res => {
      this.message.success('upload successfully.');
    });
  }

  //添加自定义分组
  handleNew() {
    let index = this.cusAva.length;
    if (index >= 10) {
      this.message.warning('最多可添加十个自定义分组');
      return;
    }
    let divid = 'cus' + index;
    this.cusAva = [...this.cusAva, {
      divid: divid,
      dispaly: true,
      name: this.newGroup,
      svg: []
    }];
    this.cusUpload.divid = divid;
    // this.getCus();
    this.handleUpload();
  }

  //修改分组对话框选项变更
  selectedChanged() {
    this.fileList = [];
    // console.log('changed');
    this.http.get(this.cusUrl).subscribe(res => {
      let data;
      data = res;
      // console.log(data);
      let files = data.filter(d => d.display === true && d.divid === this.cusUpload.divid);
      files.forEach(e => {
        e['svg'].forEach(ec => {
          let file: UploadFile = {
            uid: UUID.UUID(),
            size: 5555,
            name: ec['svg'],
            filename: ec['svg'] + '.svg',
            lastModified: '1551340778344',
            lastModifiedDate: new Date(),
            type: 'image/svg+xml'
          };
          this.fileList = [...this.fileList, file];
        });
      });
      // console.log(this.fileList);
    }, error1 => {
      // console.log(error1);
    });
  }


  //获取所有自定义分组信息
  getCus() {
    this.http.get(this.cusUrl).subscribe(res => {
      this.cusData = res;
      this.cusAva = this.cusData.filter(d => d.display === true);//已自定义的信息
      var self = this;
      // console.log('ava' + JSON.stringify(this.cusAva));
      this.cusAva.forEach(e => {
          this.cusMenu[e.divid[e.divid.length - 1]] = e;
          document.getElementById(e.divid).style.display = 'block';//显示上传过的分组
          let $ = go.GraphObject.make;

          var cusPalette = $(go.Palette, e.divid + 'div',
            {
              layout: $(go.GridLayout),
            });

          //删除自定义图标，实际是更新
          function remove(e, obj) {
            cusPalette.commit(function (d) {
              var contextmenu = obj.part;
              var nodedata = contextmenu.data;
            });
          }

          cusPalette.nodeTemplateMap.add('',  // the default category
            $(go.Node, 'Table',
              $(go.Panel, 'Vertical',
                $(go.Picture, {width: 40, height: 40, imageStretch: go.GraphObject.Uniform},
                  new go.Binding('source', 'svg', function (svg) {
                    return self.uploadUrl + '/' + svg + '.svg';
                  }),
                ),
                $(go.TextBlock,
                  {margin: 2},
                  new go.Binding('text', 'svg')
                )),
              {
                contextMenu:     // define a context menu for each node
                  $('ContextMenu',  // that has one button
                    $('ContextMenuButton',
                      $(go.TextBlock, '删除图标', {click: remove}),
                    )
                  )
              }
            ));
          cusPalette.model = new go.GraphLinksModel(e.svg);
        }
      );
      // console.log(this.cusMenu);
    });
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
      this.router.navigate(['/topo/item/' + UUID.UUID()]);
    }
    this.init();

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
        this.code = res.code;
        this.note = res.note;
        this.sence = res.sence;
        this.released = res.released;

        // console.log(this.currWork);
        this.workName = res.name;
      }
      this.load();//获取到数据再给图标绑定
    });

  }

}
