﻿using ExpressBase.Common;
using ExpressBase.Common.Data;
using ExpressBase.Common.Objects;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Auth;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Threading.Tasks;
using Twilio.Rest.Api.V2010.Account;

namespace ExpressBase.Web.Controllers
{
    public class SMSController : EbBaseIntCommonController
    {
        public SMSController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        //[HttpGet]
        //public IActionResult SendSMS()
        //{
        //    return View();
        //}

        //[HttpPost]
        //public IActionResult SendSMS(int i)
        //{
        //    var req = this.HttpContext.Request.Form;
        //    SMSInitialRequest sMSSentRequest = new SMSInitialRequest();
        //    //sMSSentRequest.To = req["to"];
        //    //sMSSentRequest.From = req["from"];
        //    //sMSSentRequest.Body = req["body"];
        //    string[] subdomain = this.HttpContext.Request.Host.Host.Split('.');
        //    sMSSentRequest.SolnId = subdomain[0];

        //    var client = new JsonServiceClient(this.ServiceClient.BaseUri)
        //    {
        //        Credentials = new NetworkCredential("GATblcTqWNFI9ljZRWX-aUtidVYjJwoj", "")
        //    };
        //    client.Post(sMSSentRequest);
        //    return View();
        //}

        //[HttpPost("smscallback/{apikey}")]
        //public void CallBack(string apikey)
        //{
        //    var req = this.HttpContext.Request.Form;
        //    var smsSid = Request.Form["SmsSid"];
        //    var messageStatus = Request.Form["MessageStatus"];
        //    string stsbody = req.ToJson();
        //    SMSInitialRequest sMSSentRequest = new SMSInitialRequest();
        //  //  sMSSentRequest.To = "+919961596200";
        //  //  sMSSentRequest.Body = "SMS Id: "+smsSid.ToString()+"/nMessageStatus:" + messageStatus.ToString() +"/nFull Message:" + stsbody.ToString();
        //    string[] subdomain = this.HttpContext.Request.Host.Host.Split('.');
        //    sMSSentRequest.SolnId = subdomain[0];

        //    var client = new JsonServiceClient(this.ServiceClient.BaseUri)
        //    {
        //        Credentials = new NetworkCredential(apikey, "")
        //    };
        //    client.Post(sMSSentRequest);
        //}

        public IActionResult SMSLogConsole()
        {
            Type[] typeArray = typeof(EbDashBoardWraper).GetTypeInfo().Assembly.GetTypes();
            Context2Js _jsResult = new Context2Js(typeArray, BuilderType.DashBoard, typeof(EbObject));
            ViewBag.Meta = _jsResult.AllMetas;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectTypes = _jsResult.EbObjectTypes;
            ViewBag.ControlOperations = EbControlContainer.GetControlOpsJS((new EbWebForm()) as EbControlContainer, BuilderType.FilterDialog);

            List<int> types = new List<int>() { 19 };
            GetAllCommitedObjectsResp Result = this.ServiceClient.Get<GetAllCommitedObjectsResp>(new GetAllCommitedObjectsRqst { Typelist = types });
            ViewBag.SMSLogObject = JsonConvert.SerializeObject(Result.Data);
            return View();
        }

        public ListSMSLogsResponse Get_SMS_List(string Refid, string Date)
        {
            ListSMSLogsResponse resp = new ListSMSLogsResponse();
            string query = @"
                    SELECT
		                    l.send_from, l.send_to, l.message_body, u.fullname as executed_by, l.eb_created_at as executed_at, l.status, l.id   
	                    FROM
		                    eb_sms_logs l, eb_users u 
	                    WHERE
		                    u.id =l.eb_created_by AND
		                    to_char(l.eb_created_at, 'dd-mm-yyyy') = :date AND l.refid = :refid AND 
		                    COALESCE(l.eb_del,'F') = 'F'
	                    ORDER BY 
		                    l.id DESC, status ASC;";
            List<Param> _params = new List<Param>();
            _params.Add(new Param { Name = "date", Type = ((int)EbDbTypes.String).ToString(), Value = Date });
            _params.Add(new Param { Name = "refid", Type = ((int)EbDbTypes.String).ToString(), Value = Refid });
            string[] arrayy = new string[] { "send_from", "send_to", "message_body", "executed_by", "executed_at", "status", "id" };
            DVColumnCollection DVColumnCollection = GetColumnsForSMSLog(arrayy);
            EbDataVisualization Visualization = new EbTableVisualization { Sql = query, ParamsList = _params, Columns = DVColumnCollection, AutoGen = false, IsPaging = true };
            
            resp.Visualization = EbSerializers.Json_Serialize(Visualization);
            var x = EbSerializers.Json_Serialize(resp);
            return resp;
        }

        public DVColumnCollection GetColumnsForSMSLog(string[] strArray)
        {
            var Columns = new DVColumnCollection();
            try
            {
                foreach (string str in strArray)
                {
                    DVBaseColumn _col = null;
                    if (str == "send_from")
                        _col = new DVStringColumn { Data = 0, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true };
                    if (str == "send_to")
                        _col = new DVStringColumn { Data = 1, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true };
                    if (str == "message_body")
                        _col = new DVStringColumn { Data = 2, Name = str, sTitle = str, Type = EbDbTypes.String, AllowedCharacterLength = 20, bVisible = true };
                    if (str == "executed_by")
                        _col = new DVStringColumn { Data = 3, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true };
                    if (str == "executed_at")
                        _col = new DVDateTimeColumn { Data = 4, Name = str, sTitle = str, Type = EbDbTypes.Date, bVisible = true, Format = DateFormat.DateTime };
                    if (str == "status")
                        _col = new DVStringColumn { Data = 5, Name = str, sTitle = str, Type = EbDbTypes.String, bVisible = true };
                    if (str == "id")
                        _col = new DVNumericColumn { Data = 6, Name = str, sTitle = str, Type = EbDbTypes.Int32, bVisible = false };                   
                   
                    _col.Name = str;
                    _col.RenderType = _col.Type;
                    _col.ClassName = "tdheight";
                    _col.Font = null;
                    _col.Align = Align.Left;
                    Columns.Add(_col);
                }
                
                var str1 = String.Format("T0.status == \"{0}\"", "failure");
                Columns.Add(new DVButtonColumn { Data = 7, Name = "Action", sTitle = "Action", ButtonText = "Retry", bVisible = true, IsCustomColumn = true, RenderCondition = new AdvancedCondition { Value = new EbScript { Code = str1, Lang = ScriptingLanguage.CSharp } } });
            }
            catch (Exception e)
            {
                Console.WriteLine("no coloms" + e.StackTrace);
            }

            return Columns;
        }
    }
}
