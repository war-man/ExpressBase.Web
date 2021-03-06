﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using Newtonsoft.Json;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Common.Objects;
using ExpressBase.Common.Extensions;
using System.Reflection;
using ExpressBase.Common.Objects.Attributes;
using ExpressBase.Common.Data;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Constants;
using ExpressBase.Objects.Objects;
using System.IO;
using System.Net;

namespace ExpressBase.Web.Controllers
{
    public class WebFormController : EbBaseIntCommonController
    {
        public WebFormController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        public IActionResult Index(string refId, string _params, int _mode, int _locId)
        {
            Console.WriteLine(string.Format("Webform Render - refid : {0}, prams : {1}, mode : {2}, locid : {3}", refId, _params, _mode, _locId));
            ViewBag.renderMode = 1;
            ViewBag.rowId = 0;
            ViewBag.Mode = WebFormModes.New_Mode.ToString().Replace("_", " ");
            ViewBag.IsPartial = _mode > 10;
            _mode = _mode > 0 ? _mode % 10 : _mode;
            if (_params != null)
            {
                List<Param> ob = JsonConvert.DeserializeObject<List<Param>>(_params.FromBase64());
                if ((int)WebFormDVModes.View_Mode == _mode && ob.Count == 1)
                {
                    Console.WriteLine("Webform Render - View mode request identified.");
                    ViewBag.formData = getRowdata(refId, Convert.ToInt32(ob[0].ValueTo), _locId, 1);
                    if (ob[0].ValueTo > 0)
                    {
                        ViewBag.rowId = ob[0].ValueTo;
                        ViewBag.Mode = WebFormModes.View_Mode.ToString().Replace("_", " ");
                    }
                }
                else if ((int)WebFormDVModes.New_Mode == _mode)
                {
                    try
                    {
                        GetPrefillDataResponse Resp = ServiceClient.Post<GetPrefillDataResponse>(new GetPrefillDataRequest { RefId = refId, Params = ob, CurrentLoc = _locId, RenderMode = WebFormRenderModes.Normal });
                        ViewBag.formData = Resp.FormDataWrap;
                        ViewBag.Mode = WebFormModes.New_Mode.ToString().Replace("_", " ");
                    }
                    catch (Exception ex)
                    {
                        ViewBag.formData = JsonConvert.SerializeObject(new WebformDataWrapper { Message = "Something went wrong", Status = (int)HttpStatusCode.InternalServerError, MessageInt = ex.Message, StackTraceInt = ex.StackTrace });
                        Console.WriteLine("Exception in getPrefillData. Message: " + ex.Message);
                    }
                }
                else if ((int)WebFormModes.Export_mode == _mode)
                {
                    try
                    {
                        string sRefId = ob.Find(e => e.Name == "srcRefId")?.ValueTo ?? refId;
                        int sRowId = Convert.ToInt32(ob.Find(e => e.Name == "srcRowId")?.ValueTo ?? 0);
                        GetExportFormDataResponse Resp = ServiceClient.Post<GetExportFormDataResponse>(new GetExportFormDataRequest { DestRefId = refId, SourceRefId = sRefId, SourceRowId = sRowId, UserObj = this.LoggedInUser, CurrentLoc = _locId, RenderMode = WebFormRenderModes.Normal });
                        ViewBag.formData = Resp.FormDataWrap;
                        ViewBag.Mode = WebFormModes.New_Mode.ToString().Replace("_", " ");
                    }
                    catch (Exception ex)
                    {
                        ViewBag.formData = JsonConvert.SerializeObject(new WebformDataWrapper { Message = "Something went wrong", Status = (int)HttpStatusCode.InternalServerError, MessageInt = ex.Message, StackTraceInt = ex.StackTrace });
                        Console.WriteLine("Exception in GetExportFormData. Message: " + ex.Message);
                    }
                }
            }
            else
            {
                ViewBag.formData = getRowdata(refId, 0, _locId, 1);
            }

            if (ViewBag.wc == TokenConstants.DC)
            {
                ViewBag.Mode = WebFormModes.Preview_Mode.ToString().Replace("_", " ");
            }
            WebformDataWrapper wfd = JsonConvert.DeserializeObject<WebformDataWrapper>(ViewBag.formData);
            if (wfd.FormData == null)
            {
                TempData["ErrorResp"] = ViewBag.formData;
                return Redirect("/StatusCode/" + wfd.Status);
                //ViewBag.Mode = WebFormModes.Fail_Mode.ToString().Replace("_", " ");
            }
            ViewBag.formRefId = refId;
            ViewBag.userObject = JsonConvert.SerializeObject(this.LoggedInUser);

            ViewBag.__Solution = GetSolutionObject(ViewBag.cid);
            ViewBag.__User = this.LoggedInUser;

            return ViewComponent("WebForm", new string[] { refId, this.LoggedInUser.Preference.Locale });
        }

