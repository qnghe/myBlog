using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using blog.Data;
using blog.Models;
using Microsoft.AspNetCore.Authorization;

namespace blog.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Administrator")]
    public class AboutPageController : ControllerBase
    {
        private readonly BlogContext _context;

        public AboutPageController(BlogContext context)
        {
            _context = context;
        }

        // GET: api/AboutPage
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<About>>> GetAbout()
        {
            return await _context.About.ToListAsync();
        }

        // GET: api/AboutPage/5
        [HttpGet("{id}")]
        public async Task<ActionResult<About>> GetAbout(int id)
        {
            var about = await _context.About.FindAsync(id);

            if (about == null)
            {
                return NotFound();
            }

            return about;
        }

        // PUT: api/AboutPage/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAbout(int id, About about)
        {
            if (id != about.Id)
            {
                return BadRequest();
            }

            _context.Entry(about).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AboutExists(id))
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

        // POST: api/AboutPage
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPost]
        public async Task<ActionResult<About>> PostAbout(About about)
        {
            _context.About.Add(about);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAbout", new { id = about.Id }, about);
        }

        // DELETE: api/AboutPage/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<About>> DeleteAbout(int id)
        {
            var about = await _context.About.FindAsync(id);
            if (about == null)
            {
                return NotFound();
            }

            _context.About.Remove(about);
            await _context.SaveChangesAsync();

            return about;
        }

        private bool AboutExists(int id)
        {
            return _context.About.Any(e => e.Id == id);
        }
    }
}
