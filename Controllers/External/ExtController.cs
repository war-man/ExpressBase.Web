﻿using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Extensions;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Common.Structures;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Web.Models;
using ExpressBase.Web2.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Auth;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using RouteAttribute = Microsoft.AspNetCore.Mvc.RouteAttribute;
using ExpressBase.Security;

namespace ExpressBase.Web.Controllers
{
    [EnableCors("AllowSpecificOrigin")]
    public class ExtController : EbBaseExtController
    {
        public const string RequestEmail = "reqEmail";
        //public const string Email = "email";
        public ExtController(IServiceClient _client, IRedisClient _redis, IHttpContextAccessor _cxtacc, IEbMqClient _mqc, IEbAuthClient _auth) : base(_client, _redis, _cxtacc, _mqc, _auth) { }

        //[HttpPost]
        //[EnableCors("AllowSpecificOrigin")]
        //public bool JoinBeta()
        //{
        //    string Email = this.HttpContext.Request.Form["Email"];
        //    JoinbetaResponse f = this.ServiceClient.Post<JoinbetaResponse>(new JoinbetaReq { Email = Email });
        //    return f.Status;
        //}

        [HttpGet]
        public IActionResult QuestionNaire(int id)
        {
            ViewBag.Sid = id;
            return View();
        }

        public IActionResult chatmessagetest()
        {
            return View();
        }


        public IActionResult EmailVerifyStructure()
        {
            return View();
        }

        public IActionResult MailAlreadyVerified()
        {
            return View();
        }

