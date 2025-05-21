namespace BudgetApi.Models
{
    public class Income
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public decimal Amount { get; set; }
        public string Type { get; set; } // "salary", "pension" и т.д.
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string FamilyMemberId { get; set; }
        public string AccountType { get; set; } // "main", "savings"
    }
}