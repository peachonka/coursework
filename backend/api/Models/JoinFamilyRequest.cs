using System;
using System.ComponentModel.DataAnnotations;

namespace BudgetApi.Models
{
    public class JoinFamilyRequest
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string UserId { get; set; }
        public string CreatorEmail { get; set; }
        public string FamilyId { get; set; }
        public string Message { get; set; }
        public string Status { get; set; } = "pending";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public User User { get; set; }
        public Family Family { get; set; }
    }
}