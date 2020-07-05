using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using blog.Data;
using blog.Models;
using Microsoft.AspNetCore.Authorization;
using NETCore.Encrypt;

namespace blog.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Administrator")]
    public class SiteOptionsController : ControllerBase
    {
        private readonly BlogContext _context;

        public SiteOptionsController(BlogContext context)
        {
            _context = context;
        }

        // GET: api/SiteOptions
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<SiteOption>>> GetSiteOption()
        {
            var siteOptions = await _context.SiteOption.ToListAsync();
            foreach (var siteOption in siteOptions)
            {
                siteOption.SMTPPassword = "Encrypted";
            }

            return siteOptions;
        }

        // GET: api/SiteOptions/5
        /*[HttpGet("{id}")]
        public async Task<ActionResult<SiteOption>> GetSiteOption(int id)
        {
            var siteOption = await _context.SiteOption.FindAsync(id);

            if (siteOption == null)
            {
                return NotFound();
            }

            return siteOption;
        }*/

        // PUT: api/SiteOptions/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSiteOption(int id, SiteOption siteOption)
        {
            if (id != siteOption.Id)
            {
                return BadRequest();
            }

            _context.Entry(siteOption).State = EntityState.Modified;

            try
            {
                var aesKey = EncryptProvider.CreateAesKey();
                var key = aesKey.Key;
                var iv = aesKey.IV;

                siteOption.SMTPPassword = $"{EncryptProvider.AESEncrypt(siteOption.SMTPPassword, key, iv)}.{key}.{iv}";
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SiteOptionExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/SiteOptions
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        /*[HttpPost]
        public async Task<ActionResult<SiteOption>> PostSiteOption(SiteOption siteOption)
        {
            _context.SiteOption.Add(siteOption);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSiteOption", new { id = siteOption.Id }, siteOption);
        }*/

        // DELETE: api/SiteOptions/5
        /*[HttpDelete("{id}")]
        public async Task<ActionResult<SiteOption>> DeleteSiteOption(int id)
        {
            var siteOption = await _context.SiteOption.FindAsync(id);
            if (siteOption == null)
            {
                return NotFound();
            }

            _context.SiteOption.Remove(siteOption);
            await _context.SaveChangesAsync();

            return siteOption;
        }*/

        private bool SiteOptionExists(int id)
        {
            return _context.SiteOption.Any(e => e.Id == id);
        }
    }
}
