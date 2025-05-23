namespace BudgetApi.Models
{
    public class User
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string Name { get; set; } = null!;
        // public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}