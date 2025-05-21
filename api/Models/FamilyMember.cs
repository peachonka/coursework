using System.ComponentModel.DataAnnotations;

namespace BudgetApi.Models
{
    public class FamilyMember
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        [Required]
        public string RelationshipType { get; set; } // "father", "mother" и т.д.
        
        public List<string> IncomeTypes { get; set; } = new(); // ["salary", "pension"]
    }
}