        [HttpGet("Platform/OnBoarding")]
        public IActionResult SignUp()
        {
            //ViewBag.FacebookSigninAppid = 149537802493867;
            ViewBag.FacebookSigninAppid = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_FB_APP_ID);
            ViewBag.GoogleSigninAppid = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_GOOGLE_CLIENT_ID);
            return View();
        }

        //profile setup tenant
        [HttpPost]
        public async Task<CreateAccountResponse> BoardAsync(string email, string name, string country, string password, string token)
        {
            var grecap = false;
            CreateAccountResponse res = new CreateAccountResponse();
            Recaptcha cap = null;
            try
            {
                cap = await RecaptchaResponse(Environment.GetEnvironmentVariable(EnvironmentConstants.EB_RECAPTCHA_SECRET), token);
                grecap = cap.Success;
            }
            catch (Exception e)
            {
                Console.WriteLine("RECAPTCHA EXCEPTION");
                Console.WriteLine(e.Message);
                TempData["ErrorMessage"] = "Recaptcha error, try again";
            }
            if (grecap == true)
            {
                try
                {
                    UniqueRequestResponse result = this.ServiceClient.Post<UniqueRequestResponse>(new UniqueRequest { email = email });
                    if (result.Unique)
                    {
                        res.IsEmailUniq = true;
                        string activationcode = Guid.NewGuid().ToString();
                        var pgurl = this.HttpContext.Request.Host;
                        var pgpath = this.HttpContext.Request.Path;

                        res = this.ServiceClient.Post<CreateAccountResponse>(new CreateAccountRequest
                        {
                            Name = name,
                            Password = password,
                            Country = country,
                            Email = email,
                            Account_type = null,
                            ActivationCode = activationcode,
                            PageUrl = pgurl.ToString(),
                            PagePath = pgpath.ToString()
                        });

                        if (res.Id > 0)
                        {

                            MyAuthenticateResponse authResponse = this.ServiceClient.Get<MyAuthenticateResponse>(new Authenticate
                            {
                                provider = CredentialsAuthProvider.Name,
                                UserName = email,
                                Password = (password + email).ToMD5Hash(),
                                Meta = new Dictionary<string, string> { { RoutingConstants.WC, RoutingConstants.TC }, { TokenConstants.CID, CoreConstants.EXPRESSBASE } },
                                //UseTokenCookie = true
                            });
                            if (authResponse != null)
                            {
                                CookieOptions options = new CookieOptions();
                                Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, authResponse.BearerToken, options);
                                Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, authResponse.RefreshToken, options);
                                this.ServiceClient.BearerToken = authResponse.BearerToken;
                                this.ServiceClient.RefreshToken = authResponse.RefreshToken;
                            }
                        }
                    }
                    else
                    {
                        res.IsEmailUniq = false;
                    }

                }
                catch (Exception e)
                {
                    Console.WriteLine("Exception: " + e.Message + e.StackTrace);
                }

            }
            return res;
        }


        public int EmailCheck(string email)
        {
            try
            {
                UniqueRequestResponse result = this.ServiceClient.Post<UniqueRequestResponse>(new UniqueRequest { email = email });
                if (result.Unique)
                {
                    return 1;
                }
                else
                {
                    return 0;
                }


            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message + e.StackTrace);
            }
            return 0;
        }

        [HttpGet("ForgotPassword")]
        public IActionResult ForgotPassword()
        {
            ViewBag.message = TempData["Message"];
            return View();
        }

        [HttpPost]
        public async Task<int> ForgotPasswordAsync(string email, string token)
        {

            var grecap = false;
            Recaptcha cap = null;
            try
            {
                cap = await RecaptchaResponse(Environment.GetEnvironmentVariable(EnvironmentConstants.EB_RECAPTCHA_SECRET), token);
                grecap = cap.Success;
            }
            catch (Exception e)
            {
                Console.WriteLine("RECAPTCHA EXCEPTION");
                Console.WriteLine(e.Message);
                TempData["ErrorMessage"] = "Recaptcha error, try again";
            }
            if (grecap == true)
            {
                try
                {
                    UniqueRequestResponse result = this.ServiceClient.Post<UniqueRequestResponse>(new UniqueRequest { email = email });
                    if (result.Unique || !result.HasPassword)
                    {
                        return 0;
                    }
                    else
                    {
                        string resetcode = Guid.NewGuid().ToString();
                        HostString pgurl = this.HttpContext.Request.Host;
                        PathString pgpath = this.HttpContext.Request.Path;
                        ForgotPasswordResponse res = this.ServiceClient.Post<ForgotPasswordResponse>(new ForgotPasswordRequest
                        {
                            Email = email,
                            Resetcode = resetcode,
                            PagePath = pgpath.ToString(),
                            PageUrl = pgurl.ToString()
                        });
                        if (res.VerifyStatus == true)
                        {
                            return 1;
                        }
                        else
                        {
                            return 2;
                        }

                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e.Message + e.StackTrace);
                    return 0;
                }
            }
            return 2;
        }

        [HttpGet("resetpassword")]
        public IActionResult ResetPassword(string rep)
        {
            ViewBag.rep = rep;
            return View();
        }

        [HttpPost]
        public async Task<int> ResetPasswordAsync(string emcde, string tkn, string psw, string token)
        {
            bool grecap = false;
            int stts = 0;

            Recaptcha cap = null;
            try
            {
                cap = await RecaptchaResponse(Environment.GetEnvironmentVariable(EnvironmentConstants.EB_RECAPTCHA_SECRET), token);
                grecap = cap.Success;
            }
            catch (Exception e)
            {
                Console.WriteLine("RECAPTCHA EXCEPTION");
                Console.WriteLine(e.Message);
                TempData["ErrorMessage"] = "Recaptcha error, try again";
            }
            try
            {
                if (grecap == true)
                {
                    byte[] base64Encoded = System.Convert.FromBase64String(emcde);
                    string resetcd = System.Text.Encoding.UTF8.GetString(base64Encoded);
                    string[] resetcode = resetcd.Split(new Char[] { '$' }, StringSplitOptions.RemoveEmptyEntries);

                    var sts = this.ServiceClient.Post<ResetPasswordResponse>(new ResetPasswordRequest
                    {
                        Resetcode = resetcode[1],
                        Email = resetcode[0],
                        Password = psw
                    });
                    if (sts.VerifyStatus == true)
                    { stts = 1; }
                    else
                    {
                        stts = 0;
                    }
                }
                return stts;

            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message + e.StackTrace);
                return 0;
            }
        }

        private bool isAvailSolution()
        {
            bool IsAvail = false;
            if (ViewBag.SolutionId != String.Empty && ViewBag.SolutionId != null)
            {
                IsAvail = isAvailInRedis();
                //if (!IsAvail)
                //{
                //    RefreshSolutionExtResponse res = this.MqClient.Post<RefreshSolutionExtResponse>(new RefreshSolutionExtRequest { SolnId = ViewBag.SolutionId });
                //    IsAvail = isAvailInRedis();
                //}
            }
            return IsAvail;
        }

        public bool isAvailInRedis()
        {
            bool IsAvail = false;
            IEnumerable<string> resp = this.Redis.GetKeysByPattern(string.Format(CoreConstants.SOLUTION_INTEGRATION_REDIS_KEY, ViewBag.SolutionId));
            if (resp.Any() || (ViewBag.SolutionId == CoreConstants.ADMIN))
                IsAvail = true;
            return IsAvail;
        }

        public IActionResult UsrSignIn()
        {
            var host = base.HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty);
            string[] hostParts = host.Split(CharConstants.DOT);
            if (isAvailSolution())
            {
                string sBToken = base.HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN];
                string sRToken = base.HttpContext.Request.Cookies[RoutingConstants.REFRESH_TOKEN];
                bool IsInternal = false;
                if (!String.IsNullOrEmpty(sBToken) || !String.IsNullOrEmpty(sRToken))
                {
                    if (IsTokensValid(sRToken, sBToken, hostParts[0]))
                    {
                        IsInternal = true;
                        if (hostParts[0].EndsWith(RoutingConstants.DASHDEV))
                            return Redirect(RoutingConstants.MYAPPLICATIONS);
                        else
                            return RedirectToAction("UserDashboard", "TenantUser");
                    }
                }
                if (!IsInternal)
                {
                    ViewBag.HasSignupForm = false;
                    if (!hostParts[0].EndsWith(RoutingConstants.DASHDEV))
                    {
                        Eb_Solution solutionObj = GetSolutionObject(ViewBag.SolutionId);
                        if (solutionObj.SolutionSettings != null && solutionObj.SolutionSettings.SignupFormRefid != string.Empty)
                        {
                            ViewBag.HasSignupForm = true;
                        }
                        ViewBag.Is2fA = solutionObj.Is2faEnabled;
                    }
                }
                ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
                ViewBag.ErrorMsg = TempData["ErrorMessage"];
                ViewBag.Email = TempData["Email"];
                return View();
            }
            else
                return Redirect("/StatusCode/404");
        }

        [HttpGet]
        public IActionResult TenantSignIn(string continue_with)
        {
            ViewBag.FacebookSigninAppid = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_FB_APP_ID);
            ViewBag.GoogleSigninAppid = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_GOOGLE_CLIENT_ID);
            var host = base.HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty);
            string[] hostParts = host.Split(CharConstants.DOT);

            string sBToken = base.HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN];
            string sRToken = base.HttpContext.Request.Cookies[RoutingConstants.REFRESH_TOKEN];

            if (!String.IsNullOrEmpty(sBToken) || !String.IsNullOrEmpty(sRToken))
            {
                if (IsTokensValid(sRToken, sBToken, hostParts[0]))
                    return Redirect(RoutingConstants.MYSOLUTIONS);
            }
            ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
            ViewBag.ErrorMsg = TempData["ErrorMessage"];
            ViewBag.Email = TempData["Email"];
            ViewBag.ContinueWith = continue_with;
            return View();
        }

        public IActionResult FacebookLogin(string name, string fbid, string email)
        {
            Console.WriteLine("reached contoller / facebooklogin");


            try
            {

                if ((email != null) & (fbid != null))
                {
                    SocialLoginResponse res = this.ServiceClient.Post<SocialLoginResponse>(new SocialLoginRequest
                    {
                        Email = email,
                        Fbid = fbid,
                        Name = name,
                    });
                    Console.WriteLine("reached completed service to store user details SocialLoginRequest of facebook");
                    return SocialOath(res.jsonval);
                }

            }
            catch (Exception e)
            {
                Console.WriteLine("reached exception FacebookLogin");
                TempData["socloginerr"] = "Something went wrong. Please try later";
                Console.WriteLine("Exception: " + e.Message + e.StackTrace);
                return Redirect("/Platform/OnBoarding");
            }
            return Redirect("/Platform/OnBoarding");
        }

        public IActionResult GoogleLogin(string name, string goglid, string email)
        {
            Console.WriteLine("reached contoller / GoogleLogin");


            try
            {

                if ((email != null) & (goglid != null))
                {
                    SocialLoginResponse res = this.ServiceClient.Post<SocialLoginResponse>(new SocialLoginRequest
                    {
                        Email = email,
                        Goglid = goglid,
                        Name = name,
                    });
                    Console.WriteLine("reached completed service to store user details SocialLoginRequest of google");
                    return SocialOath(res.jsonval);
                }

            }
            catch (Exception e)
            {
                Console.WriteLine("reached exception GoogleLogin");
                TempData["socloginerr"] = "Something went wrong. Please try later";
                Console.WriteLine("Exception: " + e.Message + e.StackTrace);
                return Redirect("/Platform/OnBoarding");
            }
            return Redirect("/Platform/OnBoarding");
        }


        [HttpGet("social_oauth")]
        public IActionResult SocialOath(string scosignup)
        {
            Console.WriteLine("reached contoller / SocialOath");

            SocialSignup Social = JsonConvert.DeserializeObject<SocialSignup>(scosignup);
            if (Social.UniqueEmail)
            {
                Console.WriteLine("reached UniqueEmail");
                MyAuthenticateResponse authResponse = this.AuthClient.Get<MyAuthenticateResponse>(new Authenticate
                {
                    provider = CredentialsAuthProvider.Name,
                    UserName = Social.Email,
                    Password = Social.Pauto,
                    Meta = new Dictionary<string, string> { { RoutingConstants.WC, RoutingConstants.TC }, { TokenConstants.CID, CoreConstants.EXPRESSBASE } },
                    //UseTokenCookie = true
                });
                if (authResponse != null)
                {
                    CookieOptions options = new CookieOptions();
                    Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, authResponse.BearerToken, options);
                    Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, authResponse.RefreshToken, options);
                    this.ServiceClient.BearerToken = authResponse.BearerToken;
                    this.ServiceClient.RefreshToken = authResponse.RefreshToken;
                }

                var tmp = this.ServiceClient.Post<CreateSolutionResponse>(new CreateSolutionRequest
                {

                    SolutionName = "My First solution",
                    Description = "This is my first solution",
                    DeployDB = true,
                });
                Console.WriteLine("reached completed CreateSolutionRequest");
                return Redirect(RoutingConstants.MYSOLUTIONS);
            }
            else
            if (!Social.Forsignup)
            {
                Console.WriteLine("reached Forsignup??");
                if ((Social.FbId == "") & (Social.GithubId == "") & (Social.TwitterId == "") & (Social.GoogleId == ""))
                {
                    TempData["scl_signin_msg"] = "You have already completed Sign up. Please Sign in using your Email";
                }
                else
                {
                    Console.WriteLine("reached user autologin");
                    var lgid = this.ServiceClient.Post<SocialAutoSignInResponse>(new SocialAutoSignInRequest
                    {
                        Email = Social.Email,
                        Social_id = Social.Social_id
                    });
                    if (string.IsNullOrEmpty(lgid.psw))
                    {
                        TempData["scl_signin_msg"] = "Something went wrong. Please try later";
                    }
                    else
                    {
                        MyAuthenticateResponse authResponse = null;
                        try
                        {
                            string tenantid = lgid.Id.ToString();
                            authResponse = AuthClient.Get<MyAuthenticateResponse>(new Authenticate
                            {
                                provider = CredentialsAuthProvider.Name,
                                UserName = Social.Email,
                                Password = lgid.psw,
                                Meta = new Dictionary<string, string> { { RoutingConstants.WC, RoutingConstants.TC }, { TokenConstants.CID, CoreConstants.EXPRESSBASE/* tenantid*/ } },
                                RememberMe = true
                                //UseTokenCookie = true
                            });

                        }
                        catch (WebServiceException wse)
                        {
                            Console.WriteLine("Exception:" + wse.ToString());
                            TempData["ErrorMessage"] = wse.Message;
                            return Redirect("/");
                        }
                        catch (Exception wse)
                        {
                            Console.WriteLine("Exception:" + wse.ToString());
                            TempData["ErrorMessage"] = wse.Message;
                            return Redirect("/");
                        }
                        if (authResponse != null && authResponse.ResponseStatus != null && authResponse.ResponseStatus.ErrorCode == "EbUnauthorized")
                        {
                            TempData["ErrorMessage"] = "EbUnauthorized";
                            return Redirect("/");
                        }
                        else //AUTH SUCCESS
                        {
                            CookieOptions options = new CookieOptions();
                            Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, authResponse.BearerToken, options);
                            Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, authResponse.RefreshToken, options);
                            Response.Cookies.Append(TokenConstants.USERAUTHID, authResponse.User.AuthId, options);
                            Response.Cookies.Append("UserDisplayName", authResponse.User.FullName, options);
                            //if (req.ContainsKey("remember"))
                            //	Response.Cookies.Append("UserName", req["uname"], options);

                            //_redirectUrl = this.RouteToDashboard(whichconsole);
                        }
                    }
                    Console.WriteLine("reached RoutingConstants.MYSOLUTIONS");
                    return Redirect(RoutingConstants.MYSOLUTIONS);
                }
                Console.WriteLine("reached RoutingConstants.TENANTSIGNIN");

                return RedirectToAction(RoutingConstants.TENANTSIGNIN);
            }
            else
            {
                if (Social.AuthProvider == "github")
                {
                    TempData["scl_signin_msg"] = "You have already created an accout with Github";
                }

                if (Social.AuthProvider == "facebook")
                {
                    TempData["scl_signin_msg"] = "You have already created an accout with Facebook";
                }

            }

            return RedirectToAction(RoutingConstants.TENANTSIGNIN);
        }

        [HttpPost]
        public async Task<IActionResult> TenantExtSignup()
        {
            try
            {
                string reqEmail = this.HttpContext.Request.Form[TokenConstants.EMAIL];
                TempData[RequestEmail] = reqEmail;
                UniqueRequestResponse result = this.ServiceClient.Post<UniqueRequestResponse>(new UniqueRequest { email = reqEmail });
                if (result.Unique)
                {
                    RegisterResponse res = this.ServiceClient.Post<RegisterResponse>(new RegisterRequest { Email = reqEmail, DisplayName = CoreConstants.EXPRESSBASE });

                    if (Convert.ToInt32(res.UserId) >= 0)
                        return RedirectToAction("EbOnBoarding", new { Email = reqEmail }); // convert get to post
                }
                else
                {
                    TempData["Email"] = reqEmail;
                    if (result.HasPassword)
                        return RedirectToAction("TenantSignIn");
                }
            }
            catch (WebServiceException e)
            {
                Console.WriteLine("Exception:" + e.ToString());
            }
            return View();
        }

        [HttpGet("em")]
        public IActionResult EmailVerify(string emv)
        {
            var base64Encoded = System.Convert.FromBase64String(emv);
            var emailcd = System.Text.Encoding.UTF8.GetString(base64Encoded);
            string[] emcode = emailcd.Split(new Char[] { '$' }, StringSplitOptions.RemoveEmptyEntries);



            var sts = this.ServiceClient.Post<EmailverifyResponse>(new EmailverifyRequest
            {
                ActvCode = emcode[1],
                Id = emcode[0]
            });
            if (sts.VerifyStatus == true)
            { return View(); }
            else
            {
                return RedirectToAction("MailAlreadyVerified");
            }
        }

        public IActionResult SwitchContext()
        {
            Console.WriteLine("Inside Context Switch");
            var req = this.HttpContext.Request.Form;
            string btoken = req["Btoken"].ToString();
            string rtoken = req["Rtoken"].ToString();
            string console = req["WhichConsole"];
            if (TenantSingleSignOn(btoken, rtoken, console))
            {
                if (console == RoutingConstants.DC)
                    return RedirectToAction("DevDashBoard", "Dev");
                else if (console == RoutingConstants.UC)
                    return RedirectToAction("UserDashboard", "TenantUser");
            }
            return View();
        }

        public bool TenantSingleSignOn(string btoken, string rtoken, string wc)
        {
            var host = this.HttpContext.Request.Host;
            string[] hostParts = host.Host.Split(CharConstants.DOT);
            string whichconsole = wc;

            string email = ValidateTokensAndGetUserName(btoken, rtoken);
            if (string.IsNullOrEmpty(email))
                return false;

            this.DecideConsole(hostParts[0], out whichconsole);
            MyAuthenticateResponse authResponse = null;
            try
            {
                var authClient = this.ServiceClient;
                authResponse = authClient.Get<MyAuthenticateResponse>(new Authenticate
                {
                    provider = CredentialsAuthProvider.Name,
                    UserName = email,
                    Password = "NIL",
                    Meta = new Dictionary<string, string> {
                        { RoutingConstants.WC, whichconsole },
                        { TokenConstants.CID, ViewBag.cid },
                        { "sso", "true" },
                        { TokenConstants.IP, this.RequestSourceIp},
                        { RoutingConstants.USER_AGENT, this.UserAgent}
                    },
                });

            }
            catch (WebServiceException wse) { Console.WriteLine("Exception:" + wse.ToString()); }
            catch (Exception wse) { Console.WriteLine("Exception:" + wse.ToString()); }
            if (authResponse != null && authResponse.ResponseStatus != null && authResponse.ResponseStatus.ErrorCode == "EbUnauthorized") { }
            else //AUTH SUCCESS
            {
                CookieOptions options = new CookieOptions();
                Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, authResponse.BearerToken, options);
                Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, authResponse.RefreshToken, options);
                return true;
            }
            return false;
        }

        private static async Task<Recaptcha> RecaptchaResponse(string secret, string token)
        {
            string url = string.Format("https://www.google.com/recaptcha/api/siteverify?secret={0}&response={1}", secret, token);
            var req = WebRequest.Create(url);
            var r = await req.GetResponseAsync().ConfigureAwait(false);
            var responseReader = new StreamReader(r.GetResponseStream());
            var responseData = await responseReader.ReadToEndAsync();
            var d = Newtonsoft.Json.JsonConvert.DeserializeObject<Recaptcha>(responseData);
            return d;
        }

        private void EventLogWriteEntry()
        {
            var t = this.HttpContext.Request.Headers["Eb-X-Forwarded-For"];
            Console.WriteLine("-------------------------------------------------");
            IPHostEntry heserver = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ttt in heserver.AddressList)
                Console.WriteLine("From IP AddressList  ---> " + ttt.ToString());
            Console.WriteLine("-------------------------------------------------");

            Console.WriteLine(this.httpContextAccessor.HttpContext.Connection.RemoteIpAddress.ToString());
            foreach (var zzz in this.HttpContext.Request.Headers)
                Console.WriteLine("Key : " + zzz.Key + "Value : " + zzz.Value);
        }

        [HttpPost]
        public async Task<EbAuthResponse> EbSignIn(int i)
        {
            EbAuthResponse authresp = new EbAuthResponse();
            this.EventLogWriteEntry();

            HostString host = this.HttpContext.Request.Host;
            string[] hostParts = host.Host.Split(CharConstants.DOT);
            IFormCollection req = this.HttpContext.Request.Form;
            string UserName;
            string Password;
            this.DecideConsole(hostParts[0], out string whichconsole);

            string redirect_url = Common.Extensions.StringExtensions.FromBase64(req["continue_with"].ToString() ?? string.Empty);
            string token = req["g-recaptcha-response"];
            Recaptcha data = null;
            try
            {
                data = await RecaptchaResponse(Environment.GetEnvironmentVariable(EnvironmentConstants.EB_RECAPTCHA_SECRET), token);
            }
            catch (Exception e)
            {
                Console.WriteLine("RECAPTCHA EXCEPTION");
                Console.WriteLine(e.Message);
                authresp.AuthStatus = false;
                authresp.ErrorMessage = "Recaptcha error, try again";
            }

            Console.WriteLine("ENVIRONMENT-------->" + ViewBag.Env);

            if (!data.Success && ViewBag.Env == "Production")//captcha error
            {
                Console.WriteLine("captcha error " + req["uname"]);
                authresp.AuthStatus = false;
                if (data.ErrorCodes.Count <= 0)
                {
                    authresp.ErrorMessage = "The captcha input is invalid or malformed.";
                }

                var error = data.ErrorCodes[0].ToLower();
                switch (error)
                {
                    case ("missing-input-secret"):
                        authresp.CaptchaError = "The secret parameter is missing.";
                        break;
                    case ("invalid-input-secret"):
                        authresp.CaptchaError = "The secret parameter is invalid or malformed.";
                        break;

                    case ("missing-input-response"):
                        authresp.CaptchaError = "The captcha input is missing.";
                        break;
                    case ("invalid-input-response"):
                        authresp.CaptchaError = "The captcha input is invalid or malformed.";
                        break;

                    default:
                        authresp.CaptchaError = "Error occured. Please try again";
                        break;
                }
            }
            else
            { 
                if (req["otptype"] == "signinotp")
                {
                    EbAuthResponse validateResp = ValidateOtp(req["otp"]);
                    UserName = req["uname_otp"];
                    Password = "NIL";
                    if (!validateResp.AuthStatus)
                    {
                        authresp.AuthStatus = false;
                        authresp.ErrorMessage = validateResp.ErrorMessage;
                        return authresp;
                    } 
                }
                else
                {
                    UserName = req["uname"];
                    Password = (req["pass"] + req["uname"]).ToMD5Hash();
                }

                Console.WriteLine("captcha ok " + req["uname"]);
                string tenantid = ViewBag.cid;
                MyAuthenticateResponse myAuthResponse = null;
                try
                {
                    Authenticate AuthenticateReq = new Authenticate
                    {
                        provider = CredentialsAuthProvider.Name,
                        UserName = UserName,
                        Password = Password,
                        Meta = new Dictionary<string, string> {
                            { RoutingConstants.WC, whichconsole },
                            { TokenConstants.CID, tenantid },
                            { TokenConstants.IP, this.RequestSourceIp},
                            { RoutingConstants.USER_AGENT, this.UserAgent}
                        },
                        RememberMe = true,

                        //UseTokenCookie = true
                    };
                    if (req["otptype"] == "signinotp")
                    {
                        AuthenticateReq.Meta.Add("sso", "true");
                    }
                    myAuthResponse = this.AuthClient.Get<MyAuthenticateResponse>(AuthenticateReq);

                }
                catch (WebServiceException wse)
                {
                    Console.WriteLine("Exception:" + wse.ToString());
                    authresp.AuthStatus = false;
                    authresp.ErrorMessage = wse.Message;
                }
                catch (Exception wse)
                {
                    Console.WriteLine("Exception:" + wse.ToString());
                    authresp.AuthStatus = false;
                    authresp.ErrorMessage = wse.Message;
                }

                if (myAuthResponse != null) // authenticated
                {
                    Console.WriteLine("myAuthResponse != null " + req["uname"]);
                    bool is2fa = false;
                    if (ViewBag.WhichConsole == "uc" && req["otptype"] != "signinotp")
                    {
                        Eb_Solution sol_Obj = GetSolutionObject(ViewBag.SolutionId);
                        if (sol_Obj != null && sol_Obj.Is2faEnabled)
                            is2fa = true;
                    }
                    if (is2fa) //if 2fa enabled
                    {
                        this.ServiceClient.BearerToken = myAuthResponse.BearerToken;
                        this.ServiceClient.RefreshToken = myAuthResponse.RefreshToken;
                        Authenticate2FAResponse resp = this.ServiceClient.Post(new Authenticate2FARequest
                        {
                            MyAuthenticateResponse = myAuthResponse,
                            SolnId = ViewBag.SolutionId,
                        });
                        authresp.AuthStatus = resp.AuthStatus;
                        authresp.ErrorMessage = resp.ErrorMessage;
                        authresp.Is2fa = resp.Is2fa;
                        authresp.OtpTo = resp.OtpTo;

                        CookieOptions options = new CookieOptions();
                        Response.Cookies.Append(RoutingConstants.TWOFATOKEN, resp.TwoFAToken, options);
                        Response.Cookies.Append(TokenConstants.USERAUTHID, myAuthResponse.User.AuthId, options);
                        Response.Cookies.Append("UserDisplayName", myAuthResponse.User.FullName, options);
                        if (req.ContainsKey("remember"))
                            Response.Cookies.Append("UserName", req["uname"], options);
                    }

                    else//2fa NOT enabled
                    {
                        Console.WriteLine("AuthStatus true, not 2fa " + req["uname"]);
                        authresp.AuthStatus = true;
                        CookieOptions options = new CookieOptions();
                        Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, myAuthResponse.BearerToken, options);
                        Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, myAuthResponse.RefreshToken, options);
                        Response.Cookies.Append(TokenConstants.USERAUTHID, myAuthResponse.User.AuthId, options);
                        Response.Cookies.Append("UserDisplayName", myAuthResponse.User.FullName, options);
                        Console.WriteLine("AuthStatus true, not 2fa cookie set" + req["uname"]);
                        if (req.ContainsKey("remember"))
                            Response.Cookies.Append("UserName", req["uname"], options);

                        if (string.IsNullOrEmpty(redirect_url))
                            authresp.RedirectUrl = this.RouteToDashboard(whichconsole);
                        else
                            authresp.RedirectUrl = redirect_url;
                    }
                }
                else
                {
                    Console.WriteLine("captcha error " + req["uname"]);
                }
            }
            return authresp;
        }

        public EbAuthResponse ValidateOtp(string otp)
        {
            EbAuthResponse authresp = new EbAuthResponse();
            string token = Request.Cookies[RoutingConstants.TWOFATOKEN];
            string authid = Request.Cookies[TokenConstants.USERAUTHID];
            User _u = this.Redis.Get<User>(authid);
            if (_u != null)
            {
                //this.ServiceClient.BearerToken = _u.BearerToken;
                //this.ServiceClient.RefreshToken = _u.RefreshToken;
                Authenticate2FAResponse response = this.ServiceClient.Post(new ValidateOtpRequest { Token = token, UserAuthId = authid });
                authresp.AuthStatus = response.AuthStatus;
                authresp.ErrorMessage = response.ErrorMessage;

                if (authresp.AuthStatus)
                {
                    if (otp == _u.Otp)
                    {
                        IFormCollection req = this.HttpContext.Request.Form;
                        if (req["otptype"] == "signinotp")
                        {
                            authresp.AuthStatus = true;
                        }
                        else
                        {
                            CookieOptions options = new CookieOptions();
                            Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, _u.BearerToken, options);
                            Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, _u.RefreshToken, options);
                            authresp.RedirectUrl = this.RouteToDashboard(RoutingConstants.UC);
                        }
                    }
                    else
                    {
                        authresp.AuthStatus = false;
                        authresp.ErrorMessage = "The OTP you've entered is incorrect. Please try again.";
                    }
                }
            }
            return authresp;
        }

        public EbAuthResponse ResendOtp()
        {
            EbAuthResponse authresp = new EbAuthResponse();
            string token = Request.Cookies[RoutingConstants.TWOFATOKEN];
            string authid = Request.Cookies[TokenConstants.USERAUTHID];
            User _u = this.Redis.Get<User>(authid);
            IFormCollection req = this.HttpContext.Request.Form;
            Authenticate2FAResponse response = null;
            if (req["otptype"] == "signinotp")
            {
                response = this.ServiceClient.Post(new ResendOTPSignInRequest { Token = token, SolnId = ViewBag.SolutionId, UserAuthId = authid });
            }
            else
            {
                this.ServiceClient.BearerToken = _u.BearerToken;
                this.ServiceClient.RefreshToken = _u.RefreshToken;
                response = this.ServiceClient.Post(new ResendOTP2FARequest { Token = token });
            }
            authresp.AuthStatus = response.AuthStatus;
            authresp.ErrorMessage = response.ErrorMessage;
            return authresp;
        }

        public EbAuthResponse SendSignInOtp()
        {
            EbAuthResponse authresp = new EbAuthResponse { };
            IFormCollection req = this.HttpContext.Request.Form;
            string tenantid = ViewBag.SolutionId;
            string uname = req["uname"];
            bool is_email = Convert.ToBoolean(req["is_email"]);
            bool is_mobile = Convert.ToBoolean(req["is_mobile"]);
            Authenticate2FAResponse resp = this.ServiceClient.Post<Authenticate2FAResponse>(new SendSignInOtpRequest
            {
                UName = uname,
                SignInOtpType = (is_email) ? SignInOtpType.Email : SignInOtpType.Sms,
                SolutionId = tenantid
            });
            authresp.AuthStatus = resp.AuthStatus;
            if (authresp.AuthStatus)
            {
                authresp.Is2fa = resp.Is2fa;
                authresp.OtpTo = resp.OtpTo;
                CookieOptions options = new CookieOptions();
                Response.Cookies.Append(RoutingConstants.TWOFATOKEN, resp.TwoFAToken, options);
                Response.Cookies.Append(TokenConstants.USERAUTHID, resp.UserAuthId, options);
            }
            else
            {
                authresp.ErrorMessage = resp.ErrorMessage;
            }

            return authresp;
        }

        private void DecideConsole(string subDomain, out string whichconsole)
        {
            string cid = null;
            if (subDomain == RoutingConstants.MYACCOUNT)
            {
                cid = CoreConstants.EXPRESSBASE;
                whichconsole = EbAuthContext.TenantContext;
            }
            else
            {
                if (subDomain.EndsWith(RoutingConstants.DASHBOT) || subDomain.EndsWith(RoutingConstants.DASHMOB) || subDomain.EndsWith(RoutingConstants.DASHDEV))
                {
                    cid = this.GetIsolutionId(subDomain.Substring(0, subDomain.LastIndexOf(CharConstants.DASH)));

                    if (subDomain.EndsWith(RoutingConstants.DASHBOT))
                        whichconsole = EbAuthContext.BotUserContext;
                    else if (subDomain.EndsWith(RoutingConstants.DASHMOB))
                        whichconsole = EbAuthContext.MobileUserContext;
                    else //if (subDomain.EndsWith("-dev"))
                        whichconsole = EbAuthContext.DeveloperContext;
                }
                else //User Console
                {
                    cid = this.GetIsolutionId(subDomain);
                    whichconsole = EbAuthContext.WebUserContext;
                }
            }
            ViewBag.cid = cid;
        }

        private string RouteToDashboard(string whichconsole)
        {
            string url = string.Empty;
            if (ViewBag.cid == CoreConstants.EXPRESSBASE)
            {
                url = RoutingConstants.MYSOLUTIONS;
            }
            else
            {
                if (whichconsole == RoutingConstants.DC)
                {
                    url = RoutingConstants.MYAPPLICATIONS;
                }
                else if (whichconsole == RoutingConstants.UC)
                {
                    url = RoutingConstants.USERDASHBOARD;
                }
            }
            return url;
        }

        [HttpGet]
        public IActionResult AfterSignInSocial(string provider, string providerToken,
            string email, string socialId, int lg)
        {

            try
            {
                MyAuthenticateResponse authResponse = AuthClient.Send<MyAuthenticateResponse>(new Authenticate
                {
                    provider = CredentialsAuthProvider.Name,
                    UserName = "NIL",
                    Password = "NIL",
                    Meta = new Dictionary<string, string> { { RoutingConstants.WC, RoutingConstants.TC }, { TokenConstants.CID, CoreConstants.EXPRESSBASE }, { TokenConstants.SOCIALID, socialId } },
                    // UseTokenCookie = true
                });

                if (authResponse.User != null)
                {
                    CookieOptions options = new CookieOptions();
                    Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, authResponse.BearerToken, options);
                    Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, authResponse.RefreshToken, options);
                    return RedirectToAction("TenantDashboard", "Tenant");
                    //if (lg <= 1)
                    //{
                    //    return RedirectToAction("ProfileSetup", "Tenant");
                    //}
                    //{
                    //}
                }
                else
                    return Redirect(RoutingConstants.EXTERROR);
            }
            catch (WebServiceException wse)
            {
                Console.WriteLine("Exception:" + wse.ToString());
                ViewBag.errormsg = wse.Message;
                return Redirect(RoutingConstants.EXTERROR);
            }
        }

        public IActionResult VerificationStatus()
        {
            var email = HttpContext.Request.Query[TokenConstants.EMAIL];
            var token = HttpContext.Request.Query[TokenConstants.SIGNUP_TOK];
            var authClient = this.ServiceClient;
            MyAuthenticateResponse authResponse = authClient.Send<MyAuthenticateResponse>(new Authenticate
            {
                provider = CredentialsAuthProvider.Name,
                UserName = email,
                Password = "NIL",
                Meta = new Dictionary<string, string> { { TokenConstants.SIGNUP_TOK, token }, { RoutingConstants.WC, RoutingConstants.TC } },
                // UseTokenCookie = true
            });

            if (authResponse != null)
                ViewBag.SuccessMessage = "Successfully Verified";
            else
                ViewBag.SuccessMessage = "Verification failed";
            return View();
        }

        [HttpPost]
        public void SMSCallBack(int i)
        {
            var req = this.HttpContext.Request.Form;
            var smsSid = Request.Form["SmsSid"];
            var messageStatus = Request.Form["MessageStatus"];
            SMSInitialRequest sMSSentRequest = new SMSInitialRequest();
            // sMSSentRequest.To = req["to"];
            //  sMSSentRequest.Body = "SMS Id: " + smsSid.ToString() + "/nMessageStatus:" + messageStatus.ToString();
            this.ServiceClient.Post(sMSSentRequest);
        }

        public string ValidateTokensAndGetUserName(string btoken, string rtoken, string _wc = RoutingConstants.TC, string _cid = CoreConstants.EXPRESSBASE)
        {
            if (VerifySignature(btoken) && VerifySignature(rtoken))
            {
                try
                {
                    var jwtToken = new JwtSecurityToken(btoken);
                    var cid = jwtToken.Payload[TokenConstants.CID];
                    var uid = jwtToken.Payload[TokenConstants.UID];
                    var email = jwtToken.Payload[TokenConstants.EMAIL];
                    var wc = jwtToken.Payload[TokenConstants.WC];
                    var sub = jwtToken.Payload[TokenConstants.SUB];
                    long iat = Convert.ToInt64(jwtToken.Payload[TokenConstants.IAT]);
                    long exp = Convert.ToInt64(jwtToken.Payload[TokenConstants.EXP]);
                    DateTime startDate = new DateTime(1970, 1, 1);
                    DateTime iat_time = startDate.AddSeconds(iat);
                    DateTime exp_time = startDate.AddSeconds(exp);

                    if (!(wc.ToString().Equals(_wc) && cid.ToString().Equals(_cid)))
                    {
                        Console.WriteLine("wc/cid mismatch");
                        return string.Empty;
                    }
                    if (iat_time < DateTime.Now && exp_time > DateTime.Now)
                    {
                        Console.WriteLine("Valid btoken");
                        return email.ToString();
                    }
                    else
                    {
                        Console.WriteLine("btoken expired");
                        var jwtrToken = new JwtSecurityToken(rtoken);
                        var rsub = jwtrToken.Payload[TokenConstants.SUB];
                        long riat = Convert.ToInt64(jwtrToken.Payload[TokenConstants.IAT]);
                        long rexp = Convert.ToInt64(jwtrToken.Payload[TokenConstants.EXP]);
                        DateTime riat_time = startDate.AddSeconds(riat);
                        DateTime rexp_time = startDate.AddSeconds(rexp);
                        if (riat_time < DateTime.Now && rexp_time > DateTime.Now && rsub.Equals(sub))
                        {
                            Console.WriteLine("Valid rtoken");
                            return email.ToString();
                        }
                        else
                            Console.WriteLine("rtoken expired or invalid");
                    }
                }
                catch (Exception e) { Console.WriteLine("Exception:" + e.ToString()); }
            }
            return string.Empty;
        }

        [HttpGet("Store")]
        public IActionResult AppStorePublic()
        {
            GetAllFromAppstoreResponse resp = ServiceClient.Get(new GetAllFromAppStoreExternalRequest { });
            ViewBag.StoreApps = resp.Apps;

            string sBToken = base.HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN];
            string sRToken = base.HttpContext.Request.Cookies[RoutingConstants.REFRESH_TOKEN];
            if (!String.IsNullOrEmpty(sBToken) || !String.IsNullOrEmpty(sRToken))
                ViewBag.AvailToken = true;

            return View();
        }

        [HttpGet("AppInfo/{id}")]
        public IActionResult GoDetail(int id)
        {
            GetAppStoreDetailedResponse resp = this.ServiceClient.Get(new GetAppStoreDetailedRequest { Id = id });
            ViewBag.StoreApps = resp.Store;
            ViewBag.AppId = id;
            return View();
        }

        [HttpPost]
        public IActionResult BuyPubApp()
        {
            string _appid = this.HttpContext.Request.Form["AppId"];
            var host = base.HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty);
            string[] hostParts = host.Split(CharConstants.DOT);

            string sBToken = base.HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN];
            string sRToken = base.HttpContext.Request.Cookies[RoutingConstants.REFRESH_TOKEN];

            if (!String.IsNullOrEmpty(sBToken) || !String.IsNullOrEmpty(sRToken))
            {
                if (IsTokensValid(sRToken, sBToken, hostParts[0]))
                    return Redirect(RoutingConstants.PAYNOW);
                else
                    return Redirect(RoutingConstants.TENANTSIGNIN + "?reDir=" + this.S2B64("/AppInfo/" + _appid));
            }
            else
            {
                return Redirect(RoutingConstants.TENANTSIGNIN + "?reDir=" + this.S2B64("/AppInfo/" + _appid));
            }
        }

        public string S2B64(string s)
        {
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(s));
        }

        public string B642S(string b64)
        {
            byte[] b = Convert.FromBase64String(b64);
            return Encoding.UTF8.GetString(b);
        }

        //[Microsoft.AspNetCore.Mvc.Route("{stripwebhook}")]
        //public string TestStripeWebhook()
        //{
        //    string json = new StreamReader(HttpContext.Request.Body).ReadToEnd();
        //    Console.WriteLine("Webhook Response  : " + json);
        //    return json;
        //}

        public IActionResult InstallFromStore(int appid)
        {
            var host = base.HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty);
            string[] hostParts = host.Split(CharConstants.DOT);

            string redirect = Common.Extensions.StringExtensions.ToBase64("/Import/ImportToSln?appid=" + appid);

            string sBToken = base.HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN];
            string sRToken = base.HttpContext.Request.Cookies[RoutingConstants.REFRESH_TOKEN];

            if (!String.IsNullOrEmpty(sBToken) || !String.IsNullOrEmpty(sRToken))
            {
                if (IsTokensValid(sRToken, sBToken, hostParts[0]))
                {
                    JwtSecurityToken bToken = new JwtSecurityToken(sBToken);
                    string wc = bToken.Payload[TokenConstants.WC].ToString();
                    if (wc == RoutingConstants.TC)
                    {
                        return Redirect("/Import/ImportToSln?appid=" + appid);
                    }
                    else
                    {
                        return RedirectToAction("TenantSignIn", new { continue_with = redirect });
                    }
                }
            }
            else
            {
                return RedirectToAction("TenantSignIn", new { continue_with = redirect });
            }
            return View();
        }

        public IActionResult UsrSignUp()
        {
            MyAuthenticateResponse authResponse = null;
            try
            {
                string tenantid = ViewBag.SolutionId;
                authResponse = this.AuthClient.Get<MyAuthenticateResponse>(new Authenticate
                {
                    provider = CredentialsAuthProvider.Name,
                    UserName = "NIL",
                    Password = "NIL",
                    Meta = new Dictionary<string, string> {
                        { RoutingConstants.WC, "uc" },
                        { "anonymous", "true"},
                        { "emailId", "user@signup.com" },
                        { TokenConstants.CID, tenantid },
                        { TokenConstants.IP, this.RequestSourceIp},
                        { RoutingConstants.USER_AGENT, this.UserAgent}
                    },
                    RememberMe = true
                });

            }
            catch (Exception wse)
            {
                Console.WriteLine("Exception:" + wse.ToString());
            }
            if (authResponse != null)
            {
                CookieOptions options = new CookieOptions();
                Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, authResponse.BearerToken, options);
                Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, authResponse.RefreshToken, options);
                Response.Cookies.Append(TokenConstants.USERAUTHID, authResponse.User.AuthId, options);
                Response.Cookies.Append("UserDisplayName", authResponse.User.FullName, options);

                Eb_Solution solutionObj = GetSolutionObject(ViewBag.SolutionId);
                if (solutionObj.SolutionSettings != null && solutionObj.SolutionSettings.SignupFormRefid != string.Empty)
                {

                    return RedirectToAction("WebFormRender", "WebForm", new { refId = solutionObj.SolutionSettings.SignupFormRefid, _locId = authResponse.User.Preference.DefaultLocation, renderMode = 3 });
                }
            }
            return Redirect("/StatusCode/404");
        }

        [Route("PublicForm")]
        public IActionResult PublicForm(string id)
        {
            MyAuthenticateResponse authResponse = null;
            User usr = null;
            string[] hostParts = base.HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty).Split(CharConstants.DOT);
            if (isAvailSolution())
            {
                string sBToken = base.HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN];
                string sRToken = base.HttpContext.Request.Cookies[RoutingConstants.REFRESH_TOKEN];
                bool Isloggedin = false;
                if (!String.IsNullOrEmpty(sBToken) || !String.IsNullOrEmpty(sRToken))
                {
                    if (IsTokensValid(sRToken, sBToken, hostParts[0]))
                    {
                        Isloggedin = true;
                        JwtSecurityToken jwtToken = new JwtSecurityToken(sBToken);
                        string uid = jwtToken.Payload[TokenConstants.SUB].ToString();
                        usr = usr = this.Redis.Get<User>(uid); ;
                    }
                }
                if (!Isloggedin)
                {
                    try
                    {
                        string tenantid = ViewBag.SolutionId;
                        authResponse = this.AuthClient.Get<MyAuthenticateResponse>(new Authenticate
                        {
                            provider = CredentialsAuthProvider.Name,
                            UserName = "NIL",
                            Password = "NIL",
                            Meta = new Dictionary<string, string> {
                        { RoutingConstants.WC, "uc" },
                        { "anonymous", "true"},
                        { "emailId", "user@signup.com" },
                        { TokenConstants.CID, tenantid },
                        { TokenConstants.IP, this.RequestSourceIp},
                        { RoutingConstants.USER_AGENT, this.UserAgent}
                    },
                            RememberMe = true
                        });
                    }
                    catch (Exception wse)
                    {
                        Console.WriteLine("Exception:" + wse.ToString());
                    }
                    if (authResponse != null)
                    {
                        CookieOptions options = new CookieOptions();
                        Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, authResponse.BearerToken, options);
                        Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, authResponse.RefreshToken, options);
                        Response.Cookies.Append(TokenConstants.USERAUTHID, authResponse.User.AuthId, options);
                        Response.Cookies.Append("UserDisplayName", authResponse.User.FullName, options);

                        usr = authResponse.User;
                    }
                }
                if (usr != null && usr.Permissions != null && usr.Permissions.Count > 0)
                {
                    foreach (string s in usr.Permissions)
                    {
                        if (s.Contains("000-00-" + id.Split("-")[3].PadLeft(5, '0')))
                        {
                            return RedirectToAction("WebFormRender", "WebForm", new { refId = id, _locId = usr.Preference.DefaultLocation, renderMode = 5 });
                        }
                    }
                }
            }
            return Redirect("/StatusCode/401");
        }

        public IActionResult KSUMStartUpIndiaLogin()
        {
            return View();
        }

        public IActionResult StartUpIndiaRedirect()
        {
            return View();
        }

    }
}
