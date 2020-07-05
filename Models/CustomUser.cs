using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace blog.Models
{
    public class CustomUser
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string UserRole { get; set; }
        public int PostNumber { get; set; }
    }

    public class PasswordChange : CustomUser
    {
        [Required(ErrorMessage = "Current password is required.")]
        public string CurrentPassword { get; set; }
        [Required(ErrorMessage = "New password is required.")]
        public string NewPassword { get; set; }
    }
}
