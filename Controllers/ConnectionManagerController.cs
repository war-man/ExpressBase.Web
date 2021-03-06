﻿using ExpressBase.Common;
using ExpressBase.Common.Connections;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Data;
using ExpressBase.Common.Helpers;
using ExpressBase.Common.Messaging;
//using ExpressBase.Common.Messaging.ExpertTexting;
//using ExpressBase.Common.Messaging.Twilio;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class ConnectionManagerController : EbBaseIntTenantController
    {
        public ConnectionManagerController(IServiceClient _ssclient, IRedisClient _redis, IEbMqClient _mqc, IEbStaticFileClient _sfc) : base(_ssclient, _redis, _mqc, _sfc)
        {
        }

        [HttpGet]
        public IActionResult RefreshConnections()
        {
            return View();
        }

        [HttpPost]
        public IActionResult RefreshConnections(int i)
        {
            RefreshSolutionConnectionsAsyncResponse res = new RefreshSolutionConnectionsAsyncResponse();
            var req = this.HttpContext.Request.Form;
            try
            {
                res = this.MqClient.Post<RefreshSolutionConnectionsAsyncResponse>(new RefreshSolutionConnectionsBySolutionIdAsyncRequest()
                {
                    SolutionId = String.IsNullOrEmpty(req["solutionId"]) ? ViewBag.cid : req["solutionId"]
                });
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception:" + e.Message.ToString() + "\nResponse: " + res.ResponseStatus.Message);
            }
            return View();
        }

        //[Microsoft.AspNetCore.Mvc.Route("/sampletest")]
        //public IActionResult SampleTest()
        //{
        //    this.ServiceClient.Post(new sampletest { });
        //    return View("test");
        //}

        // GET: /<controller>/

        //public IActionResult Index()
        //{
        //    GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = 0 });
        //    if ((solutionConnections.EBSolutionConnections.FilesDbConnection.IsDefault == true))
        //        solutionConnections.EBSolutionConnections.FilesDbConnection = new EbFilesDbConnection();
        //    if ((solutionConnections.EBSolutionConnections.DataDbConnection.IsDefault == true))
        //        solutionConnections.EBSolutionConnections.DataDbConnection = new EbDataDbConnection();
        //    if ((solutionConnections.EBSolutionConnections.SMTPConnection == null))
        //        solutionConnections.EBSolutionConnections.SMTPConnection = new SMTPConnection();
        //    if (solutionConnections.EBSolutionConnections == null)
        //        solutionConnections.EBSolutionConnections.SMSConnection = new SMSConnection();
        //    if ((solutionConnections.EBSolutionConnections.ObjectsDbConnection.IsDefault == true))
        //        solutionConnections.EBSolutionConnections.ObjectsDbConnection = new EbObjectsDbConnection();

        //    ViewBag.Connections = solutionConnections.EBSolutionConnections;
        //    return View();
        //}


        //[HttpGet]
        //public IActionResult DataDb()
        //{
        //    GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbDATA });
        //    if ((solutionConnections.EBSolutionConnections.DataDbConnection.IsDefault == true))
        //        solutionConnections.EBSolutionConnections.DataDbConnection = new EbDataDbConnection();
        //    ViewBag.DataDb = solutionConnections.EBSolutionConnections.DataDbConnection;

        //    return View();
        //}

        //[HttpGet]
        //public IActionResult ObjectsDb()
        //{
        //    GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbDATA });
        //    if ((solutionConnections.EBSolutionConnections.ObjectsDbConnection.IsDefault == true))
        //        solutionConnections.EBSolutionConnections.ObjectsDbConnection = new EbObjectsDbConnection();
        //    ViewBag.ObjDb = solutionConnections.EBSolutionConnections.ObjectsDbConnection;

        //    return View();
        //}

        //[HttpGet]
        //public IActionResult FilesDb()
        //{
        //    GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbDATA });
        //    if ((solutionConnections.EBSolutionConnections.FilesDbConnection.IsDefault == true))
        //        solutionConnections.EBSolutionConnections.FilesDbConnection = new EbFilesDbConnection();
        //    ViewBag.FilesDb = solutionConnections.EBSolutionConnections.FilesDbConnection;
        //    return View();
        //}

        //[HttpGet]
        //public IActionResult SMTP()
        //{
        //    GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.SMTP });
        //    if ((solutionConnections.EBSolutionConnections.EmailConnections == null))
        //        solutionConnections.EBSolutionConnections.EmailConnections = new EbMailConCollection();
        //    ViewBag.SMTP = solutionConnections.EBSolutionConnections.EmailConnections;

        //    return View();
        //}

        //[HttpGet]
        //public IActionResult SMSAccount()
        //{
        //    GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.SMS });
        //    if (solutionConnections.EBSolutionConnections == null)
        //        solutionConnections.EBSolutionConnections.SMSConfigs = new EbSmsConCollection();
        //    ViewBag.SMS = solutionConnections.EBSolutionConnections.SMSConfigs;
        //    return View();
        //}

        //[HttpPost]
        //public string DataDb(int i)
        //{
        //    var req = this.HttpContext.Request.Form;

        //    GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbDATA, SolutionId = req["SolutionId"] });
        //     string solutionid = this.HttpContext.Request.Query["Sid"];

        //    EbDataDbConnection dbcon = new EbDataDbConnection()
        //    {
        //        DatabaseVendor = Enum.Parse<DatabaseVendors>(req["databaseVendor"].ToString()),
        //        DatabaseName = req["databaseName"],
        //        Server = req["server"],
        //        Port = Convert.ToInt32(req["port"]),
        //        UserName = req["userName"],
        //        Password = req["password"],
        //        ReadWriteUserName = req["readWriteUserName"],
        //        ReadWritePassword = req["readWritePassword"],
        //        ReadOnlyUserName = req["readOnlyUserName"],
        //        ReadOnlyPassword = req["readOnlyPassword"],
        //        Timeout = Convert.ToInt32(req["timeout"]),
        //        IsDefault = false,
        //        IsSSL = (req["IsSSL"] == "on") ? true : false
        //    };

        //    EbObjectsDbConnection objdbcon = new EbObjectsDbConnection()
        //    {
        //        DatabaseVendor = Enum.Parse<DatabaseVendors>(req["databaseVendor"].ToString()),
        //        DatabaseName = req["databaseName"],
        //        Server = req["server"],
        //        Port = Convert.ToInt32(req["port"]),
        //        UserName = req["userName"],
        //        Password = req["password"],
        //        ReadWriteUserName = req["readWriteUserName"],
        //        ReadWritePassword = req["readWritePassword"],
        //        ReadOnlyUserName = req["readOnlyUserName"],
        //        ReadOnlyPassword = req["readOnlyPassword"],
        //        Timeout = Convert.ToInt32(req["timeout"]),
        //        IsDefault = false,
        //        IsSSL = (req["IsSSL"] == "on") ? true : false
        //    };

        //    this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeDataDBConnectionRequest { DataDBConnection = dbcon, IsNew = false, SolutionId = req["SolutionId"] });
        //    this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeObjectsDBConnectionRequest { ObjectsDBConnection = objdbcon, IsNew = false, SolutionId = req["SolutionId"] });

        //    //if (solutionConnections.EBSolutionConnections.DataDbConnection != null)
        //    //{
        //    //    if (String.IsNullOrEmpty(dbcon.Password) && dbcon.UserName == solutionConnections.EBSolutionConnections.SMSConnection.UserName && dbcon.Server == solutionConnections.EBSolutionConnections.DataDbConnection.Server)
        //    //        dbcon.Password = solutionConnections.EBSolutionConnections.DataDbConnection.Password;
        //    //    if (!this.ServiceClient.Post<bool>(new ChangeDataDBConnectionRequest { DataDBConnection = dbcon, IsNew = false }))
        //    //    {
        //    //        if (req["databaseVendor"].ToString() == "ORACLE")
        //    //        {
        //    //            var response = this.ServiceClient.Post(new EbDbCreateRequest { dbName = dbcon.DatabaseName, ischange = "true" });
        //    //        }       
        //    //    }

        //    //}
        //    //else
        //    //    this.ServiceClient.Post<bool>(new ChangeDataDBConnectionRequest { DataDBConnection = dbcon, IsNew = true });
        //    //if (solutionConnections.EBSolutionConnections.ObjectsDbConnection != null)
        //    //{
        //    //    if (String.IsNullOrEmpty(objdbcon.Password) && objdbcon.UserName == solutionConnections.EBSolutionConnections.ObjectsDbConnection.UserName && objdbcon.Server == solutionConnections.EBSolutionConnections.ObjectsDbConnection.Server)
        //    //        objdbcon.Password = solutionConnections.EBSolutionConnections.ObjectsDbConnection.Password;
        //    //    if (!this.ServiceClient.Post<bool>(new ChangeObjectsDBConnectionRequest { ObjectsDBConnection = objdbcon, IsNew = false }))
        //    //    {
        //    //        if (req["databaseVendor"].ToString() == "ORACLE")
        //    //            this.ServiceClient.Post<bool>(new EbCreateOracleDBRequest { });
        //    //    }

        //    //}
        //    //else
        //    //    this.ServiceClient.Post<bool>(new ChangeObjectsDBConnectionRequest { ObjectsDBConnection = objdbcon, IsNew = true });
        //    return JsonConvert.SerializeObject(dbcon);
        //}

        // [HttpPost]
        //public IActionResult ObjectsDb(int i)
        //{
        //    ChangeConnectionResponse res = new ChangeConnectionResponse();
        //    try
        //    {
        //        var req = this.HttpContext.Request.Form;
        //        GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbOBJECTS, SolutionId = req["SolutionId"] });

        //        EbObjectsDbConnection dbcon = new EbObjectsDbConnection();
        //        dbcon.NickName = req["nickname"];
        //        dbcon.Server = req["server"];
        //        dbcon.Port = Int32.Parse(req["port"]);
        //        dbcon.UserName = req["username"];
        //        dbcon.DatabaseName = req["databasename"];
        //        dbcon.Timeout = 500;
        //        dbcon.Password = req["pwd"];
        //        if (!String.IsNullOrEmpty(req["Isdef"]))
        //            dbcon.IsDefault = false;

        //        if (solutionConnections.EBSolutionConnections.ObjectsDbConnection != null)
        //        {
        //                dbcon.Password = solutionConnections.EBSolutionConnections.ObjectsDbConnection.Password;
        //            res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeObjectsDBConnectionRequest { ObjectsDBConnection = dbcon, IsNew = false });
        //        }
        //        else
        //            res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeObjectsDBConnectionRequest { ObjectsDBConnection = dbcon, IsNew = true });
        //    }
        //    catch (Exception e)
        //    {
        //        Console.WriteLine("Exception: " + e.Message + "\nResponse: " + res.ResponseStatus.Message);
        //    }
        //    return Redirect("/ConnectionManager");
        //}

        //[HttpPost]
        //public string FilesDb(int i)
        //{
        //    ChangeConnectionResponse res = new ChangeConnectionResponse();
        //    try
        //    {
        //        var req = this.HttpContext.Request.Form;

        //        GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbFILES, SolutionId = req["SolutionId"] });
        //        EbFilesDbConnection dbcon = new EbFilesDbConnection()
        //        {
        //            FilesDbVendor = Enum.Parse<FilesDbVendors>(req["DatabaseVendor"].ToString()),
        //            FilesDB_url = req["ConnectionString"].ToString(),
        //            NickName = req["NickName"].ToString(),
        //            IsDefault = false
        //        };

        //        //if (solutionConnections.EBSolutionConnections.FilesDbConnection != null)
        //        //    res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeFilesDBConnectionRequest { FilesDBConnection = dbcon, IsNew = false, SolutionId = req["SolutionId"] });
        //        //else
        //            res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeFilesDBConnectionRequest { FilesDBConnection = dbcon, IsNew = true, SolutionId = req["SolutionId"] });
        //        return JsonConvert.SerializeObject(dbcon);

        //    }
        //    catch (Exception e)
        //    {
        //        res.ResponseStatus.Message = e.Message;
        //        return null;
        //    }
        //}

        //[HttpPost]
        //public string TwilioAccount()
        //{
        //    ChangeConnectionResponse res = new ChangeConnectionResponse();
        //    try
        //    {
        //        var req = this.HttpContext.Request.Form;
        //        GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.SMS, SolutionId = req["SolutionId"] });

        //        TwilioConnection smscon = new TwilioConnection
        //        {
        //            UserName = req["UserName"],
        //            From = req["From"],
        //            Password = req["Password"],
        //            Preference = (ConPreferences)Convert.ToInt32(req["Preference"]),
        //        };

        //        //if (solutionConnections.EBSolutionConnections.SMSConfigs.Capacity == 0)
        //        //{
        //        //    smscon.Preference = ConPreferences.PRIMARY;
        //        //}

        //        if (Convert.ToInt32(req["Conid"]) > 0)
        //            res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeSMSConnectionRequest { SMSConnection = smscon, IsNew = false, SolutionId = req["SolutionId"] });
        //        else
        //            res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeSMSConnectionRequest { SMSConnection = smscon, IsNew = true, SolutionId = req["SolutionId"] });
        //        return JsonConvert.SerializeObject(smscon);
        //    }
        //    catch (Exception e)
        //    {
        //        res.ResponseStatus.Message = e.Message;
        //        return null;
        //    }
        //}

        //[HttpPost]
        //public string ExpertTextingAccount()
        //{
        //    ChangeConnectionResponse res = new ChangeConnectionResponse();
        //    try
        //    {
        //        var req = this.HttpContext.Request.Form;
        //        ExpertTextingConnection smscon = new ExpertTextingConnection
        //        {
        //            UserName = req["UserName"],
        //            From = req["From"],
        //            Password = req["Password"],
        //            Preference = (ConPreferences)Convert.ToInt32(req["Preference"]),
        //            ApiKey = req["ApiKey"]
        //        };
        //        GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.SMS, SolutionId = req["SolutionId"] });
        //        //if (solutionConnections.EBSolutionConnections.SMSConfigs.Capacity == 0)
        //        //{
        //        //    smscon.Preference = ConPreferences.PRIMARY;
        //        //}
        //        if (Convert.ToInt32(req["Conid"]) > 0)
        //            res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeSMSConnectionRequest { SMSConnection = smscon, IsNew = false, SolutionId = req["SolutionId"] });
        //        else
        //            res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeSMSConnectionRequest { SMSConnection = smscon, IsNew = true, SolutionId = req["SolutionId"] });
        //        return JsonConvert.SerializeObject(smscon);
        //    }
        //    catch (Exception e)
        //    {
        //        res.ResponseStatus.Message = e.Message;
        //        return null;
        //    }
        //}

        //[HttpPost]
        //public string Cloudinary(int i)
        //{
        //    ChangeConnectionResponse res = new ChangeConnectionResponse();
        //    try
        //    {
        //        var req = this.HttpContext.Request.Form;

        //        GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.Cloudinary, SolutionId = req["SolutionId"] });
        //        EbCloudinaryConnection con = new EbCloudinaryConnection()
        //        {
        //            Account = new CloudinaryDotNet.Account(req["Cloud"], req["ApiKey"], req["ApiSecret"]),
        //            IsDefault = false
        //        };

        //        //if (String.IsNullOrEmpty(con.Account.Cloud) &&
        //        //    //con.Account.Cloud == solutionConnections.EBSolutionConnections.CloudinaryConnection.Account.Cloud &&
        //        //    //con.Account.ApiKey == solutionConnections.EBSolutionConnections.CloudinaryConnection.Account.ApiKey)
        //        //    res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeCloudinaryConnectionRequest { ImageManipulateConnection = con, IsNew = false, SolutionId = req["SolutionId"] });
        //        //else
        //            res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeCloudinaryConnectionRequest { ImageManipulateConnection = con, IsNew = true, SolutionId = req["SolutionId"] });
        //        return JsonConvert.SerializeObject(con);
        //    }
        //    catch (Exception e)
        //    {
        //        res.ResponseStatus.Message = e.Message;
        //        return null;
        //    }
        //}


        //[HttpPost]
        //public string FTP(int i)
        //{
        //    ChangeConnectionResponse res = new ChangeConnectionResponse();
        //    try
        //    {
        //        var req = this.HttpContext.Request.Form;

        //        GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.FTP, SolutionId = req["SolutionId"] });
        //        EbFTPConnection con = new EbFTPConnection()
        //        {
        //            Host = req["Host"],
        //            Username = req["Username"],
        //            Password = req["Password"],
        //            NickName = req["NickName"],
        //            IsDefault = false
        //        };

        //        //if (String.IsNullOrEmpty(con.Host) &&
        //        //    //con.Host == solutionConnections.EBSolutionConnections.FTPConnection.Host &&
        //        //    //con.Username == solutionConnections.EBSolutionConnections.FTPConnection.Username)
        //        //    res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeFTPConnectionRequest { FTPConnection = con, IsNew = false, SolutionId = req["SolutionId"] });
        //        //else
        //            res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeFTPConnectionRequest { FTPConnection = con, IsNew = true, SolutionId = req["SolutionId"] });
        //        return JsonConvert.SerializeObject(con);
        //    }
        //    catch (Exception e)
        //    {
        //        res.ResponseStatus.Message = e.Message;
        //        return null;
        //    }
        //}

        //[HttpPost]
        //public string SMTP(int i)
        //{
        //    ChangeConnectionResponse res = new ChangeConnectionResponse();
        //    try
        //    {
        //        var req = this.HttpContext.Request.Form;

        //        GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.SMTP, SolutionId = req["SolutionId"] });
        //        EbEmail smtpcon = new EbEmail
        //        {
        //            ProviderName = req["Emailvendor"],
        //            NickName = req["NickName"],
        //            Host = req["SMTP"],
        //            Port = Convert.ToInt32(req["Port"]),
        //            EmailAddress = req["Email"],
        //            Password = req["Password"],
        //            EnableSsl = Convert.ToBoolean(req["IsSSL"]),
        //            IsDefault = false
        //        };
        //        //if (solutionConnections.EBSolutionConnections.EmailConnections == null || solutionConnections.EBSolutionConnections.EmailConnections.Capacity == 0)
        //        //    smtpcon.Preference = ConPreferences.PRIMARY;
        //        //if (String.IsNullOrEmpty(smtpcon.Password) && smtpcon.EmailAddress == solutionConnections.EBSolutionConnections.SMTPConnection.EmailAddress)
        //        //{
        //        //    smtpcon.Password = solutionConnections.EBSolutionConnections.SMTPConnection.Password;
        //        //    res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeSMTPConnectionRequest { email = smtpcon, IsNew = false, SolutionId = req["SolutionId"] });
        //        //}
        //        //else
        //        res = this.ServiceClient.Post<ChangeConnectionResponse>(new ChangeSMTPConnectionRequest { Email = smtpcon, IsNew = true, SolutionId = req["SolutionId"] });
        //        return JsonConvert.SerializeObject(smtpcon);
        //    }
        //    catch (Exception e)
        //    {
        //        res.ResponseStatus.Message = e.Message;
        //        return null;
        //    }
        //}

        [HttpPost]
        public bool DataDbTest()
        {
            var req = this.HttpContext.Request.Form;
            EbDbConfig dbcon = new EbDbConfig()
            {
                DatabaseVendor = Enum.Parse<DatabaseVendors>(req["databaseVendor"].ToString()),
                DatabaseName = req["databaseName"],
                Server = req["server"],
                Port = Convert.ToInt32(req["port"]),
                UserName = req["userName"],
                Password = req["password"],
                ReadWriteUserName = req["readWriteUserName"],
                ReadWritePassword = req["readWritePassword"],
                ReadOnlyUserName = req["readOnlyUserName"],
                ReadOnlyPassword = req["readOnlyPassword"],
                Timeout = Convert.ToInt32(req["timeout"]),
                IsSSL = (req["IsSSL"] == "on") ? true : false
            };
            TestConnectionResponse res = this.ServiceClient.Post<TestConnectionResponse>(new TestConnectionRequest { DataDBConfig = dbcon });
            return res.ConnectionStatus;
        }
        //[HttpPost]
        //public bool FilesDbTest()
        //{
        //    var req = this.HttpContext.Request.Form;
        //    EbFilesDbConnection dbcon = new EbFilesDbConnection()
        //    {
        //        FilesDbVendor = Enum.Parse<FilesDbVendors>(req["DatabaseVendor"].ToString()),
        //        FilesDB_url = req["ConnectionString"].ToString(),
        //        NickName = req["NickName"].ToString()
        //    };
        //    TestFileDbconnectionResponse resp = this.ServiceClient.Post<TestFileDbconnectionResponse>(new TestFileDbconnectionRequest { FilesDBConnection = dbcon });
        //    return resp.ConnectionStatus;
        //}
        //[HttpGet]
        //public IActionResult EditDataDB()
        //{
        //    GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.EbDATA });
        //    ViewBag.DataDB = solutionConnections.EBSolutionConnections.DataDbConnection;
        //    return View();
        //}

        //[HttpGet]
        //public IActionResult AddSMSAccount()
        //{
        //    return View();
        //}
        //[HttpPost]
        //public IActionResult AddSMTP(int i)
        //{
        //    var req = this.HttpContext.Request.Form;
        //    SMTPConnection smtpcon = new SMTPConnection();
        //    smtpcon.NickName = req["nickname"];
        //    smtpcon.Smtp = req["smtp"];
        //    smtpcon.Port = Int32.Parse(req["port"]);
        //    smtpcon.EmailAddress = req["email"];
        //    smtpcon.Password = req["pwd"];
        //    var r = this.ServiceClient.Post<bool>(new ChangeSMTPConnectionRequest { SMTPConnection = smtpcon, IsNew = true });
        //    Console.WriteLine(req.ToString());
        //    return Redirect("/ConnectionManager");
        //}

        //[HttpPost]
        //public IActionResult EditSMTP(int i)
        //{
        //    var req = this.HttpContext.Request.Form;
        //    SMTPConnection smtpcon = new SMTPConnection();
        //    smtpcon.NickName = req["nickname"];
        //    smtpcon.Smtp = req["smtp"];
        //    smtpcon.Port = Int32.Parse(req["port"]);
        //    smtpcon.EmailAddress = req["email"];
        //    smtpcon.Password = req["pwd"];
        //    var r = this.ServiceClient.Post<bool>(new ChangeSMTPConnectionRequest { SMTPConnection = smtpcon, IsNew = false });
        //    return Redirect("/ConnectionManager");
        //}

        //[HttpPost]
        //public IActionResult EditDataDB(int i)
        //{
        //    var req = this.HttpContext.Request.Form;
        //    EbDataDbConnection DataDB = new EbDataDbConnection();
        //    DataDB.DatabaseName = req["databasename"];
        //    DataDB.Server = req["server"];
        //    DataDB.Port = Int32.Parse(req["port"]);
        //    DataDB.UserName = req["username"];
        //    DataDB.Password = req["pwd"];
        //    DataDB.Timeout = Int32.Parse(req["timeout"]);
        //    var r = this.ServiceClient.Post<bool>(new ChangeDataDBConnectionRequest { DataDBConnection = DataDB, IsNew = false });
        //    return Redirect("/ConnectionManager");
        //}

        //[HttpPost]
        //public IActionResult AddDataDB(int i)
        //{
        //    var req = this.HttpContext.Request.Form;
        //    EbDataDbConnection DataDB = new EbDataDbConnection();
        //    DataDB.DatabaseName = req["databasename"];
        //    DataDB.Server = req["server"];
        //    DataDB.Port = Int32.Parse(req["port"]);
        //    DataDB.UserName = req["username"];
        //    DataDB.Password = req["pwd"];
        //    DataDB.Timeout = Int32.Parse(req["timeout"]);
        //    var r = this.ServiceClient.Post<bool>(new ChangeDataDBConnectionRequest { DataDBConnection = DataDB, IsNew = true });
        //    return Redirect("/ConnectionManager");
        //}

        //[HttpPost]
        //public IActionResult AddFilesDB(int i)
        //{
        //    var req = this.HttpContext.Request.Form;
        //    EbFilesDbConnection FilesDB = new EbFilesDbConnection();
        //    FilesDB.FilesDB_url = req["url"].ToString();
        //    var r = this.ServiceClient.Post<bool>(new ChangeFilesDBConnectionRequest { FilesDBConnection = FilesDB, IsNew = true });
        //    return Redirect("/ConnectionManager");
        //}

        //[HttpPost]
        //public IActionResult EditSMSAccount(int i)
        //{
        //    var req = this.HttpContext.Request.Form;
        //    SMSConnection smscon = new SMSConnection();
        //    smscon.ProviderName = req["provider"];
        //    smscon.NickName = req["nickname"];
        //    smscon.UserName = req["username"];
        //    smscon.From = req["from"];
        //    smscon.Password = req["pwd"];

        //    var r = this.ServiceClient.Post<bool>(new ChangeSMSConnectionRequest { SMSConnection = smscon, IsNew = false });
        //    return Redirect("/ConnectionManager");
        //}
        //[HttpGet]
        //public IActionResult EditSMTP()
        //{
        //    GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = (int)EbConnectionTypes.SMTP });
        //    ViewBag.SMTP = solutionConnections.EBSolutionConnections.SMTPConnection;
        //    return View();
        //}

        //[HttpGet]
        //public IActionResult AddSMTP()
        //{
        //    return View();
        //}

        //[HttpGet]
        //public IActionResult AddDataDB()
        //{
        //    return View();
        //}



        //-------------------------------------------------------------Integrations-----------------
        [HttpPost]
        public string AddDB()
        {
            var req = this.HttpContext.Request.Form;
            EbDbConfig con = new EbDbConfig();
            DatabaseVendors vendor = Enum.Parse<DatabaseVendors>(req["databaseVendor"].ToString());  
            if (vendor == DatabaseVendors.PGSQL)
            {
                con = new PostgresConfig()
                {
                    DatabaseName = req["databaseName"],
                    Server = req["server"],
                    Port = Convert.ToInt32(req["port"]),
                    UserName = req["userName"],
                    Password = req["password"],
                    ReadWriteUserName = req["readWriteUserName"],
                    ReadWritePassword = req["readWritePassword"],
                    ReadOnlyUserName = req["readOnlyUserName"],
                    ReadOnlyPassword = req["readOnlyPassword"],
                    Timeout = Convert.ToInt32(req["timeout"]),
                    IsSSL = (req["IsSSL"] == "on") ? true : false,
                    NickName = req["nickname"],
                    Id = Convert.ToInt32(req["Id"])
                };
            }
            if (vendor == DatabaseVendors.ORACLE)
            {
                con = new OracleConfig()
                {
                    //DatabaseName = req["databaseName"],
                    //Server = req["server"],
                    //Port = Convert.ToInt32(req["port"]),
                    //UserName = req["userName"],
                    //Password = req["password"],
                    //ReadWriteUserName = req["readWriteUserName"],
                    //ReadWritePassword = req["readWritePassword"],
                    //ReadOnlyUserName = req["readOnlyUserName"],
                    //ReadOnlyPassword = req["readOnlyPassword"],
                    //Timeout = Convert.ToInt32(req["timeout"]),
                    //IsSSL = (req["IsSSL"] == "on") ? true : false,
                    //NickName = req["nickname"]
                };
            }
            if (vendor == DatabaseVendors.MYSQL)
            {
                con = new MySqlConfig()
                {
                    DatabaseName = req["databaseName"],
                    Server = req["server"],
                    Port = Convert.ToInt32(req["port"]),
                    UserName = req["userName"],
                    Password = req["password"],
                    ReadWriteUserName = req["readWriteUserName"],
                    ReadWritePassword = req["readWritePassword"],
                    ReadOnlyUserName = req["readOnlyUserName"],
                    ReadOnlyPassword = req["readOnlyPassword"],
                    Timeout = Convert.ToInt32(req["timeout"]),
                    IsSSL = (req["IsSSL"] == "on") ? true : false,
                    NickName = req["nickname"],
                    Id = Convert.ToInt32(req["Id"])
                };
            }
            if (vendor == DatabaseVendors.MSSQL)
            {
                con = new MSSqlConfig()
                {
                    DatabaseName = req["databaseName"],
                    Server = req["server"],
                    Port = Convert.ToInt32(req["port"]),
                    UserName = req["userName"],
                    Password = req["password"],
                    ReadWriteUserName = req["readWriteUserName"],
                    ReadWritePassword = req["readWritePassword"],
                    ReadOnlyUserName = req["readOnlyUserName"],
                    ReadOnlyPassword = req["readOnlyPassword"],
                    Timeout = Convert.ToInt32(req["timeout"]),
                    IsSSL = (req["IsSSL"] == "on") ? true : false,
                    NickName = req["nickname"],
                    Id = Convert.ToInt32(req["Id"])
                };
            }
            try
            {
                AddDBResponse response = this.ServiceClient.Post<AddDBResponse>(new AddDBRequest
                {
                    DbConfig = con,
                    // IsNew = false,
                    SolnId = req["SolutionId"]
                });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch(Exception e)
            {
                Console.WriteLine("AddAB Controller :" + e + e.StackTrace);
            }
            return null;           
        }
        [HttpPost]
        public string AddTwilio()
        {
            AddTwilioResponse res = new AddTwilioResponse();
            try
            {
                var req = this.HttpContext.Request.Form;
                EbTwilioConfig twilioCon = new EbTwilioConfig
                {
                    UserName = req["UserName"],
                    From = req["From"],
                    Password = req["Password"],
                    NickName = req["nickname"],
                    Id = Convert.ToInt32(req["Id"])
                };
                res = this.ServiceClient.Post<AddTwilioResponse>(new AddTwilioRequest { Config = twilioCon, /*IsNew = true,*/ SolnId = req["SolutionId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }
        public string AddUnifonic()
        {
            AddUnifonicResponse res = new AddUnifonicResponse();
            try
            {
                var req = this.HttpContext.Request.Form;
                EbUnifonicConfig UnifonicConf = new EbUnifonicConfig
                {
                    UserName = req["UserName"],
                    From = req["From"],
                    Password = req["Password"],
                    NickName = req["nickname"],
                    Id = Convert.ToInt32(req["Id"])
                };
                res = this.ServiceClient.Post<AddUnifonicResponse>(new AddUnifonicRequest { Config = UnifonicConf, /*IsNew = true,*/ SolnId = req["SolutionId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }
        public string AddExpertTexting()
        {
            AddETResponse res = new AddETResponse();
            try
            {
                var req = this.HttpContext.Request.Form;
                
                EbExpertTextingConfig con = new EbExpertTextingConfig
                {
                    UserName = req["UserName"],
                    From = req["From"],
                    Password = req["Password"],
                    ApiKey = req["ApiKey"],
                    Id = Convert.ToInt32(req["Id"]),
                    NickName = req["nickname"]
                };
                res = this.ServiceClient.Post<AddETResponse>(new AddETRequest { Config = con,/* IsNew = true,*/  SolnId = req["SolutionId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }

        public string AddTextLocal()
        {
            AddTLResponse res = new AddTLResponse();
            try
            {
                var req = this.HttpContext.Request.Form;

                EbTextLocalConfig con = new EbTextLocalConfig
                {                  
                    From = req["From"],                  
                    ApiKey = req["ApiKey"],
                    Id = Convert.ToInt32(req["Id"]),
                    NickName = req["nickname"]
                };
                res = this.ServiceClient.Post<AddTLResponse>(new AddTLRequest { Config = con,/* IsNew = true,*/  SolnId = req["SolutionId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }

        public string AddMongo()
        {
            AddMongoResponse res = new AddMongoResponse();
            var req = this.HttpContext.Request.Form;
            try
            {
               EbMongoConfig con = new EbMongoConfig
                {
                    UserName = req["UserName"],
                    Password = req["Password"],
                    Host = req["server"],
                    Port = Convert.ToInt32(req["port"]),
                    Id = Convert.ToInt32(req["Id"]),
                    NickName = req["nickname"]
                };
                res = this.ServiceClient.Post<AddMongoResponse>(new AddMongoRequest { Config = con/*, IsNew = true*/, SolnId = req["SolutionId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }
        public string AddSMTP()
        {
            AddSmtpResponse res = new AddSmtpResponse();
            var req = this.HttpContext.Request.Form;
            try
            {
                EbSmtpConfig con = new EbSmtpConfig
                {
                    ProviderName = (SmtpProviders)Convert.ToInt32(req["Emailvendor"]),
                    NickName = req["NickName"],
                    Host = req["SMTP"],
                    Port = Convert.ToInt32(req["Port"]),
                    EmailAddress = req["Email"],
                    Password = req["Password"],
                    EnableSsl = Convert.ToBoolean(req["IsSSL"]),
                    Id = Convert.ToInt32(req["Id"])
                };

                res = this.ServiceClient.Post<AddSmtpResponse>(new AddSmtpRequest { Config = con, /*IsNew = true,*/ SolnId = req["SolnId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolnId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }
        public string AddCloudinary()
        {
            AddCloudinaryResponse res = new AddCloudinaryResponse();
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                EbCloudinaryConfig con = new EbCloudinaryConfig
                {
                    Cloud = req["Cloud"],
                    ApiKey = req["ApiKey"],
                    ApiSecret = req["ApiSecret"],
                    NickName = req["NickName"],
                    Id = Convert.ToInt32(req["Id"])
                };

                res = this.ServiceClient.Post<AddCloudinaryResponse>(new AddCloudinaryRequest { Config = con/*, IsNew = true*/ , SolnId = req["SolutionId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }
        public string AddGoogleMap()
        {
            AddGoogleMapResponse res = new AddGoogleMapResponse();
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                EbGoogleMapConfig con = new EbGoogleMapConfig
                {
                    ApiKey = req["ApiKey"],
                    NickName = req["NickName"],
                    Id = Convert.ToInt32(req["Id"]),
                    MapType = MapType.COMMON,
                    Vendor = MapVendors.GOOGLEMAP
                };
                res = this.ServiceClient.Post<AddGoogleMapResponse>(new AddGoogleMapRequest { Config = con, SolnId = req["SolutionId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }
        public string AddDropBox()
        {
            AddDropBoxResponse res = new AddDropBoxResponse();
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                EbDropBoxConfig con = new EbDropBoxConfig
                {
                    AccessToken = req["AccessToken"],
                    NickName = req["NickName"],
                    Id = Convert.ToInt32(req["Id"]),
                    Type = EbIntegrations.DropBox
                };
                res = this.ServiceClient.Post<AddDropBoxResponse>(new AddDropBoxRequest { Config = con, SolnId = req["SolutionId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }
        public string AddAWSS3()
        {
            AddAWSS3Response res = new AddAWSS3Response();
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                //RegionEndpoint rt = RegionEndpoint.EnumerableAllRegions.FirstOrDefault(e => e.SystemName == req["bucketRegion"].ToString());
                //RegionEndpoint r = RegionEndpoint.GetBySystemName(req["bucketRegion"].ToString());
                //RegionEndpoint bucketRegion = RegionEndpoint.APSouth1;
                //string rt = r.DisplayName;
                //r = ParseRegion(rt);
                //RegionEndpoint r = RegionEndpoint.r
                EbAWSS3Config con = new EbAWSS3Config
                {
                    BucketName = req["BucketName"],
                    AccessKeyID = req["AccessKeyID"],
                    SecretAccessKey = req["SecretAccessKey"],
                    BucketRegion = req["bucketRegion"].ToString(),
                    NickName = req["NickName"],
                    Id = Convert.ToInt32(req["Id"]),
                    Type = EbIntegrations.AWSS3
                };
                res = this.ServiceClient.Post<AddAWSS3Response>(new AddAWSS3Request { Config = con, SolnId = req["SolutionId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }
        public string AddSendGrid()
        {
            AddSendGridResponse res = new AddSendGridResponse();
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                EbSendGridConfig con = new EbSendGridConfig
                {
                    ApiKey = req["ApiKey"],
                    NickName = req["NickName"],
                    Id = Convert.ToInt32(req["Id"]),
                    Type = EbIntegrations.SendGrid,
                    EmailAddress = req["EmailAddress"],
                    Name = req["Name"]
                };
                res = this.ServiceClient.Post<AddSendGridResponse>(new AddSendGridRequest { Config = con, SolnId = req["SolutionId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }
        public string AddSlack()
        {
            AddSlackResponse res = new AddSlackResponse();
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                EbSlackConfig con = new EbSlackConfig
                {
                    NickName = req["NickName"],
                    Id = Convert.ToInt32(req["Id"]),
                    OAuthAccessToken = req["OAuthAccessToken"],
                    Channel = req["Channel"],
                    Type = EbIntegrations.Slack
                };
                res = this.ServiceClient.Post < AddSlackResponse>(new AddSlackRequest { Config = con, SolnId = req["SolutionId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }
        public string AddFacebook()
        {
            AddfacebookResponse res = new AddfacebookResponse();
            IFormCollection req = this.HttpContext.Request.Form;
            try
            {
                EbfacebbokConfig con = new EbfacebbokConfig
                {
                    NickName = req["NickName"],
                    Id = Convert.ToInt32(req["Id"]),
                    AppId = req["AppId"],
                    AppVersion = req["AppVersion"],
                    Type = EbIntegrations.Facebook
                };
                res = this.ServiceClient.Post < AddfacebookResponse>(new AddfacebookRequest { Config = con, SolnId = req["SolutionId"] });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return null;
            }
        }
        public string AddGoogleDriveAsync()
        {
            string RedirectUri ="";
            AddGoogleDriveResponse res = new AddGoogleDriveResponse();

            IFormCollection req = this.HttpContext.Request.Form;
            EbGoogleDriveConfig con = new EbGoogleDriveConfig {
                ClientID = req["ClientID"],
                Clientsecret = req["Clientsecret"],
                ApplicationName = req["ApplicationName"],
                Id = Convert.ToInt32(req["Id"]),
                NickName = req["NickName"],
                Type = EbIntegrations.GoogleDrive
            };
            try
            {
                var init = new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = new ClientSecrets
                    {
                        ClientId = con.ClientID,
                        ClientSecret = con.Clientsecret
                    },
                    Scopes = new string[] { "https://www.googleapis.com/auth/drive" }
                };
                AuthorizationCodeFlow flow = new AuthorizationCodeFlow(init);
                Console.WriteLine("Fetching token for code: _" + req["code"] + "_");

                if (ViewBag.Env == "Staging")
                    RedirectUri = "https://myaccount.eb-test.xyz";
                else if (ViewBag.Env == "Production")
                    RedirectUri = "https://myaccount.expressbase.com";
                Console.WriteLine(RedirectUri);
                TokenResponse result = AsyncHelper.RunSync(() => GetGoogleDriveKey(flow, req["code"], RedirectUri));
                Console.WriteLine(JsonConvert.SerializeObject(result));
                con.RefreshToken = result.RefreshToken;
                res = this.ServiceClient.Post<AddGoogleDriveResponse>(new AddGoogleDriveRequest { Config = con, SolnId = req["SolutionId"] });
                Console.WriteLine("After inserstion GD : ");
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = req["SolutionId"] });
                Console.WriteLine("After Solution info : " + JsonConvert.SerializeObject(resp));
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus = new ResponseStatus { Message = e.Message };
                return JsonConvert.SerializeObject(res);
            }
        }
        public  async Task<TokenResponse> GetGoogleDriveKey(AuthorizationCodeFlow flow, string code, string RedirectUri)
        {
            TokenResponse result = await flow.ExchangeCodeForTokenAsync("user", code, RedirectUri, CancellationToken.None);
            return result;
        }

        //[HttpGet("SolutionManager/{Sid}")]
        //public IActionResult GetIntegrationConfigs(string Sid)
        //{
        //    GetSolutioInfoResponse Solresp = this.ServiceClient.Get<GetSolutioInfoResponse>(new GetSolutioInfoRequest { IsolutionId = Sid });
        //    ViewBag.Connections = Solresp.EBSolutionConnections;
        //    ViewBag.SolutionInfo = Solresp.Data;

        //    GetIntegrationConfigsResponse res = this.ServiceClient.Get<GetIntegrationConfigsResponse>(new GetIntegrationConfigsRequest { });

        //    //ViewBag.cid = Sid;
        //    //ViewBag.Domain = this.HttpContext.Request.Host;
        //    //ViewBag.rToken = Request.Cookies["rToken"];
        //    //ViewBag.bToken = Request.Cookies["bToken"];
        //    return View();
        //}

        //[HttpGet("SolutionManager/{Sid}")]
        //public IActionResult SolutionManager(string Sid)
        //{
        //    // GetSolutioInfoResponse resp = this.ServiceClient.Get<GetSolutioInfoResponse>(new GetSolutioInfoRequest { IsolutionId = Sid });
        //    GetIntegrationConfigsResponse Solresp = this.ServiceClient.Get<GetIntegrationConfigsResponse>(new GetSolutionIntegrationRequest { IsolutionId = Sid });
        //    ViewBag.Connections = Solresp.EBSolutionConnections;
        //    ViewBag.SolutionInfo = Solresp.Data;
        //    ViewBag.cid = Sid;
        //    ViewBag.Domain = this.HttpContext.Request.Host;
        //    ViewBag.rToken = Request.Cookies["rToken"];
        //    ViewBag.bToken = Request.Cookies["bToken"];
        //    return View();
        //}

        public string credientialBot(int Cid, string sid)
        {

            CredientialBotResponse response = new CredientialBotResponse();
            try
            {
                response = this.ServiceClient.Get<CredientialBotResponse>(new CredientialBotRequest { ConfId = Cid, SolnId = sid });
            }
            catch (Exception e)
            {
                response.ResponseStatus = new ResponseStatus { Message = e.Message };
                return JsonConvert.SerializeObject(response);
            }
            return JsonConvert.SerializeObject(response);
        }

        public string Integrate(string preferancetype, bool deploy, string sid, bool drop)
        {
            EbIntegrationResponse res = new EbIntegrationResponse();
            var req = JsonConvert.DeserializeObject<EbIntegration>(preferancetype);
            try
            {
                //EbIntegration _obj = new EbIntegration
                //{
                //    Id = Convert.ToInt32(req["Id"]),
                //    ConfigId = Convert.ToInt32(req["ConfId"]),
                //    Preference = Enum.Parse<ConPreferences>(req["Preference"].ToString()),
                //    Type = Enum.Parse<EbConnectionTypes>(req["Type"].ToString())
                //};
                res = this.ServiceClient.Post<EbIntegrationResponse>(new EbIntegrationRequest { IntegrationO = req, Deploy = deploy, SolnId = sid, Drop = drop });
                if (res.ResponseStatus != null && res.ResponseStatus.Message == ErrorTexConstants.DB_ALREADY_EXISTS)
                {
                    return JsonConvert.SerializeObject(res);
                }
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = sid });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus = new ResponseStatus { Message = e.Message };
                return JsonConvert.SerializeObject(res);
            }
        }

        public string IntegrateConfDelete(int Id, string sid)
        {
            EbIntegrationConfDeleteResponse res = new EbIntegrationConfDeleteResponse();
            var req = this.HttpContext.Request.Form;
            try
            {
                EbIntegrationConf _obj = new EbIntegrationConf
                {
                    Id = Convert.ToInt32(req["Id[Id]"])
                };
                res = this.ServiceClient.Post<EbIntegrationConfDeleteResponse>(new EbIntergationConfDeleteRequest { IntegrationConfdelete = _obj, SolnId = sid });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = sid });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return JsonConvert.SerializeObject(res);
            }
        }

        public string IntegrateDelete(int Id, string sid)
        {
            EbIntegrationDeleteResponse res = new EbIntegrationDeleteResponse();
            var req = this.HttpContext.Request.Form;
            try
            {
                EbIntegration _obj = new EbIntegration
                {
                    Id = Convert.ToInt32(req["Id[Id]"])
                };
                res = this.ServiceClient.Post<EbIntegrationDeleteResponse>(new EbIntergationDeleteRequest { Integrationdelete = _obj, SolnId = sid });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = sid });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return JsonConvert.SerializeObject(res);
            }
        }

        public string IntegrationSwitch(string preferancetype, string sid)
        {
            var req = JsonConvert.DeserializeObject<List<EbIntegration>>(preferancetype);
            var SolnId = ViewBag.cid;
            EbIntegrationSwitchResponse res = new EbIntegrationSwitchResponse();

            try
            {
                res = this.ServiceClient.Post<EbIntegrationSwitchResponse>(new EbIntergationSwitchRequest { Integrations = req, SolnId = sid });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = sid });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return JsonConvert.SerializeObject(res);
            }
        }

        public string PrimaryDelete(string preferancetype, string sid, string deleteId)
        {

            var SolnId = ViewBag.cid;
            EbIntegrationResponse res = new EbIntegrationResponse();

            try
            {
                if (preferancetype == string.Empty)
                {
                    var req = JsonConvert.DeserializeObject<EbIntegration>(preferancetype);
                    res = this.ServiceClient.Post<EbIntegrationResponse>(new EbIntegrationRequest { IntegrationO = req, SolnId = sid });
                }
                EbIntegration _obj = new EbIntegration
                {
                    Id = Convert.ToInt32(deleteId)
                };
                res = this.ServiceClient.Post<EbIntegrationResponse>(new EbIntergationDeleteRequest { Integrationdelete = _obj, SolnId = sid });
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = sid });
                return JsonConvert.SerializeObject(resp);
            }
            catch (Exception e)
            {
                res.ResponseStatus.Message = e.Message;
                return JsonConvert.SerializeObject(res);
            }
        }

        //public void ConnectionsHelper()
        //{
        //    _GetConectionsResponse res = ServiceClient.Get<_GetConectionsResponse>(new _GetConectionsRequest { });
        //}
    }
}