        //[HttpGet("WebFormRender/{refId}/{_params}/{_mode}/{_locId}/{rendermode}")]
        public IActionResult WebFormRender(string refId, string _params, int _mode, int _locId, int renderMode = 1)
        {
            Console.WriteLine(string.Format("Webform Render - refid : {0}, prams : {1}, mode : {2}, locid : {3}", refId, _params, _mode, _locId));
            ViewBag.renderMode = renderMode;
            ViewBag.rowId = 0;
            ViewBag.Mode = WebFormModes.New_Mode.ToString().Replace("_", " ");
            ViewBag.IsPartial = _mode > 10;
            _mode = _mode > 0 ? _mode % 10 : _mode;
            if (_params != null)
            {
                List<Param> ob = JsonConvert.DeserializeObject<List<Param>>(_params.FromBase64());
                if ((int)WebFormDVModes.View_Mode == _mode && ob.Count == 1)
                {
                    Console.WriteLine("Webform Render - View mode request identified.");
                    ViewBag.formData = getRowdata(refId, Convert.ToInt32(ob[0].ValueTo), _locId, renderMode);
                    if (ob[0].ValueTo > 0)
                    {
                        ViewBag.rowId = ob[0].ValueTo;
                        ViewBag.Mode = WebFormModes.View_Mode.ToString().Replace("_", " ");
                    }
                }
                else if ((int)WebFormDVModes.New_Mode == _mode)
                {
                    try
                    {
                        GetPrefillDataResponse Resp = ServiceClient.Post<GetPrefillDataResponse>(new GetPrefillDataRequest { RefId = refId, Params = ob, CurrentLoc = _locId, RenderMode = (WebFormRenderModes)renderMode });
                        ViewBag.formData = Resp.FormDataWrap;
                        ViewBag.Mode = WebFormModes.New_Mode.ToString().Replace("_", " ");
                    }
                    catch (Exception ex)
                    {
                        ViewBag.formData = JsonConvert.SerializeObject(new WebformDataWrapper { Message = "Something went wrong", Status = (int)HttpStatusCode.InternalServerError, MessageInt = ex.Message, StackTraceInt = ex.StackTrace });
                        Console.WriteLine("Exception in getPrefillData. Message: " + ex.Message);
                    }
                }
            }
            else
            {
                ViewBag.formData = getRowdata(refId, 0, _locId, renderMode);
            }

            if (ViewBag.wc == TokenConstants.DC)
            {
                ViewBag.Mode = WebFormModes.Preview_Mode.ToString().Replace("_", " ");
            }
            WebformDataWrapper wfd = JsonConvert.DeserializeObject<WebformDataWrapper>(ViewBag.formData);
            if (wfd.FormData == null)
            {
                TempData["ErrorResp"] = ViewBag.formData;
                return Redirect("/StatusCode/" + wfd.Status);
                //ViewBag.Mode = WebFormModes.Fail_Mode.ToString().Replace("_", " ");
            }
            ViewBag.formRefId = refId;
            ViewBag.userObject = JsonConvert.SerializeObject(this.LoggedInUser);

            ViewBag.__Solution = GetSolutionObject(ViewBag.cid);
            ViewBag.__User = this.LoggedInUser;

            return ViewComponent("WebForm", new string[] { refId, this.LoggedInUser.Preference.Locale });
        }

        // to get Table- // refid form refid, rowid - form table entry id, currentloc - location id
        public string getRowdata(string refid, int rowid, int currentloc, int renderMode)
        {
            try
            {
                GetRowDataResponse DataSet = ServiceClient.Post<GetRowDataResponse>(new GetRowDataRequest { RefId = refid, RowId = rowid, CurrentLoc = currentloc, RenderMode = (WebFormRenderModes)renderMode });
                return DataSet.FormDataWrap;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in getRowdata. Message: " + ex.Message);
                return JsonConvert.SerializeObject(new WebformDataWrapper()
                {
                    Message = "Error in loading data...",
                    Status = (int)HttpStatusCode.InternalServerError,
                    MessageInt = ex.Message,
                    StackTraceInt = ex.StackTrace
                });
            }
        }

