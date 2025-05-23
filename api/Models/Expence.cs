using System.ComponentModel.DataAnnotations;

namespace BudgetApi.Models
{
    public class Expense
    {
        public required string Id { get; set; } = Guid.NewGuid().ToString();
        public required decimal Amount { get; set; }
        public required string Category { get; set; } // "food", "clothing"
        public required DateTime Date { get; set; } = DateTime.UtcNow;
        public required string FamilyMemberId { get; set; }
        public required string Description { get; set; }
        public required bool IsPlanned { get; set; }
    }
}