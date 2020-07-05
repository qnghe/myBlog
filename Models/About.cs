using System.ComponentModel.DataAnnotations;

namespace blog.Models
{
    public class About
    {
        public int Id { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public string Content { get; set; }
    }
}
