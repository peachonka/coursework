namespace BudgetApi.Models
{
    public class Expense
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public decimal Amount { get; set; }
        public string Category { get; set; } // "food", "clothing"
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string FamilyMemberId { get; set; }
        public string Description { get; set; }
        public bool IsPlanned { get; set; }
    }
}