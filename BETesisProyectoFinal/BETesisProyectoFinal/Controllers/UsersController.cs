using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using System.IdentityModel.Tokens.Jwt;
using WebApi.Helpers;
using Microsoft.Extensions.Options;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using WebApi.Services;
using WebApi.Entities;
using WebApi.Models.Users;

namespace WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class UsersController : ControllerBase
    {
        private IUserService _userService;
        private IMapper _mapper;
        private readonly AppSettings _appSettings;

        public UsersController(
            IUserService userService,
            IMapper mapper,
            IOptions<AppSettings> appSettings)
        {
            _userService = userService;
            _mapper = mapper;
            _appSettings = appSettings.Value;
        }

        [AllowAnonymous]
        [HttpPost("authenticate")]
        public IActionResult Authenticate([FromBody]AuthenticateModel model)
        {
            var user = _userService.Authenticate(model.Username, model.Password);

            if (user == null)
                return BadRequest(new { message = "Credenciales Inválidas" });

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_appSettings.Secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, user.Id.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            // return basic user info and authentication token
            return Ok(new
            {
                Id = user.Id,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email=user.Email,
                Rol=user.Role,
                Token = tokenString
            });
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public IActionResult Register([FromBody]RegisterModel model)
        {
            // map model to entity
            var user = _mapper.Map<User>(model);

            try
            {
                // create user
                _userService.Create(user, model.Password,model.Role,model.Email);
                return Ok();
            }
            catch (AppException ex)
            {
                // return error message if there was an exception
                return BadRequest(new { message = ex.Message });
            }
        }
        //[Authorize(Roles = Role.Admin)]
        [HttpGet]
        public IActionResult GetAll()
        {
            var users = _userService.GetAll();
            var model = _mapper.Map<IList<UserModel>>(users);
            return Ok(model);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
        //only allow admins to access other user records
        //var currentUserId = int.Parse(User.Identity.Name);
        //if (id != currentUserId && !User.IsInRole(Role.Admin))
        //return Forbid();

        var user = _userService.GetById(id);
        if (user == null)
          return NotFound();
        var model = _mapper.Map<UserModel>(user);
          return Ok(model);
    }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody]UpdateModel model)
        {
        //only allow admins to access other user records
        //var currentUserId = int.Parse(User.Identity.Name);
        //if (id != currentUserId && !User.IsInRole(Role.Admin))
        //return Forbid();
        //map model to entity and set id
        var idUser = _userService.GetById(id);
        var currentUserId = int.Parse(User.Identity.Name);
        if (id != currentUserId && idUser.Role == (Role.Admin))
          return Forbid();
        else {
        var user = _mapper.Map<User>(model);
        user.Id = id;
          try
          {
            // update user 
            _userService.Update(user, model.Password);
            return Ok();
          }
          catch (AppException ex)
          {
          // return error message if there was an exception
          return BadRequest(new { message = ex.Message });
        }
      }  
}

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
        //only allow admins to access other user records
        //var currentUserId = int.Parse(User.Identity.Name);
        //if (id != currentUserId && !User.IsInRole(Role.Admin))
        //return Forbid();
        var idUser = _userService.GetById(id);
        var currentUserId = int.Parse(User.Identity.Name);
        if (id != currentUserId && idUser.Role==(Role.Admin))
          return Forbid();
        else
        {
          _userService.Delete(id);
          return Ok();
        }
        }
    }
}
