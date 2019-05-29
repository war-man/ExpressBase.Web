﻿using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Security;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Common.ServiceStack.Auth;
using ExpressBase.Web.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.BaseControllers
{
    public class EbBaseIntApiController : EbBaseIntController
    {
        public EbBaseIntApiController(IServiceClient _ssclient) : base(_ssclient) { }

        public EbBaseIntApiController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        public EbBaseIntApiController(IServiceClient _ssclient, IEbStaticFileClient _sfc) : base(_ssclient, _sfc) { }

        public EbBaseIntApiController(IServiceClient _ssclient, IRedisClient _redis, IEbStaticFileClient _sfc) : base(_ssclient, _redis, _sfc) { }

        public string SultionId { set; get; }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            string host = context.HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty);
            string[] hostParts = host.Split(CharConstants.DOT);

            string sBToken = context.HttpContext.Request.Headers[RoutingConstants.BEARER_TOKEN];
            string sRToken = context.HttpContext.Request.Headers[RoutingConstants.REFRESH_TOKEN];
            this.SultionId = hostParts[0].Replace(RoutingConstants.DASHDEV, string.Empty); ;
            var controller = context.Controller as Controller;

            if (this.Redis.Exists(string.Format(CoreConstants.SOLUTION_INTEGRATION_REDIS_KEY, this.SultionId)) == 0)
            {
                controller.ViewBag.IsValidSol = false;
            }
            else
            {
                controller.ViewBag.IsValidSol = true;
            }

            if (string.IsNullOrEmpty(sBToken) || string.IsNullOrEmpty(sRToken))
            {
                controller.ViewBag.IsValid = false;
                controller.ViewBag.Message = "Authentication token not present in request header";
            }
            else if (!IsTokensValid(sRToken, sBToken, hostParts[0]))
            {
                controller.ViewBag.IsValid = false;
                controller.ViewBag.Message = "Authentication failed";
            }
            else
            {
                try
                {
                    controller.ViewBag.IsValid = true;
                    controller.ViewBag.Message = "Authenticated";

                    var bToken = new JwtSecurityToken(sBToken);
                    Session = new CustomUserSession();
                    Session.Id = context.HttpContext.Request.Cookies[CacheConstants.X_SS_PID];

                    this.ServiceClient.BearerToken = sBToken;
                    this.ServiceClient.RefreshToken = sRToken;
                    this.ServiceClient.Headers.Add(CacheConstants.RTOKEN, sRToken);

                    if (this.FileClient != null)
                    {
                        this.FileClient.BearerToken = sBToken;
                        this.FileClient.RefreshToken = sRToken;
                        this.FileClient.Headers.Add(CacheConstants.RTOKEN, sRToken);
                    }
                }
                catch(System.ArgumentNullException ane)
                {
                    if (ane.ParamName == RoutingConstants.BEARER_TOKEN || ane.ParamName == RoutingConstants.REFRESH_TOKEN)
                    {
                        context.Result = new RedirectResult("/");
                        return;
                    }
                }
            }
            base.OnActionExecuting(context);
        }
    }
}
