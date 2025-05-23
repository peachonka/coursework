using System.ComponentModel.DataAnnotations;
namespace BudgetApi.Models
{
    public class Family
    {
        public required string Id { get; set; } = Guid.NewGuid().ToString();
        public required string Name { get; set; }
        public List<FamilyMember> FamilyMembers { get; set; } = new();
    }
}