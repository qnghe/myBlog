using System.ComponentModel.DataAnnotations;

namespace blog.Models
{
    public class SiteOption
    {
        public int Id { get; set; }
        [Required]
        public string SiteTitle { get; set; }
        [Required]
        public string SiteTagline { get; set; }
        public string SiteIcon { get; set; }
        public string HeaderImage { get; set; }
        [Required]
        public string SiteFooter { get; set; }

        public string SMTPHost { get; set; }
        public int SMTPPort { get; set; }
        public string SMTPUser { get; set; }
        public string SMTPPassword { get; set; }
        public bool Encryption { get; set; }
    }
}
