using System.ComponentModel.DataAnnotations;

namespace blog.Models
{
    public class Category
    {
        public int Id { get; set; }
        [Required(ErrorMessage = "Category is required.")]
        public string CategoryName { get; set; }
        [Required(ErrorMessage = "Sequence is required.")]
        public int SequenceNumber { get; set; }
    }
}
