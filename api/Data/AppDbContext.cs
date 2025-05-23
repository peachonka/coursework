using BudgetApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BudgetApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Income> Incomes { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Family> Families { get; set; }
        public DbSet<FamilyMember> FamilyMembers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<FamilyMember>()
                .HasOne(fm => fm.Family)
                .WithMany(f => f.FamilyMembers)
                .HasForeignKey(fm => fm.FamilyId);
                
            modelBuilder.Entity<FamilyMember>()
                .HasOne(fm => fm.User)
                .WithMany()
                .HasForeignKey(fm => fm.UserId);
            // Настройка связи Family -> FamilyMembers (один-ко-многим)
            modelBuilder.Entity<Family>()
                .HasMany(f => f.FamilyMembers)
                .WithOne(fm => fm.Family)
                .HasForeignKey(fm => fm.FamilyId)
                .OnDelete(DeleteBehavior.Cascade); // Опционально: каскадное удаление
        }
    }
}