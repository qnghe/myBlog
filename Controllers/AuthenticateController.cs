using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using blog.Data;
using blog.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace blog.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticateController : ControllerBase
    {
        private readonly UserManager<BlogUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly BlogContext _context;

        public AuthenticateController(UserManager<BlogUser> userManager, RoleManager<IdentityRole> roleManager, IConfiguration configuration, BlogContext context)
        {
            this._userManager = userManager;
            this._roleManager = roleManager;
            _configuration = configuration;
            _context = context;
        }

        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> Login([FromBody] Login login)
        {
            var user = await _userManager.FindByNameAsync(login.Username);
            if (user != null && await _userManager.CheckPasswordAsync(user, login.Password))
            {
                var userRoles = await _userManager.GetRolesAsync(user);

                var authClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };

                foreach (var userRole in userRoles)
                {
                    authClaims.Add(new Claim(ClaimTypes.Role, userRole));
                }

                var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]));

                var token = new JwtSecurityToken(
                    issuer: _configuration["JWT:ValidIssuer"],
                    audience: _configuration["JWT:ValidAudience"],
                    expires: DateTime.Now.AddDays(9),
                    claims: authClaims,
                    signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
                    );

                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    expiration = token.ValidTo
            });
            }
            return Unauthorized();
        }

        [HttpPost]
        [Route("register")]
        public async Task<IActionResult> Register([FromBody] Register register)
        {
            var userExists = await _userManager.FindByNameAsync(register.Username);

            if (userExists != null)
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User already exists." });

            BlogUser user = new BlogUser()
            {
                Email = register.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = register.Username
            };

            var result = await _userManager.CreateAsync(user, register.Password);

            if (!await _roleManager.RoleExistsAsync(UserRoles.Administrator))
                await _roleManager.CreateAsync(new IdentityRole(UserRoles.Administrator));
            if (!await _roleManager.RoleExistsAsync(UserRoles.Manager))
                await _roleManager.CreateAsync(new IdentityRole(UserRoles.Manager));
            if (!await _roleManager.RoleExistsAsync(UserRoles.Subscriber))
                await _roleManager.CreateAsync(new IdentityRole(UserRoles.Subscriber));

            if (await _roleManager.RoleExistsAsync(UserRoles.Subscriber))
            {
                await _userManager.AddToRoleAsync(user, UserRoles.Subscriber);
            }

            if (!result.Succeeded)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User creation failed! Please check user details and try again." });
            }
            else
            {
                Email email = new Email
                {
                    Recipient = _configuration["ContactEmail"],
                    Subject = "New user registered.",
                    Content = $"{register.Username} just signed up the blog."
                };

                await new EmailNotificationController(_context, _configuration).SendEmail(email);
            }

            return Ok(new Response { Status = "Success", Message = "User created successfully." });
        }

        [HttpPost]
        [Route("register-admin-make-this-secret")]
        public async Task<IActionResult> RegisterAdmin([FromBody] Register register)
        {
            var userExists = await _userManager.FindByNameAsync(register.Username);
            if (userExists != null)
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User already exists." });

            BlogUser user = new BlogUser()
            {
                Email = register.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = register.Username
            };
            var result = await _userManager.CreateAsync(user, register.Password);
            if (!result.Succeeded)
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User creation failed! Please check user details and try again." });

            if (!await _roleManager.RoleExistsAsync(UserRoles.Administrator))
                await _roleManager.CreateAsync(new IdentityRole(UserRoles.Administrator));
            if (!await _roleManager.RoleExistsAsync(UserRoles.Manager))
                await _roleManager.CreateAsync(new IdentityRole(UserRoles.Manager));
            if (!await _roleManager.RoleExistsAsync(UserRoles.Subscriber))
                await _roleManager.CreateAsync(new IdentityRole(UserRoles.Subscriber));

            if (await _roleManager.RoleExistsAsync(UserRoles.Administrator))
            {
                await _userManager.AddToRoleAsync(user, UserRoles.Administrator);
            }

            return Ok(new Response { Status = "Success", Message = "User created successfully." });
        }
    }
}
