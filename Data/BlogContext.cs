using Microsoft.EntityFrameworkCore;
using blog.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace blog.Data
{
    public class BlogContext : IdentityDbContext<BlogUser>
    {
        public BlogContext (DbContextOptions<BlogContext> options)
            : base(options)
        {
        }

        public DbSet<blog.Models.Category> Category { get; set; }

        public DbSet<blog.Models.SiteOption> SiteOption { get; set; }

        public DbSet<blog.Models.PublishedPost> PublishedPost { get; set; }

        public DbSet<blog.Models.About> About { get; set; }
    }
}
