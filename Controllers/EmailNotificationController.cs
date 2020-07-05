using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using blog.Data;
using blog.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using NETCore.Encrypt;

namespace blog.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailNotificationController : ControllerBase
    {
        private readonly BlogContext _context;
        private readonly IConfiguration _configuration;

        public EmailNotificationController(BlogContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("SendEmail")]
        public async Task<IActionResult> SendEmail(Email email)
        {
            var siteOptions = await _context.SiteOption.ToListAsync();
            string smtpHost = siteOptions[0].SMTPHost;
            int smtpPort = siteOptions[0].SMTPPort;
            string smtpUser = siteOptions[0].SMTPUser;

            var encryptString = siteOptions[0].SMTPPassword.Split(".");
            var key = encryptString[1];
            var iv = encryptString[2];
            string smtpPassword = EncryptProvider.AESDecrypt(encryptString[0], key, iv);

            bool encryption = siteOptions[0].Encryption;

            SmtpClient client = new SmtpClient();
            
            client.Host = smtpHost;
            client.Port = smtpPort;
            client.EnableSsl = encryption;
            client.UseDefaultCredentials = false;
            client.Credentials = new NetworkCredential(smtpUser, smtpPassword);

            MailAddress from = new MailAddress(smtpUser, "Blog Info", System.Text.Encoding.UTF8);
            MailAddress to = new MailAddress(_configuration["ContactEmail"]);
            MailAddress replyto = new MailAddress(email.Recipient);
            
            MailMessage message = new MailMessage(from, to);
            
            message.Subject = email.Subject;
            message.SubjectEncoding = System.Text.Encoding.UTF8;
            message.Body = email.Content;
            message.BodyEncoding = System.Text.Encoding.UTF8;
            message.ReplyToList.Add(replyto);

            try
            {
                await client.SendMailAsync(message);
                return Ok(new Response { Status = "Success", Message = "Mail was send successfully." });
            }
            catch(Exception e)
            {
                return Ok(new Response { Status = "Error", Message = e.ToString() });
            }
        }
    }
}