        //public string getDGdata(string refid, List<Param> _params)
        //{
        //    WebformDataWrapper WebformDataWrapper = new WebformDataWrapper();
        //    string ObjStr = string.Empty;
        //    try
        //    {
        //        EbDataReader dataReader = this.Redis.Get<EbDataReader>(refid);
        //        foreach (Param item in dataReader.InputParams)
        //        {
        //            foreach (Param _p in _params)
        //            {
        //                if (item.Name == _p.Name)
        //                    _p.Type = item.Type;
        //            }
        //        }
        //        GetImportDataResponse Resp = ServiceClient.Post<GetImportDataResponse>(new GetImportDataRequest { RefId = refid, Params = _params });
        //        WebformDataWrapper = new WebformDataWrapper { FormData = Resp.FormData, Status = (int)HttpStatusCodes.OK };
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine("Exception in getDGdata. Message: " + ex.Message);
        //        WebformDataWrapper = new WebformDataWrapper()
        //        {
        //            Message = "Error in loading data...",
        //            Status = (int)HttpStatusCodes.INTERNAL_SERVER_ERROR,
        //            MessageInt = ex.Message,
        //            StackTraceInt = ex.StackTrace
        //        };
        //    }
        //    ObjStr = JsonConvert.SerializeObject(WebformDataWrapper);
        //    return ObjStr;
        //}

        public string ImportFormData(string _refid, int _rowid, string _triggerctrl, List<Param> _params)
        {
            try
            {
                if (_refid.IsNullOrEmpty() || _triggerctrl.IsNullOrEmpty())
                    throw new FormException("Refid and TriggerCtrl must be set");
                GetImportDataResponse Resp = ServiceClient.Post<GetImportDataResponse>(new GetImportDataRequest { RefId = _refid, RowId = _rowid, Trigger = _triggerctrl, Params = _params });
                return Resp.FormDataWrap;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in ImportFormData. Message: " + ex.Message);
                return JsonConvert.SerializeObject(new WebformDataWrapper()
                {
                    Message = "Error in loading data...",
                    Status = (int)HttpStatusCode.InternalServerError,
                    MessageInt = ex.Message,
                    StackTraceInt = ex.StackTrace
                });
            }
        }

        public string GetDynamicGridData(string _refid, int _rowid, string _srcid, string[] _target)
        {
            try
            {
                if (_refid.IsNullOrEmpty() || _srcid.IsNullOrEmpty() || _target.Length == 0)
                    throw new FormException("Refid, SrcId and Target must be set.");
                GetDynamicGridDataResponse Resp = ServiceClient.Post<GetDynamicGridDataResponse>(new GetDynamicGridDataRequest { RefId = _refid, RowId = _rowid, SourceId = _srcid, Target = _target });
                return Resp.FormDataWrap;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in GetDynamicGridData. Message: " + ex.Message);
                return JsonConvert.SerializeObject(new WebformDataWrapper()
                {
                    Message = "Error in loading data...",
                    Status = (int)HttpStatusCode.InternalServerError,
                    MessageInt = ex.Message,
                    StackTraceInt = ex.StackTrace
                });
            }
        }

        public string ExecuteSqlValueExpr(string _refid, string _triggerctrl, List<Param> _params)
        {
            ExecuteSqlValueExprResponse Resp = this.ServiceClient.Post<ExecuteSqlValueExprResponse>(new ExecuteSqlValueExprRequest { RefId = _refid, Trigger = _triggerctrl, Params = _params });
            return Resp.Data;
        }

        public string GetDataPusherJson(string RefId)
        {
            GetDataPusherJsonResponse Resp = this.ServiceClient.Post<GetDataPusherJsonResponse>(new GetDataPusherJsonRequest { RefId = RefId });
            return Resp.Json;
        }

