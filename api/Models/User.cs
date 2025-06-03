using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BudgetApi.Models
{
    public class User
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(20)]
        public required string Email { get; set; }

        [Required]
        public required string PasswordHash { get; set; }

        public virtual Family? CreatedFamily { get; set; }
        public virtual FamilyMember? FamilyMember { get; set; }
    }
}