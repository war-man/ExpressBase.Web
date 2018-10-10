﻿using ExpressBase.Common;
using ExpressBase.Common.Objects;
using ExpressBase.Common.Singletons;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security.Core;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Web.Filters;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Reflection;
using System.Threading.Tasks;

namespace ExpressBase.Web.Controllers
{
	public class SecurityController : EbBaseIntCommonController
	{
		public SecurityController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }
		
        [EbBreadCrumbFilter("Security/type")]
		public IActionResult CommonList(string type, string show)
		{
			if(!this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()))
				return Redirect("/StatusCode/401");

			IServiceClient client = this.ServiceClient;
			type = type.ToLower();
			ViewBag.ListType = type;
			if (type == "users")
			{
				var fr = this.ServiceClient.Get<GetUsersResponse1>(new GetUsersRequest1() { Show = show });
				ViewBag.dict = JsonConvert.SerializeObject(fr.Data);
			}
			else if (type == "roles")
			{
				var fr = this.ServiceClient.Get<GetRolesResponse1>(new GetRolesRequest1());
				ViewBag.dict = JsonConvert.SerializeObject(fr.Data);
			}
			else if (type == "usergroups")
			{
				var fr = this.ServiceClient.Get<GetUserGroupResponse1>(new GetUserGroupRequest1());
				ViewBag.dict = JsonConvert.SerializeObject(fr.Data);
			}
			else if (type == "anonymoususers")
			{
				var fr = this.ServiceClient.Get<GetAnonymousUserResponse>(new GetAnonymousUserRequest());
				ViewBag.dict = JsonConvert.SerializeObject(fr.Data);
			}
			if (ViewBag.isAjaxCall)
				return PartialView();
			else
				return View();
		}
		

		//[HttpGet]
		//public IActionResult UserPreferences()
		//{
		//	var res = this.ServiceClient.Post<EditUserPreferenceResponse>(new EditUserPreferenceRequest());
		//	if (res.Data != null)
		//	{
		//		ViewBag.dateformat = res.Data["dateformat"];
		//		ViewBag.timezone = res.Data["timezone"];
		//		ViewBag.numformat = res.Data["numformat"];
		//		ViewBag.timezoneabbre = res.Data["timezoneabbre"];
		//		ViewBag.timezonefull = res.Data["timezonefull"];
		//		ViewBag.locale = res.Data["locale"];

		//	}

		//	return View();
		//}

		//[HttpPost]
		//public IActionResult UserPreferences(int i)
		//{
		//	var req = this.HttpContext.Request.Form;
		//	var res = this.ServiceClient.Post<UserPreferenceResponse>(new UserPreferenceRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value) });
		//	return View();
		//}

		//--------------MANAGE USER START------------------------------------
		
		

	    [EbBreadCrumbFilter("Security")]
		public IActionResult ManageUser(int itemid, int Mode, string AnonymousUserInfo)
		{
			if (!this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()) && Mode != 3)
				return Redirect("/StatusCode/401");

			//Mode - CreateEdit = 1, View = 2, MyProfileView = 3
			ViewBag.Culture = CultureHelper.CulturesAsJson;
			ViewBag.TimeZone = CultureHelper.TimezonesAsJson;
			ViewBag.MU_Mode = Mode;

			//var ip2 = HttpContext.Features.Get<IHttpConnectionFeature>()?.RemoteIpAddress?.ToString();
			//string ip =  this.Request.HttpContext.Connection.RemoteIpAddress.ToString();
			//string ip3 = GetRequestIP();

			//HttpClient client = new HttpClient(); 
			////string result = await client.GetStringAsync("http://freegeoip.net/json");
			//string result = await client.GetStringAsync("http://ip-api.com/json");
			//IpApiResponse ooo = JsonConvert.DeserializeObject<IpApiResponse>(result);
			

			Dictionary<string, string> dict = new Dictionary<string, string>();				
			//List<EbRole> Sysroles = new List<EbRole>();
			//foreach (var role in Enum.GetValues(typeof(SystemRoles)))
			//{
			//	Sysroles.Add(new EbRole() { Name = role.ToString(), Description = "SystemRole_" + role, Id = (int)role });
			//}
			//ViewBag.SystemRoles = JsonConvert.SerializeObject(Sysroles);
			var fr = this.ServiceClient.Get<GetManageUserResponse>(new GetManageUserRequest { Id = itemid, RqstMode = Mode, SolnId = ViewBag.cid });
			foreach (var role in Enum.GetValues(typeof(SystemRoles)))
			{
				fr.Roles.Add(new EbRole() {
					Name = role.ToString(),
					Description = "SYSTEM ROLE",
					Id = (int)role
				});
			}
			ViewBag.Roles = JsonConvert.SerializeObject(fr.Roles);
			ViewBag.EBUserGroups = JsonConvert.SerializeObject(fr.EbUserGroups);
			ViewBag.Role2RoleList = JsonConvert.SerializeObject(fr.Role2RoleList);
			List<string> UserStatus = new List<string>();
			foreach (var status in Enum.GetValues(typeof(EbUserStatus)))
			{
				UserStatus.Add(status.ToString());
			}
			ViewBag.UserStatusList = UserStatus;

			if(Mode == 3)
			{
				itemid = Convert.ToInt32(fr.UserData["id"]);
			}

			if(itemid == 1)
			{
				dict = JsonConvert.DeserializeObject<Dictionary<string, string>>(AnonymousUserInfo);
				ViewBag.U_Info = dict;
			}
			else if (itemid > 1)
			{
				ViewBag.U_Info = fr.UserData;
				ViewBag.U_Roles = JsonConvert.SerializeObject(fr.UserRoles);
				ViewBag.U_Groups = JsonConvert.SerializeObject(fr.UserGroups);
			}
			else
			{
				ViewBag.U_Roles = "";
				ViewBag.U_Groups = "";
			}
			ViewBag.itemid = itemid;
			return View();
		}

		public int SaveUser(int userid, string roles, string usergroups, string usrinfo)
		{
			Dictionary<string, string> Dict = JsonConvert.DeserializeObject<Dictionary<string, string>>(usrinfo);

			if (!this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()))
			{
				if (this.LoggedInUser.UserId == userid) ;
				//Dict["roles"] = String.Join(",", this.LoggedInUser.Roles);//bug
				else
					return 0;
			}
			else//temp fix
			{
				List<int> roleids = new List<int>();
				if (this.LoggedInUser.UserId == userid)
				{
					if (!string.IsNullOrEmpty(Dict["roles"]))//for avoiding format exception in next line
						roleids = Array.ConvertAll(Dict["roles"].Split(','), int.Parse).ToList();
					if (!roleids.Contains((int)SystemRoles.SolutionOwner))
					{
						roleids.Add((int)SystemRoles.SolutionOwner);
						Dict["roles"] = String.Join(",", roleids);
					}
				}
			}

			//var req = this.HttpContext.Request.Form;
			
			//Dictionary<string, object> Dict = new Dictionary<string, object>();
			//Dict["roles"] = string.IsNullOrEmpty(roles) ? string.Empty : roles;
			//Dict["group"] = string.IsNullOrEmpty(usergroups) ? string.Empty : usergroups;

			//  IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);

			//var base64stng = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(Dict["preference"]));
			 
			SaveUserResponse res = this.ServiceClient.Post<SaveUserResponse>(new SaveUserRequest {
				Id = userid,
				FullName = Dict["fullname"],
				NickName = Dict["nickname"],
				EmailPrimary = Dict["email"],
				Password = Dict["pwd"],
				EmailSecondary = Dict["alternateemail"],
				DateOfBirth = Dict["dob"],
				Sex = Dict["sex"],
				PhonePrimary = Dict["phoneprimary"],
				PhoneSecondary = Dict["phonesecondary"],
				LandPhone = Dict["landline"],
				PhoneExtension = Dict["extension"],
				FbId = Dict["fbid"],
				FbName = Dict["fbname"],
				Roles = string.IsNullOrEmpty(Dict["roles"]) ? string.Empty : Dict["roles"],
				UserGroups = string.IsNullOrEmpty(Dict["usergroups"]) ? string.Empty : Dict["usergroups"],
				StatusId = Dict["statusid"],
				Hide = Dict["hide"],
                AnonymousUserId = Convert.ToInt32(Dict["anonymoususerid"]),
				Preference = Dict["preference"]
			});
			return res.id;
		}

		public bool isValidEmail(string reqEmail)
		{
            UniqueCheckResponse temp = this.ServiceClient.Post<UniqueCheckResponse>(new UniqueCheckRequest { email = reqEmail });
            return temp.unrespose;
		}

		public bool ChangeUserPassword(string OldPwd, string NewPwd)
		{
			ChangeUserPasswordResponse resp = this.ServiceClient.Post<ChangeUserPasswordResponse>(new ChangeUserPasswordRequest { OldPwd = OldPwd, NewPwd = NewPwd, Email = ViewBag.email });
			return resp.isSuccess;
		}

		public bool ResetUserPassword(int userid, string username, string NewPwd)
		{
			if (!this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()))
				return false;
			else
			{
				ResetUserPasswordResponse resp = this.ServiceClient.Post<ResetUserPasswordResponse>(new ResetUserPasswordRequest { Id = userid, Email = username, NewPwd = NewPwd});
				return resp.isSuccess;
			}
		}


        //--------------MANAGE ANONYMOUS USER START------------------------------------
        [EbBreadCrumbFilter("Security")]
        public IActionResult ManageAnonymousUser(int itemid)
		{
			if (!this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()))
				return Redirect("/StatusCode/401");

			return View();
		}

		public string GetAnonymousUserInfo(int userid)
		{
			GetManageAnonymousUserResponse temp = this.ServiceClient.Post<GetManageAnonymousUserResponse>(new GetManageAnonymousUserRequest {Id = userid });
			return JsonConvert.SerializeObject(temp.UserData);
		}

		public int UpdateAnonymousUserInfo(int itemid, string name, string email, string phone, string remarks)
		{
			UpdateAnonymousUserResponse temp = this.ServiceClient.Post<UpdateAnonymousUserResponse>(new UpdateAnonymousUserRequest { Id = itemid, FullName = name.IsNullOrEmpty() ? "":name, EmailID = email.IsNullOrEmpty()?"":email, PhoneNumber = phone.IsNullOrEmpty()?"":phone, Remarks = remarks.IsNullOrEmpty()?"":remarks });
			return temp.RowAffected;
		}

		public int ConvertAnonymousUserToUser(int itemid, string name, string email, string phone, string remarks)
		{
			ConvertAnonymousUserResponse temp = this.ServiceClient.Post<ConvertAnonymousUserResponse>(new ConvertAnonymousUserRequest { Id = itemid, FullName = name, EmailID = email, PhoneNumber = phone, Remarks = remarks });
			return temp.status;
		}


        //----------------MANAGE USERGROUPS START----------------------------
        //[HttpGet]
        //public IActionResult ManageUserGroups()
        //{
        //	return View();
        //}

        //[HttpPost]
        [EbBreadCrumbFilter("Security")]
        public IActionResult ManageUserGroups(int itemid)
		{
			if (!this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()))
				return Redirect("/StatusCode/401");

			//var req = this.HttpContext.Request.Form;
			//if (itemid > 0)
			//{
			//	var fr = this.ServiceClient.Get<GetManageUserGroupResponse>(new GetManageUserGroupRequest { id = itemid, TenantAccountId = ViewBag.cid });
			//	List<int> userlist = fr.Data.ContainsKey("userslist") ? fr.Data["userslist"].ToString().Replace("[", "").Replace("]", "").Split(',').Select(int.Parse).ToList() : new List<int>();
			//	ViewBag.UGName = fr.Data["name"];
			//	ViewBag.UGDescription = fr.Data["description"];
			//	ViewBag.itemid = itemid;
			//	string html = "";
			//	if (fr.Data.ContainsKey("userslist"))
			//	{
			//		foreach (var element in userlist)
			//		{
			//			html += "<div id ='@userid' class='alert alert-success columnDrag'>@users<button class='close' type='button' style='font-size: 15px;margin: 2px 0 0 4px;'>x</button></div>".Replace("@users", fr.Data[element.ToString()].ToString()).Replace("@userid", element.ToString());
			//		}

			//	}
			//	ViewBag.UserList = html;

			//}
			//else
			//{
			//	//int groupid = string.IsNullOrEmpty(req["groupid"]) ? 0 : Convert.ToInt32(req["groupid"]);
			//	Dictionary<string, object> Colval = new Dictionary<string, object>();
			//	Colval.Add(itemid.ToString(),"");
			//	GetManageUserGroupResponse res = this.ServiceClient.Post<GetManageUserGroupResponse>(new GetManageUserGroupRequest { Colvalues = Colval, id = itemid });
			//}

			var fr = this.ServiceClient.Get<GetManageUserGroupResponse>(new GetManageUserGroupRequest { id = itemid, SolnId = ViewBag.cid });
			ViewBag.SelectedUserGroupInfo = JsonConvert.SerializeObject(fr.SelectedUserGroupInfo);
			ViewBag.UsersList = JsonConvert.SerializeObject(fr.UsersList);
			return View();
		}

		public int SaveUserGroup(int _id, string _userGroupInfo)
		{
			if (!this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()))
				return 0;

			//var req = this.HttpContext.Request.Form;
			Dictionary<string, string> Dict = JsonConvert.DeserializeObject<Dictionary<string, string>>(_userGroupInfo);
			//Dictionary<string, object> Dict = new Dictionary<string, object>();
			//Dict["roles"] = string.IsNullOrEmpty(roles) ? string.Empty : roles;
			//Dict["group"] = string.IsNullOrEmpty(usergroups) ? string.Empty : usergroups;

			//  IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
			SaveUserGroupResponse res = this.ServiceClient.Post<SaveUserGroupResponse>(new SaveUserGroupRequest
			{
				Id = _id,
				Name = Dict["name"],
				Description = Dict["description"],
				Users = string.IsNullOrEmpty(Dict["users"]) ? string.Empty : Dict["users"]
			});
			return res.id;
		}

        //---------------MANAGE ROLES START----------------------------------
        [EbBreadCrumbFilter("Security")]
        public IActionResult ManageRoles(int itemid)
		{
			if (!this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()))
				return Redirect("/StatusCode/401");
			//var fr = this.ServiceClient.Get<GetManageRolesResponse>(new GetManageRolesRequest { id = itemid, TenantAccountId = ViewBag.cid });
			//ViewBag.AppCollection = JsonConvert.SerializeObject(fr.ApplicationCollection);
			//ViewBag.SelectedRoleInfo = JsonConvert.SerializeObject(fr.SelectedRoleInfo);
			//ViewBag.PermissionList = JsonConvert.SerializeObject(fr.PermissionList);
			//ViewBag.RoleId = itemid;
			//TempData["_dict"] = GetPermissionOperationsAsJs();
			//ViewBag.RoleList = JsonConvert.SerializeObject(fr.RoleList);
			//ViewBag.Role2RoleList = JsonConvert.SerializeObject(fr.Role2RoleList);
			//ViewBag.UsersList = JsonConvert.SerializeObject(fr.UsersList);
			ViewBag.itemid = itemid;
			return View();
		}

		//public object GetObjectAndPermission(string roleId, int appId)
		//{
		//	var fr = this.ServiceClient.Get<GetObjectAndPermissionResponse>(new GetObjectAndPermissionRequest { RoleId = Convert.ToInt32(roleId), AppId = appId });
		//	return JsonConvert.SerializeObject(fr);
		//}

		//GET  PERMISSION OPERATIONS AS JS
		private string GetPermissionOperationsAsJs()
		{
			Assembly assembly = Assembly.GetAssembly(typeof(EbWebForm)); //DO NOT CHANGE
			List<Eb_ObjectTypeOperations> _listObj = new List<Eb_ObjectTypeOperations>();

			foreach (EbObjectType objectType in EbObjectTypes.Enumerator)
			{
				if (objectType.IsUserFacing)
				{
					var eOperations = assembly.GetType(string.Format("ExpressBase.Objects.Eb{0}", objectType.Name))
					.GetField("Operations").GetValue(null);

					if (eOperations != null)
					{
						var _obj = new Eb_ObjectTypeOperations { Op_Id = objectType.IntCode, Op_Name = objectType.Name, Operations = new List<string>() };
						foreach (var Op in (eOperations as EbOperations).Enumerator)
							_obj.Operations.Add(Op.ToString());

						_listObj.Add(_obj);
					}
				}
			}

			return EbSerializers.Json_Serialize(_listObj);
		}

		public object GetUserDetails(string srchTxt)
		{
			var fr = this.ServiceClient.Get<GetUserDetailsResponse>(new GetUserDetailsRequest { SearchText=srchTxt, SolnId = ViewBag.cid });
			return fr.UserList;
		}

		public string SaveRole(int _roleId,string _roleName,string _roleDesc, bool _isAnonymous, int _appId,string _permission, string _role2role, string _users, string _locations)
		{
			if (!this.LoggedInUser.Roles.Contains(SystemRoles.SolutionOwner.ToString()))
				return "Failed";

			Dictionary<string, object> Dict = new Dictionary<string, object>();
			string return_msg;
			Dict["roleid"] = _roleId;
			Dict["applicationid"] = _appId;
			Dict["role_name"] = _roleName;
			Dict["Description"] = _roleDesc;
			Dict["IsAnonymous"] = _isAnonymous ? "T" : "F";
			Dict["users"] = string.IsNullOrEmpty(_users) ? string.Empty : _users;
			Dict["permission"] = string.IsNullOrEmpty(_permission) ? string.Empty : _permission;
			Dict["dependants"] = string.IsNullOrEmpty(_role2role) ? string.Empty : _role2role;
			Dict["locations"] = string.IsNullOrEmpty(_locations) ? string.Empty : _locations;

			SaveRoleResponse res = this.ServiceClient.Post<SaveRoleResponse>(new SaveRoleRequest { Colvalues = Dict });
			if (res.id == 0)
			{
				return_msg = "Success";
			}
			else
			{
				return_msg = "Failed";
			}
			return return_msg;

		}

		public bool isValidRoleName(string reqRoleName)
		{
			try
			{
				Enum.Parse(typeof(SystemRoles), reqRoleName.ToLower(), true);
				return true;//role name is already exists
			}
			catch (Exception ex){
				var result = this.ServiceClient.Post<UniqueCheckResponse>(new UniqueCheckRequest { roleName = reqRoleName });
				return result.unrespose;
			}			
		}


		//--------------------- TEST IP -------------------------------------------

		//public string GetRequestIP(bool tryUseXForwardHeader = true)
		//{
		//	string ip = null;

		//	// todo support new "Forwarded" header (2014) https://en.wikipedia.org/wiki/X-Forwarded-For

		//	// X-Forwarded-For (csv list):  Using the First entry in the list seems to work
		//	// for 99% of cases however it has been suggested that a better (although tedious)
		//	// approach might be to read each IP from right to left and use the first public IP.
		//	// http://stackoverflow.com/a/43554000/538763
		//	//
		//	if (tryUseXForwardHeader)
		//		ip = SplitCsv(GetHeaderValueAs<string>("X-Forwarded-For")).FirstOrDefault();

		//	// RemoteIpAddress is always null in DNX RC1 Update1 (bug).
		//	if (String.IsNullOrWhiteSpace(ip) && this.Request.HttpContext?.Connection?.RemoteIpAddress != null)
		//		ip = this.Request.HttpContext.Connection.RemoteIpAddress.ToString();

		//	if (String.IsNullOrWhiteSpace(ip))
		//		ip = GetHeaderValueAs<string>("REMOTE_ADDR");

		//	// _httpContextAccessor.HttpContext?.Request?.Host this is the local host.

		//	if (String.IsNullOrWhiteSpace(ip))
		//		throw new Exception("Unable to determine caller's IP.");

		//	return ip;
		//}

		//public T GetHeaderValueAs<T>(string headerName)
		//{
		//	StringValues values;

		//	if (this.Request.HttpContext?.Request?.Headers?.TryGetValue(headerName, out values) ?? false)
		//	{
		//		string rawValues = values.ToString();   // writes out as Csv when there are multiple.

		//		if (!rawValues.IsNullOrEmpty())
		//			return (T)Convert.ChangeType(values.ToString(), typeof(T));
		//	}
		//	return default(T);
		//}

		//public static List<string> SplitCsv(string csvList, bool nullOrWhitespaceInputReturnsNull = false)
		//{
		//	if (string.IsNullOrWhiteSpace(csvList))
		//		return nullOrWhitespaceInputReturnsNull ? null : new List<string>();

		//	return csvList
		//		.TrimEnd(',')
		//		.Split(',')
		//		.AsEnumerable<string>()
		//		.Select(s => s.Trim())
		//		.ToList();
		//}

		//public static bool IsNullOrWhitespace(string s)
		//{
		//	return String.IsNullOrWhiteSpace(s);
		//}

	}
}