        public string InsertWebformData(string TableName, string ValObj, string RefId, int RowId, int CurrentLoc)
        {
            try
            {
                //string Operation = OperationConstants.NEW;
                //if (RowId > 0)
                //    Operation = OperationConstants.EDIT;
                //if (!this.HasPermission(RefId, Operation, CurrentLoc))
                //    return JsonConvert.SerializeObject(new InsertDataFromWebformResponse { Status = (int)HttpStatusCodes.FORBIDDEN, RowAffected = -2, RowId = -2 });
                DateTime dt = DateTime.Now;
                Console.WriteLine("InsertWebformData request received : " + dt);
                WebformData Values = JsonConvert.DeserializeObject<WebformData>(ValObj);
                InsertDataFromWebformResponse Resp = ServiceClient.Post<InsertDataFromWebformResponse>(
                    new InsertDataFromWebformRequest
                    {
                        RefId = RefId,
                        FormData = Values,
                        RowId = RowId,
                        CurrentLoc = CurrentLoc
                    });
                Console.WriteLine("InsertWebformData execution time : " + (DateTime.Now - dt).TotalMilliseconds);
                return JsonConvert.SerializeObject(Resp);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception : " + ex.Message + "\n" + ex.StackTrace);
                return JsonConvert.SerializeObject(new InsertDataFromWebformResponse { Status = (int)HttpStatusCode.InternalServerError, Message = "Something went wrong", MessageInt = ex.Message, StackTraceInt = ex.StackTrace });
            }
        }

        public int DeleteWebformData(string RefId, int RowId, int CurrentLoc)
        {
            if (!this.HasPermission(RefId, OperationConstants.DELETE, CurrentLoc))
                return -2; //Access Denied
            DeleteDataFromWebformResponse Resp = ServiceClient.Post<DeleteDataFromWebformResponse>(new DeleteDataFromWebformRequest { RefId = RefId, RowId = new List<int> { RowId } });
            return Resp.RowAffected;
        }

        public int CancelWebformData(string RefId, int RowId, int CurrentLoc)
        {
            if (!this.HasPermission(RefId, OperationConstants.CANCEL, CurrentLoc))
                return -2; //Access Denied
            CancelDataFromWebformResponse Resp = ServiceClient.Post<CancelDataFromWebformResponse>(new CancelDataFromWebformRequest { RefId = RefId, RowId = RowId });
            return Resp.RowAffected;
        }

        public string GetAuditTrail(string refid, int rowid, int currentloc)
        {
            try
            {
                //if (this.HasPermission(refid, OperationConstants.AUDIT_TRAIL, currentloc))
                //{
                GetAuditTrailResponse Resp = ServiceClient.Post<GetAuditTrailResponse>(new GetAuditTrailRequest { FormId = refid, RowId = rowid });
                return Resp.Json;
                //}
                //throw new FormException("GetAuditTrail Access Denied for rowid " + rowid + " , current location " + currentloc);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in GetAuditTrail. Message: " + ex.Message);
                return string.Empty;
            }
        }

        private bool HasPermission(string RefId, string ForWhat, int LocId)
        {
            if (ViewBag.wc != RoutingConstants.UC)
                return false;
            if (this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()) ||
                this.LoggedInUser.Roles.Contains(SystemRoles.SolutionAdmin.ToString()) ||
                this.LoggedInUser.Roles.Contains(SystemRoles.SolutionPM.ToString()))
                return true;

            EbOperation Op = EbWebForm.Operations.Get(ForWhat);
            EbObjectType EbType = RefId.GetEbObjectType();
            if (EbType.IntCode == EbObjectTypes.Report)
                Op = EbReport.Operations.Get(ForWhat);

            if (!Op.IsAvailableInWeb)
                return false;

            try
            {
                string Ps = string.Concat(RefId.Split("-")[2].PadLeft(2, '0'), '-', RefId.Split("-")[3].PadLeft(5, '0'), '-', Op.IntCode.ToString().PadLeft(2, '0'));
                string t = this.LoggedInUser.Permissions.FirstOrDefault(p => p.Substring(p.IndexOf("-") + 1).Equals(Ps + ":" + LocId) ||
                            (p.Substring(p.IndexOf("-") + 1, 11).Equals(Ps) && p.Substring(p.LastIndexOf(":") + 1).Equals("-1")));
                if (!t.IsNullOrEmpty())
                    return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(string.Format("Exception when checking user permission: {0}\nRefId = {1}\nOperation = {2}\nLocId = {3}", e.Message, RefId, ForWhat, LocId));
            }

            return false;
        }

        public string DoUniqueCheck(UniqCheckParam[] uniqCheckParams)
        {
            DoUniqueCheckResponse Resp = ServiceClient.Post<DoUniqueCheckResponse>(new DoUniqueCheckRequest { UniqCheckParam = uniqCheckParams });
            return JsonConvert.SerializeObject(Resp.Response);
        }

        public IActionResult GetPdfReport(string refId, string rowId)
        {
            if (!this.HasPermission(refId, OperationConstants.PRINT, -1))//////
                return Redirect("/StatusCode/401");
            List<Param> p = new List<Param>();
            p.Add(new Param { Name = "id", Value = rowId, Type = "7" });
            string s = JsonConvert.SerializeObject(p);
            s = s.ToBase64();
            return Redirect("/ReportRender/Renderlink?refid=" + refId + "&_params=" + s);
        }

