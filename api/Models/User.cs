using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace BudgetApi.Models
{
    public class User
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [MaxLength(100)]
        public required string Email { get; set; }
        
        [Required]
        public required string PasswordHash { get; set; }
        
        [Required]
        [MaxLength(50)]
        public required string Name { get; set; }

        public virtual ICollection<Family>? CreatedFamilies { get; set; }
    }
}