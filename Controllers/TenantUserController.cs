﻿using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Objects;
using ExpressBase.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security.Core;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Web.Controllers;
using ExpressBase.Web.Filters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace ExpressBase.Web2.Controllers
{
    public class TenantUserController : EbBaseIntCommonController
    {
        public TenantUserController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        [EbBreadCrumbFilter()]
        [HttpGet("UserDashBoard")]
        public IActionResult UserDashboard()
        {
            Type[] typeArray = typeof(EbDashBoardWraper).GetTypeInfo().Assembly.GetTypes();
            Context2Js _jsResult = new Context2Js(typeArray, BuilderType.DashBoard, typeof(EbDashBoardWraper), typeof(EbObject));
            try
            {
                Console.WriteLine("############################ ======------Google Key : " + Environment.GetEnvironmentVariable(EnvironmentConstants.AL_GOOGLE_MAP_KEY));
                ViewBag.al_arz_map_key = Environment.GetEnvironmentVariable(EnvironmentConstants.AL_GOOGLE_MAP_KEY);
            }
            catch (Exception e)
            {
                Console.WriteLine("key not found" + e.Message + e.StackTrace);
            }

            ViewBag.Meta = _jsResult.AllMetas;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectTypes = _jsResult.EbObjectTypes;

            GetUserDashBoardObjectsResponse Resp = this.ServiceClient.Post(new GetUserDashBoardObjectsRequest
            {
                ObjectIds = this.LoggedInUser.GetDashBoardIds(),
                SolutionOwner = (this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()) || this.LoggedInUser.Roles.Contains(SystemRoles.SolutionAdmin.ToString())) ? true : false
            });

            if (Resp.DashBoardObjectIds.Count != 0)
            {
                ViewBag.ObjType = 22;
                ViewBag.ControlOperations = EbControlContainer.GetControlOpsJS((new EbUserControl()) as EbControlContainer, BuilderType.UserControl);
                ViewBag.AllDashBoard = JsonConvert.SerializeObject(Resp.DashBoardObjectIds, new JsonSerializerSettings
                {
                    TypeNameHandling = TypeNameHandling.All
                });

                if (this.LoggedInUser.Preference.DefaultDashBoard != null)
                {
                    ViewBag.GetObjectId = Resp.DashBoardObjectIds[this.LoggedInUser.Preference.DefaultDashBoard];
                    ViewBag.VersionNumber = ViewBag.GetObjectId.VersionNumber;
                    ViewBag.dsObj = EbSerializers.Json_Serialize(ViewBag.GetObjectId);
                    ViewBag.Status = ViewBag.GetObjectId.Status;
                }
                else
                {
                    ViewBag.GetObjectId = Resp.DashBoardObjectIds.ElementAt(0);
                    ViewBag.VersionNumber = ViewBag.GetObjectId.Value.VersionNumber;
                    ViewBag.dsObj = EbSerializers.Json_Serialize(ViewBag.GetObjectId.Value);
                    ViewBag.Status = ViewBag.GetObjectId.Value.Status;
                    //ViewBag.DashBoardObjects = Resp.DashBoardObjectIds;
                }
            }
            return View();
        }

        [HttpGet]
        public IActionResult getSidebarMenu(int LocId)
        {
            return ViewComponent("EbQuickMenu", new { solnid = ViewBag.cid, email = ViewBag.email, console = ViewBag.wc, locid = LocId });
        }

        [HttpPost]
        public bool AddFavourite(int objid)
        {
            return this.ServiceClient.Post<AddFavouriteResponse>(new AddFavouriteRequest { ObjId = objid }).Status;
        }

        [HttpPost]
        public bool RemoveFavourite(int objid)
        {
            return this.ServiceClient.Post<RemoveFavouriteResponse>(new RemoveFavouriteRequest { ObjId = objid }).Status;
        }

        public IActionResult Logout()
        {
            ViewBag.Fname = null;
            var abc = this.ServiceClient.Post(new Authenticate
            {
                provider = "logout",
                Meta = new Dictionary<string, string> {
                    { TokenConstants.CID, ViewBag.cid }
                }
            });
            HttpContext.Response.Cookies.Delete(RoutingConstants.BEARER_TOKEN);
            HttpContext.Response.Cookies.Delete(RoutingConstants.REFRESH_TOKEN);
            HttpContext.Response.Cookies.Delete(TokenConstants.USERAUTHID);
            return Redirect("/");
        }

        [HttpPost]
        public int CreateConfig(EbLocationCustomField conf)
        {
            var resp = ServiceClient.Post<CreateLocationConfigResponse>(new CreateLocationConfigRequest { Conf = conf });
            return resp.Id;
        }

        [EbBreadCrumbFilter("Locations")]
        [HttpGet]
        public IActionResult EbLocations(int id)
        {
            var resp = this.ServiceClient.Get<LocationInfoResponse>(new LocationInfoRequest { });
            ViewBag.Config = JsonConvert.SerializeObject(resp.Config);
            ViewBag.LocList = resp.Locations;
            return View();
        }

        [HttpPost]
        public int CreateLocation(string locid, string lname, string sname, string img, string meta)
        {
            if (img == null)
                img = "../img";
            var resp = ServiceClient.Post<SaveLocationMetaResponse>(new SaveLocationMetaRequest { Locid = Convert.ToInt32(locid), Longname = lname, Shortname = sname, Img = img, ConfMeta = meta });
            return resp.Id;
        }

        public int DeletelocConf(int id)
        {
            var resp = ServiceClient.Post<DeleteLocResponse>(new DeleteLocRequest { Id = id });
            return resp.id;
        }
    }
}

