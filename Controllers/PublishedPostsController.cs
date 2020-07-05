using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using blog.Data;
using blog.Models;
using System.Data;
using Microsoft.AspNetCore.Authorization;

namespace blog.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Administrator, Manager")]
    public class PublishedPostsController : ControllerBase
    {
        private readonly BlogContext _context;

        public PublishedPostsController(BlogContext context)
        {
            _context = context;
        }

        // GET: api/PublishedPosts
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublishedPost(bool isDraft)
        {
            var postSummary = from post in _context.PublishedPost
                              where post.IsDraft == isDraft
                              orderby post.Id descending
                              select new { Id = post.Id, PostTitle = post.PostTitle, PostAuthor = post.PostAuthor, PostCategory = post.PostCategory, DisplayPublishedTime = post.DisplayPublishedTime, DisplayModifiedTime = post.DisplayModifiedTime };
            
            return Ok(await postSummary.ToListAsync());
        }

        // GET: api/PublishedPosts/5
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<PublishedPost>> GetPublishedPost(int id)
        {
            var publishedPost = await _context.PublishedPost.FindAsync(id);

            if (publishedPost == null)
            {
                return NotFound();
            }

            return publishedPost;
        }

        // GET: api/PublishedPosts/Numbers
        [HttpGet("Numbers")]
        public IActionResult GetNumbers()
        {
            int numberOfPublishedPosts = (from post in _context.PublishedPost
                                          where post.IsDraft == false
                                          select post).Count();

            int numberOfDraftPosts = (from post in _context.PublishedPost
                                          where post.IsDraft == true
                                          select post).Count();

            return Ok(new {
                numberOfPublishedPosts = numberOfPublishedPosts,
                numberOfDraftPosts = numberOfDraftPosts
            });
        }

        // GET: api/PublishedPosts/Page
        [HttpGet("Page")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> GetPage(int itemsPerPage = 1, int pageNumber = 1, bool isDraft = false, string category = "henry", string searchString = "H")
        {
            var posts = from post in _context.PublishedPost
                        select new { Id = post.Id, PostTitle = post.PostTitle, PostCategory = post.PostCategory, PostFirstLine = post.PostFirstLine, PostAuthor = post.PostAuthor, DisplayReadableDate = post.DisplayReadableDate };
            if (category == "henry")
            {
                if ((searchString.Length > 0) && (searchString != "H"))
                {
                    posts = (from post in _context.PublishedPost
                             where post.IsDraft == isDraft && post.PostTitle.ToLower().Contains(searchString)
                             orderby post.PostTitle
                             select new { Id = post.Id, PostTitle = post.PostTitle, PostCategory = post.PostCategory, PostFirstLine = post.PostFirstLine, PostAuthor = post.PostAuthor, DisplayReadableDate = post.DisplayReadableDate }).Skip((pageNumber - 1) * itemsPerPage).Take(itemsPerPage);
                }
                else
                {
                    posts = (from post in _context.PublishedPost
                             where post.IsDraft == isDraft
                             orderby post.Id descending
                             select new { Id = post.Id, PostTitle = post.PostTitle, PostCategory = post.PostCategory, PostFirstLine = post.PostFirstLine, PostAuthor = post.PostAuthor, DisplayReadableDate = post.DisplayReadableDate }).Skip((pageNumber - 1) * itemsPerPage).Take(itemsPerPage);
                }
            }
            else
            {
                posts = (from post in _context.PublishedPost
                         where post.IsDraft == isDraft && post.PostCategory == category
                         orderby post.Id descending
                         select new { Id = post.Id, PostTitle = post.PostTitle, PostCategory = post.PostCategory, PostFirstLine = post.PostFirstLine, PostAuthor = post.PostAuthor, DisplayReadableDate = post.DisplayReadableDate }).Skip((pageNumber - 1) * itemsPerPage).Take(itemsPerPage);
            }

            return await posts.ToListAsync();
        }

        // GET: api/PublishedPosts/Date
        [HttpGet("Date")]
        public async Task<ActionResult<object>> GetDate(bool isDraft)
        {
            var dates = (from post in _context.PublishedPost
                         where post.IsDraft == isDraft
                         orderby post.DisplayDate descending
                         select post.DisplayDate).Distinct().OrderByDescending(date => date).Select(date => new { DisplayDate = date});

            return await dates.ToListAsync();
        }

        // GET: api/PublishedPosts/Category
        [HttpGet("Category")]
        public async Task<ActionResult<object>> GetCategory(bool isDraft)
        {
            var categories = (from post in _context.PublishedPost
                             where post.IsDraft == isDraft
                             select post.PostCategory).Distinct();

            return await categories.ToListAsync();
        }

        // GET: api/PublishedPosts/Filter
        [HttpGet("Filter")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> Filter(string date = "henry", string category = "henry", string searchString = "H", bool isDraft = false)
        {
            var filteredPosts = from post in _context.PublishedPost
                                where post.IsDraft == isDraft
                                select new { Id = post.Id, PostTitle = post.PostTitle, PostAuthor = post.PostAuthor, PostCategory = post.PostCategory, DisplayPublishedTime = post.DisplayPublishedTime, DisplayModifiedTime = post.DisplayModifiedTime };

            if ((date == "henry") && (category != "henry"))
            {
                filteredPosts = from post in _context.PublishedPost
                                where post.PostCategory == category && post.IsDraft == isDraft
                                orderby post.PostTitle
                                select new { Id = post.Id, PostTitle = post.PostTitle, PostAuthor = post.PostAuthor, PostCategory = post.PostCategory, DisplayPublishedTime = post.DisplayPublishedTime, DisplayModifiedTime = post.DisplayModifiedTime };
            }
            else if ((date != "henry") && (category == "henry"))
            {
                filteredPosts = from post in _context.PublishedPost
                                where post.DisplayDate == date && post.IsDraft == isDraft
                                orderby post.PostTitle
                                select new { Id = post.Id, PostTitle = post.PostTitle, PostAuthor = post.PostAuthor, PostCategory = post.PostCategory, DisplayPublishedTime = post.DisplayPublishedTime, DisplayModifiedTime = post.DisplayModifiedTime };
            }
            else if ((date == "henry") && (category == "henry"))
            {
                if ((searchString.Length > 0) && (searchString != "H"))
                {
                    filteredPosts = from post in _context.PublishedPost
                                    where post.IsDraft == isDraft && post.PostTitle.ToLower().Contains(searchString)
                                    orderby post.PostTitle
                                    select new { Id = post.Id, PostTitle = post.PostTitle, PostAuthor = post.PostAuthor, PostCategory = post.PostCategory, DisplayPublishedTime = post.DisplayPublishedTime, DisplayModifiedTime = post.DisplayModifiedTime };
                }
                else
                {
                    filteredPosts = from post in _context.PublishedPost
                                    where post.IsDraft == isDraft
                                    orderby post.PostTitle
                                    select new { Id = post.Id, PostTitle = post.PostTitle, PostAuthor = post.PostAuthor, PostCategory = post.PostCategory, DisplayPublishedTime = post.DisplayPublishedTime, DisplayModifiedTime = post.DisplayModifiedTime };
                }
            }
            else
            {
                filteredPosts = from post in _context.PublishedPost
                                where post.DisplayDate == date && post.PostCategory == category && post.IsDraft == isDraft
                                orderby post.PostTitle
                                select new { Id = post.Id, PostTitle = post.PostTitle, PostAuthor = post.PostAuthor, PostCategory = post.PostCategory, DisplayPublishedTime = post.DisplayPublishedTime, DisplayModifiedTime = post.DisplayModifiedTime };
            }

            return await filteredPosts.ToListAsync();
        }

        // GET: api/PublishedPosts/Sort
        [HttpGet("Sort")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> SortPost(string sortOrder, bool isDraft = false)
        {
            var allPosts = from post in _context.PublishedPost
                        where post.IsDraft == isDraft
                        select post;
            var posts = from post in _context.PublishedPost
                        where post.IsDraft == isDraft
                        select new { Id = post.Id, PostTitle = post.PostTitle, PostCategory = post.PostCategory };

            switch (sortOrder)
            {
                case "DisplayModifiedTime":
                    posts = allPosts.OrderByDescending(post => post.ModifiedTime).Take(5).Select(post => new { Id = post.Id, PostTitle = post.PostTitle, PostCategory = post.PostCategory });
                    break;
                default:
                    posts = allPosts.OrderByDescending(post => post.Id).Select(post => new { Id = post.Id, PostTitle = post.PostTitle, PostCategory = post.PostCategory });
                    break;
            }

            return await posts.ToListAsync();
        }

        // PUT: api/PublishedPosts/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPublishedPost(int id, PublishedPost publishedPost)
        {
            if (id != publishedPost.Id)
            {
                return BadRequest();
            }

            _context.Entry(publishedPost).State = EntityState.Modified;

            try
            {
                DateTime currentTime = DateTime.Now;
                publishedPost.ModifiedTime = currentTime;
                publishedPost.DisplayDate = publishedPost.ConvertToLocalTime(currentTime, "short");
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PublishedPostExists(id))
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

        // PUT: api/PublishedPosts/UpdatePostCategory
        [HttpPut("UpdatePostCategory")]
        public async Task<IActionResult> UpdatePostCategory(string previousCategoryName, string newCategoryName)
        {
            var matchedPosts = from post in _context.PublishedPost
                               where post.PostCategory == previousCategoryName
                               select post;

            foreach (var matchedPost in matchedPosts)
            {
                _context.Entry(matchedPost).State = EntityState.Modified;
                matchedPost.PostCategory = newCategoryName;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/PublishedPosts
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPost]
        public async Task<ActionResult<PublishedPost>> PostPublishedPost(PublishedPost publishedPost)
        {
            DateTime currentTime = DateTime.Now;
            publishedPost.PublishedTime = currentTime;
            publishedPost.ModifiedTime = currentTime;
            publishedPost.DisplayDate = publishedPost.ConvertToLocalTime(currentTime, "short");
            _context.PublishedPost.Add(publishedPost);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetPublishedPost", new { id = publishedPost.Id }, publishedPost);
        }

        // DELETE: api/PublishedPosts/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<PublishedPost>> DeletePublishedPost(int id)
        {
            var publishedPost = await _context.PublishedPost.FindAsync(id);
            if (publishedPost == null)
            {
                return NotFound();
            }

            _context.PublishedPost.Remove(publishedPost);
            await _context.SaveChangesAsync();

            return publishedPost;
        }

        private bool PublishedPostExists(int id)
        {
            return _context.PublishedPost.Any(e => e.Id == id);
        }
    }
}
