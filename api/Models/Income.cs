using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BudgetApi.Models
{
    public class Income
    {
        public required string Id { get; set; } = Guid.NewGuid().ToString();
        public required decimal Amount { get; set; }
        public required string Type { get; set; } // "salary", "pension" и т.д.
        public required DateTime Date { get; set; } = DateTime.UtcNow;
        public required string FamilyMemberId { get; set; }
        public required string AccountType { get; set; } // "main", "savings"

        [ForeignKey("FamilyMemberId")]
        public virtual required FamilyMember FamilyMember { get; set; }
    }
}