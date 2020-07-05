using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using blog.Data;
using blog.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace blog.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserManagementController : ControllerBase
    {
        private readonly BlogContext _context;
        private readonly UserManager<BlogUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;

        public UserManagementController(BlogContext context, UserManager<BlogUser> userManager, RoleManager<IdentityRole> roleManager, IConfiguration configuration)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
        }

        [HttpGet("ValidateToken")]
        public bool ValidateToken()
        {
            return true;
        }

        [HttpGet("GetUsers")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<IEnumerable<CustomUser>>> GetUsers()
        {
            var everyone = await _userManager.Users.ToListAsync();
            List<CustomUser> allUsers = new List<CustomUser>();

            foreach (var user in everyone)
            {
                CustomUser customUser = new CustomUser();

                customUser.Username = user.UserName;
                customUser.Email = user.Email;
                customUser.UserRole = (await _userManager.GetRolesAsync(user)).Select(x => x).SingleOrDefault();
                customUser.PostNumber = _context.PublishedPost.Where(post => post.PostAuthor == user.UserName).Count();
                
                allUsers.Add(customUser);
            }

            return allUsers.OrderBy(user => user.Username).ToList();
        }

        [HttpPost("GetUserProfile")]
        public async Task<ActionResult<CustomUser>> GetUserProfile(CustomUser customUser)
        {
            var user = await _userManager.FindByNameAsync(customUser.Username);

            if (user == null)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User does not exist." });
            }

            customUser.Email = user.Email;
            customUser.UserRole = (await _userManager.GetRolesAsync(user)).Select(x => x).SingleOrDefault();
            customUser.PostNumber = _context.PublishedPost.Where(post => post.PostAuthor == user.UserName).Count();

            return customUser;
        }

        [HttpPost("RetrievePassword")]
        [AllowAnonymous]
        public async Task<IActionResult> RetrievePassword(CustomUser customUser)
        {
            var user = await _userManager.FindByNameAsync(customUser.Username);

            if (user == null)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User does not exist." });
            }

            string validChars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*?_-";
            Random random = new Random();

            StringBuilder newPassword = new StringBuilder();

            for (int i = 0; i < 8; i++)
            {
                newPassword.Append(validChars[random.Next(0, validChars.Length)]);
            }

            var passwordToken = await _userManager.GeneratePasswordResetTokenAsync(user);

            string siteTitle = await _context.SiteOption.Select(x => x.SiteTitle).SingleOrDefaultAsync();

            await _userManager.ResetPasswordAsync(user, passwordToken, newPassword.ToString());

            Email newEmail = new Email
            {
                Recipient = user.Email,
                Subject = $"Your new password of site {siteTitle}",
                Content = $"The new password of {user.UserName} is {newPassword.ToString()}. Update it to a stronger one asap."
            };

            await new EmailNotificationController(_context, _configuration).SendEmail(newEmail);

            return Ok(new Response { Status = "Success", Message = "Check your email box (including Junk Email folder) for the new password." });
        }

        [HttpPost("FilterUser")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<IEnumerable<CustomUser>>> FilterUser(CustomUser userRole)
        {
            if (String.IsNullOrEmpty(userRole.UserRole))
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User role is required" });
            }

            if (!await _roleManager.RoleExistsAsync(userRole.UserRole))
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = $"Role {userRole.UserRole} does not exist" });
            }

            var users = await _userManager.GetUsersInRoleAsync(userRole.UserRole);
            List<CustomUser> allUsers = new List<CustomUser>();

            foreach (var user in users)
            {
                CustomUser customUser = new CustomUser();
                customUser.Username = user.UserName;
                customUser.Email = user.Email;
                customUser.UserRole = (await _userManager.GetRolesAsync(user)).Select(x => x).SingleOrDefault();
                customUser.PostNumber = _context.PublishedPost.Where(post => post.PostAuthor == user.UserName).Count();

                allUsers.Add(customUser);
            }

            return allUsers.OrderBy(user => user.Username).ToList();
        }

        [HttpPost("SearchUser")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<IEnumerable<CustomUser>>> SearchUser(CustomUser customUser)
        {
            var everyone = await _userManager.Users.Where(user => user.UserName.ToLower().Contains(customUser.Username)).ToListAsync();

            if (everyone.Count() == 0)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User does not exist." });
            }
            else
            {
                List<CustomUser> allUsers = new List<CustomUser>();

                foreach (var user in everyone)
                {
                    CustomUser searchedUser = new CustomUser();

                    searchedUser.Username = user.UserName;
                    searchedUser.Email = user.Email;
                    searchedUser.UserRole = (await _userManager.GetRolesAsync(user)).Select(x => x).SingleOrDefault();
                    searchedUser.PostNumber = _context.PublishedPost.Where(post => post.PostAuthor == user.UserName).Count();

                    allUsers.Add(searchedUser);
                }

                return allUsers.OrderBy(user => user.Username).ToList();
            }
        }

        [HttpGet("UserCount")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> UserCount()
        {
            var allUsers = _userManager.Users.Count();
            var administrators = (await _userManager.GetUsersInRoleAsync("Administrator")).Count();
            var managers = (await _userManager.GetUsersInRoleAsync("Manager")).Count();
            var subscribers = (await _userManager.GetUsersInRoleAsync("Subscriber")).Count();

            return Ok(new
            {
                alluser = allUsers,
                admin = administrators,
                manager = managers,
                subscriber = subscribers
            });
        }

        [HttpPut("ChangeUserRole")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<CustomUser>> ChangeUserRole(CustomUser customUser)
        {
            if (String.IsNullOrEmpty(customUser.Username))
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "Username is required" });
            }

            if (String.IsNullOrEmpty(customUser.UserRole))
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User role is required" });
            }

            var user = await _userManager.FindByNameAsync(customUser.Username);

            var userRole = await _userManager.GetRolesAsync(user);

            if (!await _roleManager.RoleExistsAsync(customUser.UserRole))
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = $"Role {customUser.UserRole} does not exists" });
            }

            if (user != null)
            {
                var reulst = await _userManager.RemoveFromRolesAsync(user, userRole);

                if (reulst.Succeeded)
                {
                    await _userManager.AddToRoleAsync(user, customUser.UserRole);
                }
            }
            else
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User does not exist" });
            }

            return customUser;
        }

        [HttpPut("ChangePassword")]
        public async Task<IActionResult> ChangePassword(PasswordChange customUser)
        {
            var user = await _userManager.FindByNameAsync(customUser.Username);

            if (user == null)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User does not exist." });
            }

            if (!await _userManager.CheckPasswordAsync(user, customUser.CurrentPassword))
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "Current password is not correct." });
            }

            await _userManager.ChangePasswordAsync(user, customUser.CurrentPassword, customUser.NewPassword);

            var result = await _userManager.CheckPasswordAsync(user, customUser.NewPassword);

            if (!result)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "New password does not meet the requirements." });
            }

            return Ok(new Response { Status = "Success", Message = "Password changed successfully." });
        }

        [HttpDelete("DeleteUser")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> DeleteUser(CustomUser customUser)
        {
            var user = await _userManager.FindByNameAsync(customUser.Username);

            if (user == null)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User does not exist." });
            }

            await _userManager.DeleteAsync(user);

            return Ok(new Response { Status = "Success", Message = "User deleted." });
        }
    }
}
