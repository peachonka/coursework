using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BudgetApi.Models
{
    public class FamilyMember
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = null!;
        
        [Required]
        public string RelationshipType { get; set; } = null!;

        public List<string>? IncomeTypes;
        
        [Required]
        [ForeignKey("User")]
        public string? UserId { get; set; }
        public virtual User? User { get; set; }
        
        [Required]
        [ForeignKey("Family")]
        public required string FamilyId { get; set; } = null!;
        public virtual required Family Family { get; set; }

        [Required]
        public string Role { get; set; } = "member";
    }
}