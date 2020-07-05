using blog.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace blog.Models
{
    public static class SeedDefaultData
    {
        public static async Task Initilize(IServiceProvider serviceProvider)
        {
            var context = new BlogContext(serviceProvider.GetRequiredService<DbContextOptions<BlogContext>>());

            if (context.Category.Any())
            {
                return;
            }
            else
            {
                int[] categoriesArray = new int[5] { 1, 2, 3, 4, 5 };
                    
                foreach(int category in categoriesArray)
                {
                    context.Category.Add(
                        new Category
                        {
                            CategoryName = $"category{category}",
                            SequenceNumber = category
                        }
                    );
                }

                context.SaveChanges();
            }

            if (context.PublishedPost.Any())
            {
                return;
            }
            else
            {
                DateTime dateTime = DateTime.Now;
                context.PublishedPost.Add(
                    new PublishedPost
                    {
                        PostTitle = "Nice to meet you",
                        PostFirstLine = "SSB3aWxsIGtlZXAgd2FpdGluZyB0aWxsIHdlIG1lZXQu",
                        PostContent = "PGRpdj5JIHdpbGwga2VlcCB3YWl0aW5nIHRpbGwgd2UgbWVldC48L2Rpdj4=",
                        PostAuthor = "Henry",
                        PostCategory = "blog",
                        IsDraft = false,
                        PublishedTime = dateTime,
                        ModifiedTime = dateTime,
                        DisplayDate = "2020-06",
                    }
                );

                context.SaveChanges();
            }

            if (context.About.Any())
            {
                return;
            }
            else
            {
                context.About.Add(
                    new About
                    {
                        Title = "About Page",
                        Content = "PGRpdj5JIHdpbGwga2VlcCB3YWl0aW5nIHRpbGwgd2UgbWVldC48L2Rpdj4=",
                    }
                );
            }

            if (context.SiteOption.Any())
            {
                return;
            }
            else
            {
                context.SiteOption.Add(
                    new SiteOption
                    {
                        SiteTitle = "Blog's Title",
                        SiteTagline = "Tagline",
                        SiteIcon = "blog.png",
                        HeaderImage = "headerimage.png",
                        SiteFooter = "Powered By HENRY",
                        SMTPHost = "mail.host",
                        SMTPPort = 587,
                        SMTPUser = "user@smtp.host",
                        SMTPPassword = "secret",
                        Encryption = true
                    }
                );

                context.SaveChanges();
            }

            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            await EnsureRolesAsync(roleManager);

            var userManager = serviceProvider.GetRequiredService<UserManager<BlogUser>>();
            await EnsureDefaultAdminAsync(userManager);
        }

        private static async Task EnsureRolesAsync(RoleManager<IdentityRole> roleManager)
        {
            var adminExists = await roleManager.RoleExistsAsync(UserRoles.Administrator);
            var managerExists = await roleManager.RoleExistsAsync(UserRoles.Manager);
            var subscriberExists = await roleManager.RoleExistsAsync(UserRoles.Subscriber);

            if (!adminExists)
            {
                await roleManager.CreateAsync(new IdentityRole(UserRoles.Administrator));
            }

            if (!managerExists)
            {
                await roleManager.CreateAsync(new IdentityRole(UserRoles.Manager));
            }

            if (!subscriberExists)
            {
                await roleManager.CreateAsync(new IdentityRole(UserRoles.Subscriber));
            }

        }

        private static async Task EnsureDefaultAdminAsync(UserManager<BlogUser> userManager)
        {
            var defaultAdmin = await userManager.Users.Where(x => x.UserName == "henry").SingleOrDefaultAsync();

            if (defaultAdmin != null) return;

            defaultAdmin = new BlogUser
            {
                UserName = "henry",
                Email = "ayuanx@outlook.com"
            };
            await userManager.CreateAsync(defaultAdmin, "Qwer123$");
            await userManager.AddToRoleAsync(defaultAdmin, UserRoles.Administrator);
        }
    }
}