        public int InsertBotDetails(string TableName, List<BotFormField> Fields, int Id)
        {
            try
            {
                InsertIntoBotFormTableResponse resp = ServiceClient.Post<InsertIntoBotFormTableResponse>(new InsertIntoBotFormTableRequest { TableName = TableName, Fields = Fields, Id = Id });
                return resp.RowAffected;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception in InsertBotDetails. Message: " + ex.Message);
                return 0;
            }
        }

        public string getDesignHtml(string refId)
        {
            GetDesignHtmlResponse resp = ServiceClient.Post<GetDesignHtmlResponse>(new GetDesignHtmlRequest { RefId = refId });
            return resp.Html;
        }

        public string GetLocationConfig()
        {
            Eb_Solution SolutionObj = GetSolutionObject(ViewBag.Cid);
            return JsonConvert.SerializeObject(SolutionObj.LocationConfig);
        }

        //public string AuditTrail(string refid, int rowid)
        //{
        //    //sourc == dest == type == dst id == dst verid== src id == src verid
        //    //ebdbllz23nkqd620180220120030-ebdbllz23nkqd620180220120030-0-2257-2976-2257-2976
        //    try
        //    {
        //        string[] refidparts = refid.Split("-");
        //        if (refidparts[1].Equals(ViewBag.cid))
        //        {
        //            if (this.LoggedInUser.EbObjectIds.Contains(refidparts[3].PadLeft(5, '0')) || this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()))
        //            {
        //                GetAuditTrailResponse Resp = ServiceClient.Post<GetAuditTrailResponse>(new GetAuditTrailRequest { FormId = refid, RowId = rowid });
        //                //----------------------This code should be changed

        //                EbObjectParticularVersionResponse verResp = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
        //                EbWebForm WebForm = EbSerializers.Json_Deserialize<EbWebForm>(verResp.Data[0].Json);
        //                if (WebForm != null)
        //                {
        //                    string[] Keys = EbControlContainer.GetKeys(WebForm);
        //                    Dictionary<string, string> KeyValue = ServiceClient.Get<GetDictionaryValueResponse>(new GetDictionaryValueRequest { Keys = Keys, Locale = this.LoggedInUser.Preference.Locale }).Dict;
        //                    EbWebForm WebForm_L = EbControlContainer.Localize<EbWebForm>(WebForm, KeyValue);

        //                    Dictionary<string, string> MLPair = GetMLPair(WebForm_L);

        //                    foreach (KeyValuePair<int, FormTransaction> item in Resp.Logs)
        //                    {
        //                        foreach (FormTransactionLine initem in item.Value.Details)
        //                        {
        //                            if (MLPair.ContainsKey(initem.FieldName))
        //                                initem.FieldName = MLPair[initem.FieldName];
        //                        }
        //                    }
        //                }

        //                //--------------------------------
        //                return JsonConvert.SerializeObject(Resp.Logs);
        //            }
        //        }
        //        return string.Empty;
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine("Exception in GetAuditTrail. Message: " + ex.Message);
        //        return string.Empty;
        //    }
        //}

        //private Dictionary<string, string> GetMLPair(EbWebForm WebForm_L)
        //{
        //    Dictionary<string, string> MLPair = new Dictionary<string, string>();
        //    EbControl[] controls = (WebForm_L as EbControlContainer).Controls.FlattenAllEbControls();
        //    foreach (EbControl control in controls)
        //    {
        //        PropertyInfo[] props = control.GetType().GetProperties();
        //        foreach (PropertyInfo prop in props)
        //        {
        //            if (prop.IsDefined(typeof(PropertyEditor)) && prop.GetCustomAttribute<PropertyEditor>().PropertyEditorType == (int)PropertyEditorType.MultiLanguageKeySelector)
        //            {
        //                if (prop.Name == "Label")
        //                    MLPair.Add(control.Name, control.GetType().GetProperty(prop.Name).GetValue(control, null) as String);
        //            }
        //        }
        //    }
        //    return MLPair;
        //}

        public string GetFormControlsFlat(string refId)
        {
            string SCtrls = string.Empty;
            SCtrls = EbSerializers.Json_Serialize(this.ServiceClient.Post<GetCtrlsFlatResponse>(new GetCtrlsFlatRequest() { RefId = refId }).Controls);
            return SCtrls;
        }

