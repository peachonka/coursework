using Microsoft.EntityFrameworkCore;
using BudgetApi.Models;

namespace BudgetApi.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<FamilyMember> FamilyMembers { get; set; }
        public DbSet<Income> Incomes { get; set; }
        public DbSet<Expense> Expenses { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Настройка хранения enum как строк
            modelBuilder.Entity<Income>()
                .Property(i => i.Type)
                .HasConversion<string>();
            
            modelBuilder.Entity<Expense>()
                .Property(e => e.Category)
                .HasConversion<string>();
        }
    }
}