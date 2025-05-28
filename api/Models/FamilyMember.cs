// Models/FamilyMember.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BudgetApi.Models
{
    // FamilyMember.cs
    public class FamilyMember
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [StringLength(50)]
        public string Name { get; set; } = null!;
        
        [Required]
        public string RelationshipType { get; set; } = null!;

        public List<string> IncomeTypes { get; set; } = new List<string>();

        public string? UserId { get; set; }
        
        [Required]
        public string FamilyId { get; set; } = null!;

        [Required]
        public string Role { get; set; } = "member";

        // Навигационные свойства
        public virtual User User { get; set; } = null!;
        public virtual Family Family { get; set; } = null!;
    }
}