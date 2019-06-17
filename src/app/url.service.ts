import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UrlService {

  constructor(
    private http: HttpClient
  ) {
  }

  public hostName = 'http://10.24.20.71';
  public port = '9098';
  // public host=window.location.protocol+'//'+window.location.hostname+':'+this.port;
  public host = this.hostName + ':' + this.port;

  //以下url需与go后台服务的url对应
  //由于后台默认url不跨域，没在代码中开起跨域分享的url基本都报错不允许跨域，实际不是go的跨域处理问题，是url不对应
  public imgUrl = this.host + '/assets/img';
  public saveUrl = this.host + '/assets/img/save';
  public findUrl = this.host + '/assets/img/deviceid';
  public backUrl = this.host + '/assets/img/back';
  public uploadUrl = this.host + '/assets/upload';//上传保存自定义svg文件
  public cusUrl = this.host + '/assets/img/cussvg';//get保存自定义svg文件
  public updateCus = this.host + '/assets/updateCus'; //保存自定义svg关联信息到数据库

  public workUrl = this.host + '/workspace';
  public findName = this.host + '/workspace/findname';//查找同名布局是否已存在
  public codeUrl = this.host + '/code';//最大编号

}
