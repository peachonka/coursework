using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace BudgetApi.Models
{
    public class FamilyMember
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = null!;
        
        [Required]
        public string RelationshipType { get; set; } = null!;
        
        // Для SQLite нужно хранить списки как JSON
        [Column(TypeName = "TEXT")]
        public string IncomeTypesJson { get; set; } = "[]";
        
        [NotMapped]
        public List<string> IncomeTypes 
        {
            get => JsonSerializer.Deserialize<List<string>>(IncomeTypesJson) ?? new();
            set => IncomeTypesJson = JsonSerializer.Serialize(value);
        }
        
        [Required]
        [ForeignKey("User")]
        public required string UserId { get; set; } = null!;
        public User User { get; set; }
        
        [Required]
        [ForeignKey("Family")]
        public required string FamilyId { get; set; } = null!;
        public Family Family { get; set; }

        [Required]
        public string Role { get; set; } = "member";
    }
}