        public string updateAllFormTables()
        {
            if (ViewBag.wc == RoutingConstants.DC && this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()))
            {
                try
                {
                    UpdateAllFormTablesResponse r = this.ServiceClient.Post<UpdateAllFormTablesResponse>(new UpdateAllFormTablesRequest());
                    return r.Message;
                }
                catch (Exception e)
                {
                    return e.Message;
                }
            }
            else
                return ViewBag.wc;
        }



        //for ebblueprint (save bg img,svg)
        public object SaveBluePrint(string svgtxtdata, string bpmeta, int bluprntid, string savBPobj)
        {
            SaveBluePrintRequest Svgreq = new SaveBluePrintRequest();
            //Dictionary<string, string> objBP = JsonConvert.DeserializeObject<Dictionary<string, string>>(savBPobj);
            var httpreq = this.HttpContext.Request.Form;
            if (httpreq.Files.Count > 0)
            {

                var BgFile = httpreq.Files[0];
                byte[] fileData = null;
                using (var memoryStream = new MemoryStream())
                {
                    BgFile.CopyTo(memoryStream);
                    memoryStream.Seek(0, SeekOrigin.Begin);
                    fileData = new byte[memoryStream.Length];
                    memoryStream.ReadAsync(fileData, 0, fileData.Length);
                    Svgreq.BgFile = fileData;
                    Svgreq.BgFileName = BgFile.FileName;
                }
            }
            Svgreq.Txtsvg = svgtxtdata;
            Svgreq.MetaBluePrint = bpmeta;
            Svgreq.BluePrintID = bluprntid;
            //Svgreq.BP_FormData = objBP;


            SaveBluePrintResponse BPres = this.ServiceClient.Post<SaveBluePrintResponse>(Svgreq);
            return BPres;
        }
        public object RetriveBluePrint(int idno)
        {
            RetriveBluePrintResponse rsvg = this.ServiceClient.Post<RetriveBluePrintResponse>(new RetriveBluePrintRequest { Idno = idno });
            return rsvg;

        }

        public object UpdateBluePrint_Dev(int bluprntid, string uptBPobj)
        {
            UpdateBluePrint_DevRequest UpReq = new UpdateBluePrint_DevRequest();
            UpReq.BluePrintID = 0;
            Dictionary<string, string> objBP = JsonConvert.DeserializeObject<Dictionary<string, string>>(uptBPobj);
            var httpreq = this.HttpContext.Request.Form;
            if (httpreq.Files.Count > 0)
            {

                var BgFile = httpreq.Files[0];
                byte[] fileData = null;
                using (var memoryStream = new MemoryStream())
                {
                    BgFile.CopyTo(memoryStream);
                    memoryStream.Seek(0, SeekOrigin.Begin);
                    fileData = new byte[memoryStream.Length];
                    memoryStream.ReadAsync(fileData, 0, fileData.Length);
                    UpReq.BgFile = fileData;
                    UpReq.BgFileName = BgFile.FileName;
                }
            }
            UpReq.BluePrintID = bluprntid;
            UpReq.BP_FormData_Dict = objBP;

            UpdateBluePrint_DevResponse UpResp = this.ServiceClient.Post<UpdateBluePrint_DevResponse>(UpReq);
            return UpResp;
        }
        public IActionResult GetProfile(string r, int l)
        {
            int _mode = 0;
            string p = string.Empty;
            EbObjectParticularVersionResponse verResp = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = r });
            if (verResp != null)
            {
                EbWebForm form = EbSerializers.Json_Deserialize<EbWebForm>(verResp.Data[0].Json);
                if (form != null)
                {
                    GetMyProfileEntryResponse resp = this.ServiceClient.Get(new GetMyProfileEntryRequest { TableName = form.TableName });
                    if (resp != null)
                    {
                        if (resp.RowId > 0)
                        {
                            p = JsonConvert.SerializeObject(new List<Param> { new Param { Name = "id", Type = ((int)EbDbTypes.Int32).ToString(), Value = resp.RowId.ToString() } }).ToBase64();
                            _mode = (int)WebFormModes.View_Mode;
                        }
                        else
                        {
                            _mode = (int)WebFormModes.New_Mode;
                        }
                        return RedirectToAction("WebFormRender", new
                        {
                            refId = r,
                            _locId = l,
                            _mode = _mode,
                            _params = p,
                            renderMode = 4
                        });
                    }
                }
            }
            return Redirect("/StatusCode/404");
        }

    }
}