// Family.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BudgetApi.Models
{
    public class Family
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public required string CreatorId { get; set; } // ID создателя семьи
        [ForeignKey("CreatorId")]
        public virtual required User User { get; set; }

        public virtual ICollection<FamilyMember> FamilyMembers { get; set; } = new List<FamilyMember>();
    }
}